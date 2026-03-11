"use client";

export default function LeaderboardSkeleton() {
  return (
    <div className="cinematic-card overflow-hidden animate-pulse">
      <div className="h-20 bg-white/[0.03] border-b border-white/5" />
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-24 border-b border-white/5 flex items-center px-10 gap-10">
          <div className="w-16 h-8 bg-white/[0.03] rounded-full border border-white/5" />
          <div className="flex items-center gap-5 flex-1">
            <div className="w-10 h-10 bg-white/[0.03] rounded-full border border-white/10" />
            <div className="h-6 w-48 bg-white/[0.03] rounded-lg" />
          </div>
          <div className="h-4 w-32 bg-white/[0.02] rounded-full hidden md:block" />
          <div className="flex flex-col items-end gap-3 ml-auto">
            <div className="h-6 w-24 bg-white/[0.03] rounded-lg" />
            <div className="h-[1px] w-32 bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
