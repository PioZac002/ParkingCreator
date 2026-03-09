import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.reservation.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.parkingSpot.deleteMany();
  await prisma.parkingLayout.deleteMany();
  await prisma.user.deleteMany();
  await prisma.estate.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // ─── Estates ────────────────────────────────────────
  const estate1 = await prisma.estate.create({
    data: {
      name: "Osiedle Słoneczne",
      address: "ul. Słoneczna 15, 00-100 Warszawa",
    },
  });

  const estate2 = await prisma.estate.create({
    data: {
      name: "Osiedle Parkowe",
      address: "ul. Parkowa 8, 00-200 Kraków",
    },
  });

  const estate3 = await prisma.estate.create({
    data: {
      name: "Osiedle Zielone",
      address: "ul. Zielona 22, 00-300 Wrocław",
    },
  });

  console.log("✅ Estates created");

  // ─── Super Admin ────────────────────────────────────
  await prisma.user.create({
    data: {
      email: "admin@pms.dev",
      name: "Jan Kowalski",
      role: "SUPER_ADMIN",
      passwordHash,
      status: "ACTIVE",
      // SUPER_ADMIN has no estateId and manages all via admin panel
    },
  });

  // ─── Managers (no estateId — they manage via managedEstates) ────
  // manager1 manages estate1 AND estate2 (multi-estate demo)
  const manager1 = await prisma.user.create({
    data: {
      email: "zarzadca1@pms.dev",
      name: "Anna Nowak",
      role: "MANAGER",
      passwordHash,
      status: "ACTIVE",
      managedEstates: {
        connect: [{ id: estate1.id }, { id: estate2.id }],
      },
    },
  });

  // manager2 manages only estate3
  const manager2 = await prisma.user.create({
    data: {
      email: "zarzadca2@pms.dev",
      name: "Piotr Wiśniewski",
      role: "MANAGER",
      passwordHash,
      status: "ACTIVE",
      managedEstates: {
        connect: [{ id: estate3.id }],
      },
    },
  });

  console.log("✅ Managers created:", manager1.email, manager2.email);

  // ─── Residents (have estateId, can own multiple spots) ──────────
  const resident1 = await prisma.user.create({
    data: {
      email: "mieszkaniec1@pms.dev",
      name: "Maria Kowalczyk",
      role: "RESIDENT",
      passwordHash,
      status: "ACTIVE",
      estateId: estate1.id,
    },
  });

  const resident2 = await prisma.user.create({
    data: {
      email: "mieszkaniec2@pms.dev",
      name: "Tomasz Zieliński",
      role: "RESIDENT",
      passwordHash,
      status: "ACTIVE",
      estateId: estate1.id,
    },
  });

  const resident3 = await prisma.user.create({
    data: {
      email: "mieszkaniec3@pms.dev",
      name: "Katarzyna Lewandowska",
      role: "RESIDENT",
      passwordHash,
      status: "ACTIVE",
      estateId: estate2.id,
    },
  });

  const resident4 = await prisma.user.create({
    data: {
      email: "mieszkaniec4@pms.dev",
      name: "Michał Szymański",
      role: "RESIDENT",
      passwordHash,
      status: "ACTIVE",
      estateId: estate3.id,
    },
  });

  console.log("✅ Residents created");

  // ─── Parking Layouts ────────────────────────────────
  const layout1 = await prisma.parkingLayout.create({
    data: {
      estateId: estate1.id,
      name: "Parking zewnętrzny",
      zone: "A",
      gridWidth: 30,
      gridHeight: 20,
      gridData: {
        obstacles: [
          { id: "wall-top", type: "wall", x: 0, y: 0, width: 30, height: 0.3 },
          { id: "wall-bottom", type: "wall", x: 0, y: 19.7, width: 30, height: 0.3 },
          { id: "road-1", type: "road", x: 0, y: 9, width: 30, height: 2 },
        ],
      },
    },
  });

  const layout2 = await prisma.parkingLayout.create({
    data: {
      estateId: estate2.id,
      name: "Hala garażowa",
      zone: "G",
      gridWidth: 25,
      gridHeight: 15,
      gridData: {
        obstacles: [
          { id: "pillar-1", type: "pillar", x: 6, y: 4, width: 0.5, height: 0.5 },
          { id: "pillar-2", type: "pillar", x: 12, y: 4, width: 0.5, height: 0.5 },
          { id: "road-1", type: "road", x: 0, y: 7, width: 25, height: 1.5 },
        ],
      },
    },
  });

  const layout3 = await prisma.parkingLayout.create({
    data: {
      estateId: estate3.id,
      name: "Parking podziemny",
      zone: "P",
      gridWidth: 20,
      gridHeight: 15,
      gridData: { obstacles: [] },
    },
  });

  console.log("✅ Parking layouts created");

  // ─── Parking Spots ──────────────────────────────────
  // Estate 1 — resident1 owns TWO spots (A-01 and A-02) to demo multi-spot
  const spotsEstate1 = [
    { number: "A-01", posX: 1, posY: 1, ownerId: resident1.id },
    { number: "A-02", posX: 4, posY: 1, ownerId: resident1.id }, // resident1 has 2 spots
    { number: "A-03", posX: 7, posY: 1, ownerId: resident2.id },
    { number: "A-04", posX: 10, posY: 1 },
    { number: "A-05", posX: 1, posY: 12 },
    { number: "A-06", posX: 4, posY: 12 },
    { number: "A-07", posX: 7, posY: 12 },
    { number: "A-08", posX: 10, posY: 12 },
  ];

  for (const spot of spotsEstate1) {
    await prisma.parkingSpot.create({
      data: {
        layoutId: layout1.id,
        number: spot.number,
        ownerId: spot.ownerId ?? null,
        type: "STANDARD",
        posX: spot.posX,
        posY: spot.posY,
        width: 2.5,
        height: 5,
        rotation: 0,
      },
    });
  }

  // Estate 2
  const spotsEstate2 = [
    { number: "G-01", posX: 1, posY: 1, ownerId: resident3.id, type: "STANDARD" },
    { number: "G-02", posX: 4, posY: 1, type: "STANDARD" },
    { number: "G-03", posX: 7, posY: 1, type: "ELECTRIC" },
    { number: "G-04", posX: 1, posY: 9, type: "DISABLED" },
    { number: "G-05", posX: 4, posY: 9, type: "STANDARD" },
  ];

  for (const spot of spotsEstate2) {
    await prisma.parkingSpot.create({
      data: {
        layoutId: layout2.id,
        number: spot.number,
        ownerId: spot.ownerId ?? null,
        type: spot.type as "STANDARD" | "DISABLED" | "ELECTRIC" | "RESERVED",
        posX: spot.posX,
        posY: spot.posY,
        width: 2.5,
        height: 5,
        rotation: 0,
      },
    });
  }

  // Estate 3
  const spotsEstate3 = [
    { number: "P-01", posX: 1, posY: 1, ownerId: resident4.id },
    { number: "P-02", posX: 4, posY: 1 },
    { number: "P-03", posX: 7, posY: 1 },
  ];

  for (const spot of spotsEstate3) {
    await prisma.parkingSpot.create({
      data: {
        layoutId: layout3.id,
        number: spot.number,
        ownerId: spot.ownerId ?? null,
        type: "STANDARD",
        posX: spot.posX,
        posY: spot.posY,
        width: 2.5,
        height: 5,
        rotation: 0,
      },
    });
  }

  console.log("✅ Parking spots created");
  console.log("🎉 Seed completed successfully!");
  console.log("");
  console.log("Demo accounts (password: password123):");
  console.log("  Super Admin:     admin@pms.dev");
  console.log("  Zarządca 1:      zarzadca1@pms.dev  (Osiedle Słoneczne + Parkowe)");
  console.log("  Zarządca 2:      zarzadca2@pms.dev  (Osiedle Zielone)");
  console.log("  Mieszkaniec 1:   mieszkaniec1@pms.dev (2 miejsca: A-01, A-02)");
  console.log("  Mieszkaniec 2-4: mieszkaniec2-4@pms.dev");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
