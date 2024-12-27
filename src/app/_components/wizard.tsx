"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { z } from "zod";
import { type Field } from "@prisma/client";
import { CustomFieldInput } from "./customInputField";

const fieldTypeValidationMap = {
  MULTILINETEXT: z.string().min(1, "This field is mandatory"),
  TEXT: z.string().min(1, "This field is mandatory"),
  NUMBER: z.number(),
  DATE: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  EMAIL: z.string().email("Please use a valid email"),
  PASSWORD: z
    .string()
    .min(8, "Your password must be at least 8 characters long")
    .max(16, "Your password must not exceed 16 characters"),
  ZIP: z.string().length(5, "Must be 5 digits"),
} as const;

enum Navigation {
  Previous,
  Next,
  Submit,
}

export function Wizard() {
  const {
    data: formLayout,
    isLoading,
    error,
  } = api.wizard.getLayoutFrontend.useQuery();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Map<string, string>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = api.user.updateUserOnboarding.useMutation();

  const currentStepData = formLayout?.steps[currentStep];

  const validateField = (field: Field, input?: string): boolean => {
    const value = input ?? formData.get(field.userProperty) ?? "";
    const validator = fieldTypeValidationMap[field.fieldType];

    const result = validator.safeParse(value);
    if (!result.success) {
      setErrors((prev) => {
        const updated = new Map(prev);
        updated.set(
          field.userProperty,
          result.error.errors[0]?.message ?? "Invalid input",
        );
        return updated;
      });
      return false;
    }

    setErrors((prev) => {
      const updated = new Map(prev);
      updated.delete(field.userProperty);
      return updated;
    });

    return true;
  };

  const validateCurrentStep = (): boolean => {
    if (!currentStepData) return false;

    let isValid = true;
    for (const section of currentStepData.sections) {
      for (const field of section.fields) {
        isValid = validateField(field) && isValid;
      }
    }
    return isValid;
  };

  const handleFieldBlur = (field: Field, newValue: string) => {
    validateField(field, newValue);
    setFormData((prev) => {
      const updated = new Map(prev);
      updated.set(field.userProperty, newValue);
      return updated;
    });
  };

  const saveStepData = async () => {
    if (!currentStepData) return;

    for (const section of currentStepData.sections) {
      for (const field of section.fields) {
        const fieldValue = formData.get(field.userProperty);
        if (fieldValue) {
          await mutation.mutateAsync({
            userProperty: field.userProperty,
            value: fieldValue,
            fieldType: field.fieldType,
          });
        }
      }
    }
  };

  const handleNavigation = async (navigation: Navigation) => {
    if (navigation === Navigation.Next) {
      if (validateCurrentStep()) {
        await saveStepData();
        setCurrentStep((prev) =>
          Math.min(prev + 1, (formLayout?.steps.length ?? 1) - 1),
        );
      }
    } else if (navigation === Navigation.Previous) {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    } else if (navigation === Navigation.Submit) {
      if (validateCurrentStep()) {
        setIsSubmitting(true);
        await saveStepData();
        setIsSubmitting(false);
        alert("Form submitted successfully!");
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }
  if (error) {
    return (
      <div className="p-8 text-center text-xl text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!formLayout) {
    return (
      <div className="p-8 text-center text-xl text-red-500">
        No form layout found
      </div>
    );
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div className="wizard rounded-xl bg-slate-700 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold text-slate-100">
          {currentStepData?.title ?? "Untitled Step"}
        </h2>

        {/* Progress Indicator */}
        <div className="mb-6 flex items-center justify-center">
          {formLayout.steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full ${
                  index < currentStep
                    ? "bg-green-500"
                    : index === currentStep
                      ? "bg-blue-500"
                      : "bg-gray-300"
                } flex items-center justify-center`}
              >
                <span className="text-white">{index + 1}</span>
              </div>
              {index < formLayout.steps.length - 1 && (
                <div className="h-1 w-10 bg-slate-400"></div>
              )}
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <div className="fields grid grid-cols-1 gap-6">
          {currentStepData?.sections.map((section) =>
            section.fields.map((field) => (
              <div key={field.id} className="field flex w-full flex-col gap-2">
                <CustomFieldInput
                  field={field}
                  initialValue={formData.get(field.userProperty) ?? ""}
                  error={errors.get(field.userProperty)}
                  onFieldBlur={handleFieldBlur}
                />
              </div>
            )),
          )}
        </div>

        {/* Navigation */}
        <div className="navigation mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => handleNavigation(Navigation.Previous)}
            disabled={currentStep === 0 || isSubmitting}
            className="rounded-md bg-gray-500 px-6 py-3 text-white hover:bg-gray-600"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              currentStep === formLayout.steps.length - 1
                ? handleNavigation(Navigation.Submit)
                : handleNavigation(Navigation.Next)
            }
            disabled={isSubmitting}
            className={`rounded-md px-6 py-3 text-white ${
              isSubmitting
                ? "cursor-not-allowed bg-gray-400"
                : currentStep === formLayout.steps.length - 1
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {currentStep === formLayout.steps.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
}
