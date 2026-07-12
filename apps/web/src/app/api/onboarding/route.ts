import { NextResponse } from "next/server";
import { prisma } from "@portfolio/db";
import { getCurrentUser } from "@/server/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await prisma.portfolio.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({
    onboardingState: user.onboardingState ?? {},
    onboardingCompleted: Boolean(user.onboardingCompletedAt),
    alreadyPublished: portfolio?.published ?? false,
  });
}

// Persists partial quiz answers on every step change so abandoning mid-quiz and coming back
// resumes instead of restarting (edge_case.md §1).
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const existing = (user.onboardingState as Record<string, unknown> | null) ?? {};
  const merged = { ...existing, ...body };

  await prisma.user.update({ where: { id: user.id }, data: { onboardingState: merged } });
  return NextResponse.json({ onboardingState: merged });
}
