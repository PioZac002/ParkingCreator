import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManagerUsersClient } from "./client";

export default async function ManagerUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ estateId?: string }>;
}) {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role as string;
  if (!session?.user || (role !== "MANAGER" && role !== "SUPER_ADMIN")) redirect("/login");

  const { estateId: estateIdParam } = await searchParams;

  const userWithEstates = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { managedEstates: { select: { id: true, name: true }, orderBy: { name: "asc" } } },
  });
  const managedEstates = userWithEstates?.managedEstates ?? [];

  const activeEstateId =
    estateIdParam && managedEstates.find((e) => e.id === estateIdParam)
      ? estateIdParam
      : managedEstates[0]?.id ?? null;

  if (!activeEstateId) redirect("/manager");

  const activeEstate = managedEstates.find((e) => e.id === activeEstateId)!;

  const [users, unassignedSpots] = await Promise.all([
    prisma.user.findMany({
      where: { estateId: activeEstateId, role: "RESIDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        parkingSpots: {
          select: { id: true, number: true, type: true },
          where: { layout: { estateId: activeEstateId } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.parkingSpot.findMany({
      where: { layout: { estateId: activeEstateId }, ownerId: null },
      select: {
        id: true,
        number: true,
        type: true,
        layout: { select: { name: true, zone: true } },
      },
      orderBy: { number: "asc" },
    }),
  ]);

  return (
    <ManagerUsersClient
      users={users}
      unassignedSpots={unassignedSpots}
      managedEstates={managedEstates}
      activeEstateId={activeEstateId}
      activeEstateName={activeEstate.name}
    />
  );
}
