import { useQuery } from"@tanstack/react-query";
import { LeaderboardEntry } from"@/lib/scoring";

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  totalCount: number;
  page: number;
  limit: number;
}

export function useLeaderboard(
  limit?: number,
  location?: string,
  page?: number,
  search?: string,
  category?: string,
  sortBy?: string,
  sortOrder?: string,
  hireable?: boolean,
  hasLinkedIn?: boolean,
  hasX?: boolean,
  hasEmail?: boolean,
  skill?: string,
  openToWork?: string,
) {
  return useQuery({
    queryKey: ["leaderboard", limit, location, page, search, category, sortBy, sortOrder, hireable, hasLinkedIn, hasX, hasEmail, skill, openToWork],
    queryFn: async (): Promise<LeaderboardResponse> => {
      const params = new URLSearchParams();
      if (limit) params.set("limit", limit.toString());
      if (location) params.set("location", location);
      if (page) params.set("page", page.toString());
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);
      if (hireable === true) params.set("hireable","true");
      if (hasLinkedIn === true) params.set("hasLinkedIn","true");
      if (hasX === true) params.set("hasX","true");
      if (hasEmail === true) params.set("hasEmail","true");
      if (skill) params.set("skill", skill);
      if (openToWork) params.set("openToWork", openToWork);
      
      const url = `/api/leaderboard?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
