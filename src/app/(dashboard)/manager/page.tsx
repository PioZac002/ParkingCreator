import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManagerDashboardClient } from "./client";

export default async function ManagerPage() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;

  if (!user || (user.role !== "MANAGER" && user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const estateId = user.estateId as string | null;

  const [estate, users, layouts] = await Promise.all([
    estateId
      ? prisma.estate.findUnique({
          where: { id: estateId },
          include: { _count: { select: { users: true, parkingLayouts: true } } },
        })
      : null,
    estateId
      ? prisma.user.findMany({
          where: { estateId },
          select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : [],
    estateId
      ? prisma.parkingLayout.findMany({
          where: { estateId },
          include: { _count: { select: { spots: true } } },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  return (
    <ManagerDashboardClient
      estate={estate}
      users={users}
      layouts={layouts}
      managerName={session!.user.name}
    />
  );
}
