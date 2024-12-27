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

    reorderSectionWithinStep: (stepIndex, sectionIndex, direction) => {
      set((state) => {
        const { localLayout } = state;
        if (!localLayout) return;

        const step = localLayout.steps[stepIndex];
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

    moveSectionToAnotherStep: (fromStepIndex, fromSectionIndex, toStepIndex) => {
      set((state) => {
        const { localLayout } = state;
        if (!localLayout) return;

        const oldStep = localLayout.steps[fromStepIndex];
        if (!oldStep?.sections?.[fromSectionIndex]) return;

        const [movedSection] = oldStep.sections.splice(fromSectionIndex, 1);
        if (!movedSection) return;

        const newStep = localLayout.steps[toStepIndex];
        if (!newStep) return;

        if (!newStep.sections) newStep.sections = [];

        newStep.sections.push(movedSection);
        movedSection.order = newStep.sections.length - 1;
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
