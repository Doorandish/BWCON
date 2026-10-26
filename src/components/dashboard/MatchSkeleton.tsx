'use client';

import GlassCard from '@/components/ui/GlassCard';

interface MatchSkeletonProps {
  count?: number;
}

export default function MatchSkeleton({ count = 2 }: MatchSkeletonProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: count }).map((_, idx) => (
        <GlassCard key={idx} variant="strong" className="overflow-hidden p-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 space-y-2">
              {/* Title */}
              <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
              {/* Badges */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 bg-indigo-500/10 border border-indigo-500/20 rounded-full" />
                <div className="h-5 w-20 bg-purple-500/10 border border-purple-500/20 rounded-full" />
              </div>
            </div>
            {/* Circular Gauge Skeleton */}
            <div className="w-[90px] h-[90px] rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center">
              <div className="h-5 w-10 bg-white/10 rounded" />
            </div>
          </div>

          {/* Multi-Dimensional Scoring Transparency Skeleton */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-5">
            <div className="text-center space-y-1.5">
              <div className="h-2.5 w-16 bg-white/10 rounded mx-auto" />
              <div className="h-4 w-10 bg-indigo-400/20 rounded mx-auto" />
              <div className="w-full bg-white/10 rounded-full h-1" />
            </div>
            <div className="text-center space-y-1.5">
              <div className="h-2.5 w-16 bg-white/10 rounded mx-auto" />
              <div className="h-4 w-10 bg-purple-400/20 rounded mx-auto" />
              <div className="w-full bg-white/10 rounded-full h-1" />
            </div>
            <div className="text-center space-y-1.5">
              <div className="h-2.5 w-16 bg-white/10 rounded mx-auto" />
              <div className="h-4 w-10 bg-emerald-400/20 rounded mx-auto" />
              <div className="w-full bg-white/10 rounded-full h-1" />
            </div>
          </div>

          {/* Accordions Placeholder Skeleton */}
          <div className="space-y-2">
            <div className="h-11 rounded-xl bg-white/5 border border-white/10 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/10 rounded" />
                <div className="h-3 w-16 bg-white/10 rounded" />
              </div>
              <div className="w-3 h-3 bg-white/10 rounded-full" />
            </div>
            <div className="h-11 rounded-xl bg-white/5 border border-white/10 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/10 rounded" />
                <div className="h-3 w-16 bg-white/10 rounded" />
              </div>
              <div className="w-3 h-3 bg-white/10 rounded-full" />
            </div>
            <div className="h-11 rounded-xl bg-white/5 border border-white/10 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/10 rounded" />
                <div className="h-3 w-32 bg-white/10 rounded" />
              </div>
              <div className="w-3 h-3 bg-white/10 rounded-full" />
            </div>
            <div className="h-11 rounded-xl bg-white/5 border border-white/10 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/10 rounded" />
                <div className="h-3 w-28 bg-white/10 rounded" />
              </div>
              <div className="w-3 h-3 bg-white/10 rounded-full" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
