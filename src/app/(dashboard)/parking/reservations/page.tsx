import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationsClient } from "./client";

export default async function ReservationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const myReservations = await prisma.reservation.findMany({
    where: { userId },
    include: {
      spot: { include: { layout: { select: { id: true, name: true, zone: true } } } },
    },
    orderBy: { startTime: "desc" },
  });

  return <ReservationsClient myReservations={myReservations} />;
}
