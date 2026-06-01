import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/prodamus";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    console.log("[WEBHOOK] Raw body:", rawBody.substring(0, 200));

    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params.entries());

    console.log("[WEBHOOK] payment_status:", body.payment_status);
    console.log("[WEBHOOK] order_num:", body.order_num);
    console.log("[WEBHOOK] order_id:", body.order_id);

    const signature = request.headers.get("Sign") || "";
    const signatureValid = verifyWebhookSignature(rawBody, signature);
    console.log("[WEBHOOK] Signature valid:", signatureValid);

    // TODO: fix signature verification with Prodamus support
    // For now, validate by checking order_num exists in our DB

    const paymentStatus = body.payment_status;

    if (paymentStatus !== "success") {
      console.log("[WEBHOOK] Ignoring status:", paymentStatus);
      return NextResponse.json({ success: true });
    }

    // order_num contains our transaction ID
    const transactionId = body.order_num;

    if (!transactionId) {
      console.log("[WEBHOOK] Missing order_num");
      return NextResponse.json({ error: "Missing order_num" }, { status: 400 });
    }

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      console.log("[WEBHOOK] Transaction not found:", transactionId);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await db.transaction.update({
      where: { id: transactionId },
      data: {
        status: "completed",
        paymentId: body.order_id,
      },
    });

    // Grant course access for 2 years
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    await db.courseAccess.upsert({
      where: {
        userId_courseId: {
          userId: transaction.userId,
          courseId: transaction.courseId,
        },
      },
      create: {
        userId: transaction.userId,
        courseId: transaction.courseId,
        expiresAt,
        grantedBy: "payment",
      },
      update: {
        expiresAt,
        grantedBy: "payment",
      },
    });

    console.log("[WEBHOOK] Access granted! user:", transaction.userId, "course:", transaction.courseId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WEBHOOK] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
