import { motion } from 'motion/react';
import { Heart, Zap, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { AdBanner } from '../AdBanner';

interface LessonHeaderProps {
  t: Record<string, string>;
  currentQ: number;
  questionsLength: number;
  results: ('correct' | 'incorrect' | null)[];
  health: number;
  xpGained: number;
  isPremium: boolean;
  status: 'idle' | 'correct' | 'incorrect';
  selected: string | null;
  currentQuestionType: string;
  currentQuestion: {
    type: string;
    correctAnswer: string;
    promptWord: string;
    options: string[];
    hint?: string;
    transcription?: string;
    word: any;
  } | null;
  visualAid: string | null;
  isFetchingVisualAid: boolean;
  isOnline: boolean;
  onPlayPronunciation: () => void;
  onBuyPremium: () => void;
  onToggleVisualAid?: () => void;
}

function StatusOverlay({ status }: { status: 'correct' | 'incorrect' | 'idle' }) {
  if (status === 'idle') return null;
  const colorClass = status === 'correct' ? 'text-emerald-500' : 'text-rose-500';

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0.5, opacity: 0, x: status === 'incorrect' ? -10 : 10 }}
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div className={`w-40 h-40 rounded-full ${status === 'correct' ? 'bg-emerald-500/10' : 'bg-rose-500/10'} flex items-center justify-center backdrop-blur-sm border-2 ${status === 'correct' ? 'border-emerald-500/20' : 'border-rose-500/20'} shadow-2xl`}>
        <span className={`text-6xl font-bold select-none ${colorClass}`}>{status === 'correct' ? '✓' : '✗'}</span>
      </div>
    </motion.div>
  );
}

export default function LessonHeader({
  t, currentQ, questionsLength, results, health, xpGained,
  isPremium, status, selected, currentQuestionType, currentQuestion,
  visualAid, isFetchingVisualAid, isOnline,
  onPlayPronunciation, onBuyPremium, onToggleVisualAid
}: LessonHeaderProps) {
  return (
    <>
      {!isPremium && <div className="mb-6"><AdBanner /></div>}

      <div className="flex items-center gap-6 mb-12 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group volumetric-shadow transition-all">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {isFetchingVisualAid ? (
          <div className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-inner shrink-0 animate-pulse bg-slate-100 dark:bg-slate-700 flex items-center justify-center beveled-edge">
            <span className="text-slate-300 text-2xl">🖼</span>
          </div>
        ) : visualAid && status !== 'idle' ? (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md shrink-0 beveled-edge">
            <img src={visualAid} alt="Visual Aid" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
        ) : !isPremium && status !== 'idle' ? (
          <div className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md shrink-0 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-2 text-center beveled-edge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-slate-300 mb-1"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-1 leading-tight">AI Visual Aid</p>
            <button onClick={onBuyPremium} className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline leading-tight">{t.upgrade_now}</button>
          </div>
        ) : (
          <div className="relative z-10 text-6xl drop-shadow-md">
            {currentQuestionType === 'mcq-target' || currentQuestionType === 'phonetics' || currentQuestionType === 'typing-target' || currentQuestionType === 'fill-in-the-blank'
              ? '🌐' : '📖'}
          </div>
        )}

        <div className="relative z-10 flex-1">
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{currentQuestion?.promptWord}</div>
          {currentQuestion?.hint && (
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl rounded-tl-sm border border-indigo-100 dark:border-indigo-800/50 text-sm font-bold shadow-sm">{currentQuestion.hint}</div>
            </div>
          )}
          {(currentQuestionType === 'mcq-native' || currentQuestionType === 'typing') && (
            <div className="text-lg text-slate-500 dark:text-slate-400 font-medium">{currentQuestion?.transcription}</div>
          )}
        </div>

        {(currentQuestionType === 'mcq-native' || currentQuestionType === 'mcq-target' || currentQuestionType === 'phonetics' || currentQuestionType === 'typing' || currentQuestionType === 'typing-target' || currentQuestionType === 'fill-in-the-blank') && (
          <button onClick={onPlayPronunciation} className="relative z-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl hover:bg-indigo-200 dark:hover:bg-indigo-800/50 hover:shadow-md hover:-translate-y-1 transition-all focus:ring-2 focus:ring-indigo-500 outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v6m0 0v6m0-6a4 4 0 00-2.536.678M9 12a4 4 0 012.536-.678" /></svg>
          </button>
        )}
      </div>

      <div className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b-2 border-slate-200 dark:border-slate-800 shadow-sm">
        <header className="h-20 flex items-center px-6 max-w-4xl mx-auto w-full gap-5">
          <div className="flex-1 px-2 space-y-2">
            <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.2em] leading-none">PROC_STRE_LOG :: {currentQ + 1} / {questionsLength}</span>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
              <motion.div initial={false} animate={{ width: `${(results.filter(Boolean).length / questionsLength) * 100}%` }} className="absolute inset-y-0 left-0 bg-primary/30 z-0" transition={{ type: 'spring', stiffness: 40, damping: 20 }} />
              <div className="absolute inset-0 flex px-0.5 py-0.5 gap-1">
                {Array.from({ length: questionsLength }).map((_, idx) => {
                  const result = results[idx]; const isCurrent = idx === currentQ;
                  return (
                    <motion.div key={idx} initial={false} animate={{ backgroundColor: result === 'correct' ? '#10b981' : result === 'incorrect' ? '#f43f5e' : isCurrent ? 'var(--color-primary)' : 'rgba(148, 163, 184, 0.1)', opacity: isCurrent ? 1 : (result ? 0.8 : 0.4), scaleY: isCurrent ? 1.2 : 1 }} className={`flex-1 h-full rounded-sm transition-all relative ${isCurrent ? 'shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)] z-10' : ''}`}>
                      {isCurrent && <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }} className="absolute inset-y-0 left-0 bg-primary/40 rounded-sm" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1.5 min-w-[60px]">
              <div className="flex items-center gap-2 text-rose-500 font-mono font-black text-[10px] uppercase tracking-widest leading-none"><Heart className="w-4 h-4 fill-rose-500" />{health}%</div>
              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden"><motion.div animate={{ width: `${health}%` }} className="h-full bg-rose-500" /></div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded border-2 border-slate-200 dark:border-slate-800 shadow-sm"><Zap className="w-4 h-4 text-amber-500 fill-amber-500" /><span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">{xpGained}</span></div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto w-full px-6 py-1 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.question || 'Question'} {currentQ + 1} / {questionsLength}</div><div className="flex gap-4"><div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{results.filter(r => r === 'correct').length}</div><div className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1"><XCircle className="w-3 h-3" />{results.filter(r => r === 'incorrect').length}</div></div></div>
      </div>
      <StatusOverlay status={status} />
    </>
  );
}