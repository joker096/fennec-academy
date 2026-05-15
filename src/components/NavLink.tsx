import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import React from 'react';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  progress?: number;
}

export default function NavLink({ to, icon, label, active: isActive, badge, progress }: NavLinkProps) {
  const location = useLocation();
  const active = isActive ?? location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative flex flex-col px-4 py-3 transition-all duration-300 group overflow-hidden rounded-lg border-2 ${
        active
          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 z-20'
          : 'bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="flex items-center gap-3">
          <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-primary'} transition-colors shrink-0`}>
            {React.cloneElement(icon as any, { className: 'w-5 h-5' })}
          </span>
          <span className="font-mono font-bold text-[11px] uppercase tracking-wider">{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
          <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border ${active ? 'bg-white text-primary border-white' : 'bg-primary text-white border-primary'}`}>
            {badge}
          </span>
        )}
      </div>
      {progress !== undefined && (
        <div className={`w-full h-1 mt-2 rounded-full overflow-hidden relative z-10 ${active ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${active ? 'bg-white' : 'bg-primary'}`}
          />
        </div>
      )}
    </Link>
  );
}