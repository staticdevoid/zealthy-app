// src/server/api/routers/wizardRouter.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { formLayoutSchema } from "~/server/schema/formLayoutSchema";

// Define the schemas for validation using Zod
const fieldSchema = z.object({
  id: z.number(),
  label: z.string(),
  userProperty: z.string(),
  fieldType: z.enum([
    "TEXT",
    "MULTILINETEXT",
    "NUMBER",
    "DATE",
    "EMAIL",
    "PASSWORD",
    "ZIP",
  ]),
  flexBoxWidth: z.number(),
  isRequired: z.boolean(),
  order: z.number(),
});

const stepSchema = z.object({
  id: z.number(),
  title: z.string(),
  order: z.number(),
  fields: z.array(fieldSchema),
});

const formLayoutSchemaWithSteps = z.object({
  id: z.number(), // Form ID
  name: z.string(),
  steps: z.array(stepSchema),
});

export const wizardRouter = createTRPCRouter({
  // 1. Query to get the existing layout
  getLayout: publicProcedure.query(async ({ ctx }) => {
    const layout = await ctx.db.form.findUnique({
      where: {
        id: 1, // Only defined form for the purposes of this demo
      },
      include: {
        steps: {
          orderBy: {
            order: "asc",
          },
          include: {
            fields: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    return layout;
  }),

  // 2. Mutation to update the layout
  updateLayout: publicProcedure
    .input(formLayoutSchemaWithSteps)
    .mutation(async ({ ctx, input }) => {
      const { id, steps } = input;

      console.log("Received updateLayout mutation with input:", JSON.stringify(input, null, 2));

      // 2a. Check if the form exists
      const formExists = await ctx.db.form.findUnique({
        where: { id: 1 }, // Assuming only one form with id=1
      });

      if (!formExists) {
        throw new Error(`Form with id=${id} not found.`);
      }

      try {
        // Use a transaction to ensure all updates are atomic
        await ctx.db.$transaction(async (prisma) => {
          for (const step of steps) {
            // Update each step's title and order
            await prisma.step.update({
              where: { id: step.id },
              data: {
                title: step.title,
                order: step.order,
              },
            });

            for (const field of step.fields) {
              // Update each field's properties within the step
              await prisma.field.update({
                where: { id: field.id },
                data: {
                  label: field.label,
                  fieldType: field.fieldType,
                  userProperty: field.userProperty,
                  flexBoxWidth: field.flexBoxWidth,
                  isRequired: field.isRequired,
                  order: field.order,
                  stepId: step.id, // Ensure the field is associated with the correct step
                },
              });
            }
          }
        });

        console.log("updateLayout mutation successful");
        return { success: true };
      } catch (error) {
        console.error("Error in updateLayout mutation:", error);
        throw new Error("Failed to update layout. Please try again.");
      }
    }),
});
