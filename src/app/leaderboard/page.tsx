"use client";

import { useState, useEffect } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import LeaderboardSkeleton from "@/components/skeletons/LeaderboardSkeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function LeaderboardPage() {
  const [location, setLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(location);
      setPageIndex(0); // Reset to first page when filter changes
    }, 500);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0); // Reset to first page when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPageIndex(0);
  };

  const { data, isLoading } = useLeaderboard(pageSize, debouncedLocation, pageIndex + 1, debouncedSearch, category);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Developer Leaderboard
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl">
              Discover the most impactful open-source contributors based on their merged pull requests and project influence.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              type="text"
              placeholder="Filter by location (e.g. San Francisco)"
              className="pl-10 bg-neutral-900 border-neutral-800 focus:border-green-400/50 transition-colors"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-1 md:p-6 backdrop-blur-sm">
          {isLoading && !data ? (
            <LeaderboardSkeleton />
          ) : (
            <LeaderboardTable 
              data={data?.data || []} 
              totalCount={data?.totalCount || 0}
              pageIndex={pageIndex}
              pageSize={pageSize}
              onPageChange={setPageIndex}
              onPageSizeChange={setPageSize}
              onSearchChange={setSearch}
              onCategoryChange={handleCategoryChange}
              search={search}
              category={category}
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-neutral-500 font-mono uppercase tracking-widest border-t border-neutral-800 pt-8">
          <div>Updated every 6 hours</div>
          <div className="flex gap-8">
            <span>Score Cap: 10,000</span>
            <span>Min Stars: 10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
