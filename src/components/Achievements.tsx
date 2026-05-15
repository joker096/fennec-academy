import React from 'react';
import { motion } from 'motion/react';
import { ACHIEVEMENTS, Achievement } from '../data/achievements';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import { Award, CheckCircle2, Lock } from 'lucide-react';

export default function Achievements() {
  const { achievements, xp, daysSurvived, completedLessons, savedExamples, credits, flashcardProgress, perfectLessonsCount, uiLang } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  const masteredWords = Object.values(flashcardProgress).filter(p => p.mastered).length;
  const currentLevel = Math.floor(xp / 100) + 1;

  const stats: Record<string, number> = {
    streak: daysSurvived,
    xp: xp,
    words: masteredWords,
    lessons: completedLessons.length,
    examples: savedExamples.length,
    perfect_lessons: perfectLessonsCount,
    credits: credits,
    level: currentLevel
  };

  return (
    <div className="space-y-6 relative scanlines">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
        {ACHIEVEMENTS.map((achievement) => {
          const currentTierLevel = achievements[achievement.id] || 0;
          const currentStat = stats[achievement.type] || 0;
          const nextTier = achievement.tiers.find(tier => tier.level === currentTierLevel + 1) || achievement.tiers[achievement.tiers.length - 1];
          const isMaxed = currentTierLevel === achievement.tiers.length;
          
          const progress = isMaxed ? 100 : Math.min(100, (currentStat / nextTier.requirement) * 100);

          return (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.02, x: 5 }}
              className={`p-6 border transition-all relative overflow-hidden group ${
                currentTierLevel > 0 
                  ? 'bg-black/40 border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' 
                  : 'bg-black/10 border-primary/5 opacity-40 grayscale'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-none blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
              <div className="flex items-start gap-6 relative z-10">
                <div className={`p-4 border transition-all ${currentTierLevel > 0 ? 'bg-primary/10 border-primary/20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)] group-hover:shadow-[0_0_20px_var(--primary-glow)]' : 'bg-black/60 border-primary/5'}`}>
                  {React.cloneElement(achievement.icon as React.ReactElement<any>, {
                    className: `w-8 h-8 ${currentTierLevel > 0 ? 'text-primary' : 'text-primary/20'}`
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-primary uppercase tracking-[0.1em] truncate drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.3)]">
                      {t[achievement.id] || achievement.id.replace('_', ' ')}
                    </h3>
                    {currentTierLevel > 0 && (
                      <div className="flex gap-1.5 mt-1">
                        {[...Array(achievement.tiers.length)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-none ${i < currentTierLevel ? 'bg-primary shadow-[0_0_8px_var(--primary-glow)]' : 'bg-primary/10 border border-primary/20'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] font-black text-primary/40 mb-4 uppercase tracking-[0.3em]">
                    {isMaxed 
                      ? 'ARCHIVE SECURED' 
                      : `${nextTier.label} PROTOCOL: ${currentStat} / ${nextTier.requirement}`}
                  </p>
                  
                  <div className="relative h-2 bg-black border border-primary/10 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full bg-primary shadow-[0_0_10px_var(--primary-glow)]`}
                    />
                    {isMaxed && <div className="absolute inset-0 bg-white/10 scanlines opacity-20 pointer-events-none" />}
                  </div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
