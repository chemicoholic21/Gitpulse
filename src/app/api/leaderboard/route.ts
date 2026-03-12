import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leaderboard } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const topUsers = await db.query.leaderboard.findMany({
      orderBy: [desc(leaderboard.totalScore)],
      limit: 100,
    });

    const result = topUsers.map((user, index) => ({
      rank: index + 1,
      ...user,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[leaderboard]", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
