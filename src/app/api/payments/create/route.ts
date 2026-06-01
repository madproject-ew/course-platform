import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPaymentLink } from "@/lib/prodamus";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { courseSlug } = await request.json();

    const course = await db.course.findUnique({ where: { slug: courseSlug } });
    if (!course) {
      return NextResponse.json({ error: "Курс не найден" }, { status: 404 });
    }

    // Check if already has access
    const existingAccess = await db.courseAccess.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: course.id,
        },
      },
    });

    if (existingAccess && existingAccess.expiresAt > new Date()) {
      return NextResponse.json({ error: "У вас уже есть доступ к этому курсу" }, { status: 400 });
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        userId: session.userId,
        courseId: course.id,
        amount: course.price,
        status: "pending",
      },
    });

    const paymentUrl = createPaymentLink({
      orderId: transaction.id,
      amount: course.price,
      email: session.email,
      courseName: course.title,
    });

    return NextResponse.json({ paymentUrl, transactionId: transaction.id });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
