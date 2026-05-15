import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Moon, Sun, Brain, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SRSService } from '../services/srsService';
import Tooltip from './Tooltip';
import { useT } from '../lib/i18n';

export const CognitiveStatus: React.FC = () => {
  const t = useT();
  const cognitiveLoad = useStore(state => state.cognitiveLoad);
  const hydrationLevel = useStore(state => state.hydrationLevel);
  const sessionReviews = useStore(state => state.sessionReviews);
  const dailyReviews = useStore(state => state.dailyProgress.flashcardsReviewed);
  const equippedPerks = useStore(state => state.equippedPerks);
  const special = useStore(state => state.special);
  const sessionStartTime = useStore(state => state.sessionStartTime);
  const currentMistakeStreak = useStore(state => state.currentMistakeStreak);
  const weather = useStore(state => state.weather);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const { fatigue, circadian, composite } = useMemo(() => {
    const context = {
      special,
      sessionReviews,
      dailyReviews: dailyReviews || 0,
      equippedPerks,
      cognitiveLoad,
      hydrationLevel,
      weather,
      sessionStartTime,
      currentMistakeStreak
    };

    const f = SRSService.getFatigueMultiplier(context);
    const c = SRSService.getCircadianFactor(now.getHours(), weather);
    
    // Composite learning efficiency (0 to 1)
    const comp = (f * 0.7) + (c * 0.3);
    
    return { fatigue: f, circadian: c, composite: comp };
  }, [cognitiveLoad, hydrationLevel, sessionReviews, dailyReviews, equippedPerks, special, sessionStartTime, currentMistakeStreak, weather, now]);

  const getStatusLabel = () => {
    if (composite > 0.9) return { text: t.status_optimal || 'Optimal', color: 'text-emerald-500', icon: <Zap className="w-3 h-3" /> };
    if (composite > 0.7) return { text: t.status_good || 'Focused', color: 'text-blue-500', icon: <Brain className="w-3 h-3" /> };
    if (composite > 0.5) return { text: t.status_fair || 'Stable', color: 'text-amber-500', icon: <Sun className="w-3 h-3" /> };
    if (composite > 0.3) return { text: t.status_tired || 'Fatigued', color: 'text-orange-500', icon: <Moon className="w-3 h-3" /> };
    return { text: t.status_exhausted || 'Exhausted', color: 'text-rose-500', icon: <ShieldAlert className="w-3 h-3" /> };
  };

  const status = getStatusLabel();

  return (
    <Tooltip content={
      <div className="p-2 space-y-2">
        <div className="font-bold border-b border-white/20 pb-1 mb-1 uppercase text-[10px] tracking-widest flex items-center gap-2">
          <Cpu className="w-3 h-3" />
          {t.cognitive_analysis || 'Cognitive Analysis'}
        </div>
        <div className="flex justify-between gap-4 text-[10px]">
          <span>{t.neural_energy || 'Neural Energy'}:</span>
          <span className="font-mono text-emerald-400">{Math.round(fatigue * 100)}%</span>
        </div>
        <div className="flex justify-between gap-4 text-[10px]">
          <span>{t.learning_rhythm || 'Learning Rhythm'}:</span>
          <span className="font-mono text-blue-400">{Math.round(circadian * 100)}%</span>
        </div>
        <div className="text-[9px] text-slate-400 italic pt-1 border-t border-white/10">
          {composite > 0.8 ? t.peak_learning_tip || "Peak performance. New encoding is highly efficient." : 
           composite < 0.4 ? t.fatigue_tip || "High fatigue. Focus on reviews rather than new words." : 
           t.standard_learning_tip || "Steady progress. Your neural pathways are active."}
        </div>
      </div>
    }>
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg cursor-help transition-all shadow-sm"
      >
        <div className={`${status.color} transition-colors`}>
          {status.icon}
        </div>
        <div className="flex flex-col leading-none">
          <span className={`text-[9px] font-black uppercase tracking-tighter ${status.color}`}>
            {status.text}
          </span>
          <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
            <motion.div 
              className={`h-full ${status.color.replace('text-', 'bg-')}`}
              initial={{ width: 0 }}
              animate={{ width: `${composite * 100}%` }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </div>
        </div>
      </motion.div>
    </Tooltip>
  );
};
