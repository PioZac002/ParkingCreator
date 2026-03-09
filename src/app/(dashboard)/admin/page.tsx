import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "./client";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || (session.user as Record<string, unknown>).role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const [estateCount, userCount, spotCount, reservationCount, estates] = await Promise.all([
    prisma.estate.count(),
    prisma.user.count(),
    prisma.parkingSpot.count(),
    prisma.reservation.count(),
    prisma.estate.findMany({
      include: {
        _count: { select: { users: true, parkingLayouts: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminDashboardClient
      stats={{ estateCount, userCount, spotCount, reservationCount }}
      estates={estates}
    />
  );
}
