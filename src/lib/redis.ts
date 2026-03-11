import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { ScoredProfile, RawGitHubData } from "./scoring";

// ---------------------------------------------------------------------------
// Client Initialization
// ---------------------------------------------------------------------------

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "@upstash/ratelimit",
});

// ---------------------------------------------------------------------------
// Caching Functions
// ---------------------------------------------------------------------------

const CACHE_TTL = 21600; // 6 hours in seconds

export async function getCachedAnalysis(
  username: string
): Promise<ScoredProfile | null> {
  const key = `analysis:${username.toLowerCase()}`;
  return await redis.get<ScoredProfile>(key);
}

export async function setCachedAnalysis(
  username: string,
  profile: ScoredProfile
): Promise<void> {
  const key = `analysis:${username.toLowerCase()}`;
  await redis.set(key, profile, { ex: CACHE_TTL });
}

export async function getRawAnalysis(
  username: string
): Promise<RawGitHubData | null> {
  const key = `raw:analysis:${username.toLowerCase()}`;
  return await redis.get<RawGitHubData>(key);
}

export async function setRawAnalysis(
  username: string,
  rawData: RawGitHubData
): Promise<void> {
  const key = `raw:analysis:${username.toLowerCase()}`;
  await redis.set(key, rawData, { ex: CACHE_TTL });
}

export async function checkRateLimit(
  ip: string
): Promise<{ success: boolean; remaining: number }> {
  const { success, remaining } = await ratelimit.limit(ip);
  return { success, remaining };
}
