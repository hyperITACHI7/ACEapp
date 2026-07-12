import { redirect } from "next/navigation";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { getTheme } from "@portfolio/themes";
import { Card } from "@portfolio/ui-kit";
import { getCurrentUser } from "@/server/auth/session";
import { getAnalyticsSummary } from "@/server/analytics/summary";
import { computeHealthScore } from "@/lib/healthScore";
import { PortfolioList, type PortfolioSummary } from "./PortfolioList";

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

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <PortfolioList portfolios={portfolioSummaries} />

      {!publishedPortfolio ? (
        <div className="text-center py-16 px-4">
          <h2 className="text-xl font-bold">Publish a portfolio to see traffic data</h2>
          <p className="text-sm font-body text-muted-foreground mt-2">
            Your dashboard will show visits, trends, and a health score for whichever portfolio is live.
          </p>
        </div>
      ) : (
        <PublishedPortfolioAnalytics portfolioId={publishedPortfolio.id} score={score} tips={tips} />
      )}

      <ReferralCard referralCode={user.referralCode} creditBalance={user.creditBalance} />
    </div>
  );
}

async function PublishedPortfolioAnalytics({
  portfolioId,
  score,
  tips,
}: {
  portfolioId: string;
  score: number;
  tips: { label: string }[];
}) {
  const summary = await getAnalyticsSummary(portfolioId);
  const maxViews = Math.max(1, ...summary.daily.map((d) => d.views));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {summary.totalViews}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total views (30d)</div>
        </Card>
        <Card>
          <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {summary.totalUniqueVisitors}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Unique visitors (30d)</div>
        </Card>
        <Card>
          <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {score}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Health score</div>
        </Card>
      </div>

      <Card>
        <h3 className="text-base font-semibold mb-4">Views, last 30 days</h3>
        <div className="flex items-end gap-1 h-32">
          {summary.daily.map((d) => (
            <div
              key={d.date}
              title={`${d.date}: ${d.views} views`}
              className="w-2 rounded-sm bg-gradient-to-t from-purple-500 to-cyan-400"
              style={{ height: `${Math.max(4, (d.views / maxViews) * 100)}%` }}
            />
          ))}
        </div>
      </Card>

      {tips.length > 0 && (
        <Card>
          <h3 className="text-base font-semibold mb-2">Ways to improve</h3>
          {tips.map((tip) => (
            <div key={tip.label} className="text-sm text-muted-foreground py-1.5 border-b border-white/5 last:border-0">
              {tip.label}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function ReferralCard({ referralCode, creditBalance }: { referralCode: string; creditBalance: number }) {
  return (
    <Card>
      <h3 className="text-base font-semibold">Invite friends</h3>
      <p className="text-sm font-body text-muted-foreground mt-1">
        Share your link — when someone you refer buys a theme, you both get ₹10 off your next one.
      </p>
      <p className="font-mono text-sm mt-2 text-cyan-400">?ref={referralCode}</p>
      <p className="text-sm mt-1">Your credit balance: ₹{creditBalance / 100}</p>
    </Card>
  );
}
