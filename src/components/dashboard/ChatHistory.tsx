import React from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Bot } from 'lucide-react';

interface ChatHistoryProps {
  t: Record<string, string>;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 md:p-10 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 flex items-center justify-center text-primary rounded-2xl shadow-sm border border-primary/20">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {t.recent_interactions || 'Recent Consultations'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {t.chat_history_desc || 'Archived academic dialogues and simulations'}
            </p>
          </div>
        </div>
        <Link
          to="/tutor"
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary hover:border-primary/50 transition-all"
        >
          {t.view_all || 'View Archives'}
          <span className="text-[10px]">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {useStore.getState().chatSessions.length === 0 ? (
          <div className="md:col-span-2 py-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <span className="text-4xl mb-4">💬</span>
            <p className="text-sm font-medium text-slate-400 max-w-[200px]">
              {t.no_recent_interactions || 'No recent academic dialogues archived.'}
            </p>
            <Link to="/tutor" className="mt-6 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-80">
              {t.start_new || 'Initiate Link'}
            </Link>
          </div>
        ) : (
          useStore.getState().chatSessions.slice(0, 4).map((session: any) => (
            <Link
              key={session.id}
              to="/tutor"
              onClick={() => useStore.getState().setCurrentSessionId(session.id)}
              className="p-5 flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-primary/50 hover:bg-white dark:hover:bg-slate-800 transition-all group/session shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover/session:text-primary transition-colors">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover/session:text-primary transition-colors">
                  {session.title || 'Academic Session'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400">🕐</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {session.messages.length} {t.messages || 'Logs'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-300 group-hover/session:translate-x-1 transition-transform">→</span>
            </Link>
          ))
        )}
      </div>
    </motion.div>
  );
};