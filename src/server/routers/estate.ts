import { z } from "zod";
import { router, adminProcedure, protectedProcedure, managerProcedure } from "../trpc";

export const estateRouter = router({
  // All estates (admin) or manager's managed estates
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role === "SUPER_ADMIN") {
      return ctx.prisma.estate.findMany({
        include: {
          _count: { select: { residents: true, parkingLayouts: true } },
          managers: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Manager sees their managed estates
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        managedEstates: {
          include: {
            _count: { select: { residents: true, parkingLayouts: true } },
          },
        },
      },
    });
    return user?.managedEstates ?? [];
  }),

  // Estates managed by the current manager
  listManaged: managerProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        managedEstates: {
          include: {
            _count: { select: { residents: true, parkingLayouts: true } },
            parkingLayouts: { select: { id: true, name: true, zone: true } },
          },
          orderBy: { name: "asc" },
        },
      },
    });
    return user?.managedEstates ?? [];
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.estate.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { residents: true, parkingLayouts: true } },
          parkingLayouts: { select: { id: true, name: true, zone: true } },
          managers: { select: { id: true, name: true, email: true } },
        },
      });
    }),

  create: adminProcedure
    .input(z.object({ name: z.string().min(2), address: z.string().min(5) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.estate.create({ data: input });
    }),

  // Assign a manager to an estate
  assignManager: adminProcedure
    .input(z.object({ estateId: z.string().uuid(), managerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.estate.update({
        where: { id: input.estateId },
        data: { managers: { connect: { id: input.managerId } } },
      });
    }),

  // Remove a manager from an estate
  removeManager: adminProcedure
    .input(z.object({ estateId: z.string().uuid(), managerId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.estate.update({
        where: { id: input.estateId },
        data: { managers: { disconnect: { id: input.managerId } } },
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
