import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export default function Notifications() {
  const notifications = useStore(state => state.notifications);
  const removeNotification = useStore(state => state.removeNotification);

  return (
    <div className="fixed top-20 md:top-6 left-4 right-4 md:left-auto md:right-6 z-[100] flex flex-col gap-3 pointer-events-none md:w-96">
      <AnimatePresence>
        {notifications.map((notif) => {
          let Icon = Info;
          let borderColor = 'border-slate-100 dark:border-slate-800';
          let textColor = 'text-slate-900 dark:text-white';
          let iconColor = 'text-blue-500';
          
          if (notif.type === 'success') {
            Icon = CheckCircle;
            borderColor = 'border-emerald-100 dark:border-emerald-900/30';
            iconColor = 'text-emerald-500';
          } else if (notif.type === 'error') {
            Icon = AlertTriangle;
            borderColor = 'border-rose-100 dark:border-rose-900/30';
            iconColor = 'text-rose-500';
          } else if (notif.type === 'warning') {
            Icon = AlertTriangle;
            borderColor = 'border-amber-100 dark:border-amber-900/30';
            iconColor = 'text-amber-500';
          }

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-4 p-4 rounded-2xl border transition-all shadow-xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90 ${borderColor} ${textColor} cursor-pointer group`}
              onClick={() => removeNotification(notif.id)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-4">
                <p className="text-sm font-semibold leading-tight">{notif.message}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
