"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

type Field = {
  id: number;
  label: string;
  fieldType: FieldType;
  userProperty: string;
  flexBoxWidth: number;
  isRequired: boolean;
};

type FieldType =
  | "TEXT"
  | "MULTILINETEXT"
  | "NUMBER"
  | "DATE"
  | "EMAIL"
  | "PASSWORD"
  | "ZIP";

type Step = {
  id: number;
  title: string;
  fields: Field[];
};

type FormLayout = {
  id: number;
  steps: Step[];
};

export function Wizard() {
  const {
    data: formLayout,
    isLoading,
    error,
  } = api.wizard.getLayout.useQuery();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  if (isLoading)
    return <div className="p-8 text-center text-xl">Loading...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-xl text-red-500">
        Error: {error.message}
      </div>
    );

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const mutation = api.user.updateUserOnboarding.useMutation();

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
    const currentStepFields = formLayout?.steps[currentStep]?.fields;

    const promises = currentStepFields?.map((field) => {
      const fieldValue = formData[field.id];
      if (fieldValue) {
        return saveDataToDB(field.userProperty, fieldValue, field.fieldType);
      }
      return undefined;
    });

    if (promises?.some((promise) => promise === undefined)) {
      return;
    }

    await Promise.all(promises!);

    setCurrentStep((prevStep) =>
      Math.min(prevStep + 1, formLayout?.steps.length ?? 0 - 1),
    );
  };

  const handlePreviousStep = async () => {
    const currentStepFields = formLayout?.steps[currentStep]?.fields;

    const promises = currentStepFields?.map((field) => {
      const fieldValue = formData[field.id];
      if (fieldValue) {
        return saveDataToDB(field.userProperty, fieldValue, field.fieldType);
      }
      return undefined;
    });

    if (promises?.some((promise) => promise === undefined)) {
      return;
    }

    await Promise.all(promises!);

    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentStepFields = formLayout?.steps[currentStep]?.fields;

    const promises = currentStepFields?.map((field) => {
      const fieldValue = formData[field.id];
      if (fieldValue) {
        return saveDataToDB(field.userProperty, fieldValue, field.fieldType);
      }
      return undefined;
    });

    if (promises?.some((promise) => promise === undefined)) {
      return;
    }

    await Promise.all(promises!);

    alert("Form submitted successfully!");
  };

  const renderField = (field: Field) => {
    const value = formData[field.id] || "";
    const flexClass = `w-${field.flexBoxWidth}/4`; // Apply dynamic width based on flexBoxWidth

    switch (field.fieldType) {
      case "TEXT":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id.toString(), e.target.value)}
            required={field.isRequired}
            className="input rounded-lg border border-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        );
      case "EMAIL":
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleChange(field.id.toString(), e.target.value)}
            required={field.isRequired}
            className="input rounded-lg border border-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        );
      case "PASSWORD":
        return (
          <input
            type="password"
            value={value}
            onChange={(e) => handleChange(field.id.toString(), e.target.value)}
            required={field.isRequired}
            className="input rounded-lg border border-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        );
      case "NUMBER":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.id.toString(), e.target.value)}
            required={field.isRequired}
            className="input rounded-lg border border-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        );
      case "DATE":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.id.toString(), e.target.value)}
            required={field.isRequired}
            className="input rounded-lg border border-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        );
      case "MULTILINETEXT":
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.id.toString(), e.target.value)}
            required={field.isRequired}
            className="input rounded-lg border border-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        );
      case "ZIP":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id.toString(), e.target.value)}
            required={field.isRequired}
            className="input rounded-lg border border-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        );
      default:
        return null;
    }
  };

  const currentStepData = formLayout?.steps[currentStep];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="wizard rounded-xl bg-slate-700 p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold text-slate-100">
          {currentStepData?.title}
        </h2>

        {/* Step Progress Indicator */}
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

        <div className="fields grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {currentStepData?.fields.map((field) => (
            <div
              key={field.id}
              className={`field flex flex-col ${field.flexBoxWidth ? `w-${field.flexBoxWidth}/4` : "w-1/4"} gap-2`}
            >
              <label className="block text-sm font-medium text-slate-300">
                {field.label}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="navigation mt-6 flex justify-between">
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="rounded-md bg-gray-500 px-6 py-3 text-white hover:bg-gray-600"
          >
            Previous
          </button>
          {currentStep === (formLayout?.steps.length ?? 0) - 1 ? (
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
            >
              Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextStep}
              className="rounded-md bg-green-500 px-6 py-3 text-white hover:bg-green-600"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
