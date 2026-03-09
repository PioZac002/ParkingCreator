import { z } from "zod";
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
      // Managers can only import to their own estate
      const userEstateId = (ctx.session.user as Record<string, unknown>).estateId as string | null;
      if (ctx.session.user.role === "MANAGER" && userEstateId !== input.estateId) {
        throw new Error("Brak dostępu do tego osiedla");
      }

      return importUsers(input.users, input.estateId);
    }),
});
