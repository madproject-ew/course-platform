import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal whether user exists
      return NextResponse.json({ message: "Если аккаунт существует, письмо отправлено" });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email уже подтверждён" });
    }

    // Delete old tokens
    await db.verificationToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Письмо отправлено" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
