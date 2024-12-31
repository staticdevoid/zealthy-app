// src/_stores/wizardStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { FormLayout } from '~/types/types';

/**
 * Represents the state and actions of the Admin Store.
 */
interface AdminStoreState {
  localLayout: FormLayout | null;

  /**
   * Sets the local form layout.
   * @param layout - The new form layout to set.
   */
  setLocalLayout: (layout: FormLayout | null) => void;

  /**
   * Reorders a section within a specific step.
   * @param stepIndex - The index of the step containing the section.
   * @param sectionIndex - The current index of the section.
   * @param direction - The direction to move the section (-1 for up, 1 for down).
   */
  reorderSectionWithinStep: (
    stepIndex: number,
    sectionIndex: number,
    direction: -1 | 1,
  ) => void;

  /**
   * Moves a section from one step to another.
   * @param fromStepIndex - The index of the source step.
   * @param fromSectionIndex - The index of the section within the source step.
   * @param toStepIndex - The index of the destination step.
   */
  moveSectionToAnotherStep: (
    fromStepIndex: number,
    fromSectionIndex: number,
    toStepIndex: number,
  ) => void;

  /**
   * Toggles the visibility of a section within a step.
   * @param stepIndex - The index of the step containing the section.
   * @param sectionIndex - The index of the section to toggle.
   */
  toggleVisibility: (stepIndex: number, sectionIndex: number) => void;

  /**
   * Updates the title of a specific step.
   * @param stepIndex - The index of the step to update.
   * @param newTitle - The new title for the step.
   */
  updateStepTitle: (stepIndex: number, newTitle: string) => void;
}

/**
 * Zustand store for managing admin-related states and actions.
 */
export const useAdminStore = create<AdminStoreState>()(
  immer((set) => ({
    localLayout: null,

    setLocalLayout: (layout) => {
      set((state) => {
        state.localLayout = layout;
      });
    },

    moveSectionToAnotherStep: (fromStepIndex, fromSectionIndex, toStepIndex) => {
      set((state) => {
        if (!state.localLayout) return;
    
        const oldStep = state.localLayout.steps[fromStepIndex];
        const newStep = state.localLayout.steps[toStepIndex];
        if (!oldStep || !newStep) return;
    
        // Remove section from old step
        const [movedSection] = oldStep.sections.splice(fromSectionIndex, 1);
        if (!movedSection) {
          console.error("No section found at the specified index to move.");
          return;
        }
    
        // Update stepId and add section to the new step
        movedSection.stepId = newStep.id;
        newStep.sections.push(movedSection);
    
        // Recompute order for the new step
        newStep.sections.forEach((section, index) => {
          section.order = index;
        });
    
        // Recompute order for the old step
        oldStep.sections.forEach((section, index) => {
          section.order = index;
        });
      });
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

        // Update order values
        step.sections.forEach((section, index) => {
          section.order = index;
        });
      });
    },
  

    toggleVisibility: (stepIndex, sectionIndex) => {
      set((state) => {
        const { localLayout } = state;
        if (!localLayout) return;

        const step = localLayout.steps[stepIndex];
        if (!step) return;

        const section = step.sections[sectionIndex];
        if (!section) return;

        section.isFrontendVisible = !section.isFrontendVisible;
      });
    },

    updateStepTitle: (stepIndex, newTitle) => {
      set((state) => {
        const { localLayout } = state;
        if (!localLayout) return;

        const step = localLayout.steps[stepIndex];
        if (!step) return;

        step.title = newTitle;
      });
    },
  })),
);
