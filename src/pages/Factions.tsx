import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { useT } from '../lib/i18n';
import { FACTIONS } from '../data/factions';
import { Shield, ShieldAlert, Users, Train, Beaker, Flag, Trophy, Award, Star, Info, ChevronRight, CheckCircle2, Activity, Zap, Target, Flame, Crown, Timer, BarChart3, Database, Cpu, Wind, Heart, Globe } from 'lucide-react';

import { COSMETICS } from '../data/cosmetics';
import AvatarWithFrame from '../components/AvatarWithFrame';

const LEAGUE_TIERS = [
  { id: 'bronze', name: 'Initiate League', color: '#cd7f32', minXp: 0, rewardId: 'default_frame' },
  { id: 'silver', name: 'Knight League', color: '#c0c0c0', minXp: 1000, rewardId: 't45_power_armor_frame' },
  { id: 'gold', name: 'Paladin League', color: '#ffd700', minXp: 5000, rewardId: 't51_power_armor_frame' },
  { id: 'platinum', name: 'Sentinel League', color: '#e5e4e2', minXp: 15000, rewardId: 'x01_power_armor_frame' },
  { id: 'diamond', name: 'Legendary Overseer', color: '#b9f2ff', minXp: 50000, rewardId: 'league_win_badge' },
];

