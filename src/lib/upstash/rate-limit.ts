import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize a single Redis client and Ratelimit instance for the entire module
const redis = Redis.fromEnv();

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(20, "31 d"),
});

/**
 * Consumes one quota AFTER successful analysis.
 * Call this only after successful analysis returns a valid result.
 * @returns An object containing whether the limit has been exceeded and remaining count
 */
export async function consumeAnalysisQuota(userId: string) {
  const yearMonth = new Date().toISOString().slice(0, 7);
  const identifier = `analysis:${userId}:${yearMonth}`;

  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}

/**
 * Peeks at remaining quota without consuming a request.
 * @returns remaining analyses left this month
 */
export async function getRemainingAnalysisQuota(userId: string) {
  const yearMonth = new Date().toISOString().slice(0, 7);
  const identifier = `analysis:${userId}:${yearMonth}`;

  const { remaining } = await limiter.getRemaining(identifier);
  return remaining;
}
