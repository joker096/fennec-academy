import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Search, 
  Filter, 
  Clock, 
  Bell,
  Settings,
  AlertCircle,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  SortAsc,
  CalendarDays,
  Flag,
  ChevronDown,
  Share2,
  RefreshCw,
  Zap,
  Kanban as KanbanIcon,
  GripVertical,
  BookOpen,
  Languages,
  Dumbbell as TrainingIcon,
  Compass
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DatePicker from '../components/DatePicker';
import Tooltip from '../components/Tooltip';
import { UI_TRANSLATIONS } from '../data/translations';
import { TaskPriority, TaskCategory } from '../store/useStore';
import { audioService, SoundEffect } from '../services/audioService';

export default function Tasks() {
  const tasks = useStore(state => state.tasks);
  const addTask = useStore(state => state.addTask);
  const updateTask = useStore(state => state.updateTask);
  const completeTask = useStore(state => state.completeTask);
  const updateTaskStatus = useStore(state => state.updateTaskStatus);
  const updateTaskProgress = useStore(state => state.updateTaskProgress);
  const removeTask = useStore(state => state.removeTask);
  const checkReminders = useStore(state => state.checkReminders);
  const addNotification = useStore(state => state.addNotification);
  const defaultReminderType = useStore(state => state.defaultReminderType);
  const uiLang = useStore(state => state.uiLang);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskReminder, setNewTaskReminder] = useState<'none' | 'at_due_date' | '1_day_before' | '1_hour_before'>('1_hour_before');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('other');
  const [newTaskProgress, setNewTaskProgress] = useState<number>(0);
  const [newTaskXp, setNewTaskXp] = useState<number>(25);
  const [dateError, setDateError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'title' | 'xp'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as any;
    
    // Only update if status actually changed
    const task = tasks.find(t => t.id === draggableId);
    if (task && task.status !== newStatus) {
      updateTaskStatus(draggableId, newStatus);
    }
  };

  const validateTitle = (title: string) => {
    if (!title.trim()) {
      setTitleError(uiLang === 'ru' ? 'Название не должно быть пустым' : 'Title cannot be empty');
      return false;
    }
    if (title.length > 100) {
      setTitleError(uiLang === 'ru' ? 'Название слишком длинное (макс. 100 символов)' : 'Title too long (max 100 chars)');
      return false;
    }
    setTitleError(null);
    return true;
  };

  const validateDate = (dateStr: string) => {
    if (!dateStr) {
      setDateError(uiLang === 'ru' ? 'Дата обязательна' : 'Date is required');
      return false;
    }
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setDateError(t.task_date_past_error || 'Due date cannot be in the past');
      return false;
    }
    setDateError(null);
    return true;
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isTitleValid = validateTitle(newTaskTitle);
    const isDateValid = validateDate(newTaskDueDate);

    if (isTitleValid && isDateValid) {
        if (editingTask) {
        updateTask(editingTask.id, {
          title: newTaskTitle.trim(),
          dueDate: newTaskDueDate,
          priority: newTaskPriority,
          xpReward: newTaskXp,
          reminderType: newTaskReminder,
          progress: newTaskProgress,
          status: newTaskProgress === 100 ? 'completed' : (newTaskProgress > 0 ? 'in_progress' : 'todo'),
          completed: newTaskProgress === 100
        });
        setEditingTask(null);
        addNotification(t.task_updated || 'Mission Data Synchronized', 'success');
      } else {
        addTask(newTaskTitle.trim(), newTaskDueDate, newTaskPriority, newTaskXp, newTaskReminder, newTaskCategory);
        addNotification(t.task_create_success || 'New Objective Logged', 'success');
      }
      checkReminders();
      setNewTaskTitle('');
      setNewTaskDueDate(new Date().toISOString().split('T')[0]);
      setNewTaskReminder(defaultReminderType);
      setNewTaskPriority('medium');
      setNewTaskProgress(0);
      setNewTaskXp(25);
      setIsAddingTask(false);
      audioService.play(SoundEffect.CLICK);
    }
  };

  const openAddModal = () => {
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskDueDate(new Date().toISOString().split('T')[0]);
    setNewTaskReminder(defaultReminderType);
    setNewTaskPriority('medium');
    setNewTaskCategory('other');
    setNewTaskProgress(0);
    setNewTaskXp(25);
    setIsAddingTask(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDueDate(task.dueDate);
    setNewTaskReminder(task.reminderType || 'none');
    setNewTaskPriority(task.priority || 'medium');
    setNewTaskCategory(task.category || 'other');
    setNewTaskProgress(task.progress || 0);
    setNewTaskXp(task.xpReward || 25);
    setIsAddingTask(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Fennec Tasks',
      text: (t.share_progress_text || 'Check out my language learning progress! Tasks completed: {completed}/{total}.')
        .replace('{completed}', stats.completed.toString())
        .replace('{total}', stats.total.toString()),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        addNotification(t.share_success, 'success');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        addNotification(t.share_success, 'success');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        addNotification(t.share_error, 'error');
      }
    }
  };

  const filteredTasks = useMemo(() => {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    const now = new Date();
    
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(23, 59, 59, 999);
        const isOverdue = !task.completed && dueDate < now;
        
        const matchesStatus = 
          filterStatus === 'all' ? true :
          filterStatus === 'active' ? (!task.completed && !isOverdue) :
          filterStatus === 'completed' ? task.completed :
          filterStatus === 'overdue' ? isOverdue :
          true;
        
        const matchesPriority = filterPriority === 'all' ? true : (task.priority || 'medium') === filterPriority;
        
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'dueDate') {
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortBy === 'priority') {
          const pA = a.priority || 'medium';
          const pB = b.priority || 'medium';
          comparison = priorityMap[pA] - priorityMap[pB];
        } else if (sortBy === 'status') {
          if (a.completed === b.completed) comparison = 0;
          else comparison = a.completed ? 1 : -1;
        } else if (sortBy === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else if (sortBy === 'xp') {
          comparison = (a.xpReward || 0) - (b.xpReward || 0);
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [tasks, searchQuery, filterStatus, filterPriority, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(23, 59, 59, 999);
      return !t.completed && dueDate < now;
    }).length;
    const active = total - completed - overdue;
    return { total, completed, active, overdue };
  }, [tasks]);

  const priorityStats = useMemo(() => {
    return {
      high: tasks.filter(t => (t.priority || 'medium') === 'high').length,
      medium: tasks.filter(t => (t.priority || 'medium') === 'medium').length,
      low: tasks.filter(t => (t.priority || 'medium') === 'low').length,
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 font-sans text-foreground relative overflow-hidden pb-20">
      {/* Background Decorative Grid */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-10 bg-[linear-gradient(to_right,rgba(var(--primary-rgb),0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary-rgb),0.2)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Header Section: Technical Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-slate-200 dark:border-slate-800 pb-10 relative mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[9px] font-mono font-bold uppercase tracking-[0.4em] mb-2">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>ACAD_SYS // TASK_PROTOCOL.v1</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            {t.tasks_title || 'Objective Log'}
          </h1>
          <p className="text-slate-500 dark:text-slate-500 font-mono font-bold uppercase tracking-[0.2em] text-[9px] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm" />
            {t.tasks_subtitle || 'Current Operational Parameters'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 border-2 border-slate-200 dark:border-slate-800 rounded-lg">
             <button 
               onClick={() => { audioService.play(SoundEffect.CLICK); setViewMode('list'); }}
               className={`p-2.5 rounded transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-primary'}`}
             >
               <ListIcon className="w-5 h-5" />
             </button>
             <button 
               onClick={() => { audioService.play(SoundEffect.CLICK); setViewMode('grid'); }}
               className={`p-2.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-primary'}`}
             >
               <LayoutGrid className="w-5 h-5" />
             </button>
             <button 
               onClick={() => { audioService.play(SoundEffect.CLICK); setViewMode('kanban'); }}
               className={`p-2.5 rounded transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-primary'}`}
             >
               <KanbanIcon className="w-5 h-5" />
             </button>
          </div>

          <button 
            onClick={handleShare}
            className="p-4 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group shadow-sm"
          >
            <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform text-slate-500" />
          </button>
          
          <button 
            onClick={openAddModal}
            className="modern-button !px-10 !py-5 flex items-center gap-4 shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-5 h-5" strokeWidth={4} />
            <span className="uppercase font-display font-black tracking-widest text-sm">{t.new_task || 'New Mission'}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: t.all, value: stats.total, icon: <Calendar className="w-6 h-6" />, color: 'primary' },
          { label: t.task_active, value: stats.active, icon: <Clock className="w-6 h-6" />, color: 'amber' },
          { label: t.completed, value: stats.completed, icon: <CheckCircle2 className="w-6 h-6" />, color: 'emerald' },
          { label: t.task_overdue, value: stats.overdue, icon: <AlertCircle className="w-6 h-6" />, color: 'rose' }
        ].map((stat, idx) => (
          <StatCard 
            key={idx}
            label={stat.label} 
            value={stat.value} 
            icon={stat.icon} 
            color={stat.color as any} 
            t={t}
          />
        ))}
      </div>

      {/* Search & Intelligence Filters */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm space-y-8 sticky top-24">
            <div className="flex items-center gap-3 text-primary font-mono font-bold uppercase tracking-widest text-[11px] mb-2">
              <Filter className="w-4 h-4" />
              <span>{t.visibility_filters || 'FILTER_PARAM'}</span>
            </div>

            {/* Status Segment */}
            <div className="space-y-4">
              <label className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                {t.status || 'SYS_STATUS'}
              </label>
              <div className="flex flex-col gap-2">
                {(['all', 'active', 'completed', 'overdue'] as const).map((status) => (
                   <button
                    key={status}
                    onClick={() => { audioService.play(SoundEffect.CLICK); setFilterStatus(status); }}
                    className={`px-4 py-3 rounded text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-between group border-2 ${
                      filterStatus === status 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-primary/30 transition-colors'
                    }`}
                  >
                    <span>
                      {status === 'all' ? t.all : 
                       status === 'active' ? t.task_active : 
                       status === 'completed' ? t.completed :
                       t.task_overdue}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded border ${
                      filterStatus === status ? 'bg-white/20 border-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}>
                      {status === 'all' ? stats.total : 
                       status === 'active' ? stats.active :
                       status === 'completed' ? stats.completed :
                       stats.overdue}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Segment */}
            <div className="space-y-4 pt-6 border-t-2 border-slate-100 dark:border-slate-900">
              <label className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                {t.priority || 'PRIORITY_LEVEL'}
              </label>
              <div className="flex flex-col gap-2">
                {(['all', 'low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => { audioService.play(SoundEffect.CLICK); setFilterPriority(p); }}
                    className={`px-4 py-3 rounded text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-3 border-2 ${
                      filterPriority === p 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-primary/30 transition-colors'
                    }`}
                  >
                    {p !== 'all' && <Flag className={`w-3.5 h-3.5 ${filterPriority === p ? 'text-white' : p === 'high' ? 'text-rose-500' : p === 'medium' ? 'text-amber-500' : 'text-primary'}`} />}
                    <span>{p === 'all' ? t.all : p === 'low' ? t.priority_low : p === 'medium' ? t.priority_medium : t.priority_high}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Selection */}
            <div className="space-y-4 pt-6 border-t-2 border-slate-100 dark:border-slate-900">
              <div className="flex items-center justify-between pl-1 pr-1">
                <label className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                  {t.sort_by || 'SORT_ORDER'}
                </label>
                <button 
                  onClick={() => { audioService.play(SoundEffect.CLICK); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}
                  className="text-[9px] font-mono font-bold text-primary dark:text-primary uppercase tracking-widest hover:underline flex items-center gap-1.5"
                >
                  <SortAsc className={`w-3 h-3 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  {sortOrder === 'asc' ? (t.sort_asc || 'ASC') : (t.sort_desc || 'DESC')}
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'dueDate', label: t.sort_due_date || 'Due Date', icon: <Calendar className="w-3 h-3" /> },
                  { id: 'priority', label: t.sort_priority || 'Priority', icon: <Flag className="w-3 h-3" /> },
                  { id: 'xp', label: t.xp_reward || 'XP Reward', icon: <Zap className="w-3 h-3" /> },
                  { id: 'status', label: t.sort_status || 'Status', icon: <CheckCircle2 className="w-3 h-3" /> },
                  { id: 'title', label: t.sort_title || 'Title', icon: <ListIcon className="w-3 h-3" /> }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => { audioService.play(SoundEffect.CLICK); setSortBy(option.id as any); }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest border-2 transition-all group ${
                      sortBy === option.id 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`${sortBy === option.id ? 'text-primary' : 'text-slate-400'} group-hover:text-primary transition-colors`}>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                    {sortBy === option.id && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                        <SortAsc className={`w-3 h-3 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Filter Reset Control */}
            {(filterStatus !== 'all' || filterPriority !== 'all' || searchQuery !== '') && (
              <button 
                onClick={() => {
                  audioService.play(SoundEffect.REMOVE);
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setSearchQuery('');
                }}
                className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all text-[10px] font-mono font-bold uppercase tracking-widest rounded border-2 border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 group"
              >
                <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                <span>{t.reset_filters || 'RESET_ALL'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:scale-150" />
            <div className="flex items-center gap-3 text-primary font-mono font-bold uppercase tracking-widest text-[10px] mb-6 relative z-10">
              <Search className="w-4 h-4" />
              <span>{t.intelligence_search || 'DATA_QUERY'}</span>
            </div>
            <div className="relative group/input relative z-10">
              <input 
                type="text"
                placeholder={t.task_search_placeholder || 'Enter search query...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-lg pl-12 pr-6 py-4 text-foreground outline-none focus:border-primary/40 transition-all font-display font-black tracking-tight text-xl placeholder:font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-widest placeholder:uppercase"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 dark:text-slate-700 group-focus-within/input:text-primary transition-all duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Task Content Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-x-auto pb-8">
            {(['todo', 'in_progress', 'completed'] as const).map((status) => (
              <div key={status} className="flex flex-col min-w-[300px]">
                <div className="flex items-center justify-between mb-4 px-4 bg-slate-50 dark:bg-slate-900/50 py-3 border-2 border-slate-200 dark:border-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'todo' ? 'bg-slate-400' : 
                      status === 'in_progress' ? 'bg-primary animate-pulse' : 
                      'bg-emerald-500'
                    }`} />
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                      {status === 'todo' ? (t.todo || 'QUEUE_IDLE') : 
                       status === 'in_progress' ? (t.in_progress || 'ACTIVE_PROC') : 
                       (t.completed || 'DONE_LOG')}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded shadow-sm">
                    {filteredTasks.filter(t => (t.status || 'todo') === status).length}
                  </span>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 min-h-[500px] border-2 border-dashed rounded-xl p-4 transition-all duration-300 ${
                        snapshot.isDraggingOver ? 'bg-primary/5 border-primary/40 scale-[1.01]' : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10'
                      }`}
                    >
                      <div className="space-y-4">
                        {filteredTasks
                          .filter(t => (t.status || 'todo') === status)
                          .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'none'
                                  }}
                                  className={snapshot.isDragging ? 'z-50' : ''}
                                >
                                  <TaskItem 
                                    task={task} 
                                    viewMode="kanban"
                                    onComplete={() => completeTask(task.id)}
                                    onProgressChange={(p) => updateTaskProgress(task.id, p)}
                                    onRemove={() => removeTask(task.id)}
                                    onEdit={() => openEditModal(task)}
                                    uiLang={uiLang}
                                    t={t}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4 max-w-4xl mx-auto'}>
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  viewMode={viewMode}
                  onComplete={() => completeTask(task.id)}
                  onProgressChange={(p) => updateTaskProgress(task.id, p)}
                  onRemove={() => removeTask(task.id)}
                  onEdit={() => openEditModal(task)}
                  uiLang={uiLang}
                  t={t}
                />
              ))}
            </AnimatePresence>
            
            {/* Modern Empty State */}
            {filteredTasks.length === 0 && (
              <div className="col-span-full py-40 text-center bg-card border-2 border-dashed border-border rounded-[3rem] relative overflow-hidden group shadow-inner">
                <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
                <div className="relative z-10 max-w-lg mx-auto">
                  <div className="w-28 h-28 bg-muted rounded-full flex items-center justify-center mx-auto mb-10 text-primary shadow-xl border border-border group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <CalendarDays className="w-12 h-12 opacity-60" />
                  </div>
                  <h3 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
                    {t.task_no_tasks || 'Academy Record Empty'}
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[11px] leading-relaxed mb-12 px-10">
                    {t.task_no_tasks_desc || 'NO CURRENT OBJECTIVES MATCH YOUR SEARCH. ADJUST FILTERS OR DEFINE A NEW CURRICULUM MISSION.'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-6 px-10">
                    {(filterStatus !== 'all' || filterPriority !== 'all' || searchQuery !== '') ? (
                      <button 
                        onClick={() => {
                          setFilterStatus('all');
                          setFilterPriority('all');
                          setSearchQuery('');
                        }}
                        className="px-8 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] flex items-center justify-center gap-3 group/btn hover:border-primary/20 transition-all font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300"
                      >
                        <RefreshCw className="w-5 h-5 group-hover/btn:rotate-180 transition-all duration-700 text-primary" />
                        <span>{t.reset_filters}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={openAddModal}
                        className="modern-button !py-6 flex items-center justify-center gap-4 text-sm"
                      >
                        <Plus className="w-6 h-6" strokeWidth={4} />
                        <span>{t.task_create || 'Initiate New Objective'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DragDropContext>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingTask(false)}
              className="absolute inset-0 bg-slate-900/60"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(var(--primary)_1px,transparent_0)] bg-[size:20px_20px]" />
              
              <div className="p-8 relative z-10">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                      {editingTask ? <Settings className="w-8 h-8" /> : <Plus className="w-8 h-8" strokeWidth={3} />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none mb-2">
                        {editingTask ? t.edit_task : t.new_task}
                      </h2>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">
                        {editingTask ? t.update_objective_details || 'Objective Synchronizing' : t.set_goal_today || 'Mission Protocol Initiated'}
                      </p>
                    </div>
                  </div>

                <form onSubmit={handleAddTask} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm" />
                      {t.goal_title}
                    </label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newTaskTitle}
                      onChange={(e) => {
                        setNewTaskTitle(e.target.value);
                        if (titleError) validateTitle(e.target.value);
                      }}
                      placeholder={t.goal_placeholder || 'e.g. Learn 10 new words'}
                      className={`w-full bg-muted/60 border-2 rounded-2xl px-5 py-4 text-foreground focus:border-primary/40 outline-none transition-all placeholder:text-muted-foreground/30 text-lg font-bold tracking-tight shadow-sm uppercase ${
                        titleError ? 'border-rose-500/50' : 'border-border'
                      }`}
                    />
                    {titleError && (
                      <p className="text-rose-500 text-[10px] font-bold uppercase mt-1.5 ml-1 animate-pulse">
                        {titleError}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DatePicker 
                      label={t.due_date}
                      value={newTaskDueDate}
                      onChange={(val) => {
                        setNewTaskDueDate(val);
                        validateDate(val);
                      }}
                      error={dateError}
                      minDate={new Date().toISOString().split('T')[0]}
                    />

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm" />
                        {t.xp_reward}
                      </label>
                      <div className="relative group">
                        <input 
                          type="number" 
                          value={newTaskXp}
                          onChange={(e) => setNewTaskXp(parseInt(e.target.value) || 0)}
                          className="w-full bg-muted/60 border-2 border-border group-focus-within:border-primary/40 rounded-2xl px-5 py-4 text-foreground outline-none transition-all text-xl font-black shadow-sm"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-primary uppercase tracking-widest">
                          XP
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm" />
                      {t.category || 'Operation Category'}
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { id: 'lesson', icon: <BookOpen className="w-4 h-4" />, label: 'Lesson' },
                        { id: 'vocabulary', icon: <Languages className="w-4 h-4" />, label: 'Vocab' },
                        { id: 'training', icon: <TrainingIcon className="w-4 h-4" />, label: 'Train' },
                        { id: 'exploration', icon: <Compass className="w-4 h-4" />, label: 'Explore' },
                        { id: 'other', icon: <ListIcon className="w-4 h-4" />, label: 'Other' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            audioService.play(SoundEffect.CLICK);
                            setNewTaskCategory(cat.id as TaskCategory);
                          }}
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            newTaskCategory === cat.id 
                              ? 'bg-primary/10 border-primary text-primary' 
                              : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {cat.icon}
                          <span className="text-[8px] font-bold uppercase tracking-widest">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm" />
                      {t.priority}
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            audioService.play(SoundEffect.CLICK);
                            setNewTaskPriority(p);
                            setNewTaskXp(p === 'high' ? 50 : p === 'medium' ? 25 : 15);
                          }}
                          className={`py-4 rounded-2xl text-[10px] font-black flex flex-col items-center gap-2 transition-all border-2 relative overflow-hidden ${
                            newTaskPriority === p
                              ? p === 'high' ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-sm' :
                                p === 'medium' ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm' :
                                'bg-primary/10 border-primary text-primary shadow-sm'
                              : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                          }`}
                        >
                          <Flag className={`w-5 h-5 ${
                            newTaskPriority === p
                              ? p === 'high' ? 'text-rose-500' :
                                p === 'medium' ? 'text-amber-500' :
                                'text-primary'
                              : 'text-muted-foreground/30'
                          }`} />
                          <div className="uppercase tracking-widest">
                            {p === 'low' ? t.priority_low : p === 'medium' ? t.priority_medium : t.priority_high}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm" />
                      {t.reminder_type || 'Alert Protocol'}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors">
                        <Bell className="w-5 h-5" />
                      </div>
                      <select 
                        value={newTaskReminder}
                        onChange={(e) => { audioService.play(SoundEffect.CLICK); setNewTaskReminder(e.target.value as any); }}
                        className="w-full bg-muted/60 border-2 border-border rounded-2xl pl-12 pr-4 py-4 text-foreground outline-none transition-all appearance-none cursor-pointer text-sm font-bold uppercase tracking-widest focus:border-primary/40 focus:bg-card"
                      >
                        <option value="none">{t.reminder_none || 'No Reminder'}</option>
                        <option value="at_due_date">{t.reminder_at_due_date || 'At Due Date'}</option>
                        <option value="1_hour_before">{t.reminder_1_hour_before || '1 Hour Before'}</option>
                        <option value="1_day_before">{t.reminder_1_day_before || '1 Day Before'}</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none group-hover:text-primary transition-colors">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm" />
                       {t.progress || 'Operation Progress'}
                    </label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0"
                        max="100"
                        step="5"
                        value={newTaskProgress}
                        onChange={(e) => setNewTaskProgress(parseInt(e.target.value))}
                        className="flex-1 accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                      />
                      <div className="min-w-[4rem] text-right font-black text-xl text-primary font-mono">
                        {newTaskProgress}%
                      </div>
                    </div>
                  </div>

                    <div className="flex gap-4 pt-6">
                      <button 
                        type="button"
                        onClick={() => { audioService.play(SoundEffect.CLICK); setIsAddingTask(false); }}
                        className="flex-1 px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-muted/50 text-muted-foreground border border-border hover:bg-muted transition-all active:scale-95"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        type="submit"
                        disabled={!!titleError || !!dateError || !newTaskTitle.trim()}
                        className="flex-1 px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {editingTask ? t.save_settings : t.task_create}
                      </button>
                    </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, color, t }: { label: string; value: number; icon: React.ReactNode; color: 'primary' | 'amber' | 'emerald' | 'rose'; t: any }) {
  const themes = {
    primary: 'text-primary bg-primary/5 border-primary/20',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20',
    rose: 'text-rose-500 bg-rose-500/5 border-rose-500/20'
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative overflow-hidden group hover:border-primary transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none ${color === 'primary' ? 'text-primary' : color === 'amber' ? 'text-amber-500' : color === 'emerald' ? 'text-emerald-500' : 'text-rose-500'}`}>
        <div className="scale-[2] translate-x-4 -translate-y-4">{icon}</div>
      </div>
      
      <div className="flex items-end justify-between relative z-10">
        <div className="space-y-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 shadow-sm ${themes[color] || themes.primary}`}>
            {React.cloneElement(icon as any, { className: 'w-5 h-5' })}
          </div>
          <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</div>
        </div>
        <div className="text-4xl font-display font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">{value}</div>
      </div>
    </div>
  );
}

function TaskItem({ 
  task, 
  onComplete, 
  onProgressChange,
  onRemove, 
  onEdit, 
  uiLang, 
  viewMode, 
  t,
  isDragging
}: { 
  task: any; 
  onComplete: () => void; 
  onProgressChange: (progress: number) => void;
  onRemove: () => void; 
  onEdit: () => void; 
  uiLang: string; 
  viewMode: 'list' | 'grid' | 'kanban'; 
  t: any;
  isDragging?: boolean;
}) {
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(23, 59, 59, 999);
  const isOverdue = !task.completed && dueDate < new Date();
  const priority = task.priority || 'medium';
  
  const priorityThemes = {
    high: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    low: 'text-primary bg-primary/10 border-primary/30'
  };

  const priorityDots = {
    high: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    medium: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    low: 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'
  };

  const priorityLabels = {
    high: t.priority_high || 'CRITICAL',
    medium: t.priority_medium || 'REQUIRED',
    low: t.priority_low || 'AUXILIARY'
  };
  
  const formattedDate = new Date(task.dueDate).toLocaleDateString(uiLang === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  const variants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    lesson: <BookOpen className="w-3.5 h-3.5" />,
    vocabulary: <Languages className="w-3.5 h-3.5" />,
    training: <TrainingIcon className="w-3.5 h-3.5" />,
    exploration: <Compass className="w-3.5 h-3.5" />,
    other: <ListIcon className="w-3.5 h-3.5" />
  };

  if (viewMode === 'kanban') {
    return (
      <div
        className={`p-4 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-lg transition-all duration-300 group relative overflow-hidden flex flex-col shadow-sm ${
          task.completed ? 'opacity-50 grayscale' : ''
        } ${isDragging ? 'rotate-2 scale-105 border-primary shadow-xl z-50' : 'hover:border-primary/50'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${priorityDots[priority as keyof typeof priorityDots]}`} />
            <div className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest rounded border ${priorityThemes[priority as keyof typeof priorityThemes]}`}>
              {priorityLabels[priority as keyof typeof priorityLabels]}
            </div>
            {task.category && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                {categoryIcons[task.category]}
              </div>
            )}
            {isOverdue && !task.completed && (
              <div className="bg-rose-600 text-white text-[7px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                OVERDUE
              </div>
            )}
          </div>
          <button 
            onClick={() => { audioService.play(SoundEffect.CHECK); onComplete(); }}
            disabled={task.completed}
            className={`w-7 h-7 rounded transition-all border-2 flex items-center justify-center ${
              task.completed 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 hover:border-primary hover:text-primary'
            }`}
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
            ) : (
              <Circle className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        </div>

        <h3 className={`text-sm font-display font-black uppercase tracking-tight leading-tight mb-2 ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
          {task.title}
        </h3>

        {!task.completed && (
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between items-center text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              <span>{t.progress || 'Progress'}</span>
              <span>{task.progress || 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${task.progress || 0}%` }}
                className="h-full bg-primary"
              />
            </div>
            <div className="flex gap-1">
              {[25, 50, 75].map(p => (
                <button 
                  key={p}
                  onClick={(e) => { e.stopPropagation(); onProgressChange(p); }}
                  className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[6px] font-mono font-bold text-slate-400 hover:text-primary hover:border-primary transition-all"
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-slate-50 dark:border-slate-900">
          <div className="flex items-center gap-2 text-slate-400 text-[8px] font-mono font-bold uppercase tracking-widest">
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               onClick={onEdit}
               className="p-1.5 text-slate-400 hover:text-primary transition-colors"
             >
               <Settings className="w-3.5 h-3.5" />
             </button>
             <button 
               onClick={() => { audioService.play(SoundEffect.REMOVE); onRemove(); }}
               className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
             >
               <Trash2 className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`p-6 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-300 group relative overflow-hidden flex flex-col h-full shadow-sm hover:border-primary ${
          task.completed ? 'opacity-50 grayscale' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-6">
          <button 
            onClick={() => { audioService.play(SoundEffect.CHECK); onComplete(); }}
            disabled={task.completed}
            className={`w-10 h-10 rounded transition-all border-2 flex items-center justify-center ${
              task.completed 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 hover:border-primary hover:text-primary active:scale-95'
            }`}
          >
            {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${priorityDots[priority as keyof typeof priorityDots]}`} />
              <div className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest rounded border ${priorityThemes[priority as keyof typeof priorityThemes]}`}>
                {priorityLabels[priority as keyof typeof priorityLabels]}
              </div>
              {task.category && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  {categoryIcons[task.category]}
                </div>
              )}
            </div>
            {isOverdue && !task.completed && (
              <div className="bg-rose-600 text-white text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                STATUS_OVERDUE
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4 mb-6">
          <h3 className={`text-xl font-display font-black uppercase tracking-tight leading-tight ${task.completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white'}`}>
            {task.title}
          </h3>

          {!task.completed && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                <span>{t.progress || 'Progress'}</span>
                <span>{task.progress || 0}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress || 0}%` }}
                  className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                />
              </div>
              <div className="flex gap-2">
                {[25, 50, 75].map(p => (
                  <button 
                    key={p}
                    onClick={(e) => { e.stopPropagation(); onProgressChange(p); }}
                    className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[7px] font-mono font-bold text-slate-400 hover:text-primary hover:border-primary transition-all"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[9px] font-mono font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
              <Calendar className="w-3 h-3 text-primary" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-primary text-[9px] font-mono font-bold uppercase tracking-widest bg-primary/5 px-2 py-1 rounded border border-primary/20">
              <Zap className="w-3 h-3" />
              <span>+{task.xpReward || 25} XP</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100 dark:border-slate-900 mt-auto">
          <div className="flex items-center gap-1">
             <button 
               onClick={onEdit}
               className="p-2 text-slate-400 hover:text-primary transition-all rounded hover:bg-slate-50 dark:hover:bg-slate-900"
             >
               <Settings className="w-4 h-4" />
             </button>
             <button 
               onClick={() => { audioService.play(SoundEffect.REMOVE); onRemove(); }}
               className="p-2 text-slate-400 hover:text-rose-500 transition-all rounded hover:bg-rose-50 dark:hover:bg-rose-900"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          </div>
          
          {task.reminderType && task.reminderType !== 'none' && (
            <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">
              <Bell className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Optimized List View
  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`group bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 shadow-sm hover:border-primary ${
        task.completed ? 'opacity-50 grayscale' : ''
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => { audioService.play(SoundEffect.CHECK); onComplete(); }}
          disabled={task.completed}
          className={`w-10 h-10 min-w-[2.5rem] rounded transition-all border-2 flex items-center justify-center ${
            task.completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 hover:border-primary hover:text-primary shadow-sm'
          }`}
        >
          {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${priorityDots[priority as keyof typeof priorityDots]}`} />
            <div className={`px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold uppercase tracking-widest ${priorityThemes[priority as keyof typeof priorityThemes]}`}>
              {priorityLabels[priority as keyof typeof priorityLabels]}
            </div>
            {task.category && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[7px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                {categoryIcons[task.category]}
              </div>
            )}
            {isOverdue && !task.completed && (
              <span className="text-[8px] font-mono font-bold text-rose-500 uppercase tracking-widest animate-pulse">
                OVERDUE_FAIL
              </span>
            )}
            <div className="flex items-center gap-1 text-[8px] font-mono font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
              <Zap className="w-3 h-3" />
              <span>+{task.xpReward} XP</span>
            </div>
            {!task.completed && task.progress !== undefined && (
              <div className="flex items-center gap-3 min-w-[120px] bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                    className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                  />
                </div>
                <span className="text-[10px] font-mono font-black text-primary w-8 text-right">{task.progress}%</span>
              </div>
            )}
            {task.completed && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" />
                {t.completed || 'DONE'}
              </div>
            )}
          </div>
          <h3 className={`text-lg font-display font-black uppercase tracking-tight truncate leading-none ${task.completed ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white'}`}>
            {task.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 pl-14 md:pl-0 border-t md:border-t-0 border-slate-100 dark:border-slate-900 pt-3 md:pt-0">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               onClick={onEdit}
               className="p-2 text-slate-400 hover:text-primary transition-all"
             >
               <Settings className="w-4 h-4" />
             </button>
             <button 
               onClick={() => { audioService.play(SoundEffect.REMOVE); onRemove(); }}
               className="p-2 text-slate-400 hover:text-rose-500 transition-all"
             >
               <Trash2 className="w-4 h-4" />
             </button>
        </div>
      </div>
    </motion.div>
  );
}
