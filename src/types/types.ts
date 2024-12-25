import { type FieldType } from "@prisma/client";

export interface Field {
    id: number;
    label: string;
    fieldType: FieldType
    userProperty: string;
    flexBoxWidth: number;
    isRequired: boolean;
    order: number;
   
  }
  
  export interface Step {
    id: number;
    title: string;
    order: number;
    fields: Field[];
    // ...and any other properties
  }
  
  export interface FormLayout {
    id: number;
    name: string;
    steps: Step[];
    // ...and any other properties
  }
  