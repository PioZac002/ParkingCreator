import { router, protectedProcedure, managerProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { sendActivationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

  createManager: adminProcedure
    .input(z.object({ name: z.string().min(2), email: z.string().email(), estateId: z.string().uuid().optional() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
      if (existing) throw new Error("Użytkownik z tym emailem już istnieje");

      const activationToken = crypto.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

      const manager = await ctx.prisma.user.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.name,
          role: "MANAGER",
          status: "PENDING",
          passwordHash,
          activationToken,
          activationTokenExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000),
          ...(input.estateId ? { managedEstates: { connect: { id: input.estateId } } } : {}),
        },
        select: { id: true, name: true, email: true, status: true, managedEstates: { select: { id: true, name: true } } },
      });

      const appUrl = process.env.APP_URL || "http://localhost:3000";
      sendActivationEmail({ to: manager.email, name: manager.name ?? "", activationUrl: `${appUrl}/activate/${activationToken}` }).catch((err) => console.error("[email] Błąd wysyłki:", err));

      return manager;
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
