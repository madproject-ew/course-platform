import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, validatePassword, createToken, setSessionCookie } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Все поля обязательны" },
        { status: 400 }
      );
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.error },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: { email, name, passwordHash },
    });

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, token).catch(console.error);

    // Create session
    const jwt = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookie = setSessionCookie(jwt);
    const response = NextResponse.json(
      { message: "Регистрация успешна. Проверьте email для подтверждения." },
      { status: 201 }
    );

    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
