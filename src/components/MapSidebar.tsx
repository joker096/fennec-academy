import React from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, BookOpen, Layers, Zap, MessageSquare, Shield, Settings, User } from 'lucide-react';
import Tooltip from './Tooltip';

interface NavPOI {
  path: string;
  label: string;
  icon: React.ReactNode;
  x: number;
  y: number;
}

import { useT } from '../lib/i18n';

export default function MapSidebar() {
  const location = useLocation();
  const t = useT();

  const pois: NavPOI[] = [
    { path: '/', label: t.dashboard || 'Home', icon: <Home className="w-5 h-5" />, x: 50, y: 8 },
    { path: '/quests', label: t.daily_quests || 'Quests', icon: <Trophy className="w-5 h-5" />, x: 35, y: 22 },
    { path: '/flashcards', label: t.flashcards || 'Review', icon: <Layers className="w-5 h-5" />, x: 65, y: 32 },
    { path: '/vocabulary', label: t.vocabulary_bank || 'Lexicon', icon: <BookOpen className="w-5 h-5" />, x: 50, y: 45 },
    { path: '/perks', label: t.perk_cards || 'Skills', icon: <Zap className="w-5 h-5" />, x: 35, y: 58 },
    { path: '/character', label: t.nav_character || 'User', icon: <User className="w-5 h-5" />, x: 65, y: 68 },
    { path: '/tutor', label: t.nav_comms || 'Tutor', icon: <MessageSquare className="w-5 h-5" />, x: 50, y: 80 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', 
             backgroundSize: '24px 24px' 
           }} 
      />
      
      {/* Map Nodes */}
      <div className="flex-1 relative p-6">
        {/* Draw smooth modern connections */}
        <svg className="absolute inset-0 w-full h-full text-border pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
           <path d="M 50 8 L 35 22 L 50 45 L 65 32 L 50 8" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
           <path d="M 50 45 L 35 58 L 50 80 L 65 68 L 50 45" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
        </svg>

        {pois.map((poi) => {
          const isActive = location.pathname === poi.path;
          return (
            <div
              key={poi.path}
              style={{ 
                left: `${poi.x}%`, 
                top: `${poi.y}%`
              }}
              className="absolute z-10 w-0 h-0" // Zero size container as the anchor
            >
              <div className="absolute -translate-x-1/2 -translate-y-1/2">
                <Tooltip content={poi.label} position={poi.x > 60 ? 'left' : 'right'}>
                  <Link to={poi.path} className="relative flex flex-col items-center group">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className={`
                        w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center border-2 transition-all shadow-lg relative
                        ${isActive 
                          ? 'bg-primary border-primary text-white shadow-primary/30 z-20' 
                          : 'bg-card border-border text-slate-400 hover:border-primary hover:text-primary'}
                      `}
                    >
                      {poi.icon}
                      {isActive && (
                        <motion.div 
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 rounded-xl bg-primary pointer-events-none"
                        />
                      )}
                    </motion.div>
                    
                    {/* Label floating below the icon */}
                    <div className="absolute top-full mt-2 pointer-events-none overflow-visible whitespace-nowrap flex justify-center w-0">
                      <span className={`
                        text-[8px] font-black uppercase tracking-tighter transition-all duration-300 px-1.5 py-0.5 rounded-md
                        bg-card/90 backdrop-blur-md shadow-sm border border-border
                        ${isActive 
                          ? 'text-primary opacity-100 scale-100' 
                          : 'text-slate-500 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'}
                      `}>
                        {poi.label.split(' ')[0]}
                      </span>
                    </div>
                  </Link>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom HUD */}
      <div className="p-4 bg-card border-t border-border text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
        {t.location || 'Campus'}: {t.wasteland || 'Main Complex'}
      </div>
    </div>
  );
}
