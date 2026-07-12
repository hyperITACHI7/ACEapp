import { redirect } from "next/navigation";
import { prisma } from "@portfolio/db";
import { getCurrentUser } from "@/server/auth/session";

/** Bare `/editor` (kept for old links/bookmarks and the nav bar) resolves to a specific
 *  portfolio: the published one if there is one, else the most recently updated draft. */
export default async function EditorRedirectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const portfolio =
    (await prisma.portfolio.findFirst({ where: { userId: user.id, published: true } })) ??
    (await prisma.portfolio.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }));

  if (!portfolio) redirect("/onboarding");
  redirect(`/editor/${portfolio.id}`);
}
