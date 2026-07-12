import { prisma } from "@portfolio/db";
import { fetchUser, fetchRepoPage, type GithubRepo, type GithubProfile } from "./client";
import { GithubRateLimitError, GithubUserNotFoundError } from "./errors";

export interface RepoPickerPage {
  repos: GithubRepo[];
  fromCache: boolean;
  cachedAt?: string;
}

/**
 * Used by the "connect GitHub" / repo-picker UI. Paginated so hundreds of repos never load at
 * once (edge_case.md §4). On rate limit, falls back to the last cached fetch for this username
 * with a "try again later" signal instead of failing the whole picker.
 */
export async function listReposForPicker(username: string, page: number): Promise<RepoPickerPage> {
  try {
    const repos = await fetchRepoPage(username, page);
    if (page === 1) {
      await prisma.githubRepoCache.upsert({
        where: { username },
        create: { username, reposJson: repos as unknown as object, fetchedAt: new Date() },
        update: { reposJson: repos as unknown as object, fetchedAt: new Date() },
      });
    }
    return { repos, fromCache: false };
  } catch (err) {
    if (err instanceof GithubRateLimitError && page === 1) {
      const cached = await prisma.githubRepoCache.findUnique({ where: { username } });
      if (cached) {
        return {
          repos: cached.reposJson as unknown as GithubRepo[],
          fromCache: true,
          cachedAt: cached.fetchedAt.toISOString(),
        };
      }
    }
    throw err;
  }
}

export async function verifyGithubUsername(username: string): Promise<GithubProfile> {
  try {
    return await fetchUser(username);
  } catch (err) {
    if (err instanceof GithubUserNotFoundError) throw err;
    throw err;
  }
}
