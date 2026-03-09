import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ImportPageClient } from "./client";

export default async function ImportPage() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;

  if (!user || (user.role !== "MANAGER" && user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const estateId = user.estateId as string | null;
  if (!estateId) {
    redirect("/manager");
  }

  return <ImportPageClient estateId={estateId} />;
}
