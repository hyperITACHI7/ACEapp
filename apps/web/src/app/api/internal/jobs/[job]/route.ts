import { NextResponse } from "next/server";
import { jobs, type JobName } from "@portfolio/jobs";

/**
 * HTTP-triggered fallback for schedulers that can only fire a request (e.g. a GitHub Actions
 * cron workflow, or an external pinger) rather than exec-ing `services/jobs` directly — Render's
 * free tier has no long-running worker dyno to run a cron process in-process.
 */
export async function POST(request: Request, { params }: { params: { job: string } }) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.JOBS_SECRET}`;
  if (!process.env.JOBS_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = jobs[params.job as JobName];
  if (!job) {
    return NextResponse.json({ error: `Unknown job "${params.job}". Valid: ${Object.keys(jobs).join(", ")}` }, { status: 404 });
  }

  try {
    await job.run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[internal/jobs/${params.job}] failed:`, err);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
