import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Bot, AlertTriangle, Sparkles } from 'lucide-react';
import Tooltip from '../Tooltip';
import PetDisplay from '../PetDisplay';

interface AIAssistantButtonProps {
  t: Record<string, string>;
  status: 'idle' | 'correct' | 'incorrect';
  isListening: boolean;
  dogMessage: string | null;
  dogHintUsed: boolean;
  currentQuestionType: string;
  isFetchingPronunciation: boolean;
  pronunciationFeedback: any;
  onStartListening: () => void;
  onStopListening: () => void;
  onFetchAIHints: () => void;
  uiLang?: string;
  targetLang?: string;
  isPremium?: boolean;
  isOnline?: boolean;
  special?: Record<string, number>;
  equippedPerks?: string[];
  health?: number;
}

export default function AIAssistantButton({
  t, status, dogMessage, isListening,
  dogHintUsed, isFetchingPronunciation, pronunciationFeedback,
  onStartListening, onStopListening, onFetchAIHints
}: AIAssistantButtonProps) {
  return (
    <div className="relative flex flex-col items-end">
      <AnimatePresence>
        {dogMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full mb-3 right-0 flex items-end gap-2 max-w-[280px] z-20"
          >
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-100 px-5 py-3 rounded-3xl rounded-br-sm shadow-xl text-sm font-medium whitespace-normal relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
              {dogMessage}
            </div>
            <PetDisplay size="sm" hideMessage className="mb-1" />
          </motion.div>
        )}
      </AnimatePresence>
      <Tooltip content={t.ask_ai_assistant || 'Ask Fennec for a hint'} position="top">
        <button
          onClick={onFetchAIHints}
          disabled={dogHintUsed || status !== 'idle'}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-sm ${
            dogHintUsed || status !== 'idle'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/50 shadow-sm border border-amber-200 dark:border-amber-800/50'
          }`}
        >
          <PetDisplay size="sm" hideMessage className="border-none shadow-none bg-transparent p-0" />
          <span className="hidden sm:inline">{t.ask_ai_assistant || 'Fennec'}</span>
        </button>
      </Tooltip>

      {status === 'idle' && (
        <button
          onClick={isListening ? onStopListening : onStartListening}
          className={`mt-2 p-3 rounded-xl transition-all ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
          title={isListening ? (t.stop_recording || 'Stop') : (t.speak || 'Speak')}
        >
          {isListening
            ? <MicOff className="w-6 h-6" />
            : <Mic className="w-6 h-6" />}
        </button>
      )}

      <AnimatePresence>
        {(isFetchingPronunciation || pronunciationFeedback) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`mt-4 p-4 rounded-2xl border-2 ${
              isFetchingPronunciation
                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 animate-pulse'
                : pronunciationFeedback?.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
            }`}
          >
            {isFetchingPronunciation ? (
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <Bot className="w-5 h-5 animate-spin" />
                <span className="font-bold text-sm uppercase tracking-widest">{t.analyzing_pronunciation}</span>
              </div>
            ) : pronunciationFeedback && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {pronunciationFeedback.isCorrect ? (
                      <div className="w-5 h-5 text-emerald-500">✓</div>
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    <span className={`font-bold text-sm uppercase tracking-widest ${pronunciationFeedback.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {pronunciationFeedback.isCorrect ? t.great_pronunciation : t.needs_practice}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {pronunciationFeedback.feedback}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}