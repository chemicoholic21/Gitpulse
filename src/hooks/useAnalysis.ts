import { useQuery } from"@tanstack/react-query";
import { ScoredProfile } from"@/lib/scoring";
import { useSession } from"next-auth/react";

export function useAnalysis(username: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["analysis", username.toLowerCase()],
    queryFn: async (): Promise<ScoredProfile> => {
      const headers: Record<string, string> = {};
      
      // If logged in user is viewing their own profile, pass their OAuth token
      if (session?.accessToken && session.user?.login?.toLowerCase() === username.toLowerCase()) {
        headers["x-github-token"] = session.accessToken;
      }

      const res = await fetch(`/api/analyze/${username}`, { headers });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error ||"Analysis failed");
      }
      return res.json();
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 60 * 5, // 5 hours
  });
}
