import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUserTable: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findFirst({});
    return users;
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
        email: z.string().email(),
        userProperty: z.string(),
        value: z.string(),
        fieldType: z.enum([
          "TEXT",
          "MULTILINETEXT",
          "NUMBER",
          "DATE",
          "EMAIL",
          "PASSWORD",
          "ZIP",
        ]), // FieldType enum for validation
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userProperty, value, fieldType } = input;

      let validatedValue: string | number | Date;

      switch (fieldType) {
        case "TEXT":
        case "MULTILINETEXT":
        case "ZIP":
          validatedValue = value;
          break;

        case "EMAIL":
          if (!z.string().email().safeParse(value).success) {
            throw new Error("Invalid email format");
          }
          validatedValue = value;
          break;

        case "PASSWORD":
          validatedValue = value;
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

      const user = await ctx.db.user.update({
        where: { email: input.email },
        data: {
          [userProperty]: validatedValue,
        },
      });

      return user;
    }),

  authUser: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format."),
        password: z.string().min(8, "Password must be at least 8 characters."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        if (existingUser.password !== password) {
          throw new Error("Invalid password.");
        }

        return {
          success: true,
          message: "User authenticated successfully.",
          user: existingUser,
        };
      }

      const newUser = await ctx.db.user.create({
        data: {
          email,
          password, 
        },
      });

      return {
        success: true,
        message: "User created successfully.",
        user: newUser,
      };
    }),
});
