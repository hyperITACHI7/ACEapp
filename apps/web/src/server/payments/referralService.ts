import { prisma } from "@portfolio/db";
import { REFERRAL_CREDIT_PAISE } from "./constants";

/**
 * Credits both sides ONLY on a successful referred purchase — never at signup (edge_case.md
 * §7). Idempotent (a Referral row is unique per referrer/referee pair and only ever credited
 * once); self-referral is structurally impossible here since `referredByUserId` can't equal the
 * user's own id (enforced at signup — a user can't apply their own referral code to themselves).
 */
export async function applyReferralCreditOnPurchase(payment: { id: string; userId: string }): Promise<void> {
  const referee = await prisma.user.findUnique({ where: { id: payment.userId } });
  if (!referee?.referredByUserId) return;
  if (referee.referredByUserId === referee.id) return; // defensive: self-referral guard

  const existing = await prisma.referral.findUnique({
    where: { referrerUserId_refereeUserId: { referrerUserId: referee.referredByUserId, refereeUserId: referee.id } },
  });
  if (existing?.status === "CREDITED") return; // already credited — webhook redelivery safe no-op

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
      update: {
        status: "CREDITED",
        triggeringPaymentId: payment.id,
        referrerCredit: REFERRAL_CREDIT_PAISE,
        refereeCredit: REFERRAL_CREDIT_PAISE,
        creditedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: referee.referredByUserId },
      data: { creditBalance: { increment: REFERRAL_CREDIT_PAISE } },
    }),
    prisma.user.update({
      where: { id: referee.id },
      data: { creditBalance: { increment: REFERRAL_CREDIT_PAISE } },
    }),
  ]);
}
