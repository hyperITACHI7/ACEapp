import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { getIntegration } from "@portfolio/integrations";

/** Re-syncs every portfolio with a connected GitHub integration. Run on a schedule (see
 *  cli.ts / README) since Render's free tier has no long-running background worker dyno. */
export async function run(): Promise<void> {
  const portfolios = await prisma.portfolio.findMany();
  const github = getIntegration("github")!;

  let synced = 0;
  for (const portfolio of portfolios) {
    const parsed = validatePortfolioData(portfolio.data);
    if (!parsed.success || !parsed.data.integrations.github) continue;

    const result = await github.sync(portfolio.id);
    console.log(`[github-resync] ${portfolio.username}: ${result.ok ? "ok" : "failed"} ${result.message ?? ""}`);
    synced++;
  }
  console.log(`[github-resync] done — ${synced} portfolio(s) with GitHub connected`);
}