const Factions: React.FC = () => {
  const t = useT();
  const factionId = useStore(state => state.factionId);
  const factionXp = useStore(state => state.factionXp);
  const weeklyFactionXp = useStore(state => state.weeklyFactionXp);
  const factionStandings = useStore(state => state.factionStandings);
  const factionWinnerId = useStore(state => state.factionWinnerId);
  const checkWeeklyFactionWinner = useStore(state => state.checkWeeklyFactionWinner);
  const updateFactionStandings = useStore(state => state.updateFactionStandings);
  const unlockedCosmetics = useStore(state => state.unlockedCosmetics);
  const equippedFrame = useStore(state => state.equippedFrame);
  const claimLeagueReward = useStore(state => state.claimLeagueReward);
  const equipFrame = useStore(state => state.equipFrame);
  const joinFaction = useStore(state => state.joinFaction);
  const uiLang = useStore(state => state.uiLang);
  const [selectedFaction, setSelectedFaction] = useState(FACTIONS[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rewards'>('dashboard');

  const currentFaction = useMemo(() => 
    FACTIONS.find(f => f.id === factionId), 
  [factionId]);

  const currentLeague = useMemo(() => {
    const sorted = [...LEAGUE_TIERS].reverse();
    return sorted.find(tier => factionXp >= tier.minXp) || LEAGUE_TIERS[0];
  }, [factionXp]);

  const nextLeague = useMemo(() => {
    const currentIndex = LEAGUE_TIERS.findIndex(t => t.id === currentLeague.id);
    return LEAGUE_TIERS[currentIndex + 1] || null;
  }, [currentLeague]);

  const progressToNextLeague = useMemo(() => {
    if (!nextLeague) return 100;
    const currentTierMin = currentLeague.minXp;
    const nextTierMin = nextLeague.minXp;
    return ((factionXp - currentTierMin) / (nextTierMin - currentTierMin)) * 100;
  }, [factionXp, currentLeague, nextLeague]);

  const getFactionIcon = (iconName: string, className?: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Shield': return <Shield className={className} strokeWidth={2.5} />;
      case 'Beaker': return <Beaker className={className} />;
      case 'TrendingUp': return <BarChart3 className={className} />;
      case 'Flag': return <Flag className={className} />;
      case 'Train': return <Train className={className} />;
      default: return <ShieldAlert className={className} />;
    }
  };

  const getFactionBonus = (id: string) => {
    const faction = FACTIONS.find(f => f.id === id);
    if (!faction) return { label: 'General Survivor', effect: 'No special bonuses', icon: <Star className="w-4 h-4" /> };
    
    let icon = <Star className="w-4 h-4" />;
    if (id === 'bos') icon = <Shield className="w-4 h-4" />;
    if (id === 'railroad') icon = <Train className="w-4 h-4" />;
    if (id === 'minutemen') icon = <Users className="w-4 h-4" />;
    if (id === 'institute') icon = <Cpu className="w-4 h-4" />;
    if (id === 'enclave') icon = <Flag className="w-4 h-4" />;

    return { 
      label: faction.bonusLabel, 
      effect: faction.bonusEffect, 
      icon 
    };
  };

  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  React.useEffect(() => {
    checkWeeklyFactionWinner();
    updateFactionStandings();
  }, [checkWeeklyFactionWinner, updateFactionStandings]);

  React.useEffect(() => {
    async function fetchFactionLeaderboard() {
      if (!factionId) return;
      setIsLeaderboardLoading(true);
      try {
        const { db } = await import('../firebase');
        const { query, collection, where, orderBy, limit, getDocs } = await import('firebase/firestore');
        const q = query(
          collection(db, 'leaderboard'),
          where('factionId', '==', factionId),
          orderBy('xp', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const users: any[] = [];
        querySnapshot.forEach((doc) => {
          users.push({ uid: doc.id, ...doc.data() });
        });
        setLeaderboardUsers(users);
      } catch (err) {
        console.error('Failed to fetch faction leaderboard:', err);
      } finally {
        setIsLeaderboardLoading(false);
      }
    }

    if (factionId && activeTab === 'dashboard') {
      fetchFactionLeaderboard();
    }
  }, [factionId, activeTab]);

  if (!factionId) {
    return (
      <div className="space-y-8 pb-20 font-sans text-slate-900 dark:text-slate-100 relative">
        {/* Header Section */}
        <div className="relative p-10 rounded-xl bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-primary/2 opacity-40 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-primary text-white rounded-lg flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.3)] brutal-border border-white dark:border-slate-100">
              <Crown className="w-10 h-10" />
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {t.factions_title || 'Faculty Leagues'}
              </h1>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <p className="text-slate-500 font-mono font-bold text-[10px] uppercase tracking-[0.3em] leading-relaxed">
                  {t.factions_desc || 'Choose your faculty. Excel on campus. Rule the leagues.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
          {/* Faction Selector Sidebar */}
          <div className="xl:col-span-4 space-y-6">
             <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.available_factions || 'Available Factions'}</span>
                <span className="font-mono font-bold text-[10px] text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20">FAC_COUNT: {FACTIONS.length}</span>
             </div>
            <div className="space-y-4">
              {FACTIONS.map((faction) => (
                <button
                  key={faction.id}
                  onClick={() => setSelectedFaction(faction)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-5 group relative overflow-hidden ${
                    selectedFaction.id === faction.id
                      ? 'bg-primary/5 border-primary shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.1)]'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div 
                    className="absolute inset-0 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundColor: faction.color }}
                  ></div>
                  <div className={`p-4 rounded-lg transition-all duration-300 border shadow-sm ${
                    selectedFaction.id === faction.id
                      ? 'bg-primary text-white border-primary scale-105 shadow-[2px_2px_0px_0px_white]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20'
                  }`}>
                    {getFactionIcon(faction.icon, 'w-6 h-6')}
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className={`text-lg font-display font-black transition-colors uppercase tracking-tight ${selectedFaction.id === faction.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                      {faction.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" style={selectedFaction.id === faction.id ? { backgroundColor: 'var(--primary)' } : {}} />
                      <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                          {faction.id.toUpperCase()} // {selectedFaction.id === faction.id ? 'READY' : 'STANDBY'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-all duration-300 ${selectedFaction.id === faction.id ? 'translate-x-0 opacity-100 text-primary' : '-translate-x-4 opacity-0'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Faction Profile / Contract */}
          <div className="xl:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFaction.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col h-full"
              >
                {/* Visual Banner */}
                <div 
                  className="h-48 relative overflow-hidden p-10 flex items-end justify-between border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                >
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-grid-slate-900/[0.05] dark:bg-grid-white/[0.05]"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                       <span className="px-3 py-1 bg-primary text-white rounded text-[9px] font-mono font-bold uppercase tracking-widest shadow-sm">IND_PROT_v4.2</span>
                    </div>
                    <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                      {selectedFaction.name}
                    </h2>
                  </div>
                  <div 
                    className="w-40 h-40 opacity-10 rotate-12 pointer-events-none absolute -right-4 -bottom-4 translate-y-1/4"
                    style={{ color: selectedFaction.color }}
                  >
                    {getFactionIcon(selectedFaction.icon, 'w-full h-full')}
                  </div>
                </div>

                <div className="p-10 space-y-10 flex-1 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                          <Database className="w-3 h-3 text-slate-400" />
                          <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">DIRECTIVE_FILE_01</label>
                        </div>
                        <div className="text-lg text-slate-700 dark:text-slate-200 leading-tight font-display font-bold uppercase tracking-tight bg-slate-50 dark:bg-slate-900 p-8 rounded-lg border-2 border-slate-200 dark:border-slate-800 border-l-primary border-l-4">
                          "{selectedFaction.description[uiLang] || selectedFaction.description.en}"
                        </div>
                      </div>
                      
                      <div className="p-6 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 space-y-4">
                         <div className="flex items-center gap-3 text-primary">
                            {getFactionBonus(selectedFaction.id).icon}
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest leading-none">ALLEGIANCE_MOD</span>
                         </div>
                         <div>
                           <div className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">
                              {getFactionBonus(selectedFaction.id).label}
                           </div>
                           <p className="text-[11px] font-mono font-bold text-primary uppercase tracking-widest mt-2">{getFactionBonus(selectedFaction.id).effect}</p>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 ml-1">
                            <Target className="w-3 h-3 text-slate-400" />
                            <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">LEAGUE_MANIFEST_v2</label>
                          </div>
                          <div className="space-y-3">
                            {[
                              { label: 'Weekly Merit Points', val: '+50 XP / Match', icon: <Target className="w-4 h-4" /> },
                              { label: 'Faction Gear Cache', val: 'Level 5+ Required', icon: <Database className="w-4 h-4" /> },
                              { label: 'Territory Presence', val: 'Global Standing', icon: <Globe className="w-4 h-4" /> }
                            ].map((reward, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-primary/40 transition-all cursor-default group/reward">
                                 <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover/reward:bg-primary group-hover/reward:text-white group-hover/reward:border-primary transition-all">
                                    {reward.icon}
                                 </div>
                                 <div>
                                    <div className="text-xs font-display font-bold text-slate-900 dark:text-white uppercase tracking-tight">{reward.label}</div>
                                    <div className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{reward.val}</div>
                                 </div>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>

                  <button
                    onClick={() => joinFaction(selectedFaction.id)}
                    className="w-full bg-primary text-white py-6 rounded-lg font-display font-black text-xl uppercase tracking-widest hover:bg-primary/90 transition-all shadow-[4px_4px_0px_0px_white] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 active:translate-y-1 group/btn border-2 border-white dark:border-slate-800"
                  >
                    <CheckCircle2 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                    <span>{t.join_faction_btn || 'CONFIRM ENLISTMENT'}</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 font-sans text-slate-900 dark:text-slate-100 relative">
      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border-2 border-slate-200 dark:border-slate-800 relative z-10 w-fit">
         <button 
           onClick={() => setActiveTab('dashboard')}
           className={`px-8 py-3 rounded font-mono font-bold uppercase tracking-widest text-[10px] transition-all relative ${
             activeTab === 'dashboard' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
           }`}
         >
           {t.dashboard || 'Dashboard'}
         </button>
         <button 
           onClick={() => setActiveTab('rewards')}
           className={`px-8 py-3 rounded font-mono font-bold uppercase tracking-widest text-[10px] transition-all relative ${
             activeTab === 'rewards' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
           }`}
         >
           {t.rewards || 'Rewards'}
         </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10"
          >
         {/* Profile Card */}
         <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden relative">
               <div 
                className="h-24 opacity-[0.05] absolute top-0 left-0 w-full pointer-events-none"
                style={{ background: `linear-gradient(to bottom, ${currentFaction?.color}, transparent)` }}
               ></div>
               
               <div className="p-8 relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative">
                    <div 
                      className="w-24 h-24 rounded-lg flex items-center justify-center text-white shadow-[4px_4px_0px_0px_white] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] border-4 border-slate-200 dark:border-slate-800 -rotate-2 overflow-hidden"
                      style={{ backgroundColor: currentFaction?.color || 'var(--primary)' }}
                    >
                      {getFactionIcon(currentFaction?.icon || '', 'w-12 h-12')}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white border-2 border-white dark:border-slate-800 px-3 py-1 rounded font-mono font-bold text-[9px] uppercase tracking-widest shadow-lg">
                      {currentFaction?.id.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                       <span className="px-3 py-1 bg-primary text-white rounded text-[8px] font-mono font-bold uppercase tracking-widest shadow-sm">
                          {currentLeague.name}
                       </span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                      {useStore.getState().displayName || 'Scholar'}
                    </h1>
                    <div className="flex items-center gap-6 justify-center md:justify-start font-mono font-bold text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                       <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-primary" />
                          <span>{t.faction_rank || 'RANK'}: #1,242</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-slate-900 dark:text-white">{factionXp} FXP</span>
                       </div>
                    </div>
                  </div>

                  <div className="w-full md:w-64 space-y-3">
                     <div className="flex justify-between items-end">
                        <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.next_rank || 'UPGRADE'}: {nextLeague?.name || 'MAX'}</span>
                        <span className="text-[10px] font-mono font-bold text-primary">{Math.round(progressToNextLeague)}%</span>
                     </div>
                     <div className="h-3 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressToNextLeague}%` }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: currentLeague.color }}
                        />
                     </div>
                     <div className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 text-right uppercase tracking-widest">{factionXp} / {nextLeague?.minXp || factionXp} XP_TARGET</div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-8 text-slate-900 dark:text-white relative overflow-hidden group border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 -mr-4 -mt-4 rotate-12 transition-transform group-hover:scale-110 pointer-events-none text-primary">
                    <Trophy className="w-full h-full" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div>
                      <h3 className="text-xl font-display font-black uppercase tracking-tight leading-none">{t.weekly_mission || 'Weekly Objective'}</h3>
                      <p className="text-slate-500 dark:text-slate-500 font-mono font-bold text-[9px] mt-1.5 uppercase tracking-widest">{t.weekly_mission_desc || 'Deploy your linguistic skills'}</p>
                    </div>
                    <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-inner">
                       <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-6 leading-relaxed">{t.mission_current || 'Complete 10 Perfect Lessons to earn +250 FXP'}</p>
                       <div className="space-y-3">
                        <div className="flex justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400">
                          <span>{t.progress || 'PROG_LOG'}</span>
                          <span>4 / 10 // UNT</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                          <motion.div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
                        </div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-950 rounded-xl p-8 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{t.active_bonus || 'Active Bonus'}</h3>
                     <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center shadow-sm">
                        <Zap className="w-5 h-5" />
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-start gap-4">
                        <div className="text-primary mt-1 p-2 bg-white dark:bg-slate-950 rounded border-2 border-slate-200 dark:border-slate-800 shadow-sm shrink-0">{getFactionBonus(factionId).icon}</div>
                        <div>
                           <div className="text-xs font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">{getFactionBonus(factionId).label}</div>
                           <div className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">{getFactionBonus(factionId).effect}</div>
                        </div>
                     </div>
                     <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-widest italic border-l-2 border-primary/30 pl-4 bg-slate-50 dark:bg-slate-900/50 py-3 rounded-r">
                        "{currentFaction?.motto[uiLang] || currentFaction?.motto.en}"
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-10">
            {/* Weekly War Standings */}
            <div className="bg-slate-950 rounded-xl p-8 text-white relative overflow-hidden shadow-2xl border-2 border-slate-800">
               <div className="absolute inset-0 bg-primary/10 opacity-10 pointer-events-none"></div>
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[60px] rounded-full"></div>
               
               <h3 className="text-xl font-display font-black uppercase tracking-tight mb-8 flex items-center gap-3 relative z-10">
                  <div className="p-1.5 bg-primary/20 rounded border border-primary/30 text-primary">
                    <Flame className="w-5 h-5" />
                  </div>
                  {t.weekly_war || 'Weekly War Standings'}
               </h3>

               <div className="space-y-6 relative z-10">
                 {factionStandings.length > 0 ? factionStandings.map((standing, i) => {
                    const faction = FACTIONS.find(f => f.id === standing.factionId);
                    if (!faction) return null;
                    const isWinner = factionWinnerId === faction.id;
                    const maxXP = factionStandings[0]?.totalXp || 1;
                    const percentage = (standing.totalXp / maxXP) * 100;

                    return (
                      <div key={faction.id} className="space-y-3">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                                 i === 0 ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]' : 'bg-slate-800 text-slate-400'
                               }`}>
                                 {i + 1}
                               </div>
                               {getFactionIcon(faction.icon, `w-4 h-4 ${i === 0 ? 'text-amber-400' : 'text-slate-500'}`)}
                               <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${faction.id === factionId ? 'text-primary' : 'text-slate-300'}`}>
                                 {faction.name}
                               </span>
                            </div>
                            <div className="flex items-center gap-2">
                               {isWinner && <Crown className="w-3.5 h-3.5 text-amber-500" strokeWidth={3} />}
                               <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">{(standing.totalXp / 1000).toFixed(1)}K</span>
                            </div>
                         </div>
                         <div className="h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full rounded-full relative overflow-hidden"
                            style={{ backgroundColor: faction.color }}
                          >
                             <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10"></div>
                          </motion.div>
                         </div>
                      </div>
                    );
                 }) : (
                   <div className="py-8 text-center space-y-3 opacity-50">
                      <Timer className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">CALCULATING_WAR_DATA...</p>
                   </div>
                 )}
               </div>

               <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                     <Timer className="w-4 h-4 text-slate-500" />
                     <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">RESET: 2D 14H</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest animate-pulse">WINNER: {factionWinnerId?.toUpperCase() || 'CALC'}</span>
                  </div>
               </div>
            </div>

            {/* Faction Perks */}
            <div className="bg-white dark:bg-slate-950 rounded-xl p-8 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                   <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded border-2 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                    <Target className="w-5 h-5" />
                   </div>
                   {t.faction_perks || 'League Tiers'}
                </h3>
                <div className="space-y-3">
                   {LEAGUE_TIERS.map((tier) => (
                      <div 
                        key={tier.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all group ${
                          currentLeague.id === tier.id 
                            ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                         <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center border-2 shadow-sm transition-all group-hover:scale-105 shrink-0"
                          style={{ borderColor: tier.color, backgroundColor: currentLeague.id === tier.id ? 'white' : `rgba(255,255,255,0.05)`, opacity: currentLeague.id === tier.id ? 1 : 0.4 }}
                         >
                            <Trophy className="w-5 h-5" style={{ color: tier.color }} />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className={`text-[10px] font-mono font-bold uppercase tracking-tight truncate ${currentLeague.id === tier.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{tier.name}</div>
                            <div className="text-[8px] font-mono font-bold opacity-60 uppercase tracking-widest mt-1">{tier.minXp} XP_VAL</div>
                         </div>
                         {tier.minXp <= factionXp && <CheckCircle2 className={`w-4 h-4 ${currentLeague.id === tier.id ? 'text-primary' : 'text-slate-300 dark:text-slate-700'}`} />}
                      </div>
                   ))}
                </div>
            </div>
         </div>
      </motion.div>
    ) : (
      <motion.div 
        key="rewards"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-12 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {COSMETICS.map((cosmetic) => {
            const isUnlocked = unlockedCosmetics.includes(cosmetic.id);
            const isEquipped = equippedFrame === cosmetic.id;
            
            const requiredTier = LEAGUE_TIERS.find(tier => tier.rewardId === cosmetic.id);
            const canUnlock = requiredTier && factionXp >= requiredTier.minXp;

            return (
              <div key={cosmetic.id} className="bg-white dark:bg-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col group hover:border-primary transition-all">
                 <div className="h-48 relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-primary/5 opacity-5 pointer-events-none"></div>
                    {/* Frame Preview container */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <img 
                          referrerPolicy="no-referrer"
                          src={cosmetic.imageUrl} 
                          alt={cosmetic.name} 
                          className="w-full h-full relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl" 
                        />
                        <div className="absolute inset-0 border-2 border-primary/10 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="absolute top-4 right-4 outline outline-2 outline-white dark:outline-slate-800 outline-offset-0">
                       <span className={`px-2 py-1 text-[8px] font-mono font-bold uppercase tracking-[0.2em] shadow-sm ${
                         cosmetic.rarity === 'common' ? 'bg-slate-500 text-white' :
                         cosmetic.rarity === 'rare' ? 'bg-blue-600 text-white' :
                         cosmetic.rarity === 'epic' ? 'bg-purple-600 text-white' :
                         'bg-amber-500 text-black'
                       }`}>
                         {cosmetic.rarity}
                       </span>
                    </div>
                 </div>
                 <div className="p-6 flex-1 flex flex-col justify-between space-y-6 bg-white dark:bg-slate-950">
                    <div className="space-y-2">
                      <h3 className="text-lg font-display font-black text-slate-900 dark:text-white uppercase tracking-tight truncate leading-none">{cosmetic.name}</h3>
                      <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed line-clamp-2">
                        {cosmetic.description[uiLang] || cosmetic.description.en}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                       {isUnlocked ? (
                         <button
                           onClick={() => equipFrame(cosmetic.id)}
                           disabled={isEquipped}
                           className={`w-full py-3 rounded font-mono font-bold text-[9px] uppercase tracking-[0.2em] transition-all border-2 ${
                             isEquipped 
                               ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 cursor-default' 
                               : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'
                           }`}
                         >
                           {isEquipped ? 'STATUS_EQUIPPED' : 'EXEC_EQUIP'}
                         </button>
                       ) : (
                         <button
                           onClick={() => claimLeagueReward(cosmetic.id)}
                           disabled={!canUnlock}
                           className={`w-full py-3 rounded font-mono font-bold text-[9px] uppercase tracking-[0.2em] transition-all border-2 ${
                             canUnlock
                               ? 'bg-primary text-white border-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                               : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 border-slate-200 dark:border-slate-800 cursor-not-allowed border-dashed'
                           }`}
                         >
                           {canUnlock ? 'EXEC_CLAIM' : 'LOCKED_RESRV'}
                         </button>
                       )}
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  <div className="bg-white dark:bg-slate-950 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden relative z-10">
        <div className="p-8 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50 dark:bg-slate-900">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
               <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t.faction_leaderboard || 'Faculty Leaderboard'}</h2>
               <div className="bg-primary text-white text-[8px] font-mono font-bold px-3 py-1 rounded uppercase tracking-[0.2em] shadow-sm">{t.top_contributors || 'RANK_INDEX'}</div>
            </div>
            <p className="text-slate-500 dark:text-slate-500 font-mono font-bold text-[9px] uppercase tracking-widest leading-relaxed">{t.faction_leaderboard_desc || 'The top scholars in your faculty.'}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded border-2 border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm">
                <button className="px-5 py-2 rounded bg-white dark:bg-slate-700 text-primary font-mono font-bold text-[9px] uppercase tracking-widest shadow-sm border border-slate-200 dark:border-slate-600">{t.this_week || 'WEEK'}</button>
                <button className="px-5 py-2 rounded text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 font-mono font-bold text-[9px] uppercase tracking-widest transition-all">{t.league_global || 'MONTH'}</button>
             </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <th className="px-8 py-4">{t.league_rank || 'RANK'}</th>
                  <th className="px-8 py-4">{t.league_survivor || 'SCHOLAR'}</th>
                  <th className="px-8 py-4 text-center">{t.league_tier || 'LEAGUE_STATUS'}</th>
                  <th className="px-8 py-4 text-right">{t.league_contribution || 'MERIT_VALUE'}</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {isLeaderboardLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-lg">
                        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded" />
                      </td>
                    </tr>
                  ))
                ) : leaderboardUsers.length > 0 ? (
                  leaderboardUsers.map((user, idx) => (
                    <tr key={user.uid} className="group cursor-default">
                      <td className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-r-0 border-slate-200 dark:border-slate-800 rounded-l-lg group-hover:bg-primary/5 transition-all">
                        <div className={`w-12 h-12 rounded flex items-center justify-center font-display font-black text-2xl transition-all group-hover:scale-110 border-2 ${
                          idx === 0 ? 'bg-amber-400 text-black border-amber-400 shadow-[2px_2px_0px_0px_black]' :
                          idx === 1 ? 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 shadow-[2px_2px_0px_0px_slate-400]' :
                          idx === 2 ? 'bg-orange-400 text-black border-orange-400 shadow-[2px_2px_0px_0px_black]' :
                          'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800 group-hover:text-primary group-hover:border-primary'
                        }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-x-0 border-slate-200 dark:border-slate-800 group-hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded bg-white dark:bg-slate-800 p-1 border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                              <div className="w-full h-full rounded bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                 <AvatarWithFrame
                                   avatarId={user.avatarId}
                                   photoURL={user.photoURL}
                                   uid={user.uid}
                                   frameId={user.equippedFrame}
                                   size="sm"
                                   accessories={user.accessories}
                                 />
                              </div>
                          </div>
                          <div>
                            <p className="text-lg font-display font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">{user.displayName || 'Scholar'}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                               <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">SYNC_ACTIVE // {user.xp} FXP</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-x-0 border-slate-200 dark:border-slate-800 group-hover:bg-primary/5 transition-all">
                         <div className="flex justify-center">
                           <div className="px-4 py-2 rounded bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm group-hover:border-primary/40 transition-all">
                              <Trophy className="w-4 h-4 text-primary" />
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-primary">
                                 {user.leagueTier?.toUpperCase() || 'BRONZE'}
                              </span>
                           </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-l-0 border-slate-200 dark:border-slate-800 rounded-r-lg group-hover:bg-primary/5 transition-all text-right">
                         <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="text-xl font-display font-black text-slate-900 dark:text-white leading-none">+{user.factionXp || 0}</div>
                            <div className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">FXP</div>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-mono font-bold uppercase tracking-widest">
                      No active scholars in this faction registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Factions;
