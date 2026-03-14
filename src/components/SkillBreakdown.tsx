"use client";

import { cn } from "@/lib/utils";

interface SkillBreakdownProps {
  scores: {
    total: number;
    ai: number;
    backend: number;
    frontend: number;
    devops: number;
    data: number;
  };
  className?: string;
}

export function SkillBreakdown({ scores, className }: SkillBreakdownProps) {
  const categories = [
    { label: "AI", value: scores.ai, color: "bg-purple-500" },
    { label: "Backend", value: scores.backend, color: "bg-blue-500" },
    { label: "Frontend", value: scores.frontend, color: "bg-cyan-500" },
    { label: "DevOps", value: scores.devops, color: "bg-green-500" },
    { label: "Data", value: scores.data, color: "bg-yellow-500" },
  ];

  // Calculate percentages relative to the highest category score or a fixed maximum
  const maxScore = Math.max(...categories.map(c => c.value), 10);

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <h4 className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-500 mb-4">Skill Breakdown</h4>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.label} className="group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono text-neutral-400 group-hover:text-white transition-colors">
                {category.label}
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {category.value.toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-1000 ease-out rounded-full", category.color)}
                style={{ width: `${Math.min((category.value / maxScore) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-neutral-600 font-mono mt-4 italic uppercase">
        * Category scores derived from repository topics & languages
      </p>
    </div>
  );
}
