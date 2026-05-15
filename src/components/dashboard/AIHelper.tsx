import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { Bot, GraduationCap, ChevronRight, Sparkles } from 'lucide-react';
import PetDisplay from '../PetDisplay';
import { useStore } from '../../store/useStore';

interface AIHelperProps {
  t: Record<string, string>;
  addNotification: (message: string, type: string) => void;
}

export const AIHelper: React.FC<AIHelperProps> = ({ t, addNotification }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-4 group/ai relative overflow-hidden bg-card border border-border rounded-xl shadow-sm mt-4"
    >
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        <div className="p-3 bg-muted/50 border border-border rounded-xl shrink-0">
          <PetDisplay />
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-3 bg-muted/20 border border-border rounded-xl">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-tight">{t.ai_helper || 'AI Helper'}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Protocol 4.0 // ONLINE</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const tips = [t.ai_tip_1, t.ai_tip_2, t.ai_tip_3, t.ai_tip_4].filter(Boolean);
              addNotification(tips[Math.floor(Math.random() * tips.length)] || 'Tip!', 'info');
            }}
            className="flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all group/btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">{t.get_feedback || 'Get Feedback'}</div>
                <div className="text-[7px] text-slate-400 font-bold uppercase mt-1 leading-none">{t.ai_ready_desc || 'AI Ready'}</div>
              </div>
            </div>
            <ChevronRight className="w-3 h-3 text-primary transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};