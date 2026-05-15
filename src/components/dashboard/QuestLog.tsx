import React from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { MapPin, Zap, Check, ChevronRight, RefreshCw, Link } from 'lucide-react';
import { COURSE_TRANSLATIONS } from '../../data/translations';
import { Link as RouterLink } from 'react-router-dom';

interface QuestLogProps {
  courseData: any[];
  completedLessons: string[];
  targetLang: string;
  uiLang: string;
  xp: number;
  currentLevel: number;
  lessonDifficulty: string;
  t: Record<string, string>;
}

export const QuestLog: React.FC<QuestLogProps> = ({
  courseData,
  completedLessons,
  targetLang,
  uiLang,
  xp,
  currentLevel,
  lessonDifficulty,
  t,
}) => {
  const translations = COURSE_TRANSLATIONS[uiLang] || COURSE_TRANSLATIONS['en'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 md:p-10 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-950/10 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/5 rounded-full pointer-events-none translate-y-1/2 -translate-x-1/4 blur-3xl"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <MapPin className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {t.quest_log || 'Learning Journey'}
            </h2>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                {t.learning_progress || 'Learning Progress'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm">
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-slate-900 dark:text-white font-bold">
              {t.modules_label || 'Modules'}: <span className="text-primary">{completedLessons.length} / {courseData.length}</span>
            </span>
            <span className="flex items-center gap-2 text-sm">
              <Zap className="w-3 h-3 text-amber-500" /> {t.xp_label || 'XP'}: {xp}
            </span>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 mx-2" />
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-slate-900 dark:text-white font-bold">
              {t.rank_label || 'Rank'}: <span className="text-indigo-600 dark:text-indigo-400">{currentLevel}</span>
            </span>
            <span className="text-slate-500">{t.version_label || 'VER'}: 2.2.0</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-32 py-16 px-4 md:px-16">
        <div className="flex flex-col items-center justify-center -mb-20">
          <div className="flex items-center gap-4 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.4em] bg-indigo-50 dark:bg-indigo-950/20 px-6 py-2 rounded-full border border-indigo-100 dark:border-indigo-900/30">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse shadow-lg" />
            <span>{t.analyzing_trajectory || 'Analyzing Tactical Trajectory'}</span>
          </div>
          <div className="w-px h-24 bg-gradient-to-b from-indigo-200 to-transparent dark:from-indigo-900/50 mt-6" />
        </div>

        {courseData.map((lesson, index) => {
          const isCompleted = lesson.lessons.every((l: any) => completedLessons.includes(`${targetLang}_${l.id}`));
          const isCurrent = !isCompleted;
          const isLocked = false;
          const translation = translations?.[lesson.id] || translations?.['en']?.[lesson.id] || { title: lesson.title };
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={lesson.id}
              id={`module-${lesson.id}`}
              className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
            >
              <div className="relative z-20 shrink-0">
                <div
                  className={`w-20 h-20 rounded-[2rem] border-4 flex items-center justify-center transition-all duration-500 ${
                    isCompleted ? 'bg-primary border-white dark:border-slate-800 text-white shadow-xl shadow-primary/20' :
                    isCurrent ? 'bg-white dark:bg-slate-800 border-primary text-primary shadow-2xl shadow-primary/30 z-30' :
                    'bg-slate-100 dark:bg-slate-800 border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-700 shadow-none'
                  }`}
                >
                  {isCompleted ? <Check className="w-10 h-10" strokeWidth={3} /> :
                    isCurrent ? <Zap className="w-10 h-10 animate-pulse" /> :
                    <span className="text-sm font-bold">{lesson.id}</span>}
                </div>
              </div>

              <motion.div
                whileHover={{ y: -5, scale: 1.01 }}
                className={`flex-1 w-full flex flex-col xl:flex-row rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden backdrop-blur-md ${
                  isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30' :
                  isCurrent ? 'bg-white dark:bg-slate-800 border-primary shadow-2xl shadow-primary/5' :
                  'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex-1 p-8 lg:p-10">
                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className={`flex items-center gap-2 pl-1 pr-4 py-1 rounded-full border-2 transition-all ${
                          isCompleted ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' :
                          isCurrent ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700'
                        }`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${
                            isCompleted ? 'bg-white text-emerald-500' :
                            isCurrent ? 'bg-white text-primary animate-pulse' :
                            'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}>
                            {lesson.id}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{t.sector || 'Sector'}</span>
                        </div>

                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${
                          isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          isCurrent ? 'bg-white dark:bg-slate-900 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          <span className="opacity-50 mr-1">{t.topic || 'Topic'}:</span>
                          <span className="font-black">{typeof translation === 'object' ? translation.title : translation}</span>
                        </div>

                        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                          isCompleted ? 'text-emerald-500' :
                          isCurrent ? 'text-primary' :
                          'text-slate-300 dark:text-slate-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-primary animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                          {isCompleted ? t.status_cleared : isCurrent ? t.status_in_progress : t.status_encrypted}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-2xl font-bold mb-2 tracking-tight flex items-center gap-3 uppercase ${
                        isCompleted ? 'text-emerald-600 dark:text-emerald-400' :
                        isCurrent ? 'text-slate-900 dark:text-white' :
                        'text-slate-300 dark:text-slate-700'
                      }`}>
                        {typeof translation === 'object' ? translation.title : translation}
                        {isCompleted && <span className="text-emerald-500 font-bold">✔</span>}
                      </h3>
                      <p className={`text-xs leading-relaxed font-bold uppercase tracking-widest ${
                        isCompleted ? 'text-emerald-600/60' :
                        isCurrent ? 'text-slate-500 dark:text-slate-400' :
                        'text-slate-300/30'
                      }`}>
                        {typeof translation === 'object' ? translation.description : ''}
                      </p>
                    </div>

                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${
                          isCompleted ? 'text-emerald-500' :
                          isCurrent ? 'text-slate-400' :
                          'text-slate-300/30'
                        }`}>
                          {t.progress || 'Progress'}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          isCompleted ? 'text-emerald-600' :
                          isCurrent ? 'text-primary' :
                          'text-slate-300/30'
                        }`}>
                          {Math.round((lesson.lessons.filter((l: any) => completedLessons.includes(`${targetLang}_${l.id}`)).length / lesson.lessons.length) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(lesson.lessons.filter((l: any) => completedLessons.includes(`${targetLang}_${l.id}`)).length / lesson.lessons.length) * 100}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' :
                            'bg-primary shadow-lg shadow-primary/20'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {lesson.lessons.map((l: any, i: number) => {
                        const lessonId = `${targetLang}_${l.id}`;
                        const isLessonCompleted = completedLessons.includes(lessonId);
                        return (
                          <div
                            key={l.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                              isLessonCompleted ?
                              'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 ring-1 ring-emerald-500/20' :
                              isCurrent ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700' :
                              'bg-slate-50/30 border-slate-100 dark:border-slate-800/30'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 border-2 ${
                              isLessonCompleted ?
                              'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/20' :
                              'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600'
                            }`}>
                              {isLessonCompleted ?
                                <Check className="w-5 h-5" strokeWidth={4} /> :
                                <span className="text-xs font-bold">{i + 1}</span>
                              }
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                isLessonCompleted ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-slate-600 dark:text-slate-400' : 'text-slate-300'
                              }`}>
                                {t.lesson_label || 'Lesson'} {i + 1}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">{t.reward || 'Reward'}</span>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">+{lesson.xpReward} {t.xp_label || 'XP'}</span>
                        </div>
                      </div>

{isCurrent && (
                         <RouterLink
                           to={`/lesson/${lesson.lessons.find((l: any) => !completedLessons.includes(`${targetLang}_${l.id}`))?.id || lesson.lessons[0].id}`}
                           className="inline-flex items-center justify-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:translate-y-1"
                         >
                           <span className="text-lg">▶</span>
                           {t.start_lesson || 'Start Mission'}
                         </RouterLink>
                       )}
                       {isCompleted && (
                         <RouterLink
                           to={`/lesson/${lesson.lessons[0].id}`}
                           className="inline-flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                           {t.review || 'Review'}
                         </RouterLink>
                       )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};