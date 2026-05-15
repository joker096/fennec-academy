import { motion } from 'motion/react';
import { Star, Zap, Crosshair, Sparkles } from 'lucide-react';

interface DifficultySelectorProps {
  t: Record<string, string>;
  lessonDifficulty: string;
  onDifficultySelect: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export default function DifficultySelector({ t, lessonDifficulty, onDifficultySelect }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(['easy', 'medium', 'hard'] as const).map((diff) => {
        const isActive = lessonDifficulty === diff;
        const config = {
          easy: {
            icon: <Star className="w-6 h-6" />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            hover: 'hover:border-emerald-500',
            desc: t.difficulty_easy_desc || 'Fewer questions, multiple choice focus, encouraging feedback.'
          },
          medium: {
            icon: <Zap className="w-6 h-6" />,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            hover: 'hover:border-amber-500',
            desc: t.difficulty_medium_desc || 'Balanced mix of tasks and deeper linguistic analysis.'
          },
          hard: {
            icon: <Crosshair className="w-6 h-6" />,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            hover: 'hover:border-rose-500',
            desc: t.difficulty_hard_desc || 'Extreme typing tasks, strict grading, and etymological deep dives.'
          }
        }[diff];

        return (
          <motion.button
            key={diff}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDifficultySelect(diff)}
            className={`relative p-8 rounded-3xl border-2 transition-all text-left bg-white dark:bg-slate-900 flex flex-col gap-4 group beveled-edge ${
              isActive
                ? `${config.border} ring-4 ring-primary/10 shadow-xl`
                : `border-slate-200 dark:border-slate-800 shadow-sm ${config.hover}`
            }`}
          >
            <div className={`p-3 rounded-2xl w-fit ${config.bg} ${config.color} transition-transform group-hover:scale-110`}>
              {config.icon}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-1">
                {t[`difficulty_${diff}` as keyof typeof t] || diff}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {config.desc}
              </p>
            </div>
            <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
              <span>{diff === 'easy' ? '100 XP' : diff === 'hard' ? '250+ XP' : '150 XP'}</span>
              <Sparkles className="w-3 h-3" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}