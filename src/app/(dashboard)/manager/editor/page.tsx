import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditorClient } from "./client";

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ estateId?: string; layoutId?: string }>;
}) {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role as string;
  if (!session?.user || (role !== "MANAGER" && role !== "SUPER_ADMIN")) redirect("/login");

  const { estateId, layoutId } = await searchParams;

  // Get manager's estates
  const userWithEstates = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { managedEstates: { select: { id: true, name: true }, orderBy: { name: "asc" } } },
  });
  const managedEstates = userWithEstates?.managedEstates ?? [];

  const activeEstateId =
    estateId && managedEstates.find((e) => e.id === estateId)
      ? estateId
      : managedEstates[0]?.id ?? null;

  if (!activeEstateId) redirect("/manager");

  // Load existing layout if provided
  const existingLayout = layoutId
    ? await prisma.parkingLayout.findFirst({
        where: { id: layoutId, estateId: activeEstateId },
        include: { spots: { orderBy: { number: "asc" } } },
      })
    : null;

  // Load all layouts for this estate (for selector)
  const layouts = await prisma.parkingLayout.findMany({
    where: { estateId: activeEstateId },
    select: { id: true, name: true, zone: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <EditorClient
      estateId={activeEstateId}
      managedEstates={managedEstates}
      activeEstateId={activeEstateId}
      existingLayout={existingLayout}
      layouts={layouts}
    />
  );
}
