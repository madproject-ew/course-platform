import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, courseId, years = 2 } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json({ error: "userId и courseId обязательны" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + years);

    const access = await db.courseAccess.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      create: {
        userId,
        courseId,
        expiresAt,
        grantedBy: `admin:${session.email}`,
      },
      update: {
        expiresAt,
        grantedBy: `admin:${session.email}`,
      },
    });

    return NextResponse.json({ access });
  } catch (error) {
    console.error("Admin access error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, courseId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json({ error: "userId и courseId обязательны" }, { status: 400 });
    }

    await db.courseAccess.delete({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin access delete error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
