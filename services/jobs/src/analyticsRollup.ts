import { prisma } from "@portfolio/db";

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

/** Rolls up non-bot AnalyticsEvent rows from before today into AnalyticsDailyRollup, per
 *  portfolio per day. Idempotent (upsert) so it's safe to run more than once for the same day. */
export async function run(): Promise<void> {
  const todayStart = startOfDay(new Date());

  const events = await prisma.analyticsEvent.groupBy({
    by: ["portfolioId"],
    where: { isBot: false, createdAt: { lt: todayStart } },
  });

  let rolledUp = 0;
  for (const { portfolioId } of events) {
    const unrolled = await prisma.analyticsEvent.findMany({
      where: { portfolioId, isBot: false, createdAt: { lt: todayStart } },
      select: { visitorHash: true, createdAt: true },
    });

    const byDay = new Map<string, { views: number; visitors: Set<string> }>();
    for (const e of unrolled) {
      const key = startOfDay(e.createdAt).toISOString();
      const bucket = byDay.get(key) ?? { views: 0, visitors: new Set<string>() };
      bucket.views += 1;
      bucket.visitors.add(e.visitorHash);
      byDay.set(key, bucket);
    }

    for (const [dayIso, bucket] of byDay) {
      await prisma.analyticsDailyRollup.upsert({
        where: { portfolioId_date: { portfolioId, date: new Date(dayIso) } },
        create: { portfolioId, date: new Date(dayIso), views: bucket.views, uniqueVisitors: bucket.visitors.size },
        update: { views: bucket.views, uniqueVisitors: bucket.visitors.size },
      });
      rolledUp++;
    }

    // Rolled-up events are safe to prune — historical totals now live in the rollup table,
    // keyed only by portfolioId/date, so this can never corrupt aggregate totals.
    await prisma.analyticsEvent.deleteMany({ where: { portfolioId, isBot: false, createdAt: { lt: todayStart } } });
  }

  console.log(`[analytics-rollup] done — ${rolledUp} portfolio-day bucket(s) rolled up`);
}
