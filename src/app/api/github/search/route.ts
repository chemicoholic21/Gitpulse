import { NextRequest, NextResponse } from"next/server";
import { searchUsersByLocation } from"@/lib/github-rest";
import { db } from"@/lib/db";
import { analyses } from"@/lib/schema";
import { inArray, eq } from"drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  let page = parseInt(searchParams.get("page") ||"1");
  const perPage = 100;

  if (!location) {
    return NextResponse.json({ error:"Location is required" }, { status: 400 });
  }

  // GitHub Search API only allows access to the first 1000 results
  if (page * perPage > 1000) {
    return NextResponse.json({
        location,
        page,
        totalCount: 1000,
        results: [],
        error:"GitHub API limit reached. Only the first 1000 results are available for live search. Try a more specific location filter."
    });
  }

  try {
    // 1. Search GitHub (Fast, no analysis yet)
    const { users: githubUsernames, totalCount } = await searchUsersByLocation(location, page, perPage);

    // 2. Check which ones are already in our DB
    const existingAnalyses = await db
      .select({ 
        username: analyses.id, 
        totalScore: analyses.totalScore 
      })
      .from(analyses)
      .where(inArray(analyses.id, githubUsernames.map(u => u.toLowerCase())));

    // Map for fast lookup
    const existingMap = new Map(existingAnalyses.map(a => [a.username, a.totalScore]));

    // 3. Merge results
    const results = githubUsernames.map(username => {
      const score = existingMap.get(username.toLowerCase());
      return {
        username,
        status: score !== undefined ?"analyzed" :"pending",
        score: score || null
      };
    });

    return NextResponse.json({
      location,
      page,
      totalCount,
      results
    });

  } catch (error: any) {
    console.error("[github/search]", error);
    return NextResponse.json(
      { error:"Search failed", details: error.message },
      { status: 500 }
    );
  }
}
