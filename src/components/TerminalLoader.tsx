import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';

interface TerminalLoaderProps {
  text?: string;
  className?: string;
}

export const TerminalLoader: React.FC<TerminalLoaderProps> = ({ 
  text = 'ANALYZING', 
  className = "" 
}) => {
  const uiLang = useStore(state => state.uiLang);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-col gap-3 font-sans ${className}`}>
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center bg-primary/5 rounded-2xl border border-primary/10 shadow-inner">
          <svg className="w-8 h-8" viewBox="0 0 50 50">
            <motion.circle
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="125.6"
              animate={{
                strokeDashoffset: [125.6, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-primary/10"
            />
            <motion.circle
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray="30 95.6"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-primary"
            />
          </svg>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-foreground font-display font-black uppercase tracking-[0.1em] text-sm">
              {text}{dots}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {t.satellite_link || 'Link Active'}
          </div>
        </div>
      </div>
      
      <div className="w-48 h-1.5 bg-secondary rounded-full overflow-hidden border border-border">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-1/2 h-full bg-primary/50 rounded-full"
        />
      </div>
    </div>
  );
};
