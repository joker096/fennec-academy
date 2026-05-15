import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { CloudRain, Wind, Sun, Cloud, Zap } from 'lucide-react';
import { audioService, AmbientSound } from '../services/audioService';

const Particle = ({ color = '#60a5fa', size = 2, duration = 1, delay, x, y, angle = 90 }: { color?: string, size?: number, duration?: number, delay: number, x: string, y: string, angle?: number }) => (
  <motion.div
    initial={{ opacity: 0, x, y }}
    animate={{ 
      opacity: [0, 0.8, 0],
      y: ['0%', '110%'],
      x: angle === 90 ? x : [`${parseFloat(x)}%`, `${parseFloat(x) + (Math.tan((angle - 90) * Math.PI / 180) * 110)}%`]
    }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      delay,
      ease: "linear"
    }}
    className="particle-base"
    style={{ 
      position: 'absolute',
      width: size,
      height: size * 4,
      backgroundColor: color,
      borderRadius: '999px',
      zIndex: 20
    }}
  />
);

const DustParticle = ({ delay, x, y, color = '#92400e' }: { delay: number, x: string, y: string, color?: string }) => (
  <motion.div
    initial={{ opacity: 0, x: '-10%', y }}
    animate={{ 
      opacity: [0, 0.4, 0],
      x: ['-10%', '110%'],
      y: [`${parseFloat(y)}%`, `${parseFloat(y) + (Math.random() * 10 - 5)}%`]
    }}
    transition={{ 
      duration: 3 + Math.random() * 2, 
      repeat: Infinity, 
      delay,
      ease: "linear"
    }}
    className="particle-base"
    style={{ 
      position: 'absolute',
      width: 4 + Math.random() * 10,
      height: 2 + Math.random() * 4,
      backgroundColor: color,
      borderRadius: '40%',
      zIndex: 20
    }}
  />
);

export default function WeatherEffects() {
  const weather = useStore(state => state.weather);
  const visualEffects = useStore(state => state.visualEffects);
  const crtMode = useStore(state => state.crtMode);
  const theme = useStore(state => state.theme);

  useEffect(() => {
    if (!visualEffects) {
      audioService.playAmbient(null);
      return;
    }

    switch (weather) {
      case 'rain':
        audioService.playAmbient(AmbientSound.RAIN);
        break;
      case 'acid_rain':
        audioService.playAmbient(AmbientSound.STORM);
        break;
      case 'dust_storm':
        audioService.playAmbient(AmbientSound.WIND);
        break;
      case 'fog':
        audioService.playAmbient(AmbientSound.WIND); // Soft wind for fog
        break;
      default:
        audioService.playAmbient(null);
    }
  }, [weather, visualEffects]);

  const particles = useMemo(() => {
    if (!visualEffects) return [];
    
    if (weather === 'rain' || weather === 'acid_rain') {
      return Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * -20}%`,
        delay: Math.random() * 2,
        duration: 0.8 + Math.random() * 0.5,
        size: 1 + Math.random() * 2,
        color: weather === 'acid_rain' ? '#4ade80' : '#60a5fa'
      }));
    }
    
    if (weather === 'dust_storm') {
      return Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        color: crtMode ? (theme === 'amber' ? '#ffb642' : '#18ff62') : '#92400e'
      }));
    }

    return [];
  }, [weather, visualEffects, crtMode, theme]);

  if (!visualEffects) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence mode="wait">
        {weather === 'rain' && (
          <motion.div 
            key="rain-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-900/5"
          >
            {particles.map(p => (
              <Particle key={p.id} {...p} />
            ))}
          </motion.div>
        )}

        {weather === 'acid_rain' && (
          <motion.div 
            key="acid-rain-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-900/10"
          >
            <motion.div 
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 5 }}
              className="absolute inset-0 bg-white/5"
            />
            {particles.map(p => (
              <Particle key={p.id} {...p} />
            ))}
          </motion.div>
        )}

        {weather === 'dust_storm' && (
          <motion.div 
            key="dust-storm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-amber-900/20"
          >
            {particles.map(p => (
              <DustParticle key={p.id} {...p} />
            ))}
          </motion.div>
        )}

        {weather === 'fog' && (
          <motion.div 
            key="fog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-500/20"
          >
            <motion.div
              animate={{ 
                x: ['-20%', '20%'],
                y: ['-10%', '10%']
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)',
              }}
            />
          </motion.div>
        )}

        {weather === 'clear' && (
          <motion.div 
            key="clear-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-400/10 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
