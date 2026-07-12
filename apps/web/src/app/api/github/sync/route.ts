import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { getIntegration } from "@portfolio/integrations";
import { getCurrentUser } from "@/server/auth/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const portfolioId = body?.portfolioId;
  if (!portfolioId) return NextResponse.json({ error: "portfolioId is required." }, { status: 400 });

  const portfolio = await prisma.portfolio.findFirst({ where: { id: portfolioId, userId: user.id } });
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const github = getIntegration("github")!;
  const result = await github.sync(portfolio.id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
