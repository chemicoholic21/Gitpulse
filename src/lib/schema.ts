import { boolean, integer, pgTable, real, text, timestamp, jsonb, serial } from"drizzle-orm/pg-core";

// User scores with contributor efficiency
export const userScores = pgTable("user_scores", {
    username: text("username").primaryKey(),
    totalScore: real("total_score"),
    aiScore: real("ai_score"),
    backendScore: real("backend_score"),
    frontendScore: real("frontend_score"),
    devopsScore: real("devops_score"),
    dataScore: real("data_score"),
    contributionCount: integer("contribution_count"),
    topReposJson: jsonb("top_repos_json"),
    languagesJson: jsonb("languages_json"),
    uniqueSkillsJson: jsonb("unique_skills_json"),
    updatedAt: timestamp("updated_at"),
    contributorEfficiency: real("contributor_efficiency"),
});

// User repo scores with PR TTM-based repo score
export const userRepoScores = pgTable("user_repo_scores", {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    repoName: text("repo_name").notNull(),
    userPrs: integer("user_prs").notNull(),
    totalPrs: integer("total_prs").notNull(),
    stars: integer("stars").notNull(),
    repoScore: real("repo_score"),
    computedAt: timestamp("computed_at"),
});

// GitHub repos for joining
export const githubRepos = pgTable("github_repos", {
    repoName: text("repo_name").primaryKey(),
    ownerLogin: text("owner_login"),
    description: text("description"),
    stars: integer("stars"),
    forks: integer("forks"),
    watchers: integer("watchers"),
    primaryLanguage: text("primary_language"),
    topics: text("topics").array(),
    isFork: boolean("is_fork"),
    isArchived: boolean("is_archived"),
    createdAt: timestamp("created_at"),
    pushedAt: timestamp("pushed_at"),
    totalPrs: integer("total_prs"),
    scrapedAt: timestamp("scraped_at"),
});

// GitHub users for joining
export const githubUsers = pgTable("github_users", {
    username: text("username").primaryKey(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    location: text("location"),
    company: text("company"),
    blog: text("blog"),
    twitterUsername: text("twitter_username"),
    email: text("email"),
    hireable: boolean("hireable"),
    followers: integer("followers"),
    following: integer("following"),
    publicRepos: integer("public_repos"),
    createdAt: timestamp("created_at"),
    scrapedAt: timestamp("scraped_at"),
});

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
    uniqueSkills: text("unique_skills").array(),
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
