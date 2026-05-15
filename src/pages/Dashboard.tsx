import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COURSES_BY_LANG, LANGUAGES, WORDS_BY_LANG } from '../data/gameData';
import { MINI_LESSONS } from '../data/miniLessons';
import { VIDEO_LESSONS } from '../data/videoLessons';
import { useStore, TaskCategory, ReminderType } from '../store/useStore';
import {
  UI_TRANSLATIONS,
  COURSE_TRANSLATIONS,
  LEARNING_TIPS_BY_LANG,
} from '../data/translations';
import { audioService, SoundEffect } from '../services/audioService';
import { SRSService } from '../services/srsService';
import SEO from '../components/SEO';
import MiniLessonModal from '../components/MiniLessonModal';
import { AdBanner } from '../components/AdBanner';
import { SpecialStats } from '../components/dashboard/SpecialStats';
import CharacterCustomization from '../components/CharacterCustomization';
import DailyLoginModal from '../components/DailyLoginModal';
import { AVATARS, getAvatarUrl } from '../data/avatars';
import { logLevelUp, logQuestClaim } from '../firebase';
import {
  CourseMap,
  DiagnosticsGrid,
  SkillsPerks,
  QuickSRS,
  MasteryLab,
  TasksSection,
  TrainingSims,
  ChatHistory,
  MiniLessons,
  VideoLessons,
  QuestLog,
  UserProfileBar,
  StatsCards,
  AIHelper,
  DailyQuestsSection,
  TaskFormModal,
} from '../components/dashboard';

