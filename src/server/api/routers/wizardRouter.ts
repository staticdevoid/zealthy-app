import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const wizardRouter = createTRPCRouter({
  getLayout: publicProcedure.query(async ({ ctx }) => {
    const layout = await ctx.db.form.findUnique({
      where: {
        id: 1, // only defined form for the purposes of this demo
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
});
