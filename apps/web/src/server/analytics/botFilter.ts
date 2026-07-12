const BOT_USER_AGENT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|semrush|ahrefs|mj12bot|python-requests|curl|wget|headlesschrome/i;

export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true; // no UA at all is far more likely a script than a browser
  return BOT_USER_AGENT_PATTERN.test(userAgent);
}
