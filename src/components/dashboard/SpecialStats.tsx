import React from 'react';
import { motion } from 'motion/react';

interface SpecialStatsProps {
  special: Record<string, number>;
  specialProgress: Record<string, number>;
  t: Record<string, string>;
}

const STAT_LABELS: Record<string, string> = {
  S: 'Focus',
  P: 'Perception',
  E: 'Stamina',
  C: 'Eloquence',
  I: 'Logic',
  A: 'Agility',
  L: 'Intuition',
};

export const SpecialStats: React.FC<SpecialStatsProps> = ({ special, specialProgress, t }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-4 mt-2">
      {Object.entries(special).map(([stat, val]) => (
        <div key={stat} className="flex items-center gap-2 bg-card border border-border px-2.5 py-1.5 rounded-lg group relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-1.5 relative z-10">
            <span className="font-black text-[9px] text-primary leading-none">{stat}</span>
            <span className="font-black text-xs text-slate-900 dark:text-white leading-none">{val}</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-muted">
            <motion.div
              animate={{ width: `${specialProgress[stat as keyof typeof specialProgress] || 0}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      ))}
    </div>
  );
};