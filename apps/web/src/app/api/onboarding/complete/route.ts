import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { validatePortfolioData, emptyPortfolioData, type PortfolioData } from "@portfolio/schema";
import { getTheme, DEFAULT_THEME_ID, applyBlueprint } from "@portfolio/themes";
import { getCurrentUser } from "@/server/auth/session";
import { userOwnsTheme } from "@/server/payments/ownership";

interface CompleteBody {
  themeId?: string;
  confirmReset?: boolean;
  profile?: { name?: string; headline?: string; bio?: string; domain?: string };
  skills?: string[];
  experience?: Array<{ role: string; org: string; dates?: string; description?: string }>;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as CompleteBody | null;
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  // Onboarding only ever runs against a user's first (at signup time, only) portfolio.
  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  // Re-running onboarding on an already-published portfolio must never silently overwrite it
  // (edge_case.md §1) — the client must explicitly confirm first.
  if (portfolio.published && !body.confirmReset) {
    return NextResponse.json({ error: "confirm_required", message: "You already have a published portfolio." }, { status: 409 });
  }

  const themeId = body.themeId ?? DEFAULT_THEME_ID;
  const theme = getTheme(themeId) ?? getTheme(DEFAULT_THEME_ID)!;

  const owns = await userOwnsTheme(user.id, themeId);
  if (!owns) {
    return NextResponse.json({ error: "Purchase this theme before using it." }, { status: 402 });
  }

  const current = validatePortfolioData(portfolio.data);
  const rawBase: PortfolioData = current.success
    ? current.data
    : emptyPortfolioData(themeId, theme.manifest.defaultPalette);

  // If this is still a genuinely untouched portfolio (no widgets yet) and the chosen theme ships
  // a blueprint, start from the blueprint's full sample content instead of a bare empty
  // portfolio — the onboarding answers below still take priority over any blueprint sample value
  // (see the `body.profile?.x ?? base.profile.x` chains just below).
  const base: PortfolioData =
    theme.blueprint && rawBase.widgets.length === 0
      ? applyBlueprint(themeId, theme.manifest.defaultPalette, theme.blueprint)
      : rawBase;

  const nextData: PortfolioData = {
    ...base,
    themeId,
    palette: theme.manifest.palettes.includes(base.palette) ? base.palette : theme.manifest.defaultPalette,
    profile: {
      ...base.profile,
      name: body.profile?.name ?? base.profile.name,
      headline: body.profile?.headline ?? base.profile.headline,
      bio: body.profile?.bio ?? base.profile.bio,
      domain: body.profile?.domain ?? base.profile.domain,
    },
    skills: body.skills && body.skills.length > 0 ? body.skills : base.skills,
    experience:
      body.experience && body.experience.length > 0
        ? body.experience.map((e) => ({
            role: e.role,
            org: e.org,
            dates: e.dates ?? "",
            description: e.description ?? "",
            source: "manual" as const,
            tags: [],
          }))
        : base.experience,
    // Default widget set on first completion: whichever sections/styles the chosen theme
    // defaults to (about + skills + experience-timeline + gallery, in that order, when present).
    widgets:
      base.widgets.length > 0
        ? base.widgets
        : ["about", "skills", "experience-timeline", "gallery"]
            .filter((section) => theme.manifest.defaultWidgetKeys[section])
            .map((section, i) => ({
              key: theme.manifest.defaultWidgetKeys[section],
              order: i,
              visible: true,
              config: {},
            })),
    meta: { ...base.meta, updatedAt: new Date().toISOString() },
  };

  const validated = validatePortfolioData(nextData);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid portfolio data", issues: validated.error.issues }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { data: validated.data, version: { increment: 1 } },
    }),
    prisma.user.update({ where: { id: user.id }, data: { onboardingCompletedAt: new Date() } }),
  ]);

  return NextResponse.json({ ok: true });
}
