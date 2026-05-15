import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { X, Zap, Check, Award, Sparkles, Trash2, Star, History } from 'lucide-react';
import { WORDS_BY_LANG, LANGUAGES, COURSES_BY_LANG } from '../data/gameData';
import { UI_TRANSLATIONS, COURSE_TRANSLATIONS } from '../data/translations';
import { handleAppError } from '../lib/errors';
import { logLessonComplete } from '../firebase';
import { fetchContextualExamples, ContextualExample, fetchGrammarExplanation, GrammarExplanation, fetchCorrectExplanation, fetchVisualAid, fetchAIHint, fetchDeepDive, DeepDiveResponse, fetchPronunciationFeedback, PronunciationFeedback } from '../services/geminiService';
import { playPronunciation } from '../utils/audio';
import { isSpeechRecognitionSupported, startSpeechRecognition } from '../utils/speech';

import DifficultySelector from '../components/lesson/DifficultySelector';
import { LessonLoading, LessonGenerating, LessonSuccess } from '../components/lesson/LessonStates';
import CourseMapModal from '../components/lesson/CourseMapModal';
import LessonHeader from '../components/lesson/LessonHeader';
import QuestionPrompt from '../components/lesson/QuestionPrompt';
import OptionButtons from '../components/lesson/OptionButtons';
import TypingInputField from '../components/lesson/TypingInputField';
import ContextualExamplesPanel from '../components/lesson/ContextualExamplesPanel';
import DeepDivePanel from '../components/lesson/DeepDivePanel';
import CorrectExplanationPanel from '../components/lesson/CorrectExplanationPanel';
import GrammarExplanationPanel from '../components/lesson/GrammarExplanationPanel';
import LessonFooter from '../components/lesson/LessonFooter';
import AIAssistantButton from '../components/lesson/AIAssistantButton';
import { UIState, Question } from '../components/lesson/LessonTypes';
import SEO from '../components/SEO';
import { AdBanner } from '../components/AdBanner';
import PetDisplay from '../components/PetDisplay';

const COURSE_DATA = COURSES_BY_LANG;

