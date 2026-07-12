// In-memory per-IP token bucket. Documented limitation: state is per-instance and resets on
// redeploy/restart — acceptable at MVP's single-instance free-tier scale (edge_case.md §10).
// Upstash Redis (or similar) is the drop-in upgrade once running more than one instance.
interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, maxTokens: number, refillMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: maxTokens, lastRefill: now };

  const elapsed = now - bucket.lastRefill;
  const refillAmount = Math.floor((elapsed / refillMs) * maxTokens);
  if (refillAmount > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + refillAmount);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() ?? "unknown";
}
