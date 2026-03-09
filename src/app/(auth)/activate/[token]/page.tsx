import { prisma } from "@/lib/prisma";
import { ActivatePageClient } from "./client";

export default async function ActivatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { activationToken: token },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      activationTokenExpiry: true,
    },
  });

  if (!user) {
    return <ActivatePageClient status="invalid" />;
  }

  if (user.status === "ACTIVE") {
    return <ActivatePageClient status="already_active" />;
  }

  if (user.activationTokenExpiry && user.activationTokenExpiry < new Date()) {
    return <ActivatePageClient status="expired" token={token} />;
  }

  return (
    <ActivatePageClient
      status="valid"
      token={token}
      userName={user.name}
      userEmail={user.email}
    />
  );
}
