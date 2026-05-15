import { motion } from 'motion/react';
import { BookOpen, Star, Newspaper, Book, MessageCircle, Lock } from 'lucide-react';
import { AdBanner } from '../AdBanner';

interface ContextualExamplesPanelProps {
  t: Record<string, string>;
  isPremium: boolean;
  status: 'idle' | 'correct' | 'incorrect';
  examples: any[];
  isFetchingExamples: boolean;
  currentQuestionType: string;
  currentQuestion: any;
  savedExamples: any[];
  onSaveExample: (word: string, example: any, lang: string) => void;
  onBuyPremium: () => void;
  uiLang?: string;
  targetLang?: string;
}

export default function ContextualExamplesPanel({
  t, isPremium, status, examples, isFetchingExamples,
  currentQuestion, currentQuestionType, savedExamples,
  onSaveExample, onBuyPremium
}: ContextualExamplesPanelProps) {
  if (status === 'idle') return null;

  const wordToFetch = currentQuestionType === 'mcq-native' || currentQuestionType === 'typing'
    ? currentQuestion.correctAnswer
    : currentQuestion.promptWord;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 mb-12 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
        <BookOpen className="w-5 h-5" />
        <h3 className="font-bold text-lg">{t.contextual_examples_title || 'Contextual Examples'}</h3>
        {!isPremium && <Lock className="w-4 h-4 text-amber-500 ml-auto" />}
      </div>

      {!isPremium ? (
        <div className="text-center py-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            {t.premium_only_ai_desc || 'AI-powered examples are available for Premium users.'}
          </p>
          <button onClick={onBuyPremium} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
            {t.unlock_ai || 'Unlock AI Power'}
          </button>
          <div className="mt-6"><AdBanner /></div>
        </div>
      ) : isFetchingExamples ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex flex-col gap-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : examples.length > 0 ? (
        <div className="flex flex-col gap-4">
          {examples.map((ex: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 last:pb-0 relative group/ex">
              <div className="absolute top-0 right-0 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onSaveExample(wordToFetch, ex, ''); }}
                  className={`p-1.5 rounded-lg transition-all ${
                    savedExamples.some((se: any) => se.sentence === ex.sentence)
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                  title={t.save_example || 'Save'}
                >
                  <Star className={`w-3.5 h-3.5 ${savedExamples.some((se: any) => se.sentence === ex.sentence) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-medium pr-8">"{ex.sentence}"</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{ex.translation}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  {ex.source === 'news' && <Newspaper className="w-3 h-3" />}
                  {ex.source === 'books' && <Book className="w-3 h-3" />}
                  {ex.source === 'social media' && <MessageCircle className="w-3 h-3" />}
                  {ex.sourceName || ex.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 italic">{t.no_examples_found || 'No examples found.'}</p>
      )}
    </motion.div>
  );
}