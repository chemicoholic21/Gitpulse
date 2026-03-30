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
const TOKEN_BLACKLIST_KEY = (index: number) => `pat:blacklist:${index}`;

export async function getBestToken(): Promise<{ token: string; index: number }> {
  if (TOKENS.length === 0) {
    throw new Error("No GitHub tokens configured in PAT pool");
  }

  // Get remaining points and blacklist status for all tokens
  const tokenStats = await Promise.all(
    TOKENS.map(async (_, i) => {
      const [points, isBlacklisted] = await Promise.all([
        redis.get<number>(TOKEN_CACHE_KEY(i)),
        redis.get<boolean>(TOKEN_BLACKLIST_KEY(i))
      ]);
      return { 
        index: i, 
        points: points ?? 5000, 
        isBlacklisted: !!isBlacklisted 
      };
    })
  );

  // Filter out blacklisted tokens
  const validTokens = tokenStats.filter(t => !t.isBlacklisted);

  if (validTokens.length === 0) {
    throw new Error("All GitHub tokens in pool are invalid or blacklisted");
  }

  // Find token with highest remaining points among valid ones
  let best = validTokens[0];
  for (const t of validTokens) {
    if (t.points > best.points) {
      best = t;
    }
  }

  if (best.points < 100) {
    throw new Error("All available GitHub tokens are rate-limited (< 100 points remaining)");
  }

  return { token: TOKENS[best.index], index: best.index };
}

export async function blacklistToken(index: number) {
  // Blacklist for 24 hours if a 401 is hit
  await redis.set(TOKEN_BLACKLIST_KEY(index), true, { ex: 86400 });
}

export async function updateTokenPoints(index: number, remaining: number) {
  // Update Redis with remaining points. 
  // We set a 1-hour TTL as GitHub resets points hourly.
  await redis.set(TOKEN_CACHE_KEY(index), remaining, { ex: 3600 });
}
