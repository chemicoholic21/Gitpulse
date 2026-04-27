"use client";

import { useState, useEffect } from"react";
import { useLeaderboard } from"@/hooks/useLeaderboard";
import { LeaderboardTable } from"@/components/leaderboard/leaderboard-table";
import LeaderboardSkeleton from"@/components/skeletons/LeaderboardSkeleton";

export default function LeaderboardPage() {
  const [location, setLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("totalScore");
  const [sortOrder, setSortOrder] = useState("desc");
  const [hireable, setHireable] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);
  const [hasX, setHasX] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [skill, setSkill] = useState("");
  const [debouncedSkill, setDebouncedSkill] = useState("");
  const [openToWorkFilter, setOpenToWorkFilter] = useState("");
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
      setPageIndex(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSkill(skill);
      setPageIndex(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [skill]);

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

  const handleContactFilterChange = (type:"hasLinkedIn" |"hasX" |"hasEmail", value: boolean) => {
    if (type ==="hasLinkedIn") setHasLinkedIn(value);
    if (type ==="hasX") setHasX(value);
    if (type ==="hasEmail") setHasEmail(value);
    setPageIndex(0);
  };

  const handleSkillChange = (newSkill: string) => {
    setSkill(newSkill);
    setPageIndex(0);
  };

  const handleOpenToWorkFilterChange = (value: string) => {
    setOpenToWorkFilter(value);
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
    hireable,
    hasLinkedIn,
    hasX,
    hasEmail,
    debouncedSkill,
    openToWorkFilter,
  );

  return (
    <div className="min-h-screen layout-grid border-x border-white/5 border-dashed">
      <div className="container mx-auto px-6 pt-32 pb-24">
        <div className="mb-12 space-y-4">
          <h1 className="dev-heading text-4xl md:text-5xl">
            Developer Leaderboard
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Discover the most impactful open-source contributors based on their merged pull requests and project influence.
          </p>
        </div>

        <div className="dev-surface p-4 md:p-8">
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
              onContactFilterChange={handleContactFilterChange}
              onSkillChange={handleSkillChange}
              onOpenToWorkFilterChange={handleOpenToWorkFilterChange}
              search={search}
              location={location}
              category={category}
              sortBy={sortBy}
              sortOrder={sortOrder}
              hireable={hireable}
              hasLinkedIn={hasLinkedIn}
              hasX={hasX}
              hasEmail={hasEmail}
              skill={skill}
              openToWorkFilter={openToWorkFilter}
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-600 uppercase tracking-[0.3em] border-t border-white/5 pt-8">
          <div>Updated every 6 hours • Server Time: {new Date().toLocaleTimeString()}</div>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#00F5A0]" />
              Score Cap: 10,000
            </span>
            <span className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#00D9F5]" />
              Min Stars: 10
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
