import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Zap, BookOpen } from 'lucide-react';
import { MiniLesson } from '../data/miniLessons';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import ReactMarkdown from 'react-markdown';

interface MiniLessonModalProps {
  lesson: MiniLesson;
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniLessonModal({ lesson, isOpen, onClose }: MiniLessonModalProps) {
  const { uiLang, addXp, completeMiniLesson, completedMiniLessons } = useStore();
  const [step, setStep] = useState<'learn' | 'quiz' | 'completed'>('learn');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const isCompleted = completedMiniLessons.includes(lesson.id);

  if (!isOpen) return null;

  const handleOptionSelect = (optIndex: number) => {
    if (isCorrect) return; // Already answered correctly
    
    setSelectedOption(optIndex);
    const correct = optIndex === lesson.correctAnswerIndex;
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => {
        setStep('completed');
        if (!isCompleted) {
          addXp(lesson.xpReward);
          completeMiniLesson(lesson.id);
        }
      }, 1000);
    }
  };

  const title = lesson.title[uiLang] || lesson.title.en;
  const content = lesson.content[uiLang] || lesson.content.en;
  const question = lesson.question[uiLang] || lesson.question.en;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">Mini-Lesson</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {step === 'learn' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="markdown-body prose dark:prose-invert max-w-none prose-indigo">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
                
                <button
                  onClick={() => setStep('quiz')}
                  className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-bold text-lg shadow-md hover:bg-indigo-600 hover:shadow-lg transition-all hover:-translate-y-1 mt-8"
                >
                  {t.continue}
                </button>
              </motion.div>
            )}

            {step === 'quiz' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-8">
                  {question}
                </h3>
                
                <div className="space-y-3">
                  {lesson.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = idx === lesson.correctAnswerIndex;
                    const optionText = typeof opt === 'string' ? opt : (opt[uiLang] || opt.en);
                    
                    let btnClass = "w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all border-2 text-left flex justify-between items-center ";
                    
                    if (selectedOption !== null) {
                      if (isCorrectOption) {
                        btnClass += "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300";
                      } else if (isSelected) {
                        btnClass += "bg-rose-50 dark:bg-rose-900/30 border-rose-500 text-rose-700 dark:text-rose-300";
                      } else {
                        btnClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-50";
                      }
                    } else {
                      btnClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:-translate-y-1 hover:shadow-md";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedOption !== null}
                        onClick={() => handleOptionSelect(idx)}
                        className={btnClass}
                      >
                        <span>{optionText}</span>
                        {selectedOption !== null && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                        {selectedOption !== null && isSelected && !isCorrectOption && <X className="w-6 h-6 text-rose-500" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 'completed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {t.lesson_completed}
                </h3>
                {!isCompleted && (
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-lg bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full mt-4">
                    <Zap className="w-5 h-5 fill-amber-500" />
                    +{lesson.xpReward} XP
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-bold text-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all mt-8"
                >
                  {t.close}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
