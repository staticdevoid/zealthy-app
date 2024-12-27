import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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

const sectionSchema = z.object({
  id: z.number(),
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
  id: z.number(), // Form ID
  name: z.string(),
  steps: z.array(stepSchema),
});

export const wizardRouter = createTRPCRouter({
  // Fetch layout for admin use
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

  // Fetch layout for frontend use
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

  // Update layout
  updateLayout: publicProcedure
    .input(formLayoutSchemaWithSteps)
    .mutation(async ({ ctx, input }) => {
      const { id, steps } = input;

      // Check if form exists
      const formExists = await ctx.db.form.findUnique({ where: { id } });
      if (!formExists) {
        throw new Error(`Form with id=${id} not found.`);
      }

      try {
        const updatedForm = await ctx.db.$transaction(async (prisma) => {
          for (const step of steps) {
            // Update step properties
            await prisma.step.update({
              where: { id: step.id },
              data: { title: step.title, order: step.order },
            });

            const stepSections = step.sections ?? [];
            for (const section of stepSections) {
              // Validate and update section properties
              const sectionExists = await prisma.section.findUnique({
                where: { id: section.id },
              });
              if (!sectionExists) {
                throw new Error(`Section with id=${section.id} not found.`);
              }

              await prisma.section.update({
                where: { id: section.id },
                data: {
                  title: section.title,
                  order: section.order,
                  isFrontendVisible: section.isFrontendVisible,
                },
              });

              // Update fields
              for (const field of section.fields ?? []) {
                await prisma.field.update({
                  where: { id: field.id },
                  data: {
                    label: field.label,
                    fieldType: field.fieldType,
                    userProperty: field.userProperty,
                    flexBoxWidth: field.flexBoxWidth,
                    isRequired: field.isRequired,
                    order: field.order,
                    sectionId: section.id,
                  },
                });
              }
            }
          }

          // Fetch and return the updated form layout
          return await prisma.form.findUnique({
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
