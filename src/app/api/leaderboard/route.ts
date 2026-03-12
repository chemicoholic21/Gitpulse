import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leaderboard } from "@/lib/schema";
import { desc, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 100;
    const location = searchParams.get("location");

    const query = db.select().from(leaderboard);

    if (location) {
      query.where(ilike(leaderboard.location, `%${location}%`));
    }

    const topUsers = await query
      .orderBy(desc(leaderboard.totalScore))
      .limit(limit);

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
