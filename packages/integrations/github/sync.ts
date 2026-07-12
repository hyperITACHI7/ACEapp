import { prisma } from "@portfolio/db";
import { validatePortfolioData, type PortfolioData, type Project } from "@portfolio/schema";
import { fetchRepoByFullName } from "./client";
import { GithubRateLimitError } from "./errors";

function parseFullNameFromRepoUrl(url: string): string | null {
  const match = url.match(/github\.com\/([^/]+\/[^/]+)\/?$/);
  return match ? match[1] : null;
}

export interface SyncResult {
  ok: boolean;
  message?: string;
}

/**
 * Re-fetches every pinned github-sourced project for a portfolio. Never overwrites a field the
 * user has manually edited (tracked per-project in `editedFields`), flags a project whose repo
 * has gone private/been deleted as `sourceUnavailable` instead of producing a dead public link,
 * and on rate-limit leaves existing data untouched and reports back rather than failing loudly
 * (edge_case.md §4).
 */
export async function syncPinnedGithubProjects(portfolioId: string): Promise<SyncResult> {
  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
  if (!portfolio) return { ok: false, message: "Portfolio not found" };

  const parsed = validatePortfolioData(portfolio.data);
  if (!parsed.success) return { ok: false, message: "Draft data failed validation; skipping sync" };

  const data = parsed.data;
  const github = data.integrations.github;
  if (!github) return { ok: false, message: "GitHub not connected" };

  let rateLimited = false;

  const updatedProjects: Project[] = await Promise.all(
    data.projects.map(async (project) => {
      if (project.source !== "github") return project;

      const fullName = project.links[0] ? parseFullNameFromRepoUrl(project.links[0]) : null;
      if (!fullName) return { ...project, sourceUnavailable: true };

      if (rateLimited) return project; // stop hammering the API once we've hit the limit once

      try {
        const repo = await fetchRepoByFullName(fullName);
        if (!repo) {
          return { ...project, sourceUnavailable: true };
        }
        return {
          ...project,
          sourceUnavailable: false,
          title: project.editedFields.includes("title") ? project.title : repo.name,
          description: project.editedFields.includes("description")
            ? project.description
            : repo.description ?? "",
          links: project.editedFields.includes("links") ? project.links : [repo.html_url],
          date: project.editedFields.includes("date") ? project.date : repo.created_at ?? "",
        };
      } catch (err) {
        if (err instanceof GithubRateLimitError) {
          rateLimited = true;
          return project;
        }
        throw err;
      }
    })
  );

  const nextData: PortfolioData = {
    ...data,
    projects: updatedProjects,
    integrations: {
      ...data.integrations,
      github: {
        ...github,
        status: rateLimited ? "rate_limited" : "connected",
        lastSyncedAt: new Date().toISOString(),
      },
    },
    meta: { ...data.meta, updatedAt: new Date().toISOString() },
  };

  const revalidated = validatePortfolioData(nextData);
  if (!revalidated.success) {
    return { ok: false, message: "Post-sync data failed validation; sync discarded" };
  }

  await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      data: revalidated.data,
      version: { increment: 1 },
      // If already published, push the refreshed pinned-repo data straight to the public
      // snapshot too, so users don't have to manually republish just to pick up a repo update.
      ...(portfolio.published ? { publishedData: revalidated.data } : {}),
    },
  });

  return rateLimited
    ? { ok: true, message: "Synced with some repos rate-limited; will retry next run" }
    : { ok: true };
}
