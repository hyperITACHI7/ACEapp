import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { getCurrentUser } from "@/server/auth/session";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await prisma.portfolio.findFirst({ where: { id: params.id, userId: user.id } });
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  // Publishing is intentionally never blocked by empty required fields (edge_case.md §3) —
  // the health score nudges the user instead. Publish is the ONLY writer of `publishedData`.
  const validated = validatePortfolioData(portfolio.data);
  if (!validated.success) {
    return NextResponse.json({ error: "Current draft failed validation; fix errors before publishing." }, { status: 400 });
  }

  const now = new Date();
  const publishedData = {
    ...validated.data,
    meta: { ...validated.data.meta, published: true, publishedAt: now.toISOString() },
  };

  // At most one published portfolio per user at a time — publishing this one un-publishes
  // whichever other portfolio for this account was previously live.
  await prisma.$transaction([
    prisma.portfolio.updateMany({
      where: { userId: user.id, published: true, id: { not: portfolio.id } },
      data: { published: false },
    }),
    prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        published: true,
        publishedAt: now,
        publishedData,
        data: publishedData,
        version: { increment: 1 },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, publishedAt: now.toISOString() });
}
