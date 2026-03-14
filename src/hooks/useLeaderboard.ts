import { useQuery } from "@tanstack/react-query";
import { LeaderboardEntry } from "@/lib/scoring";

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  totalCount: number;
  page: number;
  limit: number;
}

export function useLeaderboard(limit?: number, location?: string, page?: number, search?: string, category?: string) {
  return useQuery({
    queryKey: ["leaderboard", limit, location, page, search, category],
    queryFn: async (): Promise<LeaderboardResponse> => {
      const params = new URLSearchParams();
      if (limit) params.set("limit", limit.toString());
      if (location) params.set("location", location);
      if (page) params.set("page", page.toString());
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      
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
