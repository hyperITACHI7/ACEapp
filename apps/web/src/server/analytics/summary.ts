import { prisma } from "@portfolio/db";

export interface DailyPoint {
  date: string;
  views: number;
  uniqueVisitors: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalUniqueVisitors: number;
  daily: DailyPoint[];
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

/**
 * Rollups cover everything through yesterday; today's not-yet-rolled-up events are aggregated
 * live so the dashboard doesn't have a same-day gap.
 */
export async function getAnalyticsSummary(portfolioId: string): Promise<AnalyticsSummary> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);

  const rollups = await prisma.analyticsDailyRollup.findMany({
    where: { portfolioId, date: { gte: startOfDay(since) } },
    orderBy: { date: "asc" },
  });

  const todayStart = startOfDay(new Date());
  const todaysEvents = await prisma.analyticsEvent.findMany({
    where: { portfolioId, isBot: false, createdAt: { gte: todayStart } },
    select: { visitorHash: true },
  });
  const todayViews = todaysEvents.length;
  const todayUnique = new Set(todaysEvents.map((e) => e.visitorHash)).size;

  const daily: DailyPoint[] = [
    ...rollups.map((r) => ({ date: r.date.toISOString().slice(0, 10), views: r.views, uniqueVisitors: r.uniqueVisitors })),
    { date: todayStart.toISOString().slice(0, 10), views: todayViews, uniqueVisitors: todayUnique },
  ];

  return {
    totalViews: daily.reduce((sum, d) => sum + d.views, 0),
    totalUniqueVisitors: daily.reduce((sum, d) => sum + d.uniqueVisitors, 0),
    daily,
  };
}
