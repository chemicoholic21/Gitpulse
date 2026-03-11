"use client";

export default function ProfileSkeleton() {
  return (
    <div className="relative min-h-screen pt-32 pb-40 px-6 overflow-hidden animate-pulse">
      {/* Background Atmosphere */}
      <div className="atmospheric-blur top-[-10%] right-[-10%] opacity-5" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header Skeleton */}
        <header className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-24">
          <div className="w-40 h-40 rounded-full bg-white/[0.03] border border-white/10" />
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-6">
              <div className="h-16 w-64 bg-white/[0.03] rounded-lg" />
              <div className="h-8 w-32 bg-white/[0.03] rounded-full border border-white/5" />
            </div>
            <div className="h-6 w-full max-w-xl bg-white/[0.02] rounded" />
            <div className="flex gap-8 justify-center md:justify-start">
              <div className="h-4 w-24 bg-white/[0.02] rounded" />
              <div className="h-4 w-24 bg-white/[0.02] rounded" />
              <div className="h-4 w-24 bg-white/[0.02] rounded" />
            </div>
          </div>
          <div className="md:text-right space-y-4 pt-4">
            <div className="h-4 w-32 bg-white/[0.02] rounded ml-auto" />
            <div className="h-24 w-64 bg-white/[0.03] rounded-xl ml-auto" />
            <div className="h-4 w-48 bg-white/[0.02] rounded ml-auto" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Table Skeleton */}
          <div className="lg:col-span-2 space-y-10">
            <div className="h-10 w-48 bg-white/[0.03] rounded" />
            <div className="cinematic-card overflow-hidden">
              <div className="h-16 bg-white/[0.03] border-b border-white/5" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 border-b border-white/5 flex items-center px-10 gap-12">
                  <div className="space-y-2">
                    <div className="h-6 w-40 bg-white/[0.03] rounded" />
                    <div className="h-3 w-20 bg-white/[0.02] rounded" />
                  </div>
                  <div className="h-4 w-16 bg-white/[0.02] rounded" />
                  <div className="h-4 w-32 bg-white/[0.02] rounded" />
                  <div className="h-8 w-24 bg-white/[0.03] rounded ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Chart Skeleton */}
          <div className="space-y-10">
            <div className="h-10 w-40 bg-white/[0.03] rounded" />
            <div className="cinematic-card p-10 h-[500px] flex flex-col gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="h-3 w-16 bg-white/[0.02] rounded" />
                  <div className="h-3 flex-1 bg-white/[0.03] rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
