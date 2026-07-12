import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { isReservedUsername } from "@/server/auth/reservedUsernames";
import { recordPageView } from "@/server/analytics/track";
import { PortfolioRenderer } from "@/lib/portfolioRenderer";

// Free cold-start resilience + a natural cache window that also caps analytics write volume
// during a traffic spike (edge_case.md §6/§8) — undercounting within the window is acceptable.
export const revalidate = 60;

interface PageProps {
  params: { username: string };
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const username = params.username.toLowerCase();

  if (isReservedUsername(username)) notFound();

  const portfolio = await prisma.portfolio.findFirst({ where: { username, published: true } });
  if (!portfolio || !portfolio.publishedData) notFound();

  const validated = validatePortfolioData(portfolio.publishedData);
  if (!validated.success) {
    // Corrupted published snapshot — degrade gracefully rather than crash the page
    // (edge_case.md §8). This should only happen if data was written outside the validated
    // publish path.
    return (
      <div className="theme-degraded-notice">
        <h1>This portfolio is temporarily unavailable</h1>
        <p>The owner needs to republish. Please check back soon.</p>
      </div>
    );
  }

  // Fire-and-forget: ingestion failures must never be visible to the visitor.
  void recordPageView(portfolio.id, headers()).catch(() => {});

  return <PortfolioRenderer data={validated.data} />;
}
