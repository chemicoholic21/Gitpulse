import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit, getCachedAnalysis, setCachedAnalysis, getRawAnalysis, setRawAnalysis } from "@/lib/redis";
import { fetchUserAnalysis } from "@/lib/github";
import { computeScore } from "@/lib/scoring";
import { db } from "@/lib/db";
import { analyses, leaderboard } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

  try {
    // 1. Check rate limit by IP
    const { success } = await checkRateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    // 2. Check Redis cache for scored profile
    const cached = await getCachedAnalysis(username);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 3. Check Redis cache for raw data (maybe we just need to re-score)
    let rawData = await getRawAnalysis(username);

    if (!rawData) {
      // 4. Get GitHub token from header (own profile), session, or env
      const headerToken = request.headers.get("x-github-token");
      const session = await auth();
      const token = headerToken || session?.accessToken || process.env.GITHUB_TOKEN;

      // 5. Fetch analysis from GitHub
      try {
        rawData = await fetchUserAnalysis(username, token);
        // Store raw data in Redis
        await setRawAnalysis(username, rawData);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        if (error.message.includes("rate limit")) {
          return NextResponse.json(
            { error: "GitHub rate limit reached. Please log in." },
            { status: 429 }
          );
        }
        throw error;
      }
    }

    // 6. Compute score
    const profile = computeScore(rawData);

    // 7. Store in Redis cache (scored)
    await setCachedAnalysis(username, profile);

    // 7. Upsert into Neon DB (analyses table)
    await db
      .insert(analyses)
      .values({
        id: username.toLowerCase(),
        username: rawData.user.name || username,
        totalScore: profile.totalScore,
        topReposJson: JSON.stringify(profile.topRepositories),
        languagesJson: JSON.stringify(profile.languageBreakdown),
        contributionCount: rawData.repos.reduce(
          (sum, r) => sum + r.mergedPrsByUserCount,
          0
        ),
        cachedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: analyses.id,
        set: {
          totalScore: profile.totalScore,
          topReposJson: JSON.stringify(profile.topRepositories),
          languagesJson: JSON.stringify(profile.languageBreakdown),
          contributionCount: rawData.repos.reduce(
            (sum, r) => sum + r.mergedPrsByUserCount,
            0
          ),
          cachedAt: new Date(),
        },
      });

    // 8. Upsert into leaderboard table
    await db
      .insert(leaderboard)
      .values({
        username: username,
        totalScore: profile.totalScore,
        avatarUrl: rawData.user.avatarUrl,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: leaderboard.username,
        set: {
          totalScore: profile.totalScore,
          avatarUrl: rawData.user.avatarUrl,
          updatedAt: new Date(),
        },
      });

    // 9. Return JSON
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error(`[analyze/${username}]`, error);
    return NextResponse.json(
      { error: "Analysis failed", details: error.message },
      { status: 500 }
    );
  }
}
