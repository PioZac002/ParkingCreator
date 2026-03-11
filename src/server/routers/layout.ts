import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, managerProcedure, protectedProcedure } from "../trpc";

const spotSchema = z.object({
  id: z.string(),
  number: z.string(),
  type: z.enum(["STANDARD", "DISABLED", "ELECTRIC", "RESERVED"]),
  posX: z.number(),
  posY: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().int(),
});

const obstacleSchema = z.object({
  id: z.string(),
  type: z.enum(["wall", "road", "pillar", "zone"]),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  label: z.string().optional(),
});

const gridDataSchema = z.object({
  obstacles: z.array(obstacleSchema),
});

export const layoutRouter = router({
  listByEstate: protectedProcedure
    .input(z.object({ estateId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.parkingLayout.findMany({
        where: { estateId: input.estateId },
        include: { _count: { select: { spots: true } } },
        orderBy: { createdAt: "asc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.parkingLayout.findUnique({
        where: { id: input.id },
        include: {
          spots: { orderBy: { number: "asc" } },
        },
      });
    }),

  create: managerProcedure
    .input(z.object({
      estateId: z.string().uuid(),
      name: z.string().min(1),
      zone: z.string().optional(),
      gridWidth: z.number().int().min(10).max(100).default(30),
      gridHeight: z.number().int().min(10).max(100).default(20),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.parkingLayout.create({
        data: {
          ...input,
          gridData: { obstacles: [] },
        },
      });
    }),

  generateLayout: managerProcedure
    .input(z.object({
      estateId: z.string().uuid(),
      name: z.string().min(1),
      zone: z.string().optional(),
      spotCount: z.number().int().min(1).max(200),
    }))
    .mutation(async ({ ctx, input }) => {
      const { estateId, name, zone, spotCount } = input;
      const prefix = zone || "A";

      // Auto-layout algorithm
      const cols = Math.ceil(Math.sqrt(spotCount * 1.5));
      const rows = Math.ceil(spotCount / cols);
      const gridWidth = cols * 4 + 2;
      const gridHeight = rows * 6 + 8;
      const aisleRow = Math.floor(rows / 2);
      const aisleY = aisleRow * 6 + 3;

      const road = {
        id: "road-main",
        type: "road" as const,
        x: 0,
        y: aisleY,
        width: gridWidth,
        height: 2,
        label: "Aleja",
      };

      return ctx.prisma.$transaction(async (tx) => {
        const layout = await tx.parkingLayout.create({
          data: {
            estateId,
            name,
            zone: zone || null,
            gridWidth,
            gridHeight,
            gridData: { obstacles: [road] },
          },
        });

        const spots = [];
        for (let i = 0; i < spotCount; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          // Offset rows below the aisle
          const rowY = row < aisleRow ? row * 6 + 1 : row * 6 + 4;
          spots.push({
            layoutId: layout.id,
            number: `${prefix}-${String(i + 1).padStart(2, "0")}`,
            type: "STANDARD" as const,
            posX: col * 4 + 1,
            posY: rowY,
            width: 3,
            height: 5,
            rotation: 0,
          });
        }

        await tx.parkingSpot.createMany({ data: spots });
        return layout;
      });
    }),

  // Save full layout (gridData + spots as one transaction)
  save: managerProcedure
    .input(z.object({
      layoutId: z.string().uuid(),
      gridData: gridDataSchema,
      spots: z.array(spotSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      const { layoutId, gridData, spots } = input;

      return ctx.prisma.$transaction(async (tx) => {
        // Update layout gridData
        await tx.parkingLayout.update({
          where: { id: layoutId },
          data: { gridData: gridData as object },
        });

        // Get existing spots
        const existing = await tx.parkingSpot.findMany({
          where: { layoutId },
          select: { id: true },
        });
        const existingIds = new Set(existing.map((s) => s.id));
        const incomingIds = new Set(spots.map((s) => s.id));

        // Delete removed spots
        const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
        if (toDelete.length > 0) {
          await tx.parkingSpot.deleteMany({ where: { id: { in: toDelete } } });
        }

        // Upsert each spot
        for (const spot of spots) {
          if (existingIds.has(spot.id)) {
            await tx.parkingSpot.update({
              where: { id: spot.id },
              data: {
                number: spot.number,
                type: spot.type,
                posX: spot.posX,
                posY: spot.posY,
                width: spot.width,
                height: spot.height,
                rotation: spot.rotation,
              },
            });
          } else {
            await tx.parkingSpot.create({
              data: {
                id: spot.id,
                layoutId,
                number: spot.number,
                type: spot.type,
                posX: spot.posX,
                posY: spot.posY,
                width: spot.width,
                height: spot.height,
                rotation: spot.rotation,
              },
            });
          }
        }

        return tx.parkingLayout.findUnique({
          where: { id: layoutId },
          include: { _count: { select: { spots: true } } },
        });
      });
    }),

  delete: managerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.parkingLayout.delete({ where: { id: input.id } });
    }),

  // Assign or unassign a spot owner (userId = null to unassign)
  assignSpotOwner: managerProcedure
    .input(z.object({ spotId: z.string().uuid(), userId: z.string().uuid().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const spot = await ctx.prisma.parkingSpot.findUnique({
        where: { id: input.spotId },
        include: { layout: { select: { estateId: true } } },
      });
      if (!spot) throw new TRPCError({ code: "NOT_FOUND" });

      const manager = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { managedEstates: { where: { id: spot.layout.estateId }, select: { id: true } } },
      });
      if (!manager?.managedEstates.length) throw new TRPCError({ code: "FORBIDDEN" });

      return ctx.prisma.parkingSpot.update({
        where: { id: input.spotId },
        data: { ownerId: input.userId },
      });
    }),

  // List unassigned spots for an estate
  listUnassigned: managerProcedure
    .input(z.object({ estateId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const manager = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { managedEstates: { where: { id: input.estateId }, select: { id: true } } },
      });
      if (!manager?.managedEstates.length) throw new TRPCError({ code: "FORBIDDEN" });

      return ctx.prisma.parkingSpot.findMany({
        where: { layout: { estateId: input.estateId }, ownerId: null },
        include: { layout: { select: { name: true, zone: true } } },
        orderBy: { number: "asc" },
      });
    }),
});
