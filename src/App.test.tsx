import { describe, it, expect, vi } from 'vitest';

// Mock dependencies so App.tsx can be imported without executing real side effects
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })),
  },
}));

vi.mock('firebase/firestore', () => ({
  initializeFirestore: vi.fn(() => ({})),
  CACHE_SIZE_UNLIMITED: -1,
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  onSnapshot: vi.fn(),
  getDocFromServer: vi.fn(),
  query: vi.fn(),
  collection: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  Timestamp: { now: vi.fn(() => ({ toMillis: () => Date.now() })) },
  OperationType: {},
}));

vi.mock('../../firebase-applet-config.json', () => ({
  default: {
    apiKey: 'test',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123',
    appId: '1:123:web:abc',
    measurementId: 'G-TEST',
    firestoreDatabaseId: 'test-db',
  },
}));

vi.mock('../firebase', () => ({
  db: {},
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  collection: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  handleFirestoreError: vi.fn(),
  logEvent: vi.fn(),
}));

vi.mock('../lib/auth', () => ({
  handleAuthState: vi.fn(() => Promise.resolve({ user: null })),
  subscribeToAuthChanges: vi.fn(() => vi.fn()),
  signOut: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
}));

vi.mock('../services/geminiService', () => ({
  hasApiKey: vi.fn(() => false),
}));

vi.mock('../services/audioService', () => ({
  audioService: {
    play: vi.fn(),
    preload: vi.fn(),
    toggleMute: vi.fn(),
    setVolume: vi.fn(),
    getVolume: vi.fn(() => 0.5),
    isMuted: vi.fn(() => false),
  },
  SoundEffect: {},
}));

vi.mock('../lib/utils', () => ({
  triggerLevelUpEffects: vi.fn(),
}));

vi.mock('../lib/errors', () => ({
  AppError: class AppError extends Error {},
  ValidationError: class ValidationError extends Error {},
  handleAppError: vi.fn(),
}));

vi.mock('../lib/i18n', () => ({
  useT: vi.fn(() => ({
    login_title: 'Fennec Academy',
    login_subtitle: 'Test',
    login_desc: 'Test',
    login_google: 'Sign in with Google',
    continue_with_google: 'Continue with Google',
    login_secure: 'Secure Authentication',
    sign_in: 'Sign In',
    register: 'Register',
    email_placeholder: 'Email address',
    password_placeholder: 'Password',
    confirm_password_placeholder: 'Confirm password',
    create_account: 'Create Account',
    fill_all_fields: 'Please fill in all fields',
    passwords_not_match: 'Passwords do not match',
    password_min_length: 'Password must be at least 6 characters',
    check_email_confirm: 'Please check your email to confirm your account',
  })),
}));

