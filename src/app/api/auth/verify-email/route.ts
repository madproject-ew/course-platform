import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${appUrl}/verify-email?error=missing-token`);
  }

  const record = await db.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return NextResponse.redirect(`${appUrl}/verify-email?error=invalid-token`);
  }

  if (record.expiresAt < new Date()) {
    await db.verificationToken.delete({ where: { id: record.id } });
    return NextResponse.redirect(`${appUrl}/verify-email?error=expired`);
  }

  await db.user.update({
    where: { email: record.email },
    data: { emailVerified: true },
  });

  await db.verificationToken.delete({ where: { id: record.id } });

  return NextResponse.redirect(`${appUrl}/verify-email?success=true`);
}
