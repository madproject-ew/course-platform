import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [totalUsers, totalCourses, totalTransactions, revenueResult] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.transaction.count({ where: { status: "completed" } }),
    db.transaction.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalCourses,
    totalTransactions,
    totalRevenue: revenueResult._sum.amount || 0,
  });
}