export default function Lesson() {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- Loading & redirect ---
  const [isLoading, setIsLoading] = useState(true);

  // --- Store selectors ---
  const medkits = useStore(s => s.medkits);
  const useMedkit = useStore(s => s.useMedkit);
  const addXp = useStore(s => s.addXp);
  const addCredits = useStore(s => s.addCredits);
  const targetLang = useStore(s => s.targetLang);
  const uiLang = useStore(s => s.uiLang);
  const addNotification = useStore(s => s.addNotification);
  const health = useStore(s => s.health);
  const takeDamage = useStore(s => s.takeDamage);
  const addMistake = useStore(s => s.addMistake);
  const repairMistake = useStore(s => s.repairMistake);
  const completeLesson = useStore(s => s.completeLesson);
  const equippedPerks = useStore(s => s.equippedPerks);
  const updateSpecial = useStore(s => s.updateSpecial);
  const completedLessons = useStore(s => s.completedLessons);
  const useEnergy = useStore(s => s.useEnergy);
  const savedExamples = useStore(s => s.savedExamples);
  const isPremium = useStore(s => s.isPremium);
  const buyPremium = useStore(s => s.buyPremium);
  const setLessonContext = useStore(s => s.setLessonContext);
  const saveExample = useStore(s => s.saveExample);
  const special = useStore(s => s.special);
  const isOnline = useStore(s => s.isOnline);
  const lessonDifficulty = useStore(s => s.lessonDifficulty);
  const setLessonDifficulty = useStore(s => s.setLessonDifficulty);

  // --- UI state ---
  const t = UI_TRANSLATIONS[uiLang as keyof typeof UI_TRANSLATIONS] || UI_TRANSLATIONS['en'];
  const words = (WORDS_BY_LANG[targetLang]?.length > 0) ? WORDS_BY_LANG[targetLang] : (WORDS_BY_LANG['sr'] || []);
  const currentLang = LANGUAGES.find(l => l.id === targetLang);
  const courseData = COURSE_DATA[targetLang] || COURSE_DATA['sr'];

  // --- Lesson params ---
  const lessonId = parseInt(id || '101', 10);
  const topicId = Math.floor(lessonId / 100);
  const lessonIndex = lessonId % 100;
  const startIndex = (topicId - 1) * 8 + (lessonIndex - 1) * 4;
  const endIndex = startIndex + 4;
  const topicWords = words.slice(startIndex, endIndex);

  // --- Redirect safety check ---
  useEffect(() => {
    const hasWords = words && words.length >= 8;
    const hasEnoughWords = topicWords.length > 0;
    const isValidLessonId = lessonId >= 101 && lessonId <= 1502;
    if (!hasWords || !hasEnoughWords || !isValidLessonId) {
      console.warn('Lesson not found or no data:', { lessonId, hasWords, hasEnoughWords, targetLang, wordsCount: words?.length, id });
      navigate('/', { replace: true });
    } else {
      setIsLoading(false);
    }
  }, [lessonId, topicWords.length, courseData, targetLang, completedLessons, navigate, topicId, words, id]);

  // --- Core question state ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [combo, setCombo] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [mistakesMade, setMistakesMade] = useState(0);
  const [wrongWordIds, setWrongWordIds] = useState<string[]>([]);
  const [results, setResults] = useState<('correct' | 'incorrect' | null)[]>([]);
  const [showCourseMap, setShowCourseMap] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(true);
  const [isVirtualKeyboardOpen, setIsVirtualKeyboardOpen] = useState(false);
  const [showFullKeyboard, setShowFullKeyboard] = useState(false);

  // --- AI / fetch states ---
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

  // --- Generation / success state ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficultySelected, setDifficultySelected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalXpEarned, setFinalXpEarned] = useState(0);
  const [finalCreditsEarned, setFinalCreditsEarned] = useState(0);
  const [dogHintUsed, setDogHintUsed] = useState(false);
  const [dogMessage, setDogMessage] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // --- Refs ---
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentQ];

  // --- Speech ---
  useEffect(() => {
    if (isSpeechRecognitionSupported()) setIsSpeechSupported(true);
  }, []);

  const startListening = () => {
    if (!isSpeechRecognitionSupported() || isListening) return;
    setPronunciationFeedback(null);
    const recognition = startSpeechRecognition({
      lang: targetLang,
      interimResults: false,
      onStart: () => setIsListening(true),
      onResult: async (transcript, isFinal) => {
        if (!isFinal) return;
        setTypedAnswer(transcript);
        if (currentQuestion && (currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target')) {
          if (!isPremium) {
            addNotification(t.pronunciation_feedback_premium || 'Pronunciation feedback is a Premium feature', 'info');
            return;
          }
          setIsFetchingPronunciation(true);
          try {
            const feedback = await fetchPronunciationFeedback(currentQuestion.correctAnswer, transcript, targetLang, uiLang);
            setPronunciationFeedback(feedback);
            if (feedback?.isCorrect) addNotification(t.correct_pronunciation || 'Perfect pronunciation!', 'success');
          } catch (error) {
            handleAppError(error, addNotification);
          } finally {
            setIsFetchingPronunciation(false);
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
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // --- Question generation ---
  const generateLessonQuestions = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (topicWords.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      const pool = [...topicWords];
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
          type = i < numQuestions / 2 ? 'phonetics' : 'listening-phonetics';
        } else if (difficulty === 'easy') {
          type = i < 3 ? 'mcq-native' : i < 5 ? 'mcq-target' : 'listening';
        } else if (difficulty === 'hard') {
          type = i < 2 ? 'mcq-target' : i < 4 ? 'listening' : i < 7 ? 'fill-in-the-blank' : i < 11 ? 'typing-target' : 'typing';
        } else {
          type = i < 2 ? 'mcq-native' : i < 4 ? 'mcq-target' : i < 5 ? 'listening' : i < 7 ? 'fill-in-the-blank' : i < 9 ? 'typing-target' : 'typing';
        }
        const nativeTranslation = word.translations[uiLang as keyof typeof word.translations] || word.translation;
        const targetWord = word.word;
        let options: string[] = [];
        let correctAnswer = '';
        let promptWord = '';
        let hint = '';

        if (type === 'mcq-native' || type === 'listening') {
          correctAnswer = nativeTranslation;
          promptWord = type === 'listening' ? '' : targetWord;
          const others = words.map(w => w.translations[uiLang as keyof typeof w.translations] || w.translation);
          const uniqueOthers = [...new Set(others)].filter(w => w !== correctAnswer);
          options = [...uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1), correctAnswer].sort(() => 0.5 - Math.random());
        } else if (type === 'mcq-target') {
          correctAnswer = targetWord;
          promptWord = nativeTranslation;
          const others = words.map(w => w.word);
          const uniqueOthers = [...new Set(others)].filter(w => w !== correctAnswer);
          options = [...uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1), correctAnswer].sort(() => 0.5 - Math.random());
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
          while (uniqueOthers.length < numOptions - 1) uniqueOthers.push(`[${Math.random().toString(36).substring(7)}]`);
          options = [...uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1), correctAnswer].sort(() => 0.5 - Math.random());
        } else if (type === 'listening-phonetics') {
          correctAnswer = word.transcription;
          promptWord = '';
          const others = words.filter(w => w.transcription).map(w => w.transcription);
          const uniqueOthers = [...new Set(others)].filter(w => w !== correctAnswer);
          while (uniqueOthers.length < numOptions - 1) uniqueOthers.push(`[${Math.random().toString(36).substring(7)}]`);
          options = [...uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1), correctAnswer].sort(() => 0.5 - Math.random());
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
            while (shuffledOthers.length < numOptions - 1) shuffledOthers.push(Math.random().toString(36).substring(2, 2 + correctAnswer.length));
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
                .map(w => { const s = Math.floor(Math.random() * (w.word.length - hideLen + 1)); return w.word.substring(s, s + hideLen); })
                .filter(sub => sub !== correctAnswer);
              const shuffledOthers = [...new Set(others)].sort(() => 0.5 - Math.random()).slice(0, numOptions - 1);
              while (shuffledOthers.length < numOptions - 1) {
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
              options = [...uniqueOthers.sort(() => 0.5 - Math.random()).slice(0, numOptions - 1), correctAnswer].sort(() => 0.5 - Math.random());
            }
          }
        }

        let characterBank: string[] | undefined;
        if (type === 'typing' || type === 'typing-target') {
          const langBeingTyped = type === 'typing-target' ? targetLang : uiLang;
          const answerChars = Array.from(new Set(correctAnswer.replace(/[^\p{L}\p{N}]/gu, '').split('')));
          let distractors: string[] = [];
          const alphabetLang: Record<string, string[]> = {
            sr: ['а','б','в','г','д','ђ','е','ж','з','и','ј','к','л','љ','м','н','њ','о','п','р','с','т','ћ','у','ф','х','ц','ч','џ','ш'],
            ru: ['а','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'],
            es: 'abcdefghijklmnñopqrstuvwxyz'.split(''),
            fr: 'abcdefghijklmnopqrstuvwxyz'.split(''),
            de: 'abcdefghijklmnopqrstuvwxyzäöüß'.split(''),
            it: 'abcdefghijklmnopqrstuvwxyz'.split(''),
          };
          const alphabet = alphabetLang[langBeingTyped as keyof typeof alphabetLang];
          if (alphabet) {
            distractors = alphabet.filter(c => !answerChars.includes(c)).sort(() => 0.5 - Math.random()).slice(0, 5);
          } else {
            const otherWords = words.map(w => type === 'typing-target' ? w.word : (w.translations[uiLang as keyof typeof w.translations] || w.translation)).join('');
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

  // --- Update lesson context ---
  useEffect(() => {
    if (currentQuestion) {
      const mistakeWords = wrongWordIds.map(id => {
        const w = words.find(word => word.id.toString() === id);
        return w ? `${w.word} (${w.translations[uiLang as keyof typeof w.translations] || w.translation})` : id;
      });
      setLessonContext({ currentWord: currentQuestion.promptWord || '', translation: currentQuestion.correctAnswer || '', mistakes: mistakeWords });
      return () => setLessonContext(null);
    }
  }, [currentQ, questions, status, wrongWordIds, setLessonContext, targetLang, uiLang, words]);

  // --- Focus input on typing questions ---
  useEffect(() => {
    if ((currentQuestion?.type === 'typing' || currentQuestion?.type === 'typing-target') && status === 'idle') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentQ, currentQuestion, status]);

  // --- Fetch AI aids on question change ---
  useEffect(() => {
    if (status !== 'idle' && currentQuestion) {
      if (!isOnline) {
        setExamples([]); setIsFetchingExamples(false);
        setVisualAid(null); setIsFetchingVisualAid(false);
        addNotification(t.offline_ai_warning || 'AI analysis is unavailable offline', 'warning');
        return;
      }
      if (!isPremium) {
        setExamples([]); setIsFetchingExamples(false);
        setVisualAid(null); setIsFetchingVisualAid(false);
        return;
      }
      setIsFetchingExamples(true);
      setIsFetchingVisualAid(true);
      const wordToFetch = currentQuestion.type === 'mcq-native' || currentQuestion.type === 'typing'
        ? currentQuestion.correctAnswer : currentQuestion.promptWord;
      const targetWord = currentQuestion.word.word;

      const fetchExamples = async () => {
        if (currentQuestion.word.examples?.length > 0) { setExamples(currentQuestion.word.examples); return; }
        const savedForWord = savedExamples.filter(ex => ex.word.toLowerCase() === wordToFetch.toLowerCase() && ex.targetLang === targetLang);
        if (savedForWord.length > 0) { setExamples(savedForWord.map(ex => ({ sentence: ex.sentence, translation: ex.translation, source: 'social media' }))); return; }
        try { setExamples(await fetchContextualExamples(wordToFetch, targetLang, uiLang)); } catch (err) { handleAppError(err, addNotification); }
      };

      const fetchVisual = async () => {
        const cacheKey = `visualAid_${targetLang}_${currentQuestion.word.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) { setVisualAid(cached); return; }
        const englishKeyword = currentQuestion.word.translations?.en || currentQuestion.word.word;
        try {
          const res = await fetchVisualAid(currentQuestion.word.word, targetLang, englishKeyword);
          setVisualAid(res);
          if (res) localStorage.setItem(cacheKey, res);
        } catch (err) { handleAppError(err, addNotification); }
      };

      Promise.all([fetchExamples(), fetchVisual()]).finally(() => {
        setIsFetchingExamples(false); setIsFetchingVisualAid(false);
      });
    } else if (status === 'idle') {
      setExamples([]); setVisualAid(null);
    }
  }, [status, currentQuestion, targetLang, uiLang, savedExamples, isPremium]);

  // --- Handle answer check ---
  const handleCheck = () => {
    if (status !== 'idle') {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1); setSelected(null); setTypedAnswer(''); setStatus('idle');
        setDogHintUsed(false); setDogMessage(null); setGrammarExplanation(null);
        setCorrectExplanation(null); setDeepDive(null); setPronunciationFeedback(null);
        setQuestionStartTime(Date.now());
      } else {
        const baseXP = lessonDifficulty === 'easy' ? 100 : lessonDifficulty === 'hard' ? 250 : 150;
        const baseCaps = lessonDifficulty === 'easy' ? 10 : lessonDifficulty === 'hard' ? 30 : 15;
        const isPerfect = mistakesMade === 0;
        const finalXp = baseXP + xpGained + (isPerfect ? 50 : 0);
        setFinalXpEarned(finalXp); setFinalCreditsEarned(baseCaps);
        addXp(finalXp); addCredits(baseCaps); useEnergy('electronic');
        completeLesson(`${targetLang}_${id}`, isPerfect);
        logLessonComplete(id || 'unknown', 100 - mistakesMade * 10, finalXp);
        if (isPerfect && Math.random() < 0.3) updateSpecial('I', 1);
        setShowSuccess(true);
        const end = Date.now() + 3000;
        const colors = ['#18ff62','#00ff00','#ffffff','#ffd700','#ff0000'];
        (function frame() {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
          if (Date.now() < end) requestAnimationFrame(frame);
        })();
      }
      return;
    }

    const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\s]/gu, '').trim();
    const isCorrect = currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target'
      ? normalize(typedAnswer) === normalize(currentQuestion.correctAnswer)
      : selected === currentQuestion.correctAnswer;

    if (isCorrect) {
      setStatus('correct');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#18ff62','#00ff00','#ffffff'], zIndex: 1000 });
      setResults(prev => { const r = [...prev]; r[currentQ] = 'correct'; return r; });
      const timeTaken = (Date.now() - questionStartTime) / 1000;
      const comboMultiplier = 1 + combo * 0.1;
      const diffMultiplier = lessonDifficulty === 'hard' ? 1.5 : lessonDifficulty === 'easy' ? 0.8 : 1.0;
      let earned = Math.floor(10 * comboMultiplier * diffMultiplier);
      const perception = special.P || 1;
      if (Math.random() < perception * 0.05) { earned *= 2; setTimeout(() => addNotification('Critical Review! Bonus XP!'), 500); }
      const agility = special.A || 1;
      if (timeTaken < 4) {
        const sprinting = equippedPerks.includes('dead_man_sprinting') && health < 25;
        const factor = sprinting ? 0.5 : agility * 0.05;
        const bonus = Math.floor(earned * factor);
        earned += bonus;
        setTimeout(() => addNotification(sprinting ? `Dead Man Sprinting! +${bonus} XP` : `Agility Bonus! +${bonus} XP`), 700);
      }
      setXpGained(prev => prev + earned);
      setCombo(c => c + 1);
      repairMistake(currentQuestion.word.id.toString(), targetLang, true);

      // AI cheer & correct explanation
      const mistakeWords = wrongWordIds.map(id => { const w = words.find(w => w.id.toString() === id); return w ? `${w.word} (${w.translations[uiLang as keyof typeof w.translations] || w.translation})` : id; });
      if (isPremium && (combo === 2 || (combo > 5 && Math.random() > 0.5))) {
        fetchAIHint('', '', targetLang, uiLang, '', true, { currentWord: currentQuestion.promptWord || '', translation: currentQuestion.correctAnswer || '', mistakes: mistakeWords }, lessonDifficulty)
          .then(msg => { setDogMessage(msg || t.ai_assistant_cheer || 'Great job!'); setTimeout(() => setDogMessage(null), msg ? 4000 : 3000); });
      } else if (!isPremium && (combo === 2 || (combo > 5 && Math.random() > 0.5))) {
        setDogMessage(t.ai_assistant_cheer || 'Great job! Keep it up!');
        setTimeout(() => setDogMessage(null), 3000);
      }
      if (combo > 0) addNotification(`+${earned} XP (${combo + 1}x Combo!)`, 'success');
      else addNotification(`+${earned} XP`, 'success');

      if (isPremium) {
        setIsFetchingCorrectExplanation(true);
        fetchCorrectExplanation(currentQuestion.promptWord || currentQuestion.correctAnswer, currentQuestion.correctAnswer, targetLang, uiLang,
          { currentWord: currentQuestion.promptWord || '', translation: currentQuestion.correctAnswer || '', mistakes: mistakeWords }, lessonDifficulty)
          .then(ex => { setCorrectExplanation(ex); setIsFetchingCorrectExplanation(false); });
      }
    } else {
      setStatus('incorrect');
      setResults(prev => { const r = [...prev]; r[currentQ] = 'incorrect'; return r; });
      setCombo(0); setMistakesMade(m => m + 1);
      repairMistake(currentQuestion.word.id.toString(), targetLang, false);
      setWrongWordIds(prev => { const id = currentQuestion.word.id.toString(); return prev.includes(id) ? prev : [...prev, id]; });
      addMistake(currentQuestion.word.id.toString(), targetLang);
      const { died, prevented } = takeDamage(20);
      setDogMessage(t.ai_assistant_mistake || "You'll get it next time!");
      setTimeout(() => setDogMessage(null), 3000);
      if (died) { addNotification(t.critical_failure, 'error'); setTimeout(() => navigate('/'), 2000); }
      else if (!prevented) addNotification(t.incorrect_hp, 'error');
    }
  };

  const handleFennecHint = async () => {
    if (dogHintUsed || status !== 'idle' || !currentQuestion) return;
    if (!isOnline) { addNotification(t.offline_ai_warning || 'AI hints are unavailable offline', 'warning'); return; }
    if (!isPremium) { addNotification(t.ai_hint_premium || 'AI hints are a Premium feature', 'info'); return; }
    setDogHintUsed(true);
    setDogMessage(t.ai_assistant_thinking || 'Fennec is sniffing for clues...');
    try {
      const mistakeWords = wrongWordIds.map(id => { const w = words.find(w => w.id.toString() === id); return w ? `${w.word} (${w.translations[uiLang as keyof typeof w.translations] || w.translation})` : id; });
      const hint = await fetchAIHint(currentQuestion.promptWord, currentQuestion.type, targetLang, uiLang, currentQuestion.correctAnswer, false,
        { currentWord: currentQuestion.promptWord || '', translation: currentQuestion.correctAnswer || '', mistakes: mistakeWords }, lessonDifficulty);
      setDogMessage(hint || t.ai_assistant_hint || 'Try this...');
    } catch { setDogMessage(null); setDogHintUsed(false); }
    setTimeout(() => setDogMessage(null), 6000);
    if (currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target') setTypedAnswer(currentQuestion.correctAnswer.substring(0, 2));
    else { const incorrect = currentQuestion.options.filter(o => o !== currentQuestion.correctAnswer); if (incorrect.length > 0) setSelected(currentQuestion.correctAnswer); }
  };

  const handleDeepDive = async () => {
    if (!currentQuestion || isFetchingDeepDive || !isPremium) return;
    if (!isOnline) { addNotification(t.offline_ai_warning || 'AI analysis is unavailable offline', 'warning'); return; }
    setIsFetchingDeepDive(true);
    try {
      const wordToFetch = currentQuestion.type === 'mcq-native' || currentQuestion.type === 'typing'
        ? currentQuestion.correctAnswer : currentQuestion.promptWord;
      const res = await fetchDeepDive(wordToFetch, targetLang, uiLang, lessonDifficulty);
      setDeepDive(res);
      if (res) {
        if (equippedPerks.includes('lore_specialist')) { setXpGained(prev => prev + 25); addNotification('🧙 Lore Specialist: +25 XP', 'success'); }
        if (equippedPerks.includes('scavengers_tongue') && Math.random() < 0.20) { const bonus = Math.floor(Math.random() * 10) + 5; addCredits(bonus); addNotification(`🗺️ Scavenger's Tongue: +${bonus} Caps found!`, 'success'); }
      }
    } catch (error) { handleAppError(error, addNotification); }
    finally { setIsFetchingDeepDive(false); }
  };

  const handleFetchGrammar = async () => {
    if (!currentQuestion || isFetchingGrammar || !isPremium) return;
    setIsFetchingGrammar(true);
    const mistakeWords = wrongWordIds.map(id => { const w = words.find(w => w.id.toString() === id); return w ? `${w.word} (${w.translations[uiLang as keyof typeof w.translations] || w.translation})` : id; });
    try {
      const explanation = await fetchGrammarExplanation(currentQuestion.promptWord, (currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target') ? typedAnswer : (selected || ''), currentQuestion.correctAnswer, targetLang, uiLang,
        { currentWord: currentQuestion.promptWord || '', translation: currentQuestion.correctAnswer || '', mistakes: mistakeWords }, lessonDifficulty);
      setGrammarExplanation(explanation);
      if (explanation && equippedPerks.includes('lore_specialist')) { setXpGained(prev => prev + 15); addNotification('🧙 Lore Specialist: +15 XP', 'success'); }
    } catch (e) { console.error("Failed to fetch grammar explanation", e); }
    finally { setIsFetchingGrammar(false); }
  };

  // Loading state
  if (isLoading) return <LessonLoading t={t} isLoading={true} />;

  // Difficulty selection
  if (!difficultySelected) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/20 via-transparent to-transparent">
        <SEO title={`${t.lesson || 'Lesson'} - ${t.select_difficulty || 'Select Difficulty'}`} description="Choose your challenge level for this lesson." />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2"><Zap className="w-8 h-8 text-primary animate-pulse" /></div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{t.select_difficulty || 'Select Challenge Level'}</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t.difficulty_influence_desc || 'Difficulty affects the number of questions, types of tasks, and insights from Fennec.'}</p>
          </div>
          <DifficultySelector t={t} lessonDifficulty={lessonDifficulty} onDifficultySelect={handleDifficultySelect} />
          <div className="flex justify-center gap-4 pt-4">
            <button onClick={() => navigate('/')} className="px-8 py-3 rounded-2xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs">{t.back_to_map || 'Return to Map'}</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Generating
  if (isGenerating || questions.length === 0) return <LessonGenerating t={t} />;

  const isInputValid = (currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target') ? typedAnswer.trim().length > 0 : selected !== null;

  // Success screen
  if (showSuccess) return <LessonSuccess t={t} mistakesMade={mistakesMade} finalXpEarned={finalXpEarned} finalCreditsEarned={finalCreditsEarned} onNavigate={navigate} lessonId={id || '1'} uiLang={uiLang} />;

  const uiState: UIState = { t, currentLang, topicId, targetLang, uiLang, isPremium, isOnline, health, special, equippedPerks };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-white relative overflow-hidden">
      <SEO title={`${t.goat_exam || 'Lesson'} - ${currentLang?.name[uiLang as keyof typeof currentLang.name] || currentLang?.name.en}`} description="Take the lesson to improve your language skills." />

      <CourseMapModal t={t} showCourseMap={showCourseMap} completedLessons={completedLessons} lessonId={lessonId} onHideCourseMap={() => setShowCourseMap(false)} onNavigate={navigate} courseData={courseData || []} COURSE_TRANSLATIONS={COURSE_TRANSLATIONS} uiLang={uiLang} targetLang={targetLang} />

      <LessonHeader
        t={t} currentQ={currentQ} questionsLength={questions.length} results={results} health={health}
        xpGained={xpGained} isPremium={isPremium} status={status} selected={selected}
        currentQuestionType={currentQuestion.type} currentQuestion={currentQuestion}
        visualAid={visualAid} isFetchingVisualAid={isFetchingVisualAid} isOnline={isOnline}
        onPlayPronunciation={() => {
          const w = currentQuestion.type === 'mcq-native' || currentQuestion.type === 'typing' || currentQuestion.type === 'phonetics' || currentQuestion.type === 'fill-in-the-blank'
            ? currentQuestion.word.word : currentQuestion.promptWord;
          const lang = ['mcq-native','typing','phonetics','fill-in-the-blank'].includes(currentQuestion.type) ? targetLang : uiLang;
          playPronunciation(w, lang as string);
        }}
        onBuyPremium={buyPremium}
      />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 pt-8 relative z-0">
        <QuestionPrompt
          t={t} currentQuestionType={currentQuestion.type} currentQuestion={currentQuestion}
          visualAid={visualAid} isFetchingVisualAid={isFetchingVisualAid} isPremium={isPremium}
          status={status} isOnline={isOnline} targetLang={targetLang} uiLang={uiLang} currentLang={currentLang}
          onPlayPronunciation={() => {
            const w = ['mcq-native','typing','phonetics','fill-in-the-blank'].includes(currentQuestion.type) ? currentQuestion.word.word : currentQuestion.promptWord;
            playPronunciation(w, ['mcq-native','typing','phonetics','fill-in-the-blank'].includes(currentQuestion.type) ? targetLang : uiLang);
          }}
          onBuyPremium={buyPremium}
        />

        {currentQuestion.type === 'typing' || currentQuestion.type === 'typing-target' ? (
          <TypingInputField
            t={t} status={status} typedAnswer={typedAnswer} isInputValid={isInputValid}
            currentQuestionType={currentQuestion.type} targetLang={targetLang} uiLang={uiLang}
            onTypeAnswer={setTypedAnswer} onCheck={handleCheck}
            onToggleKeyboard={() => setIsKeyboardVisible(prev => !prev)}
            onVirtualKeyboardInput={(c: string) => { setTypedAnswer(prev => prev + c); inputRef.current?.focus(); }}
            onVirtualKeyboardDelete={() => { setTypedAnswer(prev => prev.slice(0, -1)); inputRef.current?.focus(); }}
            onVirtualKeyboardEnter={() => { setIsVirtualKeyboardOpen(false); if (isInputValid) handleCheck(); }}
            onToggleFullKeyboard={() => setShowFullKeyboard(prev => !prev)}
            isVirtualKeyboardOpen={isVirtualKeyboardOpen} isKeyboardVisible={isKeyboardVisible}
            showFullKeyboard={showFullKeyboard}
          />
        ) : (
          <OptionButtons t={t} selected={selected} status={status} currentQuestion={currentQuestion} onSelectOption={setSelected} uiLang={uiLang} targetLang={targetLang} isPremium={isPremium} isOnline={isOnline} special={special} equippedPerks={equippedPerks} />
        )}

        <ContextualExamplesPanel t={t} isPremium={isPremium} status={status} examples={examples} isFetchingExamples={isFetchingExamples} currentQuestionType={currentQuestion.type} currentQuestion={currentQuestion} savedExamples={savedExamples} onSaveExample={(w: string, ex: any) => saveExample(w, ex, targetLang)} onBuyPremium={buyPremium} uiLang={uiLang} targetLang={targetLang} />

        <DeepDivePanel t={t} isPremium={isPremium} status={status} isFetchingDeepDive={isFetchingDeepDive} deepDive={deepDive} onFetchDeepDive={handleDeepDive} onBuyPremium={buyPremium} uiLang={uiLang} targetLang={targetLang} />

        <CorrectExplanationPanel t={t} isPremium={isPremium} status={status} isFetchingCorrectExplanation={isFetchingCorrectExplanation} correctExplanation={correctExplanation} onBuyPremium={buyPremium} uiLang={uiLang} targetLang={targetLang} />

        <GrammarExplanationPanel t={t} isPremium={isPremium} status={status} currentQuestion={currentQuestion} grammarExplanation={grammarExplanation} isFetchingGrammar={isFetchingGrammar} onFetchGrammar={handleFetchGrammar} onBuyPremium={buyPremium} uiLang={uiLang} targetLang={targetLang} />
      </main>

      <LessonFooter t={t} status={status} currentQuestion={currentQuestion} currentQuestionType={currentQuestion.type} typedAnswer={typedAnswer} isInputValid={isInputValid} onCheck={handleCheck} uiLang={uiLang} targetLang={targetLang} isPremium={isPremium} />

      <AIAssistantButton
        t={t} status={status} dogMessage={dogMessage} isListening={isListening}
        dogHintUsed={dogHintUsed} currentQuestionType={currentQuestion.type}
        isFetchingPronunciation={isFetchingPronunciation} pronunciationFeedback={pronunciationFeedback}
        onStartListening={startListening} onStopListening={stopListening} onFetchAIHints={handleFennecHint}
        uiLang={uiLang} targetLang={targetLang} isPremium={isPremium} isOnline={isOnline} special={special} equippedPerks={equippedPerks} health={health}
      />
    </div>
  );
}

type QuestionType = 'mcq-native' | 'mcq-target' | 'typing' | 'typing-target' | 'listening' | 'phonetics' | 'listening-phonetics' | 'fill-in-the-blank';