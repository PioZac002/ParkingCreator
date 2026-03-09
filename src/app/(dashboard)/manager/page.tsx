import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManagerDashboardClient } from "./client";

export default async function ManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ estateId?: string }>;
}) {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role as string;

  if (!session?.user || (role !== "MANAGER" && role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const { estateId: estateIdParam } = await searchParams;

  // Get all managed estates for this manager
  const userWithEstates = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      managedEstates: {
        include: {
          _count: { select: { residents: true, parkingLayouts: true } },
          parkingLayouts: { select: { id: true, name: true, zone: true, _count: { select: { spots: true } } } },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  const managedEstates = userWithEstates?.managedEstates ?? [];

  // Determine active estate
  const activeEstate = estateIdParam
    ? managedEstates.find((e) => e.id === estateIdParam) ?? null
    : managedEstates.length === 1
    ? managedEstates[0]
    : null;

  // Load users and pending reservations for active estate
  const [users, pendingReservations] = activeEstate
    ? await Promise.all([
        prisma.user.findMany({
          where: { estateId: activeEstate.id },
          select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.reservation.count({
          where: { status: "PENDING", spot: { layout: { estateId: activeEstate.id } } },
        }),
      ])
    : [[], 0];

  return (
    <ManagerDashboardClient
      managedEstates={managedEstates}
      activeEstate={activeEstate}
      recentUsers={users}
      managerName={session.user.name}
      pendingReservations={pendingReservations}
    />
  );
}
