import { motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface OptionButtonsProps {
  t: Record<string, string>;
  selected: string | null;
  status: 'idle' | 'correct' | 'incorrect';
  currentQuestion: {
    type: string;
    correctAnswer: string;
    promptWord: string;
    options: string[];
    hint?: string;
    transcription?: string;
    word: any;
  };
  onSelectOption: (opt: string) => void;
}

export default function OptionButtons({
  t, selected, status, currentQuestion, onSelectOption
}: OptionButtonsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 mt-auto mb-12">
      {currentQuestion.options.map((opt, idx) => (
        <button
          key={opt}
          onClick={() => status === 'idle' && onSelectOption(opt)}
          className={`p-5 text-left font-bold text-lg transition-all rounded-2xl border-2 flex items-center gap-4 beveled-edge ${
            status !== 'idle'
              ? opt === currentQuestion.correctAnswer
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02] volumetric-shadow-emerald ring-2 ring-emerald-500/50'
                : opt === selected
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 shadow-md scale-[0.98] active:translate-y-0.5'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none shadow-sm'
              : selected === opt
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-md scale-[1.02] volumetric-shadow-indigo'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md hover:-translate-y-1 active:translate-y-0 shadow-sm'
          }`}
        >
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 transition-colors ${
            status !== 'idle'
              ? opt === currentQuestion.correctAnswer
                ? 'bg-emerald-500 text-white shadow-sm'
                : opt === selected
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              : selected === opt
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}>
            {status !== 'idle' && opt === currentQuestion.correctAnswer ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : status !== 'idle' && opt === selected && selected !== currentQuestion.correctAnswer ? (
              <XCircle className="w-5 h-5" />
            ) : (
              idx + 1
            )}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}