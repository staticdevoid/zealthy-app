"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { z, type ZodNumber, type ZodOptional, type ZodString } from "zod";
import React from "react";
import { type Field, type FieldType } from "@prisma/client";
import { CustomFieldInput } from "./customInputField";

type PossibleValidators =
  | ZodString
  | ZodNumber
  | ZodOptional<ZodString>
  | ZodOptional<ZodNumber>;

const fieldTypeValidationMap = {
  MULTILINETEXT: z.string().min(1, "This field is mandatory"),
  TEXT: z.string().min(1, "This field is mandatory"),
  NUMBER: z.number(),
  DATE: z.string().date("Please select a date"),
  EMAIL: z.string().email("Please use a valid email"),
  PASSWORD: z
    .string()
    .min(8, "Your password must be at least 8 characters long")
    .max(16, "Your password must not exceed 16 characters"),
  ZIP: z.string().length(5, "Must be 5 digits"),
} as const;

export function Wizard() {
  const {
    data: formLayout,
    isLoading,
    error,
  } = api.wizard.getLayout.useQuery();

  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState<Map<string, string>>(
    new Map([["", ""]]),
  );
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = api.user.updateUserOnboarding.useMutation();

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

  const currentStepData = formLayout?.steps[currentStep];


  const validateField = (field: Field, input?: string): boolean => {
    const value = input ?? formData.get(field.userProperty);

    let validator: PossibleValidators = fieldTypeValidationMap[field.fieldType];
    if (!field.isRequired && validator != null) {
      validator = validator.optional();
    }
    const result = validator.safeParse(value);
    if (!result.success) {
      setErrors((prev) => {
        const updated = new Map(prev);
        updated.set(
          field.userProperty,
          result.error.errors[0]?.message ?? "undefined error",
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
    let valid = true;

    currentStepData?.fields.forEach((field) => {
      valid = validateField(field) ? valid : false;
    });

    return valid;
  };

  const handleFieldBlur = (field: Field, newValue: string) => {
    validateField(field, newValue);
    setFormData((prev) => {
      const updated = new Map(prev);
      updated.set(field.userProperty, newValue);
      return updated;
    });
  };

  const saveDataToDB = async (
    userProperty: string,
    value: string,
    fieldType: FieldType,
  ) => {
    try {
      await mutation.mutateAsync({
        userProperty,
        value,
        fieldType,
      });
    } catch (error) {
      console.error("Error saving data to DB", error);
    }
  };

  const handleNextStep = async () => {
    const isValid = validateCurrentStep();
    if (!isValid) {
      return;
    }

    const currentStepFields = currentStepData?.fields;
    if (currentStepFields?.length) {
      const promises = currentStepFields.map((field) => {
        const fieldValue = formData?.get(field.userProperty);
        if (fieldValue) {
          return saveDataToDB(field.userProperty, fieldValue, field.fieldType);
        }
      });
      await Promise.all(promises);
    }

    setCurrentStep((prevStep) =>
      Math.min(prevStep + 1, (formLayout?.steps.length ?? 1) - 1),
    );
  };

  const handlePreviousStep = async () => {
    const currentStepFields = currentStepData?.fields;
    if (currentStepFields?.length) {
      const promises = currentStepFields.map((field) => {
        const fieldValue = formData?.get(field.userProperty);
        if (fieldValue) {
          return saveDataToDB(field.userProperty, fieldValue, field.fieldType);
        }
      });
      await Promise.all(promises);
    }

    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateCurrentStep();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    if (currentStepData?.fields?.length) {
      const promises = currentStepData.fields.map((field) => {
        const fieldValue = formData?.get(field.userProperty);
        if (fieldValue) {
          return saveDataToDB(field.userProperty, fieldValue, field.fieldType);
        }
      });
      await Promise.all(promises);
    }

    alert("Form submitted successfully!");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="wizard rounded-xl bg-slate-700 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold text-slate-100">
          {currentStepData?.title}
        </h2>

        <div className="mb-6 flex items-center justify-center">
          {formLayout?.steps.map((step, index) => (
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

        <div className="fields grid grid-cols-1 gap-6">
          {currentStepData?.fields.map((field) => {
            const fieldValue = formData?.get(field.userProperty) ?? "";
            return (
              <div key={field.id} className="field flex w-full flex-col gap-2">
                <CustomFieldInput
                  field={field}
                  initialValue={fieldValue}
                  error={errors.get(field.userProperty)}
                  onFieldBlur={handleFieldBlur}
                />
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="navigation mt-6 flex justify-between">
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="rounded-md bg-gray-500 px-6 py-3 text-white hover:bg-gray-600"
          >
            Previous
          </button>

          {currentStep === (formLayout?.steps.length ?? 1) - 1 ? (
            // Last step => Submit
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          ) : (
            // Not last step => Next
            <button
              type="button"
              onClick={handleNextStep}
              className="rounded-md bg-green-500 px-6 py-3 text-white hover:bg-green-600"
              disabled={isSubmitting}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
