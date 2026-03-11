"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { deriveExperienceLevel } from "@/lib/scoring";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RANK_BADGES: Record<number, string> = {
  1: "text-white border-white/20 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
  2: "text-gray-400 border-white/10 bg-white/5",
  3: "text-gray-500 border-white/5 bg-white/[0.02]",
};

const EXPERIENCE_COLORS = {
  Newcomer: "text-gray-600",
  Contributor: "text-blue-500/80",
  "Active Contributor": "text-sky-500/80",
  "Core Contributor": "text-purple-500/80",
  "Open Source Leader": "text-white",
};

export default function LeaderboardPage() {
  const [limit, setLimit] = useState(20);
  const [filter, setFilter] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  const { data: leaderboard, isLoading } = useLeaderboard(limit);

  const filteredData = leaderboard?.filter((user) =>
    user.username.toLowerCase().includes(filter.toLowerCase())
  );

  const maxScore = leaderboard?.[0]?.totalScore || 1;

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      router.push(`/analyze/${searchUsername.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-500 selection:bg-sky-500/30 py-32 px-6 overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="atmospheric-blur top-[-10%] left-[-10%] opacity-10" />
      <div className="atmospheric-blur bottom-[-20%] right-[-10%] bg-purple-500/5 opacity-10" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header Hero */}
        <div className="mb-24 flex flex-col md:flex-row items-end justify-between gap-12 border-b border-white/5 pb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="max-w-2xl">
            <span className="text-sky-400 font-mono text-xs tracking-[0.3em] uppercase mb-6 block font-bold">Protocol Rankings</span>
            <h1 className="editorial-heading text-5xl md:text-7xl mb-6 italic text-white/90">Global Vanguard</h1>
            <p className="text-xl text-gray-500 leading-relaxed italic">
              Tracking the mathematical impact of software engineering across the planetary ecosystem.
            </p>
          </div>
          <form onSubmit={handleUserSearch} className="relative group w-full md:w-96">
             <div className="absolute -inset-0.5 bg-white/10 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500" />
             <div className="relative flex bg-[#161b22] border border-white/10 rounded-full p-1 pl-6 focus-within:border-white/20 transition-all">
               <input
                type="text"
                placeholder="Find identity..."
                className="w-full bg-transparent border-none py-3 text-white placeholder-gray-700 focus:outline-none text-sm font-mono"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
              />
              <button
                type="submit"
                className="bg-white text-black font-bold px-6 rounded-full text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              >
                Trace
              </button>
             </div>
          </form>
        </div>

        {/* Controls Matrix */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <div className="flex bg-white/[0.02] p-1 rounded-full border border-white/5">
            {[20, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => setLimit(val)}
                className={`px-8 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                  limit === val
                    ? "bg-white/10 text-white shadow-xl"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                Top {val}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <input
              type="text"
              placeholder="FILTER BY IDENTITY NAME..."
              className="w-full bg-transparent border-b border-white/5 py-3 px-1 text-[10px] tracking-[0.3em] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-700 uppercase font-bold"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <div className="absolute bottom-0 left-0 h-px bg-sky-500/50 w-0 group-focus-within:w-full transition-all duration-700" />
          </div>
        </div>

        {/* Cinematic Ranking Table */}
        <div className="cinematic-card overflow-hidden animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-400">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.03] text-[9px] uppercase tracking-[0.4em] text-gray-600 font-bold border-b border-white/5">
                <th className="px-10 py-8">Identity Rank</th>
                <th className="px-10 py-8">Engineer</th>
                <th className="px-10 py-8">Status</th>
                <th className="px-10 py-8 text-right">Impact Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-10 py-10 h-24 bg-white/[0.01]" />
                  </tr>
                ))
              ) : (
                filteredData?.map((entry) => {
                  const isCurrentUser = (session?.user?.login || session?.user?.name)?.toLowerCase() === entry.username.toLowerCase();
                  const expLevel = deriveExperienceLevel(entry.totalScore);
                  const scoreWidth = (entry.totalScore / maxScore) * 100;

                  return (
                    <tr
                      key={entry.username}
                      className={`hover:bg-white/[0.015] transition-all group ${
                        isCurrentUser ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      <td className="px-10 py-8">
                        <span
                          className={`inline-block px-4 py-1.5 rounded-full border text-[10px] font-mono font-bold tracking-widest ${
                            RANK_BADGES[entry.rank] || "border-white/5 text-gray-700"
                          }`}
                        >
                          {entry.rank.toString().padStart(4, '0')}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <Link href={`/analyze/${entry.username}`} className="flex items-center gap-5">
                          <img
                            src={entry.avatarUrl}
                            alt={entry.username}
                            className={`w-10 h-10 rounded-full border transition-all duration-700 grayscale group-hover:grayscale-0 ${
                              isCurrentUser ? "border-white shadow-2xl shadow-white/20" : "border-white/10"
                            }`}
                          />
                          <span className="text-white font-serif text-xl group-hover:text-sky-400 transition-colors">
                            {entry.username}
                            {isCurrentUser && (
                              <span className="ml-3 text-[8px] uppercase tracking-[0.4em] bg-white text-black px-2 py-0.5 rounded-full font-bold">You</span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${EXPERIENCE_COLORS[expLevel]}`}>
                          {expLevel}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex flex-col items-end gap-3">
                          <span className="text-2xl font-serif text-white tabular-nums">
                            {entry.totalScore > 0
                              ? entry.totalScore.toLocaleString(undefined, {
                                  minimumFractionDigits: 1,
                                  maximumFractionDigits: 1,
                                })
                              : "-"}
                          </span>
                          <div className="w-32 h-[1px] bg-white/5 relative">
                             <div 
                               className="absolute h-full bg-sky-500/50 transition-all duration-1000"
                               style={{ width: `${scoreWidth}%` }}
                             />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {!isLoading && filteredData?.length === 0 && (
            <div className="py-40 text-center">
              <p className="text-gray-700 italic text-[10px] tracking-[0.4em] uppercase font-bold">Identity mismatch: &ldquo;{filter}&rdquo;</p>
            </div>
          )}
        </div>

        <div className="mt-24 text-center text-[9px] text-gray-700 uppercase tracking-[0.4em] font-bold">
          Protocol Calibration Every 360m • Score Weighting Limit 10K
        </div>
      </div>
    </div>
  );
}
