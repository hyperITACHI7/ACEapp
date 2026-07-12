import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { getTheme } from "@portfolio/themes";
import { getCurrentUser } from "@/server/auth/session";
import { createRazorpayOrder } from "@/server/payments/razorpay";
import { applyReferralCreditOnPurchase } from "@/server/payments/referralService";
import { PENDING_ORDER_WINDOW_MS } from "@/server/payments/constants";

export async function POST(request: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const themeId: string | undefined = body?.themeId;
  if (!themeId) return NextResponse.json({ error: "themeId is required." }, { status: 400 });

  const theme = getTheme(themeId);
  if (!theme || !theme.manifest.isPremium) {
    return NextResponse.json({ error: "This theme doesn't require a purchase." }, { status: 400 });
  }

  // Block re-purchase of an already-owned theme BEFORE payment, not after (edge_case.md §7).
  const alreadyOwned = await prisma.payment.findFirst({
    where: { userId: sessionUser.id, themeId, status: "FULFILLED" },
  });
  if (alreadyOwned) return NextResponse.json({ error: "You already own this theme." }, { status: 409 });

  // Double-click guard: reuse a still-pending order from the last 15 minutes instead of
  // creating a second Razorpay order for the same purchase attempt.
  const pending = await prisma.payment.findFirst({
    where: {
      userId: sessionUser.id,
      themeId,
      status: "CREATED",
      createdAt: { gte: new Date(Date.now() - PENDING_ORDER_WINDOW_MS) },
    },
  });
  if (pending?.razorpayOrderId) {
    return NextResponse.json({
      orderId: pending.razorpayOrderId,
      amount: pending.amount,
      currency: pending.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const price = theme.manifest.priceInPaise;
  const creditToApply = Math.min(user.creditBalance, price); // never lets credit exceed the price
  const netAmount = price - creditToApply;

  if (netAmount === 0) {
    // Credit fully covers the price — skip Razorpay entirely and fulfill immediately.
    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          userId: user.id,
          themeId,
          amount: 0,
          creditApplied: creditToApply,
          status: "FULFILLED",
          idempotencyKey: crypto.randomUUID(),
          fulfilledAt: new Date(),
        },
      });
      await tx.user.update({ where: { id: user.id }, data: { creditBalance: { decrement: creditToApply } } });
      return created;
    });
    await applyReferralCreditOnPurchase(payment);
    return NextResponse.json({ fulfilled: true });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Payments aren't configured yet. Try again later." },
      { status: 503 }
    );
  }

  let order;
  try {
    order = await createRazorpayOrder(netAmount, `${user.id}-${themeId}-${Date.now()}`);
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json({ error: "Couldn't start checkout. Try again later." }, { status: 502 });
  }

  await prisma.payment.create({
    data: {
      userId: user.id,
      themeId,
      amount: netAmount,
      creditApplied: creditToApply,
      status: "CREATED",
      idempotencyKey: crypto.randomUUID(),
      razorpayOrderId: order.id,
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: netAmount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
