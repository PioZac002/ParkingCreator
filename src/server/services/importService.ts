import { prisma } from "@/lib/prisma";
import { sendActivationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export type ImportUser = {
  name: string;
  email: string;
};

export type ImportResult = {
  success: number;
  skipped: number;
  errors: { email: string; reason: string }[];
};

export async function importUsers(
  users: ImportUser[],
  estateId: string
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, skipped: 0, errors: [] };

  for (const user of users) {
    const email = user.email.trim().toLowerCase();

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      result.errors.push({ email, reason: "Nieprawidłowy format email" });
      continue;
    }

    const name = user.name?.trim();
    if (!name) {
      result.errors.push({ email, reason: "Brak imienia i nazwiska" });
      continue;
    }

    // Check for duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      result.skipped++;
      continue;
    }

    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    // Placeholder hash — user sets real password via activation link
    const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

    await prisma.user.create({
      data: {
        email,
        name,
        role: "RESIDENT",
        status: "PENDING",
        passwordHash,
        estateId,
        activationToken,
        activationTokenExpiry,
      },
    });

    // Send activation email (fire-and-forget)
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    sendActivationEmail({
      to: email,
      name,
      activationUrl: `${appUrl}/activate/${activationToken}`,
    }).catch((err) => console.error("[email] Błąd wysyłki:", err));

    result.success++;
  }

  return result;
}
