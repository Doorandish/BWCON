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
        <div className="flex items-start justify-between gap-4 mb-6">
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
