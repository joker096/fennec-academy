import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { auth, signOut } from '../firebase';
import { User, Mail, Shield, Award, Star, Zap, LogOut, Settings, Globe, Heart, Coins, Flame, Layers, CheckCircle2, Volume2, VolumeX, Trophy, RefreshCw, ChevronRight, Clock, Download, Palette, Monitor, MapPin, AlignLeft, Sparkles } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/translations';
import { ACADEMIC_PERKS as FALLOUT_PERKS, LANGUAGES } from '../data/gameData';
import { audioService, SoundEffect } from '../services/audioService';
import Achievements from '../components/Achievements';
import { Link } from 'react-router-dom';
import Tooltip from '../components/Tooltip';
import CharacterCustomization from '../components/CharacterCustomization';
import AvatarWithFrame from '../components/AvatarWithFrame';
import APISettingsModal from '../components/APISettingsModal';

export default function Profile() {
  const navigate = useNavigate();
  const displayName = useStore(state => state.displayName);
  const email = useStore(state => state.email);
  const photoURL = useStore(state => state.photoURL);
  const xp = useStore(state => state.xp);
  const daysSurvived = useStore(state => state.daysSurvived);
  const credits = useStore(state => state.credits);
  const health = useStore(state => state.health);
  const caps = credits; // Keep for minimal changes
  const hp = health; // Keep for minimal changes
  const uiLang = useStore(state => state.uiLang);
  const special = useStore(state => state.special);
  const specialProgress = useStore(state => state.specialProgress);
  const completedLessons = useStore(state => state.completedLessons);
  const equippedPerks = useStore(state => state.equippedPerks);
  const isPremium = useStore(state => state.isPremium);
  const buyPremium = useStore(state => state.buyPremium);
  const defaultReminderType = useStore(state => state.defaultReminderType);
  const setDefaultReminderType = useStore(state => state.setDefaultReminderType);
  const avatarId = useStore(state => state.avatarId);
  const accessories = useStore(state => state.accessories);
  const bio = useStore(state => state.bio);
  const location = useStore(state => state.location);
  const downloadedLanguages = useStore(state => state.downloadedLanguages);
  const downloadLanguage = useStore(state => state.downloadLanguage);
  const targetLang = useStore(state => state.targetLang);
  const theme = useStore(state => state.theme);
  const setTheme = useStore(state => state.setTheme);
  
  const [soundEnabled, setSoundEnabled] = useState(audioService.isEnabled());
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isAPISettingsOpen, setIsAPISettingsOpen] = useState(false);
  const geminiApiKey = useStore(state => state.geminiApiKey);

  const toggleSound = () => {
    const newState = !soundEnabled;
    audioService.setEnabled(newState);
    setSoundEnabled(newState);
  };

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const syncProgress = useStore(state => state.syncProgress);
  const isOnline = useStore(state => state.isOnline);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!isOnline) {
      useStore.getState().addNotification(t.offline_sync_warning, 'warning');
      return;
    }
    setIsSyncing(true);
    await syncProgress();
    setIsSyncing(false);
  };

  const handleShare = async () => {
    const statsSummary = `
🎓 University Survivor Progress 🎓
Scholar: ${displayName || 'Anonymous'}
Level: ${currentLevel}
XP: ${xp}
Days Survived: ${daysSurvived}
SPECIAL Stats: S:${special.S} P:${special.P} E:${special.E} C:${special.C} I:${special.I} A:${special.A} L:${special.L}
Lessons Completed: ${completedLessons.length}
Join me at the Academy!
    `.trim();

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My University Progress',
          text: statsSummary,
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(statsSummary);
        useStore.getState().addNotification('Progress summary copied to clipboard!', 'success');
      }
      audioService.play(SoundEffect.SUCCESS);
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const currentLevel = Math.floor(xp / 100) + 1;
  const nextLevelXp = currentLevel * 100;
  const progress = (xp % 100);

  const stats = [
    { label: t.strength, value: special.S, progress: specialProgress.S, description: t.strength_desc, icon: <Award className="w-4 h-4 text-rose-500" />, color: 'bg-rose-500' },
    { label: t.perception, value: special.P, progress: specialProgress.P, description: t.perception_desc, icon: <Shield className="w-4 h-4 text-blue-500" />, color: 'bg-blue-500' },
    { label: t.endurance, value: special.E, progress: specialProgress.E, description: t.endurance_desc, icon: <Heart className="w-4 h-4 text-emerald-500" />, color: 'bg-emerald-500' },
    { label: t.charisma, value: special.C, progress: specialProgress.C, description: t.charisma_desc, icon: <Star className="w-4 h-4 text-amber-500" />, color: 'bg-amber-500' },
    { label: t.intelligence, value: special.I, progress: specialProgress.I, description: t.intelligence_desc, icon: <Award className="w-4 h-4 text-indigo-500" />, color: 'bg-indigo-500' },
    { label: t.agility, value: special.A, progress: specialProgress.A, description: t.agility_desc, icon: <Zap className="w-4 h-4 text-orange-500" />, color: 'bg-orange-500' },
    { label: t.luck, value: special.L, progress: specialProgress.L, description: t.luck_desc, icon: <Award className="w-4 h-4 text-purple-500" />, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8 pb-20 font-sans min-h-screen">
      {/* Header Profile Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-4 md:p-6 border border-border relative overflow-hidden shadow-md group"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="relative group cursor-pointer shrink-0" onClick={() => { audioService.play(SoundEffect.CLICK); setIsCustomizing(true); }}>
            <AvatarWithFrame size="md" />
            <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white px-1.5 py-0.5 rounded-md flex items-center justify-center font-black text-xs shadow-md border-2 border-background z-20">
              {currentLevel}
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{displayName || t.scholar_pioneer || 'Scholarly Pioneer'}</h1>
              <button 
                onClick={() => { audioService.play(SoundEffect.CLICK); setIsCustomizing(true); }}
                className="w-fit flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground/60 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-border mx-auto md:mx-0 shadow-sm"
              >
                <Settings className="w-3 h-3" />
                {t.customize_character}
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-foreground/40 font-bold text-[9px] uppercase tracking-widest">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg border border-border shadow-sm">
                <Mail className="w-3 h-3 opacity-50" />
                {email}
              </div>
              {location && (
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg border border-border shadow-sm">
                  <MapPin className="w-3 h-3 opacity-50 text-rose-500" />
                  {location}
                </div>
              )}
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg border border-border shadow-sm">
                <Globe className="w-3 h-3 opacity-50" />
                {uiLang.toUpperCase()}
              </div>
            </div>
            {bio && (
              <div className="mt-3 p-3 bg-muted/20 border border-border/50 rounded-xl max-w-lg mx-auto md:mx-0">
                <p className="text-[10px] text-foreground/70 font-medium italic leading-relaxed text-center md:text-left">
                  "{bio}"
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 justify-center">
            <button 
              onClick={() => { audioService.play(SoundEffect.CLICK); handleShare(); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-primary/90 transition-all border border-primary shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              {t.share_progress || 'Share'}
            </button>
            <button 
              onClick={() => { audioService.play(SoundEffect.CLICK); handleSync(); }}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all border shadow-sm ${
                isSyncing 
                  ? 'bg-muted opacity-50' 
                  : 'bg-card text-foreground/80 border-border hover:border-primary'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? t.syncing : 'Sync'}
            </button>
            <button 
              onClick={() => { audioService.play(SoundEffect.CLICK); signOut(auth); }}
              className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-rose-100 transition-all dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/30 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.logout}
            </button>
          </div>
        </div>

        <div className="mt-4 bg-muted/30 p-3 rounded-xl border border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.level_progress}</span>
            <span className="text-[9px] font-black text-primary uppercase">{progress}%</span>
          </div>
          <div className="h-1.5 bg-background rounded-full overflow-hidden shadow-inner">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Faction Recommendation if not joined */}
        {useStore.getState().factionId === null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-3 bg-slate-900 text-white rounded-2xl p-8 border-2 border-primary/20 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30 shadow-lg">
                  <Shield className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Faculty Assignment Pending</h2>
                  <p className="text-slate-400 font-mono font-bold text-[10px] uppercase tracking-widest max-w-md">No faculty allegiance detected. Join a league to unlock exclusive rewards and compete against fellow scholars.</p>
                </div>
              </div>
              <Link 
                to="/factions" 
                onClick={() => audioService.play(SoundEffect.CLICK)}
                className="px-10 py-5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 border-2 border-white/10"
              >
                Join League
              </Link>
            </div>
          </motion.div>
        )}

        {/* Stats Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-card rounded-2xl p-4 md:p-6 border border-border shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-sm border border-primary/20">
                  <Award className="w-4 h-4" />
                </div>
                {t.special_stats}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2 relative z-10">
              {stats.map((stat, i) => (
                <div key={i} className="bg-muted/20 p-3 border border-border hover:bg-card transition-all group rounded-xl">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-card border border-border shadow-sm group-hover:scale-105 transition-transform`}>
                        {stat.icon}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-[11px] font-black text-foreground uppercase tracking-tight">{stat.label}</h3>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{stat.description.slice(0, 50)}...</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                       <span className="text-lg font-black text-foreground tracking-tighter">{stat.value}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-slate-400">
                      <span>BOOST_PROBABILITY</span>
                      <span className="text-primary">{stat.progress}%</span>
                    </div>
                    <div className="h-1 bg-background rounded-full overflow-hidden shadow-inner">
                      <motion.div animate={{ width: `${stat.progress}%` }} className="h-full bg-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-3 tracking-tight relative z-10 uppercase">
                 <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 shadow-sm border border-amber-500/20">
                   <Star className="w-5 h-5" />
                 </div>
                {t.equipped_perks}
              </h2>
              <Link to="/perks" onClick={() => audioService.play(SoundEffect.CLICK)} className="text-[9px] font-bold text-primary hover:text-primary transition-all flex items-center gap-2 uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                {t.manage_perks}
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {equippedPerks.length > 0 ? (
                equippedPerks.map(perkId => {
                  const perk = FALLOUT_PERKS.find(p => p.id === perkId);
                  if (!perk) return null;
                  const translation = perk.translations[uiLang] || perk.translations.en;
                  return (
                    <Tooltip key={perkId} content={`${t[perk.stat.toLowerCase()] || perk.stat}: ${translation.effect}`}>
                      <div className="flex flex-col items-center bg-muted/30 p-3 rounded-2xl border border-border transition-all hover:border-primary/40 group hover:shadow-md text-center">
                        <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                          {perk.imageUrl ? (
                            <img 
                              referrerPolicy="no-referrer"
                              src={perk.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <Star className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                        <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1 leading-tight truncate w-full">
                          {translation.name}
                        </span>
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest line-clamp-1 leading-none opacity-60">
                          {translation.effect}
                        </p>
                      </div>
                    </Tooltip>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-slate-300 dark:text-slate-700 font-bold uppercase tracking-widest italic bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  {t.no_perks_equipped}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl relative overflow-hidden group">
            <h2 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3 tracking-tight relative z-10 uppercase">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm border border-primary/20">
                <Trophy className="w-5 h-5" />
              </div>
              {t.achievements_progress}
            </h2>
            <div className="relative z-10">
              <Achievements />
            </div>
          </div>
        </motion.div>

        {/* Sidebar Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm relative overflow-hidden">
            <h2 className="text-sm font-black text-foreground mb-4 uppercase tracking-tight flex items-center gap-2">
               <div className="p-1.5 bg-muted rounded-lg text-foreground/60 border border-border">
                 <Settings className="w-3.5 h-3.5" />
               </div>
              {t.quick_stats || 'Vitals'}
            </h2>
            <div className="grid grid-cols-1 gap-2 relative z-10">
              <div className="flex items-center justify-between p-3 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30 group">
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                  <Heart className="w-4 h-4" fill="currentColor" />
                  <span className="font-black text-[8px] uppercase tracking-widest leading-none">{t.health}</span>
                </div>
                <span className="text-xl font-black text-rose-600 tracking-tighter leading-none">{hp}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                  <Coins className="w-4 h-4" />
                  <span className="font-black text-[8px] uppercase tracking-widest leading-none">{t.currency}</span>
                </div>
                <span className="text-xl font-black text-amber-600 tracking-tighter leading-none">{caps}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                  <Flame className="w-4 h-4" fill="currentColor" />
                  <span className="font-black text-[8px] uppercase tracking-widest leading-none">{t.streak}</span>
                </div>
                <span className="text-xl font-black text-orange-600 tracking-tighter leading-none">{daysSurvived}</span>
              </div>
              
              <button 
                onClick={() => { audioService.play(SoundEffect.CLICK); toggleSound(); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  soundEnabled 
                    ? 'bg-primary/5 border-primary/20 text-primary uppercase' 
                    : 'bg-muted/50 border-border text-slate-400 grayscale'
                }`}
              >
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="font-black text-[8px] uppercase tracking-widest leading-none">Audio</span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 ${soundEnabled ? 'bg-primary' : 'bg-slate-300'}`}>
                  <motion.div animate={{ x: soundEnabled ? 16 : 0 }} className="w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </button>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <h2 className="text-sm font-black text-foreground mb-4 uppercase tracking-tight flex items-center gap-2">
               <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                 <RefreshCw className="w-3.5 h-3.5" />
               </div>
              {t.cloud_services || 'Cloud'}
            </h2>
            <div className="space-y-2">
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted border border-border rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className={`w-4 h-4 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{isSyncing ? 'Syncing...' : 'Force Sync'}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </button>

              <div className="p-3 bg-muted/20 border border-border rounded-xl">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.auto_sync_status || 'LIVE_ARCHIVE: ACTIVE'}</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <h2 className="text-sm font-black text-foreground mb-4 uppercase tracking-tight flex items-center gap-2">
               <div className="p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                 <Palette className="w-3.5 h-3.5" />
               </div>
              {t.ui_theme || 'Skins'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {['classic', 'amber', 'modern'].map(t_id => (
                <button
                  key={t_id}
                  onClick={() => setTheme(t_id as any)}
                  className={`flex-1 p-2 rounded-lg border-2 transition-all text-[8px] font-black uppercase tracking-widest ${
                    theme === t_id 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-transparent bg-muted/50 text-slate-400'
                  }`}
                >
                  {t_id}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <h2 className="text-sm font-black text-foreground mb-4 uppercase tracking-tight flex items-center gap-2">
               <div className="p-1.5 bg-muted rounded-lg text-foreground/60 border border-border">
                 <Clock className="w-3.5 h-3.5" />
               </div>
              {t.reminder_settings}
            </h2>
            <div className="space-y-3">
              <select
                value={defaultReminderType}
                onChange={(e) => setDefaultReminderType(e.target.value as any)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground appearance-none cursor-pointer"
              >
                <option value="none">{t.reminder_none}</option>
                <option value="at_due_date">{t.reminder_at_due_date}</option>
                <option value="1_day_before">{t.reminder_1_day_before}</option>
                <option value="1_hour_before">{t.reminder_1_hour_before}</option>
              </select>
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest group-hover:opacity-100 opacity-60">System alerts activated.</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <h2 className="text-sm font-black text-foreground mb-4 uppercase tracking-tight flex items-center gap-2">
               <div className="p-1.5 bg-gradient-to-br from-primary to-purple-600 rounded-lg text-white">
                 <Sparkles className="w-3.5 h-3.5" />
               </div>
              AI Settings
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setIsAPISettingsOpen(true)}
                className={`w-full py-3 px-4 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all border shadow-sm flex items-center justify-center gap-2 ${
                  geminiApiKey
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {geminiApiKey ? 'API Key Configured' : 'Configure AI (API Key Required)'}
              </button>
              <p className="text-[8px] text-slate-500 dark:text-slate-400 text-center">
                {geminiApiKey
                  ? 'AI features are active with your personal API key'
                  : 'Add your Gemini API key to enable AI-powered features'
                }
              </p>
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-sm border transition-all ${isPremium ? 'bg-primary text-white border-primary/20' : 'bg-slate-900 text-white border-slate-800'}`}>
            <h3 className="text-lg font-black mb-1 uppercase leading-none">{isPremium ? 'Premium Active' : 'Go Premium'}</h3>
            <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest leading-relaxed mb-4">Neural features unlocked.</p>
            {!isPremium && (
              <button 
                onClick={buyPremium}
                className="w-full bg-white text-slate-900 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all"
              >
                {t.upgrade_now}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <CharacterCustomization 
        isOpen={isCustomizing} 
        onClose={() => setIsCustomizing(false)} 
      />

      <APISettingsModal
        isOpen={isAPISettingsOpen}
        onClose={() => setIsAPISettingsOpen(false)}
      />
    </div>
  );
}
