import { motion } from 'motion/react';
import { Zap, History, BookOpen, Globe, AlertTriangle, Lightbulb, Lock } from 'lucide-react';

interface DeepDivePanelProps {
  t: Record<string, string>;
  isPremium: boolean;
  status: 'idle' | 'correct' | 'incorrect';
  isFetchingDeepDive: boolean;
  deepDive: any;
  onFetchDeepDive: () => void;
  onBuyPremium: () => void;
}

export default function DeepDivePanel({
  t, isPremium, status, isFetchingDeepDive, deepDive,
  onFetchDeepDive, onBuyPremium
}: DeepDivePanelProps) {
  if (status === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 mb-12 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Zap className="w-5 h-5" />
          <h3 className="font-bold text-lg">{t.deep_dive || 'Deep Dive'}</h3>
        </div>
        {!deepDive && !isFetchingDeepDive && (
          <button
            onClick={onFetchDeepDive}
            className={`text-xs font-bold uppercase tracking-widest hover:underline ${!isPremium ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`}
          >
            {t.analyze_word || 'Analyze Word'} {!isPremium && <Lock className="w-3 h-3 inline ml-1" />}
          </button>
        )}
      </div>

      {!isPremium && !deepDive ? (
        <div className="text-center py-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t.upgrade_deep_dive}</p>
          <button onClick={onBuyPremium} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
            {t.upgrade_now}
          </button>
        </div>
      ) : isFetchingDeepDive ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        </div>
      ) : deepDive ? (
        <div className="space-y-6 text-left">
          {deepDive.etymology && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <History className="w-3 h-3" />
                Etymology
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{deepDive.etymology}"</p>
            </div>
          )}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Grammar & Usage
            </div>
            <ul className="list-disc list-inside space-y-1">
              {deepDive.grammarRules?.map((rule: string, i: number) => (
                <li key={i} className="text-sm text-slate-700 dark:text-slate-300">{rule}</li>
              ))}
            </ul>
          </div>
          {deepDive.culturalContext && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Cultural Context
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{deepDive.culturalContext}</p>
            </div>
          )}
          <div>
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {t.common_mistakes || 'Common Mistakes'}
            </div>
            <ul className="list-disc list-inside space-y-1">
              {deepDive.commonMistakes?.map((mistake: string, i: number) => (
                <li key={i} className="text-sm text-rose-600 dark:text-rose-400">{mistake}</li>
              ))}
            </ul>
          </div>
          {deepDive.mnemonics && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                {t.mnemonic_device || 'Mnemonic'}
              </div>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">{deepDive.mnemonics}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 italic text-sm">
          {t.analyze_word_hint || 'Click "Analyze Word" to get a deep linguistic analysis.'}
        </p>
      )}
    </motion.div>
  );
}