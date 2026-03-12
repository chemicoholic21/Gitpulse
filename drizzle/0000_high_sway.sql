CREATE TABLE "analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"total_score" real,
	"top_repos_json" text,
	"languages_json" text,
	"contribution_count" integer,
	"cached_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard" (
	"username" text PRIMARY KEY NOT NULL,
	"name" text,
	"avatar_url" text,
	"total_score" real,
	"company" text,
	"blog" text,
	"location" text,
	"email" text,
	"bio" text,
	"twitter_username" text,
	"hireable" boolean,
	"created_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
