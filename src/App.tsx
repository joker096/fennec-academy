import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStore } from './store/useStore';
import { Home, BookOpen, MapPin, MessageSquare, Layers, Shield, Globe, Activity, Heart, Sun, Moon, LogOut, Menu, ArrowUp, Zap, Star, Coins, Flame, Award, Settings, User, ChevronDown, ChevronRight, WifiOff, LogIn, Trophy, Terminal, AlertCircle, ShieldAlert, Mic, CloudRain, Wind, Cloud, Calendar, Utensils, Droplets, Syringe, ShieldCheck, Cpu, Video, Sparkles, Monitor, Palette, RefreshCcw, CloudOff, Cloud as CloudIcon, Download, CheckCircle2, HelpCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { db } from './firebase';
import { handleAuthState, subscribeToAuthChanges, signOut, signInWithEmail, signUpWithEmail, resetPassword } from './lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LANGUAGES, WORDS_BY_LANG } from './data/gameData';
import { UI_TRANSLATIONS } from './data/translations';
import { ErrorBoundary } from './components/ErrorBoundary';
import MapSidebar from './components/MapSidebar';
import AvatarWithFrame from './components/AvatarWithFrame';
import NavLink from './components/NavLink';
import { AVATARS, getAvatarUrl } from './data/avatars';
import { useT } from './lib/i18n';
import { hasApiKey } from './services/geminiService';
import Notifications from './components/Notifications';
import HelpModal from './components/HelpModal';
import Tooltip from './components/Tooltip';
import CardOfTheDay from './components/CardOfTheDay';
import PwaPrompt from './components/PwaPrompt';
import ScriptInjector from './components/ScriptInjector';
import WeatherEffects from './components/WeatherEffects';
import WeatherBackground from './components/WeatherBackground';
import { PremiumGuard } from './components/PremiumGuard';
import { CognitiveStatus } from './components/CognitiveStatus';

import Character from './pages/Character';
// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const Lesson = React.lazy(() => import('./pages/Lesson'));
const AIChat = React.lazy(() => import('./pages/AIChat'));
const Flashcards = React.lazy(() => import('./pages/Flashcards'));
const MatchGame = React.lazy(() => import('./pages/MatchGame'));
const Conversation = React.lazy(() => import('./pages/Conversation'));
const Perks = React.lazy(() => import('./pages/Perks'));
const Library = React.lazy(() => import('./pages/Library'));
const Stories = React.lazy(() => import('./pages/Stories'));
const VideoLessons = React.lazy(() => import('./pages/VideoLessons'));
const Scenarios = React.lazy(() => import('./pages/Scenarios'));
const Encounters = React.lazy(() => import('./pages/Encounters'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const VoicePractice = React.lazy(() => import('./pages/VoicePractice'));
const Vault = React.lazy(() => import('./pages/Vault'));
const HackingGame = React.lazy(() => import('./pages/HackingGame'));
const GrammarLab = React.lazy(() => import('./pages/GrammarLab'));
const Quests = React.lazy(() => import('./pages/Quests'));
const VocabularyBank = React.lazy(() => import('./pages/VocabularyBank'));
const RepairTerminal = React.lazy(() => import('./pages/RepairTerminal'));
const Factions = React.lazy(() => import('./pages/Factions'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

const queryClient = new QueryClient();

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mainScrollContainer = document.getElementById('main-scroll-container');
    
    const toggleVisibility = () => {
      if (mainScrollContainer && mainScrollContainer.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    if (mainScrollContainer) {
      mainScrollContainer.addEventListener('scroll', toggleVisibility);
    }

    return () => {
      if (mainScrollContainer) {
        mainScrollContainer.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, []);

  const scrollToTop = () => {
    const mainScrollContainer = document.getElementById('main-scroll-container');
    if (mainScrollContainer) {
      mainScrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const t = useT();
  if (!isVisible) return null;

  return (
    <Tooltip content={t.scroll_to_top || "Scroll to Top"} position="left">
      <button
        onClick={scrollToTop}
        className="hidden md:flex fixed bottom-8 right-8 z-[100] bg-white dark:bg-slate-800 text-primary w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all items-center justify-center group"
      >
        <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" strokeWidth={2} />
      </button>
    </Tooltip>
  );
}

function LanguageDropdown({ 
  value, 
  onChange, 
  options, 
  uiLang 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: typeof LANGUAGES; 
  uiLang: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLang = options.find(l => l.id === value) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98] shadow-sm"
      >
        <span className="flex items-center gap-2">
          <span className="text-base leading-none">{selectedLang.flag}</span>
          <span className="truncate">{selectedLang.name[uiLang as keyof typeof selectedLang.name] || selectedLang.name.en}</span>
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] bottom-full mb-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar">
          {[...options].sort((a, b) => {
            const nameA = a.name[uiLang as keyof typeof a.name] || a.name.en;
            const nameB = b.name[uiLang as keyof typeof b.name] || b.name.en;
            return nameA.localeCompare(nameB);
          }).map(lang => (
            <button
              key={lang.id}
              onClick={() => {
                onChange(lang.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left transition-colors ${
                value === lang.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span className="truncate">{lang.name[uiLang as keyof typeof lang.name] || lang.name.en}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const NavGroup = ({ title, children, defaultExpanded = true }: NavGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-primary transition-all group"
      >
        <span>{title}</span>
        <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-primary' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden space-y-1.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const xp = useStore(state => state.xp);
  const daysSurvived = useStore(state => state.daysSurvived);
  const medkits = useStore(state => state.medkits);
  const credits = useStore(state => state.credits);
  const health = useStore(state => state.health);
  const cognitiveLoad = useStore(state => state.cognitiveLoad);
  const hydrationLevel = useStore(state => state.hydrationLevel);
  const heal = useStore(state => state.heal);
  const targetLang = useStore(state => state.targetLang);
  const setTargetLang = useStore(state => state.setTargetLang);
  const uiLang = useStore(state => state.uiLang);
  const setUiLang = useStore(state => state.setUiLang);
  const visualEffects = useStore(state => state.visualEffects);
  const toggleVisualEffects = useStore(state => state.toggleVisualEffects);
  const theme = useStore(state => state.theme);
  const crtMode = useStore(state => state.crtMode);
  const toggleCrtMode = useStore(state => state.toggleCrtMode);
  const setTheme = useStore(state => state.setTheme);
  const flashcardProgress = useStore(state => state.flashcardProgress);
  const displayName = useStore(state => state.displayName);
  const photoURL = useStore(state => state.photoURL);
  const uid = useStore(state => state.uid);
  const role = useStore(state => state.role);
  const avatarId = useStore(state => state.avatarId);
  const gender = useStore(state => state.gender);
  const weather = useStore(state => state.weather);

  const mistakesCount = useStore(state => Object.keys(state.mistakes).length);

  const navigate = useNavigate();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isOnline = useStore(state => state.isOnline);
  const setIsOnline = useStore(state => state.setIsOnline);
  const syncStatus = useStore(state => state.syncStatus);
  const syncProgress = useStore(state => state.syncProgress);

  const dailyProgress = useStore(state => state.dailyProgress);

  const claimableQuestsCount = useMemo(() => {
    const quests = [
      { target: 50, current: dailyProgress.xpEarned || 0, id: 1 },
      { target: 10, current: dailyProgress.flashcardsReviewed || 0, id: 2 },
      { target: 1, current: dailyProgress.lessonsCompleted || 0, id: 3 },
      { target: 1, current: dailyProgress.videosWatched || 0, id: 4 },
      { target: 5, current: dailyProgress.perfectFlashcards || 0, id: 5 },
      { target: 3, current: dailyProgress.newWordsLearned || 0, id: 6 },
    ];
    return quests.filter(q => q.current >= q.target && !dailyProgress.questsClaimed.includes(q.id)).length;
  }, [dailyProgress]);

  const totalQuestsProgress = useMemo(() => {
    const quests = [
      { target: 50, current: dailyProgress.xpEarned || 0 },
      { target: 10, current: dailyProgress.flashcardsReviewed || 0 },
      { target: 1, current: dailyProgress.lessonsCompleted || 0 },
      { target: 1, current: dailyProgress.videosWatched || 0 },
      { target: 5, current: dailyProgress.perfectFlashcards || 0 },
      { target: 3, current: dailyProgress.newWordsLearned || 0 },
    ];
    const completed = quests.filter(q => q.current >= q.target).length;
    return (completed / quests.length) * 100;
  }, [dailyProgress]);

  const dueCount = useMemo(() => {
    const allWords = WORDS_BY_LANG[targetLang] || [];
    const now = new Date().toISOString();
    return allWords.filter(w => {
      const key = `${targetLang}_${w.id}`;
      const progress = flashcardProgress[key];
      if (!progress) return true;
      if (progress.mastered) return false;
      return progress.nextReviewDate <= now;
    }).length;
  }, [targetLang, flashcardProgress]);

  const accessories = useStore(state => state.accessories);
  const t = useT();
  const isLesson = location.pathname.includes('/lesson');
  const currentLevel = Math.floor(xp / 100) + 1;

  const userAvatar = useMemo(() => {
    return getAvatarUrl(avatarId, accessories);
  }, [avatarId, accessories]);

  const weatherConfig = useMemo(() => {
    const configs = {
      clear: { icon: <Sun className="w-4 h-4" />, color: 'text-amber-500', label: t.weather_clear },
      rain: { icon: <CloudRain className="w-4 h-4" />, color: 'text-blue-500', label: t.weather_rain },
      dust_storm: { icon: <Wind className="w-4 h-4" />, color: 'text-orange-700', label: t.weather_dust_storm },
      acid_rain: { icon: <Zap className="w-4 h-4" />, color: 'text-emerald-500', label: t.weather_acid_rain },
      fog: { icon: <Cloud className="w-4 h-4" />, color: 'text-slate-400', label: t.weather_fog }
    };
    return configs[weather] || configs.clear;
  }, [weather, t]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'modern') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (visualEffects && theme === 'modern') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'modern') {
      document.documentElement.classList.remove('dark');
    }
  }, [visualEffects, theme]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkReminders = useStore.getState().checkReminders;
    // Initial check
    checkReminders();
    
    // Check every minute
    const interval = setInterval(() => {
      checkReminders();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const [navMode, setNavMode] = useState<'map' | 'list'>('map');

  if (isLesson) return (
    <>
      <Notifications />
      {children}
    </>
  );

  return (
    <div className={`flex h-screen relative overflow-hidden transition-colors duration-300 bg-background font-sans`}>
      <Notifications />
      <WeatherBackground />
      <WeatherEffects />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-md transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-[70] w-72 md:w-80 bg-slate-50 dark:bg-slate-950 border-r-2 border-slate-200 dark:border-slate-900 shadow-2xl md:shadow-none overflow-hidden flex flex-col`}>
        <div className="p-4 border-b-2 border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 relative overflow-hidden">
          <Link to="/" className="flex items-center gap-2 group/logo">
            <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-md flex items-center justify-center shadow-sm relative border-2 border-slate-200 dark:border-slate-800 shrink-0 overflow-hidden">
              <img src="/logo.svg" alt="Fennec Academy" className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 transition-colors uppercase leading-none">
                FENNEC ACADEMY
                {!isOnline && (
                  <WifiOff className="w-3 h-3 text-rose-500 animate-pulse" />
                )}
              </h1>
            </div>
          </Link>
          
          {/* Nav Mode Switcher */}
          <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border-2 border-slate-200 dark:border-slate-800">
            <button 
                onClick={() => setNavMode('map')}
                className={`flex items-center justify-center gap-2 py-2 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${navMode === 'map' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-foreground'}`}
              >
              {t.nav_map || 'World'}
            </button>
            <button 
                onClick={() => setNavMode('list')}
                className={`flex items-center justify-center gap-2 py-2 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${navMode === 'list' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-foreground'}`}
              >
              {t.nav_list || 'Terminal'}
            </button>
          </div>
        </div>

        
        {navMode === 'map' ? (
          <div className="flex-1 overflow-hidden relative flex flex-col">
             <MapSidebar />
          </div>
        ) : (
          <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto custom-scrollbar">
              {/* Main */}
              <NavGroup title={t.nav_terminal || 'Main'}>
                <Tooltip content={t.tooltip_dashboard} position="right">
                  <NavLink to="/" icon={<Home className="w-5 h-5" />} label={t.dashboard || 'Dashboard'} active={location.pathname === '/'} />
                </Tooltip>
                <Tooltip content={t.daily_quests || 'Quests'} position="right">
                  <NavLink 
                    to="/quests" 
                    icon={<Trophy className="w-5 h-5" />} 
                    label={t.daily_quests || 'Quests'} 
                    active={location.pathname === '/quests'} 
                    badge={claimableQuestsCount > 0 ? claimableQuestsCount : undefined} 
                    progress={totalQuestsProgress}
                  />
                </Tooltip>
                <Tooltip content={t.tasks_title || 'Tasks'} position="right">
                  <NavLink to="/tasks" icon={<Calendar className="w-5 h-5" />} label={t.tasks_title || 'Tasks'} active={location.pathname === '/tasks'} />
                </Tooltip>
                <Tooltip content={t.view_leaderboard || 'Leaderboard'} position="right">
                  <NavLink to="/leaderboard" icon={<Award className="w-5 h-5" />} label={t.view_leaderboard || 'Leaderboard'} active={location.pathname === '/leaderboard'} />
                </Tooltip>
                <Tooltip content={t.character_customization || 'Character'} position="right">
                  <NavLink to="/character" icon={<User className="w-5 h-5" />} label={t.nav_character || 'Character'} active={location.pathname === '/character'} />
                </Tooltip>
              </NavGroup>

            {/* Training */}
            <NavGroup title={t.nav_training || 'Training'}>
              <Tooltip content={t.tooltip_flashcards_page} position="right">
                <NavLink to="/flashcards" icon={<Layers className="w-5 h-5" />} label={t.flashcards || 'Flashcards'} active={location.pathname === '/flashcards'} badge={dueCount} />
              </Tooltip>
              <Tooltip content={t.vocabulary_bank || 'Vocabulary'} position="right">
                <NavLink to="/vocabulary" icon={<BookOpen className="w-5 h-5" />} label={t.vocabulary_bank || 'Vocabulary'} active={location.pathname === '/vocabulary'} />
              </Tooltip>
              <Tooltip content={t.grammar_lab || 'Grammar Lab'} position="right">
                <NavLink to="/grammar-lab" icon={<BookOpen className="w-5 h-5" />} label={t.grammar_lab || 'Grammar Lab'} active={location.pathname === '/grammar-lab'} />
              </Tooltip>
              <Tooltip content={t.match_game || 'Match'} position="right">
                <NavLink to="/match" icon={<Zap className="w-5 h-5" />} label={t.match_game || 'Match'} active={location.pathname === '/match'} />
              </Tooltip>
              <Tooltip content={t.hacking_game || 'Hacking'} position="right">
                <NavLink to="/hacking" icon={<Terminal className="w-5 h-5" />} label={t.hacking_game || 'Hacking'} active={location.pathname === '/hacking'} />
              </Tooltip>
            </NavGroup>

            {/* Faculty Communications */}
            <NavGroup title={t.nav_comms || 'Communications'} defaultExpanded={false}>
              <Tooltip content={t.tooltip_ai_chat_page} position="right">
                <NavLink to="/tutor" icon={<ShieldCheck className="w-5 h-5" />} label={t.tutor_ai || 'Professor'} active={location.pathname === '/tutor'} />
              </Tooltip>
              <Tooltip content={t.overseer_ai || 'The Dean'} position="right">
                <NavLink to="/chat" icon={<Cpu className="w-5 h-5" />} label={t.overseer_ai || 'Dean'} active={location.pathname === '/chat'} />
              </Tooltip>
              <Tooltip content={t.voice_calibration || 'Calibration'} position="right">
                <NavLink to="/voice-calibration" icon={<Mic className="w-5 h-5" />} label={t.voice_calibration || 'Calibration'} active={location.pathname === '/voice-calibration'} />
              </Tooltip>
            </NavGroup>

            {/* World */}
            <NavGroup title={t.nav_world || 'World'} defaultExpanded={false}>
              <Tooltip content={t.tooltip_library_page} position="right">
                <NavLink to="/library" icon={<Globe className="w-5 h-5" />} label={t.library || 'Library'} active={location.pathname === '/library'} />
              </Tooltip>
              <Tooltip content={t.wasteland_chronicles || 'Academic Journals'} position="right">
                <NavLink to="/stories" icon={<MessageSquare className="w-5 h-5" />} label={t.stories || 'Journals'} active={location.pathname === '/stories'} />
              </Tooltip>
              <Tooltip content={t.scenarios || 'Scenarios'} position="right">
                <NavLink to="/scenarios" icon={<Activity className="w-5 h-5" />} label={t.scenarios || 'Scenarios'} active={location.pathname === '/scenarios'} />
              </Tooltip>
              <Tooltip content={t.encounters || 'Encounters'} position="right">
                <NavLink to="/encounters" icon={<Sparkles className="w-5 h-5" />} label={t.encounters || 'Encounters'} active={location.pathname === '/encounters'} />
              </Tooltip>
              <Tooltip content={t.video_lessons || 'Videos'} position="right">
                <NavLink to="/videos" icon={<Video className="w-5 h-5" />} label={t.video_lessons || 'Videos'} active={location.pathname === '/videos'} />
              </Tooltip>
            </NavGroup>

            {/* Academic Status */}
            <NavGroup title={t.nav_status || 'Status'}>
              <Tooltip content={t.tooltip_perks_page} position="right">
                <NavLink to="/perks" icon={<Star className="w-5 h-5" />} label={t.perk_cards || 'Perks'} active={location.pathname === '/perks'} />
              </Tooltip>
              <Tooltip content={t.vault_title || 'Campus'} position="right">
                <NavLink to="/vault" icon={<Shield className="w-5 h-5" />} label={t.vault_title || 'Campus'} active={location.pathname === '/vault'} />
              </Tooltip>
              <Tooltip content={t.factions_title || 'Faculty Leagues'} position="right">
                <NavLink to="/factions" icon={<ShieldAlert className="w-5 h-5" />} label={t.factions_title || 'Leagues'} active={location.pathname === '/factions'} />
              </Tooltip>
              <Tooltip content={t.repair_terminal || 'Repair Terminal'} position="right">
                <NavLink to="/repair-terminal" icon={<Settings className="w-5 h-5" />} label={t.repair_terminal || 'Repair'} active={location.pathname === '/repair-terminal'} badge={mistakesCount} />
              </Tooltip>
              
              {role === 'admin' && (
                <Tooltip content={t.admin_panel || "Admin Panel"} position="right">
                  <NavLink to="/admin" icon={<Settings className="w-5 h-5" />} label={t.admin_panel || "Admin Panel"} active={location.pathname === '/admin'} />
                </Tooltip>
              )}
            </NavGroup>
            
            <div className="h-20" />
          </nav>
        )}

        <div className="mt-auto p-4 border-t-2 border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 space-y-4">
          <Link to="/profile" className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 transition-all group overflow-hidden shadow-sm">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
               <div className="w-10 h-10 rounded-lg overflow-hidden relative z-10 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                <AvatarWithFrame />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest truncate">{displayName || 'ST_USER'}</div>
              <div className="text-[9px] font-mono font-bold text-primary mt-1 uppercase tracking-[0.2em]">LV {currentLevel} // {xp % 1000} XP</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Language Selectors */}
          <div className="grid grid-cols-2 gap-2">
            <LanguageDropdown
              value={targetLang}
              onChange={(val) => setTargetLang(val)}
              options={LANGUAGES}
              uiLang={uiLang}
            />
            <LanguageDropdown
              value={uiLang}
              onChange={(val) => setUiLang(val as any)}
              options={LANGUAGES}
              uiLang={uiLang}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex gap-2">
              <button 
                onClick={() => setIsHelpOpen(true)} 
                className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded border-2 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                title="Help"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded border-2 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded border-2 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-sm"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-30 w-full bg-background font-sans">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 md:px-10 relative z-50 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -ml-2 transition-all rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4 md:gap-6 ml-auto overflow-x-auto custom-scrollbar no-scrollbar py-2">
            {mistakesCount > 0 && (
              <Link to="/repair-terminal" className="flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-4 py-1.5 rounded-full text-xs font-bold shrink-0 hover:bg-red-100 transition-colors">
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline">{mistakesCount} Repairs Needed</span>
              </Link>
            )}

            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full ${weatherConfig.color} shrink-0`}>
              {weatherConfig.icon}
              <span className="hidden lg:inline">{weatherConfig.label}</span>
            </div>

            <CognitiveStatus />

            <div className="flex items-center gap-6 shrink-0">
              {/* Health */}
              <div className="flex flex-col items-center gap-1 group">
                <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  Health
                </div>
                <div className="w-20 lg:w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${health}%` }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                  />
                </div>
              </div>

              {/* Water */}
              <div className="flex flex-col items-center gap-1 group">
                <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
                  <Droplets className="w-3.5 h-3.5 fill-blue-500" />
                  Focus
                </div>
                <div className="w-20 lg:w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${hydrationLevel}%` }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                  />
                </div>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />

            <div className="flex items-center gap-3 shrink-0">
              <Tooltip content="Academic Credits">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{credits}</span>
                </div>
              </Tooltip>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-bold shadow-sm">
                <Star className="w-4 h-4" />
                LVL {currentLevel}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-[calc(2rem+env(safe-area-inset-bottom))] relative z-10 scroll-smooth custom-scrollbar bg-background" id="main-scroll-container">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
        <ScrollToTop />
      </main>
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const uiLang = useStore.getState().uiLang;
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 font-sans">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
             <Globe className="w-12 h-12 text-primary" />
          </div>
        </div>
        <div className="space-y-4 text-center max-w-xs">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t.loading || 'Loading...'}
          </h3>
          <div className="w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="h-full bg-primary"
            />
          </div>
          <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
            Preparing your experience...
          </p>
        </div>
      </div>
    }>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/quests" element={<PageWrapper><Quests /></PageWrapper>} />
          <Route path="/tasks" element={<PageWrapper><Tasks /></PageWrapper>} />
          <Route path="/lesson/:id" element={<PageWrapper><Lesson /></PageWrapper>} />
          <Route path="/chat" element={<PageWrapper><PremiumGuard featureName="AI Chat" description={t.premium_chat_desc}><AIChat /></PremiumGuard></PageWrapper>} />
          <Route path="/tutor" element={<PageWrapper><PremiumGuard featureName="AI Tutor" description={t.premium_tutor_desc}><Conversation /></PremiumGuard></PageWrapper>} />
          <Route path="/grammar-lab" element={<PageWrapper><PremiumGuard featureName="Grammar Lab" description={t.premium_grammar_desc}><GrammarLab /></PremiumGuard></PageWrapper>} />
          <Route path="/flashcards" element={<PageWrapper><Flashcards /></PageWrapper>} />
          <Route path="/match" element={<PageWrapper><MatchGame /></PageWrapper>} />
          <Route path="/hacking" element={<PageWrapper><HackingGame /></PageWrapper>} />
          <Route path="/perks" element={<PageWrapper><Perks /></PageWrapper>} />
          <Route path="/library" element={<PageWrapper><Library /></PageWrapper>} />
          <Route path="/stories" element={<PageWrapper><Stories /></PageWrapper>} />
          <Route path="/videos" element={<PageWrapper><VideoLessons /></PageWrapper>} />
          <Route path="/scenarios" element={<PageWrapper><PremiumGuard featureName="AI Scenarios" description={t.premium_scenarios_desc}><Scenarios /></PremiumGuard></PageWrapper>} />
          <Route path="/encounters" element={<PageWrapper><PremiumGuard featureName="AI Encounters" description={t.premium_encounters_desc || 'Interactive branching stories'}><Encounters /></PremiumGuard></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="/leaderboard" element={<PageWrapper><Leaderboard /></PageWrapper>} />
          <Route path="/character" element={<PageWrapper><Character /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><AdminSettings /></PageWrapper>} />
          <Route path="/vault" element={<PageWrapper><Vault /></PageWrapper>} />
          <Route path="/vocabulary" element={<PageWrapper><VocabularyBank /></PageWrapper>} />
          <Route path="/repair-terminal" element={<PageWrapper><RepairTerminal /></PageWrapper>} />
          <Route path="/factions" element={<PageWrapper><Factions /></PageWrapper>} />
          <Route path="/voice-calibration" element={<PageWrapper><PremiumGuard featureName="Voice Practice" description={t.premium_voice_desc}><VoicePractice /></PremiumGuard></PageWrapper>} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function Login() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const t = useT();
  const setUser = useStore(state => state.setUser);
  const uiLang = useStore(state => state.uiLang);
  const setUiLang = useStore(state => state.setUiLang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (mode === 'forgot') {
      if (!email.trim()) {
        setError(t.fill_all_fields || 'Please fill in all fields');
        return;
      }
      setIsLoading(true);
      console.log('[Login] Submitting forgot password for:', email);
      try {
        await resetPassword(email);
        console.log('[Login] Forgot password success');
        setSuccess(t.reset_password_sent || 'Password reset link sent to your email');
      } catch (error: any) {
        console.error('[Login] Forgot password error:', error);
        setError(error?.message || 'Failed to send reset link');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (!email.trim() || !password.trim()) {
      setError(t.fill_all_fields || 'Please fill in all fields');
      return;
    }
    
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError(t.passwords_not_match || 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError(t.password_min_length || 'Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        // In WebView, onAuthStateChange may not fire reliably.
        // Explicitly check session and set user.
        const authResult = await handleAuthState();
        if (authResult.user) {
          await setUser(authResult.user);
        } else {
          setError('Login succeeded but session not found. Please try again.');
        }
      } else {
        const result = await signUpWithEmail(email, password);
        if (result.success) {
          // After sign-up, immediately check session and log user in
          const authResult = await handleAuthState();
          if (authResult.user) {
            await setUser(authResult.user);
          } else {
            setSuccess(t.check_email_confirm || 'Account created! Please check your email to confirm.');
          }
        }
      }
    } catch (error: any) {
      const msg = error?.message || 'Authentication failed';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-20" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative z-10"
      >
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg">
          <Globe className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{t.login_title}</h1>
        <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed max-w-xs mx-auto">
          {t.login_subtitle || t.login_desc || 'Welcome to the academy. Please verify your credentials to continue.'}
        </p>

        {/* Language Switcher */}
        <div className="flex justify-center gap-2 mb-6">
          {(['en', 'ru'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setUiLang(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                uiLang === lang
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              {lang === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}
            </button>
          ))}
        </div>

        {/* Mode Toggle */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                mode === 'login' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-400'
              }`}
            >
              {t.sign_in || 'Sign In'}
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
              className={`flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                mode === 'register' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-400'
              }`}
            >
              {t.register || 'Register'}
            </button>
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-left"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-200 leading-relaxed">{error}</div>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 text-left"
            >
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-200 leading-relaxed">{success}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'forgot' && (
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t.forgot_password || 'Reset Password'}
            </h3>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email_placeholder || 'Email address'}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={isLoading}
          />
          
          {mode !== 'forgot' && (
            <>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password_placeholder || 'Password'}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {mode === 'register' && (
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirm_password_placeholder || 'Confirm password'}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={isLoading}
                />
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 border-2 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900 py-4 font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : mode === 'forgot' ? (
              t.send_reset_link || 'Send Reset Link'
            ) : mode === 'login' ? (
              t.sign_in || 'Sign In'
            ) : (
              t.create_account || 'Create Account'
            )}
          </button>
          
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
              className="w-full text-center text-sm text-slate-500 hover:text-primary transition-colors mt-2"
            >
              {t.forgot_password || 'Forgot password?'}
            </button>
          )}
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className="w-full text-center text-sm text-slate-500 hover:text-primary transition-colors mt-2"
            >
              {t.back_to_login || 'Back to Sign In'}
            </button>
          )}
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 relative z-10">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <Shield className="w-4 h-4 text-emerald-500" />
            {t.login_secure || 'Secure Authentication'}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AppWrapper() {
  const fetchProgress = useStore(state => state.fetchProgress);
  const saveProgress = useStore(state => state.saveProgress);
  const isLoaded = useStore(state => state.isLoaded);
  const setUser = useStore(state => state.setUser);
  const uid = useStore(state => state.uid);
  const role = useStore(state => state.role);
  const globalSettings = useStore(state => state.globalSettings);
  const setGlobalSettings = useStore(state => state.setGlobalSettings);
  const uiLang = useStore(state => state.uiLang);
  const visualEffects = useStore(state => state.visualEffects);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const syncProgress = useStore(state => state.syncProgress);
  const setIsOnline = useStore(state => state.setIsOnline);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncProgress();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncProgress, setIsOnline]);

  const checkNewDay = useStore(state => state.checkNewDay);

  useEffect(() => {
    checkNewDay();
  }, [checkNewDay]);

  useEffect(() => {
    // Handle returning from OAuth redirect
    (async () => {
      try {
        const authResult = await handleAuthState();
        if (authResult.error) {
          console.warn('[App] Auth state error:', authResult.error);
        } else if (authResult.user) {
          console.log('[App] User authenticated:', authResult.user.uid);
          await setUser(authResult.user);
        }
      } catch (e) {
        console.error('[App] Auth init error:', e);
      } finally {
        setIsAuthLoading(false);
      }
    })();

    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      try {
        await setUser(user);
      } catch (e) {
        console.error('[App] setUser error in auth subscription:', e);
      } finally {
        setIsAuthLoading(false);
      }
    });

    // When app returns from background (e.g. user closed browser after OAuth)
    // check session again
    let appStateListener: { remove: () => void } | null = null;
    if (CapacitorApp && CapacitorApp.addListener) {
      CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          console.log('[App] App resumed, checking auth session...');
          try {
            const authResult = await handleAuthState();
            if (authResult.user) {
              await setUser(authResult.user);
            }
          } catch (e) {
            console.error('[App] App resume auth error:', e);
          } finally {
            setIsAuthLoading(false);
          }
        }
      }).then(listener => {
        appStateListener = listener;
      });
    }

    // Fetch global settings
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
        if (settingsDoc.exists()) {
          setGlobalSettings(settingsDoc.data());
        }
      } catch (error) {
        console.error("Error fetching global settings:", error);
      }
    };
    fetchSettings();

    return () => {
      unsubscribe();
      if (appStateListener) {
        appStateListener.remove();
      }
    };
  }, [setUser, setGlobalSettings]);

  useEffect(() => {
    if (!uid || !isLoaded) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const unsubscribe = useStore.subscribe((state, prevState) => {
      // Deep check for changes in syncable fields
      const hasChanges = (
        state.xp !== prevState.xp ||
        state.credits !== prevState.credits ||
        state.medkits !== prevState.medkits ||
        state.targetLang !== prevState.targetLang ||
        state.uiLang !== prevState.uiLang ||
        state.equippedPerks !== prevState.equippedPerks ||
        state.daysSurvived !== prevState.daysSurvived ||
        state.completedLessons !== prevState.completedLessons ||
        state.health !== prevState.health ||
        state.cognitiveLoad !== prevState.cognitiveLoad ||
        state.hydrationLevel !== prevState.hydrationLevel ||
        state.tasks !== prevState.tasks ||
        state.accessories !== prevState.accessories ||
        state.displayName !== prevState.displayName ||
        state.avatarId !== prevState.avatarId ||
        state.unlockedRooms !== prevState.unlockedRooms
      );

      if (hasChanges && state.syncStatus !== 'pending') {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          saveProgress(uid);
        }, 3000); // Debounce saves by 3 seconds
      }
    });

    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [uid, isLoaded, saveProgress]);

  const regenerateResources = useStore(state => state.regenerateResources);

  // Medbay & Energy HP/Resource Regeneration
  useEffect(() => {
    if (!uid || !isLoaded) return;
    
    // Check every 30 seconds
    const interval = setInterval(() => {
      regenerateResources();
    }, 30000);

    return () => clearInterval(interval);
  }, [uid, isLoaded, regenerateResources]);

  if (isAuthLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-900 dark:text-white">
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-12"
        >
          <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-primary/20 blur-3xl rounded-full" />
          <div className="relative w-28 h-28 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden">
            <img src="/logo.svg" alt="Fennec Academy" className="w-16 h-16" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
          </div>
        </motion.div>
        <div className="space-y-6 text-center max-w-sm">
          <h3 className="text-3xl font-black tracking-tight uppercase">
            Fennec Academy
          </h3>
          <div className="w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner mx-auto">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="h-full bg-primary"
            />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.3em] opacity-80 animate-pulse">
            {t.initializing_app || 'Initializing Neural Interface...'}
          </p>
        </div>
      </div>
    );
  }

  // Maintenance Mode Check
  if (globalSettings?.maintenanceMode && role !== 'admin') {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center font-sans">
        <div className="max-w-md w-full p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-rose-100 dark:border-rose-950/20">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg">
            <img src="/logo.svg" alt="Maintenance" className="w-10 h-10 grayscale opacity-50" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{t.maintenance_mode || 'Academy Maintenance'}</h1>
          <p className="text-sm font-medium text-slate-500 mb-10 leading-relaxed max-w-xs mx-auto">
            {t.maintenance_desc || 'Academy systems are undergoing scheduled maintenance. Please check back shortly.'}
          </p>
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl text-xs font-bold text-rose-600 uppercase tracking-widest border border-rose-100 dark:border-rose-900/30">
            {t.maintenance_status || 'Status: Campus Update in Progress'}
          </div>
        </div>
      </div>
    );
  }

  if (!uid) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 overflow-hidden font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center mb-8 relative shadow-2xl overflow-hidden"
        >
          <img src="/logo.svg" alt="Fennec Academy" className="w-14 h-14" />
        </motion.div>
        <div className="space-y-6 text-center max-w-xs">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-widest">
            {t.loading_user_data || 'Syncing Data...'}
          </h3>
          <div className="w-64 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner mx-auto relative cursor-wait">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="h-full bg-primary"
            />
          </div>
          <p className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse">
            Configuring Student Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScriptInjector />
          <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 transition-colors duration-300 ${visualEffects ? 'visual-effects' : ''}`}>
            {/* Global Message Banner */}
            <AnimatePresence>
              {globalSettings?.globalMessage && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-indigo-600 text-white text-center py-2 px-4 text-sm font-bold flex items-center justify-center gap-2 relative z-[1000]"
                >
                  <AlertCircle className="w-4 h-4" />
                  {globalSettings.globalMessage}
                </motion.div>
              )}
            </AnimatePresence>
            <Layout>
              <PwaPrompt />
              <CardOfTheDay />
              <AnimatedRoutes />
            </Layout>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
