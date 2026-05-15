import React from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { useStore } from '../../store/useStore';
import Tooltip from '../Tooltip';
import { Link } from 'react-router-dom';

interface TrainingSimsProps {
  t: Record<string, string>;
}

export const TrainingSims: React.FC<TrainingSimsProps> = ({ t }) => {
  const sims = [
    { to: '/encounters', icon: '✨', title: t.encounters || 'Scenarios', desc: t.encounters_desc || 'Real-time dialogue simulations', color: 'emerald' },
    { to: '/flashcards', icon: '⚡', title: t.quiz_mode || 'Quiz Mode', desc: t.quiz_mode_desc || 'Test your knowledge', color: 'primary' },
    { to: '/match', icon: '🔗', title: t.match_madness || 'Match Madness', desc: t.match_madness_desc || 'Rapidly match words', color: 'emerald' },
    { to: '/hacking', icon: '💻', title: t.terminal_hacking || 'System Hacking', desc: t.hacking_desc || 'Crack the code', color: 'slate' },
    { to: '/scenarios', icon: '🚂', title: t.scenarios || 'Scenarios', desc: t.scenarios_desc || 'Practice real-life situations', color: 'amber' },
    { to: '/videos', icon: '📺', title: t.video_lessons || 'Training Modules', desc: t.video_lessons_desc || 'Observe and learn', color: 'indigo' },
    { to: '/voice-calibration', icon: '🎤', title: t.voice_practice || 'Speaking Practice', desc: t.voice_practice_desc || 'Perfect pronunciation', color: 'rose' },
    { to: '/library', icon: '📚', title: t.knowledge_graph || 'Knowledge Graph', desc: t.knowledge_graph_desc || 'Visualize progress', color: 'primary' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 md:p-10 relative overflow-hidden group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30">
            <span className="text-2xl">🧠</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {t.cognitive_simulations || 'Cognitive Simulations'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {t.simulations_desc || 'Interactive academic training modules'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sims.map((sim, i) => (
            <Tooltip key={i} content={t.tooltip_training_sim || 'Launch training simulation'}>
              <Link
                to={sim.to}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl hover:border-primary/50 hover:shadow-xl hover:-translate-y-2 transition-all group/card flex flex-col gap-4"
              >
                <div className={`w-14 h-14 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center shrink-0 group-hover/card:scale-110 group-hover/card:bg-primary/10 group-hover/card:text-primary transition-all shadow-sm border border-slate-100 dark:border-slate-600`}>
                  <span className="text-2xl">{sim.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight group-hover/card:text-primary transition-colors">{sim.title}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-2">{sim.desc}</p>
                </div>
              </Link>
            </Tooltip>
          ))}
        </div>
      </div>
    </motion.div>
  );
};