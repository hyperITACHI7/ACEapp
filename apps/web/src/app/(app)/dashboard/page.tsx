import { redirect } from "next/navigation";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { getTheme } from "@portfolio/themes";
import { Card } from "@portfolio/ui-kit";
import { getCurrentUser } from "@/server/auth/session";
import { getAnalyticsSummary } from "@/server/analytics/summary";
import { computeHealthScore, getHealthStatus } from "@/lib/healthScore";
import { RecentPortfolios, type PortfolioSummary } from "./RecentPortfolios";
import { DashboardStats } from "./DashboardStats";
import { NewProjectButton } from "./NewProjectButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  if (portfolios.length === 0) redirect("/onboarding");

  const portfolioSummaries: PortfolioSummary[] = portfolios.map((p) => {
    const themeId =
      typeof (p.data as { themeId?: unknown })?.themeId === "string"
        ? (p.data as { themeId: string }).themeId
        : undefined;
    return {
      id: p.id,
      name: p.name,
      themeName: (themeId && getTheme(themeId)?.manifest.name) || "Unknown theme",
      published: p.published,
      updatedAt: p.updatedAt.toISOString(),
    };
  });

  const publishedPortfolio = portfolios.find((p) => p.published) ?? null;
  const parsed = publishedPortfolio ? validatePortfolioData(publishedPortfolio.data) : null;
  const { score, tips } = parsed?.success ? computeHealthScore(parsed.data) : { score: 0, tips: [] };
  const displayName = user.name ?? user.username ?? "there";

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
          <p className="text-sm font-body text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your portfolio.
          </p>
        </div>
        <NewProjectButton />
      </div>

      {publishedPortfolio ? (
        <PublishedPortfolioSection portfolioId={publishedPortfolio.id} score={score} username={publishedPortfolio.username} />
      ) : (
        <div className="text-center py-16 px-4">
          <h2 className="text-xl font-bold">Publish a portfolio to see traffic data</h2>
          <p className="text-sm font-body text-muted-foreground mt-2">
            Your dashboard will show visits, trends, and a health score for whichever portfolio is live.
          </p>
        </div>
      )}

      <RecentPortfolios portfolios={portfolioSummaries} tips={tips} hasPublishedPortfolio={Boolean(publishedPortfolio)} />

      <ReferralCard referralCode={user.referralCode} creditBalance={user.creditBalance} />
    </div>
  );
}

async function PublishedPortfolioSection({
  portfolioId,
  score,
  username,
}: {
  portfolioId: string;
  score: number;
  username: string;
}) {
  const summary = await getAnalyticsSummary(portfolioId);

  return (
    <DashboardStats
      todayViews={summary.todayViews}
      changePct={summary.changePct}
      hourlyViews={summary.hourlyViews}
      hourlyUniqueVisitors={summary.hourlyUniqueVisitors}
      todayUniqueVisitors={summary.todayUniqueVisitors}
      healthScore={score}
      healthStatus={getHealthStatus(score)}
      username={username}
    />
  );
}

function ReferralCard({ referralCode, creditBalance }: { referralCode: string; creditBalance: number }) {
  return (
    <Card className="bg-panel backdrop-blur-none">
      <h3 className="text-base font-semibold">Invite friends</h3>
      <p className="text-sm font-body text-muted-foreground mt-1">
        Share your link — when someone you refer buys a theme, you both get ₹10 off your next one.
      </p>
      <p className="font-mono text-sm mt-2 text-foreground">?ref={referralCode}</p>
      <p className="text-sm mt-1">Your credit balance: ₹{creditBalance / 100}</p>
    </Card>
  );
}
