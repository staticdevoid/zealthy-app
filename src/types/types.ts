import { type FieldType } from "@prisma/client";

export interface Field {
  id: number;
  label: string;
  fieldType: FieldType;
  userProperty: string;
  flexBoxWidth: number;
  isRequired: boolean;
  order: number;
}

export interface Section {
  id: number;
  title: string;
  order: number;
  isAdminMoveable: boolean;
  isFrontendVisible: boolean;
  fields: Field[];
}

export interface Step {
  id: number;
  title: string;
  order: number;
  sections: Section[];
}

export interface FormLayout {
  id: number;
  name: string;
  steps: Step[];
}
