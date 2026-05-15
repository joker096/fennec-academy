import React from 'react';
import { motion } from 'motion/react';
import DailyQuests from '../components/DailyQuests';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import { Award, Star, Zap, Trophy, Target, BookOpen, MonitorPlay, Calendar, CheckCircle2, Coins } from 'lucide-react';

export default function Quests() {
  const uiLang = useStore(state => state.uiLang);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const xp = useStore(state => state.xp);
  const currentLevel = Math.floor(xp / 100) + 1;

  return (
    <div className="space-y-8 pb-20 relative font-sans text-slate-900 dark:text-slate-100">
        <SEO 
          title={t.daily_quests || 'Daily Quests'} 
          description={t.daily_quests_desc}
        />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
              {t.daily_quests || 'Daily Quests'}
            </h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">
              {t.daily_quests_desc}
            </p>
          </div>
        
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl relative z-10">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-none mb-2">{t.level || 'Level'}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{currentLevel}</div>
          </div>
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="relative z-10">
        <DailyQuests />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Weekly Progress */}
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Calendar className="w-32 h-32 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3 relative z-10">
            <Calendar className="w-6 h-6 text-primary" />
            {t.quest_weekly_progress || 'Weekly Tracker'}
          </h2>
          
          <div className="space-y-8 relative z-10">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
              <span className="text-slate-400 dark:text-slate-500">{t.quests_completed_this_week}</span>
              <span className="text-primary">12 / 42 {t.tasks_title}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '28%' }}
                className="h-full bg-primary rounded-full shadow-lg shadow-primary/20"
              />
            </div>
            
            <div className="grid grid-cols-7 gap-3">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl border-2 transition-all flex items-center justify-center relative overflow-hidden ${i < 3 ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700'}`}>
                    {i < 3 ? <CheckCircle2 className="w-5 h-5" strokeWidth={3} /> : <span className="font-bold text-[10px]">{day}</span>}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rewards Overview */}
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Coins className="w-32 h-32 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3 relative z-10">
            <Award className="w-6 h-6 text-primary" />
            {t.quest_rewards || 'Academy Rewards'}
          </h2>
          
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">{t.total_caps_earned || 'CREDITS EARNED'}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                  <Coins className="w-5 h-5" />
                </div>
                1,240
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 leading-none">{t.total_xp_earned}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Zap className="w-5 h-5" />
                </div>
                5,800
              </div>
            </div>
          </div>

          <div className="mt-8 p-8 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 relative z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">{t.next_milestone || 'Projected Progression'}</h4>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">
              <span>50 {t.quests || 'Quests'}</span>
              <span className="text-primary">38 / 50</span>
            </div>
            <div className="w-full bg-white dark:bg-slate-900 h-3 rounded-full border border-indigo-100 dark:border-indigo-900/30 overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '76%' }}
                className="h-full bg-primary shadow-lg shadow-primary/20"
              />
            </div>
            <div className="mt-6 flex items-center gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
               <Star className="w-5 h-5 text-amber-500" />
               <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-relaxed">
                 {t.rare_skill_card_reward || 'RARE SKILL CARD UNLOCKS AT MILESTONE'}
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-3">{t.earn_xp_title}</h3>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
            {t.earn_xp_desc}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-3">{t.daily_quests}</h3>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
            {t.daily_quests_footer_desc}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 group hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-3">{t.achievements}</h3>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
            {t.achievements_footer_desc}
          </p>
        </div>
      </div>
    </div>
  );
}
