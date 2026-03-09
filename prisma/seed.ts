import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Prisma v7 enums imported from generated client
const Role = { SUPER_ADMIN: "SUPER_ADMIN", MANAGER: "MANAGER", RESIDENT: "RESIDENT" } as const;
const UserStatus = { PENDING: "PENDING", ACTIVE: "ACTIVE", DISABLED: "DISABLED" } as const;
const SpotType = { STANDARD: "STANDARD", DISABLED: "DISABLED", ELECTRIC: "ELECTRIC", RESERVED: "RESERVED" } as const;
type Role = typeof Role[keyof typeof Role];
type UserStatus = typeof UserStatus[keyof typeof UserStatus];
type SpotType = typeof SpotType[keyof typeof SpotType];

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

  console.log("✅ Estates created");

  // ─── Users ──────────────────────────────────────────
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@pms.dev",
      name: "Jan Kowalski",
      role: Role.SUPER_ADMIN,
      passwordHash,
      status: UserStatus.ACTIVE,
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: "zarzadca1@pms.dev",
      name: "Anna Nowak",
      role: Role.MANAGER,
      passwordHash,
      status: UserStatus.ACTIVE,
      estateId: estate1.id,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: "zarzadca2@pms.dev",
      name: "Piotr Wiśniewski",
      role: Role.MANAGER,
      passwordHash,
      status: UserStatus.ACTIVE,
      estateId: estate2.id,
    },
  });

  const resident1 = await prisma.user.create({
    data: {
      email: "mieszkaniec1@pms.dev",
      name: "Maria Kowalczyk",
      role: Role.RESIDENT,
      passwordHash,
      status: UserStatus.ACTIVE,
      estateId: estate1.id,
    },
  });

  const resident2 = await prisma.user.create({
    data: {
      email: "mieszkaniec2@pms.dev",
      name: "Tomasz Zieliński",
      role: Role.RESIDENT,
      passwordHash,
      status: UserStatus.ACTIVE,
      estateId: estate1.id,
    },
  });

  const resident3 = await prisma.user.create({
    data: {
      email: "mieszkaniec3@pms.dev",
      name: "Katarzyna Lewandowska",
      role: Role.RESIDENT,
      passwordHash,
      status: UserStatus.ACTIVE,
      estateId: estate2.id,
    },
  });

  const resident4 = await prisma.user.create({
    data: {
      email: "mieszkaniec4@pms.dev",
      name: "Michał Szymański",
      role: Role.RESIDENT,
      passwordHash,
      status: UserStatus.ACTIVE,
      estateId: estate2.id,
    },
  });

  console.log("✅ Users created");

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
          { id: "wall-1", type: "wall", x: 0, y: 0, width: 30, height: 0.2 },
          { id: "wall-2", type: "wall", x: 0, y: 19.8, width: 30, height: 0.2 },
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
          { id: "pillar-3", type: "pillar", x: 18, y: 4, width: 0.5, height: 0.5 },
          { id: "road-1", type: "road", x: 0, y: 7, width: 25, height: 1.5 },
        ],
      },
    },
  });

  console.log("✅ Parking layouts created");

  // ─── Parking Spots ──────────────────────────────────
  // Estate 1 - Parking spots (A-01 to A-08)
  const spotData1 = [
    { number: "A-01", posX: 1, posY: 1, ownerId: resident1.id },
    { number: "A-02", posX: 4, posY: 1, ownerId: resident2.id },
    { number: "A-03", posX: 7, posY: 1 },
    { number: "A-04", posX: 10, posY: 1 },
    { number: "A-05", posX: 1, posY: 12 },
    { number: "A-06", posX: 4, posY: 12 },
    { number: "A-07", posX: 7, posY: 12 },
    { number: "A-08", posX: 10, posY: 12 },
  ];

  for (const spot of spotData1) {
    await prisma.parkingSpot.create({
      data: {
        layoutId: layout1.id,
        number: spot.number,
        ownerId: spot.ownerId || null,
        type: SpotType.STANDARD,
        posX: spot.posX,
        posY: spot.posY,
        width: 2.5,
        height: 5,
        rotation: 0,
      },
    });
  }

  // Estate 2 - Garage spots (G-01 to G-06)
  const spotData2 = [
    { number: "G-01", posX: 1, posY: 1, ownerId: resident3.id },
    { number: "G-02", posX: 4, posY: 1, ownerId: resident4.id },
    { number: "G-03", posX: 7, posY: 1, type: SpotType.ELECTRIC },
    { number: "G-04", posX: 1, posY: 9, type: SpotType.DISABLED },
    { number: "G-05", posX: 4, posY: 9 },
    { number: "G-06", posX: 7, posY: 9 },
  ];

  for (const spot of spotData2) {
    await prisma.parkingSpot.create({
      data: {
        layoutId: layout2.id,
        number: spot.number,
        ownerId: spot.ownerId || null,
        type: spot.type || SpotType.STANDARD,
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
  console.log("  Super Admin:  admin@pms.dev");
  console.log("  Zarządca 1:   zarzadca1@pms.dev  (Osiedle Słoneczne)");
  console.log("  Zarządca 2:   zarzadca2@pms.dev  (Osiedle Parkowe)");
  console.log("  Mieszkaniec:  mieszkaniec1@pms.dev - mieszkaniec4@pms.dev");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
