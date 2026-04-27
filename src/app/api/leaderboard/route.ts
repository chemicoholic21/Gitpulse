import { NextRequest, NextResponse } from"next/server";
import { db } from"@/lib/db";
import { leaderboard } from"@/lib/schema";
import { desc, ilike, count, sql, or, and, eq } from"drizzle-orm";

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
    const hireable = searchParams.get("hireable") ==="true";
    const hasLinkedIn = searchParams.get("hasLinkedIn") ==="true";
    const hasX = searchParams.get("hasX") ==="true";
    const hasEmail = searchParams.get("hasEmail") ==="true";
    const skill = searchParams.get("skill");
    const openToWork = searchParams.get("openToWork");
    const sortBy = searchParams.get("sortBy") ||"totalScore";
    const sortOrder = searchParams.get("sortOrder") ||"desc";

    // Map category to column
    let scoreColumn: any = leaderboard.totalScore;
    if (category) {
      switch (category.toLowerCase()) {
        case"ai": scoreColumn = leaderboard.aiScore; break;
        case"backend": scoreColumn = leaderboard.backendScore; break;
        case"frontend": scoreColumn = leaderboard.frontendScore; break;
        case"devops": scoreColumn = leaderboard.devopsScore; break;
        case"data": scoreColumn = leaderboard.dataScore; break;
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
    if (hireable) {
      filters.push(eq(leaderboard.hireable, true));
    }

    const contactFilters = [];
    if (hasLinkedIn) contactFilters.push(sql`${leaderboard.linkedin} IS NOT NULL`);
    if (hasX) contactFilters.push(sql`${leaderboard.twitterUsername} IS NOT NULL`);
    if (hasEmail) contactFilters.push(sql`${leaderboard.email} IS NOT NULL`);

    if (contactFilters.length > 0) {
      filters.push(or(...contactFilters));
    }

    // Filter by skill (case-insensitive substring match in JSON array)
    if (skill) {
      filters.push(sql`${leaderboard.uniqueSkillsJson} ILIKE ${'%' + skill + '%'}`);
    }

    // Filter by LinkedIn Open to Work status
    if (openToWork === "true") {
      filters.push(eq(leaderboard.linkedinOpenToWork, true));
    } else if (openToWork === "false") {
      filters.push(eq(leaderboard.linkedinOpenToWork, false));
    }
    
    // If a category is selected, we might want to only show users with score > 0 in that category
    if (category) {
      filters.push(sql`${scoreColumn} > 0`);
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Determine sort column and direction
    let orderByColumn: any;
    if (sortBy ==="totalScore") {
      orderByColumn = scoreColumn;
    } else if (sortBy ==="updatedAt") {
      orderByColumn = leaderboard.updatedAt;
    } else if (sortBy ==="username") {
      orderByColumn = leaderboard.username;
    } else if (sortBy ==="hireable") {
      orderByColumn = leaderboard.hireable;
    } else if (sortBy ==="linkedinOpenToWork") {
      orderByColumn = leaderboard.linkedinOpenToWork;
    } else {
      orderByColumn = scoreColumn;
    }

    const sortFn = sortOrder ==="asc" ? (c: any) => c : (c: any) => desc(c);

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
      .orderBy(sortFn(orderByColumn))
      .limit(limit)
      .offset(offset);

    const data = topUsers.map((user, index) => {
      const { uniqueSkillsJson, ...rest } = user;
      let uniqueSkills: string[] = [];
      if (uniqueSkillsJson) {
        try {
          uniqueSkills = JSON.parse(uniqueSkillsJson);
        } catch (e) {
          console.error("Failed to parse uniqueSkillsJson", e);
        }
      }
      return {
        rank: offset + index + 1,
        ...rest,
        uniqueSkills,
      };
    });

    return NextResponse.json({
      data,
      totalCount,
      page,
      limit,
    });
  } catch (error: any) {

    console.error("[leaderboard]", error);
    return NextResponse.json(
      { error:"Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
