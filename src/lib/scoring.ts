export interface RawGitHubData {
    user: {
        name: string | null;
        avatarUrl: string;
        bio: string | null;
        followers: number;
        following: number;
        createdAt: string;
        updatedAt: string;
        isHireable: boolean;
        company: string | null;
        websiteUrl: string | null;
        location: string | null;
        email: string | null;
        twitterUsername: string | null;
    };
    repos: Array<{
        name: string;
        ownerLogin: string;
        stargazerCount: number;
        primaryLanguage: string | null;
        pushedAt: string | null;
        isFork: boolean;
        mergedPrCount: number;
        mergedPrsByUserCount: number;
    }>;
}

export type ExperienceLevel =
    | "Newcomer"
    | "Contributor"
    | "Active Contributor"
    | "Core Contributor"
    | "Open Source Leader";

export interface TopRepositorySummary {
    name: string;
    stars: number;
    userPRs: number;
    totalPRs: number;
    score: number;
    language: string | null;
}

export interface ScoredProfile {
    user: RawGitHubData["user"];
    totalScore: number;
    topRepositories: TopRepositorySummary[];
    languageBreakdown: Record<string, number>;
    experienceLevel: ExperienceLevel;
}

const MAX_REPO_SCORE = 10_000;

function scoreRepo(stars: number, userPRs: number, totalPRs: number): number {
    if (stars < 10) return 0;
    if (totalPRs <= 0) return 0;
    const raw = stars * (userPRs / totalPRs);
    return Math.min(raw, MAX_REPO_SCORE);
}

export function deriveExperienceLevel(totalScore: number): ExperienceLevel {
    if (totalScore < 10) return "Newcomer";
    if (totalScore < 100) return "Contributor";
    if (totalScore < 500) return "Active Contributor";
    if (totalScore < 2000) return "Core Contributor";
    return "Open Source Leader";
}

export interface LeaderboardEntry {
    rank: number;
    username: string;
    totalScore: number;
    avatarUrl: string;
}

export function computeScore(raw: RawGitHubData): ScoredProfile {
    const scoredRepos: TopRepositorySummary[] = [];
    let totalScore = 0;

    for (const repo of raw.repos) {
        const stars = repo.stargazerCount ?? 0;
        const userPRs = repo.mergedPrsByUserCount ?? 0;
        const totalPRs = repo.mergedPrCount ?? 0;

        const score = scoreRepo(stars, userPRs, totalPRs);
        if (score <= 0) continue;

        totalScore += score;

        scoredRepos.push({
            name: repo.name,
            stars,
            userPRs,
            totalPRs,
            score,
            language: repo.primaryLanguage,
        });
    }

    // Sort by score descending and take top 10
    scoredRepos.sort((a, b) => b.score - a.score);
    const topRepositories = scoredRepos.slice(0, 10);

    // Language breakdown from top repos only
    const languageBreakdown: Record<string, number> = {};
    for (const repo of topRepositories) {
        if (!repo.language) continue;
        languageBreakdown[repo.language] =
            (languageBreakdown[repo.language] ?? 0) + 1;
    }

    const experienceLevel = deriveExperienceLevel(totalScore);

    return {
        user: raw.user,
        totalScore,
        topRepositories,
        languageBreakdown,
        experienceLevel,
    };
}

