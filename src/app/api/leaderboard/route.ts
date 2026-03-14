import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leaderboard } from "@/lib/schema";
import { desc, ilike, count, sql, or, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const pageParam = searchParams.get("page");
    const limit = limitParam ? parseInt(limitParam) : 20;
    const page = pageParam ? parseInt(pageParam) : 1;
    const offset = (page - 1) * limit;
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    // Map category to column
    let scoreColumn: any = leaderboard.totalScore;
    if (category) {
      switch (category.toLowerCase()) {
        case "ai": scoreColumn = leaderboard.aiScore; break;
        case "backend": scoreColumn = leaderboard.backendScore; break;
        case "frontend": scoreColumn = leaderboard.frontendScore; break;
        case "devops": scoreColumn = leaderboard.devopsScore; break;
        case "data": scoreColumn = leaderboard.dataScore; break;
      }
    }

    const filters = [];
    if (location) {
      filters.push(ilike(leaderboard.location, `%${location}%`));
    }
    if (search) {
      filters.push(
        or(
          ilike(leaderboard.username, `%${search}%`),
          ilike(leaderboard.name, `%${search}%`)
        )
      );
    }
    
    // If a category is selected, we might want to only show users with score > 0 in that category
    if (category) {
      filters.push(sql`${scoreColumn} > 0`);
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Get total count for pagination
    let countQuery = db.select({ value: count() }).from(leaderboard);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [totalCountRes] = await countQuery;
    const totalCount = Number(totalCountRes.value);

    // Get data
    let query = db.select().from(leaderboard);
    if (whereClause) {
      query.where(whereClause);
    }

    const topUsers = await query
      .orderBy(desc(scoreColumn))
      .limit(limit)
      .offset(offset);

    const data = topUsers.map((user, index) => ({
      rank: offset + index + 1,
      ...user,
    }));

    return NextResponse.json({
      data,
      totalCount,
      page,
      limit,
    });
  } catch (error: any) {

    console.error("[leaderboard]", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
