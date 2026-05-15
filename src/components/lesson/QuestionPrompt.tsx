import { motion, AnimatePresence } from 'motion/react';
import { Volume2 } from 'lucide-react';

interface QuestionPromptProps {
  t: Record<string, string>;
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
  isPremium: boolean;
  status: 'idle' | 'correct' | 'incorrect';
  isOnline: boolean;
  targetLang: string;
  uiLang: string;
  currentLang: { name: Record<string, string> } | undefined;
  onPlayPronunciation: () => void;
  onBuyPremium: () => void;
}

export default function QuestionPrompt({
  t, currentQuestionType, currentQuestion, visualAid, isFetchingVisualAid,
  isPremium, status, isOnline, targetLang, uiLang, currentLang,
  onPlayPronunciation, onBuyPremium
}: QuestionPromptProps) {
  if (!currentQuestion) return null;

  const isListeningType = currentQuestionType === 'listening' || currentQuestionType === 'listening-phonetics';

  return (
    <AnimatePresence>
      {isListeningType ? (
        <ListeningVisualAid
          t={t}
          visualAid={visualAid}
          isFetchingVisualAid={isFetchingVisualAid}
          isPremium={isPremium}
          status={status}
          isOnline={isOnline}
          onPlayPronunciation={onPlayPronunciation}
          onBuyPremium={onBuyPremium}
        />
      ) : (
        <NormalVisualAid
          t={t}
          currentQuestionType={currentQuestionType}
          currentQuestion={currentQuestion}
          visualAid={visualAid}
          isFetchingVisualAid={isFetchingVisualAid}
          isPremium={isPremium}
          status={status}
          targetLang={targetLang}
          uiLang={uiLang}
          currentLang={currentLang}
          onPlayPronunciation={onPlayPronunciation}
          onBuyPremium={onBuyPremium}
        />
      )}
    </AnimatePresence>
  );
}

function NormalVisualAid({
  t, currentQuestionType, currentQuestion, visualAid, isFetchingVisualAid,
  isPremium, status, targetLang, uiLang, currentLang,
  onPlayPronunciation, onBuyPremium
}: any) {
  return (
    <div className="flex items-center gap-6 mb-12 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group volumetric-shadow transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {isFetchingVisualAid ? (
        <div className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-inner shrink-0 animate-pulse bg-slate-100 dark:bg-slate-700 flex items-center justify-center beveled-edge">
          <span className="text-slate-300 text-2xl">🖼</span>
        </div>
      ) : visualAid && status !== 'idle' ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md shrink-0 beveled-edge"
        >
          <img src={visualAid} alt="Visual Aid" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </motion.div>
      ) : !isPremium && status !== 'idle' ? (
        <div className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md shrink-0 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-2 text-center beveled-edge">
          <LockIcon className="w-4 h-4 text-slate-300 mb-1" />
          <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-1 leading-tight">AI Visual Aid</p>
          <button onClick={onBuyPremium} className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline leading-tight">
            {t.upgrade_now}
          </button>
        </div>
      ) : (
        <div className="relative z-10 text-6xl drop-shadow-md">
          {currentQuestionType === 'mcq-target' || currentQuestionType === 'phonetics' || currentQuestionType === 'typing-target' || currentQuestionType === 'fill-in-the-blank'
            ? '🌐'
            : currentLang?.flag || '📖'
          }
        </div>
      )}

      <div className="relative z-10 flex-1">
        <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
          {currentQuestion.promptWord}
        </div>
        {currentQuestion.hint && (
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl rounded-tl-sm border border-indigo-100 dark:border-indigo-800/50 text-sm font-bold shadow-sm">
              {currentQuestion.hint}
            </div>
          </div>
        )}
        {(currentQuestionType === 'mcq-native' || currentQuestionType === 'typing') && (
          <div className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            {currentQuestion.transcription}
          </div>
        )}
      </div>

      {(currentQuestionType === 'mcq-native' || currentQuestionType === 'mcq-target' || currentQuestionType === 'phonetics' || currentQuestionType === 'typing' || currentQuestionType === 'typing-target' || currentQuestionType === 'fill-in-the-blank') && (
        <button
          onClick={onPlayPronunciation}
          className="relative z-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl hover:bg-indigo-200 dark:hover:bg-indigo-800/50 hover:shadow-md hover:-translate-y-1 transition-all focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v6m0 0v6m0-6a4 4 0 00-2.536.678M9 12a4 4 0 012.536-.678" /></svg>
        </button>
      )}
    </div>
  );
}

function ListeningVisualAid({
  t, visualAid, isFetchingVisualAid, isPremium, status, isOnline,
  onPlayPronunciation, onBuyPremium
}: any) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 mb-12 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {isFetchingVisualAid ? (
        <div className="relative z-10 w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mb-2 animate-pulse bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <span className="text-slate-300 text-3xl">🖼</span>
        </div>
      ) : visualAid && status !== 'idle' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mb-2"
        >
          <img src={visualAid} alt="Visual Aid" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </motion.div>
      ) : !isPremium && status !== 'idle' ? (
        <div className="relative z-10 w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mb-2 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-4 text-center">
          <LockIcon className="w-6 h-6 text-slate-300 mb-2" />
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">AI Visual Aid</p>
          <button onClick={onBuyPremium} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">
            {t.upgrade_now}
          </button>
        </div>
      ) : null}

      <button
        onClick={onPlayPronunciation}
        className="relative z-10 bg-indigo-500 text-white p-8 rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 hover:scale-110 hover:shadow-indigo-500/40 transition-all focus:ring-4 focus:ring-indigo-500/30 outline-none"
      >
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v6m0 0v6m0-6a4 4 0 00-2.536.678M9 12a4 4 0 012.536-.678" /></svg>
      </button>
      <div className="relative z-10 text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">
        [ PLAY AUDIO ]
      </div>
    </div>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}