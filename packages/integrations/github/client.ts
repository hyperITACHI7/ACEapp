import { GithubUserNotFoundError, GithubRateLimitError } from "./errors";

const GITHUB_API_BASE = "https://api.github.com";

export interface GithubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  fork: boolean;
  private: boolean;
  updated_at: string;
  created_at: string;
  pushed_at: string;
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function githubFetch(path: string, username: string): Promise<Response> {
  const res = await fetch(`${GITHUB_API_BASE}${path}`, { headers: githubHeaders() });
  if (res.status === 404) throw new GithubUserNotFoundError(username);
  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    throw new GithubRateLimitError();
  }
  if (!res.ok) throw new Error(`GitHub API error ${res.status} for ${path}`);
  return res;
}

export async function fetchUser(username: string): Promise<GithubProfile> {
  const res = await githubFetch(`/users/${encodeURIComponent(username)}`, username);
  return res.json();
}

/** Paginated — callers must page through rather than requesting everything at once. */
export async function fetchRepoPage(
  username: string,
  page: number,
  perPage = 30
): Promise<GithubRepo[]> {
  const res = await githubFetch(
    `/users/${encodeURIComponent(username)}/repos?page=${page}&per_page=${perPage}&sort=updated`,
    username
  );
  const repos: GithubRepo[] = await res.json();
  return repos.filter((r) => !r.fork && !r.private);
}

/** Fetches a single repo by full name; used by the resync job to check if a pinned repo is still public. */
export async function fetchRepoByFullName(fullName: string): Promise<GithubRepo | null> {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${fullName}`, { headers: githubHeaders() });
  if (res.status === 404) return null;
  if (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0") {
    throw new GithubRateLimitError();
  }
  if (!res.ok) throw new Error(`GitHub API error ${res.status} for repos/${fullName}`);
  const repo: GithubRepo = await res.json();
  return repo.private ? null : repo;
}
