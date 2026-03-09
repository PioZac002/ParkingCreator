import { router, protectedProcedure, managerProcedure, adminProcedure } from "../trpc";
import { z } from "zod";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        estateId: true,
        estate: { select: { id: true, name: true } },
        managedEstates: { select: { id: true, name: true } },
        parkingSpots: {
          select: { id: true, number: true, type: true, layout: { select: { name: true, zone: true } } },
        },
      },
    });
  }),

  listByEstate: managerProcedure
    .input(z.object({ estateId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Managers can only query estates they manage
      if (ctx.session.user.role === "MANAGER") {
        const manages = await ctx.prisma.estate.findFirst({
          where: {
            id: input.estateId,
            managers: { some: { id: ctx.session.user.id } },
          },
        });
        if (!manages) throw new Error("Brak dostępu do tego osiedla");
      }

      return ctx.prisma.user.findMany({
        where: { estateId: input.estateId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          parkingSpots: { select: { id: true, number: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // All managers (for admin to assign)
  listManagers: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: { role: "MANAGER" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        managedEstates: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
  }),
});
