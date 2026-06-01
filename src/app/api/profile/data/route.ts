import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [transactions, courseAccess] = await Promise.all([
    db.transaction.findMany({
      where: { userId: session.userId },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.courseAccess.findMany({
      where: { userId: session.userId },
      include: { course: { select: { title: true, slug: true } } },
    }),
  ]);

  return NextResponse.json({ transactions, courseAccess });
}
