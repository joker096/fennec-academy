import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Coins, ShieldCheck, Plus } from 'lucide-react';
import { FACTIONS } from '../../data/factions';

interface StatsCardsProps {
  t: Record<string, string>;
  credits: number;
  factionId: string | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ t, credits, factionId }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mt-6">
      <div className="flex items-center gap-2.5 px-6 py-3 bg-card border border-border rounded-xl group/credits shadow-sm">
        <Coins className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-lg text-slate-900 dark:text-white leading-none">{credits}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{t.credits || 'Credits'}</span>
      </div>

      {factionId ? (
        <Link to="/factions" className="flex items-center gap-2.5 px-6 py-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl hover:border-indigo-300 transition-all group/faction">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xs text-indigo-900 dark:text-indigo-100 uppercase tracking-tight leading-none">
            {FACTIONS.find(f => f.id === factionId)?.name}
          </span>
        </Link>
      ) : (
        <Link to="/factions" className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 rounded-xl border-2 border-dashed border-primary/20 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:border-primary/40 transition-all leading-none">
          <Plus className="w-3 h-3" />
          {t.join_academy || 'Join Department'}
        </Link>
      )}
    </div>
  );
};