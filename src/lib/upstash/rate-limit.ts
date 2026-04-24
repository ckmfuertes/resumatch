import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * Checks if the user has exceeded their monthly analysis limit.
 * Each user is allowed 25 analyses per month.
 * @param userId - The ID of the user to check
 * @returns An object containing whether the limit has been exceeded and how many analyses are remaining
 */
export async function checkAnalysisLimit(userId: string) {
  const yearMonth = new Date().toISOString().slice(0, 7);
  const identifier = `analysis:${userId}:${yearMonth}`;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(25, "31 d"),
  });

  const { success, remaining } = await limiter.limit(identifier);

  return { success, remaining };
}
