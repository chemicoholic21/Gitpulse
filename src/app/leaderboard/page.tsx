"use client";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import LeaderboardSkeleton from "@/components/skeletons/LeaderboardSkeleton";

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Developer Leaderboard
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl">
            Discover the most impactful open-source contributors based on their merged pull requests and project influence.
          </p>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-1 md:p-6 backdrop-blur-sm">
          {isLoading ? (
            <LeaderboardSkeleton />
          ) : (
            <LeaderboardTable data={leaderboard || []} />
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
