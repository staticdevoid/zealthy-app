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
 
    localLayout: null,

    setLocalLayout: (layout) => {
      set(() => ({ localLayout: layout }));
    },

    reorderFieldWithinStep: (stepIndex, fieldIndex, direction) => {
      set((state) => {
        if (!state.localLayout) return;
        const step = state.localLayout.steps[stepIndex];
        if (!step) return;

        const newIndex = fieldIndex + direction;
        if (newIndex < 0 || newIndex >= step.fields.length) return;

        const temp = step.fields[fieldIndex];
        step.fields[fieldIndex] = step.fields[newIndex]!;
        step.fields[newIndex] = temp!;

        
        step.fields[fieldIndex].order = fieldIndex;
        step.fields[newIndex].order = newIndex;
      });
    },

    moveFieldToAnotherStep: (fromStepIndex, fromFieldIndex, toStepIndex) => {
      set((state) => {
        if (!state.localLayout) return;
    
        const oldStep = state.localLayout.steps[fromStepIndex];
        if (!oldStep?.fields?.[fromFieldIndex]) return;
    
        // Remove the field from the old step
        const [movedField] = oldStep.fields.splice(fromFieldIndex, 1);
    
        const newStep = state.localLayout.steps[toStepIndex];
        if (!newStep) return;
    
        // Ensure the fields array exists in the target step
        if (!newStep.fields) newStep.fields = [];
    
        // Add the moved field to the new step
        if(!movedField) return;

        newStep.fields.push(movedField);
    
        // Update the order of the moved field
        movedField.order = newStep.fields.length - 1;
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
