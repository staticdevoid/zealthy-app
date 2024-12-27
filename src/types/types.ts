import { type FieldType } from "@prisma/client";

export interface Field {
  id: number;
  label: string;
  fieldType: FieldType; // Type of the field, e.g., TEXT, NUMBER
  userProperty: string; // Key to reference the field's data
  flexBoxWidth: number; // Width allocation in the layout (e.g., 1-4 scale)
  isRequired: boolean; // Indicates if the field is mandatory
  order: number; // Position of the field within its section
}

export interface Section {
  id: number;
  title: string; // Title displayed for the section
  order: number; // Position of the section within a step
  isAdminMoveable: boolean; // Determines if the section is movable in the admin panel
  isFrontendVisible: boolean; // Determines if the section is visible in the frontend
  fields: Field[]; // Array of fields within the section
}

export interface Step {
  id: number;
  title: string; // Title displayed for the step
  order: number; // Position of the step in the form
  sections: Section[]; // Array of sections within the step
}

export interface FormLayout {
  id: number;
  name: string; // Name of the form
  steps: Step[]; // Array of steps within the form
}
