import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const availabilityRouter = router({
  setAvailability: protectedProcedure
    .input(
      z.object({
        spotId: z.string(),
        status: z.enum(["AVAILABLE", "UNAVAILABLE"]),
        startTime: z.date(),
        endTime: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const spot = await ctx.prisma.parkingSpot.findFirst({
        where: { id: input.spotId, ownerId: userId },
      });
      if (!spot) throw new TRPCError({ code: "FORBIDDEN", message: "Nie jesteś właścicielem tego miejsca" });

      if (input.endTime <= input.startTime) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Czas zakończenia musi być po czasie rozpoczęcia" });
      }

      // Remove any future availability for this spot, then create new
      await ctx.prisma.availability.deleteMany({
        where: { spotId: input.spotId, endTime: { gt: new Date() } },
      });

      return ctx.prisma.availability.create({
        data: {
          spotId: input.spotId,
          status: input.status,
          startTime: input.startTime,
          endTime: input.endTime,
        },
      });
    }),

  clearAvailability: protectedProcedure
    .input(z.object({ spotId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const spot = await ctx.prisma.parkingSpot.findFirst({
        where: { id: input.spotId, ownerId: userId },
      });
      if (!spot) throw new TRPCError({ code: "FORBIDDEN" });

      await ctx.prisma.availability.deleteMany({
        where: { spotId: input.spotId, endTime: { gt: new Date() } },
      });

      return { ok: true };
    }),
});
