import React from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { Lightbulb, Zap, CheckCircle2 } from 'lucide-react';
import Tooltip from '../Tooltip';
import DailyQuests from '../DailyQuests';

interface DailyQuestsSectionProps {
  t: Record<string, string>;
}

export const DailyQuestsSection: React.FC<DailyQuestsSectionProps> = ({ t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="absolute top-10 right-10 z-20">
        <a
          href="/quests"
          className="text-[10px] font-black text-primary/40 hover:text-primary transition-all flex items-center gap-2 uppercase tracking-widest"
        >
          {t.all_quests_link || 'All Quests'}
          <span className="text-[10px]">→</span>
        </a>
      </div>
      <DailyQuests />
    </motion.div>
  );
};