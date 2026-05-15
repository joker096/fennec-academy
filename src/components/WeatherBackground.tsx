import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';

export default function WeatherBackground() {
  const weather = useStore(state => state.weather);
  const visualEffects = useStore(state => state.visualEffects);
  const crtMode = useStore(state => state.crtMode);
  const theme = useStore(state => state.theme);

  const config = useMemo(() => {
    const configs = {
      clear: {
        bg: crtMode ? 'bg-[#000500]' : 'bg-slate-50 dark:bg-black',
        gradient: 'from-indigo-500/5 via-transparent to-indigo-500/5',
        accent: 'bg-indigo-500/10',
        pattern: 'opacity-20',
        overlay: 'bg-transparent'
      },
      rain: {
        bg: crtMode ? 'bg-[#000800]' : 'bg-slate-100 dark:bg-black',
        gradient: 'from-blue-500/10 via-transparent to-transparent',
        accent: 'bg-blue-500/5',
        pattern: 'opacity-30',
        overlay: 'bg-blue-500/5'
      },
      acid_rain: {
        bg: crtMode ? 'bg-[#000500]' : 'bg-slate-100 dark:bg-black',
        gradient: 'from-emerald-500/20 via-transparent to-emerald-500/10',
        accent: 'bg-emerald-500/15',
        pattern: 'opacity-40',
        overlay: 'bg-emerald-500/10'
      },
      dust_storm: {
        bg: crtMode ? 'bg-[#050200]' : 'bg-slate-100 dark:bg-black',
        gradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
        accent: 'bg-orange-500/10',
        pattern: 'opacity-50',
        overlay: 'bg-orange-500/15'
      },
      fog: {
        bg: crtMode ? 'bg-[#020202]' : 'bg-slate-50 dark:bg-black',
        gradient: 'from-slate-500/5 via-transparent to-slate-500/5',
        accent: 'bg-slate-500/5',
        pattern: 'opacity-25',
        overlay: 'bg-slate-500/5'
      }
    };
    return configs[weather] || configs.clear;
  }, [weather, crtMode]);

  if (!visualEffects) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {crtMode && (
        <div className="absolute inset-0 opacity-[0.03] mix-blend-screen pointer-events-none z-[1]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={`${weather}-${crtMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Base Background Color */}
          <div className={`absolute inset-0 ${config.bg} transition-colors duration-2000`} />
          
          {/* Base Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} mix-blend-overlay`} />
          
          {/* Weather Overlay Tint */}
          <div className={`absolute inset-0 ${config.overlay} transition-colors duration-2000`} />

          {/* CRT Static Effect during storms */}
          {crtMode && (weather === 'dust_storm' || weather === 'acid_rain') && (
            <motion.div 
              animate={{ opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute inset-0 bg-white/5 mix-blend-overlay"
            />
          )}

          {/* Weather Specific Atmospheric Elements */}
          {weather === 'clear' && (
            <div className="absolute inset-0">
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className={`absolute top-[10%] w-full h-32 bg-gradient-to-r from-transparent via-${crtMode ? (theme === 'amber' ? 'amber' : 'emerald') : 'white'}/5 to-transparent`}
              />
              <motion.div 
                animate={{ x: ['100%', '-100%'] }}
                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                className={`absolute top-[40%] w-full h-48 bg-gradient-to-r from-transparent via-${crtMode ? (theme === 'amber' ? 'amber' : 'emerald') : 'white'}/3 to-transparent`}
              />
            </div>
          )}

          {weather === 'rain' && (
            <div className="absolute inset-0">
              <motion.div 
                animate={{ y: ['0%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundSize: '2px 100px'
                }}
              />
              {!crtMode && <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply" />}
            </div>
          )}
          
          {weather === 'dust_storm' && (
            <div className="absolute inset-0">
              <motion.div 
                animate={{ 
                  x: ['-20%', '20%'],
                  y: ['-5%', '5%'],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                className="absolute inset-[-20%] opacity-40"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')] mix-blend-overlay opacity-50" />
                <div className={`absolute inset-0 bg-gradient-to-r ${crtMode ? (theme === 'amber' ? 'from-amber-900/20 via-amber-700/10 to-amber-900/20' : 'from-emerald-900/20 via-emerald-700/10 to-emerald-900/20') : 'from-orange-900/20 via-amber-700/10 to-orange-900/20'}`} />
              </motion.div>
              <motion.div 
                animate={{ 
                  x: ['20%', '-20%'],
                  y: ['5%', '-5%']
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                className="absolute inset-[-20%] opacity-30"
              >
                <div className={`absolute inset-0 ${crtMode ? (theme === 'amber' ? 'bg-amber-800/10' : 'bg-emerald-800/10') : 'bg-orange-800/10'}`} />
              </motion.div>
            </div>
          )}

          {weather === 'acid_rain' && (
            <div className="absolute inset-0">
              <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute inset-0 ${crtMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} mix-blend-screen`}
              />
              <motion.div 
                animate={{ y: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle, ${crtMode ? 'rgba(24, 255, 98, 0.3)' : 'rgba(16, 185, 129, 0.2)'} 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}
              />
            </div>
          )}

          {weather === 'fog' && (
            <div className="absolute inset-0">
              <motion.div 
                animate={{ 
                  x: ['-10%', '10%'],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                className={`absolute inset-0 bg-gradient-to-b ${crtMode ? (theme === 'amber' ? 'from-amber-900/20 via-amber-800/30 to-amber-900/20' : 'from-emerald-900/20 via-emerald-800/30 to-emerald-900/20') : 'from-slate-500/10 via-slate-400/20 to-slate-500/10'}`}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Global Grid Overlay - Disabled per user request */}
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/5 dark:to-black/20 pointer-events-none" />
    </div>
  );
}
