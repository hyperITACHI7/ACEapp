import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { verifyGithubUsername, GithubUserNotFoundError } from "@portfolio/integrations/github";
import { getCurrentUser } from "@/server/auth/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const username = body?.username?.trim();
  const portfolioId = body?.portfolioId;
  if (!username) return NextResponse.json({ error: "GitHub username is required." }, { status: 400 });
  if (!portfolioId) return NextResponse.json({ error: "portfolioId is required." }, { status: 400 });

  try {
    await verifyGithubUsername(username);
  } catch (err) {
    if (err instanceof GithubUserNotFoundError) {
      return NextResponse.json({ error: `GitHub user "${username}" not found.` }, { status: 404 });
    }
    return NextResponse.json({ error: "Couldn't verify this GitHub username. Try again later." }, { status: 502 });
  }

  const portfolio = await prisma.portfolio.findFirst({ where: { id: portfolioId, userId: user.id } });
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const parsed = validatePortfolioData(portfolio.data);
  if (!parsed.success) return NextResponse.json({ error: "Draft data invalid" }, { status: 500 });

  const nextData = {
    ...parsed.data,
    integrations: {
      ...parsed.data.integrations,
      github: {
        username,
        connectedAt: new Date().toISOString(),
        lastSyncedAt: null,
        status: "connected" as const,
      },
    },
    meta: { ...parsed.data.meta, updatedAt: new Date().toISOString() },
  };

  const revalidated = validatePortfolioData(nextData);
  if (!revalidated.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { data: revalidated.data, version: { increment: 1 } },
  });

  return NextResponse.json({ ok: true, username });
}
