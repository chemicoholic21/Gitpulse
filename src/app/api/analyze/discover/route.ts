import { NextRequest, NextResponse } from "next/server";
import { searchUsersByLocation } from "@/lib/github-rest";
import { fetchUserAnalysis } from "@/lib/github";
import { computeScore } from "@/lib/scoring";
import { db } from "@/lib/db";
import { analyses, leaderboard } from "@/lib/schema";
import { getCachedAnalysis, setCachedAnalysis, setRawAnalysis } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "San Francisco";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10"); // small limit to avoid timeout

  try {
    const { users, totalCount } = await searchUsersByLocation(location, page, limit);

    const results = [];

    for (const username of users) {
      // 1. Check if already analyzed (6h cache)
      const cached = await getCachedAnalysis(username);
      if (cached) {
        results.push({ username, status: "cached", score: cached.totalScore });
        continue;
      }

      try {
        // 2. Fetch and analyze
        const rawData = await fetchUserAnalysis(username);
        const profile = computeScore(rawData);

        // 3. Save to Redis
        await setRawAnalysis(username, rawData);
        await setCachedAnalysis(username, profile);

        // 4. Upsert to DB
        await db.insert(analyses).values({
          id: username.toLowerCase(),
          username: rawData.user.name || username,
          totalScore: profile.totalScore,
          topReposJson: JSON.stringify(profile.topRepositories),
          languagesJson: JSON.stringify(profile.languageBreakdown),
          contributionCount: rawData.repos.reduce((sum, r) => sum + r.mergedPrsByUserCount, 0),
          cachedAt: new Date(),
        }).onConflictDoUpdate({
          target: analyses.id,
          set: {
            totalScore: profile.totalScore,
            topReposJson: JSON.stringify(profile.topRepositories),
            languagesJson: JSON.stringify(profile.languageBreakdown),
            contributionCount: rawData.repos.reduce((sum, r) => sum + r.mergedPrsByUserCount, 0),
            cachedAt: new Date(),
          },
        });

        await db.insert(leaderboard).values({
          username: username,
          name: rawData.user.name,
          avatarUrl: rawData.user.avatarUrl,
          url: rawData.user.url,
          totalScore: profile.totalScore,
          company: rawData.user.company,
          blog: rawData.user.websiteUrl,
          location: rawData.user.location,
          email: rawData.user.email,
          bio: rawData.user.bio,
          twitterUsername: rawData.user.twitterUsername,
          hireable: rawData.user.isHireable,
          createdAt: new Date(rawData.user.createdAt),
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: leaderboard.username,
          set: {
            name: rawData.user.name,
            avatarUrl: rawData.user.avatarUrl,
            url: rawData.user.url,
            totalScore: profile.totalScore,
            company: rawData.user.company,
            blog: rawData.user.websiteUrl,
            location: rawData.user.location,
            email: rawData.user.email,
            bio: rawData.user.bio,
            twitterUsername: rawData.user.twitterUsername,
            hireable: rawData.user.isHireable,
            updatedAt: new Date(),
          },
        });

        results.push({ username, status: "analyzed", score: profile.totalScore });
      } catch (err: any) {
        console.error(`Failed to analyze ${username}:`, err.message);
        results.push({ username, status: "failed", error: err.message });
      }
    }

    return NextResponse.json({
      location,
      page,
      limit,
      totalCount,
      results,
    });
  } catch (error: any) {
    console.error("[discover]", error);
    return NextResponse.json({ error: "Discovery failed", details: error.message }, { status: 500 });
  }
}
