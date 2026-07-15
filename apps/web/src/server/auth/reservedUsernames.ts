// Blocklist enforced at signup/username-change time so a username never collides with an app
// route or reads as an official account (edge_case.md §8).
const RESERVED_USERNAMES = new Set([
  "admin", "api", "www", "app", "dashboard", "editor", "preview", "onboarding", "login", "signup",
  "logout", "static", "assets", "help", "support", "billing", "settings", "root", "mail",
  "blog", "null", "undefined", "favicon.ico", "robots.txt", "sitemap.xml",
]);

const USERNAME_PATTERN = /^[a-z0-9-]{3,30}$/;

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function validateUsername(username: string): { valid: boolean; reason?: string } {
  const normalized = username.toLowerCase();
  if (!isValidUsernameFormat(normalized)) {
    return { valid: false, reason: "Username must be 3-30 characters: lowercase letters, numbers, hyphens." };
  }
  if (isReservedUsername(normalized)) {
    return { valid: false, reason: "This username is reserved." };
  }
  return { valid: true };
}
