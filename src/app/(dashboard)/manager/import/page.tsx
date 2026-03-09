import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ImportPageClient } from "./client";

export default async function ImportPage({
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

  // Get manager's estates for selector
  const userWithEstates = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { managedEstates: { select: { id: true, name: true }, orderBy: { name: "asc" } } },
  });

  const managedEstates = userWithEstates?.managedEstates ?? [];

  // Resolve active estate
  const activeEstateId =
    estateIdParam && managedEstates.find((e) => e.id === estateIdParam)
      ? estateIdParam
      : managedEstates.length === 1
      ? managedEstates[0].id
      : null;

  if (!activeEstateId && managedEstates.length === 0) {
    redirect("/manager");
  }

  return (
    <ImportPageClient
      managedEstates={managedEstates}
      activeEstateId={activeEstateId}
    />
  );
}
