import { motion } from 'motion/react';
import { Bot, Lock } from 'lucide-react';

interface CorrectExplanationPanelProps {
  t: Record<string, string>;
  isPremium: boolean;
  status: 'idle' | 'correct' | 'incorrect';
  isFetchingCorrectExplanation: boolean;
  correctExplanation: string | null;
  onBuyPremium: () => void;
  uiLang?: string;
  targetLang?: string;
}

export default function CorrectExplanationPanel({
  t, isPremium, status, isFetchingCorrectExplanation, correctExplanation,
  onBuyPremium
}: CorrectExplanationPanelProps) {
  if (status !== 'correct') return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", damping: 12 }}
      className="mt-4 mb-12 p-6 rounded-3xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
          <Bot className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              {t.ai_learning_fact || 'AI Learning Fact'}
            </h3>
            {!isPremium && <Lock className="w-3 h-3 text-amber-500" />}
          </div>

          {!isPremium ? (
            <div className="space-y-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                {t.premium_only_ai_desc || 'AI-powered facts are available for Premium users.'}
              </p>
              <button onClick={onBuyPremium} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
                {t.unlock_ai || 'Unlock AI Power'}
              </button>
            </div>
          ) : isFetchingCorrectExplanation ? (
            <div className="flex flex-col gap-3">
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </div>
            </div>
          ) : correctExplanation ? (
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {correctExplanation}
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic text-sm">
              {t.doing_great || 'Keep going — you\'re doing great!'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}