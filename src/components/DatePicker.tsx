import React from 'react';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string | null;
  minDate?: string;
  className?: string;
}

export default function DatePicker({ value, onChange, label, error, minDate, className }: DatePickerProps) {
  return (
    <div className={`space-y-2 w-full ${className || ''}`}>
      {label && (
        <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] block ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-20 ${error ? 'text-rose-500' : 'text-primary/40 group-focus-within:text-primary'}`}>
          <CalendarIcon className="w-4 h-4" />
        </div>
        <input
          type="date"
          value={value}
          min={minDate}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-950 border-2 rounded-none pl-12 pr-4 py-3.5 text-primary outline-none transition-all appearance-none cursor-pointer font-black tracking-widest text-[12px]
            ${error 
              ? 'border-rose-500/50 focus:border-rose-500 focus:shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
              : 'border-primary/20 focus:border-primary focus:shadow-[0_0_15px_var(--primary-glow)] hover:border-primary/40'
            }
          `}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: transparent;
            bottom: 0;
            color: transparent;
            cursor: pointer;
            height: auto;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            width: auto;
            z-index: 30;
          }
        `}} />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(new Date().toISOString().split('T')[0])}
          className="flex-1 py-2 bg-slate-950 text-[9px] font-black uppercase tracking-widest text-primary/40 hover:text-primary hover:bg-primary/5 rounded-none border border-primary/20 transition-all"
        >
          {label?.toLowerCase().includes('срок') ? 'Сегодня' : 'Today'}
        </button>
        <button
          type="button"
          onClick={() => {
            const tmw = new Date();
            tmw.setDate(tmw.getDate() + 1);
            onChange(tmw.toISOString().split('T')[0]);
          }}
          className="flex-1 py-2 bg-slate-950 text-[9px] font-black uppercase tracking-widest text-primary/40 hover:text-primary hover:bg-primary/5 rounded-none border border-primary/20 transition-all"
        >
          {label?.toLowerCase().includes('срок') ? 'Завтра' : 'Tomorrow'}
        </button>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1.5 text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1"
          >
            <AlertCircle className="w-3 h-3" strokeWidth={3} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
