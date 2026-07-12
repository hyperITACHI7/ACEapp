import { redirect, notFound } from "next/navigation";
import { prisma } from "@portfolio/db";
import { validatePortfolioData } from "@portfolio/schema";
import { getCurrentUser } from "@/server/auth/session";
import { EditorClient } from "../EditorClient";

interface EditorPageProps {
  params: { portfolioId: string };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const portfolio = await prisma.portfolio.findFirst({
    where: { id: params.portfolioId, userId: user.id },
  });
  if (!portfolio) notFound();

  const validated = validatePortfolioData(portfolio.data);
  if (!validated.success) {
    // Draft data is corrupted somehow — send the user back through onboarding to rebuild it
    // rather than showing a broken editor.
    redirect("/onboarding");
  }

  return (
    <EditorClient
      portfolioId={portfolio.id}
      initialData={validated.data}
      initialVersion={portfolio.version}
      published={portfolio.published}
    />
  );
}
