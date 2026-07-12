import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { validatePortfolioData, type Project } from "@portfolio/schema";
import type { GithubRepo } from "@portfolio/integrations/github";
import { getCurrentUser } from "@/server/auth/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const repos: GithubRepo[] = body?.repos ?? [];
  const portfolioId = body?.portfolioId;
  if (repos.length === 0) return NextResponse.json({ error: "No repos selected." }, { status: 400 });
  if (!portfolioId) return NextResponse.json({ error: "portfolioId is required." }, { status: 400 });

  const portfolio = await prisma.portfolio.findFirst({ where: { id: portfolioId, userId: user.id } });
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const parsed = validatePortfolioData(portfolio.data);
  if (!parsed.success) return NextResponse.json({ error: "Draft data invalid" }, { status: 500 });

  const existingRepoIds = new Set(parsed.data.projects.map((p) => p.githubRepoId).filter(Boolean));
  const newProjects: Project[] = repos
    .filter((r) => !existingRepoIds.has(r.id))
    .map((r) => ({
      id: crypto.randomUUID(),
      title: r.name,
      description: r.description ?? "",
      images: [],
      links: [r.html_url],
      source: "github" as const,
      githubRepoId: r.id,
      editedFields: [],
      sourceUnavailable: false,
      tags: [],
      date: r.created_at ?? "",
    }));

  const nextData = {
    ...parsed.data,
    projects: [...parsed.data.projects, ...newProjects],
    meta: { ...parsed.data.meta, updatedAt: new Date().toISOString() },
  };

  const revalidated = validatePortfolioData(nextData);
  if (!revalidated.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const updated = await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { data: revalidated.data, version: { increment: 1 } },
  });

  return NextResponse.json({ ok: true, version: updated.version, imported: newProjects.length });
}
