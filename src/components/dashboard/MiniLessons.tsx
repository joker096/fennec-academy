import React from 'react';
import { motion } from 'motion/react';

interface MiniLessonsProps {
  availableMiniLessons: any[];
  completedMiniLessons: string[];
  selectedMiniLesson: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  uiLang: string;
}

export const MiniLessons: React.FC<MiniLessonsProps> = ({
  availableMiniLessons,
  completedMiniLessons,
  selectedMiniLesson,
  onSelect,
  onClose,
  uiLang,
}) => {
  if (availableMiniLessons.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-10 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl"
    >
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 shadow-sm">
          <span className="text-2xl">💡</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
            Briefings
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Quick tips and rules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableMiniLessons.map((lesson: any) => {
          const isCompleted = completedMiniLessons.includes(lesson.id);
          const title = lesson.title[uiLang] || lesson.title.en;
          const description = lesson.description[uiLang] || lesson.description.en;

          return (
            <div
              key={lesson.id}
              onClick={() => onSelect(lesson.id)}
              className={`p-8 rounded-3xl border transition-all cursor-pointer flex flex-col h-full group/lesson shadow-sm ${
                isCompleted
                  ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 grayscale-[0.5]'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className={`font-bold uppercase tracking-tight text-xl ${
                  isCompleted ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white group-hover/lesson:text-primary transition-colors'
                }`}>
                  {title}
                </h3>
                {isCompleted && <span className="text-emerald-500 font-bold">✔</span>}
              </div>
              <p className={`text-sm font-medium flex-1 leading-relaxed ${
                isCompleted ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {description}
              </p>
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                {!isCompleted && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl uppercase tracking-widest">
                    ⚡ +{lesson.xpReward} XP
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};