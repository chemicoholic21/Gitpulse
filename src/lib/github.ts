import { graphql } from "@octokit/graphql";
import { RawGitHubData } from "./scoring";

// ---------------------------------------------------------------------------
// GraphQL query types (responses)
// ---------------------------------------------------------------------------

interface UserAnalysisResponse {
  user: {
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    followers: { totalCount: number };
    following: { totalCount: number };
    createdAt: string;
    updatedAt: string;
    isHireable: boolean;
    company: string | null;
    websiteUrl: string | null;
    location: string | null;
    email: string;
    twitterUsername: string | null;
    repositories: {
      nodes: Array<{
        name: string;
        owner: { login: string };
        stargazerCount: number;
        primaryLanguage: { name: string } | null;
        pushedAt: string | null;
        isFork: boolean;
        pullRequests: { totalCount: number };
      }>;
    };
    repositoriesContributedTo: {
      nodes: Array<{
        name: string;
        owner: { login: string };
        stargazerCount: number;
        primaryLanguage: { name: string } | null;
        pushedAt: string | null;
        isFork: boolean;
        pullRequests: { totalCount: number };
      }>;
    };
  } | null;
}

interface SearchResponse {
  search: {
    issueCount: number;
    nodes: Array<{
      repository?: {
        owner: { login: string };
        name: string;
      };
    }>;
  };
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

function getClient(token?: string) {
  const auth = token ?? process.env.GITHUB_TOKEN;
  if (!auth) {
    throw new Error(
      "No GitHub token provided. Pass a token or set GITHUB_TOKEN."
    );
  }
  return graphql.defaults({
    headers: {
      authorization: `token ${auth}`,
    },
  });
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

const USER_ANALYSIS_QUERY = `
  query UserAnalysis($login: String!) {
    user(login: $login) {
      name
      avatarUrl
      bio
      followers { totalCount }
      following { totalCount }
      createdAt
      updatedAt
      isHireable
      company
      websiteUrl
      location
      email
      twitterUsername
      repositories(
        first: 50
        orderBy: { field: STARGAZERS, direction: DESC }
        ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
      ) {
        nodes {
          name
          owner { login }
          stargazerCount
          primaryLanguage { name }
          pushedAt
          isFork
          pullRequests(states: [MERGED]) {
            totalCount
          }
        }
      }
      repositoriesContributedTo(
        first: 50
        contributionTypes: [PULL_REQUEST]
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          name
          owner { login }
          stargazerCount
          primaryLanguage { name }
          pushedAt
          isFork
          pullRequests(states: [MERGED]) {
            totalCount
          }
        }
      }
    }
  }
`;

const SEARCH_MERGED_PRS_QUERY = `
  query SearchMergedPrs($searchQuery: String!) {
    search(query: $searchQuery, type: ISSUE, first: 100) {
      nodes {
        ... on PullRequest {
          repository {
            owner { login }
            name
          }
        }
      }
    }
  }
`;

export async function fetchUserAnalysis(
  username: string,
  token?: string
): Promise<RawGitHubData> {
  const client = getClient(token);

  const userRes = await client<UserAnalysisResponse>(USER_ANALYSIS_QUERY, {
    login: username,
  });

  const user = userRes.user;
  if (!user) {
    throw new Error(`User "${username}" not found`);
  }

  // Combine owned repos and repos contributed to
  const allRepoNodes = [
    ...(user.repositories.nodes ?? []),
    ...(user.repositoriesContributedTo.nodes ?? []),
  ];

  // Deduplicate by full name
  const uniqueReposMap = new Map();
  for (const node of allRepoNodes) {
    const fullName = `${node.owner.login}/${node.name}`;
    if (!uniqueReposMap.has(fullName)) {
      uniqueReposMap.set(fullName, {
        name: node.name,
        ownerLogin: node.owner.login,
        stargazerCount: node.stargazerCount,
        primaryLanguage: node.primaryLanguage?.name ?? null,
        pushedAt: node.pushedAt,
        isFork: node.isFork,
        mergedPrCount: node.pullRequests.totalCount,
        mergedPrsByUserCount: 0,
      });
    }
  }

  const repos = Array.from(uniqueReposMap.values());

  if (repos.length > 0) {
    // Optimization: only search in repos with >= 10 stars
    const qualifyingRepos = repos.filter((r) => r.stargazerCount >= 10);
    
    if (qualifyingRepos.length > 0) {
      const repoQueries = qualifyingRepos
        .slice(0, 50) // Search limit to avoid huge query strings
        .map((r) => `repo:${r.ownerLogin}/${r.name}`);
      
      const searchQuery = `${repoQueries.join(" ")} is:pr is:merged author:${username}`;

      const searchRes = await client<SearchResponse>(SEARCH_MERGED_PRS_QUERY, {
        searchQuery,
      });

      const countsByRepo = new Map<string, number>();
      for (const node of searchRes.search.nodes) {
        const repo = node.repository;
        if (!repo) continue;
        const key = `${repo.owner.login}/${repo.name}`;
        countsByRepo.set(key, (countsByRepo.get(key) ?? 0) + 1);
      }

      for (const r of repos) {
        const key = `${r.ownerLogin}/${r.name}`;
        r.mergedPrsByUserCount = countsByRepo.get(key) ?? 0;
      }
    }
  }

  return {
    user: {
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isHireable: user.isHireable,
      company: user.company,
      websiteUrl: user.websiteUrl,
      location: user.location,
      email: user.email,
      twitterUsername: user.twitterUsername,
    },
    repos,
  };
}
