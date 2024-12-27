"use client";

import React, { useEffect } from "react";
import { api } from "~/trpc/react";
import { CustomFieldInput } from "./customInputField";
import { useWizardStore } from "../_stores/wizardStore";
import type { Field } from "~/types/types";
import { boolean } from "zod";

export function Wizard() {
  const currentStep = useWizardStore((state) => state.currentStep);
  const formData = useWizardStore((state) => state.formData);
  const errors = useWizardStore((state) => state.errors);
  const isSubmitting = useWizardStore((state) => state.isSubmitting);
  const formLayout = useWizardStore((state) => state.formLayout);
  const isLoading = useWizardStore((state) => state.isLoading);
  const error = useWizardStore((state) => state.error);
  const setFormLayout = useWizardStore((state) => state.setFormLayout);
  const setLoading = useWizardStore((state) => state.setLoading);
  const setError = useWizardStore((state) => state.setError);
  const setCurrentStep = useWizardStore((state) => state.setCurrentStep);
  const setFormData = useWizardStore((state) => state.setFormData);
  const setErrorForField = useWizardStore((state) => state.setErrorForField);
  const setIsSubmitting = useWizardStore((state) => state.setIsSubmitting);
  const reset = useWizardStore((state) => state.reset);

  const {
    data,
    isLoading: queryLoading,
    error: queryError,
  } = api.wizard.getLayoutFrontend.useQuery();

  const updateUserData = api.user.updateUserOnboarding.useMutation();

  const authMutation = api.user.authUser.useMutation({
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: (result) => {
      if (result.success) {
        setCurrentStep(currentStep + 1);
      } else {
        setErrorForField(
          "password",
          result.message || "Authentication failed.",
        );
      }
    },
    onError: () => {
      setErrorForField("password", "Authentication error occurred.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading, setLoading]);

  useEffect(() => {
    if (data) {
      setFormLayout(data);
    }
  }, [data, setFormLayout]);

  useEffect(() => {
    if (queryError) {
      const errorMessage =
        typeof queryError === "object" &&
        queryError !== null &&
        "message" in queryError
          ? (queryError as { message: string }).message
          : "An unexpected error occurred.";
      setError(errorMessage);
    }
  }, [queryError, setError]);

  const validateField = (field: Field, value: string): string | null => {
    switch (field.userProperty) {
      case "email":
        if (!value) return "Email is required.";
        if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value))
          return "Invalid email address.";
        return null;
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 6) return "Password must be at least 6 characters.";
        return null;
      default:
        return value ? null : `${field.label} is required.`;
    }
  };

  const validateForm = (): boolean => {
    const errorsMap = new Map<string, string>();
    formLayout?.steps.forEach((step) => {
      step.sections.forEach((section) => {
        section.fields.forEach((field) => {
          const value = formData.get(field.userProperty) ?? "";
          const error = validateField(field, value);
          if (error) errorsMap.set(field.userProperty, error);
        });
      });
    });
    setErrorForField(""); // Clear all errors
    errorsMap.forEach((error, key) => setErrorForField(key, error));
    return errorsMap.size === 0;
  };

  const handleAuth = async () => {
    const email = formData.get("email");
    const password = formData.get("password");

    let hasError = false;

    if (!email) {
      setErrorForField("email", "Email is required.");
      hasError = true;
    }

    if (!password) {
      setErrorForField("password", "Password is required.");
      hasError = true;
    }

    if (hasError) return;

    await authMutation.mutateAsync({ email: email!, password: password! });
  };

  const handleFieldBlur = (field: Field, newValue: string) => {
    setErrorForField(field.userProperty, "");
    const error = validateField(field, newValue);
    if (error) setErrorForField(field.userProperty, error);
    setFormData(field.userProperty, newValue);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      console.log("Submitting form data:", Object.fromEntries(formData));
      reset();
      alert("Form submitted successfully!");
    } catch (error) {
      setError("Submission failed. Please try again.");
    }
  };

  const handleNextStep = async () => {
    const currentStepData = formLayout?.steps[currentStep];
    if (!currentStepData) return;

    const isAuthStep = currentStepData.sections.some(
      (section) =>
        section.title === "Auth" ||
        section.fields.some(
          (field) =>
            field.userProperty === "email" || field.userProperty === "password",
        ),
    );

    if (isAuthStep) {
      await handleAuth();
    } else {
      let isValid = true;
      formLayout?.steps[currentStep]?.sections.forEach((section) => {
        section.fields.forEach((field) => {
          const value = formData.get(field.userProperty) ?? "";
          const error = validateField(field, value);
          if (error) {
            setErrorForField(field.userProperty, error);
            isValid = false;
          }
        });
      });
      if (isValid) {
        formLayout?.steps[currentStep]?.sections.forEach((section) => {
          section.fields.forEach((field) => {
            const value = formData.get(field.userProperty) ?? "";
            updateUserData.mutate({
              email: formData.get("email") ?? "",
              value: value,
              userProperty: field.userProperty,
              fieldType: field.fieldType,
            });
          });
        });
        if (currentStep === (formLayout?.steps.length ?? 1) - 1) {
          await handleSubmit();
        } else {
          setCurrentStep(
            Math.min(currentStep + 1, (formLayout?.steps.length ?? 1) - 1),
          );
        }
      }
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-xl text-red-500">Error: {error}</div>
    );
  }

  const currentStepData = formLayout?.steps[currentStep];

  return (
    <form className="space-y-6">
      <div className="wizard rounded-xl bg-slate-700 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold text-slate-100">
          {currentStepData?.title ?? "Step"}
        </h2>

        <div className="fields grid grid-cols-1 gap-6">
          {currentStepData?.sections.map((section) =>
            section.fields.map((field) => (
              <CustomFieldInput
                key={field.id}
                field={field}
                initialValue={formData.get(field.userProperty) ?? ""}
                error={errors.get(field.userProperty)}
                onFieldBlur={handleFieldBlur}
              />
            )),
          )}
        </div>

        <div className="navigation mt-6 flex justify-between">
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={currentStep === 0 || isSubmitting}
            className="rounded-md bg-gray-500 px-6 py-3 text-white hover:bg-gray-600"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting}
            className={`rounded-md px-6 py-3 text-white ${
              isSubmitting
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {currentStep === (formLayout?.steps.length ?? 1) - 1
              ? "Submit"
              : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
}
