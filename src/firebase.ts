import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED, doc, getDoc, setDoc, updateDoc, onSnapshot, getDocFromServer, collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
}, firebaseConfig.firestoreDatabaseId);

// Initialize Analytics
let analytics: any = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.warn('Firebase Analytics failed to initialize:', err);
  }
}

export const logEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, eventParams);
  }
};

// Specific Analytics Events
export const logLessonComplete = (lessonId: string, score: number, xp: number) => {
  logEvent('lesson_complete', { lesson_id: lessonId, score, xp });
};

export const logPerkPurchase = (perkId: string, cost: number) => {
  logEvent('perk_purchase', { perk_id: perkId, cost });
};

export const logLevelUp = (level: number) => {
  logEvent('level_up', { level });
};

export const logQuestClaim = (questId: string, rewardXp: number) => {
  logEvent('quest_claim', { quest_id: questId, reward_xp: rewardXp });
};

export const logAIDialogue = (type: 'help' | 'chat' | 'error_analysis') => {
  logEvent('ai_dialogue', { type });
};



export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operation types for error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const firebaseError = error as any;
  const errorCode = firebaseError?.code || 'unknown';
  
  let userMessage = 'Database operation failed. Please check your connection.';
  
  switch (errorCode) {
    case 'permission-denied':
      userMessage = 'Access denied. You do not have permission to perform this action.';
      break;
    case 'not-found':
      userMessage = 'The requested resource was not found.';
      break;
    case 'unavailable':
      userMessage = 'Database service is currently unavailable. Retrying...';
      break;
    case 'deadline-exceeded':
      userMessage = 'Operation timed out. Please try again.';
      break;
    case 'resource-exhausted':
      userMessage = 'Quota exceeded. Please contact support.';
      break;
    case 'unauthenticated':
      userMessage = 'You must be signed in to perform this action.';
      break;
  }

  const errInfo: FirestoreErrorInfo = {
    error: firebaseError?.message || String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  
  const finalError = new Error(userMessage);
  (finalError as any).internal = errInfo;
  (finalError as any).code = errorCode;
  
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw finalError;
}

// Test connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, onSnapshot, collection, getDocs, query, orderBy, limit, where, Timestamp };
export type { User };
