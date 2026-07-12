import Razorpay from "razorpay";
import { prisma } from "@portfolio/db";

const STALE_AFTER_MS = 10 * 60 * 1000; // check orders older than this
const GIVE_UP_AFTER_MS = 6 * 60 * 60 * 1000; // mark FAILED if still unresolved after this long
const REFERRAL_CREDIT_PAISE = 1000;

function getClient(): Razorpay {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID ?? "",
    key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
  });
}

/**
 * Duplicated (not imported) from apps/web/src/server/payments/referralService.ts — this job
 * runs as a separate process/deploy from the web app, so a small amount of duplication here is
 * simpler and safer than reaching across the app/service boundary.
 */
async function applyReferralCreditOnPurchase(payment: { id: string; userId: string }): Promise<void> {
  const referee = await prisma.user.findUnique({ where: { id: payment.userId } });
  if (!referee?.referredByUserId || referee.referredByUserId === referee.id) return;

  const existing = await prisma.referral.findUnique({
    where: { referrerUserId_refereeUserId: { referrerUserId: referee.referredByUserId, refereeUserId: referee.id } },
  });
  if (existing?.status === "CREDITED") return;

  await prisma.$transaction([
    prisma.referral.upsert({
      where: { referrerUserId_refereeUserId: { referrerUserId: referee.referredByUserId, refereeUserId: referee.id } },
      create: {
        referrerUserId: referee.referredByUserId,
        refereeUserId: referee.id,
        triggeringPaymentId: payment.id,
        status: "CREDITED",
        referrerCredit: REFERRAL_CREDIT_PAISE,
        refereeCredit: REFERRAL_CREDIT_PAISE,
        creditedAt: new Date(),
      },
      update: { status: "CREDITED", triggeringPaymentId: payment.id, creditedAt: new Date() },
    }),
    prisma.user.update({ where: { id: referee.referredByUserId }, data: { creditBalance: { increment: REFERRAL_CREDIT_PAISE } } }),
    prisma.user.update({ where: { id: referee.id }, data: { creditBalance: { increment: REFERRAL_CREDIT_PAISE } } }),
  ]);
}

/**
 * Catches the case where Razorpay captured a payment but our webhook never arrived (network
 * blip, deploy restart) — user must never be charged without receiving the theme
 * (edge_case.md §7). Reconciles by asking Razorpay directly rather than waiting indefinitely.
 */
export async function run(): Promise<void> {
  const client = getClient();
  const cutoff = new Date(Date.now() - STALE_AFTER_MS);
  const giveUpCutoff = new Date(Date.now() - GIVE_UP_AFTER_MS);

  const stalePayments = await prisma.payment.findMany({
    where: { status: "CREATED", createdAt: { lt: cutoff }, razorpayOrderId: { not: null } },
  });

  for (const payment of stalePayments) {
    try {
      const orderPayments = await client.orders.fetchPayments(payment.razorpayOrderId!);
      const captured = orderPayments.items.find((p: { status: string }) => p.status === "captured");

      if (captured) {
        console.log(`[payment-reconcile] ${payment.id}: found captured payment Razorpay-side, webhook must have been missed — fulfilling now`);
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID_UNFULFILLED" } });

        const fulfilled = await prisma.$transaction(async (tx) => {
          const updated = await tx.payment.update({
            where: { id: payment.id },
            data: { status: "FULFILLED", razorpayPaymentId: captured.id, fulfilledAt: new Date() },
          });
          if (payment.creditApplied > 0) {
            await tx.user.update({ where: { id: payment.userId }, data: { creditBalance: { decrement: payment.creditApplied } } });
          }
          return updated;
        });
        await applyReferralCreditOnPurchase(fulfilled);
      } else if (payment.createdAt < giveUpCutoff) {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
        console.log(`[payment-reconcile] ${payment.id}: no captured payment after ${GIVE_UP_AFTER_MS / 60000}min — marked FAILED`);
      }
    } catch (err) {
      console.error(`[payment-reconcile] ${payment.id}: error checking Razorpay`, err);
    }
  }

  console.log(`[payment-reconcile] done — checked ${stalePayments.length} stale payment(s)`);
}
