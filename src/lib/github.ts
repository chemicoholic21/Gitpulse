import { graphql } from "@octokit/graphql";
import { RawGitHubData } from "./scoring";
import { getBestToken, updateTokenPoints } from "./pat-pool";

// ---------------------------------------------------------------------------
// GraphQL query types (responses)
// ---------------------------------------------------------------------------

interface RateLimitFragment {
  rateLimit: {
    remaining: number;
    cost: number;
  };
}

interface UserAnalysisResponse extends RateLimitFragment {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    url: string;
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
        repositoryTopics: {
          nodes: Array<{ topic: { name: string } }>;
        };
        languages: {
          nodes: Array<{ name: string }>;
        };
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
        repositoryTopics: {
          nodes: Array<{ topic: { name: string } }>;
        };
        languages: {
          nodes: Array<{ name: string }>;
        };
      }>;
    };
  } | null;
}

interface SearchResponse extends RateLimitFragment {
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

function getClient(token: string) {
  return graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

const USER_ANALYSIS_QUERY = `
  query UserAnalysis($login: String!) {
    rateLimit { remaining cost }
    user(login: $login) {
      login
      name
      avatarUrl
      url
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
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          languages(first: 10) {
            nodes {
              name
            }
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
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          languages(first: 10) {
            nodes {
              name
            }
          }
        }
      }
    }
  }
`;

const SEARCH_MERGED_PRS_QUERY = `
  query SearchMergedPrs($searchQuery: String!) {
    rateLimit { remaining cost }
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
  providedToken?: string
): Promise<RawGitHubData> {
  const { token, index } = providedToken 
    ? { token: providedToken, index: -1 } 
    : await getBestToken();

  const client = getClient(token);

  const userRes = await client<UserAnalysisResponse>(USER_ANALYSIS_QUERY, {
    login: username,
  });

  // Update token points in pool if not a manual session token
  if (index !== -1) {
    await updateTokenPoints(index, userRes.rateLimit.remaining);
  }

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
        topics: node.repositoryTopics.nodes.map(n => n.topic.name),
        languages: node.languages.nodes.map(n => n.name),
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

      // Update token points again after second query
      if (index !== -1) {
        await updateTokenPoints(index, searchRes.rateLimit.remaining);
      }

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
      login: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      url: user.url,
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
