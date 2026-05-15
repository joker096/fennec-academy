import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Sparkles as SparklesIcon } from 'lucide-react';

interface LessonFooterProps {
  t: Record<string, string>;
  status: 'idle' | 'correct' | 'incorrect';
  currentQuestionType: string;
  currentQuestion: any;
  typedAnswer: string;
  isInputValid: boolean;
  onCheck: () => void;
  uiLang?: string;
  targetLang?: string;
  isPremium?: boolean;
}

export default function LessonFooter({
  t, status, currentQuestionType, typedAnswer, isInputValid, onCheck
}: LessonFooterProps) {
  return (
    <AnimatePresence>
      <motion.footer className="border-t border-slate-200 dark:border-slate-800 p-4 relative z-10 bg-white dark:bg-slate-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" initial={{ y: 100 }} animate={{ y: 0 }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {status === 'correct' && (
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
                <span className="flex items-center gap-2">{t.access_granted || 'Correct!'}{' '}<SparklesIcon className="w-5 h-5 text-amber-400 animate-pulse" /></span>
              </div>
            )}
            {status === 'incorrect' && (
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-xl">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center"><AlertCircle className="w-6 h-6" /></div>
                <div className="flex flex-col"><span className="text-sm text-rose-500 dark:text-rose-400 font-medium">{t.correct_answer_label || 'Correct answer:'}</span><span className="font-mono">{'—'}</span></div>
              </div>
            )}
          </div>
          <button onClick={onCheck} disabled={!isInputValid} className={`px-8 py-3 font-bold text-lg rounded-2xl transition-all shadow-md beveled-edge ${!isInputValid ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none border-slate-200 dark:border-slate-700' : status === 'correct' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 hover:-translate-y-1 active:translate-y-0 border-emerald-600' : status === 'incorrect' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 hover:-translate-y-1 active:translate-y-0 border-rose-600' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20 hover:-translate-y-1 active:translate-y-0 border-indigo-600'}`}>
            {status === 'idle' ? (t.check_answer || 'Check') : (t.continue || 'Continue')}
          </button>
        </div>
      </motion.footer>
    </AnimatePresence>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 16.041a8 8 0 113.414-8.083M9 12h6m-3-3v6m-6.967 4.033L5.5 19.5" />
    </svg>
  );
}