import type { ContextualExample, DeepDiveResponse, GrammarExplanation, PronunciationFeedback } from '../../services/geminiService';

export type QuestionType = 'mcq-native' | 'mcq-target' | 'typing' | 'typing-target' | 'listening' | 'phonetics' | 'listening-phonetics' | 'fill-in-the-blank';

export interface Question {
  word: any;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  promptWord: string;
  hint?: string;
  characterBank?: string[];
}

export interface UIState {
  t: Record<string, string>;
  currentLang: { name: Record<string, string> } | undefined;
  topicId: number;
  targetLang: string;
  uiLang: string;
  isPremium: boolean;
  isOnline: boolean;
  health: number;
  special: { P?: number; A?: number };
  equippedPerks: string[];
}

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

export const SPECIAL_CHARS: Record<string, string[]> = {
  sr: ['ђ', 'ј', 'љ', 'њ', 'ћ', 'џ', 'ш', 'ч', 'ж'],
  es: ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'],
  fr: ['à', 'â', 'æ', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü'],
  de: ['ä', 'ö', 'ü', 'ß'],
  it: ['à', 'è', 'é', 'ì', 'í', 'ò', 'ó', 'ù', 'ú'],
  ru: ['ё', 'ъ', 'ь', 'э', 'ы'],
  ja: ['。', '、', '？', '！', '〜', '「', '」'],
  zh: ['。', '，', '？', '！', '…', '「', '」'],
};

export const FULL_ALPHABETS: Record<string, string[]> = {
  sr: ['а','б','в','г','д','ђ','е','ж','з','и','ј','к','л','љ','м','н','њ','о','п','р','с','т','ћ','у','ф','х','ц','ч','џ','ш'],
  ru: ['а','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'],
  es: 'abcdefghijklmnñopqrstuvwxyz'.split(''),
  fr: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  de: 'abcdefghijklmnopqrstuvwxyzäöüß'.split(''),
  it: 'abcdefghijklmnopqrstuvwxyz'.split(''),
};