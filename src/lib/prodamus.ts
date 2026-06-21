import crypto from "crypto";

const PRODAMUS_SECRET = process.env.PRODAMUS_SECRET_KEY || "";
const PRODAMUS_API_URL = process.env.PRODAMUS_API_URL || "";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export function createPaymentLink(params: {
  orderId: string;
  amount: number;
  email: string;
  courseName: string;
  courseSlug: string;
}): string {
  const { orderId, amount, email, courseName, courseSlug } = params;

  const queryParams = new URLSearchParams();
  queryParams.set("order_id", orderId);
  queryParams.set("products[0][name]", courseName);
  queryParams.set("products[0][price]", amount.toString());
  queryParams.set("products[0][quantity]", "1");
  queryParams.set("do", "pay");
  queryParams.set("sum", amount.toString());
  queryParams.set("currency", "rub");
  queryParams.set("customer_email", email);
  queryParams.set("urlReturn", `${APP_URL}/course/${courseSlug}?payment=success`);
  queryParams.set("urlNotification", `${APP_URL}/api/payments/prodamus/webhook`);

  return `${PRODAMUS_API_URL}?${queryParams.toString()}`;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const hmac = crypto
    .createHmac("sha256", PRODAMUS_SECRET)
    .update(rawBody)
    .digest("hex");

  return hmac === signature;
}
