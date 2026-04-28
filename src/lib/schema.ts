import { boolean, integer, pgTable, real, text, timestamp, jsonb } from"drizzle-orm/pg-core";

export const analyses = pgTable("analyses", {
    id: text("id").primaryKey(), // GitHub username
    username: text("username").notNull(),
    totalScore: real("total_score"),
    aiScore: real("ai_score").default(0),
    backendScore: real("backend_score").default(0),
    frontendScore: real("frontend_score").default(0),
    devopsScore: real("devops_score").default(0),
    dataScore: real("data_score").default(0),
    uniqueSkillsJson: text("unique_skills_json"),
    linkedin: text("linkedin"),
    topReposJson: text("top_repos_json"),
    languagesJson: text("languages_json"),
    contributionCount: integer("contribution_count"),
    cachedAt: timestamp("cached_at").defaultNow(),
});

export const leaderboard = pgTable("leaderboard", {
    username: text("username").primaryKey(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    url: text("url"),
    totalScore: real("total_score"),
    aiScore: real("ai_score").default(0),
    backendScore: real("backend_score").default(0),
    frontendScore: real("frontend_score").default(0),
    devopsScore: real("devops_score").default(0),
    dataScore: real("data_score").default(0),
    uniqueSkillsJson: text("unique_skills_json"),
    company: text("company"),
    blog: text("blog"),
    location: text("location"),
    email: text("email"),
    bio: text("bio"),
    twitterUsername: text("twitter_username"),
    linkedin: text("linkedin"),
    hireable: boolean("hireable").notNull().default(false),
    isOpenToWork: boolean("is_open_to_work"),
    otwScrapedAt: timestamp("otw_scraped_at"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
