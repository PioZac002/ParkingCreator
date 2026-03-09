import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../trpc";

export const estateRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role === "SUPER_ADMIN") {
      return ctx.prisma.estate.findMany({
        include: {
          _count: {
            select: { users: true, parkingLayouts: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Managers and residents see only their estate
    if (ctx.session.user.estateId) {
      return ctx.prisma.estate.findMany({
        where: { id: ctx.session.user.estateId },
        include: {
          _count: {
            select: { users: true, parkingLayouts: true },
          },
        },
      });
    }

    return [];
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.estate.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { users: true, parkingLayouts: true },
          },
          parkingLayouts: {
            select: { id: true, name: true, zone: true },
          },
        },
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        address: z.string().min(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.estate.create({
        data: input,
      });
    }),

  stats: adminProcedure.query(async ({ ctx }) => {
    const [estateCount, userCount, spotCount, reservationCount] =
      await Promise.all([
        ctx.prisma.estate.count(),
        ctx.prisma.user.count(),
        ctx.prisma.parkingSpot.count(),
        ctx.prisma.reservation.count(),
      ]);

    return { estateCount, userCount, spotCount, reservationCount };
  }),
});
