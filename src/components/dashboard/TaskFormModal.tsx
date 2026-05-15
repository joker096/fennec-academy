import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { Calendar } from 'lucide-react';
import DatePicker from '../DatePicker';

interface TaskFormModalProps {
  showAddTask: boolean;
  onClose: () => void;
  editingTaskId: string | null;
  newTaskTitle: string;
  onTitleChange: (v: string) => void;
  newTaskDueDate: string;
  onDueDateChange: (v: string) => void;
  dateError: string | null;
  newTaskPriority: string;
  onPriorityChange: (v: 'low' | 'medium' | 'high') => void;
  newTaskXp: number;
  onXpChange: (v: number) => void;
  newTaskReminder: string;
  onReminderChange: (v: string) => void;
  newTaskCategory: string;
  onCategoryChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  t: Record<string, string>;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  showAddTask, onClose, editingTaskId, newTaskTitle, onTitleChange,
  newTaskDueDate, onDueDateChange, dateError, newTaskPriority, onPriorityChange,
  newTaskXp, onXpChange, newTaskReminder, onReminderChange,
  newTaskCategory, onCategoryChange, onSave, onCancel, t,
}) => {
  if (!showAddTask) return null;

  const categories = [
    { id: 'lesson', label: 'Lesson', icon: '📖' },
    { id: 'vocabulary', label: 'Vocab', icon: '🌐' },
    { id: 'training', label: 'Train', icon: '🏋️' },
    { id: 'exploration', label: 'Explore', icon: '🧭' },
    { id: 'other', label: 'Other', icon: '📋' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                  {editingTaskId ? t.edit_goal || 'Modify Objective' : t.add_goal || 'New Objective'}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {t.task_log_system || 'Registry Entry'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl transition-all"
            >
              ✕
            </button>
          </div>

          <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.goal_title || 'Objective Title'}</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => onTitleChange(e.target.value)}
                  placeholder={t.goal_placeholder || 'Enter goal...'}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all font-bold tracking-tight focus:border-primary focus:bg-white dark:focus:bg-slate-800"
                  autoFocus
                />
              </div>
              <div className="space-y-3">
                <DatePicker
                  label={t.due_date || 'Due Date'}
                  value={newTaskDueDate}
                  onChange={onDueDateChange}
                  error={dateError}
                  minDate={new Date().toISOString().split('T')[0]}
                  className="rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.priority || 'Priority'}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        onPriorityChange(p);
                        onXpChange(p === 'high' ? 50 : p === 'medium' ? 25 : 15);
                      }}
                      className={`py-4 rounded-2xl text-[10px] font-bold flex flex-col items-center gap-2 transition-all border uppercase tracking-widest relative overflow-hidden ${
                        newTaskPriority === p
                          ? p === 'high' ? 'bg-rose-50 border-rose-500 text-rose-600 dark:bg-rose-950/20 shadow-md ring-2 ring-rose-500/20' :
                            p === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-600 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-500/20' :
                            'bg-primary/5 border-primary text-primary dark:bg-primary/10 shadow-md ring-2 ring-primary/20'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {p === 'low' ? t.priority_low : p === 'medium' ? t.priority_medium : t.priority_high}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.xp_reward || 'XP Reward'}</label>
                <div className="relative group/xp">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary">
                    <span className="text-lg">⚡</span>
                  </div>
                  <input
                    type="number"
                    value={newTaskXp}
                    onChange={e => onXpChange(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-16 pr-6 py-4 text-slate-900 dark:text-white focus:border-primary focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-black text-xl"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 border-l border-slate-200 dark:border-slate-700">
                    XP
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.category || 'Category'}</label>
              <div className="grid grid-cols-5 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryChange(cat.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      newTaskCategory === cat.id
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t.reminder_type || 'Reminder'}</label>
              <select
                value={newTaskReminder}
                onChange={e => onReminderChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-5 text-slate-900 dark:text-white focus:border-primary focus:bg-white dark:focus:bg-slate-800 outline-none transition-all appearance-none cursor-pointer font-bold text-sm"
              >
                <option value="none">{t.reminder_none || 'No Reminder'}</option>
                <option value="at_due_date">{t.reminder_at_due_date || 'At Due Date'}</option>
                <option value="1_hour_before">{t.reminder_1_hour_before || '1 Hour Before'}</option>
                <option value="1_day_before">{t.reminder_1_day_before || '1 Day Before'}</option>
              </select>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                onClick={onSave}
                className="flex-[2] bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {editingTaskId ? t.save_settings || 'Save' : t.add_goal || 'Add Objective'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};