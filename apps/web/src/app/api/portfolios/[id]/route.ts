import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { getCurrentUser } from "@/server/auth/session";
import { userOwnsTheme } from "@/server/payments/ownership";

async function getOwnedPortfolio(userId: string, id: string) {
  return prisma.portfolio.findFirst({ where: { id, userId } });
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await getOwnedPortfolio(user.id, params.id);
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  return NextResponse.json({
    id: portfolio.id,
    name: portfolio.name,
    data: portfolio.data,
    version: portfolio.version,
    published: portfolio.published,
    publishedAt: portfolio.publishedAt,
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.expectedVersion !== "number") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validated = validatePortfolioData(body.data);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid portfolio data", issues: validated.error.issues }, { status: 400 });
  }

  const owns = await userOwnsTheme(user.id, validated.data.themeId);
  if (!owns) {
    return NextResponse.json({ error: "Purchase this theme before using it." }, { status: 402 });
  }

  const portfolio = await getOwnedPortfolio(user.id, params.id);
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  // Stale-edit detection: the editor must warn before overwriting newer server state
  // (edge_case.md §3) rather than silently clobbering a concurrent edit from another tab/device.
  if (portfolio.version !== body.expectedVersion) {
    return NextResponse.json(
      { error: "This portfolio was changed elsewhere.", currentVersion: portfolio.version },
      { status: 409 }
    );
  }

  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : undefined;

  const updated = await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { data: validated.data, version: { increment: 1 }, ...(name ? { name } : {}) },
  });

  return NextResponse.json({ version: updated.version });
}

/** Discards a portfolio completely. A user must always keep at least one (matches the
 *  onboarding-redirect assumption that every account has a portfolio to land on). */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await getOwnedPortfolio(user.id, params.id);
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const count = await prisma.portfolio.count({ where: { userId: user.id } });
  if (count <= 1) {
    return NextResponse.json({ error: "You must keep at least one portfolio." }, { status: 400 });
  }

  await prisma.portfolio.delete({ where: { id: portfolio.id } });
  return NextResponse.json({ ok: true });
}
