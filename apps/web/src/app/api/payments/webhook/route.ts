import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { verifyWebhookSignature } from "@/server/payments/razorpay";
import { applyReferralCreditOnPurchase } from "@/server/payments/referralService";

interface RazorpayWebhookPayload {
  event: string;
  payload: { payment: { entity: { id: string; order_id: string } } };
}

export async function POST(request: Request) {
  // Signature verification MUST happen against the raw body before any JSON parsing.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const body: RazorpayWebhookPayload = JSON.parse(rawBody);
  const orderId = body.payload?.payment?.entity?.order_id;
  const paymentId = body.payload?.payment?.entity?.id;
  if (!orderId) return NextResponse.json({ ok: true }); // nothing actionable, ack anyway

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
  if (!payment) return NextResponse.json({ ok: true }); // unknown order — nothing to reconcile here

  if (body.event === "payment.captured") {
    if (payment.status === "FULFILLED") return NextResponse.json({ ok: true }); // redelivery no-op

    const fulfilled = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "FULFILLED",
          razorpayPaymentId: paymentId,
          webhookReceivedAt: new Date(),
          fulfilledAt: new Date(),
        },
      });
      if (payment.creditApplied > 0) {
        await tx.user.update({
          where: { id: payment.userId },
          data: { creditBalance: { decrement: payment.creditApplied } },
        });
      }
      return updated;
    });

    await applyReferralCreditOnPurchase(fulfilled);
  } else if (body.event === "payment.failed") {
    if (payment.status !== "FULFILLED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", webhookReceivedAt: new Date() },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
