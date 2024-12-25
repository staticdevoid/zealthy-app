// src/app/admin/page.tsx

"use client";

import React, { useEffect } from "react";
import { api } from "~/trpc/react";
import type { Field, FormLayout, Step } from "~/types/types";

// Material-UI Imports
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useWizardStore } from "./adminStore";

export default function AdminWizard() {
  // 1. Fetch form layout from the server using TRPC
  const {
    data: formLayout,
    isLoading,
    error,
  } = api.wizard.getLayout.useQuery();

  // 2. Extract state and actions from Zustand store
  const {
    localLayout,
    setLocalLayout,
    reorderFieldWithinStep,
    moveFieldToAnotherStep,
    updateStepTitle,
  } = useWizardStore();

  // 3. TRPC mutation hook for saving the updated layout
  const updateLayoutMutation = api.wizard.updateLayout.useMutation();

  // 4. Initialize localLayout with the fetched formLayout
  useEffect(() => {
    if (formLayout) {
      // Create a deep copy to prevent direct mutations
      setLocalLayout(structuredClone(formLayout));
    }
  }, [formLayout, setLocalLayout]);

  // 5. Handle the save action
  const handleSave = async () => {
    if (!localLayout) return;

    try {
      await updateLayoutMutation.mutateAsync(localLayout);
      alert("Layout saved successfully!");
    } catch (err) {
      console.error("Error saving layout:", err);
      alert("Error updating layout!");
    }
  };

  // 6. Handle loading and error states
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography variant="h6" color="error">
          Error: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!localLayout) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography variant="h6">No layout data</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Admin Wizard Layout
      </Typography>

      {/* Render each step */}
      {localLayout.steps.map((step: Step, stepIndex: number) => (
        <Card variant="outlined" sx={{ mb: 2 }} key={step.id}>
          <CardContent>
            {/* Editable Step Title */}
            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                label={`Step ${stepIndex + 1} Title`}
                variant="outlined"
                size="small"
                value={step.title}
                onChange={(e) => updateStepTitle(stepIndex, e.target.value)}
                fullWidth
              />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Render each field within the step */}
            {step.fields.map((field: Field, fieldIndex: number) => (
              <Box
                key={field.id}
                display="flex"
                alignItems="center"
                mb={1.5}
                gap={1}
              >
                <Typography sx={{ minWidth: 120 }} variant="body1">
                  <strong>{field.label}</strong>
                </Typography>

                {/* Up Button */}
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() =>
                    reorderFieldWithinStep(stepIndex, fieldIndex, -1)
                  }
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>

                {/* Down Button */}
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() =>
                    reorderFieldWithinStep(stepIndex, fieldIndex, 1)
                  }
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>

                {/* Dropdown to move field to another step */}
                <FormControl size="small">
                  <InputLabel id={`move-field-${field.id}-label`}>
                    Move to Step
                  </InputLabel>
                  <Select
                    labelId={`move-field-${field.id}-label`}
                    label="Move to Step"
                    value=""
                    onChange={(e) => {
                      const toStepIndex = Number(e.target.value);
                      if (toStepIndex === stepIndex) return;
                      moveFieldToAnotherStep(
                        stepIndex,
                        fieldIndex,
                        toStepIndex,
                      );
                    }}
                    sx={{ width: 120 }}
                  >
                    {/* Generate menu items for all other steps */}
                    {localLayout.steps.map((s, sIdx) => {
                      if (sIdx === stepIndex) return null; // Exclude current step
                      return (
                        <MenuItem value={sIdx} key={s.id}>
                          Step {sIdx + 1}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Save Button */}
      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Layout"}
        </Button>
      </Box>
    </Box>
  );
}