vi.mock('../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      fetchProgress: vi.fn(),
      saveProgress: vi.fn(),
      isLoaded: false,
      setUser: vi.fn(),
      uid: null,
      role: null,
      globalSettings: null,
      setGlobalSettings: vi.fn(),
      uiLang: 'en',
      visualEffects: false,
      syncProgress: vi.fn(),
      setIsOnline: vi.fn(),
      currentScenario: null,
      streak: 0,
      coins: 0,
      xp: 0,
      level: 1,
      achievements: [],
      notifications: [],
      unlockedPerks: [],
      addNotification: vi.fn(),
      dismissNotification: vi.fn(),
      setStreak: vi.fn(),
      setCoins: vi.fn(),
      setXP: vi.fn(),
      setLevel: vi.fn(),
      setAchievements: vi.fn(),
      unlockPerk: vi.fn(),
      setUnlockedPerks: vi.fn(),
      currentRoom: null,
      setCurrentRoom: vi.fn(),
      activeScenario: null,
      setActiveScenario: vi.fn(),
      dailyQuests: [],
      setDailyQuests: vi.fn(),
      campusHealth: 100,
      setCampusHealth: vi.fn(),
      setMistakes: vi.fn(),
      mistakes: {},
      setFlashcardProgress: vi.fn(),
      flashcardProgress: {},
      setUserLang: vi.fn(),
      userLang: 'en',
      setTargetLang: vi.fn(),
      targetLang: 'en',
      toggleVisualEffects: vi.fn(),
      toggleSound: vi.fn(),
      soundEnabled: true,
      setTheme: vi.fn(),
      theme: 'light',
      repairWord: vi.fn(),
      currentCourse: null,
      setCurrentCourse: vi.fn(),
      setActiveCourse: vi.fn(),
      activeCourse: null,
      setCharacter: vi.fn(),
      character: null,
      setCurrentLesson: vi.fn(),
      currentLesson: null,
      setIsLoaded: vi.fn(),
      setRole: vi.fn(),
      setUID: vi.fn(),
      resetProgress: vi.fn(),
      setNotifications: vi.fn(),
      setCampusStatus: vi.fn(),
      campusStatus: 'operational',
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('motion/react', async () => {
  const actual = await vi.importActual('motion/react');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => window.React.createElement('div', props, children),
      button: ({ children, ...props }: any) => window.React.createElement('button', props, children),
      span: ({ children, ...props }: any) => window.React.createElement('span', props, children),
      nav: ({ children, ...props }: any) => window.React.createElement('nav', props, children),
      header: ({ children, ...props }: any) => window.React.createElement('header', props, children),
      main: ({ children, ...props }: any) => window.React.createElement('main', props, children),
      aside: ({ children, ...props }: any) => window.React.createElement('aside', props, children),
      img: ({ children, ...props }: any) => window.React.createElement('img', props, children),
      a: ({ children, ...props }: any) => window.React.createElement('a', props, children),
      ul: ({ children, ...props }: any) => window.React.createElement('ul', props, children),
      li: ({ children, ...props }: any) => window.React.createElement('li', props, children),
      p: ({ children, ...props }: any) => window.React.createElement('p', props, children),
      h1: ({ children, ...props }: any) => window.React.createElement('h1', props, children),
      h2: ({ children, ...props }: any) => window.React.createElement('h2', props, children),
      h3: ({ children, ...props }: any) => window.React.createElement('h3', props, children),
      h4: ({ children, ...props }: any) => window.React.createElement('h4', props, children),
      svg: ({ children, ...props }: any) => window.React.createElement('svg', props, children),
      path: ({ children, ...props }: any) => window.React.createElement('path', props, children),
      circle: ({ children, ...props }: any) => window.React.createElement('circle', props, children),
      rect: ({ children, ...props }: any) => window.React.createElement('rect', props, children),
      line: ({ children, ...props }: any) => window.React.createElement('line', props, children),
      polyline: ({ children, ...props }: any) => window.React.createElement('polyline', props, children),
      polygon: ({ children, ...props }: any) => window.React.createElement('polygon', props, children),
      g: ({ children, ...props }: any) => window.React.createElement('g', props, children),
      text: ({ children, ...props }: any) => window.React.createElement('text', props, children),
      tspan: ({ children, ...props }: any) => window.React.createElement('tspan', props, children),
      defs: ({ children, ...props }: any) => window.React.createElement('defs', props, children),
      clipPath: ({ children, ...props }: any) => window.React.createElement('clipPath', props, children),
      mask: ({ children, ...props }: any) => window.React.createElement('mask', props, children),
      use: ({ children, ...props }: any) => window.React.createElement('use', props, children),
      animate: ({ children, ...props }: any) => window.React.createElement('animate', props, children),
      foreignObject: ({ children, ...props }: any) => window.React.createElement('foreignObject', props, children),
      linearGradient: ({ children, ...props }: any) => window.React.createElement('linearGradient', props, children),
      radialGradient: ({ children, ...props }: any) => window.React.createElement('radialGradient', props, children),
      stop: ({ children, ...props }: any) => window.React.createElement('stop', props, children),
      filter: ({ children, ...props }: any) => window.React.createElement('filter', props, children),
      feGaussianBlur: ({ children, ...props }: any) => window.React.createElement('feGaussianBlur', props, children),
      feColorMatrix: ({ children, ...props }: any) => window.React.createElement('feColorMatrix', props, children),
      feBlend: ({ children, ...props }: any) => window.React.createElement('feBlend', props, children),
      feComposite: ({ children, ...props }: any) => window.React.createElement('feComposite', props, children),
      feOffset: ({ children, ...props }: any) => window.React.createElement('feOffset', props, children),
      feMerge: ({ children, ...props }: any) => window.React.createElement('feMerge', props, children),
      feMergeNode: ({ children, ...props }: any) => window.React.createElement('feMergeNode', props, children),
      feFlood: ({ children, ...props }: any) => window.React.createElement('feFlood', props, children),
    },
    AnimatePresence: ({ children }: any) => window.React.createElement(window.React.Fragment, {}, children),
  };
});

