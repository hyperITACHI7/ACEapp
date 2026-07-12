import Razorpay from "razorpay";
import { createHmac } from "crypto";

function getClient(): Razorpay {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID ?? "",
    key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
  });
}

export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const client = getClient();
  return client.orders.create({ amount: amountPaise, currency: "INR", receipt });
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

/** Must be checked against the RAW request body before any JSON parsing. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET ?? "").update(rawBody).digest("hex");
  return expected === signature;
}
