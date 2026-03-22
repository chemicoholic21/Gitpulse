import { NextRequest, NextResponse } from"next/server";
import { searchUsersByLocation } from"@/lib/github-rest";
import { fetchUserAnalysis } from"@/lib/github";
import { computeScore } from"@/lib/scoring";
import { db } from"@/lib/db";
import { analyses, leaderboard } from"@/lib/schema";
import { getCachedAnalysis, setCachedAnalysis, setRawAnalysis } from"@/lib/redis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") ||"San Francisco";
  const page = parseInt(searchParams.get("page") ||"1");
  const limit = parseInt(searchParams.get("limit") ||"10"); // small limit to avoid timeout

  try {
    const { users, totalCount } = await searchUsersByLocation(location, page, limit);

    const results = [];

    for (const username of users) {
      // 1. Check if already analyzed (6h cache)
      const cached = await getCachedAnalysis(username);
      if (cached) {
        results.push({ username, status:"cached", score: cached.totalScore });
        continue;
      }

      try {
        // 2. Fetch and analyze
        const rawData = await fetchUserAnalysis(username);
        const profile = computeScore(rawData);

        // Extract LinkedIn from bio or blog
        const extractLinkedIn = (bio: string | null, blog: string | null) => {
          const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
          const bioMatch = bio?.match(linkedinRegex);
          if (bioMatch) return bioMatch[0];
          const blogMatch = blog?.match(linkedinRegex);
          if (blogMatch) return blogMatch[0];
          return null;
        };
        const linkedin = extractLinkedIn(rawData.user.bio, rawData.user.websiteUrl);

        // 3. Save to Redis
        await setRawAnalysis(username, rawData);
        await setCachedAnalysis(username, profile);

        // 4. Upsert to DB
        await db.insert(analyses).values({
          id: username.toLowerCase(),
          username: rawData.user.name || username,
          totalScore: profile.totalScore,
          aiScore: profile.aiScore,
          backendScore: profile.backendScore,
          frontendScore: profile.frontendScore,
          devopsScore: profile.devopsScore,
          dataScore: profile.dataScore,
          uniqueSkillsJson: JSON.stringify(profile.uniqueSkills),
          topReposJson: JSON.stringify(profile.topRepositories),
          languagesJson: JSON.stringify(profile.languageBreakdown),
          contributionCount: profile.contributionCount,
          cachedAt: new Date(),
        }).onConflictDoUpdate({
          target: analyses.id,
          set: {
            totalScore: profile.totalScore,
            aiScore: profile.aiScore,
            backendScore: profile.backendScore,
            frontendScore: profile.frontendScore,
            devopsScore: profile.devopsScore,
            dataScore: profile.dataScore,
            uniqueSkillsJson: JSON.stringify(profile.uniqueSkills),
            topReposJson: JSON.stringify(profile.topRepositories),
            languagesJson: JSON.stringify(profile.languageBreakdown),
            contributionCount: profile.contributionCount,
            cachedAt: new Date(),
          },
        });

        await db.insert(leaderboard).values({
          username: username,
          name: rawData.user.name,
          avatarUrl: rawData.user.avatarUrl,
          url: rawData.user.url,
          totalScore: profile.totalScore,
          aiScore: profile.aiScore,
          backendScore: profile.backendScore,
          frontendScore: profile.frontendScore,
          devopsScore: profile.devopsScore,
          dataScore: profile.dataScore,
          uniqueSkillsJson: JSON.stringify(profile.uniqueSkills),
          company: rawData.user.company,
          blog: rawData.user.websiteUrl,
          location: rawData.user.location,
          email: rawData.user.email,
          bio: rawData.user.bio,
          twitterUsername: rawData.user.twitterUsername,
          linkedin: linkedin,
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
            aiScore: profile.aiScore,
            backendScore: profile.backendScore,
            frontendScore: profile.frontendScore,
            devopsScore: profile.devopsScore,
            dataScore: profile.dataScore,
            uniqueSkillsJson: JSON.stringify(profile.uniqueSkills),
            company: rawData.user.company,
            blog: rawData.user.websiteUrl,
            location: rawData.user.location,
            email: rawData.user.email,
            bio: rawData.user.bio,
            twitterUsername: rawData.user.twitterUsername,
            linkedin: linkedin,
            hireable: rawData.user.isHireable,
            updatedAt: new Date(),
          },
        });

        results.push({ username, status:"analyzed", score: profile.totalScore });
      } catch (err: any) {
        console.error(`Failed to analyze ${username}:`, err.message);
        results.push({ username, status:"failed", error: err.message });
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
    return NextResponse.json({ error:"Discovery failed", details: error.message }, { status: 500 });
  }
}
