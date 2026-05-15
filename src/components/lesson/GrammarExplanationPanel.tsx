import { motion } from 'motion/react';
import { Globe, Bot, AlertTriangle, Volume2 } from 'lucide-react';

interface GrammarExplanationPanelProps {
  t: Record<string, string>;
  isPremium: boolean;
  status: 'idle' | 'correct' | 'incorrect';
  currentQuestion: {
    type: string;
    correctAnswer: string;
    promptWord: string;
    options: string[];
    hint?: string;
    transcription?: string;
    word: any;
  } | null;
  grammarExplanation: any;
  isFetchingGrammar: boolean;
  onFetchGrammar: () => void;
  onBuyPremium: () => void;
  uiLang?: string;
  targetLang?: string;
}

export default function GrammarExplanationPanel({
  t, isPremium, status, currentQuestion,
  grammarExplanation, isFetchingGrammar,
  onFetchGrammar, onBuyPremium
}: GrammarExplanationPanelProps) {
  if (status !== 'incorrect') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 mb-12 p-6 rounded-3xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              {t.error_explanation || 'Fennec Analysis'}
            </h3>
            {!isPremium && <Bot className="w-3 h-3 text-amber-500" />}
          </div>

          {!isPremium ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mb-2">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                  {t.correct_answer_label || 'Correct Answer'}
                </div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {currentQuestion?.correctAnswer}
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                {t.premium_only_ai_desc || 'AI-powered analysis is available for Premium users.'}
              </p>
            </div>
          ) : !grammarExplanation && !isFetchingGrammar ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mb-2">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                  {t.correct_answer_label || 'Correct Answer'}
                </div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {currentQuestion?.correctAnswer}
                </div>
              </div>
              <button
                onClick={onFetchGrammar}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                  currentQuestion?.type === 'fill-in-the-blank' || currentQuestion?.word?.grammarRules
                    ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20 scale-[1.02]'
                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 hover:bg-rose-200 dark:hover:bg-rose-900/50'
                }`}
              >
                <Bot className="w-5 h-5" />
                {t.why_incorrect || 'Why is this incorrect?'}
              </button>
            </div>
          ) : isFetchingGrammar ? (
            <div className="flex flex-col gap-3">
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
            </div>
          ) : grammarExplanation ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 shadow-sm">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Shared Knowledge</span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Synced from the Archives</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mb-2">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                  {t.correct_answer_label || 'Correct Answer'}
                </div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {currentQuestion?.correctAnswer}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {grammarExplanation.explanation}
              </p>
              {grammarExplanation.pronunciationTips && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <h4 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                    {t.pronunciation_feedback || 'Pronunciation Feedback'}
                  </h4>
                  <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
                    <Volume2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {grammarExplanation.pronunciationTips}
                    </p>
                  </div>
                </div>
              )}
              {grammarExplanation.commonMistakes && grammarExplanation.commonMistakes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <h4 className="font-bold text-[10px] text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-3">
                    {t.common_mistakes || 'Common Mistakes'}
                  </h4>
                  <ul className="space-y-2">
                    {grammarExplanation.commonMistakes.map((mistake: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-rose-600 dark:text-rose-400 font-medium">
                        <span className="text-rose-500 shrink-0">✕</span>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {grammarExplanation.correctExamples && grammarExplanation.correctExamples.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <h4 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                    {t.correct_examples || 'Correct Usage'}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {grammarExplanation.correctExamples.map((ex: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                        <p className="text-slate-800 dark:text-slate-200 font-bold">"{ex.sentence}"</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{ex.translation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {grammarExplanation.alternativePhrases && grammarExplanation.alternativePhrases.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <h4 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                    {t.alternative_phrases || 'Alternative Phrases'}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {grammarExplanation.alternativePhrases.map((alt: any, idx: number) => (
                      <div key={idx} className="bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
                        <p className="text-indigo-800 dark:text-indigo-200 font-bold">"{alt.phrase}"</p>
                        <p className="text-indigo-600/70 dark:text-indigo-400/70 text-xs mt-1">{alt.translation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic">
              {t.could_not_load_explanation || 'Could not load explanation.'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}