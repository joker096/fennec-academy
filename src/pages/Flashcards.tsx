import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Check, X, Volume2, Timer, BookOpen, Eye, EyeOff, Activity, Bot, Calendar, Zap, Star, Image as ImageIcon, Newspaper, Book, MessageCircle, Globe, Search, Trash2, Download, Lock, Sparkles, Dog, History, AlertTriangle, Lightbulb, RefreshCw, Keyboard as KeyboardIcon, Copy, Mic, MicOff, CheckCircle2, Plus, TrendingUp, RotateCcw, ShieldAlert } from 'lucide-react';
import { Flashcard } from '../components/Flashcard';
import { WORDS_BY_LANG, LANGUAGES, Word } from '../data/gameData';
import { useStore } from '../store/useStore';
import { playPronunciation } from '../utils/audio';
import { UI_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import PetDisplay from '../components/PetDisplay';
import Tooltip from '../components/Tooltip';
import { fetchContextualExamples, ContextualExample, fetchVocabularyExplanation, VocabularyExplanation, fetchVisualAid, fetchDeepDive, DeepDiveResponse, fetchAIHint, fetchPronunciationFeedback, PronunciationFeedback } from '../services/geminiService';
import { handleAppError } from '../lib/errors';
import { OFFLINE_EXAMPLES } from '../data/flashcards';
import { AdBanner } from '../components/AdBanner';
import { audioService, SoundEffect } from '../services/audioService';
import { MnemonicService } from '../services/mnemonicService';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import confetti from 'canvas-confetti';

import { SRSService } from '../services/srsService';

export default function Flashcards() {
  const targetLang = useStore(state => state.targetLang);
  const uiLang = useStore(state => state.uiLang);
  const nativeLang = useStore(state => state.nativeLang);
  const flashcardProgress = useStore(state => state.flashcardProgress);
  const updateFlashcardProgress = useStore(state => state.updateFlashcardProgress);
  const calculateNextInterval = useStore(state => state.calculateNextInterval);
  const resetFlashcardProgress = useStore(state => state.resetFlashcardProgress);
  const addMistake = useStore(state => state.addMistake);
  const repairMistake = useStore(state => state.repairMistake);
  const updateSpecial = useStore(state => state.updateSpecial);
  const addNotification = useStore(state => state.addNotification);
  const addXp = useStore(state => state.addXp);
  const resetSessionReviews = useStore(state => state.resetSessionReviews);
  const sessionReviews = useStore(state => state.sessionReviews);
  const dailyProgress = useStore(state => state.dailyProgress);
  const saveExample = useStore(state => state.saveExample);
  const savedExamples = useStore(state => state.savedExamples);
  const isPremium = useStore(state => state.isPremium);
  const buyPremium = useStore(state => state.buyPremium);
  const customWords = useStore(state => state.customWords);
  const addCustomWord = useStore(state => state.addCustomWord);
  const special = useStore(state => state.special);
  const isOnline = useStore(state => state.isOnline);
  const uid = useStore(state => state.uid);
  const fetchProgress = useStore(state => state.fetchProgress);
  const equippedPerks = useStore(state => state.equippedPerks);
  const cognitiveLoad = useStore(state => state.cognitiveLoad);
  const hydrationLevel = useStore(state => state.hydrationLevel);
  const weather = useStore(state => state.weather);

  const location = useLocation();
  
  const sessionStartTime = useStore(state => state.sessionStartTime);
  const currentMistakeStreak = useStore(state => state.currentMistakeStreak);
  
  // Use SRSService logic for UI consistency
  const dailyFatigue = dailyProgress.flashcardsReviewed || 0;
  
  const srsContext = {
    special,
    sessionReviews,
    dailyReviews: dailyFatigue,
    equippedPerks,
    cognitiveLoad,
    hydrationLevel,
    weather,
    sessionStartTime,
    currentMistakeStreak
  };

  const fatigueMultiplier = SRSService.getFatigueMultiplier(srsContext);
  // Fatigue mapping to percentage for UI (lower multiplier means higher fatigue penalty)
  const fatiguePenalty = Math.max(0, Math.min(100, Math.round((1 - fatigueMultiplier) * 100)));
  
  const hour = new Date().getHours();
  // Circadian peak logic (SRS 4.0)
  const circadianFactor = SRSService.getCircadianFactor(hour, weather);
  const timeBonus = Math.round((circadianFactor - 1.0) * 100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [masteredWords, setMasteredWords] = useState<Word[]>([]);
  const [mistakeWords, setMistakeWords] = useState<Word[]>([]);
  const [viewMode, setViewMode] = useState<'review' | 'mastered' | 'quiz' | 'saved' | 'mistakes'>((location.state as any)?.mode || 'review');
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [examples, setExamples] = useState<ContextualExample[]>([]);
  const [isFetchingExamples, setIsFetchingExamples] = useState(false);
  const [quizExplanation, setQuizExplanation] = useState<VocabularyExplanation | null>(null);
  const [isFetchingExplanation, setIsFetchingExplanation] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [visualAid, setVisualAid] = useState<string | null>(null);
  const [isFetchingVisualAid, setIsFetchingVisualAid] = useState(false);
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);
  const [mnemonicExplanation, setMnemonicExplanation] = useState<string | null>(null);
  
  // New Word Form State
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newTranscription, setNewTranscription] = useState('');
  const [formErrors, setFormErrors] = useState<{word?: string, translation?: string}>({});
  const setMnemonicImageUrl = useStore(state => state.setMnemonicImageUrl);
  const [isExamplesRequested, setIsExamplesRequested] = useState(false);
  const [deepDive, setDeepDive] = useState<DeepDiveResponse | null>(null);
  const [isFetchingDeepDive, setIsFetchingDeepDive] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [activeDeepDiveWord, setActiveDeepDiveWord] = useState<string | null>(null);
  const [activeExamplesWord, setActiveExamplesWord] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isQuizKeyboardVisible, setIsQuizKeyboardVisible] = useState(true);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [quizType, setQuizType] = useState<'mcq' | 'typing' | 'typing-target' | 'audio' | 'listening-dictation'>('mcq');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<PronunciationFeedback | null>(null);
  const [isFetchingPronunciation, setIsFetchingPronunciation] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [sessionStreak, setSessionStreak] = useState(0);
  const recognitionRef = useRef<any>(null);

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const currentLang = LANGUAGES.find(l => l.id === targetLang);

  useEffect(() => {
    resetSessionReviews();
    if (location.state && (location.state as any).mode) {
      setViewMode((location.state as any).mode);
    }
  }, [resetSessionReviews, location.state]);

  const [dogMessage, setDogMessage] = useState<string | null>(null);
  const [dogHintUsed, setDogHintUsed] = useState(false);

  const handleFennecHint = async () => {
    if (dogHintUsed || isSubmitted || viewMode !== 'quiz') return;
    
    if (!isOnline) {
      addNotification(t.offline_ai_warning, 'warning');
      return;
    }

    if (!isPremium) {
      addNotification(t.ai_hint_premium || 'AI hints are a Premium feature', 'info');
      return;
    }

    setDogHintUsed(true);
    setDogMessage(t.ai_assistant_thinking || 'Fennec is sniffing for clues...');
    
    try {
      const correctAnswer = word.translations[uiLang] || word.translation;
      const hint = await fetchAIHint(
        word.word,
        'flashcard-quiz',
        targetLang,
        uiLang,
        correctAnswer
      );

      if (hint) {
        setDogMessage(hint);
      } else {
        setDogMessage(t.ai_assistant_hint || 'Try this...');
      }
      
      // Suggest correct answer by selecting it
      setSelectedOption(correctAnswer);
    } catch (error) {
      handleAppError(error, addNotification);
      setDogMessage(null);
      setDogHintUsed(false);
    }
    
    setTimeout(() => setDogMessage(null), 6000);
  };

  const loadQueues = () => {
    const staticWords = WORDS_BY_LANG[targetLang] || [];
    const localCustomWords = customWords[targetLang] || [];
    const allWords = [...staticWords, ...localCustomWords];
    const now = new Date().toISOString();
    
    const due = allWords.filter(w => {
      const key = `${targetLang}_${w.id}`;
      const progress = useStore.getState().flashcardProgress[key];
      if (!progress) return true;
      if (progress.mastered) return false;
      return progress.nextReviewDate <= now;
    });
    
    const mastered = allWords.filter(w => {
      const key = `${targetLang}_${w.id}`;
      const progress = useStore.getState().flashcardProgress[key];
      return progress?.mastered === true;
    });

    const mistakes = allWords.filter(w => {
      const key = `${targetLang}_${w.id}`;
      return !!useStore.getState().mistakes[key];
    });

    setDueWords(due);
    setMasteredWords(mastered);
    setMistakeWords(mistakes);
    setDogHintUsed(false);
    setDogMessage(null);
    setCurrentIndex(0);
  };

  useEffect(() => {
    loadQueues();
  }, [targetLang]); // Only recompute on language change to keep queue stable

  const word = viewMode === 'mistakes' ? mistakeWords[currentIndex] : dueWords[currentIndex];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Map targetLang to BCP 47 codes for better accuracy
      const langMap: Record<string, string> = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'ja': 'ja-JP',
        'zh': 'zh-CN',
        'ru': 'ru-RU',
        'sr': 'sr-RS',
        'ar': 'ar-SA',
        'pt': 'pt-BR',
        'ko': 'ko-KR'
      };
      recognition.lang = langMap[targetLang] || targetLang;

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);

        if (word) {
          setIsFetchingPronunciation(true);
          try {
            const feedback = await fetchPronunciationFeedback(
              word.word,
              transcript,
              targetLang,
              uiLang,
              word.transcription
            );
            setPronunciationFeedback(feedback);
            
            if (feedback?.isCorrect) {
              addNotification(t.correct_pronunciation || 'Perfect pronunciation!', 'success');
              audioService.play(SoundEffect.SUCCESS);
            } else {
              audioService.play(SoundEffect.ERROR);
            }
          } catch (error) {
            handleAppError(error, addNotification);
          } finally {
            setIsFetchingPronunciation(false);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        addNotification(t.speech_error || 'Speech recognition failed', 'error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [targetLang, word, uiLang, t, addNotification, isPremium]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setPronunciationFeedback(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  // Memoized derived data
  const isListView = ['mastered', 'mistakes', 'all', 'saved_examples'].includes(viewMode);

  const filteredMasteredWords = masteredWords.filter(w => 
    !searchQuery || 
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (w.translations[uiLang] || w.translation).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSavedExamples = savedExamples.filter(ex => 
    ex.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.sentence.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allWords = [...(WORDS_BY_LANG[targetLang] || []), ...(customWords[targetLang] || [])];
  const searchResults = (searchQuery.length > 1 && !searchError) ? allWords.filter(w => 
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (w.translations[uiLang] || w.translation).toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.length === 0) {
      setSearchError(null);
      return;
    }
    if (val.length === 1) {
      setSearchError(t.search_error_too_short);
      return;
    }
    if (val.length > 50) {
      setSearchError(t.search_error_too_long);
      return;
    }
    // Allow letters (including various alphabets), numbers, spaces, hyphens, apostrophes
    const validPattern = /^[\p{L}\p{N}\s\-']+$/u;
    if (!validPattern.test(val)) {
      setSearchError(t.search_error_invalid_chars);
      return;
    }
    setSearchError(null);
  };

  const wordProgress = word ? flashcardProgress[`${targetLang}_${word.id}`] : null;

  useEffect(() => {
    if (isFlipped && word && viewMode !== 'quiz') {
      if (!isOnline) {
        setExamples([]);
        setVisualAid(null);
        return;
      }

      // Fetch examples if requested or if premium (automatic for premium)
      if (isExamplesRequested || isPremium) {
        setIsFetchingExamples(true);
        fetchContextualExamples(word.word, targetLang, uiLang)
          .then(res => {
            setExamples(res);
            setIsFetchingExamples(false);
            if (isPremium && !isExamplesRequested) {
              setIsExamplesRequested(true);
              setShowExamples(true);
            }
          })
          .catch(err => {
            handleAppError(err, addNotification);
            setIsFetchingExamples(false);
          });
      }

      // Fetch visual aid using English word as keyword for better results
      if (isPremium) {
        setIsFetchingVisualAid(true);
        const englishKeyword = word.translations['en'] || word.word;
        fetchVisualAid(word.word, targetLang, englishKeyword)
          .then(res => {
            setVisualAid(res);
            setIsFetchingVisualAid(false);
          })
          .catch(err => {
            handleAppError(err, addNotification);
            setIsFetchingVisualAid(false);
          });
      }
    } else {
      setExamples([]);
      setVisualAid(null);
    }
  }, [isFlipped, targetLang, word, uiLang, nativeLang, viewMode, savedExamples, isPremium, isExamplesRequested]);

  useEffect(() => {
    if (viewMode === 'quiz' && word) {
      const correctAnswer = word.translations[uiLang] || word.translation;
      const allWords = WORDS_BY_LANG[uiLang] || [];
      const uniqueWords = [...new Set(allWords.map(w => w.word))];
      
      // Perk: Concentrated Fire (removes 1 wrong answer)
      const hasConcentratedFire = equippedPerks.includes('concentrated_fire');
      const numDistractors = hasConcentratedFire ? 2 : 3;

      const distractors = uniqueWords
        .filter(w => w !== correctAnswer)
        .sort(() => 0.5 - Math.random())
        .slice(0, numDistractors);
      
      const types: ('mcq' | 'typing' | 'typing-target' | 'audio' | 'listening-dictation')[] = ['mcq', 'typing', 'typing-target', 'audio', 'listening-dictation'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      setQuizType(randomType);
      setQuizOptions([correctAnswer, ...distractors].sort(() => 0.5 - Math.random()));
      setSelectedOption(null);
      setTypedAnswer('');
      setIsSubmitted(false);
      setTimeLeft(30);
      
      /* 
      // Auto-play audio for audio/listening questions - Disabled per user request
      if (randomType === 'audio' || randomType === 'listening-dictation') {
        playPronunciation(word.word, targetLang);
      }
      */
    }
  }, [word, viewMode, uiLang, equippedPerks]);

  useEffect(() => {
    // Re-play audio when flipping back to target side in review mode
    if (!isFlipped && word && viewMode === 'review') {
      // Automatic playback disabled by user request
      // playPronunciation(word.word, targetLang);
    }
  }, [isFlipped, word, viewMode]);

  const handleOptionSelect = (opt: string) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmit = (isTimeout = false) => {
    if (isSubmitted) return;
    
    const isTyping = quizType === 'typing' || quizType === 'typing-target' || quizType === 'listening-dictation';
    if (!selectedOption && !typedAnswer && !isTimeout) return;
    
    setIsSubmitted(true);
    let finalOption = isTimeout ? t.time_out : (isTyping ? typedAnswer : selectedOption!);
    if (isTimeout) {
      setSelectedOption('__TIME_UP__');
    }

    const correctAnswer = (quizType === 'typing-target' || quizType === 'listening-dictation')
      ? word.word 
      : (word.translations[uiLang] || word.translation);
    
    const isCorrect = !isTimeout && (
      isTyping
        ? typedAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
        : finalOption === correctAnswer
    );
    
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');
    setSessionStreak(prev => isCorrect ? prev + 1 : 0);
    audioService.play(isCorrect ? SoundEffect.SUCCESS : SoundEffect.ERROR);
    
    if (isCorrect) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24']
      });
    }

    setTimeout(() => setAnswerFeedback(null), 1500);

    if (viewMode === 'mistakes') {
      repairMistake(word.id.toString(), targetLang, isCorrect);
    }

    if (!isCorrect) {
      addMistake(word.id.toString(), targetLang);
      if (isPremium) {
        setIsFetchingExplanation(true);
        fetchVocabularyExplanation(word.word, finalOption, correctAnswer, targetLang, uiLang)
          .then(explanation => {
            setQuizExplanation(explanation);
            setIsFetchingExplanation(false);
          })
          .catch(err => {
            handleAppError(err, addNotification);
            setIsFetchingExplanation(false);
          });
      }
      setDogMessage(t.ai_assistant_mistake || 'Fennec jumps nervously... You\'ll get it next time!');
      setTimeout(() => setDogMessage(null), 4000);
    } else {
      setDogMessage(t.ai_assistant_cheer || 'Good fennec! You found the right path!');
      setTimeout(() => setDogMessage(null), 4000);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (viewMode === 'quiz' && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (viewMode === 'quiz' && !isSubmitted && timeLeft === 0) {
      handleSubmit(true);
    }
    return () => clearInterval(timer);
  }, [viewMode, isSubmitted, timeLeft, handleSubmit]);

  const handleNext = (quality: number) => {
    const isCorrect = quality >= 3;
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');
    setSessionStreak(prev => isCorrect ? prev + 1 : 0);
    audioService.play(isCorrect ? SoundEffect.SUCCESS : SoundEffect.ERROR);
    
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }

    setTimeout(() => setAnswerFeedback(null), 600);
    
    setDirection(isCorrect ? 1 : -1);
    setIsFlipped(false);
    setQuizExplanation(null);
    setMnemonicExplanation(null);
    setShowExamples(false);
    setIsExamplesRequested(false);
    setDeepDive(null);
    setShowDeepDive(false);
    setActiveExamplesWord(null);
    
    if (word) {
      if (quality >= 3) {
        repairMistake(word.id.toString(), targetLang, true);
      } else {
        addMistake(word.id.toString(), targetLang);
      }
      
      updateFlashcardProgress(word.id.toString(), targetLang, quality);
      
      // Award XP for correct quiz answers
      if (viewMode === 'quiz' && quality >= 4) {
        const xpAmount = timeLeft > 20 ? 15 : timeLeft > 10 ? 10 : 5;
        addXp(xpAmount);
        addNotification(t.correct_answer_xp.replace('{xp}', xpAmount.toString()), 'success');
        
        // AI Encouragement
        if (Math.random() > 0.7) {
          fetchAIHint('', '', targetLang, uiLang, '', true).then(msg => {
            if (msg) {
              setDogMessage(msg);
              setTimeout(() => setDogMessage(null), 4000);
            }
          });
        }
      }
    }

    setTimeout(() => {
      const currentQueue = viewMode === 'mistakes' ? mistakeWords : dueWords;
      if (currentIndex < currentQueue.length - 1) {
        setCurrentIndex(c => c + 1);
      } else {
        // Reached the end of the current due queue, re-evaluate
        loadQueues();
      }
    }, 200);
  };

  const playAudio = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playPronunciation(text, targetLang);
  };

  const handleDeepDive = async (e: React.MouseEvent, specificWord?: string) => {
    e.stopPropagation();
    const wordToAnalyze = specificWord || word?.word;
    if (!wordToAnalyze) return;
    
    if (!isOnline) {
      addNotification(t.offline_ai_warning || 'AI analysis is unavailable offline', 'warning');
      return;
    }

    if (!isPremium) {
      addNotification(t.premium_feature_mistakes || 'Deep Dive is a Premium feature', 'info');
      return;
    }

    if (specificWord) {
      setActiveDeepDiveWord(specificWord);
      setActiveExamplesWord(null);
    }
    
    setShowDeepDive(true);
    setIsFetchingDeepDive(true);
    const res = await fetchDeepDive(wordToAnalyze, targetLang, uiLang);
    setDeepDive(res);
    setIsFetchingDeepDive(false);
  };

  const handleShowExamples = async (e: React.MouseEvent, wordToFetch: string) => {
    e.stopPropagation();
    if (!isOnline) {
      addNotification(t.offline_ai_warning, 'warning');
      return;
    }

    if (activeExamplesWord === wordToFetch) {
      setActiveExamplesWord(null);
      return;
    }

    setActiveExamplesWord(wordToFetch);
    setActiveDeepDiveWord(null);
    setIsFetchingExamples(true);
    const res = await fetchContextualExamples(wordToFetch, targetLang, uiLang);
    setExamples(res);
    setIsFetchingExamples(false);
  };

  const handleRegenerateVisualAid = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!word) return;
    
    if (!isOnline) {
      addNotification(t.offline_ai_warning || 'AI visualization is unavailable offline', 'warning');
      return;
    }

    if (!isPremium) {
      addNotification(t.ai_visual_aid_premium || 'AI Visual Aid is a Premium feature', 'info');
      return;
    }

    setIsFetchingVisualAid(true);
    const englishKeyword = word.translations['en'] || word.word;
    const res = await fetchVisualAid(word.word, targetLang, englishKeyword, true);
    setVisualAid(res);
    setIsFetchingVisualAid(false);
  };

  const handleGenerateMnemonic = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!word) return;
    
    if (!isOnline) {
      addNotification(t.offline_ai_warning || 'AI analysis is unavailable offline', 'warning');
      return;
    }

    if (!isPremium) {
      addNotification(t.ai_visual_aid_premium || 'AI Mnemonic Aid is a Premium feature', 'info');
      return;
    }

    setIsGeneratingMnemonic(true);
    try {
      const translation = word.translations[uiLang] || word.translation;
      const promptData = await MnemonicService.getMnemonicPrompt(word.word, translation, targetLang);
      
      if (promptData.isAbstract) {
        const imageUrl = await MnemonicService.generateMnemonicImage(promptData.visualPrompt);
        if (imageUrl) {
          setMnemonicImageUrl(word.id.toString(), targetLang, imageUrl);
          setMnemonicExplanation(promptData.explanation);
          addNotification(t.mnemonic_visual_created || 'Mnemonic visual created!', 'success');
        } else {
          addNotification('Failed to generate mnemonic image', 'error');
        }
      } else {
        addNotification('This word is concrete enough for literal memory.', 'info');
      }
    } catch (error) {
       console.error("Error generating mnemonic:", error);
       addNotification('Error generating mnemonic', 'error');
    } finally {
      setIsGeneratingMnemonic(false);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const handleSyncOffline = async () => {
    if (isSyncing) return;
    if (!isOnline) {
      addNotification(t.offline_sync_warning || 'Sync is unavailable offline', 'warning');
      return;
    }
    if (!isPremium) {
      addNotification(t.ai_sync_premium || 'AI example sync is a Premium feature', 'info');
      return;
    }
    setIsSyncing(true);
    setSyncProgress(0);
    
    const wordsToSync = WORDS_BY_LANG[targetLang] || [];
    const total = wordsToSync.length;
    
    for (let i = 0; i < total; i++) {
      const w = wordsToSync[i];
      const cacheKey = `examples_${targetLang}_${w.id}`;
      
      // Check if already cached or has offline examples
      const hasOffline = !!OFFLINE_EXAMPLES[targetLang]?.[w.id];
      const hasCache = !!localStorage.getItem(cacheKey);
      
      if (!hasOffline && !hasCache) {
        try {
          const res = await fetchContextualExamples(w.word, targetLang, uiLang === 'en' && nativeLang === 'ru' ? 'ru' : uiLang);
          if (res && res.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(res));
          }
        } catch (e) {
          console.error(`Failed to sync ${w.word}:`, e);
        }
      }
      
      setSyncProgress(Math.round(((i + 1) / total) * 100));
    }
    
    setIsSyncing(false);
    addNotification(t.sync_complete || 'Sync complete!', 'success');
  };

  const handleAddWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {word?: string, translation?: string} = {};
    
    if (!newWord.trim()) {
      errors.word = t.validate_empty_word || 'Word is required';
    } else if (newWord.trim().length < 2) {
      errors.word = t.search_error_too_short || 'Too short';
    }
    
    if (!newTranslation.trim()) {
      errors.translation = t.validate_empty_translation || 'Translation is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      audioService.play(SoundEffect.ERROR);
      return;
    }

    addCustomWord(newWord.trim(), newTranslation.trim(), newTranscription.trim());
    setIsAddingWord(false);
    setNewWord('');
    setNewTranslation('');
    setNewTranscription('');
    setFormErrors({});
    loadQueues(); // Refresh queues
  };

  const renderViewModeButtons = () => (
    <div className="flex flex-col gap-4 mb-8 w-full max-w-5xl font-terminal">
      <div className="relative w-full">
        <Tooltip content={t.tooltip_search_vocab || "Search vocabulary"}>
          <div className="relative flex items-center group">
            <Search className={`absolute left-5 w-5 h-5 transition-colors ${searchError ? 'text-rose-500' : 'text-primary/40 group-focus-within:text-primary'} drop-shadow-[0_0_5px_var(--primary-glow)]`} />
            <input
              type="text"
              placeholder={t.search_placeholder_flashcards || 'SEARCH VOCABULARY...'}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`w-full pl-14 pr-24 py-3 bg-card/60 backdrop-blur-md border-2 rounded-none outline-none transition-all shadow-xl text-primary font-bold uppercase tracking-widest placeholder:text-primary/40 ${
                searchError 
                  ? 'border-rose-600 bg-rose-950/20' 
                  : 'border-primary/20 focus:border-primary/60'
              }`}
            />
            <div className="absolute right-3 flex items-center gap-2">
              <button
                onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                className={`p-2 rounded-none transition-all border ${
                  isKeyboardOpen 
                    ? 'bg-primary text-black border-primary shadow-[0_0_10px_var(--primary-glow)]' 
                    : 'text-primary/40 border-primary/20 hover:text-primary hover:border-primary/40 bg-black/40'
                }`}
              >
                <KeyboardIcon className="w-5 h-5" />
              </button>
              {searchQuery && (
                <button 
                  onClick={() => handleSearchChange('')}
                  className="p-1.5 hover:bg-rose-500/20 rounded-none transition-colors"
                >
                  <X className="w-5 h-5 text-rose-500" />
                </button>
              )}
            </div>
          </div>
        </Tooltip>
        <VirtualKeyboard
          isOpen={isKeyboardOpen}
          onClose={() => setIsKeyboardOpen(false)}
          onInput={(char) => handleSearchChange(searchQuery + char)}
          onDelete={() => handleSearchChange(searchQuery.slice(0, -1))}
          onEnter={() => setIsKeyboardOpen(false)}
          language={targetLang as any}
        />
      </div>
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        <Tooltip content={t.tooltip_review_mode || "Review Mode"}>
          <button 
            onClick={() => { setViewMode('review'); handleSearchChange(''); }} 
            className={`px-4 py-2 rounded-none font-black transition-all text-[9px] uppercase tracking-widest border-2 shadow-lg ${
              viewMode === 'review' 
                ? 'bg-primary text-black border-primary shadow-[0_0_15px_var(--primary-glow)] z-10' 
                : 'bg-card/80 text-primary/60 border-primary/10 hover:border-primary/40 hover:text-primary'
            }`}
          >
            {t.review}
          </button>
        </Tooltip>
        <Tooltip content={t.tooltip_quiz_mode || "Quiz Mode"}>
          <button 
            onClick={() => { setViewMode('quiz'); handleSearchChange(''); }} 
            className={`px-4 py-2 rounded-none font-black transition-all text-[9px] uppercase tracking-widest border-2 shadow-lg ${
              viewMode === 'quiz' 
                ? 'bg-primary text-black border-primary shadow-[0_0_15px_var(--primary-glow)] z-10' 
                : 'bg-card/80 text-primary/60 border-primary/10 hover:border-primary/40 hover:text-primary'
            }`}
          >
            {t.quiz_mode}
          </button>
        </Tooltip>
        <Tooltip content={t.tooltip_mastered_mode || "Mastered Mode"}>
          <button 
            onClick={() => setViewMode('mastered')} 
            className={`px-4 py-2 rounded-none font-black transition-all text-[9px] uppercase tracking-widest border-2 shadow-lg ${
              viewMode === 'mastered' 
                ? 'bg-primary text-black border-primary shadow-[0_0_15px_var(--primary-glow)] z-10' 
                : 'bg-card/80 text-primary/60 border-primary/10 hover:border-primary/40 hover:text-primary'
            }`}
          >
            {t.mastered} <span className="opacity-40 ml-1">[{masteredWords.length}]</span>
          </button>
        </Tooltip>
        <Tooltip content={t.tooltip_mistakes_mode || "Mistakes Mode"}>
          <button 
            onClick={() => setViewMode('mistakes')} 
            className={`px-4 py-2 rounded-none font-black transition-all text-[9px] uppercase tracking-widest border-2 shadow-lg flex items-center gap-2 ${
              viewMode === 'mistakes' 
                ? 'bg-rose-600 text-white border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)] z-10' 
                : 'bg-card/80 text-rose-500/60 border-rose-500/10 hover:border-rose-500/40 hover:text-rose-500'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.mistakes_label || 'ANOMALIES'} <span className="opacity-40 ml-1">[{mistakeWords.length}]</span>
          </button>
        </Tooltip>
        <Tooltip content={t.tooltip_saved_mode || "Saved Mode"}>
          <button 
            onClick={() => setViewMode('saved')} 
            className={`px-4 py-2 rounded-none font-black transition-all text-[9px] uppercase tracking-widest border-2 shadow-lg ${
              viewMode === 'saved' 
                ? 'bg-primary text-black border-primary shadow-[0_0_15px_var(--primary-glow)] z-10' 
                : 'bg-card/80 text-primary/60 border-primary/10 hover:border-primary/40 hover:text-primary'
            }`}
          >
            {t.saved_label || 'SAVED'} <span className="opacity-40 ml-1">[{savedExamples.length}]</span>
          </button>
        </Tooltip>
        <Tooltip content={t.tooltip_sync_offline || "Sync Offline"}>
          <button 
            onClick={handleSyncOffline}
            disabled={isSyncing}
            className={`px-4 py-2 rounded-none font-black transition-all text-[9px] uppercase tracking-widest border-2 shadow-lg flex items-center gap-2 ${
              isSyncing
                ? 'bg-muted/40 text-primary/20 border-primary/5 cursor-not-allowed'
                : 'bg-primary/5 text-primary border-primary/20 hover:border-primary hover:bg-primary/10'
            }`}
          >
            {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isSyncing ? `${syncProgress}%` : (t.sync_offline_label || 'SYNC')}
          </button>
        </Tooltip>

        {uid && (
          <Tooltip content={isOnline ? t.sync_cloud_tooltip : t.sync_cloud_warning}>
            <button 
              onClick={async () => {
                if (isCloudSyncing || !isOnline) return;
                setIsCloudSyncing(true);
                audioService.play(SoundEffect.CLICK);
                await fetchProgress(uid);
                loadQueues(); // Reload the queues with synced data
                setTimeout(() => setIsCloudSyncing(false), 1000);
              }}
              disabled={!isOnline || isCloudSyncing}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 border flex items-center gap-2 text-xs ${
                isCloudSyncing
                  ? 'bg-primary/10 text-primary border-primary/20 cursor-not-allowed'
                  : 'bg-secondary text-foreground border-border hover:border-primary/50'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin text-primary' : ''}`} />
              {isCloudSyncing ? t.sync_cloud_syncing : t.sync_cloud_label}
            </button>
          </Tooltip>
        )}
        <button 
          onClick={() => { audioService.play(SoundEffect.CLICK); setIsAddingWord(true); }}
          className="px-6 py-2.5 rounded-none font-black transition-all text-[10px] uppercase tracking-widest border-2 border-primary bg-primary text-black hover:shadow-[0_0_15px_var(--primary-glow)] flex items-center gap-2 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          {t.add_new_word || 'Add Word'}
        </button>
      </div>
    </div>
  );

  if (searchQuery.length > 1 && !searchError && !isListView) {
    return (
      <div className="flex flex-col items-center justify-start min-h-[70vh] pt-10 pb-20">
        <SEO title={`${t.flashcards} - ${t.search_results}`} description="Search results for vocabulary." />
        {renderViewModeButtons()}
        <div className="w-full max-w-2xl bg-card p-8 rounded-2xl shadow-xl border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4 flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            {t.search_results} ({searchResults.length})
          </h2>
          {searchResults.length === 0 ? (
            <p className="text-muted-foreground italic">{t.no_results || 'No results found.'}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {searchResults.map(w => {
                const progress = flashcardProgress[`${targetLang}_${w.id}`];
                return (
                  <div key={w.id} className="bg-secondary p-4 rounded-xl border border-border hover:border-primary/30 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <div className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{w.word}</div>
                          {w.transcription && (
                            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                              {w.transcription}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">{w.translations[uiLang] || w.translation}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => handleShowExamples(e, w.word)}
                            className={`p-2 rounded-full border transition-colors ${
                              activeExamplesWord === w.word
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card border-border text-primary hover:bg-primary/10'
                            }`}
                            title={t.show_examples || 'Show Examples'}
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDeepDive(e, w.word)}
                            className={`p-2 rounded-full border transition-colors ${
                              activeDeepDiveWord === w.word && deepDive
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card border-border text-amber-500 hover:bg-amber-500/10'
                            }`}
                            title={t.deep_dive}
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => playPronunciation(w.word, targetLang)}
                            className="p-2 bg-card rounded-full border border-border text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        {progress?.mastered && (
          <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            {t.mastered_label || 'Mastered'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {activeExamplesWord === w.word && (
                      <div className="mt-4 p-4 bg-card rounded-xl border border-primary/20 shadow-inner">
                        {isFetchingExamples ? (
                          <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-5/6"></div>
                            <div className="h-4 bg-muted rounded w-4/6"></div>
                          </div>
                        ) : examples.length > 0 ? (
                          <div className="space-y-4">
                            {examples.map((ex, i) => (
                              <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                  <p className="text-sm font-medium text-foreground leading-relaxed">
                                    {ex.sentence}
                                  </p>
                                  <button 
                                    onClick={(e) => playAudio(ex.sentence, e)}
                                    className="p-1 text-primary hover:bg-primary/10 rounded transition-colors shrink-0"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-xs text-muted-foreground italic mb-1">
                                  {ex.translation}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded">
                                    {ex.sourceName}
                                  </span>
                                  <button 
                                    onClick={() => saveExample(w.word, ex, targetLang)}
                                    className={`p-1 rounded transition-colors ${
                                      savedExamples.some(s => s.sentence === ex.sentence)
                                        ? 'text-amber-500'
                                        : 'text-muted-foreground/30 hover:text-amber-500'
                                    }`}
                                  >
                                    <Star className={`w-3 h-3 ${savedExamples.some(s => s.sentence === ex.sentence) ? 'fill-current' : ''}`} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button 
                              onClick={() => setActiveExamplesWord(null)}
                              className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
                            >
                              {t.close_examples || 'Close Examples'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">{t.no_examples_found || 'No real-life examples found.'}</p>
                        )}
                      </div>
                    )}

                    {activeDeepDiveWord === w.word && (
                      <div className="mt-4 p-4 bg-card rounded-xl border border-primary/20 shadow-inner">
                        {isFetchingDeepDive ? (
                          <div className="animate-pulse space-y-2">
                            <div className="h-3 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        ) : deepDive ? (
                          <div className="space-y-4">
                            {deepDive.definition && (
                              <p className="text-xs text-foreground font-medium bg-primary/5 p-3 rounded-lg border border-primary/20">
                                {deepDive.definition}
                              </p>
                            )}
                            {deepDive.etymology && (
                              <p className="text-xs text-muted-foreground italic">"{deepDive.etymology}"</p>
                            )}
                            <div className="bg-primary/5 p-3 rounded-lg">
                              <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                {t.mnemonic || 'Mnemonic'}
                              </div>
                              <p className="text-xs text-primary/80 font-medium">{deepDive.mnemonics}</p>
                            </div>
                            <button 
                              onClick={() => setActiveDeepDiveWord(null)}
                              className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
                            >
                              {t.close_analysis || 'Close Analysis'}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                    {progress && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t.next_review || 'Next'}: {new Date(progress.nextReviewDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {t.ease_factor || 'Ease'}: {progress.easeFactor.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'saved') {
    const { removeExample } = useStore();
    return (
      <div className="flex flex-col items-center justify-start min-h-[70vh] pt-10 pb-20">
        <SEO title={`${t.flashcards} - ${t.saved_examples || 'Saved Examples'}`} description="Review your saved contextual examples." />
        {renderViewModeButtons()}
        <div className="w-full max-w-2xl bg-card p-8 rounded-2xl shadow-xl border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-primary fill-current" />
            {t.saved_examples || 'Saved Examples'}
          </h2>
          {filteredSavedExamples.length === 0 ? (
            <p className="text-muted-foreground italic">{t.no_saved_examples || 'No saved examples yet.'}</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredSavedExamples.map((ex, i) => (
                <div key={i} className="bg-secondary p-5 rounded-xl border border-border hover:border-primary/30 transition-colors group relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                        {ex.word}
                      </span>
                      <span className="text-xl">{LANGUAGES.find(l => l.id === ex.targetLang)?.flag}</span>
                      {ex.source && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                          {ex.source === 'news' && <Newspaper className="w-3 h-3" />}
                          {ex.source === 'books' && <Book className="w-3 h-3" />}
                          {ex.source === 'social media' && <MessageCircle className="w-3 h-3" />}
                          <span>{ex.sourceName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(ex.sentence);
                          addNotification(t.copied || 'Copied to clipboard!', 'success');
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-all"
                        title={t.tooltip_copy || "Copy"}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => removeExample(ex.sentence)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title={t.remove || "Remove"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-foreground font-medium mb-1">"{ex.sentence}"</p>
                  <p className="text-sm text-muted-foreground italic">{ex.translation}</p>
                  <button 
                    onClick={() => playPronunciation(ex.sentence, ex.targetLang as any)}
                    className="mt-3 text-primary flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:underline"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {t.play_audio || 'Play Audio'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'mastered') {
    return (
      <div className="flex flex-col items-center justify-start min-h-[70vh] pt-10 pb-20">
        <SEO title={`${t.flashcards} - ${t.mastered}`} description="Review your mastered vocabulary words." />
        {renderViewModeButtons()}
        <div className="w-full max-w-2xl bg-card p-8 rounded-2xl shadow-xl border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6 border-b border-border pb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            {t.mastered_words}
          </h2>
          {filteredMasteredWords.length === 0 ? (
            <p className="text-muted-foreground italic">{t.no_mastered}</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredMasteredWords.map(w => (
                <div key={w.id} className="flex flex-col bg-secondary p-4 rounded-xl border border-border hover:border-primary/30 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <div className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{w.word}</div>
                        {w.transcription && (
                          <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                            {w.transcription}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">{w.translations[uiLang] || w.translation}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => playPronunciation(w.word, targetLang)}
                        className="p-2 bg-card rounded-full border border-border text-primary hover:bg-primary/10 transition-colors"
                        title={t.play_audio || 'Play Audio'}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDeepDive(e, w.word)}
                        className={`p-2 rounded-full border transition-colors ${
                          activeDeepDiveWord === w.word && deepDive
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card border-border text-amber-500 hover:bg-amber-500/10'
                        }`}
                        title={t.deep_dive}
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          resetFlashcardProgress(w.id.toString(), targetLang);
                          loadQueues();
                        }}
                        className="px-4 py-2 bg-card border border-border text-muted-foreground rounded-lg font-bold text-xs hover:border-rose-500 hover:text-rose-500 transition-all"
                      >
                        {t.reset}
                      </button>
                    </div>
                  </div>

                  {activeDeepDiveWord === w.word && (
                    <div className="mt-4 p-4 bg-card rounded-xl border border-primary/20 shadow-inner">
                      {isFetchingDeepDive ? (
                        <div className="animate-pulse space-y-2">
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ) : deepDive ? (
                        <div className="space-y-4">
                          {deepDive.definition && (
                            <p className="text-xs text-foreground font-medium bg-primary/5 p-3 rounded-lg border border-primary/20">
                              {deepDive.definition}
                            </p>
                          )}
                          {deepDive.etymology && (
                            <p className="text-xs text-muted-foreground italic">"{deepDive.etymology}"</p>
                          )}
                          <div className="bg-primary/5 p-3 rounded-lg">
                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              {t.mnemonic || 'Mnemonic'}
                            </div>
                            <p className="text-xs text-primary/80 font-medium">{deepDive.mnemonics}</p>
                          </div>
                          <button 
                            onClick={() => setActiveDeepDiveWord(null)}
                            className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
                          >
                            {t.close_analysis || 'Close Analysis'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <SEO title={t.flashcards || 'Flashcards'} description="Review your vocabulary words." />
        {renderViewModeButtons()}
        <div className="text-center py-20 px-6 max-w-md">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl border-2 ${
              viewMode === 'mistakes' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-primary/10 border-primary/20 text-primary'
            }`}
          >
            {viewMode === 'mistakes' ? <CheckCircle2 className="w-12 h-12" /> : <RotateCw className="w-12 h-12" />}
          </motion.div>
          
          <div className="text-4xl font-bold text-foreground mb-4 uppercase tracking-tight">
            {viewMode === 'mistakes' ? (t.mistakes_empty || 'Anomalies cleared') : t.deck_completed}
          </div>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
            {viewMode === 'mistakes' ? (t.repaired_desc || 'System integrity optimal. All errors have been corrected.') : t.all_cards_reviewed}
          </p>

          <button 
            onClick={() => setViewMode('review')}
            className="mt-12 px-10 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            {t.return_to_training || 'Return to training'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden">
      <SEO title={`${t.flashcards} - Fennec`} description="Master vocabulary with spaced repetition." />
      
      {/* Background Feedback Glow */}
      <AnimatePresence>
        {answerFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 pointer-events-none z-0 ${
              answerFeedback === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Session Streak */}
      <AnimatePresence>
        {sessionStreak >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 z-40 bg-card px-4 py-2 rounded-full border border-amber-500/20 shadow-lg flex items-center gap-2"
          >
            <div className="w-6 h-6 bg-amber-500/10 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-500 fill-current" />
            </div>
            <span className="text-sm font-bold text-foreground">
              {sessionStreak} {t.streak_label || 'Streak'}!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Helper */}
      <div className="fixed bottom-32 right-8 z-50 flex flex-col items-end">
        <AnimatePresence>
          {dogMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="mb-4 flex items-end gap-3 max-w-[300px]"
            >
              <div className="bg-card border-2 border-primary/20 text-foreground px-6 py-4 rounded-2xl shadow-2xl text-sm font-medium relative">
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r-2 border-b-2 border-primary/20 rotate-45"></div>
                {dogMessage}
              </div>
              <PetDisplay size="sm" hideMessage className="mb-1 border-primary/20 shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {viewMode === 'quiz' && !isSubmitted && (
          <Tooltip content={t.ask_ai_assistant || 'Ask Fennec for a hint'} position="left">
            <button
              onClick={handleFennecHint}
              disabled={dogHintUsed}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-bold text-sm shadow-xl ${
                dogHintUsed
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                  : 'bg-primary text-black hover:opacity-90 hover:scale-105 active:scale-95 shadow-primary/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">{t.fennec_label}</span>
            </button>
          </Tooltip>
        )}
      </div>

      <SEO title={t.flashcards || 'Flashcards'} description="Review your vocabulary words using spaced repetition." />
      {renderViewModeButtons()}

      <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
        <div className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground bg-card px-6 py-2 rounded-full border border-border flex items-center gap-3 shadow-sm">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/20" />
          <span>
            {viewMode === 'mistakes' ? (t.mistakes_bank || 'Mistakes Bank') : t.vocab_training} • {currentIndex + 1} / {viewMode === 'mistakes' ? mistakeWords.length : dueWords.length}
          </span>
        </div>

        <div className="flex items-center gap-3 bg-card px-6 py-2 rounded-full border border-border shadow-sm transition-all hover:shadow-md">
           <Activity className={`w-4 h-4 ${circadianFactor > 1.1 ? 'text-primary animate-pulse' : 'text-muted-foreground/30'}`} />
           <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5">{t.brain_activity}</span>
              <span className={`text-[10px] font-bold leading-none uppercase tracking-widest ${circadianFactor > 1.1 ? 'text-primary' : circadianFactor < 0.8 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                 {circadianFactor > 1.2 ? t.peak_optimization : circadianFactor > 1.0 ? t.high_focus : circadianFactor > 0.7 ? t.moderate : t.fatigued}
                 {timeBonus !== 0 && <span className="ml-1 opacity-60">({timeBonus > 0 ? '+' : ''}{timeBonus}%)</span>}
              </span>
           </div>
        </div>
        
        {sessionStreak > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-amber-500 text-white px-6 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="tabular-nums">{sessionStreak} {t.streak_label}!</span>
          </motion.div>
        )}
        {viewMode === 'quiz' && (
          <div className="flex items-center gap-3">
            <div className={`font-bold text-[10px] uppercase tracking-widest px-6 py-2 rounded-full border flex items-center gap-2 transition-all ${
              timeLeft <= 5 
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' 
                : 'bg-card text-muted-foreground border-border'
            }`}>
              <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'animate-bounce' : ''}`} />
              <span className="tabular-nums">{timeLeft}s</span>
            </div>
            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / 30) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
                className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-primary'}`}
              />
            </div>
          </div>
        )}

        {fatiguePenalty > 10 && (
          <div className={`text-[9px] font-bold px-4 py-1.5 rounded-full border flex items-center gap-2 transition-all tracking-widest uppercase ${
            fatiguePenalty > 70 
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-lg shadow-rose-500/10' 
              : fatiguePenalty > 40
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            <Activity className={`w-3.5 h-3.5 ${fatiguePenalty > 70 ? 'animate-pulse' : ''}`} />
            <span>
              {fatiguePenalty > 70 ? t.extreme_fatigue : fatiguePenalty > 40 ? t.high_fatigue : t.moderate_fatigue} 
              • -{fatiguePenalty}%
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full max-w-[350px] aspect-[2.5/3.5] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction * 50, rotateY: 0 }}
            animate={{ 
              opacity: 1, 
              x: answerFeedback === 'incorrect' ? [0, -10, 10, -10, 10, 0] : 0,
              rotateY: isFlipped ? 180 : 0,
              scale: answerFeedback === 'correct' ? [1, 1.02, 1] : 1
            }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ 
              duration: 0.6,
              rotateY: { 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
              },
              opacity: { duration: 0.2 },
              x: answerFeedback === 'incorrect' 
                ? { duration: 0.4, ease: "easeInOut" }
                : { type: "spring", stiffness: 300, damping: 30 },
              scale: { duration: 0.3 }
            }}
            style={{ transformStyle: "preserve-3d" }}
            whileHover={{ scale: 1.01, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (viewMode !== 'quiz' && !answerFeedback) {
                audioService.play(SoundEffect.CARD_FLIP);
                setIsFlipped(!isFlipped);
              }
            }}
            className={`absolute inset-0 w-full h-full cursor-pointer rounded-3xl border-2 flex flex-col bg-card transition-all duration-300 volumetric-shadow ${
              answerFeedback === 'correct' 
                ? 'border-emerald-500 volumetric-shadow-emerald' 
                : answerFeedback === 'incorrect'
                  ? 'border-rose-500 shadow-[0_4px_0_rgba(244,63,94,0.4),0_8px_15px_rgba(0,0,0,0.1)]'
                  : 'border-border'
            }`}
          >
            {/* Feedback Overlay */}
            <AnimatePresence>
              {answerFeedback && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 z-50 flex items-center justify-center rounded-3xl pointer-events-none overflow-hidden ${
                    answerFeedback === 'correct' 
                      ? 'bg-emerald-500/10' 
                      : 'bg-rose-500/10'
                  }`}
                >
                  {/* Subtle Shimmer for Correct */}
                  {answerFeedback === 'correct' && (
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                    />
                  )}

                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: [0, -10, 10, 0] }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="bg-card p-4 rounded-full shadow-2xl border-4 border-border"
                  >
                    {answerFeedback === 'correct' ? (
                      <Check className="w-12 h-12 text-emerald-500" strokeWidth={4} />
                    ) : (
                      <X className="w-12 h-12 text-rose-500" strokeWidth={4} />
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Front Side */}
            <div 
              className="absolute inset-0 w-full h-full flex flex-col bg-card rounded-3xl overflow-hidden border border-border shadow-xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="bg-secondary/50 px-6 py-4 flex justify-between items-center border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted-foreground text-[10px] tracking-widest uppercase">
                    {currentLang ? (currentLang.name[uiLang as keyof typeof currentLang.name] || currentLang.name.en) : ''}
                  </span>
                  {viewMode === 'quiz' && (quizType === 'audio' || quizType === 'listening-dictation') && (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wide border border-primary/10 flex items-center gap-1.5">
                      <Volume2 className="w-3 h-3" />
                      {t.listening_challenge}
                    </span>
                  )}
                </div>
                  <div className="flex items-center gap-2">
                    {viewMode === 'mistakes' && useStore.getState().mistakes[`${targetLang}_${word.id}`] && (
                      <div className="flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <div className="flex gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1.5 h-1.5 rounded-full ${i < (useStore.getState().mistakes[`${targetLang}_${word.id}`]?.repairCount || 0) ? 'bg-rose-500' : 'bg-rose-500/20'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter ml-1">
                          {t.mastery || 'Mastery'}
                        </span>
                      </div>
                    )}
                    {!useStore.getState().flashcardProgress[`${targetLang}_${word.id}`] && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-tighter animate-pulse">
                        {t.new_card || 'New'}
                      </span>
                    )}
                    <div className="text-xl">
                      {currentLang?.flag}
                    </div>
                  </div>
              </div>
              
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-6" dir={targetLang === 'ar' ? 'rtl' : 'ltr'}>
                  <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight flex flex-col md:flex-row items-center justify-center gap-4">
                    {viewMode === 'quiz' && (quizType === 'audio' || quizType === 'listening-dictation') && !isSubmitted ? (
                      <div 
                        className="flex flex-col items-center gap-4 cursor-pointer hover:scale-105 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(word.word, e);
                        }}
                      >
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-xl shadow-primary/10 border border-primary/20">
                          <Volume2 className="w-10 h-10" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">{t.replay_audio}</span>
                      </div>
                    ) : (
                      <>
                        <span>{word.word}</span>
                        {(viewMode !== 'quiz' || isSubmitted) && word.transcription && (
                          <span className="text-sm md:text-lg font-mono text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
                            {word.transcription}
                          </span>
                        )}
                      </>
                    )}
                  </h2>
                  
                  {!(viewMode === 'quiz' && (quizType === 'audio' || quizType === 'listening-dictation') && !isSubmitted) && (
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(word.word, e);
                        }}
                        className="bg-card border border-border text-primary p-4 rounded-2xl hover:bg-primary/10 active:translate-y-1 transition-all shadow-md group"
                      >
                        <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                      </button>

                      {isSpeechSupported && (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            isListening ? stopListening() : startListening();
                          }}
                          className={`p-4 rounded-2xl transition-all shadow-md ${
                            isListening 
                              ? 'bg-rose-500 text-white animate-pulse' 
                              : 'bg-card border border-border text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                      )}

                      <Tooltip content={t.deep_dive || 'Deep Dive'}>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isFlipped) {
                              setIsFlipped(true);
                              audioService.play(SoundEffect.CARD_FLIP);
                            }
                            handleDeepDive(e);
                          }}
                          className={`p-4 rounded-2xl border transition-all shadow-md ${
                            deepDive && activeDeepDiveWord === word?.word
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card border-border text-amber-500 hover:bg-amber-500/10'
                          }`}
                        >
                          <Zap className="w-6 h-6" />
                        </button>
                      </Tooltip>
                    </div>
                  )}

                  {/* Pronunciation Feedback */}
                  <AnimatePresence>
                    {(isFetchingPronunciation || pronunciationFeedback) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`w-full max-w-[280px] p-4 border text-left ${
                          isFetchingPronunciation 
                            ? 'bg-primary/5 border-primary/20 animate-pulse' 
                            : pronunciationFeedback?.isCorrect 
                              ? 'bg-primary/10 border-primary/30' 
                              : 'bg-orange-900/40 border-orange-500/30'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isFetchingPronunciation ? (
                          <div className="flex items-center gap-3 text-primary/60">
                            <Bot className="w-4 h-4 animate-spin" />
                            <span className="font-mono font-bold text-[10px] uppercase tracking-widest">{t.analyzing_pronunciation}</span>
                          </div>
                        ) : pronunciationFeedback && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {pronunciationFeedback.isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-primary" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                                )}
                                <span className={`font-mono font-bold text-[10px] uppercase tracking-widest ${pronunciationFeedback.isCorrect ? 'text-primary' : 'text-orange-500'}`}>
                                  {pronunciationFeedback.isCorrect ? t.great_pronunciation : t.needs_practice}
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] font-mono text-primary/70 leading-relaxed text-left">
                              {pronunciationFeedback.feedback}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPronunciationFeedback(null);
                                startListening();
                              }}
                              className="w-full mt-2 py-1.5 border border-primary text-primary text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 rounded-lg"
                            >
                              <RefreshCw className="w-3 h-3" />
                              {t.retry}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            </div>

            {/* Back Side */}
            <div 
              className="absolute inset-0 w-full h-full flex flex-col bg-card rounded-3xl overflow-hidden border border-border shadow-2xl"
              style={{ 
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden"
              }}
            >
              <div className="bg-secondary/50 px-6 py-4 flex justify-between items-center border-b border-border sticky top-0 z-20">
                <span className="font-bold text-muted-foreground text-[10px] tracking-widest uppercase">
                  {t.translation_matrix || 'ACADEMIC INSIGHT'}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                      <Activity className="w-3 h-3" />
                      {t.fatigue}
                    </div>
                    <div className="w-24 h-1.5 bg-secondary mt-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${fatiguePenalty}%` }}
                        className={`h-full rounded-full transition-colors ${fatiguePenalty > 75 ? 'bg-rose-500' : fatiguePenalty > 40 ? 'bg-amber-500' : 'bg-primary'}`}
                      />
                    </div>
                  </div>
                  <div className="text-xl">
                    {LANGUAGES.find(l => l.id === uiLang)?.flag || '🇺🇸'}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-start p-6 text-center overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 mb-2 mt-4">
                  {wordProgress?.mastered && (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-current" />
                      {t.mastered_label}
                    </div>
                  )}
                  {wordProgress?.interval > 0 && (
                    <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {Math.round(wordProgress.interval)}d
                    </div>
                  )}
                </div>

                <h2 className="text-4xl font-black text-foreground leading-tight mb-2 tracking-tight">
                  {word.translations[uiLang] || word.translation}
                </h2>

                {wordProgress?.isLeech && (
                  <div className="mb-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {t.leech_warning || 'LEECH DETECTED: MEMORY CONFLICT'}
                  </div>
                )}

                {word.transcription && (
                  <div className="mb-6 inline-block px-4 py-1.5 bg-secondary rounded-full border border-border">
                    <p className="text-sm font-mono text-muted-foreground">
                      {word.transcription}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-8">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(word.word, e);
                    }}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-primary/20"
                  >
                    <Volume2 className="w-5 h-5" />
                    {t.listen}
                  </button>
                </div>

                {/* SRS Metrics Insight */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] mb-8 bg-secondary/30 p-4 border border-border rounded-2xl font-terminal">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t.stability || 'Stability'}</span>
                    <div className="flex items-center gap-1 text-xs font-black text-primary">
                      <TrendingUp className="w-3 h-3" />
                      {wordProgress?.interval > 0 ? (wordProgress.interval >= 1 ? `${Math.round(wordProgress.interval)}d` : `${Math.round(wordProgress.interval * 24)}h`) : '0h'}
                    </div>
                  </div>
                  <div className="flex flex-col items-center border-x border-border">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t.ease_factor || 'E-Factor'}</span>
                    <div className="text-xs font-black text-amber-500">
                      {wordProgress?.easeFactor?.toFixed(1) || '2.5'}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t.lapses || 'Lapses'}</span>
                    <div className="flex items-center gap-1 text-xs font-black text-rose-500">
                      <RotateCcw className="w-3 h-3" />
                      {wordProgress?.lapses || 0}
                    </div>
                  </div>
                </div>

                {/* Mnemonic Section */}
                <div className="w-full flex justify-center mb-10">
                  {isGeneratingMnemonic ? (
                    <div className="w-full max-w-[200px] aspect-square animate-pulse bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-indigo-200 dark:border-indigo-800">
                       <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
                       <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t.generating_mnemonic}</span>
                    </div>
                  ) : wordProgress?.mnemonicImageUrl ? (
                    <div className="flex flex-col items-center w-full max-w-[280px]">
                       <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full aspect-square max-w-[240px] rounded-3xl overflow-hidden shadow-2xl relative group bg-white dark:bg-slate-950 border-4 border-white dark:border-slate-800"
                       >
                         <img 
                          src={wordProgress.mnemonicImageUrl} 
                          alt="Mnemonic Visual" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                         />
                         <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                           {t.mnemonic_aid}
                         </div>
                       </motion.div>
                       {mnemonicExplanation && (
                         <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 text-sm text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 leading-relaxed shadow-sm text-left"
                         >
                            <Lightbulb className="w-4 h-4 text-amber-500 inline mr-2 mb-0.5" />
                            {mnemonicExplanation}
                         </motion.p>
                       )}
                       <button 
                        onClick={handleGenerateMnemonic}
                        className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                       >
                        <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                        {t.regenerate || 'Regenerate mnemonic'}
                       </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGenerateMnemonic}
                      className="w-full max-w-[240px] aspect-square rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-all group flex flex-col items-center justify-center gap-3 p-8 text-center shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                        <Sparkles className="w-8 h-8 text-slate-300 group-hover:scale-110 group-hover:text-indigo-500 transition-all" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest block mb-1">{t.mnemonic_aid}</span>
                        <p className="text-[11px] font-medium leading-tight opacity-70">{t.mnemonic_desc}</p>
                      </div>
                    </button>
                  )}
                </div>

                {isFetchingVisualAid ? (
                  <div className="w-full aspect-square max-w-[240px] mb-12 animate-pulse bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-200 dark:text-slate-700 animate-bounce" />
                  </div>
                ) : visualAid ? (
                  <div className="flex flex-col items-center mb-12">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full max-w-[240px] rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white dark:border-slate-800 group"
                    >
                      <img 
                        src={visualAid} 
                        alt="Visual Aid" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        {t.ai_aid || 'AI Visual'}
                      </div>
                    </motion.div>
                    <Tooltip content={t.tooltip_regenerate_visual || "Regenerate Visual Aid"}>
                      <button 
                        onClick={handleRegenerateVisualAid}
                        className="mt-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group"
                      >
                        <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                        {t.regenerate || 'Regenerate image'}
                      </button>
                    </Tooltip>
                  </div>
                ) : isPremium ? (
                  <Tooltip content={t.tooltip_regenerate_visual || "Generate Visual Aid"}>
                    <button 
                      onClick={handleRegenerateVisualAid}
                      className="w-full max-w-[240px] mb-12 aspect-square rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center hover:bg-slate-100 dark:hover:bg-slate-800 shadow-inner group transition-all"
                    >
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <p className="text-[10px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 uppercase tracking-widest font-bold leading-relaxed">
                        {t.generate_visual_aid || 'Generate Visual Aid'}
                      </p>
                    </button>
                  </Tooltip>
                ) : (
                  <div className="w-full max-w-[240px] mb-12 aspect-square rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center">
                    <Lock className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-4" />
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-6">{t.ai_visual_aid || 'AI Visual Aid'}</p>
                    <button onClick={buyPremium} className="text-[10px] font-bold text-white uppercase tracking-widest bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                      {t.upgrade_now}
                    </button>
                  </div>
                )}
                
                {true && (
                  <div className="w-full text-left mt-8 border-t border-border pt-10">
                    {wordProgress && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                        <div className="bg-secondary p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1.5 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {t.stability}
                          </div>
                          <div className="text-xs font-black text-foreground">
                            {wordProgress.stability?.toFixed(1) || '1.0'}
                          </div>
                        </div>
                        <div className="bg-secondary p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1.5 flex items-center gap-2">
                            <Activity className="w-3 h-3 text-rose-500" />
                            {t.difficulty}
                          </div>
                          <div className="text-xs font-black text-foreground">
                            {wordProgress.difficulty?.toFixed(1) || '5.0'}
                          </div>
                        </div>
                        <div className="bg-secondary p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1.5 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            {t.learning_rate || 'Rate'}
                          </div>
                          <div className="text-xs font-black text-foreground">
                            {wordProgress.easeFactor?.toFixed(2) || '2.50'}
                          </div>
                        </div>
                        <div className="bg-secondary p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1.5 flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            {t.next_review_label}
                          </div>
                          <div className="text-xs font-black text-foreground">
                            {new Date(wordProgress.nextReviewDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                          <Zap className="w-5 h-5 text-primary" />
                          {t.deep_dive || 'Deep Dive Analysis'}
                        </h3>
                        {!deepDive && !isFetchingDeepDive && (
                          <Tooltip content={t.tooltip_analyze_word}>
                            <button
                              onClick={handleDeepDive}
                              className={`text-[10px] font-bold uppercase tracking-widest transition-all px-4 py-2 border rounded-xl shadow-sm ${!isPremium ? 'text-muted-foreground border-border' : 'text-primary border-primary/20 bg-primary/10 hover:bg-primary/20'}`}
                            >
                              {t.analyze_word || 'Analyze Word'} {!isPremium && <Lock className="w-3 h-3 inline ml-1" />}
                            </button>
                          </Tooltip>
                        )}
                      </div>

                      {!isPremium && !deepDive && (
                        <div className="bg-secondary p-8 rounded-3xl border-2 border-dashed border-border text-center">
                          <p className="text-[11px] text-muted-foreground mb-6 font-medium leading-relaxed">
                            {t.deep_dive_premium || 'Unlock linguistic patterns, etymology, and common mistakes with Premium.'}
                          </p>
                          <button onClick={buyPremium} className="text-[10px] font-bold text-primary border border-primary/20 px-6 py-2.5 rounded-xl hover:bg-primary/5 transition-all">
                            {t.upgrade_now}
                          </button>
                        </div>
                      )}

                      {isFetchingDeepDive ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-muted rounded-full w-3/4"></div>
                          <div className="h-4 bg-muted rounded-full w-1/2"></div>
                          <div className="h-24 bg-card rounded-3xl w-full"></div>
                        </div>
                      ) : deepDive ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-8 text-left"
                        >
                          {deepDive.definition && (
                            <div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Book className="w-3 h-3" />
                                {t.definition || 'Detailed Definition'}
                              </div>
                              <p className="text-sm text-foreground font-medium leading-relaxed bg-primary/5 p-5 rounded-2xl border border-primary/20">
                                {deepDive.definition}
                              </p>
                            </div>
                          )}

                          {deepDive.etymology && (
                            <div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                <History className="w-3 h-3" />
                                {t.etymology || 'Origin & Etymology'}
                              </div>
                              <p className="text-sm text-muted-foreground italic leading-relaxed bg-secondary p-4 rounded-2xl border border-border">
                                {deepDive.etymology}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                              <BookOpen className="w-3 h-3" />
                              {t.grammar_usage || 'Grammar & Usage'}
                            </div>
                            <ul className="space-y-3">
                              {deepDive.grammarRules.map((rule, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 bg-secondary/50 p-3 rounded-xl border border-border/50">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                  {rule}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {deepDive.culturalContext && (
                            <div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Globe className="w-3 h-3" />
                                {t.cultural_context || 'Cultural Context'}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed bg-primary/5 p-5 rounded-2xl border border-primary/20">
                                {deepDive.culturalContext}
                              </p>
                            </div>
                          )}

                          <div>
                            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3" />
                              {t.common_mistakes || 'Common Mistakes'}
                            </div>
                            <ul className="space-y-2 pl-2">
                              {deepDive.commonMistakes.map((mistake, i) => (
                                <li key={i} className="text-sm text-rose-600 dark:text-rose-400 flex items-start gap-2">
                                  <span className="text-rose-300">✕</span>
                                  {mistake}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {deepDive.mnemonics && (
                            <div className="bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20">
                              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                {t.mnemonic || 'Memory Tool'}
                              </div>
                              <p className="text-sm text-foreground font-bold leading-relaxed italic">
                                {deepDive.mnemonics}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ) : null}
                    </div>

                    <div className="mb-10">
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-3 mb-6">
                        <Globe className="w-4 h-4" />
                        {t.translation_matrix || 'Global Intercept'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {LANGUAGES.filter(l => l.id !== targetLang).map(lang => (
                          <div key={lang.id} className="bg-secondary p-4 rounded-2xl border border-border flex items-center gap-4 transition-all hover:bg-card hover:shadow-md group">
                            <span className="text-xl shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">{lang.flag}</span>
                            <div className="min-w-0">
                              <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate mb-1">
                                {lang.nativeName}
                              </div>
                              <div className="text-xs font-bold text-foreground truncate tracking-tight uppercase">
                                {word.translations[lang.id] || '—'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-3">
                        <BookOpen className="w-5 h-5" />
                        {t.contextual_examples || 'Contextual usage'}
                      </h3>
                      {isExamplesRequested && (
                        <Tooltip content={showExamples ? t.tooltip_hide_examples : t.tooltip_show_examples}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowExamples(!showExamples);
                            }}
                            className="p-3 rounded-xl border border-border bg-card hover:bg-secondary transition-all text-muted-foreground hover:text-primary shadow-sm"
                          >
                            {showExamples ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </Tooltip>
                      )}
                    </div>

                    {!isExamplesRequested ? (
                      <Tooltip content={t.tooltip_get_examples || "Get usage examples from AI"}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isPremium) {
                              addNotification(t.context_examples_premium_info || 'Contextual examples are a Premium feature', 'info');
                              return;
                            }
                            setIsExamplesRequested(true);
                            setShowExamples(true);
                          }}
                          className={`w-full py-8 rounded-3xl border-2 border-dashed font-bold transition-all flex flex-col items-center justify-center gap-3 group mb-10 tracking-widest uppercase text-[10px] ${
                            !isPremium 
                              ? 'border-border text-muted-foreground' 
                              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                          }`}
                        >
                          <Search className="w-8 h-8 group-hover:scale-110 transition-transform mb-1 text-primary/40" />
                          {t.get_examples || 'Generate usage examples'} {!isPremium && <Lock className="w-4 h-4 ml-1" />}
                        </button>
                      </Tooltip>
                    ) : (
                      <AnimatePresence>
                        {showExamples && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            {isFetchingExamples ? (
                              <div className="flex flex-col gap-4">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className="animate-pulse bg-secondary h-24 rounded-2xl border border-border w-full"></div>
                                ))}
                              </div>
                            ) : examples.length > 0 ? (
                              <div className="flex flex-col gap-6">
                                {examples.map((ex, i) => (
                                  <div key={i} className="bg-secondary p-6 rounded-3xl border border-border shadow-sm relative group/ex overflow-hidden">
                                     <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover/ex:bg-primary transition-colors"></div>
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                      <Tooltip content={t.tooltip_copy || "Copy"}>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(ex.sentence);
                                            addNotification(t.copied || 'Copied to clipboard!', 'success');
                                          }}
                                          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-card transition-all shadow-sm"
                                        >
                                          <Copy className="w-4 h-4" />
                                        </button>
                                      </Tooltip>
                                      <Tooltip content={t.tooltip_play_audio || "Listen"}>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            playAudio(ex.sentence, e);
                                          }}
                                          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-card transition-all shadow-sm"
                                        >
                                          <Volume2 className="w-4 h-4" />
                                        </button>
                                      </Tooltip>
                                      <Tooltip content={t.tooltip_save_example || "Save Example"}>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            saveExample(word.word, ex, targetLang);
                                            addNotification(t.example_saved || 'Example saved!', 'success');
                                          }}
                                          className={`p-2 rounded-lg border transition-all shadow-sm ${
                                            savedExamples.some(se => se.sentence === ex.sentence)
                                              ? 'text-white bg-amber-500 border-amber-500 shadow-amber-500/20'
                                              : 'border-border text-muted-foreground hover:text-amber-500 hover:bg-card'
                                          }`}
                                        >
                                          <Star className={`w-4 h-4 ${savedExamples.some(se => se.sentence === ex.sentence) ? 'fill-current' : ''}`} />
                                        </button>
                                      </Tooltip>
                                      <div className="flex items-center gap-2 px-3 py-1 bg-card rounded-full text-[9px] font-bold uppercase tracking-widest text-muted-foreground border border-border ml-2">
                                        {ex.source === 'news' && <Newspaper className="w-3 h-3" />}
                                        {ex.source === 'books' && <Book className="w-3 h-3" />}
                                        {ex.source === 'social media' && <MessageCircle className="w-3 h-3" />}
                                        {ex.sourceName || ex.source}
                                      </div>
                                    </div>
                                    <p className="text-base text-foreground font-bold mb-3 pr-24 leading-snug">"{ex.sentence}"</p>
                                    <p className="text-xs text-muted-foreground font-medium italic">{ex.translation}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-muted-foreground italic text-center font-bold uppercase tracking-widest">{t.no_examples_found || 'No examples found'}</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 text-center text-muted-foreground text-[10px] font-bold py-5 bg-card/90 backdrop-blur-md border-t border-border rounded-b-3xl uppercase tracking-widest shadow-xl">
              {viewMode === 'quiz' ? (
                <span>{t.select_answer || 'Select correct answer'}</span>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <RotateCw className="w-4 h-4 animate-spin-slow text-primary" />
                  <span>{t.tap_to_flip || 'Tap to reveal answer'}</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Action Buttons / Quiz Options */}
      {viewMode === 'quiz' ? (
        <div className="flex flex-col gap-4 mt-8 w-full max-w-[360px] pb-24">
          {quizType === 'mcq' || quizType === 'audio' ? (
            <div className="flex flex-col gap-3">
              {quizOptions.map((opt, idx) => {
                const correctAnswer = word.translations[uiLang] || word.translation;
                const isSelected = selectedOption === opt;
                const isCorrect = opt === correctAnswer;
                const showResult = isSubmitted;
                
                let buttonClass = "w-full py-5 rounded-2xl font-bold text-sm transition-all relative flex items-center justify-between px-8 shadow-lg group ";
                if (!showResult) {
                  if (isSelected) {
                    buttonClass += "bg-primary text-primary-foreground shadow-xl shadow-primary/40 scale-[1.02]";
                  } else {
                    buttonClass += "bg-card border border-border text-foreground hover:border-primary/50 hover:bg-primary/5";
                  }
                } else if (isCorrect) {
                  buttonClass += "bg-emerald-500 text-white shadow-xl shadow-emerald-500/40 scale-[1.02]";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "bg-rose-500 text-white shadow-xl shadow-rose-500/40 scale-[1.02]";
                } else {
                  buttonClass += "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-50";
                }

                return (
                  <motion.button
                    key={idx}
                    disabled={showResult}
                    onClick={() => handleOptionSelect(opt)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: isSelected ? 1.02 : 1,
                      rotate: showResult && isSelected && !isCorrect ? [-1, 1, -1, 1, 0] : 0
                    }}
                    transition={{ 
                      delay: idx * 0.08,
                    }}
                    whileHover={!showResult ? { scale: 1.01, backgroundColor: 'var(--slate-50)' } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-4">
                      {showResult ? (
                        isCorrect ? (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-600 shrink-0 shadow-sm"
                          >
                            <Check className="w-4 h-4" strokeWidth={4} />
                          </motion.div>
                        ) : isSelected ? (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-rose-600 shrink-0 shadow-sm"
                          >
                            <X className="w-4 h-4" strokeWidth={4} />
                          </motion.div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-border rounded-full shrink-0" />
                        )
                      ) : (
                        <div className={`w-3 h-3 rounded-full transition-all ${
                          isSelected ? 'bg-white shadow-lg' : 'bg-muted-foreground/30'
                        }`} />
                      )}
                      <span className="font-bold">{opt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div 
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isSelected ? 'bg-white/20 border-white/20' : 'bg-secondary border-border'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            playPronunciation(opt, uiLang as any);
                          }}
                        >
                          <Volume2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}`} />
                        </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border">
                 <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                       {quizType === 'listening-dictation' ? t.listen_and_type : (quizType === 'typing-target' ? t.translate_to_target : t.translate_to_native)}
                    </span>
                    <button 
                      onClick={() => setIsQuizKeyboardVisible(!isQuizKeyboardVisible)}
                      className={`p-3 rounded-xl border-2 transition-all ${isQuizKeyboardVisible ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border hover:border-primary/50'}`}
                    >
                      <KeyboardIcon className="w-5 h-5" />
                    </button>
                 </div>
                 
                 <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={typedAnswer}
                      placeholder={t.type_your_answer || "Type here..."}
                      className={`w-full bg-secondary border-2 py-6 px-8 rounded-2xl text-2xl font-bold tracking-tight transition-all outline-none ${
                        isSubmitted 
                          ? typedAnswer.toLowerCase().trim() === (quizType === 'typing-target' || quizType === 'listening-dictation' ? word.word : (word.translations[uiLang] || word.translation)).toLowerCase().trim()
                            ? 'border-primary text-primary bg-primary/5 shadow-[0_0_15px_var(--primary-glow)]'
                            : 'border-rose-500 text-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                          : 'border-primary/20 text-primary focus:border-primary focus:bg-primary/5'
                      }`}
                    />
                    {isSubmitted && (
                      <div className="mt-4 flex items-center gap-3 bg-black/40 p-3 rounded border border-primary/10">
                        <span className="text-[9px] font-black text-primary/30 uppercase tracking-[0.2em]">{t.correct_result || 'EXPECTED_DATA'}:</span>
                        <span className="text-xs font-black text-primary tracking-widest uppercase">
                          {(quizType === 'typing-target' || quizType === 'listening-dictation') ? word.word : (word.translations[uiLang] || word.translation)}
                        </span>
                      </div>
                    )}
                 </div>
              </div>

              {!isSubmitted && isQuizKeyboardVisible && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <VirtualKeyboard 
                    onInput={(key) => setTypedAnswer(prev => prev + key)}
                    onDelete={() => setTypedAnswer(prev => prev.slice(0, -1))}
                    onClose={() => setIsQuizKeyboardVisible(false)}
                    language={(quizType === 'typing-target' || quizType === 'listening-dictation') ? (targetLang as any) : (uiLang as any)}
                  />
                </div>
              )}
            </div>
          )}
          
          {(selectedOption || typedAnswer) && !isSubmitted && (
            <div className="flex gap-4 mt-6">
              <Tooltip content={t.tooltip_skip || "Skip this word"}>
                <button
                  onClick={() => handleNext(0)}
                  className="flex-1 py-5 bg-black/40 border-2 border-primary/20 text-primary/60 font-black text-xs uppercase tracking-[0.2em] rounded hover:bg-primary/5 hover:border-primary/40 transition-all active:scale-95"
                >
                  {t.skip}
                </button>
              </Tooltip>
              <Tooltip content={t.tooltip_show_answer || "Check Answer"}>
                <button
                  onClick={() => handleSubmit()}
                  className="flex-[2] py-5 bg-primary text-black font-black text-xs uppercase tracking-[0.3em] rounded border-2 border-primary shadow-[0_0_20px_var(--primary-glow)] hover:scale-[1.02] transition-all active:scale-95"
                >
                  {t.check_answer}
                </button>
              </Tooltip>
            </div>
          )}

          {!selectedOption && !typedAnswer && !isSubmitted && (
            <Tooltip content={t.tooltip_skip || "Skip this word"}>
              <button
                onClick={() => handleNext(0)}
                className="w-full mt-6 py-5 bg-black/40 border-2 border-primary/20 text-primary/60 font-black text-xs uppercase tracking-[0.2em] rounded hover:border-primary/40 transition-all"
              >
                {t.skip}
              </button>
            </Tooltip>
          )}

          {isSubmitted && (
            <div className="flex flex-col gap-6">
              {selectedOption !== (word.translations[uiLang] || word.translation) && (
                <div className="p-8 bg-black/40 rounded border-2 border-rose-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)] relative overflow-hidden font-terminal">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded border-2 border-rose-500/40 bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                      <Dog className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-3">
                        {t.learning_insight || 'FAULT_RECON_DATA'}
                      </h4>
                      {isFetchingExplanation ? (
                        <div className="flex items-center gap-4 text-xs font-black text-primary/40 uppercase tracking-widest animate-pulse">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          {t.analyzing_answer || 'RECON_IN_PROGRESS...'}
                        </div>
                      ) : !isPremium ? (
                        <div className="space-y-4">
                          <p className="text-xs text-primary/30 italic uppercase tracking-widest leading-relaxed">
                            {t.ai_error_analysis_premium || 'AI_RECON_ENCRYPTION_ACTIVE. PREMIUM_OVR_REQUIRED.'}
                          </p>
                          <button onClick={buyPremium} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline bg-primary/10 px-4 py-2 rounded">
                            {t.upgrade_now}
                          </button>
                          <div className="pt-4 border-t border-primary/5">
                            <AdBanner position="inline" />
                          </div>
                        </div>
                      ) : quizExplanation ? (
                        <div className="space-y-6">
                          <p className="text-sm text-primary/80 leading-relaxed font-black uppercase tracking-widest">
                            {quizExplanation.explanation}
                          </p>

                          {quizExplanation.pronunciationTips && (
                            <div className="mt-4 pt-6 border-t border-primary/10">
                              <h5 className="text-[9px] font-black text-primary/60 uppercase tracking-[0.3em] mb-4">
                                {t.pronunciation_feedback || 'PRONUNCIATION_PATCH'}
                              </h5>
                              <div className="bg-primary/5 p-4 rounded border border-primary/10 flex items-start gap-3">
                                <Volume2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-xs text-primary/70 leading-relaxed font-medium uppercase tracking-wider">
                                  {quizExplanation.pronunciationTips}
                                </p>
                              </div>
                            </div>
                          )}

                          {quizExplanation.commonMistakes && quizExplanation.commonMistakes.length > 0 && (
                            <div className="mt-4 pt-6 border-t border-primary/10">
                              <h5 className="text-[9px] font-black text-rose-500/60 uppercase tracking-[0.3em] mb-4">
                                {t.common_mistakes || 'COMMON_FAULT_PATTERNS'}
                              </h5>
                              <ul className="space-y-2">
                                {quizExplanation.commonMistakes.map((mistake, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-rose-500/80 font-medium uppercase tracking-wide">
                                    <span className="text-rose-500 shrink-0">⚠</span>
                                    {mistake}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {quizExplanation.alternatives && quizExplanation.alternatives.length > 0 && (
                            <div className="mt-4 pt-6 border-t border-rose-500/20">
                              <h5 className="text-[9px] font-black text-rose-500/60 uppercase tracking-[0.3em] mb-4">
                                {t.alternative_phrases || 'VALID_SUB_SYNTAX'}
                              </h5>
                              <div className="space-y-3">
                                {quizExplanation.alternatives.map((alt, i) => (
                                  <div key={i} className="flex flex-col bg-rose-500/5 p-4 rounded border border-rose-500/10">
                                    <span className="text-xs font-black text-rose-500/80 uppercase tracking-widest">{alt.phrase}</span>
                                    <span className="text-[9px] text-rose-500/40 italic font-medium uppercase mt-1 tracking-wider">{alt.translation}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-primary/20 italic font-black uppercase tracking-widest">
                          {t.no_explanation || 'NO_ADDITIONAL_INTEL'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Tooltip content={t.tooltip_continue || "Continue to the next word"}>
                <button
                  onClick={() => {
                    const correctAnswer = word.translations[uiLang] || word.translation;
                    handleNext(selectedOption === correctAnswer ? 4 : 0);
                  }}
                  className="w-full py-5 bg-primary text-black font-black text-xs uppercase tracking-[0.3em] rounded border-2 border-primary shadow-[0_0_20px_var(--primary-glow)] transition-all hover:scale-[1.02]"
                >
                  {t.continue}
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4 mt-12 w-full max-w-[360px] justify-center font-terminal">
          {!isFlipped ? (
            <Tooltip content={t.tooltip_show_answer || "Show translation and details"}>
              <button
                onClick={() => {
                  audioService.play(SoundEffect.CARD_FLIP);
                  setIsFlipped(true);
                }}
                className="w-full py-5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.3em] rounded border-2 border-primary shadow-[0_0_20px_var(--primary-glow)] hover:scale-[1.02] transition-all active:scale-95"
              >
                {t.show_answer || 'DECRYPT_DATA'}
              </button>
            </Tooltip>
          ) : (
            <div className="grid grid-cols-3 gap-3 w-full">
              <Tooltip content={t.tooltip_again || "I completely forgot this word"}>
                <button
                  onClick={() => handleNext(0)}
                  className="w-full py-3 px-4 border-2 border-rose-500/40 text-rose-500 font-black text-[9px] hover:bg-rose-500/10 transition-all uppercase flex flex-col items-center gap-1 shadow-lg"
                >
                  <span>{t.again}</span>
                  <span className="opacity-40 text-[8px] tracking-widest">{t.today}</span>
                </button>
              </Tooltip>
              
              <Tooltip content={t.tooltip_hard || "I barely remembered it"}>
                <button
                  onClick={() => handleNext(3)}
                  className="w-full py-3 px-4 border-2 border-orange-500/40 text-orange-500 font-black text-[9px] hover:bg-orange-500/10 transition-all uppercase flex flex-col items-center gap-1 shadow-lg"
                >
                  <span>{t.hard}</span>
                  <span className="opacity-40 text-[8px] tracking-widest">{calculateNextInterval(word.id.toString(), targetLang, 3)}{t.days_short}</span>
                </button>
              </Tooltip>

              <Tooltip content={t.tooltip_good || "I remembered it with some effort"}>
                <button
                  onClick={() => handleNext(4)}
                  className="w-full py-3 px-4 border-2 border-primary/40 text-primary font-black text-[9px] hover:bg-primary/10 transition-all uppercase flex flex-col items-center gap-1 shadow-lg"
                >
                  <span>{t.good}</span>
                  <span className="opacity-40 text-[8px] tracking-widest">{calculateNextInterval(word.id.toString(), targetLang, 4)}{t.days_short}</span>
                </button>
              </Tooltip>

              <Tooltip content={t.tooltip_easy || "I know this word perfectly"}>
                <button
                  onClick={() => handleNext(5)}
                  className="w-full py-4 px-4 bg-primary text-primary-foreground font-black text-[10px] hover:opacity-90 transition-all uppercase flex flex-col items-center col-span-3 mt-2 border-2 border-primary shadow-[0_0_15px_var(--primary-glow)]"
                >
                  <span className="text-xs tracking-[0.2em]">{t.easy}</span>
                  <span className="font-black opacity-80 text-[8px] tracking-[0.3em]">{calculateNextInterval(word.id.toString(), targetLang, 5)}{t.days_short}</span>
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      )}
      
      <AdBanner position="inline" />

      <AnimatePresence>
        {isAddingWord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card w-full max-w-lg border-4 border-primary p-8 shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] font-terminal relative overflow-hidden"
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] z-10 size-[100%] bg-[length:100%_2px,3px_100%]" />

              <div className="flex justify-between items-center mb-8 border-b-2 border-primary/20 pb-4">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tighter flex items-center gap-3">
                  <Plus className="w-6 h-6" />
                  {t.add_new_word || 'Add New Word'}
                </h2>
                <button 
                  onClick={() => setIsAddingWord(false)}
                  className="p-2 hover:bg-rose-500/20 text-rose-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddWordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary/60 uppercase tracking-widest">{t.word_label || 'Word'}</label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => {
                      setNewWord(e.target.value);
                      if (formErrors.word) setFormErrors(prev => ({ ...prev, word: undefined }));
                    }}
                    placeholder={t.word_placeholder || 'Enter word...'}
                    className={`w-full bg-black/40 border-2 p-4 outline-none focus:border-primary transition-all text-primary font-bold ${formErrors.word ? 'border-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.2)]' : 'border-primary/20'}`}
                  />
                  {formErrors.word && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-wider mt-1">{formErrors.word}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary/60 uppercase tracking-widest">{t.translation_label || 'Translation'}</label>
                  <input
                    type="text"
                    value={newTranslation}
                    onChange={(e) => {
                      setNewTranslation(e.target.value);
                      if (formErrors.translation) setFormErrors(prev => ({ ...prev, translation: undefined }));
                    }}
                    placeholder={t.translation_placeholder || 'Enter translation...'}
                    className={`w-full bg-black/40 border-2 p-4 outline-none focus:border-primary transition-all text-primary font-bold ${formErrors.translation ? 'border-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.2)]' : 'border-primary/20'}`}
                  />
                  {formErrors.translation && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-wider mt-1">{formErrors.translation}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary/60 uppercase tracking-widest">{t.pronunciation_label || 'Pronunciation'}</label>
                  <input
                    type="text"
                    value={newTranscription}
                    onChange={(e) => setNewTranscription(e.target.value)}
                    placeholder={t.pronunciation_placeholder || 'Optional transcription...'}
                    className="w-full bg-black/40 border-2 border-primary/20 p-4 outline-none focus:border-primary transition-all text-primary font-bold"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingWord(false)}
                    className="flex-1 py-4 border-2 border-primary/20 text-primary/60 font-black uppercase tracking-[0.2em] text-xs hover:bg-primary/5 transition-all"
                  >
                    {t.cancel || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_20px_var(--primary-glow)] transition-all active:scale-95"
                  >
                    {t.add_word_confirm || 'INITIALIZE'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
