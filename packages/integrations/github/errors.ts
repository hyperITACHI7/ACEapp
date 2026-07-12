export class GithubUserNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user "${username}" not found`);
    this.name = "GithubUserNotFoundError";
  }
}

export class GithubRateLimitError extends Error {
  constructor() {
    super("GitHub API rate limit exceeded");
    this.name = "GithubRateLimitError";
  }
}
