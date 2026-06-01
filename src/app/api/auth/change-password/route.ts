import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword, verifyPassword, validatePassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: session.userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ message: "Пароль изменён" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
