import { motion, AnimatePresence } from 'motion/react';
import { X, Map, CheckCircle2, Crosshair } from 'lucide-react';

function CourseMapLockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

interface CourseMapModalProps {
  t: Record<string, string>;
  showCourseMap: boolean;
  completedLessons: string[];
  lessonId: number;
  onHideCourseMap: () => void;
  onNavigate: (path: string) => void;
  courseData: any[];
  COURSE_TRANSLATIONS: Record<string, Record<number, { title: string }>>;
  uiLang: string;
  targetLang: string;
}

export default function CourseMapModal({
  t, showCourseMap, completedLessons, lessonId, onHideCourseMap,
  onNavigate, courseData, COURSE_TRANSLATIONS, uiLang, targetLang
}: CourseMapModalProps) {
  return (
    <AnimatePresence>
      {showCourseMap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          onClick={onHideCourseMap}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Map className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-lg">{t.course_map}</h2>
              </div>
              <button onClick={onHideCourseMap} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {courseData.map((lesson, index) => {
                const isCompleted = completedLessons.includes(`${targetLang}_${lesson.id}`);
                const isCurrent = !isCompleted && !courseData.slice(0, index).some(l => !completedLessons.includes(`${targetLang}_${l.id}`));
                const translation = COURSE_TRANSLATIONS[uiLang]?.[lesson.id] || COURSE_TRANSLATIONS['en'][lesson.id];

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      onHideCourseMap();
                      const targetLessonId = lesson.lessons.find((l: any) => !completedLessons.includes(`${targetLang}_${l.id}`))?.id || lesson.lessons[0].id;
                      if (targetLessonId !== lessonId) onNavigate(`/lesson/${targetLessonId}`);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      lesson.id === lessonId
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-md'
                        : isCompleted
                          ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                          : isCurrent
                            ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      lesson.id === lessonId ? 'bg-indigo-500 text-white' :
                      isCompleted ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' :
                      isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 border border-indigo-200 dark:border-indigo-800' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}>
                      {isCompleted && lesson.id !== lessonId ? <CheckCircle2 className="w-5 h-5" /> :
                       isCurrent && lesson.id !== lessonId ? <Crosshair className="w-5 h-5" /> :
                       lesson.id === lessonId ? <Map className="w-5 h-5" /> :
                       <CourseMapLockIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                        {t.sector || 'Module'} {lesson.id}
                      </div>
                      <div className={`font-bold ${lesson.id === lessonId ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>
                        {translation?.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}