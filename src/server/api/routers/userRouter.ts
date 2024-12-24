import { create } from "domain";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUserTable: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      orderBy: { createdAt: "asc" },
    });
    return users ?? [];
  }),

  userExists: publicProcedure
    .input(z.object({ email: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { email: input.email },
      });
      return user != null ? true : false;
    }),
    updateUserOnboarding: publicProcedure
    .input(
      z.object({
        userProperty: z.string(),  // The user field you want to update (e.g., "email", "password")
        value: z.string(),         // The new value to set for the userProperty
        fieldType: z.enum([
          "TEXT",
          "MULTILINETEXT",
          "NUMBER",
          "DATE",
          "EMAIL",
          "PASSWORD",
          "ZIP",
        ]),  // FieldType enum for validation
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userProperty, value, fieldType } = input;

      let validatedValue: string | number | Date;

      // Validate the value based on fieldType
      switch (fieldType) {
        case "TEXT":
        case "MULTILINETEXT":
        case "ZIP":
          validatedValue = value;  // For these types, treat the value as a string
          break;

        case "EMAIL":
          if (!z.string().email().safeParse(value).success) {
            throw new Error("Invalid email format");
          }
          validatedValue = value;
          break;

        case "PASSWORD":
          validatedValue = value; // Handle password as string, add hashing if necessary
          break;

        case "NUMBER":
          const numValue = Number(value);
          if (isNaN(numValue)) {
            throw new Error("Invalid number format");
          }
          validatedValue = numValue;
          break;

        case "DATE":
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            throw new Error("Invalid date format");
          }
          validatedValue = dateValue;
          break;

        default:
          throw new Error("Unsupported field type");
      }

      // Update the user record (assuming userId = 1 for the demo)
      const user = await ctx.db.user.update({
        where: { id: 1 },  // Update user with userId = 1
        data: {
          [userProperty]: validatedValue,  // Dynamically update the user property
        },
      });

      return user;
    }),
});
  

