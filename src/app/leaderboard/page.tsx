"use client";

import { useState, useEffect } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import LeaderboardSkeleton from "@/components/skeletons/LeaderboardSkeleton";

export default function LeaderboardPage() {
  const [location, setLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("totalScore");
  const [sortOrder, setSortOrder] = useState("desc");
  const [hireable, setHireable] = useState(false);
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

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPageIndex(0);
  };

  const handleHireableChange = (isHireable: boolean) => {
    setHireable(isHireable);
    setPageIndex(0);
  };

  const { data, isLoading } = useLeaderboard(
    pageSize, 
    debouncedLocation, 
    pageIndex + 1, 
    debouncedSearch, 
    category,
    sortBy,
    sortOrder,
    hireable
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Developer Leaderboard
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
            Discover the most impactful open-source contributors based on their merged pull requests and project influence.
          </p>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-4 md:p-8 backdrop-blur-sm">
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
              onLocationChange={setLocation}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
              onHireableChange={handleHireableChange}
              search={search}
              location={location}
              category={category}
              sortBy={sortBy}
              sortOrder={sortOrder}
              hireable={hireable}
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-neutral-600 font-mono uppercase tracking-[0.3em] border-t border-neutral-800 pt-8">
          <div>Updated every 6 hours • Server Time: {new Date().toLocaleTimeString()}</div>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-green-500" />
              Score Cap: 10,000
            </span>
            <span className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-sky-500" />
              Min Stars: 10
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
