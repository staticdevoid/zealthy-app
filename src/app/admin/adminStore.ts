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
  reorderSectionWithinStep: (
    stepIndex: number,
    sectionIndex: number,
    direction: -1 | 1,
  ) => void;
  moveSectionToAnotherStep: (
    fromStepIndex: number,
    fromSectionIndex: number,
    toStepIndex: number,
  ) => void;
  toggleVisibility: (stepIndex: number, sectionIndex: number) => void;
  updateStepTitle: (stepIndex: number, newTitle: string) => void;
}

export const useWizardStore = create<WizardStoreState>()(
  immer((set) => ({
 
    localLayout: null,

    setLocalLayout: (layout) => {
      set(() => ({ localLayout: layout }));
    },

    reorderSectionWithinStep: (stepIndex, sectionIndex, direction) => {
      set((state) => {
        if (!state.localLayout) return;
        const step = state.localLayout.steps[stepIndex];
        if (!step) return;

        const newIndex = sectionIndex + direction;
        if (newIndex < 0 || newIndex >= step.sections.length) return;

        const temp = step.sections[sectionIndex];
        step.sections[sectionIndex] = step.sections[newIndex]!;
        step.sections[newIndex] = temp!;

        
        step.sections[sectionIndex].order = sectionIndex;
        step.sections[newIndex].order = newIndex;
      });
    },
    toggleVisibility: (stepIndex, sectionIndex) => {
      set((state) => {
        if (!state.localLayout) return;
        const step = state.localLayout.steps[stepIndex];
        if (!step) return;

        const section = step.sections[sectionIndex];
        if (!section) return;

        section.isFrontendVisible = !section.isFrontendVisible;
      });
    },

    moveSectionToAnotherStep: (fromStepIndex, fromSectionIndex, toStepIndex) => {
      set((state) => {
        if (!state.localLayout) return;
    
        const oldStep = state.localLayout.steps[fromStepIndex];
        if (!oldStep?.sections?.[fromSectionIndex]) return;
    
        // Remove the section from the old step
        const [movedSection] = oldStep.sections.splice(fromSectionIndex, 1);
    
        const newStep = state.localLayout.steps[toStepIndex];
        if (!newStep) return;
    
        // Ensure the fields array exists in the target step
        if (!newStep.sections) newStep.sections = [];
    
        // Add the moved field to the new step
        if(!movedSection) return;

        newStep.sections.push(movedSection);
    
        // Update the order of the moved field
        movedSection.order = newStep.sections.length - 1;
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
