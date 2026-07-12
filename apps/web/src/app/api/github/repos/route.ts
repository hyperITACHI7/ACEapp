import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { listReposForPicker, GithubRateLimitError } from "@portfolio/integrations/github";
import { getCurrentUser } from "@/server/auth/session";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const portfolioId = url.searchParams.get("portfolioId");
  if (!portfolioId) return NextResponse.json({ error: "portfolioId is required." }, { status: 400 });

  const portfolio = await prisma.portfolio.findFirst({ where: { id: portfolioId, userId: user.id } });
  const parsed = portfolio ? validatePortfolioData(portfolio.data) : null;
  const username = parsed?.success ? parsed.data.integrations.github?.username : undefined;
  if (!username) return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });

  try {
    const page1 = await listReposForPicker(username, page);
    return NextResponse.json(page1);
  } catch (err) {
    if (err instanceof GithubRateLimitError) {
      return NextResponse.json({ error: "GitHub rate limit reached. Try again later." }, { status: 429 });
    }
    return NextResponse.json({ error: "Couldn't fetch repos." }, { status: 502 });
  }
}
