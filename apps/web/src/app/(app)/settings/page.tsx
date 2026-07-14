import { redirect } from "next/navigation";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { getCurrentUser } from "@/server/auth/session";
import { PersonalInfoCard } from "./PersonalInfoCard";
import { IntegrationsCard } from "./IntegrationsCard";
import { NotificationsCard } from "./NotificationsCard";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Same "primary portfolio" resolution as the bare `/editor` redirect: published if there is
  // one, else the most-recently-updated draft. GitHub's connection lives on this portfolio's
  // own data (see api/github/connect), not on the account, since that's how it's stored today.
  const primaryPortfolio =
    (await prisma.portfolio.findFirst({ where: { userId: user.id, published: true } })) ??
    (await prisma.portfolio.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }));

  const parsed = primaryPortfolio ? validatePortfolioData(primaryPortfolio.data) : null;
  const github = parsed?.success ? parsed.data.integrations.github ?? null : null;

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm font-body text-muted-foreground mt-1">
          Manage your account&apos;s preferences and creative ecosystem.
        </p>
      </div>

      <PersonalInfoCard
        name={user.name}
        username={user.username}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />

      <IntegrationsCard portfolioId={primaryPortfolio?.id ?? null} github={github} />

      <NotificationsCard
        emailDigestEnabled={user.emailDigestEnabled}
        securityAlertsEnabled={user.securityAlertsEnabled}
      />
    </div>
  );
}
