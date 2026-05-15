import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Book, 
  Dumbbell, 
  Radio, 
  Heart, 
  Coffee, 
  Shield, 
  Zap, 
  Lock, 
  CheckCircle2, 
  Coins,
  Info,
  TrendingUp,
  LayoutGrid,
  Clock,
  Sparkles,
  Users,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import { CAMPUS_ROOMS as VAULT_ROOMS, VaultRoom } from '../data/vaultRooms';
import { audioService, SoundEffect } from '../services/audioService';
import SEO from '../components/SEO';
import Tooltip from '../components/Tooltip';

const Vault: React.FC = () => {
  const navigate = useNavigate();
  const { 
    uiLang, 
    credits: caps, 
    xp, 
    unlockedRooms, 
    roomLastCollection,
    universityPopulation: vaultPopulation,
    unlockRoom,
    collectRoomResource,
    addNotification
  } = useStore();

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const level = Math.floor(xp / 100) + 1;
  const [now, setNow] = useState(new Date());

  // Update "now" every second to refresh progress bars
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activePerks = useMemo(() => {
    return VAULT_ROOMS
      .filter(room => unlockedRooms.includes(room.id) && room.perk)
      .map(room => ({
        id: room.id,
        name: t[room.nameKey] || room.id,
        perk: room.perk
      }));
  }, [unlockedRooms, t]);

  const handleUnlock = (room: VaultRoom) => {
    if (unlockedRooms.includes(room.id)) return;
    
    if (caps < room.cost) {
      addNotification(t.insufficient_caps, 'error');
      return;
    }

    if (level < room.requiredLevel) {
      addNotification(t.level_required.replace('{level}', room.requiredLevel.toString()), 'error');
      return;
    }

    unlockRoom(room.id, room.cost);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-terminal scanlines">
      {/* Blueprint Grid Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <SEO 
        title={`${t.vault_title || 'University Campus'} | Fennec Academy`}
        description={t.vault_subtitle || 'Manage your academic facilities and campus population.'}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-primary/20 pb-10">
          <div className="text-center sm:text-left space-y-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2"
            >
              <LayoutGrid className="w-3 h-3" />
              {t.vault_title || 'University Campus'} // SEC_PROTOCOL_4
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl font-black text-primary tracking-tighter uppercase drop-shadow-[0_0_15px_var(--primary-glow)]"
            >
              {t.vault_title || 'University Campus'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary/60 text-xs font-bold uppercase tracking-[0.2em] max-w-2xl"
            >
              {t.vault_subtitle || 'Manage academic facilities and campus population.'}
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { audioService.play(SoundEffect.CLICK); navigate('/scenarios'); }}
            className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-black px-10 py-5 rounded-[2rem] font-black text-lg shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all uppercase tracking-widest whitespace-nowrap"
          >
            <Compass className="w-6 h-6" />
            {t.wasteland_expedition || 'Research Expedition'}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Vault Grid */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {VAULT_ROOMS.map((room, index) => {
                const isUnlocked = unlockedRooms.includes(room.id);
                const canAfford = caps >= room.cost;
                const levelMet = level >= room.requiredLevel;
                const Icon = room.icon;

                // Production Logic
                const lastCollection = roomLastCollection[room.id];
                let progress = 0;
                let isReady = false;
                let timeRemaining = "";

                if (isUnlocked && room.production && lastCollection) {
                  const last = new Date(lastCollection);
                  const elapsed = (now.getTime() - last.getTime()) / 1000;
                  progress = Math.min(100, (elapsed / room.production.interval) * 100);
                  isReady = elapsed >= room.production.interval;
                  
                  if (!isReady) {
                    const remaining = Math.ceil(room.production.interval - elapsed);
                    const mins = Math.floor(remaining / 60);
                    const secs = remaining % 60;
                    timeRemaining = `${mins}:${secs.toString().padStart(2, '0')}`;
                  }
                }

                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden ${
                      isUnlocked 
                        ? 'glass-card border-primary/20 hover:border-primary/50' 
                        : 'bg-black/40 border-primary/5 grayscale opacity-60'
                    }`}
                  >
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rotate-45 translate-x-12 -translate-y-12 pointer-events-none" />

                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-2xl transition-all ${
                        isUnlocked 
                          ? isReady ? 'bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] border border-green-500/30' : 'bg-primary/10 text-primary border border-primary/20 shadow-inner' 
                          : 'bg-black/40 text-primary/20 border border-primary/5'
                      }`}>
                        <Icon className={`w-8 h-8 ${isReady ? 'animate-bounce' : ''}`} strokeWidth={isUnlocked ? 2.5 : 1.5} />
                      </div>
                      
                      <div className={`flex flex-col items-end gap-1.5`}>
                        {isUnlocked ? (
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border transition-all ${
                            isReady ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-primary/40 border-primary/10 bg-primary/5'
                          }`}>
                            {isReady ? t.ready_to_collect : t.room_unlocked}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-500/60 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-amber-500/10 bg-amber-500/5">
                            <Lock className="w-3 h-3" />
                            {t.locked}
                          </div>
                        )}
                        {isReady && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping shadow-[0_0_10px_rgba(34,197,94,1)]" />}
                      </div>
                    </div>

                    <h3 className={`text-2xl font-black mb-2 uppercase tracking-tighter leading-none ${isUnlocked ? 'text-primary drop-shadow-[0_0_5px_var(--primary-glow)]' : 'text-primary/20'}`}>
                      {t[room.nameKey] || room.id}
                    </h3>
                    <p className={`text-xs font-bold font-terminal tracking-wider uppercase mb-8 line-clamp-2 leading-relaxed ${isUnlocked ? 'text-primary/60' : 'text-primary/10'}`}>
                      {t[room.descriptionKey] || ''}
                    </p>

                    {/* Production UI */}
                    {isUnlocked && room.production && (
                      <div className="mb-8 space-y-3">
                        <div className="flex items-end justify-between">
                          <div className="space-y-1">
                            <div className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em]">Efficiency Protocol</div>
                            <div className={`text-[10px] font-black flex items-center gap-2 uppercase tracking-widest ${isReady ? 'text-green-400' : 'text-primary/40'}`}>
                              <Clock className="w-3.5 h-3.5" />
                              {isReady ? t.ready_to_collect : timeRemaining}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em]">Output</div>
                            <div className="text-sm font-black text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.3)]">
                              +{room.production.amount} {t[`resource_${room.production.type}`]}
                            </div>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-primary/10 p-[1px]">
                          <motion.div 
                            className={`h-full rounded-full transition-colors ${isReady ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-primary/40'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/10 relative z-10">
                      {!isUnlocked ? (
                        <div className="flex flex-col gap-4 w-full">
                          <div className="flex items-center justify-between">
                            <div className={`flex flex-col gap-0.5`}>
                              <span className="text-[8px] font-black text-primary/30 uppercase tracking-widest">Resources Req.</span>
                              <div className={`flex items-center gap-2 font-black text-sm uppercase ${canAfford ? 'text-amber-500' : 'text-rose-500 animate-pulse'}`}>
                                <Coins className="w-4 h-4" />
                                {room.cost} CAPS
                              </div>
                            </div>
                            <div className="flex flex-col gap-0.5 text-right">
                              <span className="text-[8px] font-black text-primary/30 uppercase tracking-widest">Clearance Req.</span>
                              <div className={`flex items-center gap-2 font-black text-sm uppercase justify-end ${levelMet ? 'text-primary' : 'text-rose-500 animate-pulse'}`}>
                                <TrendingUp className="w-4 h-4" />
                                LVL {room.requiredLevel}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlock(room)}
                            disabled={!canAfford || !levelMet}
                            className={`modern-button w-full !py-4 uppercase tracking-[0.3em] text-xs ${
                              (!canAfford || !levelMet) && 'opacity-20 grayscale grayscale-1 cursor-not-allowed shadow-none'
                            }`}
                          >
                            {t.unlock_room}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { audioService.play(SoundEffect.CLICK); collectRoomResource(room.id); }}
                          disabled={!isReady}
                          className={`w-full py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 ${
                            isReady
                              ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-[1.02] border-2 border-green-400'
                              : 'bg-black/40 text-primary/30 border-2 border-primary/5 cursor-not-allowed'
                          }`}
                        >
                          {isReady ? (
                            <><Sparkles className="w-4 h-4" strokeWidth={3} /> {t.collect_resource}</>
                          ) : (
                            <><Info className="w-3.5 h-3.5" /> {room.perk}</>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-10 rounded-[3rem] border-primary/20 space-y-10"
            >
              <div className="flex items-center gap-4 border-b border-primary/10 pb-6">
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                  <Shield className="w-6 h-6 text-primary drop-shadow-[0_0_5px_var(--primary-glow)]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary uppercase tracking-tighter">
                    {t.vault_stats || 'Campus Stats'}
                  </h2>
                  <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest leading-none mt-1">Management Console</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <div className="text-[9px] font-black text-primary/30 uppercase tracking-[0.4em] mb-2 pl-1">Active Infrastructure</div>
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-primary/10 group-hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 text-primary/60 font-bold uppercase text-xs">
                      <LayoutGrid className="w-4 h-4" />
                      {t.total_rooms || 'Facilities'}
                    </div>
                    <div className="text-primary font-black text-xl tracking-widest">
                      {unlockedRooms.length}<span className="text-xs text-primary/30 mx-1">/</span>{VAULT_ROOMS.length}
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="text-[9px] font-black text-primary/30 uppercase tracking-[0.4em] mb-2 pl-1">Biological Resources</div>
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-primary/10 group-hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3 text-primary/60 font-bold uppercase text-xs">
                      <Users className="w-4 h-4" />
                      {t.vault_population || 'Population'}
                    </div>
                    <div className="text-primary font-black text-xl tracking-widest flex items-center gap-2">
                       {vaultPopulation}
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="text-[9px] font-black text-primary/30 uppercase tracking-[0.4em] mb-2 pl-1">Financial Liquidity</div>
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border-primary/20 group-hover:border-primary/40 transition-all shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <div className="flex items-center gap-3 text-amber-500 font-bold uppercase text-xs">
                      <Coins className="w-4 h-4" />
                      {t.credits || 'Credits'}
                    </div>
                    <div className="text-amber-500 font-black text-xl tracking-widest uppercase">
                      {caps} <span className="text-[10px]">C</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-10 rounded-[3rem] border-primary/20"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <Zap className="w-6 h-6 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-amber-500 uppercase tracking-tighter">
                    {t.vault_perks || 'Facility Perks'}
                  </h2>
                  <p className="text-[10px] font-bold text-amber-500/30 uppercase tracking-widest mt-1">Active Buffs</p>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {activePerks.map((perk) => (
                    <motion.div
                      key={perk.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4 group hover:bg-amber-500/10 transition-all"
                    >
                      <div className="mt-1 p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/20 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-amber-500 text-xs font-black uppercase tracking-widest mb-1">
                          {t[perk.name.toLowerCase().replace(/\s+/g, '_')] || perk.name}
                        </div>
                        <div className="text-amber-500/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{perk.perk}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {activePerks.length === 0 && (
                  <div className="text-center py-12 px-4 glass-card border-dashed border-primary/10 rounded-[2rem]">
                    <div className="text-primary/20 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                      {t.no_active_perks || 'No facility buffs currently active.'}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
