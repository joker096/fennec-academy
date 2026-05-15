import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import { TaskItem } from './TaskItem';
import { TaskFormModal } from './TaskFormModal';
import { TaskCategory, ReminderType } from '../../store/useStore';
import {
  BookOpen,
  Languages,
  Compass,
  ListIcon,
  Dumbbell as TrainingIcon,
  PlusCircle,
  Search,
  Flag,
} from 'lucide-react';

interface TasksSectionProps {
  t: Record<string, string>;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterStatus: 'all' | 'active' | 'completed' | 'overdue';
  setFilterStatus: (v: 'all' | 'active' | 'completed' | 'overdue') => void;
  filterPriority: 'all' | 'low' | 'medium' | 'high';
  setFilterPriority: (v: 'all' | 'low' | 'medium' | 'high') => void;
  sortBy: 'dueDate' | 'priority' | 'status' | 'alphabetical';
  setSortBy: (v: 'dueDate' | 'priority' | 'status' | 'alphabetical') => void;
  showAddTask: boolean;
  setShowAddTask: (v: boolean) => void;
  editingTaskId: string | null;
  setEditingTaskId: (v: string | null) => void;
  newTaskTitle: string;
  setNewTaskTitle: (v: string) => void;
  newTaskDueDate: string;
  setNewTaskDueDate: (v: string) => void;
  dateError: string | null;
  setDateError: (v: string | null) => void;
  newTaskPriority: 'low' | 'medium' | 'high';
  setNewTaskPriority: (v: 'low' | 'medium' | 'high') => void;
  newTaskXp: number;
  setNewTaskXp: (v: number) => void;
  newTaskReminder: string;
  setNewTaskReminder: (v: string) => void;
  newTaskCategory: TaskCategory;
  setNewTaskCategory: (v: TaskCategory) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  t,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  sortBy,
  setSortBy,
  showAddTask,
  setShowAddTask,
  editingTaskId,
  setEditingTaskId,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDueDate,
  setNewTaskDueDate,
  dateError,
  setDateError,
  newTaskPriority,
  setNewTaskPriority,
  newTaskXp,
  setNewTaskXp,
  newTaskReminder,
  setNewTaskReminder,
  newTaskCategory,
  setNewTaskCategory,
  onSave,
  onCancel,
}) => {
  const tasks = useStore((state) => state.tasks);
  const addTask = useStore((state) => state.addTask);
  const completeTask = useStore((state) => state.completeTask);
  const removeTask = useStore((state) => state.removeTask);
  const updateTask = useStore((state) => state.updateTask);
  const addNotification = useStore((state) => state.addNotification);
  const checkReminders = useStore((state) => state.checkReminders);
  const audioServiceImport = useStore((state) => state);
  const categoryIcons: Record<string, React.ReactNode> = {
    lesson: <BookOpen className="w-4 h-4" />,
    vocabulary: <Languages className="w-4 h-4" />,
    training: <><span className="text-[10px]">🏋️</span></>,
    exploration: <Compass className="w-4 h-4" />,
    other: <ListIcon className="w-4 h-4" />,
  };

  const sortedTasks = useMemo(() => {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    const now = new Date();

    return tasks
      .filter((task) => {
        const isOverdue =
          !task.completed && new Date(task.dueDate) < now;
        const matchesSearch = task.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesStatus =
          filterStatus === 'all'
            ? true
            : filterStatus === 'active'
            ? !task.completed && !isOverdue
            : filterStatus === 'completed'
            ? task.completed
            : isOverdue;
        const matchesPriority =
          filterPriority === 'all'
            ? true
            : (task.priority || 'medium') === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'status') {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
        }
        if (sortBy === 'priority') {
          const pA = a.priority || 'medium';
          const pB = b.priority || 'medium';
          if (pA !== pB)
            return priorityMap[pB] - priorityMap[pA];
        }
        if (sortBy === 'alphabetical')
          return a.title.localeCompare(b.title);
        return (
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
      });
  }, [tasks, filterStatus, filterPriority, sortBy, searchQuery]);

  const handleSave = () => {
    if (newTaskTitle && newTaskDueDate && !dateError) {
      if (editingTaskId) {
        updateTask(editingTaskId, {
          title: newTaskTitle,
          dueDate: newTaskDueDate,
          priority: newTaskPriority,
          xpReward: newTaskXp,
          reminderType: newTaskReminder as ReminderType,
        });
        setEditingTaskId(null);
        addNotification(t.task_updated || 'Objective Updated', 'success');
      } else {
addTask(
           newTaskTitle,
           newTaskDueDate,
           newTaskPriority,
           newTaskXp,
           newTaskReminder as ReminderType,
           newTaskCategory
         );
        addNotification(t.task_create_success || 'Objective Logged', 'success');
      }
      checkReminders();
      setNewTaskTitle('');
      setNewTaskDueDate(new Date().toISOString().split('T')[0]);
      setNewTaskReminder('none');
      setNewTaskPriority('medium');
      setNewTaskXp(25);
      setShowAddTask(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl p-10"
    >
      {/* Add Task Button */}
      <div className="flex items-center justify-between mb-10 relative z-10">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          {t.personal_goals || 'Academic Objectives'}
        </h3>
        <button
          onClick={() => {
            setEditingTaskId(null);
            setNewTaskTitle('');
            setNewTaskDueDate(new Date().toISOString().split('T')[0]);
setNewTaskReminder('none' as ReminderType);
            setNewTaskPriority('medium');
            setNewTaskXp(25);
            setNewTaskCategory('other');
            setShowAddTask(true);
          }}
          className="fixed bottom-24 right-8 w-16 h-16 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 active:translate-y-0.5 flex items-center justify-center transform-gpu z-50 group hover:scale-110 active:scale-95"
        >
          <PlusCircle className="w-9 h-9 transition-transform duration-500 ease-out" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-6 mb-10 w-full relative z-10">
        <div className="relative group w-full">
          <input
            type="text"
            placeholder={t.task_search_placeholder || 'Search objectives...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-primary/40 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 font-mono tracking-tight shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
                {t.status || 'Status'}
              </span>
              <div className="flex items-center gap-2">
                {(['all', 'active', 'completed', 'overdue'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                      }}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${
                        filterStatus === status
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-primary/30 shadow-sm'
                      }`}
                    >
                      {status === 'all'
                        ? t.all
                        : status === 'active'
                        ? t.task_active
                        : status === 'completed'
                        ? t.completed
                        : t.task_overdue}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden lg:block" />

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
                {t.priority || 'Priority'}
              </span>
              <div className="flex items-center gap-2">
                {(['all', 'low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                      filterPriority === p
                        ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white dark:text-slate-900 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/30 shadow-sm'
                    }`}
                  >
                    {p !== 'all' && (
                      <Flag
                        className={`w-3.5 h-3.5 ${
                          filterPriority === p
                            ? p === 'high'
                              ? 'text-rose-400'
                              : p === 'medium'
                              ? 'text-amber-400'
                              : 'text-primary'
                            : p === 'high'
                            ? 'text-rose-500'
                            : p === 'medium'
                            ? 'text-amber-500'
                            : 'text-primary'
                        }`}
                      />
                    )}
                    {p === 'all'
                      ? t.all
                      : p === 'low'
                      ? t.priority_low
                      : p === 'medium'
                      ? t.priority_medium
                      : t.priority_high}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
              {t.sort_by || 'Sort By'}
            </span>
            <div className="flex items-center gap-2">
              {(['dueDate', 'priority', 'status', 'alphabetical'] as const).map(
                (sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${
                      sortBy === sort
                        ? 'bg-slate-100 dark:bg-slate-700 border-primary text-primary shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/30 shadow-sm'
                    }`}
                  >
                    {sort === 'dueDate'
                      ? t.sort_due_date || 'Due Date'
                      : sort === 'priority'
                      ? t.sort_priority || 'Priority'
                      : sort === 'status'
                      ? t.sort_status || 'Status'
                      : t.sort_alphabetical || 'A-Z'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4 relative z-10">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-20 terminal-panel bg-primary/2 border-dashed border-2 border-primary/10 rounded-none text-primary/20 font-black uppercase tracking-[0.4em] italic shadow-inner">
            {t.no_goals || 'No active academic objectives'}
          </div>
        ) : (
          sortedTasks.map((task) => {
            const formattedDate = new Date(task.dueDate).toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric' }
            );
            const isOverdue =
              !task.completed && new Date(task.dueDate) < new Date();

            return (
              <TaskItem
                key={task.id}
                task={task}
                formattedDate={formattedDate}
                isOverdue={isOverdue}
                t={t}
                onEdit={() => {
                  setEditingTaskId(task.id);
                  setNewTaskTitle(task.title);
                  setNewTaskDueDate(task.dueDate);
                  setNewTaskReminder(task.reminderType || 'none');
                  setNewTaskPriority(task.priority || 'medium');
                  setNewTaskXp(task.xpReward || 25);
                  setNewTaskCategory(task.category as TaskCategory || 'other');
                }}
                onRemove={() => {
                  if (window.confirm(t.confirm_delete || 'Delete this task?')) {
                    removeTask(task.id);
                    addNotification(t.task_deleted || 'Task removed', 'info');
                  }
                }}
                onComplete={() => {
                  completeTask(task.id);
                  addNotification(
                    t.task_completed || 'Task completed!',
                    'success'
                  );
                }}
              />
            );
          })
        )}
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showAddTask && (
          <TaskFormModal
            showAddTask={showAddTask}
            onClose={() => setShowAddTask(false)}
            editingTaskId={editingTaskId}
            newTaskTitle={newTaskTitle}
            onTitleChange={setNewTaskTitle}
            newTaskDueDate={newTaskDueDate}
            onDueDateChange={(val) => {
              setNewTaskDueDate(val);
              const selectedDate = new Date(val);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (selectedDate < today) {
                setDateError(t.task_date_past_error);
              } else {
                setDateError(null);
              }
            }}
            dateError={dateError}
            newTaskPriority={newTaskPriority}
            onPriorityChange={(p) => {
              setNewTaskPriority(p);
              setNewTaskXp(
                p === 'high' ? 50 : p === 'medium' ? 25 : 15
              );
            }}
            newTaskXp={newTaskXp}
            onXpChange={setNewTaskXp}
            newTaskReminder={newTaskReminder}
            onReminderChange={setNewTaskReminder}
            newTaskCategory={newTaskCategory}
            onCategoryChange={(c) =>
              setNewTaskCategory(c as TaskCategory)
            }
            onSave={handleSave}
            onCancel={() => setShowAddTask(false)}
            t={t}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};