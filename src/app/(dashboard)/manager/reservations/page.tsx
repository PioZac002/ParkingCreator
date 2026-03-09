import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManagerReservationsClient } from "./client";

export default async function ManagerReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ estateId?: string }>;
}) {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role as string;
  if (!session?.user || (role !== "MANAGER" && role !== "SUPER_ADMIN")) redirect("/login");

  const { estateId } = await searchParams;

  const userWithEstates = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { managedEstates: { select: { id: true, name: true }, orderBy: { name: "asc" } } },
  });
  const managedEstates = userWithEstates?.managedEstates ?? [];
  if (!managedEstates.length) redirect("/manager");

  const activeEstateId = estateId && managedEstates.find((e) => e.id === estateId)
    ? estateId
    : managedEstates[0].id;

  const reservations = await prisma.reservation.findMany({
    where: { spot: { layout: { estateId: activeEstateId } } },
    include: {
      spot: { include: { layout: { select: { id: true, name: true, zone: true } } } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ManagerReservationsClient
      reservations={reservations}
      managedEstates={managedEstates}
      activeEstateId={activeEstateId}
    />
  );
}
