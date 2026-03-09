import { router, protectedProcedure, managerProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        estateId: true,
        estate: {
          select: { id: true, name: true },
        },
      },
    });
    return user;
  }),

  listByEstate: managerProcedure
    .input(z.object({ estateId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: { estateId: input.estateId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
