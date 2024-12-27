"use client";

import React, { useEffect } from "react";
import { api } from "~/trpc/react";
import { CustomFieldInput } from "./customInputField";
import { useWizardStore } from "../_stores/wizardStore";
import type { Field } from "~/types/types";

export function Wizard() {
  const {
    currentStep,
    formData,
    errors,
    isSubmitting,
    formLayout,
    isLoading,
    error,
    setFormLayout,
    setLoading,
    setError,
    setCurrentStep,
    setFormData,
    setErrorForField,
    setIsSubmitting,
    setAuthenticatedEmail,
    reset,
  } = useWizardStore();

  const {
    data,
    isLoading: queryLoading,
    error: queryError,
  } = api.wizard.getLayoutFrontend.useQuery();

  const updateUserData = api.user.updateUserOnboarding.useMutation();

  const authMutation = api.user.authUser.useMutation({
    onMutate: () => setIsSubmitting(true),
    onSuccess: (result) => {
      if (result.success) {
        setAuthenticatedEmail(formData.get("email")!);
        setCurrentStep(currentStep + 1);
      } else {
        setErrorForField(
          "password",
          result.message || "Authentication failed.",
        );
      }
    },
    onError: () => (errors.size === 0 ? alert("Authentication failed.") : null),
    onSettled: () => setIsSubmitting(false),
  });

  useEffect(() => setLoading(queryLoading), [queryLoading, setLoading]);
  useEffect(() => {
    if (data) {
      setFormLayout(data);
    }
  }, [data, setFormLayout]);
  useEffect(() => {
    if (queryError) {
      setError(queryError.message || "An unexpected error occurred.");
    }
  }, [queryError, setError]);

  const validateField = (field: Field, value: string): string | null => {
    const validators: Record<string, (value: string) => string | null> = {
      email: (v) =>
        !v
          ? "Email is required."
          : /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(v)
            ? null
            : "Invalid email address.",
      password: (v) =>
        !v
          ? "Password is required."
          : v.length >= 6
            ? null
            : "Password must be at least 6 characters.",
    };
    return (
      validators[field.userProperty]?.(value) ??
      (value ? null : `${field.label} is required.`)
    );
  };

  const validateStep = (): boolean => {
    let isValid = true;
    const errorsMap = new Map<string, string>();
    formLayout?.steps[currentStep]?.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const value = formData.get(field.userProperty) ?? "";
        const error = validateField(field, value);
        if (error) {
          errorsMap.set(field.userProperty, error);
          isValid = false;
        } else {
          errorsMap.set(field.userProperty, "");
        }
      });
    });

    errorsMap.forEach((error, key) => setErrorForField(key, error));
    return isValid;
  };

  const handleFieldBlur = (field: Field, newValue: string) => {
    const error = validateField(field, newValue);
    setErrorForField(field.userProperty, error ?? "");
    setFormData(field.userProperty, newValue);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      console.log("Submitting form data:", Object.fromEntries(formData));
      reset();
      alert("Form submitted successfully!");
    } catch {
      setError("Submission failed. Please try again.");
    }
  };

  const handleNextStep = async () => {
    const currentStepData = formLayout?.steps[currentStep];
    if (!currentStepData) return;

    const isAuthStep = currentStepData.sections.some((section) =>
      section.fields.some((field) =>
        ["email", "password"].includes(field.userProperty),
      ),
    );

    if (isAuthStep) {
      await authMutation.mutateAsync({
        email: formData.get("email")!,
        password: formData.get("password")!,
      });
    } else if (validateStep()) {
      currentStepData.sections.forEach((section) => {
        section.fields.forEach((field) => {
          updateUserData.mutate({
            email: formData.get("email") ?? "",
            value: formData.get(field.userProperty) ?? "",
            userProperty: field.userProperty,
            fieldType: field.fieldType,
          });
        });
      });

      if (currentStep === (formLayout?.steps.length ?? 1) - 1) {
        await handleSubmit();
      } else if (validateStep()) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePreviousStep = () => setCurrentStep(Math.max(currentStep - 1, 0));

  if (isLoading)
    return <div className="p-8 text-center text-xl">Loading...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-xl text-red-500">Error: {error}</div>
    );

  const currentStepData = formLayout?.steps[currentStep];

  return (
    <form className="space-y-6">
      <div className="wizard rounded-xl bg-slate-700 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold text-slate-100">
          {currentStepData?.title ?? "Step"}
        </h2>

        {/* Progress Indicator */}
        <div className="mb-6 flex justify-center">
          {formLayout?.steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                  index === currentStep
                    ? "bg-blue-500"
                    : index < currentStep
                      ? "bg-green-500"
                      : "bg-gray-400"
                }`}
              >
                {index + 1}
              </div>
              {index < (formLayout?.steps.length ?? 1) - 1 && (
                <div className="h-1 w-10 bg-gray-400"></div>
              )}
            </div>
          ))}
        </div>

        <div className="fields grid grid-cols-1 gap-6">
          {currentStepData?.sections.flatMap((section) =>
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
