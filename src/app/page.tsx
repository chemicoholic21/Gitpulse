"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import Link from "next/link";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(10);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isPending) {
      setIsPending(true);
      router.push(`/user/${username.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-400 selection:bg-sky-500/30">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
        {/* Atmospheric Blurs */}
        <div className="atmospheric-blur top-[-10%] left-[-10%] opacity-20 animate-pulse" />
        <div className="atmospheric-blur bottom-[-20%] right-[-10%] bg-purple-500/10 opacity-20" />
        
        <div className="container mx-auto relative z-10 text-center">
          <div className="max-w-5xl mx-auto">
            <span className="inline-block text-sky-400 font-mono text-sm tracking-[0.3em] uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Developer Intelligence Platform
            </span>
            <h1 className="editorial-heading text-6xl md:text-9xl mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Quantify your <br />
              <span className="italic text-white/90">open source</span> impact.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-16 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
              A cinematic perspective on contribution importance across the global software ecosystem. 
              Precision analytics for the modern engineer.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
              <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex items-center bg-[#161b22] border border-white/10 rounded-full p-2 pl-8 focus-within:border-white/20 transition-all shadow-2xl">
                  <input
                    type="text"
                    placeholder="Search any GitHub identity..."
                    className="w-full bg-transparent border-none py-4 text-white placeholder-gray-600 focus:outline-none text-lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-white text-black font-bold h-14 px-10 rounded-full transition-all hover:scale-105 active:scale-95 disabled:bg-gray-800 disabled:text-gray-500 flex items-center justify-center min-w-[140px]"
                  >
                    {isPending ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      "Analyze"
                    )}
                  </button>
                </div>
              </form>

              {(session?.user?.login || session?.user?.name) && (
                <div className="flex items-center justify-center gap-6">
                  <Link
                    href={`/user/${(session.user.login || session.user.name!).toLowerCase()}`}
                    className="group flex items-center gap-4 text-sm tracking-widest uppercase font-bold text-gray-500 hover:text-white transition-all"
                  >
                    <img
                      src={session.user.image || ""}
                      alt={session.user.name || "User"}
                      className="w-10 h-10 rounded-full border border-white/10 grayscale group-hover:grayscale-0 transition-all"
                    />
                    <span>Analyze my identity &rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Cinematic Stats Section */}
      <section className="py-40 px-4 border-t border-white/5 relative overflow-hidden">
         <div className="atmospheric-blur top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sky-500/5 opacity-50" />
         
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-sky-400 font-mono text-xs tracking-widest uppercase mb-6 block font-bold">Metrics & Impact</span>
              <h2 className="editorial-heading text-5xl md:text-6xl mb-8 leading-tight">
                Beyond the <br />
                <span className="italic text-white/80">contribution graph.</span>
              </h2>
              <p className="text-xl text-gray-500 mb-12 leading-relaxed">
                GitPulse employs advanced weighted algorithms to determine the mathematical significance of your work 
                within the global open source fabric.
              </p>
              <div className="flex gap-8">
                <Link href="/leaderboard" className="text-white font-bold tracking-widest uppercase text-xs border-b border-white/20 pb-2 hover:border-white transition-all">
                  Global Leaderboard
                </Link>
                <Link href="https://github.com" className="text-gray-500 font-bold tracking-widest uppercase text-xs border-b border-transparent pb-2 hover:text-white transition-all">
                  Protocol Docs
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="cinematic-card p-8 group">
                <p className="text-gray-600 text-[10px] tracking-[0.2em] uppercase mb-2 font-bold group-hover:text-sky-400 transition-colors">Cumulative Rank</p>
                <p className="text-4xl font-serif text-white">#1,422</p>
              </div>
              <div className="cinematic-card p-8 group">
                <p className="text-gray-600 text-[10px] tracking-[0.2em] uppercase mb-2 font-bold group-hover:text-purple-400 transition-colors">Status</p>
                <p className="text-xl font-serif text-white uppercase tracking-wider">Core</p>
              </div>
              <div className="cinematic-card p-8 col-span-2 group">
                <p className="text-gray-600 text-[10px] tracking-[0.2em] uppercase mb-4 font-bold group-hover:text-sky-400 transition-colors">Primary Repository</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-serif text-white">facebook/react</p>
                  <p className="text-sky-400 font-mono text-sm">+842.1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Table Section */}
      <section className="py-40 px-4 bg-black/20">
        <div className="container mx-auto max-w-4xl text-center mb-20">
          <h2 className="editorial-heading text-4xl md:text-5xl mb-4">Elite Contributors</h2>
          <p className="text-gray-500 tracking-widest uppercase text-xs font-bold">The vanguard of software engineering</p>
        </div>

        <div className="container mx-auto max-w-4xl">
          <div className="cinematic-card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
                  <th className="px-10 py-6">Rank</th>
                  <th className="px-10 py-6">Engineer</th>
                  <th className="px-10 py-6 text-right">Impact Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboardLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-10 py-6"><div className="h-4 w-4 bg-white/5 rounded" /></td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-white/5 rounded-full" />
                          <div className="h-4 w-32 bg-white/5 rounded" />
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right"><div className="h-4 w-16 bg-white/5 ml-auto rounded" /></td>
                    </tr>
                  ))
                ) : (
                  leaderboard?.slice(0, 5).map((entry) => (
                    <tr key={entry.username} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-6 font-mono text-gray-600 group-hover:text-sky-400 transition-colors">
                        {entry.rank.toString().padStart(2, '0')}
                      </td>
                      <td className="px-10 py-6">
                        <Link href={`/user/${entry.username}`} className="flex items-center gap-4">
                          <img src={entry.avatarUrl} alt={entry.username} className="w-8 h-8 rounded-full border border-white/10 grayscale group-hover:grayscale-0 transition-all" />
                          <span className="text-white font-medium group-hover:text-sky-400 transition-colors font-serif text-lg">
                            {entry.username}
                          </span>
                        </Link>
                      </td>
                      <td className="px-10 py-6 text-right font-mono text-white font-bold text-lg">
                        {entry.totalScore.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-12">
            <Link href="/leaderboard" className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-600 hover:text-white transition-all border-b border-white/10 pb-2 hover:border-white">
              Full Protocol Ranking &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-32 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-12 mb-16">
            <Link href="https://github.com" className="text-xs tracking-widest uppercase font-bold text-gray-600 hover:text-white transition-all">Source</Link>
            <Link href="#" className="text-xs tracking-widest uppercase font-bold text-gray-600 hover:text-white transition-all">Identity</Link>
            <Link href="#" className="text-xs tracking-widest uppercase font-bold text-gray-600 hover:text-white transition-all">Privacy</Link>
          </div>
          <p className="text-gray-700 text-[10px] tracking-[0.4em] uppercase font-bold">
            GitPulse Protocol • Powered by <span className="text-gray-400">Next.js</span> & <span className="text-gray-400">Neon</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
