// src/store/useWizardStore.ts

import {create} from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { FormLayout } from '~/types/types';

/**
 * The shape of our wizard store.
 * - `localLayout`: A client-side copy of the form layout (steps + fields).
 */
interface WizardStoreState {
  localLayout: FormLayout | null;

  // Actions
  setLocalLayout: (layout: FormLayout | null) => void;
  reorderFieldWithinStep: (
    stepIndex: number,
    fieldIndex: number,
    direction: -1 | 1,
  ) => void;
  moveFieldToAnotherStep: (
    fromStepIndex: number,
    fromFieldIndex: number,
    toStepIndex: number,
  ) => void;
  updateStepTitle: (stepIndex: number, newTitle: string) => void;
}

export const useWizardStore = create<WizardStoreState>()(
  immer((set) => ({
    // Initial State
    localLayout: null,

    // Actions

    /**
     * Sets or replaces the local copy of the layout (e.g., when first fetched).
     */
    setLocalLayout: (layout) => {
      set(() => ({ localLayout: layout }));
    },

    /**
     * Reorder a field up or down within the same step.
     * Swaps array elements using Immer for a clean immutable update.
     */
    reorderFieldWithinStep: (stepIndex, fieldIndex, direction) => {
      set((state) => {
        if (!state.localLayout) return;
        const step = state.localLayout.steps[stepIndex];
        if (!step) return;

        const newIndex = fieldIndex + direction;
        if (newIndex < 0 || newIndex >= step.fields.length) return;

        // Swap fields
        const temp = step.fields[fieldIndex];
        step.fields[fieldIndex] = step.fields[newIndex]!;
        step.fields[newIndex] = temp!;

        // Update the `order` property if necessary
        step.fields[fieldIndex].order = fieldIndex;
        step.fields[newIndex].order = newIndex;
      });
    },

    /**
     * Moves a field from one step to another.
     * Removes the field from the old step array and adds it to the new step's fields array.
     */
    moveFieldToAnotherStep: (fromStepIndex, fromFieldIndex, toStepIndex) => {
      set((state) => {
        if (!state.localLayout) return;
        const oldStep = state.localLayout.steps[fromStepIndex];
        if (!oldStep) return;

        // Remove the field from the old step
        const [movedField] = oldStep.fields.splice(fromFieldIndex, 1);
        if (!movedField) return;

        // Add the field to the new step
        const newStep = state.localLayout.steps[toStepIndex];
        if (!newStep?.fields[newStep.fields.length - 1]) return;
        newStep.fields.push(movedField);

        // Update the `order` property if necessary
        newStep.fields[newStep.fields.length - 1]!.order = newStep.fields.length - 1;
      });
    },

    /**
     * Updates the title of a specific step.
     * @param stepIndex - The index of the step to update.
     * @param newTitle - The new title for the step.
     */
    updateStepTitle: (stepIndex, newTitle) => {
      set((state) => {
        if (!state.localLayout) return;
        const step = state.localLayout.steps[stepIndex];
        if (!step) return;

        step.title = newTitle;
      });
    },
  })),
);
