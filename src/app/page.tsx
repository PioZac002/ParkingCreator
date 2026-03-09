import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const roleDashboard: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  MANAGER: "/manager",
  RESIDENT: "/parking",
};

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const role = (session.user as Record<string, unknown>).role as string;
    redirect(roleDashboard[role] || "/parking");
  }

  redirect("/login");
}
