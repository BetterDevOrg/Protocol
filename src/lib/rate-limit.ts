const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds: number;
}

/**
 * In-memory sliding-window rate limiter, keyed per string (e.g. per email).
 * Resets on server restart / cold start; fine for a single-instance deploy
 * but not a substitute for a shared store (Redis/KV) behind multiple instances.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (buckets.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const retryAfterMs = timestamps[0] + windowMs - now;
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return { ok: true, retryAfterSeconds: 0 };
}
