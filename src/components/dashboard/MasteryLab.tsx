import React from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { BrainCircuit, BookMarked, Cpu, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MasteryLabProps {
  mistakes: Record<string, any>;
  t: Record<string, string>;
}

export const MasteryLab: React.FC<MasteryLabProps> = ({ mistakes, t }) => {
  const mistakeCount = Object.keys(mistakes).length;
  if (mistakeCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative group"
    >
      <div className="p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/[0.01] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className={`w-28 h-28 border-2 transition-all duration-500 shadow-xl relative flex items-center justify-center rounded-3xl ${
            mistakeCount > 5
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30'
              : 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/30'
          }`}>
            {mistakeCount > 5 ? (
              <BrainCircuit className="w-12 h-12 animate-pulse" />
            ) : (
              <BookMarked className="w-12 h-12" />
            )}
            <div className={`absolute -top-3 -right-3 ${mistakeCount > 5 ? 'bg-rose-600' : 'bg-primary'} text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg uppercase tracking-widest`}>
              {mistakeCount}
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex flex-wrap items-center justify-center md:justify-start gap-4 uppercase tracking-tight">
              {t.mistakes_bank || 'Cognitive Mastery Lab'}
              {mistakeCount > 5 && (
                <span className="text-[10px] bg-rose-600 text-white px-4 py-1.5 rounded-full font-bold tracking-[0.2em] animate-pulse">
                  {t.urgent || 'URGENT'}
                </span>
              )}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-4 max-w-md">
              {t.mistakes_bank_desc || 'Address and resolve persistent cognitive gaps to strengthen your retention protocols.'}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
              <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-primary uppercase tracking-[0.2em] border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                {t.bonus || 'Optimization Bonus'}: 150 XP / 75 {t.credits || 'Credits'}
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/repair-terminal"
          className={`w-full md:w-auto px-12 py-5 rounded-2xl font-bold transition-all active:scale-95 shadow-xl flex items-center justify-center gap-4 uppercase tracking-[0.1em] ${
            mistakeCount > 5
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
              : 'bg-primary hover:bg-primary/80 text-white shadow-primary/20'
          }`}
        >
          <Cpu className="w-6 h-6" />
          {t.access_terminal || 'Initialize Mastery'}
          <ChevronRight className="w-6 h-6" />
        </Link>
      </div>
    </motion.div>
  );
};