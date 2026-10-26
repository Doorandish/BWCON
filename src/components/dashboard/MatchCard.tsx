'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import CircularProgress from '@/components/ui/CircularProgress';

interface MatchCardProps {
  startupName: string;
  startupIndustry: string;
  startupStage: string;
  matchScore: number;
  technicalScore?: number;
  maturityScore?: number;
  budgetScore?: number;
  pros: string[];
  cons: string[];
  detailedExplanation: string;
  estimatedCost: string;
  index: number;
}

type TabKey = 'pros_cons' | 'strategic_fit' | 'financials';

export default function MatchCard({
  startupName,
  startupIndustry,
  startupStage,
  matchScore,
  technicalScore,
  maturityScore,
  budgetScore,
  pros,
  cons,
  detailedExplanation,
  estimatedCost,
  index,
}: MatchCardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('pros_cons');

  return (
    <div className="w-full block">
      <GlassCard variant="strong" className="w-full overflow-hidden p-6 sm:p-7">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                #{index + 1} Strategic Fit
              </span>
              <h3 className="text-xl font-bold text-white">{startupName}</h3>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
                {startupIndustry}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30 capitalize">
                {startupStage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
            <div className="text-right hidden sm:block">
              <span className="block text-[11px] uppercase font-semibold text-slate-400">Match Score</span>
              <span className="text-xs text-indigo-300 font-medium">Weighted Fit</span>
            </div>
            <CircularProgress value={matchScore} size={80} strokeWidth={6} />
          </div>
        </div>

        {/* Multi-Dimensional Scoring Transparency */}
        {(technicalScore !== undefined || maturityScore !== undefined || budgetScore !== undefined) && (
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-4">
            <div className="text-center">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Technical Synergy</span>
              <span className="text-sm font-bold text-indigo-400">{technicalScore ?? matchScore}%</span>
              <div className="w-full bg-white/10 rounded-full h-1 mt-1 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${technicalScore ?? matchScore}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Team & Maturity</span>
              <span className="text-sm font-bold text-purple-400">{maturityScore ?? matchScore}%</span>
              <div className="w-full bg-white/10 rounded-full h-1 mt-1 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${maturityScore ?? matchScore}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Budget Fit</span>
              <span className="text-sm font-bold text-emerald-400">{budgetScore ?? matchScore}%</span>
              <div className="w-full bg-white/10 rounded-full h-1 mt-1 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${budgetScore ?? matchScore}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Clean Horizontal Tab Navigation */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-3.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('pros_cons')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border flex items-center gap-2 ${
                activeTab === 'pros_cons'
                  ? 'bg-indigo-500/25 text-white border-indigo-400/50 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border-white/10'
              }`}
            >
              <span>📋</span>
              <span>Pros & Cons</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300">
                {pros.length + cons.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('strategic_fit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border flex items-center gap-2 ${
                activeTab === 'strategic_fit'
                  ? 'bg-indigo-500/25 text-white border-indigo-400/50 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border-white/10'
              }`}
            >
              <span>🎯</span>
              <span>Strategic Fit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('financials')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border flex items-center gap-2 ${
                activeTab === 'financials'
                  ? 'bg-indigo-500/25 text-white border-indigo-400/50 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border-white/10'
              }`}
            >
              <span>💰</span>
              <span>Estimated Financials</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="min-h-[120px]">
            <AnimatePresence mode="wait">
              {activeTab === 'pros_cons' && (
                <motion.div
                  key="pros_cons"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="grid sm:grid-cols-2 gap-3.5"
                >
                  {/* Pros */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      <span>✅</span>
                      <span>Key Synergies & Advantages ({pros.length})</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                          <span className="leading-relaxed">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      <span>⚠️</span>
                      <span>Identified Risks & Trade-Offs ({cons.length})</span>
                    </div>
                    {cons.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                            <span className="leading-relaxed">{con}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        No material operational or technical risks identified.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'strategic_fit' && (
                <motion.div
                  key="strategic_fit"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    <span>🎯</span>
                    <span>Evaluation Rationale & Fit Justification</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                    {detailedExplanation}
                  </p>
                </motion.div>
              )}

              {activeTab === 'financials' && (
                <motion.div
                  key="financials"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                      Estimated Engagement / Pilot Cost
                    </span>
                    <span className="text-2xl font-bold gradient-text">{estimatedCost}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Estimated commercial commitment for an initial integration milestone or pilot implementation.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
