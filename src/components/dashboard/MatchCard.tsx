'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import CircularProgress from '@/components/ui/CircularProgress';
import Accordion from '@/components/ui/Accordion';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard variant="strong" className="overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{startupName}</h3>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
                {startupIndustry}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30 capitalize">
                {startupStage}
              </span>
            </div>
          </div>
          <CircularProgress value={matchScore} size={90} strokeWidth={6} />
        </div>

        {/* Multi-Dimensional Scoring Transparency */}
        {(technicalScore !== undefined || maturityScore !== undefined || budgetScore !== undefined) && (
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-5">
            <div className="text-center">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Technical Synergy</span>
              <span className="text-base font-bold text-indigo-400">{technicalScore ?? matchScore}%</span>
              <div className="w-full bg-white/10 rounded-full h-1 mt-1 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${technicalScore ?? matchScore}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Team & Maturity</span>
              <span className="text-base font-bold text-purple-400">{maturityScore ?? matchScore}%</span>
              <div className="w-full bg-white/10 rounded-full h-1 mt-1 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${maturityScore ?? matchScore}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Budget Fit</span>
              <span className="text-base font-bold text-emerald-400">{budgetScore ?? matchScore}%</span>
              <div className="w-full bg-white/10 rounded-full h-1 mt-1 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${budgetScore ?? matchScore}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Accordions */}
        <div className="space-y-2">
          <Accordion title="Pros" icon="✅" defaultOpen={true}>
            <ul className="space-y-2">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </Accordion>

          <Accordion title="Cons" icon="⚠️">
            <ul className="space-y-2">
              {cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </Accordion>

          <Accordion title="Strategic Fit (Explanation)" icon="🎯">
            <p className="leading-relaxed">{detailedExplanation}</p>
          </Accordion>

          <Accordion title="Estimated Financials" icon="💰">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold gradient-text">{estimatedCost}</span>
            </div>
          </Accordion>
        </div>
      </GlassCard>
    </motion.div>
  );
}
