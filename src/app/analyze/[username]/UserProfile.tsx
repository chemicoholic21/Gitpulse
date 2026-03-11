"use client";

import { useState } from "react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useUserRank } from "@/hooks/useUserRank";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Link from "next/link";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

const EXPERIENCE_COLORS = {
  Newcomer: "text-gray-500 border-white/5 bg-white/5",
  Contributor: "text-blue-400 border-blue-500/20 bg-blue-500/5",
  "Active Contributor": "text-sky-400 border-sky-500/20 bg-sky-500/5",
  "Core Contributor": "text-purple-400 border-purple-500/20 bg-purple-500/5",
  "Open Source Leader": "text-white border-white/20 bg-white/10",
};

const CHART_COLORS = [
  "#ffffff",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
];

export default function UserProfile({ username }: { username: string }) {
  const queryClient = useQueryClient();
  const { data: profile, isLoading, isError, error } = useAnalysis(username);
  const { data: rankData } = useUserRank(username);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["analysis", username.toLowerCase()] });
    queryClient.invalidateQueries({ queryKey: ["userRank", username.toLowerCase()] });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Profile URL copied to clipboard!");
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-40 text-center min-h-screen">
        <div className="max-w-xl mx-auto p-12 cinematic-card">
          <h2 className="editorial-heading text-3xl text-red-400 mb-6">System Error</h2>
          <p className="text-gray-500 mb-8 font-mono text-sm">{(error as Error).message}</p>
          <Link href="/" className="text-white font-bold tracking-widest uppercase text-xs border-b border-white/20 pb-2 hover:border-white transition-all">
            &larr; Return to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const chartData = Object.entries(profile.languageBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const formatStars = (stars: number) => {
    if (stars >= 1000) return (stars / 1000).toFixed(1) + "K";
    return stars.toString();
  };

  const topRepo = profile.topRepositories[0];

  return (
    <div className="relative min-h-screen pt-32 pb-40 px-6 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="atmospheric-blur top-[-10%] right-[-10%] opacity-10" />
      <div className="atmospheric-blur bottom-[-20%] left-[-10%] bg-purple-500/5 opacity-10" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Profile Hero */}
        <header className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative group">
            <div className="absolute -inset-2 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
            <img
              src={profile.user.avatarUrl}
              alt={username}
              className="relative w-40 h-40 rounded-full border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-6">
              <h1 className="editorial-heading text-5xl md:text-7xl">{profile.user.name || username}</h1>
              <span
                className={`px-6 py-2 rounded-full border text-[10px] font-bold uppercase tracking-[0.3em] ${
                  EXPERIENCE_COLORS[profile.experienceLevel]
                }`}
              >
                {profile.experienceLevel}
              </span>
            </div>
            
            <p className="text-xl text-gray-500 mb-8 max-w-2xl leading-relaxed italic">
              &ldquo;{profile.user.bio || "No biography provided for this identity."}&rdquo;
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-[10px] tracking-[0.2em] uppercase font-bold text-gray-600">
              <span className="flex items-center gap-2">
                <span className="text-white text-base font-serif">{profile.user.followers}</span> Followers
              </span>
              <span className="flex items-center gap-2">
                <span className="text-white text-base font-serif">{profile.user.following}</span> Following
              </span>
              <div className="h-4 w-px bg-white/5 hidden md:block" />
              <button
                onClick={copyToClipboard}
                className="hover:text-white transition-all border-b border-white/5 pb-1 hover:border-white"
              >
                Share Identity
              </button>
              <button
                onClick={handleRefresh}
                className="hover:text-white transition-all border-b border-white/5 pb-1 hover:border-white"
              >
                Recalibrate
              </button>
            </div>
          </div>

          <div className="md:text-right flex flex-col items-center md:items-end pt-4">
            <div className="text-[10px] uppercase text-gray-600 font-bold tracking-[0.3em] mb-4">Impact Score</div>
            <div className="text-7xl md:text-8xl font-serif text-white leading-none mb-4 tabular-nums">
              {profile.totalScore.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </div>
            {rankData && (
              <div className="text-sky-400 font-mono text-xs tracking-widest uppercase font-bold">
                Global Protocol Rank #{rankData.rank.toString().padStart(4, '0')}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          {/* Repositories */}
          <div className="lg:col-span-2 space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <div className="flex items-center justify-between px-2">
              <h2 className="editorial-heading text-3xl">Contribution Matrix</h2>
              <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">Last 50 Repositories</span>
            </div>
            
            <div className="cinematic-card overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold border-b border-white/5">
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-6 py-6">Popularity</th>
                    <th className="px-6 py-6">Engagement</th>
                    <th className="px-8 py-6 text-right">Score Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profile.topRepositories.map((repo) => (
                    <tr key={repo.name} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-8">
                        <Link
                          href={`https://github.com/${repo.ownerLogin || username}/${repo.name}`}
                          target="_blank"
                          className="text-white font-serif text-lg group-hover:text-sky-400 transition-colors"
                        >
                          {repo.name}
                        </Link>
                        <div className="text-[9px] text-gray-600 font-bold tracking-widest uppercase mt-2 group-hover:text-gray-400 transition-colors">
                          {repo.language || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-8 font-mono text-gray-500">
                        {formatStars(repo.stars)} <span className="text-[10px] opacity-30 tracking-tighter ml-1">stars</span>
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex flex-col gap-2">
                          <span className="font-mono text-gray-400 text-xs">
                            {repo.userPRs} <span className="opacity-30">/ {repo.totalPRs} PRs</span>
                          </span>
                          <div className="w-32 h-[1px] bg-white/5 relative">
                             <div 
                               className="absolute h-full bg-sky-500/50 transition-all duration-1000"
                               style={{ width: `${Math.min((repo.userPRs / repo.totalPRs) * 100, 100)}%` }}
                             />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right font-mono text-white font-bold text-lg">
                        +{repo.score.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Language Matrix */}
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
            <div className="px-2">
              <h2 className="editorial-heading text-3xl">Language Bias</h2>
            </div>
            
            <div className="cinematic-card p-10 h-[500px] flex flex-col group">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={chartData} margin={{ left: -20, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}
                      width={100}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      contentStyle={{
                        backgroundColor: "#0d1117",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "10px",
                        fontFamily: "monospace",
                        textTransform: "uppercase",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 text-[9px] tracking-[0.3em] uppercase font-bold text-gray-700 group-hover:text-gray-500 transition-colors">
                 Dominant Linguistic Patterns
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Details */}
        <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-600">
          <div className="cinematic-card overflow-hidden">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full px-12 py-8 flex items-center justify-between hover:bg-white/[0.01] transition-all"
            >
              <span className="editorial-heading text-xl">Protocol Methodology</span>
              <span className="text-gray-600 font-mono text-2xl">{showExplanation ? "−" : "+"}</span>
            </button>
            
            {showExplanation && (
              <div className="px-12 pb-16 animate-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-12 border-t border-white/5">
                  <div>
                    <h4 className="text-[10px] tracking-[0.3em] uppercase font-bold text-sky-400 mb-6">Mathematical Foundation</h4>
                    <div className="bg-black/40 p-10 rounded-xl border border-white/5 font-mono text-sm leading-relaxed mb-8 italic text-white/80">
                      score = stars × (merged_prs_by_identity / total_merged_prs)
                    </div>
                    <ul className="space-y-6 text-xs text-gray-500 tracking-widest leading-loose uppercase font-bold">
                      <li className="flex gap-4">
                        <span className="text-white">01</span>
                        Repositories with fewer than 10 stars are excluded from the protocol.
                      </li>
                      <li className="flex gap-4">
                        <span className="text-white">02</span>
                        Per-repository contribution score is capped at 10,000 units.
                      </li>
                      <li className="flex gap-4">
                        <span className="text-white">03</span>
                        GraphQL data harvesting focuses on the most active 50 nodes.
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] tracking-[0.3em] uppercase font-bold text-purple-400 mb-6">Real-time Calibration</h4>
                    {topRepo && (
                      <div className="space-y-6">
                        <p className="text-xs text-gray-600 italic tracking-widest uppercase font-bold">Primary Sample: {topRepo.name}</p>
                        <div className="cinematic-card p-10 bg-black/20 font-mono text-xs space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600 uppercase">Star Magnitude</span>
                            <span className="text-white">{topRepo.stars}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 uppercase">Identity PRs</span>
                            <span className="text-white">{topRepo.userPRs}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-4">
                            <span className="text-gray-600 uppercase">Total PRs</span>
                            <span className="text-white">{topRepo.totalPRs}</span>
                          </div>
                          <div className="flex justify-between text-white font-bold pt-2 text-sm">
                            <span className="uppercase tracking-widest">Weight Value</span>
                            <span>{topRepo.score.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-32 text-center">
          <Link href="/" className="text-[10px] tracking-[0.4em] uppercase font-bold text-gray-600 hover:text-white transition-all border-b border-white/5 pb-2 hover:border-white">
            &larr; Return to Global Search
          </Link>
        </div>
      </div>
    </div>
  );
}
