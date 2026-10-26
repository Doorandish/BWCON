'use client';

import GlassCard from '@/components/ui/GlassCard';

interface MatchSkeletonProps {
  count?: number;
}

export default function MatchSkeleton({ count = 3 }: MatchSkeletonProps) {
  return (
    <div className="flex flex-col w-full gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <GlassCard key={idx} variant="strong" className="w-full overflow-hidden p-6 sm:p-7 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 bg-indigo-500/10 border border-indigo-500/20 rounded" />
                <div className="h-6 w-1/2 bg-white/10 rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 bg-indigo-500/10 border border-indigo-500/20 rounded-full" />
                <div className="h-5 w-20 bg-purple-500/10 border border-purple-500/20 rounded-full" />
              </div>
            </div>
            <div className="w-[80px] h-[80px] rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center self-end sm:self-center">
              <div className="h-5 w-10 bg-white/10 rounded" />
            </div>
          </div>

          {/* Multi-Dimensional Scoring Transparency Skeleton */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-4">
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

          {/* Tab Navigation Skeleton */}
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-3.5">
              <div className="h-7 w-28 bg-indigo-500/20 rounded-lg border border-indigo-500/30" />
              <div className="h-7 w-24 bg-white/5 rounded-lg border border-white/10" />
              <div className="h-7 w-32 bg-white/5 rounded-lg border border-white/10" />
            </div>

            {/* Tab Content Box Skeleton */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div className="h-24 rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-2">
                <div className="h-3 w-28 bg-white/10 rounded" />
                <div className="h-2.5 w-full bg-white/5 rounded" />
                <div className="h-2.5 w-4/5 bg-white/5 rounded" />
              </div>
              <div className="h-24 rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-2">
                <div className="h-3 w-28 bg-white/10 rounded" />
                <div className="h-2.5 w-full bg-white/5 rounded" />
                <div className="h-2.5 w-4/5 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
