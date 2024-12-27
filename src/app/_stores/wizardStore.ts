import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import type { PersistStorage } from "zustand/middleware/persist";
import type { FormLayout } from "~/types/types";

enableMapSet();

interface WizardStoreState {
  currentStep: number;
  formData: Map<string, string>;
  errors: Map<string, string>;
  isSubmitting: boolean;
  authenticatedEmail: string | null;
  formLayout: FormLayout | null;
  isLoading: boolean;
  error: string | null;

  setCurrentStep: (step: number) => void;
  setFormData: (key: string, value: string) => void;
  setErrorForField: (key: string, message?: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setAuthenticatedEmail: (email: string | null) => void;
  setFormLayout: (layout: FormLayout | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Custom storage implementation with explicit types
const localStorageStorage: PersistStorage<WizardStoreState> = {
  getItem: (name) => {
    const item = localStorage.getItem(name);
    if (!item) return null;

    try {
      const parsed = JSON.parse(item) as {
        state: Omit<WizardStoreState, "formData" | "errors"> & {
          formData: [string, string][];
          errors: [string, string][];
        };
      };

      return {
        ...parsed,
        state: {
          ...parsed.state,
          formData: new Map(parsed.state.formData),
          errors: new Map(parsed.state.errors),
        },
      };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    const serializedValue = {
      ...value,
      state: {
        ...value.state,
        formData: Array.from(value.state.formData.entries()),
        errors: Array.from(value.state.errors.entries()),
      },
    };
    localStorage.setItem(name, JSON.stringify(serializedValue));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const useWizardStore = create<WizardStoreState>()(
  persist(
    immer((set) => ({
      currentStep: 0,
      formData: new Map<string, string>(),
      errors: new Map<string, string>(),
      isSubmitting: false,
      authenticatedEmail: null,
      formLayout: null,
      isLoading: false,
      error: null,

      setCurrentStep: (step) =>
        set((state) => {
          state.currentStep = step;
        }),

      setFormData: (key, value) =>
        set((state) => {
          state.formData.set(key, value);
        }),

      setErrorForField: (key, message) =>
        set((state) => {
          if (message) {
            state.errors.set(key, message);
          } else {
            state.errors.delete(key);
          }
        }),

      setIsSubmitting: (isSubmitting) =>
        set((state) => {
          state.isSubmitting = isSubmitting;
        }),

      setAuthenticatedEmail: (email) =>
        set((state) => {
          state.authenticatedEmail = email;
        }),

      setFormLayout: (layout) =>
        set((state) => {
          state.formLayout = layout;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      reset: () =>
        set((state) => {
          state.currentStep = 0;
          state.formData = new Map<string, string>();
          state.errors = new Map<string, string>();
          state.isSubmitting = false;
          state.authenticatedEmail = null;
          state.isLoading = false;
          state.error = null;
        }),
    })),
    {
      name: "wizard-store",
      storage: localStorageStorage,
    }
  )
);
