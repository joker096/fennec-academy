import React from 'react';
import { motion } from 'motion/react';
import { Flame, Activity, BrainCircuit, Zap, Coffee, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { SRSService } from '../../services/srsService';

interface DiagnosticsGridProps {
  special: Record<string, number>;
  specialProgress: Record<string, number>;
  sessionReviews: number;
  dailyProgress: any;
  equippedPerks: string[];
  cognitiveLoad: number;
  hydrationLevel: number;
  weather: string;
  sessionStartTime: number;
  currentMistakeStreak: number;
  daysSurvived: number;
  credits: number;
  consumeItem: (type: string) => void;
  useMedkit: () => void;
  medkits: number;
  health: number;
  t: Record<string, string>;
}

export const DiagnosticsGrid: React.FC<DiagnosticsGridProps> = ({
  special,
  specialProgress,
  sessionReviews,
  dailyProgress,
  equippedPerks,
  cognitiveLoad,
  hydrationLevel,
  weather,
  sessionStartTime,
  currentMistakeStreak,
  daysSurvived,
  credits,
  consumeItem,
  useMedkit,
  medkits,
  health,
  t,
}) => {
  const diagnosicsContext = {
    special,
    sessionReviews,
    dailyReviews: dailyProgress.flashcardsReviewed || 0,
    equippedPerks,
    cognitiveLoad,
    hydrationLevel,
    weather,
    sessionStartTime,
    currentMistakeStreak,
  } as any;

  const fatigueMultiplier = SRSService.getFatigueMultiplier(diagnosicsContext);
  const fatiguePenaltyPercent = Math.max(0, Math.min(100, Math.round((1 - fatigueMultiplier) * 100)));

  const hour = new Date().getHours();
  const diagnosicCircadianFactor = SRSService.getCircadianFactor(hour, weather);
  const diagnosicTimePercent = Math.round(diagnosicCircadianFactor * 100);

const diagnostics = [
     {
       icon: <Flame className="w-4 h-4 text-orange-500" />,
       label: t.streak || 'STK',
       value: `${daysSurvived} <span className="text-[10px] text-slate-400 uppercase">DYS</span>`,
       rawValue: daysSurvived,
     },
     {
       icon: <Activity className="w-4 h-4 text-primary" />,
       label: t.stat_p || 'PK',
       bar: true,
       percent: diagnosicTimePercent,
       status: diagnosicCircadianFactor > 1.2 ? 'CRITICAL' : 'OPTIMAL',
     },
     {
       icon: <BrainCircuit className="w-4 h-4 text-amber-500" />,
       label: t.stat_i || 'FTG',
       bar: true,
       percent: fatiguePenaltyPercent,
       status: fatiguePenaltyPercent > 50 ? 'PEAK' : 'LOW',
     },
     {
       icon: <Zap className="w-4 h-4 text-indigo-500" />,
       label: t.stat_e || 'LOD',
       bar: true,
       percent: cognitiveLoad,
       action: (
         <button onClick={() => consumeItem('food')} disabled={credits < 15} className="text-[9px] font-bold uppercase text-primary text-left">
           {t.refill || 'REFILL'}
         </button>
       ),
     },
     {
       icon: <Coffee className="w-4 h-4 text-blue-500" />,
       label: t.stat_s || 'HYD',
       bar: true,
       percent: hydrationLevel,
       action: (
         <button onClick={() => consumeItem('drink')} disabled={credits < 15} className="text-[9px] font-bold uppercase text-primary text-left">
           {t.drink || 'DRINK'}
         </button>
       ),
     },
     {
       icon: <ShieldCheck className="w-4 h-4 text-rose-500" />,
       label: 'HP',
       bar: true,
       percent: health,
       action: (
         <button onClick={() => useMedkit()} disabled={medkits === 0 || health === 100} className="text-[9px] font-bold uppercase text-rose-500 text-left">
           {t.fix || 'FIX'}
         </button>
       ),
     },
   ];

  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-3 p-3 border border-border rounded-xl bg-muted/20">
      {diagnostics.map((item, i) => (
        <div key={i} className="p-2 flex flex-col gap-1 hover-lift group/stat overflow-hidden relative bg-card border border-border rounded-xl">
          <div className="flex items-center gap-1.5 relative z-10">
            {item.icon}
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
          </div>
          {item.bar ? (
            <>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden mb-0.5">
                <motion.div
                  animate={{ width: `${item.percent}%` }}
                  className={`h-full ${
                    item.percent > 50 ? 'bg-primary' : 'bg-primary'
                  }`}
                />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter leading-none">
                {item.status || (item.percent > 50 ? 'PEAK' : 'LOW')}
              </span>
            </>
          ) : (
            <div className="text-base font-black text-foreground relative z-10 leading-none" dangerouslySetInnerHTML={{ __html: item.value }} />
          )}
          {item.action && <div className="mt-1">{item.action}</div>}
        </div>
      ))}
    </div>
  );
};