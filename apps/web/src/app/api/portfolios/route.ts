import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { emptyPortfolioData } from "@portfolio/schema";
import { getTheme, DEFAULT_THEME_ID } from "@portfolio/themes";
import { getCurrentUser } from "@/server/auth/session";
import { userOwnsTheme } from "@/server/payments/ownership";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    portfolios: portfolios.map((p) => {
      const themeId =
        typeof (p.data as { themeId?: unknown })?.themeId === "string"
          ? (p.data as { themeId: string }).themeId
          : undefined;
      return {
        id: p.id,
        name: p.name,
        username: p.username,
        themeId,
        themeName: themeId ? getTheme(themeId)?.manifest.name : undefined,
        published: p.published,
        updatedAt: p.updatedAt,
      };
    }),
  });
}

/** Creates a bare new draft — deliberately skips the onboarding quiz (that stays reserved for
 *  a user's very first portfolio) so adding another one is a single low-friction action. The
 *  caller picks a theme up front (defaults to the free default theme if omitted); the theme
 *  must already be owned (free or purchased) — this mirrors the same check the PATCH route
 *  applies so a freshly-created portfolio is never stuck unable to save its own first edit. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.username) return NextResponse.json({ error: "Account is missing a username." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : undefined;
  const themeId = typeof body?.themeId === "string" && body.themeId ? body.themeId : DEFAULT_THEME_ID;

  const theme = getTheme(themeId);
  if (!theme) return NextResponse.json({ error: "Unknown theme." }, { status: 400 });

  const owns = await userOwnsTheme(user.id, themeId);
  if (!owns) {
    return NextResponse.json({ error: "Purchase this theme before using it." }, { status: 402 });
  }

  const data = emptyPortfolioData(themeId, theme.manifest.defaultPalette);

  const portfolio = await prisma.portfolio.create({
    data: {
      userId: user.id,
      username: user.username,
      ...(name ? { name } : {}),
      data,
    },
  });

  return NextResponse.json({ id: portfolio.id });
}
