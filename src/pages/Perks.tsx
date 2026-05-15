import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ACADEMIC_PERKS as FALLOUT_PERKS } from '../data/gameData';
import { logEvent } from '../firebase';
import { Lock, Check, AlertCircle, Zap, Search, Shield, Share2, Coins, Star, Info, Database, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import { UI_TRANSLATIONS } from '../data/translations';
import Tooltip from '../components/Tooltip';
import { audioService, SoundEffect } from '../services/audioService';
import { motion, AnimatePresence } from 'motion/react';

const statThemes: Record<string, {
  primary: string;
  bg: string;
  border: string;
  text: string;
  lightText: string;
  header: string;
  subtle: string;
  accent: string;
}> = {
  strength: {
    primary: 'bg-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500',
    text: 'text-rose-500',
    lightText: 'text-rose-400',
    header: 'bg-rose-500',
    subtle: 'bg-rose-500/5',
    accent: 'border-rose-500/30'
  },
  perception: {
    primary: 'bg-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500',
    text: 'text-orange-500',
    lightText: 'text-orange-400',
    header: 'bg-orange-500',
    subtle: 'bg-orange-500/5',
    accent: 'border-orange-500/30'
  },
  endurance: {
    primary: 'bg-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500',
    text: 'text-green-500',
    lightText: 'text-green-400',
    header: 'bg-green-500',
    subtle: 'bg-green-500/5',
    accent: 'border-green-500/30'
  },
  charisma: {
    primary: 'bg-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500',
    text: 'text-pink-500',
    lightText: 'text-pink-400',
    header: 'bg-pink-500',
    subtle: 'bg-pink-500/5',
    accent: 'border-pink-500/30'
  },
  intelligence: {
    primary: 'bg-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500',
    text: 'text-blue-500',
    lightText: 'text-blue-400',
    header: 'bg-blue-500',
    subtle: 'bg-blue-500/5',
    accent: 'border-blue-500/30'
  },
  agility: {
    primary: 'bg-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500',
    text: 'text-emerald-500',
    lightText: 'text-emerald-400',
    header: 'bg-emerald-500',
    subtle: 'bg-emerald-500/5',
    accent: 'border-emerald-500/30'
  },
  luck: {
    primary: 'bg-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500',
    text: 'text-amber-500',
    lightText: 'text-amber-400',
    header: 'bg-amber-500',
    subtle: 'bg-amber-500/5',
    accent: 'border-amber-500/30'
  },
  default: {
    primary: 'bg-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500',
    text: 'text-indigo-500',
    lightText: 'text-indigo-400',
    header: 'bg-indigo-500',
    subtle: 'bg-indigo-500/5',
    accent: 'border-indigo-500/30'
  }
};

export default function Perks() {
  const xp = useStore(state => state.xp);
  const credits = useStore(state => state.credits);
  const caps = credits; // Keep for minimal changes in the rest of the file
  const equippedPerks = useStore(state => state.equippedPerks);
  const unlockedPerks = useStore(state => state.unlockedPerks);
  const togglePerk = useStore(state => state.togglePerk);
  const buyPerk = useStore(state => state.buyPerk);
  const uiLang = useStore(state => state.uiLang);
  const addNotification = useStore(state => state.addNotification);
  const currentLevel = Math.floor(xp / 100) + 1;
  const MAX_PERKS = 3;

  const uiT = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredPerks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    // Filter out perks without valid images
    const perksWithImages = FALLOUT_PERKS.filter(perk => perk.imageUrl && perk.imageUrl.trim() !== '');
    
    if (!query) return perksWithImages;
    
    return perksWithImages.filter(perk => {
      const translation = perk.translations[uiLang] || perk.translations.en;
      return translation.name.toLowerCase().includes(query) || 
             translation.description.toLowerCase().includes(query);
    });
  }, [searchQuery, uiLang]);

  const handleShare = async (e: React.MouseEvent, perk: any) => {
    e.stopPropagation();
    const translation = perk.translations[uiLang] || perk.translations.en;
    const shareData = {
      title: `Fennec Skill: ${translation.name}`,
      text: `${translation.description}\nEffect: ${translation.effect}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        addNotification(uiT.share_success || 'Shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        addNotification(uiT.share_success || 'Link copied!', 'success');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        addNotification(uiT.share_error || 'Share failed', 'error');
      }
    }
  };

  const handleAction = (perkId: string, isUnlockedByLevel: boolean) => {
    if (!isUnlockedByLevel) return;
    
    const isUnlocked = unlockedPerks.includes(perkId);
    if (!isUnlocked) {
      const perk = FALLOUT_PERKS.find(p => p.id === perkId);
      if (perk && caps >= perk.cost) {
        if (buyPerk(perk.id, perk.cost)) {
          addNotification(uiT.skill_purchased || 'Skill purchased!', 'success');
          audioService.play(SoundEffect.XP_GAIN);
        }
      } else {
        addNotification(uiT.not_enough_caps || 'Not enough caps!', 'error');
      }
      return;
    }

    const isEquipped = equippedPerks.includes(perkId);
    if (!isEquipped && equippedPerks.length >= MAX_PERKS) {
      const oldestPerkId = equippedPerks[0];
      togglePerk(oldestPerkId);
      togglePerk(perkId);
      addNotification(uiT.skill_swapped || 'Perk swapped', 'info');
      audioService.play(SoundEffect.SUCCESS);
      return;
    }
    
    togglePerk(perkId);
    audioService.play(SoundEffect.SUCCESS);
    logEvent('perk_toggle', { perk_id: perkId, is_equipped: !isEquipped });
  };

  const isAtLimit = equippedPerks.length >= MAX_PERKS;

  const activeSynergies = useStore.getState().getActiveSynergies();

  const getStatTheme = (stat: string) => {
    return statThemes[stat?.toLowerCase()] || statThemes.default;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden pb-32">
      <SEO 
        title={uiT.perk_cards || uiT.skill_cards} 
        description={uiT.perks_subtitle}
      />
      
      {/* Header Section: Academy Themed */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 md:p-16 mb-12 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-[2rem] bg-indigo-600 flex items-center justify-center p-4 shadow-xl shadow-indigo-500/20">
            <Star className="w-16 h-16 md:w-24 md:h-24 text-white" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-4 leading-none">
              {uiT.skill_cards}
            </h1>
            <p className="text-slate-500 font-bold text-lg uppercase tracking-widest max-w-xl">
              {uiT.perks_subtitle}
            </p>
            
            <div className="mt-10 flex flex-wrap gap-6 justify-center md:justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-6 py-3 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-widest shadow-sm">
                {uiT.currency || 'Credits'}: {credits}
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl px-6 py-3 font-bold text-xs uppercase tracking-widest shadow-sm">
                {uiT.lvl_label || uiT.rank_label || 'RANK'}: {currentLevel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Loadout Slots */}
      <div className="terminal-panel bg-primary/5 p-8 md:p-12 border-primary/10 mb-12 relative overflow-hidden group/loadout">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.3)]">
              {uiT.active_loadout || 'ACTIVE LOADOUT'}
            </h2>
            <div className="flex items-center gap-3 mt-4">
              {[...Array(MAX_PERKS)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-none transition-all duration-500 border border-primary/20 ${i < equippedPerks.length ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),1)] scale-110' : 'bg-primary/5'}`} />
              ))}
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] ml-4">
                {equippedPerks.length} / {MAX_PERKS} {uiT.slots_filled || 'SLOTS FILLED'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 terminal-panel bg-primary/5 border-primary/20 max-w-sm">
             <Info className="w-5 h-5 text-primary shrink-0" />
             <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-tight">
                {uiT.perk_info_hint || 'Equip cards to gain permanent passive bonuses'}
             </span>
          </div>
        </div>
        
        <div className="flex justify-center gap-8 md:gap-14 flex-wrap">
          {[...Array(MAX_PERKS)].map((_, i) => {
            const perkId = equippedPerks[i];
            const perk = perkId ? FALLOUT_PERKS.find(p => p.id === perkId) : null;
            const translation = perk ? (perk.translations[uiLang] || perk.translations.en) : null;

            return (
              <motion.div 
                key={i} 
                initial={false}
                animate={perk ? { y: 0, opacity: 1, scale: 1 } : { y: 10, opacity: 0.5, scale: 0.95 }}
                className="flex flex-col items-center group/slot"
              >
                <div 
                  className={`w-36 h-52 md:w-44 md:h-64 rounded-none border-2 flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden ${
                    perk 
                      ? 'terminal-panel border-primary/60 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] hover:border-primary hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)] hover:-translate-y-2 bg-black/60' 
                      : 'border-dashed border-primary/20 bg-primary/2'
                   }`}
                >
                  {perk ? (
                    <>
                      <img src={perk.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover/slot:scale-110 transition-transform duration-700 opacity-40 grayscale group-hover:grayscale-0" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-primary/5 group-hover/slot:bg-transparent transition-colors" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-black/60 border-t border-primary/20">
                        <span className="text-xs font-black text-primary uppercase leading-tight line-clamp-2 text-center tracking-[0.2em] drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]">
                          {translation?.name}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(perk.id, true);
                        }}
                        className="absolute top-3 right-3 terminal-panel bg-rose-500/20 text-rose-500 p-2.5 rounded-none opacity-0 group-hover/slot:opacity-100 transition-all hover:bg-rose-500 hover:text-black z-30 border-rose-500/30"
                        title={uiT.unequip || 'Unequip'}
                      >
                        <Lock className="w-4 h-4 rotate-45" />
                      </button>
                      
                      <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-6 opacity-20 text-primary">
                      <Star className="w-12 h-12 animate-pulse shadow-[0_0_20px_var(--primary-glow)]" />
                      <span className="text-[9px] font-black uppercase tracking-[0.4em]">{uiT.open_slot || 'VACANT'}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Synergies Section */}
      <AnimatePresence>
        {activeSynergies.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-12 overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">
                {uiT.active_synergies || 'ATTRIBUTE SYNERGIES'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSynergies.map((synergy) => {
                const theme = getStatTheme(synergy.stat);
                return (
                  <motion.div
                    key={synergy.stat}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`p-4 rounded-2xl border-2 flex items-start gap-4 ${theme.bg} ${theme.border} shadow-lg`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${theme.primary} flex items-center justify-center shrink-0 shadow-lg`}>
                      <span className="text-white font-black text-lg">{synergy.stat.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-black text-xs uppercase tracking-wider ${theme.text}`}>
                          {synergy.name[uiLang] || synergy.name.en}
                        </h3>
                        <span className="px-1.5 py-0.5 rounded bg-white/20 text-[8px] font-black uppercase">
                          SYNERGY
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-snug">
                        {synergy.description[uiLang] || synergy.description.en}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredPerks.map((perk) => {
            const isUnlockedByLevel = currentLevel >= perk.unlockLevel;
            const isPurchased = unlockedPerks.includes(perk.id);
            const isEquipped = equippedPerks.includes(perk.id);
            const translation = perk.translations[uiLang] || perk.translations.en;
            const isDisabled = !isUnlockedByLevel;
            const theme = getStatTheme(perk.stat);

            return (
              <motion.div 
                layout
                key={perk.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={!isDisabled ? { y: -5 } : {}}
                onClick={() => handleAction(perk.id, isUnlockedByLevel)}
                className={`group relative flex flex-col rounded-2xl transition-all cursor-pointer overflow-hidden border-2 h-full shadow-sm hover:shadow-xl ${
                  isEquipped 
                    ? `${theme.border} ${theme.bg}` 
                    : !isPurchased && isUnlockedByLevel
                      ? `${theme.border} bg-white dark:bg-slate-900 border-dashed`
                      : isDisabled
                        ? 'opacity-40 border-slate-200 dark:border-slate-800 grayscale cursor-not-allowed bg-slate-100 dark:bg-slate-950/50'
                        : `${theme.border} bg-white dark:bg-slate-900 border-2`
                }`}
              >
                {/* Header */}
                <div className={`h-10 px-4 flex items-center justify-between border-b transition-colors ${
                   isEquipped ? `${theme.header} text-white` : `${theme.bg} ${theme.text} border-b-current/10`
                }`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-black uppercase tracking-widest truncate ${isEquipped ? 'text-white' : theme.text}`}>
                      {translation.name}
                    </span>
                  </div>
                  {isEquipped ? (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-black uppercase tracking-tighter opacity-80`}>{perk.stat}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-3 relative flex flex-col">
                   <div className={`absolute top-2 right-2 font-black text-[9px] flex items-center gap-1 z-10 px-2 py-0.5 rounded-full border ${
                     isEquipped 
                       ? `${theme.header} text-white border-white/20` 
                       : `bg-white dark:bg-slate-800 ${theme.text} ${theme.accent}`
                   }`}>
                      <Coins className="w-2.5 h-2.5" />
                      {perk.cost}
                   </div>
 
                    <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800/50 mb-3 flex items-center justify-center border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-inner shrink-0">
                       <img 
                         src={perk.imageUrl} 
                         className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isEquipped ? 'grayscale-0 opacity-100' : 'grayscale-0 opacity-80 group-hover:opacity-100'}`} 
                         referrerPolicy="no-referrer"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>
 
                    <div className="flex-1 space-y-2">
                       <p className={`text-[11px] font-bold tracking-tight leading-snug line-clamp-2 ${isEquipped ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                         {translation.description}
                       </p>
 
                       <div className={`p-2 rounded-lg transition-all border ${
                         isEquipped 
                           ? `${theme.bg} ${theme.accent} ${theme.text}` 
                           : `bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 ${theme.lightText}`
                       }`}>
                         <p className="text-[10px] font-black italic leading-tight uppercase tracking-tight">
                           {translation.effect}
                         </p>
                       </div>
                    </div>
                 </div>
 
                 {/* Action */}
                 <div className={`p-2 border-t ${isEquipped ? `${theme.subtle} ${theme.accent}` : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}>
                    {!isPurchased && isUnlockedByLevel ? (
                      <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleAction(perk.id, isUnlockedByLevel);
                         }}
                         className={`w-full ${theme.header} text-white font-black text-[9px] uppercase py-2 tracking-widest hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 rounded-xl shadow-sm`}
                      >
                         <Coins className="w-3 h-3" />
                         {uiT.buy_btn || 'BUY'}: {perk.cost}
                      </button>
                    ) : isPurchased ? (
                      <button
                         onClick={(e) => {
                           e.stopPropagation();
                           handleAction(perk.id, isUnlockedByLevel);
                         }}
                         className={`w-full font-black text-[9px] uppercase py-2 tracking-widest transition-all rounded-xl border flex items-center justify-center gap-2 ${
                           isEquipped 
                             ? `${theme.bg} ${theme.text} ${theme.accent}` 
                             : `bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:${theme.border} hover:${theme.text}`
                         }`}
                      >
                         {isEquipped ? (
                           <>
                             <Check className="w-3 h-3" strokeWidth={4} />
                             {uiT.equipped || 'EQUIPPED'}
                           </>
                         ) : (
                           <>
                             <Zap className="w-3 h-3" />
                             {uiT.ready || 'EQUIP'}
                           </>
                         )}
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-1.5 text-slate-400 dark:text-slate-600 bg-slate-100/50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                         <Lock className="w-3 h-3" />
                         <span className="text-[8px] font-black uppercase tracking-widest">
                           {uiT.lvl_label || uiT.rank_label || 'RANK'} {perk.unlockLevel}
                         </span>
                      </div>
                    )}
                 </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
