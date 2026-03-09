import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, managerProcedure } from "../trpc";
import { importUsers } from "../services/importService";

const importUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const importRouter = router({
  importUsers: managerProcedure
    .input(
      z.object({
        users: z.array(importUserSchema).min(1).max(500),
        estateId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Managers can only import to estates they manage
      if (ctx.session.user.role === "MANAGER") {
        const manager = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { managedEstates: { where: { id: input.estateId }, select: { id: true } } },
        });
        if (!manager?.managedEstates.length) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Brak dostępu do tego osiedla" });
        }
      }

      return importUsers(input.users, input.estateId);
    }),
});
