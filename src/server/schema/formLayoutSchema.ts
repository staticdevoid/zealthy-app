import { z } from "zod";

export const FieldTypeEnum = z.enum([
    "TEXT",
    "EMAIL",
    "NUMBER",
    "DATE",
    "ZIP",
    "PASSWORD",
    "MULTILINETEXT",
  ]);

export const fieldSchema = z.object({
  id: z.number(),
  label: z.string(),
  fieldType: FieldTypeEnum,
  userProperty: z.string(),
  flexBoxWidth: z.number(),
  isRequired: z.boolean(),
  order: z.number(),
});


export const stepSchema = z.object({
  id: z.number(),
  title: z.string(),
  order: z.number(),
  fields: z.array(fieldSchema),
});

export const formLayoutSchema = z.object({
  id: z.number(),
  steps: z.array(stepSchema),
});