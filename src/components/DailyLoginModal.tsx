import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Zap, Coins, X, CheckCircle2, Gift, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import { audioService, SoundEffect } from '../services/audioService';

export default function DailyLoginModal() {
  const showLoginBonus = useStore(state => state.showLoginBonus);
  const setShowLoginBonus = useStore(state => state.setShowLoginBonus);
  const loginStreak = useStore(state => state.loginStreak);
  const uiLang = useStore(state => state.uiLang);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  useEffect(() => {
    if (showLoginBonus) {
      audioService.play(SoundEffect.LEVEL_UP);
    }
  }, [showLoginBonus]);

  const streakBonusXP = Math.min(500, (loginStreak - 1) * 20);
  const totalXP = 50 + streakBonusXP;
  
  let medkitsReward = 1;
  if (loginStreak % 7 === 0) medkitsReward = 2;
  if (loginStreak % 30 === 0) medkitsReward = 4;

  if (!showLoginBonus) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border-2 border-primary/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
        >
          {/* Header */}
          <div className="bg-primary/10 border-b border-primary/20 p-6 text-center relative overflow-hidden">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-8 -left-8 w-20 h-20 bg-primary/20 rounded-full blur-2xl"
            />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                <Gift className="w-8 h-8 text-primary animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                {t.daily_login_bonus || 'Daily Reward'}
              </h2>
              <p className="text-primary/60 text-sm font-bold uppercase tracking-widest mt-1">
                {t.daily_day || 'Day'} {loginStreak} {t.daily_consecutive || 'Streak'}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-primary/10 rounded-xl p-4 text-center">
                <div className="text-[10px] font-black text-primary/50 uppercase mb-1">{t.xp_gain || 'XP Reward'}</div>
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-black text-white">+{totalXP}</span>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-emerald-500/10 rounded-xl p-4 text-center">
                <div className="text-[10px] font-black text-emerald-500/50 uppercase mb-1">{t.medkits || 'Medkits'}</div>
                <div className="flex items-center justify-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <span className="text-2xl font-black text-white">+{medkitsReward}</span>
                </div>
              </div>
            </div>

            {/* Streak Progress Visualization */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t.daily_streak_milestones || 'Streak Milestones'}
                </span>
                <span className="text-[10px] font-black text-primary uppercase">
                  {loginStreak} {t.daily_days || 'Days'}
                </span>
              </div>
              <div className="flex gap-1 h-2">
                {[...Array(7)].map((_, i) => {
                  const day = Math.floor((loginStreak - 1) / 7) * 7 + i + 1;
                  const isCurrent = day === loginStreak;
                  const isPast = day < loginStreak;
                  const isMilestone = day % 7 === 0;

                  return (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all duration-500 ${
                        isPast ? 'bg-primary' : 
                        isCurrent ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 
                        'bg-slate-700'
                      } ${isMilestone ? 'ring-2 ring-amber-500/30' : ''}`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-tight">
                <span>Start</span>
                <span className="text-amber-500">Weekly Bonus</span>
              </div>
            </div>

            <button
              onClick={() => setShowLoginBonus(false)}
              className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-black py-4 rounded-xl transition-all active:scale-95 shadow-[0_4px_0_0_#ca8a04] hover:shadow-none translate-y-[-4px] hover:translate-y-0 uppercase tracking-tighter text-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {t.daily_claim || 'Claim Reward'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