export default function Dashboard() {
  const targetLang = useStore((state) => state.targetLang);
  const xp = useStore((state) => state.xp);
  const uiLang = useStore((state) => state.uiLang);
  const gender = useStore((state) => state.gender);
  const completedMiniLessons = useStore((state) => state.completedMiniLessons);
  const dailyProgress = useStore((state) => state.dailyProgress);
  const claimQuestReward = useStore((state) => state.claimQuestReward);
  const equippedPerks = useStore((state) => state.equippedPerks);
  const special = useStore((state) => state.special);
  const specialProgress = useStore((state) => state.specialProgress);
  const addNotification = useStore((state) => state.addNotification);
  const addTask = useStore((state) => state.addTask);
  const completeTask = useStore((state) => state.completeTask);
  const removeTask = useStore((state) => state.removeTask);
  const updateTask = useStore((state) => state.updateTask);
  const checkReminders = useStore((state) => state.checkReminders);
  const tasks = useStore((state) => state.tasks);
  const cognitiveLoad = useStore((state) => state.cognitiveLoad);
  const hydrationLevel = useStore((state) => state.hydrationLevel);
  const consumeItem = useStore((state) => state.consumeItem);
  const credits = useStore((state) => state.credits);
  const health = useStore((state) => state.health);
  const medkits = useStore((state) => state.medkits);
  const useMedkit = useStore((state) => state.useMedkit);
  const mistakes = useStore((state) => state.mistakes);
  const isPremium = useStore((state) => state.isPremium);
  const displayName = useStore((state) => state.displayName);
  const avatarId = useStore((state) => state.avatarId);
  const lessonDifficulty = useStore((state) => state.lessonDifficulty);
  const setLessonDifficulty = useStore((state) => state.setLessonDifficulty);
  const daysSurvived = useStore((state) => state.daysSurvived);
  const factionId = useStore((state) => state.factionId);
  const factionXp = useStore((state) => state.factionXp);
  const setGender = useStore((state) => state.setGender);
  const completedLessons = useStore((state) => state.completedLessons);
  const watchVideo = useStore((state) => state.watchVideo);
  const addXp = useStore((state) => state.addXp);
  const weather = useStore((state) => state.weather);
  const updateWeather = useStore((state) => state.updateWeather);
  const currentLang = useMemo(
    () => LANGUAGES.find((l) => l.id === targetLang),
    [targetLang]
  );
  const currentLevel = Math.floor(xp / 100) + 1;
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const courseData = useMemo(
    () => COURSES_BY_LANG[targetLang] || COURSES_BY_LANG['sr'],
    [targetLang]
  );
  const location = useLocation();
  const navigate = useNavigate();

  const [showAnimation, setShowAnimation] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [prevLevel, setPrevLevel] = useState(currentLevel);
  const [selectedMiniLesson, setSelectedMiniLesson] = useState<string | null>(
    null
  );
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakMilestone, setStreakMilestone] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'alphabetical'>('dueDate');
  const [syncing, setSyncing] = useState(false);
  const uid = useStore((state) => state.uid);
  const fetchProgress = useStore((state) => state.fetchProgress);
  const isOnline = useStore((state) => state.isOnline);
  const activeSynergies = useStore.getState().getActiveSynergies();

  const flashcardProgress = useStore((state) => state.flashcardProgress);
  const nextDueWord = useMemo(() => {
    const allWords = WORDS_BY_LANG[targetLang] || [];
    const now = new Date().toISOString();
    return allWords.find((w) => {
      const key = `${targetLang}_${w.id}`;
      const progress = flashcardProgress[key];
      if (!progress) return true;
      if (progress.mastered) return false;
      return progress.nextReviewDate <= now;
    });
  }, [targetLang, flashcardProgress]);

  const sessionStartTime = useStore((state) => state.sessionStartTime);
  const currentMistakeStreak = useStore((state) => state.currentMistakeStreak);
  const sessionReviews = useStore((state) => state.sessionReviews || 0);
  const accessories = useStore((state) => state.accessories);
  const userAvatar = useMemo(() => {
    return getAvatarUrl(avatarId, accessories);
  }, [avatarId, accessories]);

  const wordsNeedingReview = useMemo(() => {
    const allWords = WORDS_BY_LANG[targetLang] || [];
    const now = new Date().toISOString();
    return allWords.filter((w) => {
      const key = `${targetLang}_${w.id}`;
      const progress = flashcardProgress[key];
      return progress && !progress.mastered && progress.nextReviewDate <= now;
    }).length;
  }, [targetLang, flashcardProgress]);

  useEffect(() => {
    const milestones = [3, 7, 14];
    if (milestones.includes(daysSurvived)) {
      const lastCelebrated = sessionStorage.getItem(
        `streak_celebrated_${daysSurvived}`
      );
      if (!lastCelebrated) {
        setStreakMilestone(daysSurvived);
        setShowStreakCelebration(true);
        sessionStorage.setItem(`streak_celebrated_${daysSurvived}`, 'true');
        audioService.play(SoundEffect.LEVEL_UP);
        setTimeout(() => setShowStreakCelebration(false), 6000);
      }
    }
  }, [daysSurvived]);

  useEffect(() => {
    if (currentLevel > prevLevel) {
      setShowLevelUpAnimation(true);
      logLevelUp(currentLevel);
      setTimeout(() => setShowLevelUpAnimation(false), 5000);
      setPrevLevel(currentLevel);
    }
  }, [currentLevel, prevLevel]);

  const availableMiniLessons = useMemo(() => {
    return MINI_LESSONS.filter(
      (l) => l.targetLang === targetLang || l.targetLang === 'all'
    );
  }, [targetLang]);

  const availableVideos = useMemo(() => {
    return VIDEO_LESSONS.filter(
      (v) => v.targetLang === targetLang || v.targetLang === 'all'
    );
  }, [targetLang]);

  useEffect(() => {
    if (location.state?.lessonCompleted) {
      setShowAnimation(true);
      navigate(location.pathname, { replace: true, state: {} });

      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Prepare nodes for the map
  const mapNodes = useMemo(() => {
    return courseData.map((lesson, index) => {
      const isCompleted = lesson.lessons.every((l: any) =>
        completedLessons.includes(`${targetLang}_${l.id}`)
      );
      const isUnlocked =
        index === 0 ||
        courseData[index - 1].lessons.every((l: any) =>
          completedLessons.includes(`${targetLang}_${l.id}`)
        );
      const isCurrent = !isCompleted && isUnlocked;

      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = row % 2 === 0 ? 15 + col * 35 : 85 - col * 35;
      const y = 15 + row * 25;

      return {
        id: lesson.id,
        x,
        y,
        label:
          COURSE_TRANSLATIONS[uiLang]?.[lesson.id]?.title ||
          COURSE_TRANSLATIONS['en'][lesson.id]?.title,
        topic:
          COURSE_TRANSLATIONS[uiLang]?.[lesson.id]?.title ||
          COURSE_TRANSLATIONS['en'][lesson.id]?.title,
        path: '#',
        icon: isUnlocked ? (
          <svg className="w-6 h-6" />
        ) : (
          <svg className="w-5 h-5" />
        ),
        isUnlocked,
        isCompleted,
        isCurrent,
      };
    });
  }, [courseData, completedLessons, targetLang, uiLang]);

  const handleMapNodeClick = (nodeId: string) => {
    const element = document.getElementById(`module-${nodeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-8 pb-20 relative font-sans min-h-screen">
      <SEO
        title={t.dashboard}
        description="Your personal language learning dashboard. Track your progress, stats, and daily quests."
      />

      {/* Background Decorative Grid */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Streak Celebration */}
      <AnimatePresence>
        {showStreakCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md pointer-events-none"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-amber-500/10 rounded-full scale-150 blur-3xl"
              />
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center min-w-[320px]">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10"
                >
                  <div className="w-32 h-32 rounded-3xl bg-amber-500/10 flex items-center justify-center mb-8 shadow-lg shadow-amber-500/10">
                    <svg className="w-16 h-16 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight uppercase mb-2">
                    {t.streak_milestone || 'Academic Dedication'}
                  </h1>
                  <p className="text-amber-600 dark:text-amber-400 text-xl font-bold tracking-widest mb-4 uppercase">
                    {daysSurvived} {t.days_short} {t.streak || 'Streak'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs font-medium text-sm leading-relaxed">
                    {streakMilestone === 3 && t.streak_3_days}
                    {streakMilestone === 7 && t.streak_7_days}
                    {streakMilestone === 14 && t.streak_14_days}
                  </p>
                  <div className="mt-10 flex gap-3 justify-center">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ delay: i * 0.1, repeat: Infinity, duration: 1.2 }}
                        className="w-2.5 h-2.5 bg-amber-500 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUpAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/20 backdrop-blur-xl pointer-events-none"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-indigo-500/5 rounded-full scale-150"
              />
              <div className="bg-card border border-border p-16 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center min-w-[340px]">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="relative z-10"
                >
                  <div className="w-40 h-40 rounded-[2.5rem] bg-primary/10 flex items-center justify-center mb-10 shadow-lg shadow-primary/10 group">
                    <svg className="w-20 h-20 text-primary group-hover:scale-110 transition-transform duration-500 fill-primary/20" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </div>
                  <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase">
                    {t.level_up || 'Coursework Advancement'}
                  </h1>
                  <p className="text-indigo-600 dark:text-indigo-400 text-2xl font-bold tracking-[0.2em] uppercase">
                    {t.now_level || 'Now Year'} {currentLevel}
                  </p>
                  <div className="mt-12 flex gap-4 justify-center">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ delay: i * 0.1, repeat: Infinity, duration: 1.5 }}
                        className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_var(--primary-glow)]"
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lesson Completed Animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="relative flex flex-col items-center justify-center"
            >
              <div className="w-48 h-48 bg-white dark:bg-slate-800 border-[12px] border-primary rounded-3xl flex items-center justify-center shadow-2xl relative z-10 hover-lift">
                <svg className="w-24 h-24 text-primary" fill="none" stroke="currentColor" strokeWidth={5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-10 font-bold text-5xl text-white uppercase tracking-tighter drop-shadow-2xl"
              >
                {t.sector_cleared || 'Course Confirmed'}
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning Path Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-4 relative"
      >
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center shadow-sm border border-white dark:border-slate-800">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {t.learning_path || 'Learning Path'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg className={`w-3 h-3 ${viewMode === 'list' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1 rounded transition-all ${viewMode === 'map' ? 'bg-background shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-2 shadow-sm relative overflow-hidden bg-card border border-border rounded-xl">
          <CourseMap
            nodes={mapNodes}
            onNodeClick={handleMapNodeClick}
            className="h-[250px] md:h-[320px] relative z-10"
          />
        </div>
      </motion.div>

      {/* User Profile Bar */}
      <UserProfileBar
        t={t}
        uid={uid}
        xp={xp}
        syncing={syncing}
        isOnline={isOnline}
        fetchProgress={fetchProgress}
        setSyncing={setSyncing}
        displayName={displayName || ''}
        currentLevel={currentLevel}
        onCustomize={() => setIsCustomizing(true)}
      />

      {/* Stats Cards + Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCards t={t} credits={credits} factionId={factionId} />
        <DiagnosticsGrid
          special={special}
          specialProgress={specialProgress}
          sessionReviews={sessionReviews}
          dailyProgress={dailyProgress}
          equippedPerks={equippedPerks}
          cognitiveLoad={cognitiveLoad}
          hydrationLevel={hydrationLevel}
          weather={weather}
          sessionStartTime={sessionStartTime}
          currentMistakeStreak={currentMistakeStreak}
          daysSurvived={daysSurvived}
          credits={credits}
          consumeItem={consumeItem}
          useMedkit={useMedkit}
          medkits={medkits}
          health={health}
          t={t}
        />
      </div>

      {/* Core Stats Bar */}
      <SpecialStats special={special} specialProgress={specialProgress} t={t} />

      {/* Skills & Perks */}
      <SkillsPerks t={t} uiLang={uiLang} equippedPerks={equippedPerks} />

      {/* Learning Insights */}
      <div className="p-4 border-l-4 border-l-primary/50 flex items-center gap-4 bg-muted/30 rounded-xl">
        <div className="p-1.5 bg-primary text-white rounded-lg shrink-0 shadow-sm">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-bold italic truncate tracking-tight">
          {(() => {
            const tips = LEARNING_TIPS_BY_LANG[uiLang] || LEARNING_TIPS_BY_LANG['en'];
            return tips[Math.floor((new Date().getDate() + new Date().getMonth()) % tips.length)];
          })()}
        </p>
      </div>

      {/* Daily Quests */}
      <DailyQuestsSection t={t} />

      {/* AI Helper */}
      <AIHelper t={t} addNotification={addNotification} />

      {/* Quick Flashcard Session */}
      <QuickSRS
        nextDueWord={nextDueWord}
        sessionCompleted={sessionCompleted}
        onComplete={() => {
          setSessionCompleted(true);
          addXp(10);
          addNotification(t.word_reviewed_xp || 'Word reviewed! +10 XP', 'success');
        }}
        t={t}
        addXp={addXp}
        addNotification={addNotification}
      />

      {/* Mastery Lab */}
      <MasteryLab mistakes={mistakes} t={t} />

      {/* Ad Banner */}
      {!isPremium && <AdBanner position="inline" />}

      {/* Difficulty Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl text-primary flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{t.difficulty || 'Cognitive Intensity'}</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mt-1">{t.difficulty_desc || 'Adjust the baseline difficulty for your curriculum'}</p>
          </div>
        </div>
        <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-100 dark:border-slate-700 rounded-2xl w-full md:w-auto shadow-inner">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => {
                setLessonDifficulty(d);
                audioService.play(SoundEffect.SUCCESS);
              }}
              className={`flex-1 md:flex-none px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                lessonDifficulty === d
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-lg ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t[`difficulty_${d}`] || d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tasks Section */}
      <TasksSection
        t={t}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showAddTask={false}
        setShowAddTask={() => {}}
        editingTaskId={null}
        setEditingTaskId={() => {}}
        newTaskTitle=""
        setNewTaskTitle={() => {}}
        newTaskDueDate={new Date().toISOString().split('T')[0]}
        setNewTaskDueDate={() => {}}
        dateError={null}
        setDateError={() => {}}
        newTaskPriority="medium"
        setNewTaskPriority={() => {}}
        newTaskXp={25}
        setNewTaskXp={() => {}}
        newTaskReminder="none"
        setNewTaskReminder={() => {}}
        newTaskCategory="other"
        setNewTaskCategory={() => {}}
        onSave={() => {}}
        onCancel={() => {}}
      />

      {/* Training Sims */}
      <TrainingSims t={t} />

      {/* Ad Banner */}
      {!isPremium && <AdBanner />}

      {/* Chat History */}
      <ChatHistory t={t} />

      {/* Mini Lessons */}
      <MiniLessons
        availableMiniLessons={availableMiniLessons}
        completedMiniLessons={completedMiniLessons}
        selectedMiniLesson={selectedMiniLesson}
        onSelect={setSelectedMiniLesson}
        onClose={() => setSelectedMiniLesson(null)}
        uiLang={uiLang}
      />

      {/* Video Lessons */}
      <VideoLessons
        availableVideos={availableVideos}
        uiLang={uiLang}
        t={t}
        watchVideo={watchVideo}
        addXp={addXp}
        addNotification={addNotification}
      />

      {/* Quest Log */}
      <QuestLog
        courseData={courseData}
        completedLessons={completedLessons}
        targetLang={targetLang}
        uiLang={uiLang}
        xp={xp}
        currentLevel={currentLevel}
        lessonDifficulty={lessonDifficulty}
        t={t}
      />

      {selectedMiniLesson && (
        <MiniLessonModal
          lesson={availableMiniLessons.find((l) => l.id === selectedMiniLesson)!}
          isOpen={!!selectedMiniLesson}
          onClose={() => setSelectedMiniLesson(null)}
        />
      )}
      <CharacterCustomization isOpen={isCustomizing} onClose={() => setIsCustomizing(false)} />
      <DailyLoginModal />
    </div>
  );
}