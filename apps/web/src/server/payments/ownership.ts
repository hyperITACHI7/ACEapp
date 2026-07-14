import { prisma } from "@portfolio/db";
import { getTheme, listThemes } from "@portfolio/themes";

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

/** Bulk version of `userOwnsTheme`, for pages that need "which of all themes does this user
 *  own" in one query (Explore/Assets) rather than checking one theme at a time. */
export async function listOwnedThemeIds(userId: string): Promise<Set<string>> {
  const allThemes = listThemes();
  const devUnlockAll = process.env.DEV_UNLOCK_ALL_THEMES === "true";
  if (devUnlockAll) return new Set(allThemes.map((t) => t.manifest.id));

  const freeThemeIds = allThemes.filter((t) => !t.manifest.isPremium).map((t) => t.manifest.id);
  const fulfilled = await prisma.payment.findMany({
    where: { userId, status: "FULFILLED" },
    select: { themeId: true },
    distinct: ["themeId"],
  });
  return new Set([...freeThemeIds, ...fulfilled.map((p) => p.themeId)]);
}
