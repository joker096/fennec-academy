import React from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { Zap, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SRSFlashcard } from '../SRSFlashcard';

interface QuickSRSProps {
  nextDueWord: any;
  sessionCompleted: boolean;
  onComplete: () => void;
  t: Record<string, string>;
  addXp: (amount: number) => void;
  addNotification: (message: string, type: string) => void;
}

export const QuickSRS: React.FC<QuickSRSProps> = ({
  nextDueWord,
  sessionCompleted,
  onComplete,
  t,
  addXp,
  addNotification,
}) => {
  if (!nextDueWord || sessionCompleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden transition-all group shadow-xl"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-md text-left">
<h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight mb-4 uppercase">
             <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-md shadow-primary/20">
               <Zap className="w-5 h-5 fill-white" />
             </div>
             {t.quick_srs_training || 'Survival Vocabulary Training'}
           </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
            {t.quick_srs_desc || 'Spaced repetition keeps your memory sharp.'}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="px-5 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] shadow-sm">
              {t.critical_data || 'priority: urgent'}
            </div>
            <Link
              to="/flashcards"
              className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 uppercase tracking-[0.2em]"
            >
              {t.view_all || 'View Full Library'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="w-full max-w-[360px] p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl relative">
          <SRSFlashcard
            word={nextDueWord}
            onComplete={() => {
              onComplete();
              addXp(10);
              addNotification(t.word_reviewed_xp || 'Word reviewed! +10 XP', 'success');
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};