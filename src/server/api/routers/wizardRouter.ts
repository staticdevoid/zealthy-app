
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type Field, type Section } from "@prisma/client";


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

const sectionSchema = z.object({
  id: z.number(),
  stepId: z.number(),
  title: z.string(),
  order: z.number(),
  isAdminMoveable: z.boolean(),
  isFrontendVisible: z.boolean(),
  fields: z.array(fieldSchema),
  
});

const stepSchema = z.object({
  id: z.number(),
  title: z.string(),
  order: z.number(),
  sections: z.array(sectionSchema),
});

const formLayoutSchemaWithSteps = z.object({
  id: z.number(), 
  name: z.string(),
  steps: z.array(stepSchema),
});

export const wizardRouter = createTRPCRouter({
  
  getLayoutAdmin: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.form.findUnique({
      where: { id: 1 },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: {
            sections: {
              orderBy: { order: "asc" },
              include: { fields: { orderBy: { order: "asc" } } },
            },
          },
        },
      },
    }) ?? null;
  }),

  
  getLayoutFrontend: publicProcedure.query(async ({ ctx }) => {
    const form = await ctx.db.form.findUnique({
      where: { id: 1 },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: {
            sections: {
              orderBy: { order: "asc" },
              include: { fields: { orderBy: { order: "asc" } } },
            },
          },
        },
      },
    });
    for(const step of form?.steps ?? []) {
      step.sections = step.sections.filter((section) => section.isFrontendVisible);
    }

    return form ?? null;
  }),

  
  updateLayout: publicProcedure
  .input(formLayoutSchemaWithSteps)
  .mutation(async ({ ctx, input }) => {
    const { id, steps } = input;

    const formExists = await ctx.db.form.findUnique({ where: { id } });
    if (!formExists) {
      throw new Error(`Form with id=${id} not found.`);
    }

    try {
      const startTime = Date.now();

      const updatedForm = await ctx.db.$transaction(async (prisma) => {
        // Prepare batch operations
        const stepUpdates = steps.map((step) => 
          prisma.step.update({
            where: { id: step.id },
            data: { title: step.title, order: step.order },
          })
        );
      
        const sectionUpdates = steps.flatMap((step) =>
          step.sections.map((section) =>
            prisma.section.update({
              where: { id: section.id },
              data: {
                title: section.title,
                order: section.order,
                isFrontendVisible: section.isFrontendVisible,
                stepId: step.id, // Ensure stepId is updated correctly
              },
            })
          )
        );
      
        const fieldUpdates = steps.flatMap((step) =>
          step.sections.flatMap((section) =>
            section.fields.map((field) =>
              prisma.field.update({
                where: { id: field.id },
                data: {
                  label: field.label,
                  fieldType: field.fieldType,
                  userProperty: field.userProperty,
                  flexBoxWidth: field.flexBoxWidth,
                  isRequired: field.isRequired,
                  order: field.order,
                  sectionId: section.id, // Ensure sectionId is updated correctly
                },
              })
            )
          )
        );
      
        // Execute all updates in a single transaction
        await Promise.all([...stepUpdates, ...sectionUpdates, ...fieldUpdates]);
      
        // Fetch and return the updated form layout
        return prisma.form.findUnique({
          where: { id },
          include: {
            steps: {
              orderBy: { order: "asc" },
              include: {
                sections: {
                  orderBy: { order: "asc" },
                  include: { fields: { orderBy: { order: "asc" } } },
                },
              },
            },
          },
        });
      });

      console.log("updateLayout mutation successful");
      return updatedForm;
    } catch (error) {
      console.error("Error in updateLayout mutation:", error);
      throw new Error(
        `Failed to update layout. Reason: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }),


});
