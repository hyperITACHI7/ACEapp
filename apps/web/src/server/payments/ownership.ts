import { prisma } from "@portfolio/db";
import { getTheme } from "@portfolio/themes";

/** Free themes are always "owned"; premium themes require a FULFILLED payment row. */
export async function userOwnsTheme(userId: string, themeId: string): Promise<boolean> {
  const theme = getTheme(themeId);
  if (!theme) return false;
  // Dev/test-only escape hatch — unset (or != "true") in any real deploy so the paywall
  // actually gates purchases; see .env.example.
  if (process.env.DEV_UNLOCK_ALL_THEMES === "true") return true;
  if (!theme.manifest.isPremium) return true;

  const payment = await prisma.payment.findFirst({
    where: { userId, themeId, status: "FULFILLED" },
    select: { id: true },
  });
  return Boolean(payment);
}
