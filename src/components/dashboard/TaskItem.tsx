import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';

interface TaskItemProps {
  task: any;
  formattedDate: string;
  isOverdue: boolean;
  t: Record<string, string>;
  onEdit: (task: any) => void;
  onRemove: (id: string) => void;
  onComplete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task, formattedDate, isOverdue, t, onEdit, onRemove, onComplete,
}) => {
  const categoryIcons: Record<string, React.ReactNode> = {
    lesson: <span className="text-[10px]">📖</span>,
    vocabulary: <span className="text-[10px]">🌐</span>,
    training: <span className="text-[10px]">🏋️</span>,
    exploration: <span className="text-[10px]">🧭</span>,
    other: <span className="text-[10px]">📋</span>,
  };

  return (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between p-6 bg-white dark:bg-slate-900 border transition-all relative overflow-hidden group/item rounded-3xl ${
        task.completed
          ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/10 opacity-60 grayscale-[0.5]'
          : isOverdue
            ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 shadow-lg shadow-rose-500/5'
            : (task.priority || 'medium') === 'high'
              ? 'border-rose-100 dark:border-rose-900/20 bg-rose-50/50 dark:bg-rose-950/10'
              : (task.priority || 'medium') === 'medium'
                ? 'border-amber-100 dark:border-amber-900/20 bg-amber-50/50 dark:bg-amber-950/10'
                : 'border-slate-100 dark:border-slate-800 hover:border-primary/30 bg-slate-50 dark:bg-slate-800 hover:shadow-xl'
      }`}
    >
      {!task.completed && (
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          (task.priority || 'medium') === 'high' ? 'bg-rose-500' :
          (task.priority || 'medium') === 'medium' ? 'bg-amber-500' :
          'bg-primary'
        } shadow-sm`} />
      )}

      <div className="flex items-center gap-6 relative z-10">
        <button
          onClick={() => onComplete(task.id)}
          disabled={task.completed}
          className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg'
              : isOverdue
                ? 'border-rose-200 text-rose-500 bg-white dark:bg-slate-800 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                : 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 bg-white dark:bg-slate-800 hover:border-primary hover:text-primary'
          }`}
        >
          <AnimatePresence mode="wait">
            {task.completed ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              >
                ✔
              </motion.div>
            ) : null}
          </AnimatePresence>
        </button>
        <div>
          <h3 className={`text-lg font-bold tracking-tight flex flex-wrap items-center gap-3 uppercase ${
            task.completed ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-900 dark:text-white'
          }`}>
            {task.title}
            {task.completed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-emerald-500 text-white text-[10px] rounded-full font-bold uppercase tracking-widest shadow-sm"
              >
                {t.task_done || 'COMPLETE'}
              </motion.span>
            )}
            {isOverdue && !task.completed && (
              <span className="px-3 py-1 bg-rose-600 text-white text-[10px] rounded-full font-bold uppercase tracking-widest animate-pulse shadow-rose-500/20 shadow-lg">
                {t.task_overdue || 'OVERDUE'}
              </span>
            )}
          </h3>
          <div className="flex flex-wrap items-center gap-5 mt-3">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest flex items-center gap-2 border ${
              (task.priority || 'medium') === 'high' ? 'text-rose-600 border-rose-200 bg-rose-50' :
              (task.priority || 'medium') === 'medium' ? 'text-amber-600 border-amber-200 bg-amber-50' :
              'text-indigo-600 border-indigo-100 bg-indigo-50 dark:text-indigo-400 dark:border-indigo-900/30'
            }`}>
              {categoryIcons[task.category as string] || null}
              {(task.priority || 'medium') === 'high' ? t.priority_high : (task.priority || 'medium') === 'medium' ? t.priority_medium : t.priority_low}
            </span>
            {task.category && (
              <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                {categoryIcons[task.category as string]}
                {task.category}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isOverdue && !task.completed ? 'text-rose-500' : 'text-slate-400'}`}>
              {isOverdue && !task.completed && <span className="text-red-500">⚠️</span>}
              {formattedDate}
            </span>
            {!task.completed && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress || 0}%` }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-primary">{task.progress || 0}%</span>
              </div>
            )}
            {!task.completed && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                +{task.xpReward} XP
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <button
          onClick={() => onEdit(task)}
          className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary hover:bg-primary/10 transition-all rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"
        >
          ✏️
        </button>
        <button
          onClick={() => onRemove(task.id)}
          className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm"
        >
          🗑️
        </button>
      </div>
    </motion.div>
  );
};