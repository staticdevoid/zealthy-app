"use client";

import React, { useEffect } from "react";
import { api } from "~/trpc/react";
import { useAdminStore } from "../_stores/adminStore";
import type { Section, Step } from "~/types/types";
import { Disclosure, Switch } from "@headlessui/react";

export default function AdminWizard() {
  const {
    data: formLayout,
    isLoading,
    error,
    refetch: refetchLayout,
  } = api.wizard.getLayoutAdmin.useQuery();

  const {
    localLayout,
    setLocalLayout,
    reorderSectionWithinStep,
    moveSectionToAnotherStep,
    updateStepTitle,
    toggleVisibility,
    isWriting,
    toggleIsWriting,
  } = useAdminStore();

  const updateLayoutMutation = api.wizard.updateLayout.useMutation();

  useEffect(() => {
    if (formLayout) {
      setLocalLayout(structuredClone(formLayout));
    }
  }, [formLayout, setLocalLayout]);

  const handleSave = async () => {
    if (isWriting) return;

    toggleIsWriting();
    if (!localLayout) {
      alert("No layout to save.");
      return;
    }

    try {
      console.log("Saving layout to backend:", localLayout);
      await updateLayoutMutation.mutateAsync(localLayout);
      await refetchLayout(); // Ensure frontend is synced with the backend
      alert("Layout saved successfully!");
    } catch (err) {
      console.error("Error saving layout:", err);
      alert("Error updating layout. Please try again.");
    }
    toggleIsWriting();
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-xl">
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-xl text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!localLayout) {
    return (
      <div className="p-4 text-center text-xl">
        <span>No layout data</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-bold text-gray-800">Admin Wizard Layout</h2>

      {localLayout.steps.map((step: Step, stepIndex: number) => (
        <div
          key={step.id}
          className="rounded-lg border border-gray-300 bg-white shadow-md"
        >
          {/* Step Header */}
          <div className="flex items-center justify-between border-b bg-gray-100 p-4">
            <input
              type="text"
              value={step.title}
              onChange={(e) => updateStepTitle(stepIndex, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Step ${stepIndex + 1} Title`}
            />
          </div>

          {/* Step Body */}
          <div className="p-4">
            <div className="space-y-4">
              {step.sections.map((section: Section, sectionIndex: number) => (
                <Disclosure key={section.id}>
                  {({ open }) => (
                    <div
                      className={`rounded-md border ${
                        open ? "border-blue-500 bg-blue-50" : "border-gray-300"
                      }`}
                    >
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-t-md bg-gray-100 px-4 py-2 hover:bg-gray-200">
                        <span className="font-medium text-gray-700">
                          {section.title}
                        </span>
                        <span className="text-gray-500">
                          {open ? "▲" : "▼"}
                        </span>
                      </Disclosure.Button>

                      <Disclosure.Panel className="space-y-4 p-4">
                        {/* Reorder and Move Actions */}
                        <div className="flex items-center space-x-4">
                          {!section.isAdminMoveable && (
                            <span className="text-sm text-gray-500">
                              Not Moveable
                            </span>
                          )}
                          {section.isAdminMoveable && (
                            <div>
                              <button
                                className="ml-4 rounded-md bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                onClick={() =>
                                  reorderSectionWithinStep(
                                    stepIndex,
                                    sectionIndex,
                                    -1,
                                  )
                                }
                              >
                                Move Up
                              </button>
                              <button
                                className="hover:bg-blue-600, ml-2 rounded-md bg-blue-500 px-2 py-1 text-white"
                                onClick={() =>
                                  reorderSectionWithinStep(
                                    stepIndex,
                                    sectionIndex,
                                    1,
                                  )
                                }
                              >
                                Move Down
                              </button>
                              <select
                                className="ml-4 rounded-md border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                  const toStepIndex = Number(e.target.value);

                                  // Prevent moving to the same step
                                  if (toStepIndex === stepIndex) return;

                                  // Invoke the move action
                                  moveSectionToAnotherStep(
                                    stepIndex,
                                    sectionIndex,
                                    toStepIndex,
                                  );
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  Move to Step
                                </option>
                                {localLayout.steps.map((s, idx) => {
                                  // Exclude the current step from the dropdown
                                  if (idx === stepIndex) return null;

                                  return (
                                    <option key={s.id} value={idx}>
                                      Step {idx + 1}
                                    </option>
                                  );
                                })}
                              </select>
                              <label className="ml-4 text-sm text-gray-500">
                                {section.isFrontendVisible
                                  ? "Visible"
                                  : "Hidden"}
                              </label>
                              <Switch
                                checked={section.isFrontendVisible}
                                onChange={() =>
                                  toggleVisibility(stepIndex, sectionIndex)
                                }
                                className={`ml-2 ${
                                  section.isFrontendVisible
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                } relative inline-flex h-6 w-11 items-center rounded-full`}
                              >
                                <span className="sr-only">Enable</span>
                                <span
                                  className={`${
                                    section.isFrontendVisible
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  } inline-block h-4 w-4 transform rounded-full bg-white`}
                                />
                              </Switch>
                            </div>
                          )}
                        </div>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="mt-6 text-right">
        <button
          onClick={handleSave}
          className={`rounded-md px-6 py-3 text-white ${
            isWriting ? "bg-slate-400" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          Save Layout
        </button>
      </div>
    </div>
  );
}
