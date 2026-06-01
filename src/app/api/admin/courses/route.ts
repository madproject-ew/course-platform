import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { access: true, transactions: true },
      },
    },
  });

  return NextResponse.json({ courses });
}

export async function PUT(request: Request) {
  try {
    const { id, title, description, price, imageUrl, isPublished, freeModules } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
    }

    const course = await db.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isPublished !== undefined && { isPublished }),
        ...(freeModules !== undefined && { freeModules }),
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Admin courses error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
