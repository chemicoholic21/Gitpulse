import { boolean, integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";

export const analyses = pgTable("analyses", {
    id: text("id").primaryKey(), // GitHub username
    username: text("username").notNull(),
    totalScore: real("total_score"),
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
    company: text("company"),
    blog: text("blog"),
    location: text("location"),
    email: text("email"),
    bio: text("bio"),
    twitterUsername: text("twitter_username"),
    hireable: boolean("hireable"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at").defaultNow(),
});
