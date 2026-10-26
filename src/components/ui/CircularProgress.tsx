'use client';

import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function CircularProgress({
  value,
  size = 100,
  strokeWidth = 8,
  className = '',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' };
    if (score >= 60) return { stroke: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' };
    if (score >= 40) return { stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' };
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
  };

  const colors = getColor(value);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{
            filter: `drop-shadow(0 0 8px ${colors.glow})`,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-2xl font-bold text-white"
        >
          {value}%
        </motion.span>
        <span className="text-xs text-slate-400">Match</span>
      </div>
    </div>
  );
}
