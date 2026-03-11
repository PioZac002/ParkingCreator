import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, managerProcedure } from "../trpc";
import { sendReservationCreated, sendReservationConfirmed, sendReservationCancelled } from "@/lib/email";

export const reservationRouter = router({
  // Resident: find spots available for a given time window in their estate
  listAvailable: protectedProcedure
    .input(z.object({ startTime: z.date(), endTime: z.date() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { estateId: true },
      });
      if (!user?.estateId) return [];

      return ctx.prisma.parkingSpot.findMany({
        where: {
          layout: { estateId: user.estateId },
          availabilities: {
            some: {
              status: "AVAILABLE",
              startTime: { lte: input.startTime },
              endTime: { gte: input.endTime },
            },
          },
          reservations: {
            none: {
              status: { not: "CANCELLED" },
              startTime: { lt: input.endTime },
              endTime: { gt: input.startTime },
            },
          },
        },
        include: {
          layout: { select: { id: true, name: true, zone: true } },
        },
        orderBy: { number: "asc" },
      });
    }),

  // Resident: book a spot
  create: protectedProcedure
    .input(z.object({ spotId: z.string(), startTime: z.date(), endTime: z.date() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (input.endTime <= input.startTime) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nieprawidłowy zakres czasu" });
      }

      // Conflict check
      const conflict = await ctx.prisma.reservation.findFirst({
        where: {
          spotId: input.spotId,
          status: { not: "CANCELLED" },
          startTime: { lt: input.endTime },
          endTime: { gt: input.startTime },
        },
      });
      if (conflict) throw new TRPCError({ code: "CONFLICT", message: "Miejsce jest już zarezerwowane w tym terminie" });

      // Verify availability window covers requested range
      const avail = await ctx.prisma.availability.findFirst({
        where: {
          spotId: input.spotId,
          status: "AVAILABLE",
          startTime: { lte: input.startTime },
          endTime: { gte: input.endTime },
        },
      });
      if (!avail) throw new TRPCError({ code: "BAD_REQUEST", message: "Miejsce nie jest dostępne w tym terminie" });

      const reservation = await ctx.prisma.reservation.create({
        data: { spotId: input.spotId, userId, startTime: input.startTime, endTime: input.endTime, status: "PENDING" },
        include: {
          spot: { include: { layout: { include: { estate: { select: { name: true } } } } } },
          user: { select: { email: true } },
        },
      });

      sendReservationCreated({
        to: reservation.user.email,
        spotNumber: reservation.spot.number,
        layoutName: reservation.spot.layout.name,
        estateName: reservation.spot.layout.estate.name,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      }).catch((err) => console.error("[email] Błąd wysyłki:", err));

      return reservation;
    }),

  // Resident: cancel own reservation
  cancel: protectedProcedure
    .input(z.object({ reservationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.findFirst({
        where: { id: input.reservationId, userId: ctx.session.user.id },
        include: {
          spot: { include: { layout: { include: { estate: { select: { name: true } } } } } },
          user: { select: { email: true } },
        },
      });
      if (!reservation) throw new TRPCError({ code: "NOT_FOUND" });
      if (reservation.status === "CANCELLED") throw new TRPCError({ code: "BAD_REQUEST", message: "Rezerwacja już anulowana" });

      const updated = await ctx.prisma.reservation.update({
        where: { id: input.reservationId },
        data: { status: "CANCELLED" },
      });

      sendReservationCancelled({
        to: reservation.user.email,
        spotNumber: reservation.spot.number,
        layoutName: reservation.spot.layout.name,
        estateName: reservation.spot.layout.estate.name,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      }).catch((err) => console.error("[email] Błąd wysyłki:", err));

      return updated;
    }),

  // Resident: list own reservations
  listMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.reservation.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        spot: { include: { layout: { select: { id: true, name: true, zone: true } } } },
      },
      orderBy: { startTime: "desc" },
    });
  }),

  // Manager: list all reservations for an estate
  listByEstate: managerProcedure
    .input(z.object({ estateId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { managedEstates: { where: { id: input.estateId }, select: { id: true } } },
      });
      if (!user?.managedEstates.length) throw new TRPCError({ code: "FORBIDDEN" });

      return ctx.prisma.reservation.findMany({
        where: { spot: { layout: { estateId: input.estateId } } },
        include: {
          spot: { include: { layout: { select: { id: true, name: true, zone: true } } } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Manager: confirm or cancel a reservation
  updateStatus: managerProcedure
    .input(z.object({ reservationId: z.string(), status: z.enum(["CONFIRMED", "CANCELLED"]) }))
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.findUnique({
        where: { id: input.reservationId },
        include: {
          spot: { include: { layout: { include: { estate: { select: { name: true, id: true } } } } } },
          user: { select: { email: true } },
        },
      });
      if (!reservation) throw new TRPCError({ code: "NOT_FOUND" });

      // Verify manager has access
      const manager = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { managedEstates: { where: { id: reservation.spot.layout.estate.id }, select: { id: true } } },
      });
      if (!manager?.managedEstates.length) throw new TRPCError({ code: "FORBIDDEN" });

      const updated = await ctx.prisma.reservation.update({
        where: { id: input.reservationId },
        data: { status: input.status },
      });

      const emailData = {
        to: reservation.user.email,
        spotNumber: reservation.spot.number,
        layoutName: reservation.spot.layout.name,
        estateName: reservation.spot.layout.estate.name,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      };
      if (input.status === "CONFIRMED") sendReservationConfirmed(emailData).catch((err) => console.error("[email] Błąd wysyłki:", err));
      else sendReservationCancelled(emailData).catch((err) => console.error("[email] Błąd wysyłki:", err));

      return updated;
    }),
});
