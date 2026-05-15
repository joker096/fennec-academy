import React from 'react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'motion/react';
import { Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ACADEMIC_PERKS } from '../../data/gameData';
import { useStore } from '../../store/useStore';
import Tooltip from '../Tooltip';

interface SkillsPerksProps {
  t: Record<string, string>;
  uiLang: string;
  equippedPerks: string[];
}

export const SkillsPerks: React.FC<SkillsPerksProps> = ({ t, uiLang, equippedPerks }) => {
  const activeSynergies = useStore.getState().getActiveSynergies();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card border border-border rounded-xl group relative overflow-hidden shadow-sm"
    >
<div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-md">
         <Star className="w-5 h-5 text-white" />
       </div>
       <div className="flex-1 text-left relative z-10 flex flex-wrap items-center gap-2">
         <h3 className="font-black text-[10px] text-slate-900 dark:text-white uppercase tracking-tight mr-2">{t.perks_title || 'Skills & Perks'}:</h3>
         {equippedPerks.length > 0 ? (
           <div className="flex flex-wrap items-center gap-2">
             {equippedPerks.map(perkId => {
               const perk = ACADEMIC_PERKS.find(p => p.id === perkId);
               if (!perk) return null;
               const translation = perk.translations[uiLang] || perk.translations.en;
               return (
                 <div key={perkId} className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 border border-border rounded-lg">
                   <img src={perk.imageUrl} alt={translation.name} className="w-4 h-4 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />
                   <span className="font-black text-[9px] text-slate-600 dark:text-slate-400 uppercase tracking-wider">{translation.name}</span>
                 </div>
               );
             })}
           </div>
         ) : (
           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider italic">{t.no_perks || 'No enhancers active'}</span>
         )}

         {activeSynergies.length > 0 && (
           <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 ml-2 pl-2">
             {activeSynergies.map(synergy => (
               <Tooltip key={synergy.stat} content={`${synergy.name[uiLang] || synergy.name.en}: ${synergy.description[uiLang] || synergy.description.en}`}>
                 <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-md">
                   <Star className="w-3 h-3 fill-amber-500" />
                   <span className="text-[8px] font-bold">{synergy.stat.charAt(0)}</span>
                 </div>
               </Tooltip>
             ))}
           </div>
         )}
       </div>
       <Link
         to="/perks"
         className="px-4 py-2 bg-primary text-white text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-primary/80 transition-all flex items-center gap-2 shrink-0"
       >
         {t.view_perks || 'Upgrades'}
         <ChevronRight className="w-3 h-3" />
       </Link>
    </motion.div>
  );
};