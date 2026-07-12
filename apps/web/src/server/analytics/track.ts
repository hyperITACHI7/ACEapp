import { createHash } from "crypto";
import { prisma } from "@portfolio/db";
import { isBotUserAgent } from "./botFilter";

function dayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function hashVisitor(ip: string, userAgent: string): string {
  // No raw IP is ever stored — only a one-way hash salted with the current day, so it can't be
  // correlated across days and never identifies a real visitor.
  return createHash("sha256").update(`${ip}|${userAgent}|${dayKey()}`).digest("hex");
}

/**
 * Called (fire-and-forget, `.catch(() => {})`) from the public portfolio page. Ingestion
 * failures must be invisible to the visitor by construction (edge_case.md §6) — this function
 * throwing is only ever caught by the caller, never surfaced.
 */
export async function recordPageView(portfolioId: string, headers: Headers): Promise<void> {
  const userAgent = headers.get("user-agent") ?? "";
  const ip = headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const referrer = headers.get("referer") ?? undefined;

  await prisma.analyticsEvent.create({
    data: {
      portfolioId,
      type: "page_view",
      visitorHash: hashVisitor(ip, userAgent),
      isBot: isBotUserAgent(userAgent),
      path: "/",
      referrer,
      userAgent: userAgent.slice(0, 300),
    },
  });
}
