import { NextRequest, NextResponse } from"next/server";
import { db } from"@/lib/db";
import { leaderboard } from"@/lib/schema";
import { eq, gt, sql, count } from"drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    // 1. Get the user's score
    const [user] = await db
      .select({
        totalScore: leaderboard.totalScore,
      })
      .from(leaderboard)
      .where(eq(leaderboard.username, username));

    if (!user) {
      return NextResponse.json({ error:"User not found" }, { status: 404 });
    }

    // 2. Count users with higher score to determine rank
    const [higherScoreCount] = await db
      .select({
        value: count(),
      })
      .from(leaderboard)
      .where(gt(leaderboard.totalScore, user.totalScore ?? 0));

    // 3. Count total users
    const [totalUsersCount] = await db
      .select({
        value: count(),
      })
      .from(leaderboard);

    const rank = Number(higherScoreCount.value) + 1;
    const totalUsers = Number(totalUsersCount.value);

    return NextResponse.json({
      username,
      rank,
      totalScore: user.totalScore,
      totalUsers,
    });
  } catch (error) {
    console.error(`[leaderboard/${username}]`, error);
    return NextResponse.json(
      { error:"Failed to fetch user rank" },
      { status: 500 }
    );
  }
}