vi.mock('../pages/Dashboard', () => ({ default: () => null }));
vi.mock('../pages/Tasks', () => ({ default: () => null }));
vi.mock('../pages/Lesson', () => ({ default: () => null }));
vi.mock('../pages/AIChat', () => ({ default: () => null }));
vi.mock('../pages/Flashcards', () => ({ default: () => null }));
vi.mock('../pages/MatchGame', () => ({ default: () => null }));
vi.mock('../pages/Conversation', () => ({ default: () => null }));
vi.mock('../pages/Perks', () => ({ default: () => null }));
vi.mock('../pages/Library', () => ({ default: () => null }));
vi.mock('../pages/Stories', () => ({ default: () => null }));
vi.mock('../pages/VideoLessons', () => ({ default: () => null }));
vi.mock('../pages/Scenarios', () => ({ default: () => null }));
vi.mock('../pages/Encounters', () => ({ default: () => null }));
vi.mock('../pages/Profile', () => ({ default: () => null }));
vi.mock('../pages/Leaderboard', () => ({ default: () => null }));
vi.mock('../pages/AdminSettings', () => ({ default: () => null }));
vi.mock('../pages/VoicePractice', () => ({ default: () => null }));
vi.mock('../pages/Vault', () => ({ default: () => null }));
vi.mock('../pages/HackingGame', () => ({ default: () => null }));
vi.mock('../pages/GrammarLab', () => ({ default: () => null }));
vi.mock('../pages/Quests', () => ({ default: () => null }));
vi.mock('../pages/VocabularyBank', () => ({ default: () => null }));
vi.mock('../pages/RepairTerminal', () => ({ default: () => null }));
vi.mock('../pages/Factions', () => ({ default: () => null }));
vi.mock('../pages/Character', () => ({ default: () => null }));

vi.mock('../components/MapSidebar', () => ({ default: () => null }));
vi.mock('../components/AvatarWithFrame', () => ({ default: () => null }));
vi.mock('../components/NavLink', () => ({ default: () => null }));
vi.mock('../components/ErrorBoundary', () => ({ ErrorBoundary: ({ children }: any) => children }));
vi.mock('../components/Notifications', () => ({ default: () => null }));
vi.mock('../components/HelpModal', () => ({ default: () => null }));
vi.mock('../components/Tooltip', () => ({ default: ({ children }: any) => children }));
vi.mock('../components/CardOfTheDay', () => ({ default: () => null }));
vi.mock('../components/PwaPrompt', () => ({ default: () => null }));
vi.mock('../components/ScriptInjector', () => ({ default: () => null }));
vi.mock('../components/WeatherEffects', () => ({ default: () => null }));
vi.mock('../components/WeatherBackground', () => ({ default: () => null }));
vi.mock('../components/PremiumGuard', () => ({ PremiumGuard: ({ children }: any) => children }));
vi.mock('../components/CognitiveStatus', () => ({ CognitiveStatus: () => null }));

describe('App module import', () => {
  it('imports App.tsx without throwing ReferenceError (CapacitorApp must be imported)', async () => {
    // Before the fix, App.tsx referenced CapacitorApp without importing it.
    // In ESM strict mode, that would throw ReferenceError as soon as the
    // closure containing the reference was evaluated (i.e. on module load or
    // when the effect function was created during render).
    // With the import present, the module can be required/imported safely.
    await expect(import('./App')).resolves.toBeDefined();
  });
});
