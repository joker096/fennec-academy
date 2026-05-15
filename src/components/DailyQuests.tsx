import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, BookOpen, Target, MonitorPlay, Star, Plus, Coins, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import Tooltip from './Tooltip';
import { logQuestClaim } from '../firebase';

export default function DailyQuests() {
  const dailyProgress = useStore(state => state.dailyProgress);
  const claimQuestReward = useStore(state => state.claimQuestReward);
  const uiLang = useStore(state => state.uiLang);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const quests = useMemo(() => {
    const allQuests = [
      { 
        id: 1, 
        title: t.quest_xp || 'Earn 50 XP', 
        target: 50, 
        current: dailyProgress.xpEarned || 0, 
        icon: <Zap className="w-4 h-4" />, 
        reward: 10, 
        rewardXp: 50 
      },
      { 
        id: 2, 
        title: t.quest_flashcards || 'Review 10 Flashcards', 
        target: 10, 
        current: dailyProgress.flashcardsReviewed || 0, 
        icon: <BookOpen className="w-4 h-4" />, 
        reward: 5, 
        rewardXp: 25 
      },
      { 
        id: 3, 
        title: t.quest_lessons || 'Complete 1 Lesson', 
        target: 1, 
        current: dailyProgress.lessonsCompleted || 0, 
        icon: <Target className="w-4 h-4" />, 
        reward: 15, 
        rewardXp: 75 
      },
      { 
        id: 4, 
        title: t.quest_videos || 'Watch 1 Video', 
        target: 1, 
        current: dailyProgress.videosWatched || 0, 
        icon: <MonitorPlay className="w-4 h-4" />, 
        reward: 5, 
        rewardXp: 20 
      },
      { 
        id: 5, 
        title: t.quest_perfect_flashcards || '5 Perfect Flashcards', 
        target: 5, 
        current: dailyProgress.perfectFlashcards || 0, 
        icon: <Star className="w-4 h-4" />, 
        reward: 10, 
        rewardXp: 40 
      },
      { 
        id: 6, 
        title: t.quest_new_words || 'Learn 3 New Words', 
        target: 3, 
        current: dailyProgress.newWordsLearned || 0, 
        icon: <Plus className="w-4 h-4" />, 
        reward: 8, 
        rewardXp: 30 
      },
    ];

    // Seeded random based on current date
    const dateStr = new Date().toISOString().split('T')[0];
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) {
        seed += dateStr.charCodeAt(i);
    }
    
    // Sort randomly using seed
    const shuffled = [...allQuests].sort((a, b) => {
        const valA = (a.id * seed) % 100;
        const valB = (b.id * seed) % 100;
        return valA - valB;
    });

    return shuffled.slice(0, 4); // Display 4 quests as requested (3-5)
  }, [t, dailyProgress]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden group/container transition-all">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shadow-sm group-hover/container:scale-110 transition-all duration-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {t.daily_quests || 'Daily Objectives'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                {t.complete_for_rewards || 'SYNC PROGRESS FOR DAILY REWARDS'}
              </p>
            </div>
          </div>
        </div>
        <Tooltip content={t.tooltip_reset_info || 'Quests reset every 24 hours'}>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-help shadow-sm hover:shadow-md transition-all group">
            <Clock className="w-4 h-4 text-primary animate-pulse" />
            <span className="uppercase tracking-widest">{t.reset_in || 'RESETS IN'}: <span className="text-primary font-bold">{timeUntilReset}</span></span>
          </div>
        </Tooltip>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {quests.map((quest) => {
          const isClaimed = dailyProgress.questsClaimed.includes(quest.id);
          const isComplete = quest.current >= quest.target;
          const progress = Math.min(100, (quest.current / quest.target) * 100);

          return (
            <div 
              key={quest.id}
              className={`p-6 rounded-xl border transition-all duration-500 group relative overflow-hidden ${
                isClaimed 
                  ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 opacity-60' 
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${
                      isClaimed 
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-md' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-primary group-hover:scale-110 shadow-sm'
                    }`}>
                      {isClaimed ? <CheckCircle2 className="w-5 h-5" /> : quest.icon}
                    </div>
                    <h3 className={`font-bold text-base uppercase tracking-tight ${isClaimed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {quest.title}
                    </h3>
                  </div>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full relative overflow-hidden mb-5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`absolute top-0 left-0 bottom-0 rounded-full transition-all duration-1000 ${
                        isClaimed ? 'bg-emerald-500' : 'bg-primary shadow-lg shadow-primary/20'
                      }`} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap className={`w-3 h-3 ${isComplete ? 'text-emerald-500' : 'text-primary'}`} />
                      {Math.min(quest.target, quest.current)} / {quest.target} {t.completed || 'COMPLETED'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Coins className="w-3 h-3" />
                        <span className="text-[9px] font-bold">+{quest.reward}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full text-primary border border-primary/20">
                        <Zap className="w-3 h-3" />
                        <span className="text-[9px] font-bold">+{quest.rewardXp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                    <button 
                      onClick={() => {
                        claimQuestReward(quest.id, quest.reward);
                        logQuestClaim(quest.id.toString(), quest.rewardXp);
                      }}
                      disabled={!isComplete || isClaimed}
                      className={`w-full sm:px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                        isClaimed 
                          ? 'bg-emerald-500 text-white shadow-emerald-500/10 cursor-not-allowed' 
                          : isComplete 
                            ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {isClaimed ? t.claimed : isComplete ? t.claim_reward : t.in_progress}
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
