import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import AvatarWithFrame from '../AvatarWithFrame';
import DailyLoginModal from '../DailyLoginModal';
import CharacterCustomization from '../CharacterCustomization';
import Tooltip from '../Tooltip';
import { RefreshCw, Settings, Plus } from 'lucide-react';

interface UserProfileBarProps {
  t: Record<string, string>;
  uid: string | null;
  xp: number;
  syncing: boolean;
  isOnline: boolean;
  fetchProgress: (uid: string) => Promise<void>;
  setSyncing: (v: boolean) => void;
  displayName: string;
  currentLevel: number;
  onCustomize: () => void;
}

export const UserProfileBar: React.FC<UserProfileBarProps> = ({
  t, uid, xp, syncing, isOnline, fetchProgress, setSyncing,
  displayName, currentLevel, onCustomize,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-border bg-card rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-6 group/card overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />

      <div onClick={onCustomize} className="cursor-pointer shrink-0 relative group/avatar">
        <AvatarWithFrame size="md" />
        <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white p-1 rounded-md shadow-sm border-2 border-white dark:border-slate-800">
          <Settings className="w-3 h-3" />
        </div>
      </div>

      <div className="relative z-10 flex-1 w-full text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              {t.student || 'Student'} // {uid?.slice(0, 8)}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2 uppercase tracking-tight">
              {displayName || t.student}
              <div className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[8px] font-black tracking-widest border border-primary/20">
                {t.level || 'Level'}: {currentLevel}
              </div>
            </h2>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3">
            <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
              <div className="flex justify-between w-full text-[8px] font-black text-slate-400 uppercase tracking-widest">
                <span>{t.experience || 'Experience'}</span>
                <span className="text-primary">{xp}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: `${xp % 100}%` }} className="h-full bg-primary" />
              </div>
            </div>

            {uid && (
              <button
                onClick={async () => {
                  if (syncing || !isOnline) return;
                  setSyncing(true);
                  await fetchProgress(uid);
                  setTimeout(() => setSyncing(false), 1000);
                }}
                disabled={!isOnline || syncing}
                className={`p-2 rounded-xl border transition-all ${
                  isOnline
                    ? 'bg-muted border-border text-slate-400 hover:text-primary hover:border-primary/50 shadow-sm'
                    : 'bg-muted border-border text-slate-300 dark:text-slate-700 opacity-50'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};