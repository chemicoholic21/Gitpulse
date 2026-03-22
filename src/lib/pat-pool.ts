import { Redis } from"@upstash/redis";

// Initialize Redis client for PAT tracking
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const TOKENS: string[] = [];
for (let i = 1; i <= 5; i++) {
  const token = process.env[`GITHUB_TOKEN_${i}`];
  if (token) TOKENS.push(token);
}

// Fallback to GITHUB_TOKEN if no indexed tokens found
if (TOKENS.length === 0 && process.env.GITHUB_TOKEN) {
  TOKENS.push(process.env.GITHUB_TOKEN);
}

const TOKEN_CACHE_KEY = (index: number) => `pat:ratelimit:${index}`;

export async function getBestToken(): Promise<{ token: string; index: number }> {
  if (TOKENS.length === 0) {
    throw new Error("No GitHub tokens configured in PAT pool");
  }

  // Get remaining points for all tokens from Redis
  const remainingPoints = await Promise.all(
    TOKENS.map(async (_, i) => {
      const points = await redis.get<number>(TOKEN_CACHE_KEY(i));
      return points ?? 5000; // Default to 5000 if not tracked yet
    })
  );

  // Find token with highest remaining points
  let bestIndex = 0;
  let maxPoints = -1;

  for (let i = 0; i < remainingPoints.length; i++) {
    if (remainingPoints[i] > maxPoints) {
      maxPoints = remainingPoints[i];
      bestIndex = i;
    }
  }

  if (maxPoints < 100) {
    throw new Error("All GitHub tokens in pool are rate-limited (< 100 points remaining)");
  }

  return { token: TOKENS[bestIndex], index: bestIndex };
}

export async function updateTokenPoints(index: number, remaining: number) {
  // Update Redis with remaining points. 
  // We set a 1-hour TTL as GitHub resets points hourly.
  await redis.set(TOKEN_CACHE_KEY(index), remaining, { ex: 3600 });
}
