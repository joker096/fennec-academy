import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import PetDisplay from '../PetDisplay';

interface LessonLoadingProps {
  t: Record<string, string>;
  isLoading: boolean;
}

export function LessonLoading({ t: _t, isLoading }: LessonLoadingProps) {
  if (!isLoading) return null;
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-zinc-400">Загрузка урока...</p>
      </div>
    </div>
  );
}

interface LessonGeneratingProps {
  t: Record<string, string>;
}

export function LessonGenerating({ t }: LessonGeneratingProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
      <div className="space-y-8 flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full relative"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 text-primary animate-pulse">🤖</div>
          </div>
        </motion.div>
        <div className="text-center">
          <h2 className="text-xl font-mono font-black text-primary uppercase tracking-[0.3em] mb-2">
            {t.generating_curriculum || 'Initializing Learning Module'}
          </h2>
          <div className="flex gap-1 justify-center">
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-primary rounded-full" />
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
          </div>
        </div>
        <PetDisplay className="scale-125" />
      </div>
    </div>
  );
}

interface LessonSuccessProps {
  t: Record<string, string>;
  mistakesMade: number;
  finalXpEarned: number;
  finalCreditsEarned: number;
  onNavigate: (path: string, options?: { replace?: boolean; state?: any }) => void;
  lessonId: string;
  uiLang: string;
}

export function LessonSuccess({ t, mistakesMade, finalXpEarned, finalCreditsEarned, onNavigate, lessonId, uiLang: _uiLang }: LessonSuccessProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ top: '100%', left: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.5, opacity: 0 }}
            animate={{ top: '-10%', opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ duration: Math.random() * 2 + 2, delay: Math.random() * 3, repeat: Infinity, ease: "linear" }}
            className="absolute"
          >
            {i % 3 === 0 ? <div className="text-amber-400 w-4 h-4" /> :
             i % 3 === 1 ? <div className="text-indigo-400 w-3 h-3 fill-current" /> :
             <div className="w-2 h-2 rounded-full bg-emerald-400" />}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 md:p-12 w-full max-w-lg text-center relative z-10 border border-slate-100 dark:border-slate-700"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 relative inline-block"
        >
          <div className={`absolute inset-0 blur-3xl rounded-full animate-pulse ${mistakesMade === 0 ? 'bg-emerald-400/20' : 'bg-amber-400/20'}`}></div>
          <div className={`relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br rounded-full flex items-center justify-center shadow-xl mx-auto border-4 border-white dark:border-slate-700 ${
            mistakesMade === 0
              ? 'from-emerald-400 to-teal-500 shadow-emerald-500/30'
              : 'from-amber-400 to-orange-500 shadow-amber-500/30'
          }`}>
            {mistakesMade === 0 ? (
              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 text-white">✓</div>
                <motion.div
                  initial={{ scale: 0, x: 20, y: -20 }}
                  animate={{ scale: 1, x: 10, y: -10 }}
                  className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg"
                >
                  <div className="w-8 h-8 text-emerald-500">✓</div>
                </motion.div>
              </div>
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 text-white">🏆</div>
            )}
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className={`w-8 h-8 ${mistakesMade === 0 ? 'text-emerald-500' : 'text-amber-500'}`} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight"
        >
          {t.sector_cleared || 'Sector Cleared!'}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 dark:text-slate-400 font-medium mb-10"
        >
          {t.lesson_complete_desc || 'You have successfully completed the training module.'}
        </motion.p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/50"
          >
            <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
              <div className="w-5 h-5 fill-current">⚡</div>
              <span className="text-xs font-black uppercase tracking-widest">XP Earned</span>
            </div>
            <div className="text-3xl font-black text-indigo-900 dark:text-indigo-100">+{finalXpEarned}</div>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-800/50"
          >
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <div className="w-5 h-5 fill-current">🏅</div>
              <span className="text-xs font-black uppercase tracking-widest">Credits</span>
            </div>
            <div className="text-3xl font-black text-amber-900 dark:text-amber-100">+{finalCreditsEarned}</div>
          </motion.div>
        </div>

        {mistakesMade === 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-10 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">✓</div>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              {t.perfect_lesson || 'Perfect Lesson!'}
            </span>
          </motion.div>
        )}

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('/', { state: { lessonCompleted: true, completedLessonId: lessonId } })}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-xl shadow-xl shadow-indigo-500/30 transition-all uppercase tracking-wider"
        >
          {t.continue || 'Continue'}
        </motion.button>
      </motion.div>
    </div>
  );
}