import confetti from 'canvas-confetti';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Check, AlertCircle, Volume2, Heart, Zap, Keyboard, Bot, Map, Lock, CheckCircle2, XCircle, Crosshair, Delete, Star, Newspaper, Book, BookOpen, MessageCircle, Image as ImageIcon, Dog, History, AlertTriangle, Lightbulb, Globe, Mic, MicOff, Keyboard as KeyboardIcon, Trophy, Award, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { AdBanner } from '../components/AdBanner';
import { WORDS_BY_LANG, LANGUAGES, COURSES_BY_LANG } from '../data/gameData';
import { playPronunciation } from '../utils/audio';
import { UI_TRANSLATIONS, COURSE_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import PetDisplay from '../components/PetDisplay';
import Tooltip from '../components/Tooltip';
import DiffHighlight from '../components/DiffHighlight';
import { fetchContextualExamples, ContextualExample, fetchGrammarExplanation, GrammarExplanation, fetchCorrectExplanation, fetchVisualAid, fetchAIHint, fetchDeepDive, DeepDiveResponse, fetchPronunciationFeedback, PronunciationFeedback } from '../services/geminiService';
import { handleAppError } from '../lib/errors';
import { logLessonComplete } from '../firebase';

import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { isSpeechRecognitionSupported, startSpeechRecognition } from '../utils/speech';

type QuestionType = 'mcq-native' | 'mcq-target' | 'typing' | 'typing-target' | 'listening' | 'phonetics' | 'listening-phonetics' | 'fill-in-the-blank';

const SPECIAL_CHARS: Record<string, string[]> = {
  sr: ['ђ', 'ј', 'љ', 'њ', 'ћ', 'џ', 'ш', 'ч', 'ж'],
  es: ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'],
  fr: ['à', 'â', 'æ', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü'],
  de: ['ä', 'ö', 'ü', 'ß'],
  it: ['à', 'è', 'é', 'ì', 'í', 'ò', 'ó', 'ù', 'ú'],
  ru: ['ё', 'ъ', 'ь', 'э', 'ы'],
  ja: ['。', '、', '？', '！', '〜', '「', '」'],
  zh: ['。', '，', '？', '！', '…', '「', '」'],
};

const FULL_ALPHABETS: Record<string, string[]> = {
  sr: ['а', 'б', 'в', 'г', 'д', 'ђ', 'е', 'ж', 'з', 'и', 'ј', 'к', 'л', 'љ', 'м', 'н', 'њ', 'о', 'п', 'р', 'с', 'т', 'ћ', 'у', 'ф', 'х', 'ц', 'ч', 'џ', 'ш'],
  ru: ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'],
  es: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  fr: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  de: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ü', 'ß'],
  it: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
};

interface Question {
  word: any;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  promptWord: string;
  hint?: string;
  characterBank?: string[];
}

export default function Lesson() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const medkits = useStore(state => state.medkits);
  const useMedkit = useStore(state => state.useMedkit);
  const addXp = useStore(state => state.addXp);
  const addCredits = useStore(state => state.addCredits);
  const targetLang = useStore(state => state.targetLang);
  const uiLang = useStore(state => state.uiLang);
  const addNotification = useStore(state => state.addNotification);
  const health = useStore(state => state.health);
  const takeDamage = useStore(state => state.takeDamage);
  const addMistake = useStore(state => state.addMistake);
  const repairMistake = useStore(state => state.repairMistake);
  const completeLesson = useStore(state => state.completeLesson);
  const equippedPerks = useStore(state => state.equippedPerks);
  const updateSpecial = useStore(state => state.updateSpecial);
  const completedLessons = useStore(state => state.completedLessons);
  const useEnergy = useStore(state => state.useEnergy);
  const savedExamples = useStore(state => state.savedExamples);
  const isPremium = useStore(state => state.isPremium);
  const buyPremium = useStore(state => state.buyPremium);
  const setLessonContext = useStore(state => state.setLessonContext);
  const saveExample = useStore(state => state.saveExample);
  const special = useStore(state => state.special);
  const isOnline = useStore(state => state.isOnline);
  const lessonDifficulty = useStore(state => state.lessonDifficulty);
  const setLessonDifficulty = useStore(state => state.setLessonDifficulty);
  const [showSuccess, setShowSuccess] = useState(false);
  const [difficultySelected, setDifficultySelected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalXpEarned, setFinalXpEarned] = useState(0);
  const [finalCreditsEarned, setFinalCreditsEarned] = useState(0);
  
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [combo, setCombo] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [dogHintUsed, setDogHintUsed] = useState(false);
  const [dogMessage, setDogMessage] = useState<string | null>(null);
  const [mistakesMade, setMistakesMade] = useState(0);
  const [wrongWordIds, setWrongWordIds] = useState<string[]>([]);
  const [results, setResults] = useState<('correct' | 'incorrect' | null)[]>([]);
  const [showFullKeyboard, setShowFullKeyboard] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(true);
  const [isVirtualKeyboardOpen, setIsVirtualKeyboardOpen] = useState(false);
  const [showCourseMap, setShowCourseMap] = useState(false);
  const [examples, setExamples] = useState<ContextualExample[]>([]);
  const [isFetchingExamples, setIsFetchingExamples] = useState(false);
  const [grammarExplanation, setGrammarExplanation] = useState<GrammarExplanation | null>(null);
  const [isFetchingGrammar, setIsFetchingGrammar] = useState(false);
  const [correctExplanation, setCorrectExplanation] = useState<string | null>(null);
  const [isFetchingCorrectExplanation, setIsFetchingCorrectExplanation] = useState(false);
  const [visualAid, setVisualAid] = useState<string | null>(null);
  const [isFetchingVisualAid, setIsFetchingVisualAid] = useState(false);
  const [deepDive, setDeepDive] = useState<DeepDiveResponse | null>(null);
  const [isFetchingDeepDive, setIsFetchingDeepDive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<PronunciationFeedback | null>(null);
  const [isFetchingPronunciation, setIsFetchingPronunciation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questions, setQuestions] = useState<Question[]>([]);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  // WORDS_BY_LANG only has sr data currently - use sr as fallback for all languages
  const words = (WORDS_BY_LANG[targetLang] && WORDS_BY_LANG[targetLang].length > 0) 
    ? WORDS_BY_LANG[targetLang] 
    : WORDS_BY_LANG['sr'] || [];
  const currentLang = LANGUAGES.find(l => l.id === targetLang);
  const courseData = COURSES_BY_LANG[targetLang] || COURSES_BY_LANG['sr'];

  // Determine which words to use based on lesson ID
  const lessonId = parseInt(id || '101', 10);
  const topicId = Math.floor(lessonId / 100);
  const lessonIndex = lessonId % 100;
  
  // Each topic has 8 words total, divided into 2 lessons of 4 words each.
  // Topic 1: 101 (0-4), 102 (4-8)
  // Topic 2: 201 (8-12), 202 (12-16)
  const startIndex = (topicId - 1) * 8 + (lessonIndex - 1) * 4;
  const endIndex = startIndex + 4;

  const topicWords = words.slice(startIndex, endIndex);

  // Safety check: if lessonId is invalid or data is missing, redirect to Dashboard
  useEffect(() => {
    const hasWords = words && words.length >= 8;
    const hasEnoughWords = topicWords.length > 0;
    const isValidLessonId = lessonId >= 101 && lessonId <= 1502;
    
    // Only redirect if all conditions fail AND we haven't already redirected
    if (!hasWords || !hasEnoughWords || !isValidLessonId) {
      console.warn('Lesson not found or no data:', { lessonId, hasWords, hasEnoughWords, targetLang, wordsCount: words?.length, id });
      navigate('/', { replace: true });
    } else {
      setIsLoading(false);
    }
  }, [lessonId, topicWords.length, courseData, targetLang, completedLessons, navigate, topicId, words, id]);

  // Show loading while checking, or redirect message
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-zinc-400">Загрузка урока...</p>
        </div>
      </div>
    );
  }

  const startListening = () => {
    if (isSpeechRecognitionSupported() && !isListening) {
      setPronunciationFeedback(null);
      const recognition = startSpeechRecognition({
        lang: targetLang,
        interimResults: false,
        onStart: () => setIsListening(true),
        onResult: async (transcript, isFinal) => {
          if (isFinal) {
            setTypedAnswer(transcript);
            
            // If it's a pronunciation check, fetch feedback
            if (currentQuestion && (currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target')) {
              if (isPremium) {
                setIsFetchingPronunciation(true);
                try {
                  const feedback = await fetchPronunciationFeedback(
                    currentQuestion.correctAnswer,
                    transcript,
                    targetLang,
                    uiLang
                  );
                  setPronunciationFeedback(feedback);
                  
                  if (feedback?.isCorrect) {
                    addNotification(t.correct_pronunciation || 'Perfect pronunciation!', 'success');
                  }
                } catch (error) {
                  handleAppError(error, addNotification);
                } finally {
                  setIsFetchingPronunciation(false);
                }
              } else {
                addNotification(t.pronunciation_feedback_premium || 'Pronunciation feedback is a Premium feature', 'info');
              }
            }
          }
        },
        onEnd: () => setIsListening(false),
        onError: (err) => {
          console.error('Speech recognition error:', err);
          setIsListening(false);
          addNotification(t.speech_error || 'Speech recognition failed', 'error');
        }
      });
      recognitionRef.current = recognition;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const generateLessonQuestions = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (topicWords.length === 0) return;
    setIsGenerating(true);
    
    // Small delay for UI feel
    setTimeout(() => {
      const pool = [...topicWords];
      // Add review words for spaced repetition
      if (startIndex > 0) {
        const reviewPool = words.slice(0, startIndex).sort(() => 0.5 - Math.random()).slice(0, 2);
        pool.push(...reviewPool);
      }

      const generated: Question[] = [];
      const hasConcentratedFire = equippedPerks.includes('concentrated_fire');
      const hasDeepFocus = equippedPerks.includes('deep_focus');
      
      let numOptions = 4;
      if (difficulty === 'easy') numOptions = 3;
      if (difficulty === 'hard') numOptions = 5;
      if (hasConcentratedFire || hasDeepFocus) numOptions = Math.max(2, numOptions - 1);

      let shuffledPool = [...pool].sort(() => 0.5 - Math.random());
      let lastWordId = -1;

      let numQuestions = 10;
      if (difficulty === 'easy') numQuestions = 6;
      if (difficulty === 'hard') numQuestions = 15;

      // Generate questions for a longer, more thoughtful lesson
      for (let i = 0; i < numQuestions; i++) {
        if (shuffledPool.length === 0) {
          shuffledPool = [...pool].sort(() => 0.5 - Math.random());
          if (shuffledPool[shuffledPool.length - 1].id === lastWordId && shuffledPool.length > 1) {
            const temp = shuffledPool[shuffledPool.length - 1];
            shuffledPool[shuffledPool.length - 1] = shuffledPool[0];
            shuffledPool[0] = temp;
          }
        }
        
        const word = shuffledPool.pop()!;
        lastWordId = word.id;
        let type: QuestionType;
        
        if (topicId === 7) {
          if (i < numQuestions / 2) type = 'phonetics';
          else type = 'listening-phonetics';
        } else {
          if (difficulty === 'easy') {
            if (i < 3) type = 'mcq-native';
            else if (i < 5) type = 'mcq-target';
            else type = 'listening';
          } else if (difficulty === 'hard') {
            if (i < 2) type = 'mcq-target';
            else if (i < 4) type = 'listening';
            else if (i < 7) type = 'fill-in-the-blank';
            else if (i < 11) type = 'typing-target';
            else type = 'typing';
          } else {
            if (i < 2) type = 'mcq-native';
            else if (i < 4) type = 'mcq-target';
            else if (i < 5) type = 'listening';
            else if (i < 7) type = 'fill-in-the-blank';
            else if (i < 9) type = 'typing-target';
            else type = 'typing';
          }
        }

        const nativeTranslation = word.translations[uiLang] || word.translation;
        const targetWord = word.word;

        let options: string[] = [];
        let correctAnswer = '';
        let promptWord = '';
        let hint = '';

        if (type === 'mcq-native' || type === 'listening') {
          correctAnswer = nativeTranslation;
          promptWord = type === 'listening' ? '' : targetWord;
          const others = words.map(w => w.translations[uiLang] || w.translation);
          const uniqueOthers = [...new Set(others)].filter(w => w !== correctAnswer);
          const shuffledOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1);
          options = [...shuffledOthers, correctAnswer].sort(() => 0.5 - Math.random());
        } else if (type === 'mcq-target') {
          correctAnswer = targetWord;
          promptWord = nativeTranslation;
          const others = words.map(w => w.word);
          const uniqueOthers = [...new Set(others)].filter(w => w !== correctAnswer);
          const shuffledOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1);
          options = [...shuffledOthers, correctAnswer].sort(() => 0.5 - Math.random());
        } else if (type === 'typing') {
          correctAnswer = nativeTranslation;
          promptWord = targetWord;
        } else if (type === 'typing-target') {
          correctAnswer = targetWord;
          promptWord = nativeTranslation;
        } else if (type === 'phonetics') {
          correctAnswer = word.transcription;
          promptWord = targetWord;
          const others = words.filter(w => w.transcription).map(w => w.transcription);
          const uniqueOthers = [...new Set(others)].filter(w => w !== correctAnswer);
          while (uniqueOthers.length < numOptions - 1) {
            uniqueOthers.push(`[${Math.random().toString(36).substring(7)}]`);
          }
          const shuffledOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1);
          options = [...shuffledOthers, correctAnswer].sort(() => 0.5 - Math.random());
        } else if (type === 'listening-phonetics') {
          correctAnswer = word.transcription;
          promptWord = '';
          const others = words.filter(w => w.transcription).map(w => w.transcription);
          const uniqueOthers = [...new Set(others)].filter(w => w !== correctAnswer);
          while (uniqueOthers.length < numOptions - 1) {
            uniqueOthers.push(`[${Math.random().toString(36).substring(7)}]`);
          }
          const shuffledOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1);
          options = [...shuffledOthers, correctAnswer].sort(() => 0.5 - Math.random());
        } else if (type === 'fill-in-the-blank') {
          const parts = targetWord.split(' ');
          if (parts.length > 1) {
            const hideIdx = Math.floor(Math.random() * parts.length);
            correctAnswer = parts[hideIdx];
            parts[hideIdx] = '_____';
            promptWord = parts.join(' ');
            hint = nativeTranslation;
            const others = words.flatMap(w => w.word.split(' ')).filter(w => w !== correctAnswer && w.length > 1);
            const shuffledOthers = [...new Set(others)].sort(() => 0.5 - Math.random()).slice(0, numOptions - 1);
            while(shuffledOthers.length < numOptions - 1) {
              shuffledOthers.push(Math.random().toString(36).substring(2, 2 + correctAnswer.length));
            }
            options = [...shuffledOthers, correctAnswer].sort(() => 0.5 - Math.random());
          } else {
            const len = targetWord.length;
            if (len > 3) {
              const hideLen = Math.max(2, Math.floor(len / 2));
              const hideStart = Math.floor(Math.random() * (len - hideLen + 1));
              correctAnswer = targetWord.substring(hideStart, hideStart + hideLen);
              promptWord = targetWord.substring(0, hideStart) + '_____' + targetWord.substring(hideStart + hideLen);
              hint = nativeTranslation;
              const others = words.filter(w => w.id !== word.id && w.word.length >= hideLen)
                                  .map(w => {
                                     const start = Math.floor(Math.random() * (w.word.length - hideLen + 1));
                                     return w.word.substring(start, start + hideLen);
                                  })
                                  .filter(sub => sub !== correctAnswer);
              const shuffledOthers = [...new Set(others)].sort(() => 0.5 - Math.random()).slice(0, numOptions - 1);
              while(shuffledOthers.length < numOptions - 1) {
                 let scrambled = correctAnswer.split('').sort(() => 0.5 - Math.random()).join('');
                 if (scrambled === correctAnswer) scrambled = scrambled.substring(1) + scrambled[0];
                 shuffledOthers.push(scrambled);
              }
              options = [...shuffledOthers, correctAnswer].sort(() => 0.5 - Math.random());
            } else {
               type = 'mcq-target';
               correctAnswer = targetWord;
               promptWord = nativeTranslation;
               const others = words.map(w => w.word);
               const uniqueOthers = [...new Set(others)].filter(w => w !== correctAnswer);
               const shuffledOthers = uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1);
               options = [...shuffledOthers, correctAnswer].sort(() => 0.5 - Math.random());
            }
          }
        }

        let characterBank: string[] | undefined;
        if (type === 'typing' || type === 'typing-target') {
          const langBeingTyped = type === 'typing-target' ? targetLang : uiLang;
          const answerChars = Array.from(new Set(correctAnswer.replace(/[^\p{L}\p{N}]/gu, '').split('')));
          let distractors: string[] = [];
          const alphabet = FULL_ALPHABETS[langBeingTyped];
          if (alphabet) {
            distractors = alphabet.filter(c => !answerChars.includes(c)).sort(() => 0.5 - Math.random()).slice(0, 5);
          } else {
            const otherWords = words.map(w => type === 'typing-target' ? w.word : (w.translations[uiLang] || w.translation)).join('');
            const otherChars = Array.from(new Set(otherWords.replace(/[^\p{L}\p{N}]/gu, '').split(''))).filter(c => !answerChars.includes(c));
            distractors = otherChars.sort(() => 0.5 - Math.random()).slice(0, 5);
          }
          characterBank = [...answerChars, ...distractors].sort(() => 0.5 - Math.random());
        }

        generated.push({ word, type, options, correctAnswer, promptWord, hint, characterBank });
      }
      setQuestions(generated);
      setIsGenerating(false);
    }, 800);
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    setLessonDifficulty(difficulty);
    setDifficultySelected(true);
    generateLessonQuestions(difficulty);
  };

  const currentQuestion = questions[currentQ];

  useEffect(() => {
    if (currentQuestion) {
      const mistakeWords = wrongWordIds.map(id => {
        const w = WORDS_BY_LANG[targetLang]?.find(word => word.id.toString() === id);
        return w ? `${w.word} (${w.translations[uiLang] || w.translation})` : id;
      });

      setLessonContext({
        currentWord: currentQuestion.promptWord || '',
        translation: currentQuestion.correctAnswer || '',
        mistakes: mistakeWords
      });
    }
    return () => {
      // Clear context when leaving lesson
      setLessonContext(null);
    };
  }, [currentQ, questions, status, wrongWordIds, setLessonContext, targetLang, uiLang]);

  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      setIsSpeechSupported(true);
    }
  }, []);

  useEffect(() => {
    if ((currentQuestion?.type === 'typing' || currentQuestion?.type === 'typing-target') && status === 'idle') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentQ, currentQuestion, status]);

  useEffect(() => {
    const fetchAIAids = async () => {
      if (status !== 'idle' && currentQuestion) {
        if (!isOnline) {
          setExamples([]);
          setIsFetchingExamples(false);
          setVisualAid(null);
          setIsFetchingVisualAid(false);
          addNotification(t.offline_ai_warning || 'AI analysis is unavailable offline', 'warning');
          return;
        }

        if (!isPremium) {
          setExamples([]);
          setIsFetchingExamples(false);
          setVisualAid(null);
          setIsFetchingVisualAid(false);
          return;
        }
        
        setIsFetchingExamples(true);
        setIsFetchingVisualAid(true);
        
        try {
          const wordToFetch = currentQuestion.type === 'mcq-native' || currentQuestion.type === 'typing' 
            ? currentQuestion.correctAnswer 
            : currentQuestion.promptWord;

          const targetWord = currentQuestion.word.word;

          // 1. Fetch Examples
          const fetchExamples = async () => {
            // Check if word already has examples in its definition
            if (currentQuestion.word.examples && currentQuestion.word.examples.length > 0) {
              setExamples(currentQuestion.word.examples);
              return;
            }

            // Check saved examples from the store
            const savedForWord = savedExamples.filter(ex => 
              ex.word.toLowerCase() === wordToFetch.toLowerCase() && 
              ex.targetLang === targetLang
            );
            if (savedForWord.length > 0) {
              setExamples(savedForWord.map(ex => ({
                sentence: ex.sentence,
                translation: ex.translation,
                source: 'social media'
              })));
              return;
            }
            
            try {
              const fetchedExamples = await fetchContextualExamples(wordToFetch, targetLang, uiLang);
              setExamples(fetchedExamples);
            } catch (err) {
              handleAppError(err, addNotification);
            }
          };

          // 2. Fetch Visual Aid
          const fetchVisual = async () => {
            const visualAidCacheKey = `visualAid_${targetLang}_${currentQuestion.word.id}`;
            const cachedVisualAid = localStorage.getItem(visualAidCacheKey);
            if (cachedVisualAid) {
              setVisualAid(cachedVisualAid);
            } else {
              const englishKeyword = currentQuestion.word.translations['en'] || currentQuestion.word.word;
              try {
                const res = await fetchVisualAid(currentQuestion.word.word, targetLang, englishKeyword);
                setVisualAid(res);
                if (res) {
                  localStorage.setItem(visualAidCacheKey, res);
                }
              } catch (err) {
                handleAppError(err, addNotification);
              }
            }
          };

          await Promise.all([fetchExamples(), fetchVisual()]);
        } catch (error) {
          handleAppError(error, addNotification);
        } finally {
          setIsFetchingExamples(false);
          setIsFetchingVisualAid(false);
        }
      } else if (status === 'idle') {
        setExamples([]);
        setVisualAid(null);
      }
    };

    fetchAIAids();
  }, [status, currentQuestion, targetLang, uiLang, savedExamples, isPremium]);

  const handleCheck = () => {
    if (status !== 'idle') {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setTypedAnswer('');
        setStatus('idle');
        setDogHintUsed(false);
        setDogMessage(null);
        setGrammarExplanation(null);
        setCorrectExplanation(null);
        setDeepDive(null);
        setPronunciationFeedback(null);
        setQuestionStartTime(Date.now());
      } else {
        let baseXP = 150;
        let baseCaps = 15;
        
        if (lessonDifficulty === 'easy') {
          baseXP = 100;
          baseCaps = 10;
        } else if (lessonDifficulty === 'hard') {
          baseXP = 250;
          baseCaps = 30;
        }

        const isPerfect = mistakesMade === 0;
        const finalXp = baseXP + xpGained + (isPerfect ? 50 : 0);
        setFinalXpEarned(finalXp);
        setFinalCreditsEarned(baseCaps);
        
        addXp(finalXp);
        addCredits(baseCaps);
        useEnergy('electronic');
        completeLesson(`${targetLang}_${id}`, isPerfect);
        logLessonComplete(id || 'unknown', 100 - (mistakesMade * 10), finalXp);
        
        // Chance to increase Intelligence on perfect lesson
        if (mistakesMade === 0 && Math.random() < 0.3) {
          updateSpecial('I', 1);
        }

        setShowSuccess(true);
        
        // Final big celebration burst
        const end = Date.now() + (3 * 1000);
        const colors = ['#18ff62', '#00ff00', '#ffffff', '#ffd700', '#ff0000'];

        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
      return;
    }

    let isCorrect = false;
    if (currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target') {
      const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\s]/gu, '').trim();
      isCorrect = normalize(typedAnswer) === normalize(currentQuestion.correctAnswer);
    } else {
      isCorrect = selected === currentQuestion.correctAnswer;
    }

    if (isCorrect) {
      setStatus('correct');
      
      // Celebratory animation for correct answer
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#18ff62', '#00ff00', '#ffffff'],
        zIndex: 1000
      });

      setResults(prev => {
        const newResults = [...prev];
        newResults[currentQ] = 'correct';
        return newResults;
      });
      
      const timeTaken = (Date.now() - questionStartTime) / 1000;
      const comboMultiplier = 1 + (combo * 0.1);
      const difficultyMultiplier = lessonDifficulty === 'hard' ? 1.5 : lessonDifficulty === 'easy' ? 0.8 : 1.0;
      let earned = Math.floor(10 * comboMultiplier * difficultyMultiplier);
      
      // Perception bonus: Chance for Critical Review (extra XP)
      const perception = special.P || 1;
      if (Math.random() < (perception * 0.05)) {
        earned *= 2;
        setTimeout(() => addNotification('Critical Review! Bonus XP!', 'success'), 500);
      }

      // Agility bonus: Extra XP for fast answers (under 4 seconds)
      const agility = special.A || 1;
      if (timeTaken < 4) {
        const isDeadManSprinting = equippedPerks.includes('dead_man_sprinting') && health < 25;
        const speedBonusFactor = isDeadManSprinting ? 0.5 : (agility * 0.05);
        const agilityBonus = Math.floor(earned * speedBonusFactor);
        earned += agilityBonus;
        
        if (isDeadManSprinting) {
          setTimeout(() => addNotification(`Dead Man Sprinting! +${agilityBonus} XP`, 'warning'), 700);
        } else {
          setTimeout(() => addNotification(`Agility Bonus! +${agilityBonus} XP`, 'success'), 700);
        }
      }

      setXpGained(prev => prev + earned);
      setCombo(c => c + 1);
      repairMistake(currentQuestion.word.id.toString(), targetLang, true);
      
      // AI cheer on streak
      if (isPremium && (combo === 2 || (combo > 5 && Math.random() > 0.5))) {
        const mistakeWords = wrongWordIds.map(id => {
          const w = WORDS_BY_LANG[targetLang]?.find(word => word.id.toString() === id);
          return w ? `${w.word} (${w.translations[uiLang] || w.translation})` : id;
        });
        
        fetchAIHint('', '', targetLang, uiLang, '', true, {
          currentWord: currentQuestion.promptWord || '',
          translation: currentQuestion.correctAnswer || '',
          mistakes: mistakeWords
        }, lessonDifficulty).then(msg => {
          if (msg) {
            setDogMessage(msg);
            setTimeout(() => setDogMessage(null), 4000);
          } else {
            setDogMessage(t.ai_assistant_cheer || 'Great job! Keep it up!');
            setTimeout(() => setDogMessage(null), 3000);
          }
        });
      } else if (!isPremium && (combo === 2 || (combo > 5 && Math.random() > 0.5))) {
        setDogMessage(t.ai_assistant_cheer || 'Great job! Keep it up!');
        setTimeout(() => setDogMessage(null), 3000);
      }

      if (combo > 0) {
        addNotification(`+${earned} XP (${combo + 1}x Combo!)`, 'success');
      } else {
        addNotification(`+${earned} XP`, 'success');
      }

      // Fetch correct answer explanation/fact if premium
      if (isPremium) {
        setIsFetchingCorrectExplanation(true);
        const mistakeWords = wrongWordIds.map(id => {
          const w = WORDS_BY_LANG[targetLang]?.find(word => word.id.toString() === id);
          return w ? `${w.word} (${w.translations[uiLang] || w.translation})` : id;
        });

        fetchCorrectExplanation(
          currentQuestion.promptWord || currentQuestion.correctAnswer,
          currentQuestion.correctAnswer,
          targetLang,
          uiLang,
          {
            currentWord: currentQuestion.promptWord || '',
            translation: currentQuestion.correctAnswer || '',
            mistakes: mistakeWords
          },
          lessonDifficulty
        ).then(explanation => {
          setCorrectExplanation(explanation);
          setIsFetchingCorrectExplanation(false);
        });
      }
    } else {
      setStatus('incorrect');
      setResults(prev => {
        const newResults = [...prev];
        newResults[currentQ] = 'incorrect';
        return newResults;
      });
      setCombo(0);
      setMistakesMade(m => m + 1);
      repairMistake(currentQuestion.word.id.toString(), targetLang, false);
      setWrongWordIds(prev => {
        const id = currentQuestion.word.id.toString();
        if (!prev.includes(id)) return [...prev, id];
        return prev;
      });
      addMistake(currentQuestion.word.id.toString(), targetLang);
      const { died, prevented } = takeDamage(20);
      
      // AI barks on mistake
      setDogMessage(t.ai_assistant_mistake || 'You\'ll get it next time!');
      setTimeout(() => setDogMessage(null), 3000);
      
      if (died) {
        addNotification(t.critical_failure, 'error');
        setTimeout(() => navigate('/'), 2000);
      } else if (!prevented) {
        addNotification(t.incorrect_hp, 'error');
      }
    }
  };

  const handleFennecHint = async () => {
    if (dogHintUsed || status !== 'idle') return;
    
    if (!isOnline) {
      addNotification(t.offline_ai_warning || 'AI hints are unavailable offline', 'warning');
      return;
    }

    if (!isPremium) {
      addNotification(t.ai_hint_premium || 'AI hints are a Premium feature', 'info');
      return;
    }

    setDogHintUsed(true);
    setDogMessage(t.ai_assistant_thinking || 'Fennec is sniffing for clues...');
    
    try {
      const mistakeWords = wrongWordIds.map(id => {
        const w = WORDS_BY_LANG[targetLang]?.find(word => word.id.toString() === id);
        return w ? `${w.word} (${w.translations[uiLang] || w.translation})` : id;
      });

      const hint = await fetchAIHint(
        currentQuestion.promptWord,
        currentQuestion.type,
        targetLang,
        uiLang,
        currentQuestion.correctAnswer,
        false,
        {
          currentWord: currentQuestion.promptWord || '',
          translation: currentQuestion.correctAnswer || '',
          mistakes: mistakeWords
        },
        lessonDifficulty
      );

      if (hint) {
        setDogMessage(hint);
      } else {
        setDogMessage(t.ai_assistant_hint || 'Try this...');
      }
    } catch (error) {
      handleAppError(error, addNotification);
      setDogMessage(null);
      setDogHintUsed(false);
    }
    
    setTimeout(() => setDogMessage(null), 6000);

    if (currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target') {
      // Reveal first 2 letters
      setTypedAnswer(currentQuestion.correctAnswer.substring(0, 2));
    } else {
      // Remove one incorrect option
      const incorrectOptions = currentQuestion.options.filter(o => o !== currentQuestion.correctAnswer);
      if (incorrectOptions.length > 0) {
        setSelected(currentQuestion.correctAnswer);
      }
    }
  };

  const handleDeepDive = async () => {
    if (!currentQuestion || isFetchingDeepDive || !isPremium) return;
    
    if (!isOnline) {
      addNotification(t.offline_ai_warning || 'AI analysis is unavailable offline', 'warning');
      return;
    }

    setIsFetchingDeepDive(true);
    try {
      const wordToFetch = currentQuestion.type === 'mcq-native' || currentQuestion.type === 'typing' 
        ? currentQuestion.correctAnswer 
        : currentQuestion.promptWord;
      
      const res = await fetchDeepDive(wordToFetch, targetLang, uiLang, lessonDifficulty);
      setDeepDive(res);

      if (res) {
        // Lore Specialist Perk Effect: +25% XP from explanations
        if (equippedPerks.includes('lore_specialist')) {
          const bonusXp = 25;
          setXpGained(prev => prev + bonusXp);
          addNotification(` Lore Specialist: +${bonusXp} XP`, 'success');
        }

        // Scavenger's Tongue Perk Effect: 20% chance for extra caps
        if (equippedPerks.includes('scavengers_tongue') && Math.random() < 0.20) {
          const bonusCaps = Math.floor(Math.random() * 10) + 5;
          addCredits(bonusCaps);
          addNotification(` Scavenger's Tongue: +${bonusCaps} Caps found!`, 'success');
        }
      }
    } catch (error) {
      handleAppError(error, addNotification);
    } finally {
      setIsFetchingDeepDive(false);
    }
  };

  const handleFetchGrammar = async () => {
    if (!currentQuestion || isFetchingGrammar || !isPremium) return;
    
    const userAnswer = (currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target') ? typedAnswer : (selected || '');
    setIsFetchingGrammar(true);
    
    const mistakeWords = wrongWordIds.map(id => {
      const w = WORDS_BY_LANG[targetLang]?.find(word => word.id.toString() === id);
      return w ? `${w.word} (${w.translations[uiLang] || w.translation})` : id;
    });

    try {
      const explanation = await fetchGrammarExplanation(
        currentQuestion.promptWord,
        userAnswer,
        currentQuestion.correctAnswer,
        targetLang,
        uiLang,
        {
          currentWord: currentQuestion.promptWord || '',
          translation: currentQuestion.correctAnswer || '',
          mistakes: mistakeWords
        },
        lessonDifficulty
      );
      setGrammarExplanation(explanation);
      
      // Lore Specialist Perk Effect: +25% XP from Grammar explanations
      if (explanation && equippedPerks.includes('lore_specialist')) {
        const bonusXp = 15;
        setXpGained(prev => prev + bonusXp);
        addNotification(` Lore Specialist: +${bonusXp} XP`, 'success');
      }
    } catch (e) {
      console.error("Failed to fetch grammar explanation", e);
    } finally {
      setIsFetchingGrammar(false);
    }
  };

  if (!currentQuestion) return null;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        <SEO 
          title={`${t.sector_cleared || 'Lesson Complete'}!`}
          description="Congratulations on completing the lesson!"
        />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                top: '100%', 
                left: `${Math.random() * 100}%`,
                scale: Math.random() * 0.5 + 0.5,
                opacity: 0
              }}
              animate={{ 
                top: '-10%',
                opacity: [0, 1, 1, 0],
                rotate: 360
              }}
              transition={{ 
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute"
            >
              {i % 3 === 0 ? <Sparkles className="text-amber-400 w-4 h-4" /> : 
               i % 3 === 1 ? <Star className="text-indigo-400 w-3 h-3 fill-current" /> : 
               <div className="w-2 h-2 rounded-full bg-emerald-400" />}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 md:p-12 w-full max-w-lg text-center relative z-10 border border-slate-100 dark:border-slate-700"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 relative inline-block"
          >
            <div className={`absolute inset-0 blur-3xl rounded-full animate-pulse ${mistakesMade === 0 ? 'bg-emerald-400/20' : 'bg-amber-400/20'}`}></div>
            <div className={`relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br rounded-full flex items-center justify-center shadow-xl mx-auto border-4 border-white dark:border-slate-700 ${
              mistakesMade === 0 
                ? 'from-emerald-400 to-teal-500 shadow-emerald-500/30' 
                : 'from-amber-400 to-orange-500 shadow-amber-500/30'
            }`}>
              {mistakesMade === 0 ? (
                <div className="relative">
                  <Trophy className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={2.5} />
                  <motion.div
                    initial={{ scale: 0, x: 20, y: -20 }}
                    animate={{ scale: 1, x: 10, y: -10 }}
                    className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" fill="currentColor" />
                  </motion.div>
                </div>
              ) : (
                <Trophy className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={2.5} />
              )}
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className={`w-8 h-8 ${mistakesMade === 0 ? 'text-emerald-500' : 'text-amber-500'}`} />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight"
          >
            {t.sector_cleared || 'Sector Cleared!'}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 dark:text-slate-400 font-medium mb-10"
          >
            {t.lesson_complete_desc || 'You have successfully completed the training module.'}
          </motion.p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/50"
            >
              <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                <Zap className="w-5 h-5 fill-current" />
                <span className="text-xs font-black uppercase tracking-widest">XP Earned</span>
              </div>
              <div className="text-3xl font-black text-indigo-900 dark:text-indigo-100">+{finalXpEarned}</div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-800/50"
            >
              <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <Award className="w-5 h-5 fill-current" />
                <span className="text-xs font-black uppercase tracking-widest">Credits</span>
              </div>
              <div className="text-3xl font-black text-amber-900 dark:text-amber-100">+{finalCreditsEarned}</div>
            </motion.div>
          </div>

          {mistakesMade === 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-10 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Check className="w-5 h-5" strokeWidth={3} />
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                {t.perfect_lesson || 'Perfect Lesson!'}
              </span>
            </motion.div>
          )}

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/', { state: { lessonCompleted: true, completedLessonId: id } })}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-xl shadow-xl shadow-indigo-500/30 transition-all uppercase tracking-wider"
          >
            {t.continue || 'Continue'}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const isInputValid = (currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target') ? typedAnswer.trim().length > 0 : selected !== null;

  if (!difficultySelected) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/20 via-transparent to-transparent">
        <SEO 
          title={`${t.lesson || 'Lesson'} - ${t.select_difficulty || 'Select Difficulty'}`} 
          description="Choose your challenge level for this lesson."
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
              <Zap className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {t.select_difficulty || 'Select Challenge Level'}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              {t.difficulty_influence_desc || 'Difficulty affects the number of questions, types of tasks, and the insights provided by Fennec.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['easy', 'medium', 'hard'] as const).map((diff) => {
              const isActive = lessonDifficulty === diff;
              const config = {
                easy: {
                  icon: <Star className="w-6 h-6" />,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-500/10',
                  border: 'border-emerald-500/20',
                  hover: 'hover:border-emerald-500',
                  desc: t.difficulty_easy_desc || 'Fewer questions, multiple choice focus, encouraging feedback.'
                },
                medium: {
                  icon: <Zap className="w-6 h-6" />,
                  color: 'text-amber-500',
                  bg: 'bg-amber-500/10',
                  border: 'border-amber-500/20',
                  hover: 'hover:border-amber-500',
                  desc: t.difficulty_medium_desc || 'Balanced mix of tasks and deeper linguistic analysis.'
                },
                hard: {
                  icon: <Crosshair className="w-6 h-6" />,
                  color: 'text-rose-500',
                  bg: 'bg-rose-500/10',
                  border: 'border-rose-500/20',
                  hover: 'hover:border-rose-500',
                  desc: t.difficulty_hard_desc || 'Extreme typing tasks, strict grading, and etymological deep dives.'
                }
              }[diff];

              return (
                <motion.button
                  key={diff}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDifficultySelect(diff)}
                  className={`relative p-8 rounded-3xl border-2 transition-all text-left bg-white dark:bg-slate-900 flex flex-col gap-4 group beveled-edge ${
                    isActive 
                      ? `${config.border} ring-4 ring-primary/10 shadow-xl` 
                      : `border-slate-200 dark:border-slate-800 shadow-sm ${config.hover}`
                  }`}
                >
                  <div className={`p-3 rounded-2xl w-fit ${config.bg} ${config.color} transition-transform group-hover:scale-110`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-1">
                      {t[`difficulty_${diff}` as keyof typeof t] || diff}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {config.desc}
                    </p>
                  </div>
                  <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
                    <span>{diff === 'easy' ? '100 XP' : diff === 'hard' ? '250+ XP' : '150 XP'}</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-2xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
            >
              {t.back_to_map || 'Return to Map'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isGenerating || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <SEO 
          title={t.generating_curriculum || 'Initializing Module'} 
          description="Preparing your personalized language lesson."
        />
        <div className="space-y-8 flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full relative"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </motion.div>
          <div className="text-center">
            <h2 className="text-xl font-mono font-black text-primary uppercase tracking-[0.3em] mb-2">
              {t.generating_curriculum || 'Initializing Learning Module'}
            </h2>
            <div className="flex gap-1 justify-center">
              <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-primary rounded-full" />
              <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
              <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>
          <PetDisplay className="scale-125" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-white relative overflow-hidden">
      <SEO 
        title={`${t.goat_exam || 'Lesson'} - ${currentLang?.name[uiLang as keyof typeof currentLang.name] || currentLang?.name.en}`}
        description="Take the lesson to improve your language skills."
      />
      
      {/* Course Map Modal */}
      <AnimatePresence>
        {showCourseMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
            onClick={() => setShowCourseMap(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Map className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-lg">{t.course_map}</h2>
                </div>
                <button 
                  onClick={() => setShowCourseMap(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-3">
                {courseData.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(`${targetLang}_${lesson.id}`);
                  const isCurrent = !isCompleted && !courseData.slice(0, index).some(l => !completedLessons.includes(`${targetLang}_${l.id}`));
                  const translation = COURSE_TRANSLATIONS[uiLang]?.[lesson.id] || COURSE_TRANSLATIONS['en'][lesson.id];
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setShowCourseMap(false);
                        const targetLessonId = lesson.lessons.find((l: any) => !completedLessons.includes(`${targetLang}_${l.id}`))?.id || lesson.lessons[0].id;
                        if (targetLessonId !== lessonId) {
                          navigate(`/lesson/${targetLessonId}`);
                        }
                      }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                        lesson.id === lessonId 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-md' 
                          : isCompleted 
                            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600' 
                            : isCurrent
                              ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        lesson.id === lessonId ? 'bg-indigo-500 text-white' :
                        isCompleted ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' :
                        isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 border border-indigo-200 dark:border-indigo-800' :
                        'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {isCompleted && lesson.id !== lessonId ? <CheckCircle2 className="w-5 h-5" /> : 
                         isCurrent && lesson.id !== lessonId ? <Crosshair className="w-5 h-5" /> : 
                         lesson.id === lessonId ? <Map className="w-5 h-5" /> :
                         <Lock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                          {t.sector || 'Module'} {lesson.id}
                        </div>
                        <div className={`font-bold ${lesson.id === lessonId ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>
                          {translation.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Header & Progress */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b-2 border-slate-200 dark:border-slate-800 shadow-sm">
        <header className="h-20 flex items-center px-6 max-w-4xl mx-auto w-full gap-5">
          <button 
            onClick={() => navigate('/')} 
            className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowCourseMap(true)} 
            className="p-2.5 text-primary hover:text-primary-foreground hover:bg-primary transition-all rounded border-2 border-primary/20 hover:border-primary shadow-sm"
          >
            <Map className="w-5 h-5" />
          </button>
          
          <div className="flex-1 px-2 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-[0.2em] leading-none">
                PROC_STRE_LOG :: {currentQ + 1} / {questions.length}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
              {/* Animated Glow Fill */}
              <motion.div 
                initial={false}
                animate={{ width: `${(results.filter(Boolean).length / questions.length) * 100}%` }}
                className="absolute inset-y-0 left-0 bg-primary/30 z-0"
                transition={{ type: 'spring', stiffness: 40, damping: 20 }}
              />
              
              {/* Progress Markers Track */}
              <div className="absolute inset-0 flex px-0.5 py-0.5 gap-1">
                {questions.map((_, idx) => {
                  const result = results[idx];
                  const isCurrent = idx === currentQ;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={false}
                      animate={{
                        backgroundColor: 
                          result === 'correct' ? '#10b981' : 
                          result === 'incorrect' ? '#f43f5e' : 
                          isCurrent ? 'var(--color-primary)' : 
                          'rgba(148, 163, 184, 0.1)',
                        opacity: isCurrent ? 1 : (result ? 0.8 : 0.4),
                        scaleY: isCurrent ? 1.2 : 1,
                      }}
                      className={`flex-1 h-full rounded-sm transition-all relative ${
                        isCurrent ? 'shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)] z-10' : ''
                      }`}
                    >
                      {/* Sub-progress fill indicator for the current question */}
                      {isCurrent && (
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                          className="absolute inset-y-0 left-0 bg-primary/40 rounded-sm"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1.5 min-w-[60px]">
              <div className="flex items-center gap-2 text-rose-500 font-mono font-black text-[10px] uppercase tracking-widest leading-none">
                <Heart className="w-4 h-4 fill-rose-500" />
                {health}%
              </div>
              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden">
                <motion.div 
                   animate={{ width: `${health}%` }}
                   className="h-full bg-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">{xpGained}</span>
            </div>
          </div>
        </header>

        {/* Question Counter / Mini Stats */}
        <div className="max-w-4xl mx-auto w-full px-6 py-1 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {t.question || 'Question'} {currentQ + 1} / {questions.length}
          </div>
          <div className="flex gap-4">
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {results.filter(r => r === 'correct').length}
            </div>
            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
              <X className="w-3 h-3" />
              {results.filter(r => r === 'incorrect').length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 pt-8 relative z-0">
        <AnimatePresence>
          {status === 'correct' && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="w-40 h-40 rounded-full bg-emerald-500/10 flex items-center justify-center backdrop-blur-sm border-2 border-emerald-500/20 shadow-2xl">
                <CheckCircle2 className="w-24 h-24 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" strokeWidth={3} />
              </div>
            </motion.div>
          )}
          {status === 'incorrect' && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, x: -10 }}
              animate={{ scale: 1.1, opacity: 1, x: 0 }}
              exit={{ scale: 0.5, opacity: 0, x: 10 }}
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="w-40 h-40 rounded-full bg-rose-500/10 flex items-center justify-center backdrop-blur-sm border-2 border-rose-500/20 shadow-2xl">
                <X className="w-24 h-24 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" strokeWidth={3} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isPremium && (
          <div className="mb-6">
            <AdBanner />
          </div>
        )}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">
              {t.question} {currentQ + 1} {t.of} {questions.length}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {currentQuestion.type === 'listening' 
                ? t.listening_instruction
                : currentQuestion.type === 'listening-phonetics'
                ? t.listening_phonetics_instruction
                : currentQuestion.type === 'typing'
                ? t.typing_native_instruction
                : currentQuestion.type === 'typing-target'
                ? t.typing_target_instruction
                : currentQuestion.type === 'phonetics'
                ? t.phonetics_instruction
                : currentQuestion.type === 'fill-in-the-blank'
                ? t.fill_blank_instruction
                : topicId === 8
                ? t.grammar_instruction
                : `${t.translate_packet} ${currentQuestion.type === 'mcq-target' ? (t.to_lang + ' ') + (currentLang?.name[uiLang as keyof typeof currentLang.name] || currentLang?.name.en) : ''}:`
              }
            </p>
          </div>
          
          {/* AI Helper */}
          <div className="relative flex flex-col items-end">
            <AnimatePresence>
              {dogMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full mb-3 right-0 flex items-end gap-2 max-w-[280px] z-20"
                >
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-100 px-5 py-3 rounded-3xl rounded-br-sm shadow-xl text-sm font-medium whitespace-normal relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-amber-500"></div>
                    {dogMessage}
                  </div>
                  <PetDisplay size="sm" hideMessage className="mb-1" />
                </motion.div>
              )}
            </AnimatePresence>
            <Tooltip content={t.ask_ai_assistant || 'Ask Fennec for a hint'} position="top">
              <button
                onClick={handleFennecHint}
                disabled={dogHintUsed || status !== 'idle'}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-sm ${
                  dogHintUsed || status !== 'idle'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/50 shadow-sm border border-amber-200 dark:border-amber-800/50'
                }`}
              >
                <PetDisplay size="sm" hideMessage className="border-none shadow-none bg-transparent p-0" />
                <span className="hidden sm:inline">{t.ask_ai_assistant || 'Fennec'}</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {currentQuestion.type === 'listening' || currentQuestion.type === 'listening-phonetics' ? (
          <div className="flex flex-col items-center justify-center gap-6 mb-12 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Visual Aid in Listening Mode */}
            {isFetchingVisualAid ? (
              <div className="relative z-10 w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mb-2 animate-pulse bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-300 animate-bounce" />
              </div>
            ) : visualAid && status !== 'idle' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mb-2"
              >
                <img src={visualAid} alt="Visual Aid" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            ) : !isPremium && status !== 'idle' ? (
              <div className="relative z-10 w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mb-2 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-4 text-center">
                <Lock className="w-6 h-6 text-slate-300 mb-2" />
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">AI Visual Aid</p>
                <button onClick={buyPremium} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">
                  {t.upgrade_now}
                </button>
              </div>
            ) : null}

            <Tooltip content="Listen to pronunciation" position="top">
              <button 
                onClick={() => playPronunciation(currentQuestion.word.word, targetLang)}
                className="relative z-10 bg-indigo-500 text-white p-8 rounded-full shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 hover:scale-110 hover:shadow-indigo-500/40 transition-all focus:ring-4 focus:ring-indigo-500/30 outline-none"
              >
                <Volume2 className="w-12 h-12" />
              </button>
            </Tooltip>
            <div className="relative z-10 text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">
              [ PLAY AUDIO ]
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6 mb-12 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group volumetric-shadow transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Visual Aid in Normal Mode */}
            {isFetchingVisualAid ? (
              <div className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-inner shrink-0 animate-pulse bg-slate-100 dark:bg-slate-700 flex items-center justify-center beveled-edge">
                <ImageIcon className="w-6 h-6 text-slate-300 animate-bounce" />
              </div>
            ) : visualAid && status !== 'idle' ? (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md shrink-0 beveled-edge"
              >
                <img src={visualAid} alt="Visual Aid" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            ) : !isPremium && status !== 'idle' ? (
              <div className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md shrink-0 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-2 text-center beveled-edge">
                <Lock className="w-4 h-4 text-slate-300 mb-1" />
                <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-1 leading-tight">AI Visual Aid</p>
                <button onClick={buyPremium} className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline leading-tight">
                  {t.upgrade_now}
                </button>
              </div>
            ) : (
              <div className="relative z-10 text-6xl drop-shadow-md">
                {currentQuestion.type === 'mcq-target' || currentQuestion.type === 'phonetics' || currentQuestion.type === 'typing-target' || currentQuestion.type === 'fill-in-the-blank' ? '🌐' : currentLang?.flag}
              </div>
            )}

            <div className="relative z-10 flex-1">
              <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                {currentQuestion.promptWord}
              </div>
              {currentQuestion.hint && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl rounded-tl-sm border border-indigo-100 dark:border-indigo-800/50 text-sm font-bold shadow-sm">
                    {currentQuestion.hint}
                  </div>
                </div>
              )}
              {(currentQuestion.type === 'mcq-native' || currentQuestion.type === 'typing') && (
                <div className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                  {currentQuestion.word.transcription}
                </div>
              )}
            </div>
            {(currentQuestion.type === 'mcq-native' || currentQuestion.type === 'mcq-target' || currentQuestion.type === 'phonetics' || currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target' || currentQuestion.type === 'fill-in-the-blank') && (
              <Tooltip content="Listen to pronunciation" position="top">
                <button 
                  onClick={() => {
                    let wordToPlay = currentQuestion.promptWord;
                    let langToPlay: any = uiLang;
                    
                    if (['mcq-native', 'typing', 'phonetics', 'fill-in-the-blank'].includes(currentQuestion.type)) {
                      wordToPlay = currentQuestion.word.word;
                      langToPlay = targetLang;
                    }
                    
                    playPronunciation(wordToPlay, langToPlay as any);
                  }}
                  className="relative z-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl hover:bg-indigo-200 dark:hover:bg-indigo-800/50 hover:shadow-md hover:-translate-y-1 transition-all focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </Tooltip>
            )}
          </div>
        )}

        {currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target' ? (
          <div className="mt-auto mb-12">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {currentQuestion.type === 'typing-target' ? t.special_characters : t.keyboard}
              </div>
              <button
                onClick={() => setIsKeyboardVisible(!isKeyboardVisible)}
                className="p-2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title={isKeyboardVisible ? t.hide_keyboard : t.show_keyboard}
              >
                <Keyboard className={`w-5 h-5 ${isKeyboardVisible ? 'text-indigo-500' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {isKeyboardVisible && status === 'idle' && (() => {
                const langBeingTyped = currentQuestion.type === 'typing-target' ? targetLang : uiLang;
                const specialChars = SPECIAL_CHARS[langBeingTyped] || [];
                const fullAlphabet = FULL_ALPHABETS[langBeingTyped];
                const characterBank = currentQuestion.characterBank || [];
                
                const charsToShow = (showFullKeyboard && fullAlphabet) ? fullAlphabet : [...new Set([...characterBank, ...specialChars])];
                
                if (charsToShow && charsToShow.length > 0) {
                  return (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col items-center gap-2 mb-6">
                        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                          {charsToShow.map((char, idx) => (
                            <button
                              key={`${char}-${idx}`}
                              type="button"
                              onClick={() => {
                                setTypedAnswer(prev => prev + char);
                                inputRef.current?.focus();
                              }}
                              disabled={status !== 'idle'}
                              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {char}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setTypedAnswer(prev => prev + ' ');
                              inputRef.current?.focus();
                            }}
                            disabled={status !== 'idle'}
                            className="px-4 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t.space}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTypedAnswer(prev => prev.slice(0, -1));
                              inputRef.current?.focus();
                            }}
                            disabled={status !== 'idle'}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-600 hover:text-rose-600 dark:hover:text-rose-400 hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t.backspace}
                          >
                            <Delete className="w-5 h-5" />
                          </button>
                        </div>
                        {fullAlphabet && (
                          <button
                            type="button"
                            onClick={() => setShowFullKeyboard(!showFullKeyboard)}
                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 mt-1"
                          >
                            <Keyboard className="w-4 h-4" />
                            {showFullKeyboard ? t.hide_full_alphabet : t.show_full_alphabet}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                }
                return null;
              })()}
            </AnimatePresence>
            <div className="relative flex items-center group">
              {status === 'correct' ? (
                <div className="absolute left-6 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-bounce-short" />
                </div>
              ) : status === 'incorrect' ? (
                <div className="absolute left-6 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-500 animate-shake" />
                </div>
              ) : (
                <Keyboard className="absolute left-6 w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={typedAnswer}
                onChange={(e) => {
                  const val = e.target.value;
                  setTypedAnswer(val.replace(/[^\p{L}\s]/gu, ''));
                }}
                disabled={status !== 'idle'}
                placeholder={t.type_answer_placeholder}
                className={`w-full bg-white dark:bg-slate-800 border-2 text-xl p-6 pl-16 pr-32 rounded-2xl outline-none transition-all shadow-inner volumetric-shadow-slate hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-70 focus:volumetric-shadow-indigo ${
                  status === 'correct' 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/10' 
                    : status === 'incorrect'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 shadow-lg shadow-rose-500/10'
                      : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isInputValid) {
                    handleCheck();
                  }
                }}
              />
              <div className="absolute right-6 flex items-center gap-2">
                <button
                  onClick={() => setIsVirtualKeyboardOpen(!isVirtualKeyboardOpen)}
                  className={`p-2 rounded-xl transition-all ${
                    isVirtualKeyboardOpen 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-500'
                  }`}
                  title={t.virtual_keyboard || 'Virtual Keyboard'}
                >
                  <KeyboardIcon className="w-6 h-6" />
                </button>
                {isSpeechSupported && status === 'idle' && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-3 rounded-xl transition-all ${
                      isListening 
                        ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                    title={isListening ? t.stop_recording : t.speak}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                )}
              </div>
            </div>

            <VirtualKeyboard
              isOpen={isVirtualKeyboardOpen}
              onClose={() => setIsVirtualKeyboardOpen(false)}
              onInput={(char) => {
                setTypedAnswer(prev => prev + char);
                inputRef.current?.focus();
              }}
              onDelete={() => {
                setTypedAnswer(prev => prev.slice(0, -1));
                inputRef.current?.focus();
              }}
              onEnter={() => {
                setIsVirtualKeyboardOpen(false);
                if (isInputValid) handleCheck();
              }}
              language={(currentQuestion.type === 'typing-target' ? targetLang : uiLang) as any}
            />

            {/* Pronunciation Feedback */}
            <AnimatePresence>
              {(isFetchingPronunciation || pronunciationFeedback) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`mt-4 p-4 rounded-2xl border-2 ${
                    isFetchingPronunciation 
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 animate-pulse' 
                      : pronunciationFeedback?.isCorrect 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' 
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
                  }`}
                >
                  {isFetchingPronunciation ? (
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <Bot className="w-5 h-5 animate-spin" />
                      <span className="font-bold text-sm uppercase tracking-widest">{t.analyzing_pronunciation}</span>
                    </div>
                  ) : pronunciationFeedback && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {pronunciationFeedback.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          )}
                          <span className={`font-bold text-sm uppercase tracking-widest ${pronunciationFeedback.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {pronunciationFeedback.isCorrect ? t.great_pronunciation : t.needs_practice}
                          </span>
                        </div>
                        {pronunciationFeedback.phoneticSpelling && (
                          <div className="text-xs font-mono bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400">
                            [{pronunciationFeedback.phoneticSpelling}]
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {pronunciationFeedback.feedback}
                      </p>
                      {pronunciationFeedback.tips && pronunciationFeedback.tips.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {pronunciationFeedback.tips.map((tip, i) => (
                            <span key={i} className="text-[10px] font-bold bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded-full text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                              {tip}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {status !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: [0.9, 1.05, 1], y: 0 }}
                transition={{ duration: 0.4, type: "spring", damping: 12 }}
                className="mt-6 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl"
              >
                <div className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{t.correct_answer_label || 'Correct Answer'}</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{currentQuestion.correctAnswer}</div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-auto mb-12">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={opt}
                onClick={() => status === 'idle' && setSelected(opt)}
                className={`p-5 text-left font-bold text-lg transition-all rounded-2xl border-2 flex items-center gap-4 beveled-edge ${
                  status !== 'idle'
                    ? opt === currentQuestion.correctAnswer
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02] volumetric-shadow-emerald ring-2 ring-emerald-500/50'
                      : opt === selected
                        ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 shadow-md scale-[0.98] active:translate-y-0.5'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none shadow-sm'
                    : selected === opt
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-md scale-[1.02] volumetric-shadow-indigo'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md hover:-translate-y-1 active:translate-y-0 shadow-sm'
                }`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 transition-colors ${
                  status !== 'idle'
                    ? opt === currentQuestion.correctAnswer
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : opt === selected
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    : selected === opt 
                      ? 'bg-indigo-500 text-white shadow-sm' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {status !== 'idle' && opt === currentQuestion.correctAnswer ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : status !== 'idle' && opt === selected && selected !== currentQuestion.correctAnswer ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    idx + 1
                  )}
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Contextual Examples Display */}
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-12 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-bold text-lg">{t.contextual_examples_title}</h3>
              {!isPremium && <Lock className="w-4 h-4 text-amber-500 ml-auto" />}
            </div>
            
            {!isPremium ? (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  {t.premium_only_ai_desc || 'AI-powered examples are available for Premium users.'}
                </p>
                <button
                  onClick={buyPremium}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm"
                >
                  {t.unlock_ai || 'Unlock AI Power'}
                </button>
                <div className="mt-6">
                  <AdBanner />
                </div>
              </div>
            ) : isFetchingExamples ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : examples.length > 0 ? (
              <div className="flex flex-col gap-4">
                {examples.map((ex, idx) => (
                  <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 last:pb-0 relative group/ex">
                    <div className="absolute top-0 right-0 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const wordToSave = currentQuestion.type === 'mcq-native' || currentQuestion.type === 'typing' 
                            ? currentQuestion.correctAnswer 
                            : currentQuestion.promptWord;
                          saveExample(wordToSave, ex, targetLang);
                          addNotification(t.example_saved || 'Example saved!', 'success');
                        }}
                        className={`p-1.5 rounded-lg transition-all ${
                          savedExamples.some(se => se.sentence === ex.sentence)
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                        title={t.save_example || 'Save Example'}
                      >
                        <Star className={`w-3.5 h-3.5 ${savedExamples.some(se => se.sentence === ex.sentence) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium pr-8">"{ex.sentence}"</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{ex.translation}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                        {ex.source === 'news' && <Newspaper className="w-3 h-3" />}
                        {ex.source === 'books' && <Book className="w-3 h-3" />}
                        {ex.source === 'social media' && <MessageCircle className="w-3 h-3" />}
                        {ex.sourceName || ex.source}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">
                {t.no_examples_found}
              </p>
            )}
          </motion.div>
        )}

        {/* Deep Dive Display */}
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 mb-12 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Zap className="w-5 h-5" />
                <h3 className="font-bold text-lg">{t.deep_dive || 'Deep Dive'}</h3>
              </div>
              {!deepDive && !isFetchingDeepDive && (
                <button
                  onClick={handleDeepDive}
                  className={`text-xs font-bold uppercase tracking-widest hover:underline ${!isPremium ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`}
                >
                  {t.analyze_word || 'Analyze Word'} {!isPremium && <Lock className="w-3 h-3 inline ml-1" />}
                </button>
              )}
            </div>

            {!isPremium && !deepDive ? (
              <div className="text-center py-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  {t.upgrade_deep_dive}
                </p>
                <button onClick={buyPremium} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
                  {t.upgrade_now}
                </button>
              </div>
            ) : isFetchingDeepDive ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </div>
            ) : deepDive ? (
              <div className="space-y-6 text-left">
                {deepDive.etymology && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <History className="w-3 h-3" />
                      Etymology
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{deepDive.etymology}"</p>
                  </div>
                )}
                
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Grammar & Usage
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {deepDive.grammarRules.map((rule: string, i: number) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300">{rule}</li>
                    ))}
                  </ul>
                </div>

                {deepDive.culturalContext && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Cultural Context
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{deepDive.culturalContext}</p>
                  </div>
                )}

                <div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t.common_mistakes || 'Common Mistakes'}
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {deepDive.commonMistakes.map((mistake: string, i: number) => (
                      <li key={i} className="text-sm text-rose-600 dark:text-rose-400">{mistake}</li>
                    ))}
                  </ul>
                </div>

                {deepDive.mnemonics && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      {t.mnemonic_device || 'Mnemonic'}
                    </div>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">{deepDive.mnemonics}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic text-sm">
                {t.analyze_word_hint}
              </p>
            )}
          </motion.div>
        )}

        {/* Correct Answer AI Fact/Explanation */}
        {status === 'correct' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: [0.9, 1.05, 1], 
              y: 0 
            }}
            transition={{ duration: 0.5, type: "spring", damping: 12 }}
            className="mt-4 mb-12 p-6 rounded-3xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    {t.ai_learning_fact}
                  </h3>
                  {!isPremium && <Lock className="w-3 h-3 text-amber-500" />}
                </div>
                
                {!isPremium ? (
                  <div className="space-y-4">
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                      {t.premium_only_ai_desc || 'AI-powered facts are available for Premium users.'}
                    </p>
                    <AdBanner />
                  </div>
                ) : isFetchingCorrectExplanation ? (
                  <div className="flex flex-col gap-3">
                    <div className="animate-pulse flex flex-col gap-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    </div>
                  </div>
                ) : correctExplanation ? (
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {correctExplanation}
                  </p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic text-sm">
                    {t.doing_great}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Grammar Explanation Display */}
        {status === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 mb-12 p-6 rounded-3xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm">
                <Dog className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                    {t.error_explanation || 'Fennec Analysis'}
                  </h3>
                  {!isPremium && <Lock className="w-3 h-3 text-amber-500" />}
                </div>
                
                {!isPremium ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mb-2">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                        {t.correct_answer_label || 'Correct Answer'}
                      </div>
                      <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                        {currentQuestion.correctAnswer}
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                      {t.premium_only_ai_desc || 'AI-powered analysis is available for Premium users.'}
                    </p>
                    <AdBanner />
                  </div>
                ) : !grammarExplanation && !isFetchingGrammar ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mb-2">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                        {t.correct_answer_label || 'Correct Answer'}
                      </div>
                      <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                        {currentQuestion.correctAnswer}
                      </div>
                    </div>
                    <button
                      onClick={handleFetchGrammar}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                        currentQuestion.type === 'fill-in-the-blank' || currentQuestion.word?.grammarRules
                          ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20 scale-[1.02]'
                          : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 hover:bg-rose-200 dark:hover:bg-rose-900/50'
                      }`}
                    >
                      <Bot className="w-5 h-5" />
                      {t.why_incorrect || 'Why is this incorrect?'}
                    </button>
                  </div>
                ) : isFetchingGrammar ? (
                  <div className="flex flex-col gap-3">
                    <div className="animate-pulse flex flex-col gap-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>
                  </div>
                ) : grammarExplanation ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 shadow-sm animate-pulse">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Shared Knowledge</span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        Synced from the Archives
                      </div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mb-2">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                        {t.correct_answer_label || 'Correct Answer'}
                      </div>
                      <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                        {currentQuestion.correctAnswer}
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      {grammarExplanation.explanation}
                    </p>

                    {grammarExplanation.pronunciationTips && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <h4 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                          {t.pronunciation_feedback || 'Pronunciation Feedback'}
                        </h4>
                        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
                          <Volume2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {grammarExplanation.pronunciationTips}
                          </p>
                        </div>
                      </div>
                    )}

                    {grammarExplanation.commonMistakes && grammarExplanation.commonMistakes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <h4 className="font-bold text-[10px] text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-3">
                          {t.common_mistakes || 'Common Mistakes'}
                        </h4>
                        <ul className="space-y-2">
                          {grammarExplanation.commonMistakes.map((mistake, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-rose-600 dark:text-rose-400 font-medium">
                              <span className="text-rose-500 shrink-0">✕</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {grammarExplanation.correctExamples && grammarExplanation.correctExamples.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <h4 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                          {t.correct_examples || 'Correct Usage'}
                        </h4>
                        <div className="flex flex-col gap-3">
                          {grammarExplanation.correctExamples.map((ex, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                              <p className="text-slate-800 dark:text-slate-200 font-bold">"{ex.sentence}"</p>
                              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{ex.translation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {grammarExplanation.alternativePhrases && grammarExplanation.alternativePhrases.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <h4 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                          {t.alternative_phrases || 'Alternative Phrases'}
                        </h4>
                        <div className="flex flex-col gap-3">
                          {grammarExplanation.alternativePhrases.map((alt, idx) => (
                            <div key={idx} className="bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
                              <p className="text-indigo-800 dark:text-indigo-200 font-bold">"{alt.phrase}"</p>
                              <p className="text-indigo-600/70 dark:text-indigo-400/70 text-xs mt-1">{alt.translation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">
                    {t.could_not_load_explanation || 'Could not load explanation.'}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <AnimatePresence>
        <motion.footer
          className={`border-t border-slate-200 dark:border-slate-800 p-4 relative z-10 bg-white dark:bg-slate-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]`}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {status === 'correct' && (
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-xl">
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"
                  >
                    <Check className="w-6 h-6" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-2"
                  >
                    {t.access_granted || 'Correct!'}
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  </motion.span>
                </div>
              )}
              {status === 'incorrect' && (
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 font-bold text-xl">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-rose-500 dark:text-rose-400 font-medium">{t.correct_answer_label || 'Correct answer:'}</span>
                    {(currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target') ? (
                      <DiffHighlight expected={currentQuestion.correctAnswer} actual={typedAnswer} />
                    ) : (
                      <span>{currentQuestion.correctAnswer}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleCheck}
              disabled={!isInputValid}
              className={`px-8 py-3 font-bold text-lg rounded-2xl transition-all shadow-md beveled-edge ${
                !isInputValid
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none border-slate-200 dark:border-slate-700'
                  : status === 'correct'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 hover:-translate-y-1 active:translate-y-0 border-emerald-600'
                  : status === 'incorrect'
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 hover:-translate-y-1 active:translate-y-0 border-rose-600'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20 hover:-translate-y-1 active:translate-y-0 border-indigo-600'
              }`}
            >
              {status === 'idle' ? (t.check_answer || 'Check') : (t.continue || 'Continue')}
            </button>
          </div>
        </motion.footer>
      </AnimatePresence>
    </div>
  );
}
