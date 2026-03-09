import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "./client";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user as Record<string, unknown>).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const [estateCount, userCount, spotCount, reservationCount, estates, managers] =
    await Promise.all([
      prisma.estate.count(),
      prisma.user.count(),
      prisma.parkingSpot.count(),
      prisma.reservation.count(),
      prisma.estate.findMany({
        include: {
          _count: { select: { residents: true, parkingLayouts: true } },
          managers: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "MANAGER" },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          managedEstates: { select: { id: true, name: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

  return (
    <AdminDashboardClient
      stats={{ estateCount, userCount, spotCount, reservationCount }}
      estates={estates}
      managers={managers}
    />
  );
}
