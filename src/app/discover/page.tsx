"use client";

import { useState } from"react";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import { Input } from"@/components/ui/input";
import { Button } from"@/components/ui/button";
import { Search, Loader2, CheckCircle2, AlertCircle, PlusCircle } from"lucide-react";
import { Badge } from"@/components/ui/badge";
import Link from"next/link";
import { Avatar, AvatarImage, AvatarFallback } from"@/components/ui/avatar";

interface SearchResult {
  username: string;
  status:"analyzed" |"pending";
  score: number | null;
}

interface SearchResponse {
  totalCount: number;
  results: SearchResult[];
  error?: string;
}

export default function DiscoverPage() {
  const [location, setLocation] = useState("San Francisco");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<SearchResponse>({
    queryKey: ["discover", location, page],
    queryFn: async () => {
      const res = await fetch(`/api/github/search?location=${encodeURIComponent(location)}&page=${page}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ||"Search failed");
      return json;
    },
    enabled: !!location,
    staleTime: 60000,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await fetch(`/api/analyze/${username}`);
      if (!res.ok) throw new Error("Analysis failed");
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["discover", location, page], (old: SearchResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          results: old.results.map((r) => 
            r.username === variables ? { ...r, status:"analyzed", score: data.totalScore } : r
          ),
        };
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Discover Talent
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Find developers directly from GitHub by location. Add them to your leaderboard instantly.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-12 flex flex-col sm:flex-row gap-4 max-w-xl mx-auto relative">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Enter location (e.g. San Francisco, London)"
 className="pl-10 h-12 bg-gray-900 border-gray-800 text-lg focus:border-green-400/50 transition-colors"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700 h-12 px-8">
            Search
          </Button>
        </form>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-400 bg-red-900/10 rounded-lg border border-red-900/20 px-6">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error instanceof Error ? error.message :"Failed to load users. Please try again."}</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm text-gray-500  uppercase tracking-widest px-2">
              <span>{data.totalCount.toLocaleString()} Developers Found</span>
              <span>Page {page}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.results.map((user) => (
                <div 
                  key={user.username}
 className="group flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-gray-800">
                      <AvatarImage src={`https://github.com/${user.username}.png`} />
                      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-white group-hover:text-green-400 transition-colors">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500 ">
                        {user.status ==="analyzed" ? (
                          <span className="text-green-400/80">Score: {user.score?.toFixed(0)}</span>
                        ) : (
"Not ranked"
                        )}
                      </div>
                    </div>
                  </div>

                  {user.status ==="analyzed" ? (
                    <Badge variant="outline" className="border-green-900 text-green-400 bg-green-900/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Ranked
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
 className="text-gray-400 hover:text-white hover:bg-gray-800"
                      disabled={analyzeMutation.isPending && analyzeMutation.variables === user.username}
                      onClick={() => analyzeMutation.mutate(user.username)}
                    >
                      {analyzeMutation.isPending && analyzeMutation.variables === user.username ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Analyze
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 pt-8">
              <Button 
                variant="outline" 
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading || page >= 10 || (data.results.length < 100)}
              >
                Next
              </Button>
            </div>
            {page >= 10 && (
              <p className="text-center text-xs text-gray-600 mt-4 ">
                GitHub search limit reached (1,000 users). Try refining your location to discover more talent.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
