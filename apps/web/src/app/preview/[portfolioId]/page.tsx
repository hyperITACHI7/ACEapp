import { notFound, redirect } from "next/navigation";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { getCurrentUser } from "@/server/auth/session";
import { PortfolioRenderer } from "@/lib/portfolioRenderer";

// Owner-only live preview of the DRAFT (`data`, the editor's autosaved working copy) — unlike
// `/[username]`, which renders the `publishedData` snapshot. Lets the owner see the real page
// full-screen before publishing. Never cached: the draft changes on every editor keystroke.
export const dynamic = "force-dynamic";

interface PageProps {
  params: { portfolioId: string };
}

export default async function DraftPreviewPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const portfolio = await prisma.portfolio.findFirst({
    where: { id: params.portfolioId, userId: user.id },
  });
  if (!portfolio) notFound();

  const validated = validatePortfolioData(portfolio.data);
  if (!validated.success) {
    return (
      <div className="theme-degraded-notice">
        <h1>This draft can&apos;t be previewed</h1>
        <p>The draft data failed validation — try editing and saving again.</p>
      </div>
    );
  }

  return <PortfolioRenderer data={validated.data} />;
}
