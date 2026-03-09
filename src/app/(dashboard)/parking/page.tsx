import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ParkingViewClient } from "./client";

export default async function ParkingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const estateId = (session.user as Record<string, unknown>).estateId as string | null;

  const [mySpots, layouts] = await Promise.all([
    // All spots owned by this user
    prisma.parkingSpot.findMany({
      where: { ownerId: userId },
      include: {
        layout: { select: { id: true, name: true, zone: true, estateId: true } },
        availabilities: {
          where: { endTime: { gt: new Date() } },
          orderBy: { startTime: "asc" },
          take: 1,
        },
      },
      orderBy: { number: "asc" },
    }),
    // All layouts for the user's estate
    estateId
      ? prisma.parkingLayout.findMany({
          where: { estateId },
          include: {
            spots: {
              include: {
                availabilities: {
                  where: { endTime: { gt: new Date() } },
                  orderBy: { startTime: "asc" },
                  take: 1,
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        })
      : [],
  ]);

  return (
    <ParkingViewClient
      mySpots={mySpots}
      layouts={layouts}
      userId={userId}
    />
  );
}
