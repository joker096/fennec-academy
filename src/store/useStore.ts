import { create } from 'zustand';
import { db, doc, getDoc, setDoc, updateDoc, query, collection, limit, getDocs, OperationType, handleFirestoreError, logEvent } from '../firebase';
import { UI_TRANSLATIONS } from '../data/translations';
import { audioService, SoundEffect } from '../services/audioService';
import { ACHIEVEMENTS } from '../data/achievements';
import { CAMPUS_ROOMS } from '../data/vaultRooms';
import { triggerLevelUpEffects } from '../lib/utils';
import { SRSService, SRSStats } from '../services/srsService';
import { WORDS_BY_LANG, COURSES_BY_LANG } from '../data/gameData';
import { PERKS, PERK_SYNERGIES } from '../data/perks';
import { AppError, ValidationError, handleAppError } from '../lib/errors';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface FlashcardProgress extends SRSStats {
  easeFactor: number; // Keep for backward compatibility
}

export interface Mistake {
  wordId: string;
  lang: string;
  repairCount: number; // 0 to 3
  lastAttemptDate?: string;
}

const loadFlashcardProgress = (): Record<string, FlashcardProgress> => {
  try {
    const data = localStorage.getItem('flashcardProgress');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveFlashcardProgress = (progress: Record<string, FlashcardProgress>) => {
  try {
    localStorage.setItem('flashcardProgress', JSON.stringify(progress));
  } catch {}
};

const loadMistakes = (): Record<string, Mistake> => {
  try {
    const data = localStorage.getItem('mistakes');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const mergeFlashcardProgress = (local: Record<string, FlashcardProgress>, cloud: Record<string, FlashcardProgress>) => {
  const merged = { ...local };
  for (const [key, cloudStats] of Object.entries(cloud)) {
    const localStats = merged[key];
    if (!localStats) {
      merged[key] = cloudStats;
    } else {
      const cloudDate = cloudStats.lastReviewed ? new Date(cloudStats.lastReviewed).getTime() : 0;
      const localDate = localStats.lastReviewed ? new Date(localStats.lastReviewed).getTime() : 0;
      if (cloudDate > localDate) {
        merged[key] = cloudStats;
      }
    }
  }
  return merged;
};

const mergeMistakes = (local: Record<string, Mistake>, cloud: Record<string, Mistake>) => {
  const merged = { ...local };
  for (const [key, cloudMistake] of Object.entries(cloud)) {
    const localMistake = merged[key];
    if (!localMistake) {
      merged[key] = cloudMistake;
    } else {
      const cloudDate = cloudMistake.lastAttemptDate ? new Date(cloudMistake.lastAttemptDate).getTime() : 0;
      const localDate = localMistake.lastAttemptDate ? new Date(localMistake.lastAttemptDate).getTime() : 0;
      if (cloudDate > localDate) {
        merged[key] = cloudMistake;
      }
    }
  }
  return merged;
};

const saveMistakes = (mistakes: Record<string, Mistake>) => {
  try {
    localStorage.setItem('mistakes', JSON.stringify(mistakes));
  } catch {}
};

export type TaskPriority = 'low' | 'medium' | 'high';
export type ReminderType = 'none' | 'at_due_date' | '1_day_before' | '1_hour_before';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskCategory = 'lesson' | 'vocabulary' | 'training' | 'exploration' | 'other';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO string
  completed: boolean;
  status: TaskStatus;
  category?: TaskCategory;
  xpReward: number;
  priority: TaskPriority;
  reminderType?: ReminderType;
  reminderSent?: boolean;
  progress?: number; // 0 to 100
}

export interface DailyProgress {
  date: string;
  xpEarned: number;
  flashcardsReviewed: number;
  perfectFlashcards: number;
  lessonsCompleted: number;
  newWordsLearned: number;
  videosWatched: number;
  questsClaimed: number[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  options?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
  targetLang: string;
  uiLang: string;
}

interface UserState {
  uid: string | null;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  photoURL: string | null;
  xp: number;
  daysSurvived: number;
  medkits: number;
  credits: number;
  health: number;
  cognitiveLoad: number;
  hydrationLevel: number;
  lastPlayedDate: string | null;
  nativeLang: string;
  targetLang: string;
  uiLang: 'en' | 'ru' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'zh' | 'sr';
  gender: 'male' | 'female';
  notifications: Notification[];
  defaultReminderType: ReminderType;
  equippedPerks: string[];
  unlockedPerks: string[];
  completedLessons: string[];
  completedMiniLessons: string[];
  special: { S: number, P: number, E: number, C: number, I: number, A: number, L: number };
  specialProgress: { S: number, P: number, E: number, C: number, I: number, A: number, L: number };
  isLoaded: boolean;
  visualEffects: boolean;
  crtMode: boolean;
  theme: 'classic' | 'amber' | 'modern';
  sessionReviews: number;
  flashcardProgress: Record<string, FlashcardProgress>;
  mistakes: Record<string, Mistake>;
  customWords: Record<string, any[]>;
  savedExamples: { word: string; sentence: string; translation: string; targetLang: string; source?: string; sourceName?: string }[];
  dailyProgress: DailyProgress;
  tasks: Task[];
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  isPremium: boolean;
  avatarId: string;
  accessories: { hat: string; glasses: string };
  role: 'user' | 'admin';
  achievements: Record<string, number>;
  perfectLessonsCount: number;
  lessonContext: {
    currentWord: string;
    translation: string;
    mistakes: string[];
  } | null;
  weather: 'clear' | 'rain' | 'dust_storm' | 'acid_rain' | 'fog';
  sessionStartTime: number;
  currentMistakeStreak: number;
  globalSettings: {
    googleAnalyticsId?: string;
    yandexMetricaId?: string;
    adCodeHeader?: string;
    adCodeFooter?: string;
    adCodeSidebar?: string;
    customScripts?: string;
    maintenanceMode?: boolean;
    globalMessage?: string;
    hideAds?: boolean;
  } | null;
  hasUsedMonthlyRepair: boolean;
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'offline' | 'error';
  lastRegenTime: string;
  lastSyncTime: string | null;
  loginStreak: number;
  lastClaimedLoginDate: string | null;
  showLoginBonus: boolean;
  geminiApiKey: string | null;
  regenerateResources: () => void;
  downloadedLanguages: string[];
  unlockedRooms: string[];
  roomLastCollection: Record<string, string>;
  universityPopulation: number;
  lessonDifficulty: 'easy' | 'medium' | 'hard';
  chatMetrics: {
    totalMessages: number;
    feedbackCount: number;
    totalResponseTime: number; // in ms
    lastMessageTimestamp: number | null;
  };
  factionId: string | null;
  factionXp: number;
  weeklyFactionXp: number;
  leagueTier: string;
  unlockedCosmetics: string[];
  equippedFrame: string;
  factionWinnerId: string | null;
  factionStandings: { factionId: string, totalXp: number }[];
  lastWeeklyReset: string | null;
  
  setUser: (user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null; role?: 'user' | 'admin' } | null) => void;
  setGlobalSettings: (settings: any) => void;
  updateGlobalSettings: (settings: any) => Promise<void>;
  updateWeather: () => void;
  addXp: (amount: number, source?: string) => void;
  addCredits: (amount: number) => void;
  unlockRoom: (roomId: string, cost: number) => boolean;
  buyPerk: (perkId: string, cost: number) => boolean;
  collectRoomResource: (roomId: string) => void;
  useEnergy: (source?: 'electronic' | 'story' | 'chat') => void;
  useMedkit: () => void;
  consumeItem: (type: 'food' | 'drink') => void;
  heal: () => void;
  takeDamage: (amount: number) => { died: boolean, prevented: boolean };
  checkDailyStreak: () => void;
  checkAchievements: () => void;
  setTargetLang: (lang: string) => void;
  setUiLang: (lang: 'en' | 'ru' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'zh' | 'sr') => void;
  setDefaultReminderType: (type: ReminderType) => void;
  setGender: (gender: 'male' | 'female') => void;
  setLessonDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  togglePerk: (perkId: string) => void;
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  addCustomWord: (word: string, translation: string, transcription?: string) => void;
  removeNotification: (id: string) => void;
  completeLesson: (lessonId: string, isPerfect?: boolean) => void;
  completeMiniLesson: (lessonId: string) => void;
  updateFlashcardProgress: (wordId: string, lang: string, quality: number) => void;
  calculateNextInterval: (wordId: string, lang: string, quality: number) => number;
  resetFlashcardProgress: (wordId: string, lang: string) => void;
  recordChatMessage: (hasFeedback: boolean) => void;
  saveExample: (word: string, example: { sentence: string; translation: string; source?: string; sourceName?: string }, targetLang: string) => void;
  removeExample: (sentence: string) => void;
  resetSessionReviews: () => void;
  addMistake: (wordId: string, lang: string) => void;
  repairMistake: (wordId: string, lang: string, success: boolean) => void;
  checkNewDay: () => void;
  claimQuestReward: (questId: number, reward: number) => void;
  watchVideo: () => void;
  updateSpecial: (stat: keyof UserState['special'], amount: number) => void;
  addSpecialProgress: (stat: keyof UserState['special'], amount: number) => void;
  toggleVisualEffects: () => void;
  toggleCrtMode: () => void;
  setTheme: (theme: 'classic' | 'amber' | 'modern') => void;
  addTask: (title: string, dueDate: string, priority?: TaskPriority, xpReward?: number, reminderType?: ReminderType, category?: TaskCategory) => void;
  checkReminders: () => void;
  updateTaskReminder: (taskId: string, reminderType: ReminderType) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  completeTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  addChatMessage: (sessionId: string, message: ChatMessage) => void;
  createNewChatSession: (title: string, initialMessages?: ChatMessage[]) => string;
  deleteChatSession: (sessionId: string) => void;
  updateChatSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  buyPremium: () => void;
  setAvatarId: (avatarId: string) => void;
  setEquippedPerks: (perks: string[]) => void;
  setAccessories: (accessories: { hat?: string; glasses?: string }) => void;
  setDisplayName: (name: string) => void;
  setBio: (bio: string) => void;
  setLocation: (location: string) => void;
  setEmail: (email: string) => void;
  setSpecial: (special: UserState['special']) => void;
  setIsOnline: (isOnline: boolean) => void;
  setShowLoginBonus: (show: boolean) => void;
  setGeminiApiKey: (key: string | null) => void;
  setLessonContext: (context: { currentWord: string; translation: string; mistakes: string[] } | null) => void;
  joinFaction: (factionId: string) => void;
  claimLeagueReward: (rewardId: string) => void;
  equipFrame: (frameId: string) => void;
  checkWeeklyFactionWinner: () => Promise<void>;
  updateFactionStandings: () => Promise<void>;
  downloadLanguage: (lang: string) => Promise<void>;
  fetchProgress: (userId: string) => Promise<void>;
  saveProgress: (userId: string) => Promise<void>;
  syncProgress: () => Promise<void>;
  triggerSync: () => void;
  rest: () => void;
  setMnemonicImageUrl: (wordId: string, lang: string, url: string) => void;
  hasSynergy: (stat: string, tierLevel?: number) => boolean;
  getActiveSynergies: () => any[];
}

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const isRetryable = (error as any)?.code === 'unavailable' || (error as any)?.code === 'deadline-exceeded';
    if (retries <= 0 || !isRetryable) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
};

const safeJSONParse = (key: string, fallback: any) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error parsing localStorage key "${key}":`, err);
    return fallback;
  }
};

export const useStore = create<UserState>((set, get) => ({
  uid: null,
  displayName: null,
  bio: null,
  location: null,
  email: null,
  photoURL: null,
  xp: 0,
  daysSurvived: 1,
  medkits: 5,
  credits: 0,
  health: 100,
  lastPlayedDate: null,
  nativeLang: 'ru',
  targetLang: localStorage.getItem('targetLang') || 'en',
  uiLang: (localStorage.getItem('uiLang') as 'en' | 'ru' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'zh' | 'sr') || 'en',
  gender: (localStorage.getItem('gender') as 'male' | 'female') || 'male',
  notifications: [],
  defaultReminderType: (localStorage.getItem('defaultReminderType') as ReminderType) || '1_hour_before',
  equippedPerks: [],
  unlockedPerks: ['dedicated_learner'], // Start with one basic perk
  completedLessons: [],
  completedMiniLessons: [],
  special: { S: 5, P: 5, E: 5, C: 5, I: 5, A: 5, L: 5 },
  specialProgress: { S: 0, P: 0, E: 0, C: 0, I: 0, A: 0, L: 0 },
  isLoaded: false,
  cognitiveLoad: 100,
  hydrationLevel: 100,
  visualEffects: localStorage.getItem('visualEffects') !== 'false',
  crtMode: localStorage.getItem('crtMode') === 'true',
  theme: (localStorage.getItem('theme') as 'classic' | 'amber' | 'modern') || 'modern',
  sessionReviews: 0,
  flashcardProgress: loadFlashcardProgress(),
  mistakes: loadMistakes(),
  customWords: safeJSONParse('customWords', {}),
  savedExamples: safeJSONParse('savedExamples', []),
  dailyProgress: {
    date: new Date().toISOString().split('T')[0],
    xpEarned: 0,
    flashcardsReviewed: 0,
    perfectFlashcards: 0,
    lessonsCompleted: 0,
    newWordsLearned: 0,
    videosWatched: 0,
    questsClaimed: []
  },
  tasks: [
    {
      id: 'exam_prep_01',
      title: 'Prepare for final exam',
      dueDate: '2026-05-01',
      completed: false,
      status: 'todo',
      priority: 'high',
      xpReward: 50,
      reminderType: 'at_due_date',
      reminderSent: false
    }
  ],
  chatSessions: safeJSONParse('chatSessions', []),
  currentSessionId: localStorage.getItem('currentSessionId') || null,
  isPremium: localStorage.getItem('isPremium') === 'true',
  avatarId: localStorage.getItem('avatarId') || 'vault_boy',
  accessories: safeJSONParse('accessories', { hat: 'none_hat', glasses: 'none_glasses' }),
  role: 'user',
  achievements: safeJSONParse('achievements', {}),
  perfectLessonsCount: parseInt(localStorage.getItem('perfectLessonsCount') || '0'),
  lessonContext: null,
  weather: 'clear',
  sessionStartTime: Date.now(),
  currentMistakeStreak: 0,
  globalSettings: null,
  hasUsedMonthlyRepair: localStorage.getItem('hasUsedMonthlyRepair') === 'true',
  isOnline: navigator.onLine,
  syncStatus: navigator.onLine ? 'synced' : 'offline',
  lastRegenTime: new Date().toISOString(),
  lastSyncTime: null,
  loginStreak: 0,
  lastClaimedLoginDate: null,
  showLoginBonus: false,
  geminiApiKey: localStorage.getItem('geminiApiKey') || null,

  regenerateResources: () => {
    const state = get();
    const now = new Date();
    const lastRegen = new Date(state.lastRegenTime);
    
    // Only regenerate if at least 20 seconds have passed
    const diffSeconds = (now.getTime() - lastRegen.getTime()) / 1000;
    if (diffSeconds < 20 || !state.isLoaded) return;

    // Synergy multipliers
    let energyRegenBonus = 1.0;
    if (state.hasSynergy('A', 2)) energyRegenBonus = 1.5;
    else if (state.hasSynergy('A', 1)) energyRegenBonus = 1.25;

    let healthRegen = 0;
    if (state.unlockedRooms.includes('medbay')) healthRegen += 0.5; // base medbay regen per min
    if (state.hasSynergy('E', 2)) healthRegen += 0.5; // endurance synergy per min

    // Scale by time passed (minutes)
    const minutesPassed = diffSeconds / 60;
    const healthAdd = healthRegen * minutesPassed;
    const energyAdd = 2.0 * energyRegenBonus * minutesPassed;
    
    if (healthAdd === 0 && energyAdd === 0 && state.cognitiveLoad >= 100 && state.hydrationLevel >= 100 && state.health >= 100) {
      set({ lastRegenTime: now.toISOString() });
      return;
    }

    set((s) => ({
      health: Math.min(100, s.health + healthAdd),
      cognitiveLoad: Math.min(100, s.cognitiveLoad + energyAdd),
      hydrationLevel: Math.min(100, s.hydrationLevel + energyAdd),
      lastRegenTime: now.toISOString()
    }));
  },

  downloadedLanguages: safeJSONParse('downloadedLanguages', []),
  unlockedRooms: safeJSONParse('unlockedRooms', ["student_dormitories"]),
  roomLastCollection: safeJSONParse('roomLastCollection', {}),
  universityPopulation: parseInt(localStorage.getItem('universityPopulation') || '1'),
  lessonDifficulty: (localStorage.getItem('lessonDifficulty') as 'easy' | 'medium' | 'hard') || 'medium',
  chatMetrics: safeJSONParse('chatMetrics', {"totalMessages": 0, "feedbackCount": 0, "totalResponseTime": 0, "lastMessageTimestamp": null}),
  factionId: localStorage.getItem('factionId') || null,
  factionXp: parseInt(localStorage.getItem('factionXp') || '0'),
  weeklyFactionXp: parseInt(localStorage.getItem('weeklyFactionXp') || '0'),
  leagueTier: localStorage.getItem('leagueTier') || 'bronze',
  unlockedCosmetics: safeJSONParse('unlockedCosmetics', ["default_frame"]),
  equippedFrame: localStorage.getItem('equippedFrame') || 'default_frame',
  factionWinnerId: localStorage.getItem('factionWinnerId') || null,
  factionStandings: safeJSONParse('factionStandings', []),
  lastWeeklyReset: localStorage.getItem('lastWeeklyReset') || null,

  setUser: async (user) => {
    if (user) {
      logEvent('login', { method: 'google', uid: user.uid });
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isAdmin = userData.role === 'admin' || user.email === 'zaartyom@gmail.com';
          set({ 
            uid: user.uid,
            displayName: userData.displayName || user.displayName,
            bio: userData.bio || null,
            location: userData.location || null,
            email: userData.email || user.email,
            photoURL: userData.photoURL || user.photoURL,
            role: isAdmin ? 'admin' : 'user',
            xp: userData.xp || 0,
            daysSurvived: userData.daysSurvived || 1,
            medkits: userData.medkits || 5,
            credits: userData.credits || 0,
            health: userData.health || 100,
            cognitiveLoad: userData.cognitiveLoad || 100,
            hydrationLevel: userData.hydrationLevel || 100,
            targetLang: userData.targetLang || get().targetLang,
            uiLang: userData.uiLang || get().uiLang,
            equippedPerks: userData.equippedPerks || [],
            unlockedPerks: userData.unlockedPerks || ['dedicated_learner'],
            completedLessons: userData.completedLessons || [],
            completedMiniLessons: userData.completedMiniLessons || [],
            special: userData.special || { S: 5, P: 5, E: 5, C: 5, I: 5, A: 5, L: 5 },
            specialProgress: userData.specialProgress || { S: 0, P: 0, E: 0, C: 0, I: 0, A: 0, L: 0 },
            flashcardProgress: userData.flashcardProgress || loadFlashcardProgress(),
            mistakes: userData.mistakes || loadMistakes(),
            customWords: userData.customWords || {},
            isPremium: userData.isPremium || false,
            theme: userData.theme || 'modern',
            avatarId: userData.avatarId || 'vault_boy',
            accessories: userData.accessories || { hat: 'none_hat', glasses: 'none_glasses' },
            achievements: userData.achievements || {},
            perfectLessonsCount: userData.perfectLessonsCount || 0,
            weather: userData.weather || 'clear',
            unlockedRooms: userData.unlockedRooms || ['student_dormitories'],
            roomLastCollection: userData.roomLastCollection || {},
            universityPopulation: userData.universityPopulation || 1,
            factionId: userData.factionId || null,
            factionXp: userData.factionXp || 0,
            weeklyFactionXp: userData.weeklyFactionXp || 0,
            leagueTier: userData.leagueTier || 'bronze',
            unlockedCosmetics: userData.unlockedCosmetics || ['default_frame'],
            equippedFrame: userData.equippedFrame || 'default_frame',
            isLoaded: true
          });
        } else {
          // New user
          const isAdmin = user.email === 'zaartyom@gmail.com';
          const newUser = {
            uid: user.uid,
            displayName: user.displayName,
            bio: null,
            location: null,
            email: user.email,
            photoURL: user.photoURL,
            role: (isAdmin ? 'admin' : 'user') as 'user' | 'admin',
            xp: 0,
            daysSurvived: 1,
            medkits: 5,
            credits: 0,
            health: 100,
            cognitiveLoad: 100,
            hydrationLevel: 100,
            targetLang: get().targetLang,
            uiLang: get().uiLang,
            equippedPerks: [],
            unlockedPerks: ['dedicated_learner'],
            completedLessons: [],
            completedMiniLessons: [],
            mistakes: {},
            customWords: {},
            special: { S: 5, P: 5, E: 5, C: 5, I: 5, A: 5, L: 5 },
            theme: 'modern' as const,
            isPremium: false,
            avatarId: 'vault_boy',
            accessories: { hat: 'none_hat', glasses: 'none_glasses' },
            weather: 'clear' as const,
            unlockedRooms: ['student_dormitories'],
            roomLastCollection: {},
            universityPopulation: 1,
            factionId: null,
            factionXp: 0,
            weeklyFactionXp: 0,
            leagueTier: 'bronze',
            unlockedCosmetics: ['default_frame'],
            equippedFrame: 'default_frame',
            lessonDifficulty: 'medium' as const,
            hasUsedMonthlyRepair: false,
            lastUpdated: new Date().toISOString()
          };
          await setDoc(userDocRef, newUser);
          set({ ...newUser, uid: user.uid, isLoaded: true });
        }

        // Fetch global settings
        try {
          const settingsDoc = await withRetry(() => getDoc(doc(db, 'settings', 'global')));
          if (settingsDoc.exists()) {
            set({ globalSettings: settingsDoc.data() });
          }
        } catch (e) {
          console.warn('Failed to fetch global settings:', e);
        }

        // Sync to public leaderboard
        const leaderboardRef = doc(db, 'leaderboard', user.uid);
        const state = get();
        try {
          await withRetry(() => setDoc(leaderboardRef, {
            uid: user.uid,
            displayName: state.displayName,
            photoURL: state.photoURL,
            avatarId: state.avatarId,
            accessories: state.accessories,
            xp: state.xp,
            factionId: state.factionId,
            factionXp: state.factionXp,
            weeklyFactionXp: state.weeklyFactionXp,
            leagueTier: state.leagueTier,
            daysSurvived: state.daysSurvived,
            special: state.special,
            lastUpdated: new Date().toISOString()
          }, { merge: true }));
        } catch (e) {
          console.warn('Failed to sync to leaderboard:', e);
        }
      } catch (error) {
        set({ isLoaded: true });
        try {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        } catch (err: any) {
          get().addNotification(err.message, 'error');
        }
      }
    } else {
      set({ 
        uid: null, 
        displayName: null, 
        email: null, 
        photoURL: null, 
        role: 'user',
        isLoaded: true
      });
    }
  },

  setGlobalSettings: (settings) => set({ globalSettings: settings }),

  updateGlobalSettings: async (settings) => {
    const settingsRef = doc(db, 'settings', 'global');
    try {
      await setDoc(settingsRef, settings, { merge: true });
      set({ globalSettings: settings });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  },

  updateWeather: () => set((state) => {
    const weathers: ('clear' | 'rain' | 'dust_storm' | 'acid_rain' | 'fog')[] = ['clear', 'rain', 'dust_storm', 'acid_rain', 'fog'];
    // Weighted probabilities: Clear is most common, Acid Rain/Dust Storm are rarer
    const weights = [0.5, 0.2, 0.1, 0.05, 0.15];
    const random = Math.random();
    let cumulative = 0;
    let newWeather: 'clear' | 'rain' | 'dust_storm' | 'acid_rain' | 'fog' = 'clear';
    
    for (let i = 0; i < weathers.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        newWeather = weathers[i];
        break;
      }
    }

    if (newWeather !== state.weather) {
      const t = UI_TRANSLATIONS[state.uiLang] || UI_TRANSLATIONS['en'];
      const weatherNames: Record<string, string> = {
        clear: t.weather_clear || 'Clear Skies',
        rain: t.weather_rain || 'Radioactive Rain',
        dust_storm: t.weather_dust_storm || 'Dust Storm',
        acid_rain: t.weather_acid_rain || 'Acid Rain',
        fog: t.weather_fog || 'Toxic Fog'
      };
      
      get().addNotification(`${t.weather_changed || 'Weather Changed'}: ${weatherNames[newWeather]}`, 'info');
    }

    return { weather: newWeather };
  }),

  setGender: (gender) => {
    localStorage.setItem('gender', gender);
    set({ gender });
  },

  setLessonDifficulty: (difficulty) => {
    localStorage.setItem('lessonDifficulty', difficulty);
    set({ lessonDifficulty: difficulty });
  },

  addXp: (amount, source) => {
    const today = new Date().toISOString().split('T')[0];
    set((state) => {
      const hasDedicatedLearner = state.equippedPerks.includes('dedicated_learner');
      const hasLibrary = state.unlockedRooms.includes('library');
      const intelligence = state.special.I || 1;
      const luck = state.special.L || 1;
      
      let multiplier = 1;
      if (hasDedicatedLearner) multiplier += 0.1;
      if (hasLibrary) multiplier += 0.1;
      
      // Intelligence bonus: +2% per point
      multiplier += (intelligence * 0.02);
      
      // Faction bonuses
      if (state.factionId === 'bos') {
        multiplier += 0.1;
      } else if (state.factionId === 'institute') {
        // Institute bonus for Focus (Intelligent learning)
        multiplier += 0.1;
      }

      // Intelligence Synergy: +15% or +30% XP
      if (get().hasSynergy('I', 2)) {
        multiplier += 0.30;
      } else if (get().hasSynergy('I', 1)) {
        multiplier += 0.15;
      }

      // Perception Synergy: +15% XP for vocabulary
      if (source === 'vocabulary' && get().hasSynergy('P', 2)) {
        multiplier += 0.15;
      }

      let finalAmount = Math.floor(amount * multiplier);
      
      const oldLevel = Math.floor(state.xp / 100) + 1;
      const newXp = state.xp + finalAmount;
      const newLevel = Math.floor(newXp / 100) + 1;

      if (newLevel > oldLevel) {
        setTimeout(() => {
          triggerLevelUpEffects();
          const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
          get().addNotification(`${t.level_up || 'LEVEL UP!'} ${t.level || 'Level'} ${newLevel}`, 'success');
          audioService.play(SoundEffect.LEVEL_UP);
        }, 100);
      }
      
      // Luck bonus: 5% chance per point to double XP
      if (Math.random() < (luck * 0.05)) {
        finalAmount *= 2;
        setTimeout(() => get().addNotification('Luck! XP Doubled!', 'success'), 0);
        // Bonus Luck progress for triggering luck
        get().addSpecialProgress('L', 5);
      }

      // Strength (S) progress for gaining XP (effort)
      if (finalAmount >= 50) {
        get().addSpecialProgress('S', 5);
      } else {
        get().addSpecialProgress('S', 1);
      }

      logEvent('xp_gain', { amount: finalAmount, total_xp: state.xp + finalAmount });

      // Play XP gain sound
      audioService.play(SoundEffect.XP_GAIN);

      const isNewDay = state.lastPlayedDate !== today;
      const newDailyProgress = isNewDay ? {
        date: today,
        xpEarned: finalAmount,
        flashcardsReviewed: 0,
        perfectFlashcards: 0,
        lessonsCompleted: 0,
        newWordsLearned: 0,
        videosWatched: 0,
        questsClaimed: []
      } : {
        ...state.dailyProgress,
        xpEarned: (state.dailyProgress.xpEarned || 0) + finalAmount
      };

      return { 
        xp: state.xp + finalAmount,
        factionXp: state.factionId ? state.factionXp + finalAmount : state.factionXp,
        weeklyFactionXp: state.factionId ? state.weeklyFactionXp + finalAmount : state.weeklyFactionXp,
        lastPlayedDate: today,
        daysSurvived: isNewDay ? state.daysSurvived + 1 : state.daysSurvived,
        dailyProgress: newDailyProgress
      };
    });
    setTimeout(() => {
      get().checkAchievements();
      get().triggerSync();
    }, 0);
  },
  watchVideo: () => {
    const today = new Date().toISOString().split('T')[0];
    set((state) => {
      const isNewDay = state.dailyProgress.date !== today;
      const newDailyProgress = isNewDay ? {
        date: today,
        xpEarned: 0,
        flashcardsReviewed: 0,
        perfectFlashcards: 0,
        lessonsCompleted: 0,
        newWordsLearned: 0,
        videosWatched: 1,
        questsClaimed: []
      } : {
        ...state.dailyProgress,
        videosWatched: (state.dailyProgress.videosWatched || 0) + 1
      };

      return { dailyProgress: newDailyProgress };
    });
  },
  updateSpecial: (stat, amount) => set((state) => {
    const currentVal = state.special[stat];
    if (currentVal >= 10) return state; // Max level is 10
    const newVal = Math.min(10, currentVal + amount);
    
    // Reset progress when leveling up
    const newProgress = { ...state.specialProgress, [stat]: 0 };
    
    // Play level up sound
    audioService.play(SoundEffect.LEVEL_UP);
    triggerLevelUpEffects();

    // Notify user
    setTimeout(() => {
      get().addNotification(`Stat Upgrade: ${stat} increased to ${newVal}!`, 'success');
    }, 500);

    const newState = { 
      special: { ...state.special, [stat]: newVal },
      specialProgress: newProgress
    };
    
    if (state.uid) {
      updateDoc(doc(db, 'users', state.uid), newState).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${state.uid}`));
    }
    
    return newState;
  }),

  addSpecialProgress: (stat, amount) => set((state) => {
    const currentProgress = state.specialProgress[stat] || 0;
    const newProgress = currentProgress + amount;
    
    if (newProgress >= 100) {
      // Level up!
      get().updateSpecial(stat, 1);
      return state; // updateSpecial handles the state update
    }
    
    const updatedProgress = { ...state.specialProgress, [stat]: newProgress };
    const newState = { specialProgress: updatedProgress };
    
    if (state.uid) {
      updateDoc(doc(db, 'users', state.uid), newState).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${state.uid}`));
    }
    
    return newState;
  }),
  addCredits: (amount) => {
    audioService.play(SoundEffect.XP_GAIN); // Use XP gain sound for credits too
    set((state) => {
      const charisma = state.special.C || 1;
      const luck = state.special.L || 1;
      
      // ammosmithBonus
      const hasAmmosmith = state.equippedPerks.includes('ammosmith');
      const ammosmithBonus = hasAmmosmith ? 1.4 : 1.0;
      
      const hasDogly = state.equippedPerks.includes('dogly');
      const doglyBonus = hasDogly ? 1.1 : 1.0;
      
      let synergyMultiplier = 1;
      if (get().hasSynergy('C', 2)) {
        synergyMultiplier += 0.30;
      } else if (get().hasSynergy('C', 1)) {
        synergyMultiplier += 0.15;
      }

      let finalAmount = Math.floor(amount * (1 + charisma * 0.05) * ammosmithBonus * doglyBonus * synergyMultiplier);
      
      // Faction bonus: Railroad +15% Credits
      if (state.factionId === 'railroad') {
        finalAmount = Math.floor(finalAmount * 1.15);
      }
      
      // Bonus for winning the previous week
      if (state.factionId === state.factionWinnerId) {
        finalAmount = Math.floor(finalAmount * 1.2); // 20% Caps/Credits bonus
      }
      
      // Luck bonus: 5% chance per point to double Credits
      if (Math.random() < (luck * 0.05)) {
        finalAmount *= 2;
        setTimeout(() => get().addNotification('Luck! Credits Doubled!', 'success'), 0);
      }

      return { credits: state.credits + finalAmount };
    });
    setTimeout(() => {
      get().checkAchievements();
      get().triggerSync();
    }, 0);
  },
  unlockRoom: (roomId, cost) => {
    const state = get();
    if (state.credits >= cost && !state.unlockedRooms.includes(roomId)) {
      const newRooms = [...state.unlockedRooms, roomId];
      const newCollections = { ...state.roomLastCollection, [roomId]: new Date().toISOString() };
      set({
        credits: state.credits - cost,
        unlockedRooms: newRooms,
        roomLastCollection: newCollections
      });
      localStorage.setItem('unlockedRooms', JSON.stringify(newRooms));
      localStorage.setItem('roomLastCollection', JSON.stringify(newCollections));
      get().addNotification(`Room unlocked: ${roomId.replace('_', ' ')}!`, 'success');
      get().triggerSync();
      return true;
    }
    return false;
  },
  collectRoomResource: (roomId) => {
    const state = get();
    const room = CAMPUS_ROOMS.find(r => r.id === roomId);
    if (!room || !room.production) return;

    const lastCollection = state.roomLastCollection[roomId];
    if (!lastCollection) {
      // Initialize if missing
      const newCollections = { ...state.roomLastCollection, [roomId]: new Date().toISOString() };
      set({ roomLastCollection: newCollections });
      localStorage.setItem('roomLastCollection', JSON.stringify(newCollections));
      return;
    }

    const now = new Date();
    const last = new Date(lastCollection);
    const diffSeconds = (now.getTime() - last.getTime()) / 1000;

    if (diffSeconds >= room.production.interval) {
      const { type, amount } = room.production;
      
      // Calculate bonus based on SPECIAL
      let multiplier = 1;
      if (type === 'xp') multiplier += (state.special.I * 0.05);
      if (type === 'credits') multiplier += (state.special.C * 0.05);
      
      const finalAmount = Math.floor(amount * multiplier);

      if (type === 'xp') get().addXp(finalAmount);
      else if (type === 'credits') get().addCredits(finalAmount);
      else if (type === 'kits') set({ medkits: state.medkits + finalAmount });
      else if (type === 'food') set({ cognitiveLoad: Math.min(100, state.cognitiveLoad + finalAmount) });
      else if (type === 'water') set({ hydrationLevel: Math.min(100, state.hydrationLevel + finalAmount) });

      const newCollections = { ...state.roomLastCollection, [roomId]: now.toISOString() };
      set({ roomLastCollection: newCollections });
      localStorage.setItem('roomLastCollection', JSON.stringify(newCollections));
      
      audioService.play(SoundEffect.SUCCESS);
      get().addNotification(`Collected ${finalAmount} ${type} from ${roomId.replace('_', ' ')}!`, 'success');
    }
  },
  useEnergy: (source?: 'electronic' | 'story' | 'chat') => {
    set((state) => {
      const endurance = state.special.E || 1;
      const hasAllNightLong = state.equippedPerks.includes('all_night_long');
      const hasBatteriesIncluded = state.equippedPerks.includes('batteries_included');
      const hasBearArms = state.equippedPerks.includes('bear_arms');
      const hasWastelandCharmer = state.equippedPerks.includes('wasteland_charmer');
      
      // Endurance bonus: -5% depletion per point, plus 20% reduction from All Night Long
      const baseDepletion = 1 - (endurance * 0.05);
      let depletionMultiplier = hasAllNightLong ? baseDepletion * 0.8 : baseDepletion;
      
      // Strength Synergy: -15% energy cost at Tier 1, -30% at Tier 2
      if (get().hasSynergy('S', 2)) {
        depletionMultiplier *= 0.7;
      } else if (get().hasSynergy('S', 1)) {
        depletionMultiplier *= 0.85;
      }

      // Endurance Synergy: -20% fatigue at Tier 1, -40% at Tier 2
      if (get().hasSynergy('E', 2)) {
        depletionMultiplier *= 0.6;
      } else if (get().hasSynergy('E', 1)) {
        depletionMultiplier *= 0.8;
      }

      // Faction bonus: Minutemen -20% depletion
      if (state.factionId === 'minutemen') {
        depletionMultiplier *= 0.8;
      }

      // New perk reductions
      if (source === 'electronic' && hasBatteriesIncluded) {
        depletionMultiplier *= 0.7; // 30% reduction
      } else if (source === 'story' && hasBearArms) {
        depletionMultiplier *= 0.7; // 30% reduction
      } else if (source === 'chat' && hasWastelandCharmer) {
        depletionMultiplier *= 0.85; // 15% reduction
      }
      
      const newCognitiveLoad = Math.max(0, state.cognitiveLoad - (2 * depletionMultiplier));
      const newHydrationLevel = Math.max(0, state.hydrationLevel - (3 * depletionMultiplier));
      
      let healthLoss = 0;
      if (newCognitiveLoad === 0) healthLoss += 2;
      if (newHydrationLevel === 0) healthLoss += 3;
      
      const newHealth = Math.max(0, state.health - healthLoss);
      
      if (healthLoss > 0) {
        setTimeout(() => {
          get().addNotification(
            newCognitiveLoad === 0 && newHydrationLevel === 0 ? 'Cognitive Exhaustion and Dehydration! Performance dropping.' :
            newCognitiveLoad === 0 ? 'Cognitive Exhaustion! Performance dropping.' : 'Dehydration! Performance dropping.',
            'warning'
          );
        }, 0);
      }

      return { 
        cognitiveLoad: newCognitiveLoad, 
        hydrationLevel: newHydrationLevel,
        health: newHealth
      };
    });
  },

  consumeItem: (type) => {
    set((state) => {
      const cost = 15;
      if (state.credits < cost) {
        setTimeout(() => get().addNotification('Not enough credits! Need 15.', 'error'), 0);
        return state;
      }
      
      if (type === 'food') {
        audioService.play(SoundEffect.EAT);
        const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
        get().addNotification(`${t.cognitive_load_restored || 'Consumed Neuro-Fuel. Focus improved!'}`, 'success');
        return { 
          cognitiveLoad: Math.min(100, state.cognitiveLoad + 40),
          credits: state.credits - cost
        };
      } else {
        audioService.play(SoundEffect.DRINK);
        const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
        get().addNotification(`${t.hydration_restored || 'Hydration Optimal. Efficiency restored!'}`, 'success');
        logEvent('consume_item', { type });
        
        let hydrationAmount = 40;
        if (state.equippedPerks.includes('dromedary')) hydrationAmount = 60;
        
        const newState = { 
          hydrationLevel: Math.min(100, state.hydrationLevel + hydrationAmount),
          credits: state.credits - cost
        };
        get().triggerSync();
        return newState;
      }
    });
  },
  useMedkit: () => {
    set((state) => {
      if (state.health >= 100) return state;
      
      // Endurance (E) progress for medical treatment
      get().addSpecialProgress('E', 5);

      if (state.isPremium) {
        return { health: 100 };
      }

      if (state.medkits > 0) {
        audioService.play(SoundEffect.STIMPAK);
        
        let healAmount = 50;
        if (state.equippedPerks.includes('e_m_t')) healAmount = 60;
        if (state.equippedPerks.includes('chem_fiend')) healAmount = Math.floor(healAmount * 1.5);
        if (state.factionId === 'enclave') healAmount += 20;

        const newState: any = { 
          medkits: state.medkits - 1,
          health: Math.min(100, state.health + healAmount)
        };

        // Dry Nurse perk: 50% chance to satisfy hunger/thirst
        if (state.equippedPerks.includes('dry_nurse') && Math.random() < 0.5) {
          newState.cognitiveLoad = Math.min(100, state.cognitiveLoad + 40);
          newState.hydrationLevel = Math.min(100, state.hydrationLevel + 40);
          const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
          get().addNotification(t.dry_nurse_triggered || 'Dry Nurse: Hunger and thirst satisfied!', 'success');
        }

        get().triggerSync();
        return newState;
      }
      return state;
    });
  },
  heal: () => {
    get().useMedkit();
  },
  takeDamage: (amount) => {
    let died = false;
    let prevented = false;
    set((state) => {
      if (state.isPremium) {
        prevented = true;
        return state;
      }

      const hasLeadBelly = state.equippedPerks.includes('lead_belly');
      const hasResilientLearner = state.equippedPerks.includes('resilient_learner');
      const hasTrainingRoom = state.unlockedRooms.includes('training_room');
      const strength = state.special.S || 1;
      
      let finalAmount = amount;
      
      // Luck Synergy: chance to ignore damage
      let ignoreChance = 0;
      if (get().hasSynergy('L', 2)) ignoreChance = 0.15;
      else if (get().hasSynergy('L', 1)) ignoreChance = 0.05;

      if (Math.random() < ignoreChance) {
        prevented = true;
        setTimeout(() => get().addNotification('Luck! Damage ignored!', 'success'), 0);
        return state;
      }

      if (hasTrainingRoom) finalAmount = Math.floor(finalAmount * 0.85);
      if (state.equippedPerks.includes('class_freak')) finalAmount = Math.floor(finalAmount * 0.25);
      
      // Strength bonus: -2% damage per point
      finalAmount = Math.floor(finalAmount * (1 - strength * 0.02));

      // Endurance Synergy: -20% inactivity damage reduction at Tier 1, -40% at Tier 2
      if (get().hasSynergy('E', 2)) {
        finalAmount = Math.floor(finalAmount * 0.6);
      } else if (get().hasSynergy('E', 1)) {
        finalAmount = Math.floor(finalAmount * 0.8);
      }

      // Intelligence Synergy: +20% DR when at low HP (Tier 2)
      if (get().hasSynergy('I', 2) && state.health < 25) {
        finalAmount = Math.floor(finalAmount * 0.8);
        setTimeout(() => get().addNotification('NERD RAGE! Resistance increased.', 'info'), 0);
      }

      const newHealth = Math.max(0, state.health - finalAmount);

      // Luck Synergy: Stay at 1 HP instead of dying
      if (newHealth <= 0 && get().hasSynergy('L', 2)) {
        if (Math.random() < 0.15) {
          get().addNotification('PHANTOM! The Reaper spared you from burnout!', 'success');
          return { health: 1 };
        }
      } else if (newHealth <= 0 && get().hasSynergy('L', 1)) {
        if (Math.random() < 0.05) {
          get().addNotification('PHEW! Sheer luck saved you from burnout!', 'success');
          return { health: 1 };
        }
      }

      return { health: newHealth };
    });
    return { died, prevented };
  },
  checkDailyStreak: () => {
    const state = get();
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if already claimed today
    if (state.lastClaimedLoginDate === todayStr) return;

    if (!state.lastPlayedDate) {
      set({ lastClaimedLoginDate: todayStr, loginStreak: 1 });
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastPlayed = new Date(state.lastPlayedDate);
    lastPlayed.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - lastPlayed.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    
    let newStreak = state.loginStreak || 1;

    if (diffDays === 1) {
      // Consecutive day
      newStreak += 1;
    } else if (diffDays > 1) {
      // Missed days
      if (state.isPremium && !state.hasUsedMonthlyRepair) {
        set({ hasUsedMonthlyRepair: true });
        localStorage.setItem('hasUsedMonthlyRepair', 'true');
        get().addNotification('Premium Streak Repair used! Your streak is safe.', 'success');
        newStreak += 1; // Keep streak alive
      } else {
        const damage = (diffDays - 1) * 30; // 30 damage per missed day
        const { prevented } = get().takeDamage(damage);
        if (!prevented) {
          const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
          get().addNotification(`${t.inactivity_damage || 'You lost HP due to inactivity!'} (${damage})`, 'error');
        }
        newStreak = 1; // Reset streak
      }
    } else if (diffDays === 0) {
      // Already checked or same day login
      return;
    } else {
      newStreak = 1;
    }
    
    // Rewards calculation
    const baseXP = 50;
    const streakBonusXP = Math.min(500, (newStreak - 1) * 20);
    const totalXP = baseXP + streakBonusXP;
    
    let medkitsReward = 1;
    if (newStreak % 7 === 0) medkitsReward = 2; // Weekly bonus
    if (newStreak % 30 === 0) medkitsReward = 4; // Monthly bonus

    // Action Boy Bonus
    if (state.equippedPerks.includes('action_boy')) {
      medkitsReward += 1;
    }

    // Apply rewards
    get().addXp(totalXP, 'Daily Login');
    get().addSpecialProgress('E', 5);
    
    set((s) => ({ 
      medkits: Math.min(10, s.medkits + medkitsReward),
      loginStreak: newStreak,
      lastClaimedLoginDate: todayStr,
      showLoginBonus: true
    }));

    // Trigger visual effects
    setTimeout(() => {
      triggerLevelUpEffects();
      const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
      get().addNotification(`${t.daily_login_reward || 'Daily Login'}: Day ${newStreak}! +${totalXP} XP, +${medkitsReward} Medkits!`, 'success');
      get().updateWeather();
    }, 500);
  },
  checkAchievements: () => {
    const state = get();
    const { xp, daysSurvived, completedLessons, savedExamples, credits, flashcardProgress, perfectLessonsCount, achievements } = state;
    
    const masteredWords = Object.values(flashcardProgress).filter(p => p.mastered).length;
    const currentLevel = Math.floor(xp / 100) + 1;
    
    const stats: Record<string, number> = {
      streak: daysSurvived,
      xp: xp,
      words: masteredWords,
      lessons: completedLessons.length,
      examples: savedExamples.length,
      perfect_lessons: perfectLessonsCount,
      credits: credits,
      level: currentLevel
    };
    
    let updated = false;
    const newAchievements = { ...achievements };
    
    ACHIEVEMENTS.forEach(achievement => {
      const currentStat = stats[achievement.type];
      if (currentStat === undefined) return;
      
      const currentTier = achievements[achievement.id] || 0;
      let nextTier = currentTier;
      
      achievement.tiers.forEach(tier => {
        if (currentStat >= tier.requirement && tier.level > nextTier) {
          nextTier = tier.level;
        }
      });
      
      if (nextTier > currentTier) {
        newAchievements[achievement.id] = nextTier;
        updated = true;
        const tierLabel = achievement.tiers.find(t => t.level === nextTier)?.label;
        get().addNotification(`Achievement Unlocked: ${tierLabel}!`, 'success');
        audioService.play(SoundEffect.LEVEL_UP);
        triggerLevelUpEffects();
      }
    });
    
    if (updated) {
      set({ achievements: newAchievements });
      localStorage.setItem('achievements', JSON.stringify(newAchievements));
      if (state.uid) {
        updateDoc(doc(db, 'users', state.uid), { achievements: newAchievements }).catch(e => handleFirestoreError(e, OperationType.UPDATE, 'users'));
      }
    }
  },
  setTargetLang: (lang) => {
    localStorage.setItem('targetLang', lang);
    set({ targetLang: lang });
  },
  setUiLang: (lang) => {
    localStorage.setItem('uiLang', lang);
    set({ uiLang: lang });
  },
  setDefaultReminderType: (type) => {
    localStorage.setItem('defaultReminderType', type);
    set({ defaultReminderType: type });
    get().triggerSync();
  },
  togglePerk: (perkId) => {
    set((state) => {
      if (state.equippedPerks.includes(perkId)) {
        const newState = { equippedPerks: state.equippedPerks.filter(id => id !== perkId) };
        setTimeout(() => get().saveProgress(state.uid || ''), 0);
        return newState;
      }
      if (state.equippedPerks.length >= 3) return state;
      if (!state.unlockedPerks.includes(perkId)) return state;
      const newState = { equippedPerks: [...state.equippedPerks, perkId] };
      setTimeout(() => get().saveProgress(state.uid || ''), 0);
      return newState;
    });
  },
  buyPerk: (perkId, cost) => {
    try {
      const state = get();
      if (state.credits < cost) {
        throw new ValidationError(`Insufficient credits. You need ${cost - state.credits} more.`);
      }
      if (state.unlockedPerks.includes(perkId)) return true;

      set((state) => ({
        credits: state.credits - cost,
        unlockedPerks: [...state.unlockedPerks, perkId]
      }));
      get().saveProgress(state.uid || '');
      return true;
    } catch (err) {
      handleAppError(err, get().addNotification);
      return false;
    }
  },
  addNotification: (message, type = 'info') => set((state) => {
    const id = Date.now().toString() + Math.random().toString();
    
    // Play notification sound
    if (type === 'error') {
      audioService.play(SoundEffect.ERROR);
    } else {
      audioService.play(SoundEffect.NOTIFICATION);
    }

    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) }));
    }, 4000);
    return { notifications: [...state.notifications, { id, message, type }] };
  }),

  addCustomWord: (word, translation, transcription = '') => {
    const { targetLang, uiLang } = get();
    const newWord = {
      id: Date.now(),
      word,
      translation,
      translations: { [uiLang]: translation },
      transcription,
      isCustom: true
    };

    set((state) => {
      const currentCustom = state.customWords[targetLang] || [];
      const updatedCustom = {
        ...state.customWords,
        [targetLang]: [...currentCustom, newWord]
      };
      localStorage.setItem('customWords', JSON.stringify(updatedCustom));
      
      // Update cloud progress if logged in
      if (state.uid) {
        state.saveProgress(state.uid);
      }
      
      return { customWords: updatedCustom };
    });

    const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
    get().addNotification(t.word_added_success || 'Word added successfully!', 'success');
  },
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  completeLesson: (lessonId, isPerfect) => set((state) => {
    logEvent('lesson_complete', { lesson_id: lessonId, is_perfect: isPerfect });
    
    // Play success sound
    audioService.play(SoundEffect.SUCCESS);

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = state.dailyProgress.date !== today;
    const newDailyProgress = isNewDay ? {
      date: today,
      xpEarned: 0,
      flashcardsReviewed: 0,
      perfectFlashcards: 0,
      lessonsCompleted: 1,
      newWordsLearned: 0,
      videosWatched: 0,
      questsClaimed: []
    } : {
      ...state.dailyProgress,
      lessonsCompleted: (state.dailyProgress.lessonsCompleted || 0) + 1
    };

    const alreadyCompleted = state.completedLessons.includes(lessonId);

    const newState = { 
      completedLessons: alreadyCompleted ? state.completedLessons : [...state.completedLessons, lessonId],
      dailyProgress: newDailyProgress,
      perfectLessonsCount: isPerfect ? state.perfectLessonsCount + 1 : state.perfectLessonsCount,
      universityPopulation: isPerfect && (state.perfectLessonsCount + 1) % 5 === 0 ? state.universityPopulation + 1 : state.universityPopulation
    };

    // Faction-specific lesson completion rewards could go here
    
    if (isPerfect && (state.perfectLessonsCount + 1) % 5 === 0) {
      get().addNotification('A new student has arrived at the Vault!', 'success');
    }

    // Anti-Epidemic Perk
    if (state.equippedPerks.includes('anti_epidemic') && Math.random() < 0.5) {
      setTimeout(() => {
        const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
        get().addNotification(t.anti_epidemic_trigger || 'Anti-Epidemic: Energy restored!', 'success');
        set(s => ({
          cognitiveLoad: Math.min(100, s.cognitiveLoad + 20),
          hydrationLevel: Math.min(100, s.hydrationLevel + 20)
        }));
      }, 500);
    }

    // Can Do! Perk
    if (state.equippedPerks.includes('can_do') && Math.random() < 0.4) {
      setTimeout(() => {
        const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
        get().addNotification(t.can_do_trigger || 'Can Do!: Found a can of food!', 'success');
        set(s => ({
          cognitiveLoad: Math.min(100, s.cognitiveLoad + 15)
        }));
      }, 700);
    }
    
    // Increase Intelligence and Perception on lesson completion
    get().addSpecialProgress('I', 15);
    get().addSpecialProgress('E', 5); // Endurance for finishing a full lesson
    if (isPerfect) {
      get().addSpecialProgress('P', 10);
      get().addSpecialProgress('L', 5);
    }
    get().updateWeather();
    
    setTimeout(() => {
      get().checkAchievements();
      get().triggerSync();
    }, 0);
    return newState;
  }),

  completeMiniLesson: (lessonId) => set((state) => {
    if (state.completedMiniLessons.includes(lessonId)) return state;
    
    // Charisma (C) and Intelligence (I) for mini lessons
    get().addSpecialProgress('C', 10);
    get().addSpecialProgress('I', 5);

    const newState = {
      completedMiniLessons: [...state.completedMiniLessons, lessonId]
    };
    get().triggerSync();
    return newState;
  }),

  calculateNextInterval: (wordId: string, lang: string, quality: number) => {
    const state = get();
    const key = `${lang}_${wordId}`;
    const allWords = WORDS_BY_LANG[lang] || [];
    const wordObj = allWords.find(w => w.id === Number(wordId));
    const wordText = wordObj ? wordObj.word : '';

    const current = state.flashcardProgress[key] || { 
      interval: 0, 
      stability: 1,
      difficulty: 5,
      lastReviewed: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(), 
      correctStreak: 0, 
      lapses: 0,
      sessionFailures: 0,
      mastered: false,
      easeFactor: 2.5
    };
    
    const context = {
      special: state.special,
      sessionReviews: state.sessionReviews || 0,
      dailyReviews: state.dailyProgress.flashcardsReviewed || 0,
      equippedPerks: state.equippedPerks,
      synergies: get().getActiveSynergies().map(s => s.stat),
      sessionStartTime: state.sessionStartTime,
      currentMistakeStreak: state.currentMistakeStreak,
      cognitiveLoad: state.cognitiveLoad,
      hydrationLevel: state.hydrationLevel,
      weather: state.weather
    };

    const updated = SRSService.calculateUpdate(current, quality, wordText, context);
    return updated.interval;
  },
  updateFlashcardProgress: (wordId, lang, quality) => set((state) => {
    const key = `${lang}_${wordId}`;
    const allWords = WORDS_BY_LANG[lang] || [];
    const wordObj = allWords.find(w => w.id === Number(wordId));
    const wordText = wordObj ? wordObj.word : '';

    const current = state.flashcardProgress[key] || { 
      interval: 0, 
      stability: 1,
      difficulty: 5,
      lastReviewed: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(), 
      correctStreak: 0, 
      lapses: 0,
      sessionFailures: 0,
      mastered: false,
      easeFactor: 2.5
    };
    
    const context = {
      special: state.special,
      sessionReviews: state.sessionReviews || 0,
      dailyReviews: state.dailyProgress.flashcardsReviewed || 0,
      equippedPerks: state.equippedPerks,
      sessionStartTime: state.sessionStartTime,
      currentMistakeStreak: state.currentMistakeStreak
    };

    const updatedStats = SRSService.calculateUpdate(current, quality, wordText, {
      ...context,
      cognitiveLoad: state.cognitiveLoad,
      hydrationLevel: state.hydrationLevel,
      weather: state.weather
    });

    // Notify user about intelligent scheduling factors
    const circadian = SRSService.getCircadianFactor(new Date().getHours(), state.weather);
    const fatigue = SRSService.getFatigueMultiplier({ 
      ...context, 
      cognitiveLoad: state.cognitiveLoad, 
      hydrationLevel: state.hydrationLevel, 
      weather: state.weather 
    });

    const isHeroic = quality >= 4 && (fatigue < 0.4 || circadian < 0.4);
    if (isHeroic) {
      setTimeout(() => {
        const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
        get().addNotification(t.heroic_recall || 'Heroic Recall! Memory reinforced under stress.', 'success');
      }, 300);
    }

    // Fatigue mitigation check
    if (fatigue < 0.6 && state.special.E > 5) {
      // If Endurance is high, show that it helped
      setTimeout(() => {
        const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
        get().addNotification(t.fatigue_mitigated || 'Fatigue Penalty Mitigated by Endurance.', 'info');
      }, 800);
    }
    
    const newProgress = {
      ...state.flashcardProgress,
      [key]: {
        ...updatedStats
      }
    };

    // Increase XP and Credits
    let xpGain = quality >= 3 ? 10 + (state.special.I * 2) : 2;
    if (state.equippedPerks.includes('dedicated_learner')) {
      xpGain = Math.round(xpGain * 1.1);
    }
    const creditsGain = quality >= 4 ? 5 + (state.special.C) : 0;

    // Add SPECIAL progress
    get().addSpecialProgress('A', 3);
    if (quality === 5) {
      get().addSpecialProgress('A', 2); // Bonus Agility for perfect recall
      get().addSpecialProgress('L', 2);
    } else if (quality >= 4) {
      get().addSpecialProgress('L', 1);
    }

    // Add to mistakes bank if quality is low
    if (quality < 3) {
      get().addMistake(wordId, lang);
    }

    const today = new Date().toISOString().split('T')[0];
    const isNewDay = state.dailyProgress.date !== today;
    const isNewWord = !current.correctStreak;
    logEvent('flashcard_review', { word_id: wordId, quality, is_new: isNewWord });
    
    const newDailyProgress = isNewDay ? {
      date: today,
      xpEarned: xpGain,
      flashcardsReviewed: 1,
      perfectFlashcards: quality === 5 ? 1 : 0,
      lessonsCompleted: 0,
      newWordsLearned: isNewWord ? 1 : 0,
      videosWatched: 0,
      questsClaimed: []
    } : {
      ...state.dailyProgress,
      xpEarned: state.dailyProgress.xpEarned + xpGain,
      flashcardsReviewed: state.dailyProgress.flashcardsReviewed + 1,
      perfectFlashcards: state.dailyProgress.perfectFlashcards + (quality === 5 ? 1 : 0),
      newWordsLearned: state.dailyProgress.newWordsLearned + (isNewWord ? 1 : 0)
    };

    const newState = { 
      flashcardProgress: newProgress,
      dailyProgress: newDailyProgress,
      sessionReviews: state.sessionReviews + 1,
      currentMistakeStreak: quality < 3 ? state.currentMistakeStreak + 1 : 0,
      xp: state.xp + xpGain,
      credits: state.credits + creditsGain,
      cognitiveLoad: quality === 5 && get().hasSynergy('L', 2) && Math.random() < 0.1 ? 100 : state.cognitiveLoad,
      hydrationLevel: quality === 5 && get().hasSynergy('L', 2) && Math.random() < 0.1 ? 100 : state.hydrationLevel
    };

    if (newState.cognitiveLoad === 100 && state.cognitiveLoad < 100) {
      setTimeout(() => {
        get().addNotification('MIRACLE! Luck Synergy restored your energy!', 'success');
      }, 500);
    }
    
    saveFlashcardProgress(newProgress);
    setTimeout(() => {
      get().checkAchievements();
      get().triggerSync();
    }, 0);
    return newState;
  }),

  resetFlashcardProgress: (wordId, lang) => set((state) => {
    const key = `${lang}_${wordId}`;
    const newProgress = { ...state.flashcardProgress };
    if (newProgress[key]) {
      newProgress[key] = {
        ...newProgress[key],
        correctStreak: 0,
        mastered: false,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString()
      };
    }
    saveFlashcardProgress(newProgress);
    get().triggerSync();
    return { flashcardProgress: newProgress };
  }),
  recordChatMessage: (hasFeedback) => {
    set((state) => {
      const now = Date.now();
      const lastTs = state.chatMetrics.lastMessageTimestamp;
      let responseTime = 0;
      if (lastTs) {
        responseTime = now - lastTs;
      }
      
      const newMetrics = {
        totalMessages: state.chatMetrics.totalMessages + 1,
        feedbackCount: hasFeedback ? state.chatMetrics.feedbackCount + 1 : state.chatMetrics.feedbackCount,
        totalResponseTime: state.chatMetrics.totalResponseTime + responseTime,
        lastMessageTimestamp: now
      };
      
      localStorage.setItem('chatMetrics', JSON.stringify(newMetrics));
      return { chatMetrics: newMetrics };
    });
  },
  saveExample: (word, example, targetLang) => set((state) => {
    const exists = state.savedExamples.some(ex => ex.sentence === example.sentence);
    if (exists) return state;
    const newExamples = [...state.savedExamples, { 
      word, 
      sentence: example.sentence, 
      translation: example.translation, 
      targetLang, 
      source: example.source, 
      sourceName: example.sourceName 
    }];
    localStorage.setItem('savedExamples', JSON.stringify(newExamples));
    setTimeout(() => {
      get().checkAchievements();
      get().triggerSync();
    }, 0);
    return { savedExamples: newExamples };
  }),

  removeExample: (sentence) => set((state) => {
    const newExamples = state.savedExamples.filter(ex => ex.sentence !== sentence);
    localStorage.setItem('savedExamples', JSON.stringify(newExamples));
    get().triggerSync();
    return { savedExamples: newExamples };
  }),

  resetSessionReviews: () => set({ 
    sessionReviews: 0, 
    sessionStartTime: Date.now(),
    currentMistakeStreak: 0
  }),
  rest: () => {
    set((state) => ({
      sessionReviews: 0,
      sessionStartTime: Date.now(),
      currentMistakeStreak: 0,
      health: Math.min(100, state.health + 15),
      cognitiveLoad: Math.min(100, state.cognitiveLoad + 10),
      hydrationLevel: Math.min(100, state.hydrationLevel + 10)
    }));
    get().addNotification('You rested in your shelter. Fatigue cleared!', 'success');
  },

  setMnemonicImageUrl: (wordId, lang, url) => set((state) => {
    const key = `${lang}_${wordId}`;
    const progress = state.flashcardProgress[key];
    if (!progress) return state;
    
    const newProgress = {
      ...state.flashcardProgress,
      [key]: {
        ...progress,
        mnemonicImageUrl: url
      }
    };
    localStorage.setItem(`flashcard_progress_${state.uid || 'local'}`, JSON.stringify(newProgress));
    get().triggerSync();
    return { flashcardProgress: newProgress };
  }),

  addMistake: (wordId, lang) => set((state) => {
    const key = `${lang}_${wordId}`;
    if (state.mistakes[key]) return state;
    
    const newMistakes = {
      ...state.mistakes,
      [key]: { wordId, lang, repairCount: 0 }
    };
    saveMistakes(newMistakes);
    get().triggerSync();
    return { mistakes: newMistakes };
  }),

  repairMistake: (wordId, lang, success) => set((state) => {
    const key = `${lang}_${wordId}`;
    const mistake = state.mistakes[key];
    if (!mistake) return state;

    let newMistakes = { ...state.mistakes };
    if (success) {
      // Perception (P) and Intelligence (I) progress on successful repair
      get().addSpecialProgress('P', 10);
      get().addSpecialProgress('I', 2);
      
      const newCount = mistake.repairCount + 1;
      if (newCount >= 3) {
        delete newMistakes[key];
        get().addXp(5); // Small reward for repairing
        get().addCredits(2);
        
        // Intelligence bonus for mastering word
        get().addSpecialProgress('I', 10);
        
        // Check if bank is now empty for bonus
        if (Object.keys(newMistakes).length === 0) {
          get().addXp(100);
          get().addCredits(50);
          get().addNotification('SYSTEM FULLY REPAIRED! Bonus XP and Credits awarded.', 'success');
          audioService.play(SoundEffect.LEVEL_UP);
        } else {
          const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
          get().addNotification(`${t.mistake_repaired || 'Terminal Repaired! Word mastered.'}`, 'success');
        }
      } else {
        newMistakes[key] = { ...mistake, repairCount: newCount, lastAttemptDate: new Date().toISOString() };
      }
    } else {
      // Strength (S) progress on failure (learning from mistakes)
      get().addSpecialProgress('S', 2);
      
      // Reset progress on failure
      newMistakes[key] = { ...mistake, repairCount: 0, lastAttemptDate: new Date().toISOString() };
    }

    saveMistakes(newMistakes);
    get().triggerSync();
    return { mistakes: newMistakes };
  }),

  checkNewDay: () => set((state) => {
    const today = new Date().toISOString().split('T')[0];
    if (state.dailyProgress.date !== today) {
      // Endurance (E) for surviving a new day
      get().addSpecialProgress('E', 25);
    }

    return {
      dailyProgress: {
        date: today,
        xpEarned: 0,
        flashcardsReviewed: 0,
        perfectFlashcards: 0,
        lessonsCompleted: 0,
        newWordsLearned: 0,
        videosWatched: 0,
        questsClaimed: []
      }
    };
  }),

  claimQuestReward: (questId, reward) => set((state) => {
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = state.dailyProgress.date !== today;
    
    if (state.dailyProgress.questsClaimed.includes(questId)) {
      return state; // Already claimed
    }

    // Charisma (C) and Luck (L) progress on quest claim
    get().addSpecialProgress('C', 20);
    get().addSpecialProgress('L', 5);

    const hasDedicatedLearner = state.equippedPerks.includes('dedicated_learner');
    const finalXpReward = hasDedicatedLearner ? Math.floor(reward * 1.1) : reward;

    const baseProgress = isNewDay ? {
      date: today,
      xpEarned: 0,
      flashcardsReviewed: 0,
      perfectFlashcards: 0,
      lessonsCompleted: 0,
      newWordsLearned: 0,
      videosWatched: 0,
      questsClaimed: []
    } : state.dailyProgress;

    const newDailyProgress = {
      ...baseProgress,
      xpEarned: (baseProgress.xpEarned || 0) + finalXpReward,
      questsClaimed: [...baseProgress.questsClaimed, questId]
    };

    logEvent('quest_claim', { quest_id: questId, reward });
    // Use setTimeout for notification to avoid side effects during state update
    setTimeout(() => {
      const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
      get().addNotification(`${t.quest_completed || 'Quest Completed!'} +${finalXpReward} ${t.xp || 'XP'}, +${reward} ${t.credits || 'Credits'}`, 'success');
    }, 0);

    return {
      xp: state.xp + finalXpReward,
      credits: state.credits + reward,
      lastPlayedDate: today,
      daysSurvived: isNewDay ? state.daysSurvived + 1 : state.daysSurvived,
      dailyProgress: newDailyProgress
    };
  }),

  toggleVisualEffects: () => {
    set((state) => {
      const newValue = !state.visualEffects;
      localStorage.setItem('visualEffects', String(newValue));
      return { visualEffects: newValue };
    });
  },

  toggleCrtMode: () => {
    set((state) => {
      const newValue = !state.crtMode;
      localStorage.setItem('crtMode', String(newValue));
      return { crtMode: newValue };
    });
  },

  setTheme: (theme: 'classic' | 'amber' | 'modern') => {
    localStorage.setItem('theme', theme);
    // If setting to classic or amber, we usually want CRT mode on
    // If modern, we might want it off
    const crtMode = theme !== 'modern';
    localStorage.setItem('crtMode', String(crtMode));
    set({ theme, crtMode });
  },

  addTask: (title: string, dueDate: string, priority: TaskPriority = 'medium', xpReward?: number, reminderType?: ReminderType, category: TaskCategory = 'other') => {
    try {
      if (!title?.trim()) {
        throw new ValidationError('A task needs a title to be recorded in the archives.');
      }
      if (!dueDate) {
        throw new ValidationError('A completion date must be specified for this operation.');
      }

      const newTask: Task = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        dueDate,
        completed: false,
        status: 'todo',
        category,
        xpReward: xpReward ?? (priority === 'high' ? 50 : priority === 'medium' ? 25 : 15),
        priority,
        reminderType: reminderType ?? get().defaultReminderType,
        reminderSent: false,
        progress: 0,
      };
      
      set((state) => ({ tasks: [...state.tasks, newTask] }));
      setTimeout(() => get().triggerSync(), 0);
    } catch (err) {
      handleAppError(err, get().addNotification);
    }
  },

  updateTaskReminder: (taskId: string, reminderType: ReminderType) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, reminderType, reminderSent: false } : t)
  })),

  updateTask: (taskId: string, updates: Partial<Task>) => set((state) => {
    const updatedTasks = state.tasks.map(t => {
      if (t.id === taskId) {
        const newTask = { 
          ...t, 
          ...updates, 
          reminderSent: updates.reminderType !== undefined ? false : (updates.dueDate !== undefined ? false : t.reminderSent) 
        };
        if (updates.status) {
          newTask.completed = updates.status === 'completed';
        }
        return newTask;
      }
      return t;
    });
    setTimeout(() => get().triggerSync(), 0);
    return { tasks: updatedTasks };
  }),

  updateTaskStatus: (taskId: string, status: TaskStatus) => {
    const state = get();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (status === 'completed' && !task.completed) {
      get().completeTask(taskId);
    } else {
      set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === taskId ? { 
            ...t, 
            status, 
            completed: status === 'completed',
            progress: status === 'completed' ? 100 : (status === 'in_progress' && t.progress === 0 ? 10 : t.progress)
          } : t
        )
      }));
      setTimeout(() => get().triggerSync(), 0);
    }
  },

  updateTaskProgress: (taskId: string, progress: number) => {
    set((state) => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          const newProgress = Math.min(100, Math.max(0, progress));
          const isCompleted = newProgress === 100;
          
          if (isCompleted && !t.completed) {
            // We use setTimeout to avoid calling completeTask during set()
            setTimeout(() => get().completeTask(taskId), 0);
            return t;
          }

          return { 
            ...t, 
            progress: newProgress,
            status: isCompleted ? 'completed' : (newProgress > 0 ? 'in_progress' : 'todo'),
            completed: isCompleted
          };
        }
        return t;
      })
    }));
    setTimeout(() => get().triggerSync(), 0);
  },

  checkReminders: () => {
    const state = get();
    const now = new Date();
    const updatedTasks: Task[] = [];
    let hasChanges = false;
    const notificationsToPush: string[] = [];

    const tasks = state.tasks.map(task => {
      if (task.completed || task.reminderType === 'none' || task.reminderSent) {
        return task;
      }

      const dueDate = new Date(task.dueDate);
      let reminderTime: Date | null = null;

      switch (task.reminderType) {
        case 'at_due_date':
          reminderTime = dueDate;
          break;
        case '1_day_before':
          reminderTime = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '1_hour_before':
          reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000);
          break;
      }

      if (reminderTime && now >= reminderTime) {
        const uiLang = state.uiLang;
        const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
        const message = `${t.reminder || 'Reminder'}: ${task.title}`;
        notificationsToPush.push(message);
        hasChanges = true;
        return { ...task, reminderSent: true };
      }

      return task;
    });

    if (hasChanges) {
      set({ tasks });
      notificationsToPush.forEach(msg => state.addNotification(msg, 'warning'));
      if (state.uid) {
        state.saveProgress(state.uid);
      }
    }
  },

  completeTask: (taskId) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return state;

    const updatedTasks = state.tasks.map(t => 
      t.id === taskId ? { ...t, completed: true, status: 'completed' as TaskStatus, progress: 100 } : t
    );

    get().addXp(task.xpReward);
    audioService.play(SoundEffect.SUCCESS);
    const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
    get().addNotification(`${t.task_completed || 'Task Completed'}: ${task.title}! +${task.xpReward} ${t.xp || 'XP'}`, 'success');

    const newState = { tasks: updatedTasks };
    setTimeout(() => get().triggerSync(), 0);
    return newState;
  }),

  removeTask: (taskId) => set((state) => {
    const newState = { tasks: state.tasks.filter(t => t.id !== taskId) };
    setTimeout(() => get().triggerSync(), 0);
    return newState;
  }),

  addChatMessage: (sessionId, message) => set((state) => {
    if (message.role === 'user') {
      get().addSpecialProgress('C', 2);
    }
    const chatSessions = state.chatSessions.map(s => 
      s.id === sessionId ? { 
        ...s, 
        messages: [...s.messages, message],
        timestamp: new Date().toISOString()
      } : s
    );
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    setTimeout(() => get().triggerSync(), 0);
    return { chatSessions };
  }),

  createNewChatSession: (title, initialMessages = []) => {
    const id = Date.now().toString();
    const newSession: ChatSession = {
      id,
      title,
      timestamp: new Date().toISOString(),
      messages: initialMessages,
      targetLang: get().targetLang,
      uiLang: get().uiLang
    };
    set((state) => {
      const chatSessions = [newSession, ...state.chatSessions];
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
      localStorage.setItem('currentSessionId', id);
      return { chatSessions, currentSessionId: id };
    });
    setTimeout(() => get().triggerSync(), 0);
    return id;
  },

  deleteChatSession: (sessionId) => set((state) => {
    const chatSessions = state.chatSessions.filter(s => s.id !== sessionId);
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    const currentSessionId = state.currentSessionId === sessionId ? null : state.currentSessionId;
    if (currentSessionId === null) {
      localStorage.removeItem('currentSessionId');
    } else {
      localStorage.setItem('currentSessionId', currentSessionId);
    }
    setTimeout(() => get().triggerSync(), 0);
    return { chatSessions, currentSessionId };
  }),

  updateChatSession: (sessionId, updates) => set((state) => {
    const chatSessions = state.chatSessions.map(s => 
      s.id === sessionId ? { ...s, ...updates } : s
    );
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    setTimeout(() => get().triggerSync(), 0);
    return { chatSessions };
  }),

  setCurrentSessionId: (currentSessionId) => {
    if (currentSessionId) {
      localStorage.setItem('currentSessionId', currentSessionId);
    } else {
      localStorage.removeItem('currentSessionId');
    }
    set({ currentSessionId });
  },

  buyPremium: () => {
    localStorage.setItem('isPremium', 'true');
    set({ isPremium: true });
    logEvent('premium_purchase', { value: 9.99, currency: 'USD' });
    get().addNotification('Welcome to Premium! Ads removed.', 'success');
  },

  setAvatarId: (avatarId) => {
    localStorage.setItem('avatarId', avatarId);
    set({ avatarId });
    get().triggerSync();
  },

  setEquippedPerks: (perks) => {
    set({ equippedPerks: perks });
    get().triggerSync();
  },

  // Synergies logic
  hasSynergy: (stat: string, tierLevel: number = 1) => {
    const { equippedPerks } = get();
    const statMap: Record<string, string> = {
      'S': 'Strength', 'P': 'Perception', 'E': 'Endurance', 'C': 'Charisma', 'I': 'Intelligence', 'A': 'Agility', 'L': 'Luck'
    };
    const fullStatName = statMap[stat] || stat;

    const count = equippedPerks.filter(perkId => {
      const perk = PERKS.find(p => p.id === perkId);
      return perk?.stat === fullStatName;
    }).length;
    
    const synergy = PERK_SYNERGIES[fullStatName as keyof typeof PERK_SYNERGIES];
    if (!synergy) return false;

    const tier = synergy.tiers.find(t => t.threshold === (tierLevel === 1 ? synergy.tiers[0].threshold : (tierLevel === 2 ? synergy.tiers[1]?.threshold : 999)));
    return count >= (tier?.threshold || 999);
  },

  getActiveSynergies: () => {
    const stats = ['Strength', 'Perception', 'Endurance', 'Charisma', 'Intelligence', 'Agility', 'Luck'];
    const active = [];
    
    for (const stat of stats) {
      const synergy = PERK_SYNERGIES[stat as keyof typeof PERK_SYNERGIES];
      if (!synergy) continue;

      const { equippedPerks } = get();
      const count = equippedPerks.filter(perkId => {
        const perk = PERKS.find(p => p.id === perkId);
        return perk?.stat === stat;
      }).length;

      // Find highest tier reached
      let reachedTier = null;
      for (const tier of synergy.tiers) {
        if (count >= tier.threshold) {
          reachedTier = tier;
        }
      }

      if (reachedTier) {
        active.push({ stat, ...reachedTier });
      }
    }
    return active;
  },

  setAccessories: (accessories) => {
    set((state) => {
      const newAccessories = { ...state.accessories, ...accessories };
      localStorage.setItem('accessories', JSON.stringify(newAccessories));
      return { accessories: newAccessories };
    });
  },

  setIsOnline: (isOnline) => {
    const wasOffline = !get().isOnline;
    set({ isOnline, syncStatus: isOnline ? (wasOffline ? 'pending' : get().syncStatus) : 'offline' });
    if (isOnline && wasOffline && get().uid) {
      get().syncProgress();
    }
  },

  setShowLoginBonus: (show) => set({ showLoginBonus: show }),

  setGeminiApiKey: (key: string | null) => {
    if (key) {
      localStorage.setItem('geminiApiKey', key);
    } else {
      localStorage.removeItem('geminiApiKey');
    }
    set({ geminiApiKey: key });
  },

  downloadLanguage: async (lang: string) => {
    const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
    get().addNotification(`${t.downloading || 'Downloading'} ${lang.toUpperCase()}...`, 'info');
    
    // Simulate downloading assets by fetching thumbnails
    const courses = COURSES_BY_LANG[lang] || [];
    const imagesToPrefetch = courses.map(c => c.thumbnail).filter(Boolean);
    
    try {
      await Promise.all(imagesToPrefetch.map(url => fetch(url, { mode: 'no-cors' })));
      
      set((state) => {
        const newDownloaded = Array.from(new Set([...state.downloadedLanguages, lang]));
        localStorage.setItem('downloadedLanguages', JSON.stringify(newDownloaded));
        return { downloadedLanguages: newDownloaded };
      });
      
      get().addNotification(`${lang.toUpperCase()} ${t.download_complete || 'offline data ready!'}`, 'success');
      audioService.play(SoundEffect.SUCCESS);
    } catch (err) {
      console.error('Download failed:', err);
      get().addNotification(t.download_failed || 'Download failed. Check connection.', 'error');
    }
  },

  setLessonContext: (lessonContext) => set({ lessonContext }),
  joinFaction: (factionId: string) => {
    localStorage.setItem('factionId', factionId);
    set({ factionId, factionXp: 0, weeklyFactionXp: 0, leagueTier: 'bronze' });
    const t = UI_TRANSLATIONS[get().uiLang] || UI_TRANSLATIONS['en'];
    get().addNotification(`${t.faction_joined || 'Joined Faction'}: ${factionId.toUpperCase()}`, 'success');
    
    // Play sound
    audioService.play(SoundEffect.SUCCESS);
    
    // Sync to firestore if online
    const { uid } = get();
    if (uid) {
      updateDoc(doc(db, 'users', uid), { 
        factionId,
        factionXp: 0,
        weeklyFactionXp: 0,
        leagueTier: 'bronze'
      }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`));
      updateDoc(doc(db, 'leaderboard', uid), { factionId, factionXp: 0 }).catch();
    }
  },

  claimLeagueReward: (rewardId: string) => {
    set((state) => {
      if (state.unlockedCosmetics.includes(rewardId)) return state;
      const newUnlocked = [...state.unlockedCosmetics, rewardId];
      localStorage.setItem('unlockedCosmetics', JSON.stringify(newUnlocked));
      
      const { uid } = get();
      if (uid) {
        updateDoc(doc(db, 'users', uid), { unlockedCosmetics: newUnlocked })
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`));
      }
      
      return { unlockedCosmetics: newUnlocked };
    });
    get().addNotification('Exclusive reward claimed!', 'success');
  },

  equipFrame: (frameId: string) => {
    set({ equippedFrame: frameId });
    localStorage.setItem('equippedFrame', frameId);
    
    const { uid } = get();
    if (uid) {
      updateDoc(doc(db, 'users', uid), { equippedFrame: frameId })
        .catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`));
    }
    
    get().addNotification('Frame equipped!', 'info');
  },

  updateFactionStandings: async () => {
    if (!get().isOnline) return;
    try {
      const q = query(collection(db, 'leaderboard'), limit(100));
      const querySnapshot = await getDocs(q);
      
      const factionTotals: Record<string, number> = {
        'bos': 0,
        'railroad': 0,
        'minutemen': 0,
        'institute': 0,
        'enclave': 0
      };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.factionId && factionTotals[data.factionId] !== undefined) {
          factionTotals[data.factionId] += (data.weeklyFactionXp || 0);
        }
      });

      const standings = Object.entries(factionTotals)
        .map(([factionId, totalXp]) => ({ factionId, totalXp }))
        .sort((a, b) => b.totalXp - a.totalXp);
      
      set({ factionStandings: standings });
      localStorage.setItem('factionStandings', JSON.stringify(standings));
    } catch (err) {
      console.error('Failed to update faction standings:', err);
    }
  },

  checkWeeklyFactionWinner: async () => {
    const now = new Date();
    const lastReset = get().lastWeeklyReset ? new Date(get().lastWeeklyReset) : null;
    
    // Check if a week has passed since last reset
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    if (!lastReset || (now.getTime() - lastReset.getTime() >= oneWeekMs)) {
      await get().updateFactionStandings();
      const state = get();
      if (state.factionStandings.length > 0) {
        const winner = state.factionStandings[0];
        if (winner.totalXp > 0) {
          set({ factionWinnerId: winner.factionId, lastWeeklyReset: now.toISOString() });
          localStorage.setItem('factionWinnerId', winner.factionId);
          localStorage.setItem('lastWeeklyReset', now.toISOString());
          
          // Re-award winner reward if user is in that faction
          if (state.factionId === winner.factionId) {
            get().addNotification('YOUR FACTION WON THE WEEKLY WAR! Enjoy +20% Caps bonus.', 'success');
            
            // Unlock exclusive "Winner" badge if not already unlocked
            if (!state.unlockedCosmetics.includes('league_win_badge')) {
              get().claimLeagueReward('league_win_badge');
            }
          } else {
            get().addNotification(`The ${winner.factionId.toUpperCase()} has won the Weekly War.`, 'info');
          }
          
          // In a real app we would clear weeklyXP in firestore here
          // For simulation, we just reset it locally
          set({ weeklyFactionXp: 0 });
          get().triggerSync();
        }
      }
    }
  },

  setDisplayName: (name) => {
    localStorage.setItem('displayName', name);
    set({ displayName: name });
    get().triggerSync();
  },

  setBio: (bio: string) => {
    localStorage.setItem('bio', bio);
    set({ bio });
    get().triggerSync();
  },

  setLocation: (location: string) => {
    localStorage.setItem('location', location);
    set({ location });
    get().triggerSync();
  },

  setEmail: (email) => {
    localStorage.setItem('email', email);
    set({ email });
    get().triggerSync();
  },

  setSpecial: (special) => {
    localStorage.setItem('special', JSON.stringify(special));
    set({ special });
    get().triggerSync();
  },

  fetchProgress: async (userId: string) => {
    try {
      // Try to load from localStorage first for offline support
      const localData = localStorage.getItem(`userProgress_${userId}`);
      if (localData) {
        const parsedData = JSON.parse(localData);
        const today = new Date().toISOString().split('T')[0];
        const dailyProgress = parsedData.dailyProgress || {
          date: today,
          xpEarned: 0,
          flashcardsReviewed: 0,
          perfectFlashcards: 0,
          lessonsCompleted: 0,
          newWordsLearned: 0,
          videosWatched: 0,
          questsClaimed: []
        };

    // Reset if it's a new day
    if (dailyProgress.date !== today) {
      dailyProgress.date = today;
      dailyProgress.xpEarned = 0;
      dailyProgress.flashcardsReviewed = 0;
      dailyProgress.perfectFlashcards = 0;
      dailyProgress.lessonsCompleted = 0;
      dailyProgress.newWordsLearned = 0;
      dailyProgress.videosWatched = 0;
      dailyProgress.questsClaimed = [];
    }

    set({
      xp: parsedData.xp ?? 0,
      bio: parsedData.bio ?? null,
      location: parsedData.location ?? null,
      daysSurvived: parsedData.daysSurvived ?? 1,
      medkits: parsedData.medkits ?? 5,
      credits: parsedData.credits ?? 0,
      health: parsedData.health ?? 100,
      lastPlayedDate: parsedData.lastPlayedDate ?? null,
          nativeLang: parsedData.nativeLang ?? 'ru',
          targetLang: parsedData.targetLang ?? 'en',
          uiLang: parsedData.uiLang ?? 'ru',
          defaultReminderType: parsedData.defaultReminderType ?? 'none',
          equippedPerks: parsedData.equippedPerks ?? [],
          unlockedPerks: parsedData.unlockedPerks ?? ['dedicated_learner'],
          completedLessons: parsedData.completedLessons ?? [],
          completedMiniLessons: parsedData.completedMiniLessons ?? [],
          tasks: parsedData.tasks ?? [],
          chatSessions: parsedData.chatSessions ?? [],
          currentSessionId: parsedData.currentSessionId ?? null,
          flashcardProgress: parsedData.flashcardProgress ?? loadFlashcardProgress(),
          mistakes: parsedData.mistakes ?? loadMistakes(),
          customWords: parsedData.customWords ?? {},
          dailyProgress,
          special: parsedData.special ?? { S: 5, P: 5, E: 5, C: 5, I: 5, A: 5, L: 5 },
          avatarId: parsedData.avatarId ?? 'vault_boy',
          accessories: parsedData.accessories ?? { hat: 'none_hat', glasses: 'none_glasses' },
          factionId: parsedData.factionId ?? null,
          factionXp: parsedData.factionXp ?? 0,
          isPremium: parsedData.isPremium ?? false,
          loginStreak: parsedData.loginStreak ?? 0,
          lastClaimedLoginDate: parsedData.lastClaimedLoginDate ?? null,
          isLoaded: true
        });
        get().checkDailyStreak();
      }

      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.targetLang) localStorage.setItem('targetLang', data.targetLang);
        if (data.uiLang) localStorage.setItem('uiLang', data.uiLang);
        
        const today = new Date().toISOString().split('T')[0];
        const dailyProgress = data.dailyProgress || {
          date: today,
          xpEarned: 0,
          flashcardsReviewed: 0,
          perfectFlashcards: 0,
          lessonsCompleted: 0,
          newWordsLearned: 0,
          videosWatched: 0,
          questsClaimed: []
        };

        // Reset if it's a new day
        if (dailyProgress.date !== today) {
          dailyProgress.date = today;
          dailyProgress.xpEarned = 0;
          dailyProgress.flashcardsReviewed = 0;
          dailyProgress.perfectFlashcards = 0;
          dailyProgress.lessonsCompleted = 0;
          dailyProgress.newWordsLearned = 0;
          dailyProgress.videosWatched = 0;
          dailyProgress.questsClaimed = [];
        }

        const cloudProgress = data.flashcardProgress || {};
        const currentProgress = get().flashcardProgress;
        const mergedFlashcardProgress = mergeFlashcardProgress(currentProgress, cloudProgress);

        const cloudMistakes = data.mistakes || {};
        const currentMistakes = get().mistakes;
        const mergedMistakes = mergeMistakes(currentMistakes, cloudMistakes);

    const newState = {
      xp: Math.max(data.xp ?? 0, get().xp),
      bio: data.bio ?? null,
      location: data.location ?? null,
      daysSurvived: Math.max(data.daysSurvived ?? 1, get().daysSurvived),
      medkits: data.medkits ?? 5,
      credits: Math.max(data.credits ?? 0, get().credits),
      health: data.health ?? 100,
      lastPlayedDate: data.lastPlayedDate ?? null,
          nativeLang: data.nativeLang ?? 'ru',
          targetLang: data.targetLang ?? 'en',
          uiLang: data.uiLang ?? 'ru',
          equippedPerks: Array.from(new Set([...(data.equippedPerks || []), ...(get().equippedPerks || [])])),
          unlockedPerks: Array.from(new Set([...(data.unlockedPerks || ['dedicated_learner']), ...(get().unlockedPerks || [])])),
          completedLessons: Array.from(new Set([...(data.completedLessons || []), ...(get().completedLessons || [])])),
          completedMiniLessons: Array.from(new Set([...(data.completedMiniLessons || []), ...(get().completedMiniLessons || [])])),
          tasks: data.tasks || [],
          chatSessions: data.chatSessions || [],
          currentSessionId: data.currentSessionId || null,
          flashcardProgress: mergedFlashcardProgress,
          mistakes: mergedMistakes,
          customWords: data.customWords || {},
          dailyProgress,
          special: data.special ?? { S: 5, P: 5, E: 5, C: 5, I: 5, A: 5, L: 5 },
          avatarId: data.avatarId ?? 'vault_boy',
          accessories: data.accessories ?? { hat: 'none_hat', glasses: 'none_glasses' },
          factionId: data.factionId ?? null,
          factionXp: data.factionXp ?? 0,
          isPremium: data.isPremium ?? false,
          loginStreak: data.loginStreak ?? get().loginStreak,
          lastClaimedLoginDate: data.lastClaimedLoginDate ?? get().lastClaimedLoginDate,
          isLoaded: true
        };
        
        set(newState);
        localStorage.setItem(`userProgress_${userId}`, JSON.stringify(newState));
        get().checkDailyStreak();
      } else if (!localData) {
        await get().saveProgress(userId);
        set({ isLoaded: true });
      }
    } catch (err) {
      set({ isLoaded: true });
      handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    }
  },

  saveProgress: async (userId: string) => {
    const state = get();
    if (!userId || state.syncStatus === 'pending') return;

    // Prevent excessive saving (min 3 seconds between cloud saves)
    if (state.syncStatus === 'synced' && state.lastSyncTime && (Date.now() - new Date(state.lastSyncTime).getTime() < 3000)) {
      return;
    }
    
    // Always save to localStorage for offline support
    const stateToSave = {
      uid: state.uid,
      displayName: state.displayName,
      bio: state.bio,
      location: state.location,
      email: state.email,
      photoURL: state.photoURL,
      xp: state.xp,
      daysSurvived: state.daysSurvived,
      medkits: state.medkits,
      credits: state.credits,
      health: state.health,
      lastPlayedDate: state.lastPlayedDate,
      nativeLang: state.nativeLang,
      targetLang: state.targetLang,
      uiLang: state.uiLang,
      defaultReminderType: state.defaultReminderType,
      equippedPerks: state.equippedPerks,
      unlockedPerks: state.unlockedPerks,
      completedLessons: state.completedLessons,
      completedMiniLessons: state.completedMiniLessons,
      flashcardProgress: state.flashcardProgress,
      mistakes: state.mistakes,
      customWords: state.customWords,
      tasks: state.tasks,
      chatSessions: state.chatSessions,
      currentSessionId: state.currentSessionId,
      dailyProgress: state.dailyProgress,
      special: state.special,
      specialProgress: state.specialProgress,
      isPremium: state.isPremium,
      loginStreak: state.loginStreak,
      lastClaimedLoginDate: state.lastClaimedLoginDate,
      cognitiveLoad: state.cognitiveLoad,
      hydrationLevel: state.hydrationLevel,
      avatarId: state.avatarId,
      accessories: state.accessories,
      unlockedRooms: state.unlockedRooms,
      roomLastCollection: state.roomLastCollection,
      universityPopulation: state.universityPopulation,
      lessonDifficulty: state.lessonDifficulty,
      factionId: state.factionId,
      factionXp: state.factionXp,
      hasUsedMonthlyRepair: state.hasUsedMonthlyRepair,
      visualEffects: state.visualEffects,
      savedExamples: state.savedExamples,
      weather: state.weather,
      gender: state.gender,
      achievements: state.achievements,
      perfectLessonsCount: state.perfectLessonsCount,
      weeklyFactionXp: state.weeklyFactionXp,
      leagueTier: state.leagueTier,
      unlockedCosmetics: state.unlockedCosmetics,
      equippedFrame: state.equippedFrame,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`userProgress_${userId}`, JSON.stringify(stateToSave));

    try {
      // Check if we are online before attempting Firestore sync
      if (!navigator.onLine) {
        set({ syncStatus: 'offline' });
        return;
      }

      set({ syncStatus: 'pending' });
      await withRetry(() => setDoc(doc(db, 'users', userId), stateToSave, { merge: true }));
      
      // Sync public data to leaderboard
      const leaderboardRef = doc(db, 'leaderboard', userId);
      await withRetry(() => setDoc(leaderboardRef, {
        uid: state.uid,
        displayName: state.displayName,
        photoURL: state.photoURL,
        avatarId: state.avatarId,
        accessories: state.accessories,
        xp: state.xp,
        factionId: state.factionId,
        factionXp: state.factionXp,
        weeklyFactionXp: state.weeklyFactionXp,
        leagueTier: state.leagueTier,
        equippedFrame: state.equippedFrame,
        daysSurvived: state.daysSurvived,
        special: state.special,
        lastUpdated: new Date().toISOString()
      }, { merge: true }));
      
      set({ syncStatus: 'synced' });
    } catch (err) {
      set({ syncStatus: 'error' });
      try {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
      } catch (e: any) {
        console.error('Save failed:', e.message);
        // Don't show notification for every background save failure to avoid spam
      }
    }
  },

  syncProgress: async () => {
    const state = get();
    if (!state.uid || !state.isOnline) return;

    try {
      set({ syncStatus: 'pending' });
      const localData = localStorage.getItem(`userProgress_${state.uid}`);
      if (!localData) {
        set({ syncStatus: 'synced' });
        return;
      }

      const stateToSave = JSON.parse(localData);
      await withRetry(() => setDoc(doc(db, 'users', state.uid), stateToSave, { merge: true }));
      set({ syncStatus: 'synced' });
      get().addNotification('Progress synced with cloud', 'success');
    } catch (err) {
      set({ syncStatus: 'error' });
      try {
        handleFirestoreError(err, OperationType.WRITE, `users/${state.uid}`);
      } catch (e: any) {
        get().addNotification(e.message, 'error');
      }
    }
  },

  triggerSync: () => {
    const { uid, saveProgress } = get();
    if (uid) {
      saveProgress(uid);
    }
  }
}));
