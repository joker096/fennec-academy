import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Heart, Zap, Droplets, Skull, Ghost, AlertTriangle, Moon, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import Tooltip from './Tooltip';

export type PetState = 'HAPPY' | 'HUNGRY' | 'THIRSTY' | 'SICK' | 'NEGLECTED' | 'DEAD' | 'SAD';

const FennecIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Large Ears */}
    <path d="M6 10C3 7 2 3 5 1C7 3 9 7 10 9" />
    <path d="M18 10C21 7 22 3 19 1C17 3 15 7 14 9" />
    {/* Face Shape */}
    <path d="M5 11C5 17 19 17 19 11C19 8 5 8 5 11Z" />
    {/* Eyes */}
    <circle cx="9" cy="11.5" r="0.5" fill="currentColor" />
    <circle cx="15" cy="11.5" r="0.5" fill="currentColor" />
    {/* Nose */}
    <path d="M11 14L13 14L12 15.5Z" fill="currentColor" />
    {/* Whiskers */}
    <path d="M4 12L2 11.5" strokeWidth="1" />
    <path d="M4 13L2 14" strokeWidth="1" />
    <path d="M20 12L22 11.5" strokeWidth="1" />
    <path d="M20 13L22 14" strokeWidth="1" />
  </svg>
);

interface PetDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  hideMessage?: boolean;
  className?: string;
}

export default function PetDisplay({ size = 'md', hideMessage = false, className = '' }: PetDisplayProps) {
  const health = useStore(state => state.health);
  const cognitiveLoad = useStore(state => state.cognitiveLoad);
  const hydrationLevel = useStore(state => state.hydrationLevel);
  const lastPlayedDate = useStore(state => state.lastPlayedDate);
  const dailyProgress = useStore(state => state.dailyProgress);
  const uiLang = useStore(state => state.uiLang);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  const petState = useMemo((): PetState => {
    if (health <= 0) return 'DEAD';
    if (health < 30) return 'SICK';
    
    // Check for neglect (more than 2 days)
    if (lastPlayedDate) {
      const last = new Date(lastPlayedDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 2) return 'NEGLECTED';
    }

    // Check for sadness (no lessons today and it's late)
    const now = new Date();
    const hour = now.getHours();
    if (dailyProgress.lessonsCompleted === 0 && hour >= 18) return 'SAD';

    if (cognitiveLoad < 30) return 'HUNGRY';
    if (hydrationLevel < 30) return 'THIRSTY';
    
    return 'HAPPY';
  }, [health, cognitiveLoad, hydrationLevel, lastPlayedDate, dailyProgress.lessonsCompleted]);

  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12';
  const containerPadding = size === 'sm' ? 'p-2' : size === 'md' ? 'p-4' : 'p-6';
  const containerRadius = size === 'sm' ? 'rounded-xl' : 'rounded-2xl';
  const widthClass = size === 'sm' ? '' : 'w-full max-w-[240px] mx-auto';

  const config = {
    HAPPY: {
      icon: <FennecIcon className={`${iconSize} text-orange-400`} />,
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800/50',
      message: t.ai_assistant_ready || 'Fennec is ready to help!',
      animation: { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }
    },
    HUNGRY: {
      icon: <FennecIcon className={`${iconSize} text-orange-500`} />,
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800/50',
      message: t.pet_hungry || 'Fennec is hungry!',
      animation: { x: [-2, 2, -2, 2, 0] }
    },
    THIRSTY: {
      icon: <FennecIcon className={`${iconSize} text-blue-500`} />,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800/50',
      message: t.pet_thirsty || 'Fennec is thirsty!',
      animation: { y: [-2, 2, -2, 2, 0] }
    },
    SICK: {
      icon: <FennecIcon className={`${iconSize} text-rose-500`} />,
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-800/50',
      message: t.ai_assistant_low_health || 'Fennec looks worried...',
      animation: { opacity: [1, 0.6, 1] }
    },
    NEGLECTED: {
      icon: <Moon className={`${iconSize} text-slate-400`} />,
      bg: 'bg-slate-50 dark:bg-slate-900/20',
      border: 'border-slate-200 dark:border-slate-800/50',
      message: t.pet_neglected || 'Fennec feels lonely...',
      animation: { y: [0, -5, 0] }
    },
    DEAD: {
      icon: <Skull className={`${iconSize} text-slate-900 dark:text-white`} />,
      bg: 'bg-slate-900 text-white',
      border: 'border-slate-700',
      message: t.pet_dead || 'Fennec is unconscious...',
      animation: { scale: [1, 0.9, 1] }
    },
    SAD: {
      icon: <FennecIcon className={`${iconSize} text-amber-500`} />,
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800/50',
      message: t.pet_sad || 'Fennec looks sad...',
      animation: { x: [-1, 1, -1, 1, 0] }
    }
  };

  const current = config[petState];

  return (
    <Tooltip content={current.message}>
      <motion.div 
        animate={current.animation}
        transition={{ duration: 2, repeat: Infinity }}
        className={`relative ${containerPadding} ${containerRadius} ${widthClass} border-2 ${current.bg} ${current.border} shadow-lg flex flex-col items-center gap-2 transition-colors duration-500 ${className}`}
      >
        <div className="relative">
          {current.icon}
          {(petState === 'SICK' || petState === 'DEAD') && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={`absolute ${size === 'sm' ? '-top-1 -right-1' : '-top-2 -right-2'}`}
            >
              <AlertTriangle className={`${size === 'sm' ? 'w-3 h-3' : 'w-5 h-5'} text-rose-500`} />
            </motion.div>
          )}
        </div>
        {!hideMessage && (
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
              {t.fennec_label || 'Fennec'}
            </span>
            {size !== 'sm' && (
              <p className="text-[10px] font-bold mt-0.5 uppercase tracking-tighter line-clamp-2">
                {current.message}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </Tooltip>
  );
}
