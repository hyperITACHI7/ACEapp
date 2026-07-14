import { prisma } from "@portfolio/db";

const BUCKET_HOURS = 4;
const BUCKET_COUNT = 24 / BUCKET_HOURS;

export interface AnalyticsSummary {
  todayViews: number;
  todayUniqueVisitors: number;
  changePct: number | null;
  /** Today, split into 4-hour buckets (6 total) for the dashboard's intraday trend charts. */
  hourlyViews: number[];
  hourlyUniqueVisitors: number[];
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

/**
 * All stats are for today (UTC) only, aggregated live from raw events since today isn't rolled
 * up yet. The day-over-day change compares against yesterday's completed rollup.
 */
export async function getAnalyticsSummary(portfolioId: string): Promise<AnalyticsSummary> {
  const todayStart = startOfDay(new Date());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);

  const [todaysEvents, yesterdayRollup] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { portfolioId, isBot: false, createdAt: { gte: todayStart } },
      select: { createdAt: true, visitorHash: true },
    }),
    prisma.analyticsDailyRollup.findFirst({
      where: { portfolioId, date: yesterdayStart },
      select: { views: true },
    }),
  ]);

  const hourlyViews = Array<number>(BUCKET_COUNT).fill(0);
  const bucketVisitors: Set<string>[] = Array.from({ length: BUCKET_COUNT }, () => new Set());
  for (const event of todaysEvents) {
    const bucket = Math.min(Math.floor(event.createdAt.getUTCHours() / BUCKET_HOURS), BUCKET_COUNT - 1);
    hourlyViews[bucket] += 1;
    bucketVisitors[bucket].add(event.visitorHash);
  }
  const hourlyUniqueVisitors = bucketVisitors.map((s) => s.size);

  const todayViews = todaysEvents.length;
  const todayUniqueVisitors = new Set(todaysEvents.map((e) => e.visitorHash)).size;

  const yesterdayViews = yesterdayRollup?.views ?? 0;
  const changePct = yesterdayViews > 0 ? Math.round(((todayViews - yesterdayViews) / yesterdayViews) * 100) : null;

  return { todayViews, todayUniqueVisitors, changePct, hourlyViews, hourlyUniqueVisitors };
}
