import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Brakujące dane" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Hasło musi mieć co najmniej 8 znaków" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { activationToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: "Nieprawidłowy token" }, { status: 400 });
    }

    if (user.status === "ACTIVE") {
      return NextResponse.json({ error: "Konto jest już aktywne" }, { status: 400 });
    }

    if (user.activationTokenExpiry && user.activationTokenExpiry < new Date()) {
      return NextResponse.json({ error: "Token wygasł" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        status: "ACTIVE",
        activationToken: null,
        activationTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
