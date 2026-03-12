import { useQuery } from "@tanstack/react-query";
import { LeaderboardEntry } from "@/lib/scoring";

export function useLeaderboard(limit?: number, location?: string) {
  return useQuery({
    queryKey: ["leaderboard", limit, location],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const params = new URLSearchParams();
      if (limit) params.set("limit", limit.toString());
      if (location) params.set("location", location);
      
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
