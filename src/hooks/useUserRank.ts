import { useQuery } from"@tanstack/react-query";

interface UserRankResponse {
  username: string;
  rank: number;
  totalScore: number;
  totalUsers: number;
}

export function useUserRank(username: string) {
  return useQuery({
    queryKey: ["userRank", username.toLowerCase()],
    queryFn: async (): Promise<UserRankResponse> => {
      const res = await fetch(`/api/leaderboard/${username}`);
      if (!res.ok) {
        throw new Error("Failed to fetch user rank");
      }
      return res.json();
    },
    enabled: !!username,
  });
}
