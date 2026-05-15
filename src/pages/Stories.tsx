import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { STORIES, Story, StoryLine } from '../data/stories';
import { UI_TRANSLATIONS } from '../data/translations';
import { BookOpen, Play, CheckCircle2, Award, ChevronRight, ArrowLeft, Volume2, MessageSquare, Sparkles, Loader2, Lightbulb, CheckCircle, Store, Compass, Sword, ScrollText, Bot, HelpCircle, BookmarkPlus } from 'lucide-react';
import { TerminalLoader } from '../components/TerminalLoader';

const ICON_MAP: Record<string, any> = {
  Store,
  Compass,
  Sword,
  ScrollText
};
import { audioService, SoundEffect } from '../services/audioService';
import { fetchStoryScene, InteractiveStoryScene, fetchGrammarExplanation, GrammarExplanation } from '../services/geminiService';
import { handleAppError } from '../lib/errors';
import confetti from 'canvas-confetti';

const AI_STORY_STARTERS = [
  {
    id: 'custom',
    titleKey: 'story_starter_custom',
    descKey: 'story_starter_custom_desc',
    context: '', // Special case: user will provide context
    icon: 'Sparkles'
  },
  {
    id: 'trading',
    titleKey: 'story_starter_trading',
    descKey: 'story_starter_trading_desc',
    context: 'A mysterious merchant in the ruins of a city.',
    icon: 'Store'
  },
  {
    id: 'exploration',
    titleKey: 'story_starter_exploration',
    descKey: 'story_starter_exploration_desc',
    context: 'Exploring an abandoned pre-war vault.',
    icon: 'Compass'
  },
  {
    id: 'ambush',
    titleKey: 'story_starter_ambush',
    descKey: 'story_starter_ambush_desc',
    context: 'A raider ambush in the desert.',
    icon: 'Sword'
  },
  {
    id: 'diplomacy',
    titleKey: 'story_starter_diplomacy',
    descKey: 'story_starter_diplomacy_desc',
    context: 'Negotiating peace between two rival tribes.',
    icon: 'ScrollText'
  }
];

export default function Stories() {
  const { uiLang, targetLang, addXp, addCredits, addNotification, isPremium, useEnergy, equippedPerks, lessonDifficulty, special } = useStore();
  const addCaps = addCredits; // Keep for minimal impact
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isAIStory, setIsAIStory] = useState(false);
  const [aiStoryContext, setAIStoryContext] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [aiHistory, setAIHistory] = useState<{ scene: string; choice: string }[]>([]);
  const [currentAIScene, setCurrentAIScene] = useState<InteractiveStoryScene | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const [displayedLines, setDisplayedLines] = useState<(StoryLine & { visualAid?: string })[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentSequence, setCurrentSequence] = useState<StoryLine[]>([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [aiExplanation, setAiExplanation] = useState<GrammarExplanation | null>(null);
  const [isFetchingAIExplanation, setIsFetchingAIExplanation] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const stories = STORIES[targetLang] || STORIES['en'] || [];

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (uiLang === 'ru' && s.title_ru?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredStarters = AI_STORY_STARTERS.filter(s => {
    if (s.id === 'custom') return true; // Always show custom starter
    const title = t[s.titleKey] || s.titleKey;
    const desc = t[s.descKey] || s.descKey;
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           desc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSaveExample = (line: StoryLine) => {
    useStore.getState().saveExample(line.text.split(' ')[0], {
      sentence: line.text,
      translation: line.translation,
      source: 'stories',
      sourceName: activeStory ? (uiLang === 'ru' && activeStory.title_ru ? activeStory.title_ru : activeStory.title) : 'AI Story'
    }, targetLang);
    addNotification(t.example_saved || 'Example saved!', 'success');
  };

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem('lingua_story_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.targetLang === targetLang) {
          if (data.isAIStory) {
            setIsAIStory(true);
            setAIStoryContext(data.aiStoryContext);
            setAIHistory(data.aiHistory);
            setCurrentAIScene(data.currentAIScene);
            setDisplayedLines(data.displayedLines);
            setCompleted(data.completed);
          } else if (data.activeStory) {
            const story = stories.find(s => s.id === data.activeStory.id);
            if (story) {
              setActiveStory(story);
              setCurrentSequence(data.currentSequence);
              setDisplayedLines(data.displayedLines);
              setCurrentLineIndex(data.currentLineIndex);
              setShowQuestion(data.showQuestion);
              setCurrentQuestionIndex(data.currentQuestionIndex);
              setCompleted(data.completed);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load story progress", e);
      }
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (activeStory || isAIStory) {
      const data = {
        targetLang,
        isAIStory,
        aiStoryContext,
        aiHistory,
        currentAIScene,
        displayedLines,
        completed,
        activeStory: activeStory ? { id: activeStory.id } : null,
        currentSequence,
        currentLineIndex,
        showQuestion,
        currentQuestionIndex,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('lingua_story_progress', JSON.stringify(data));
    }
  }, [activeStory, isAIStory, aiHistory, currentAIScene, displayedLines, completed, currentLineIndex, showQuestion, currentQuestionIndex]);

  const clearSavedProgress = () => {
    localStorage.removeItem('lingua_story_progress');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [displayedLines, isLoadingAI]);

  const playLineAudio = (url: string) => {
    if (playingAudio === url) return;
    setPlayingAudio(url);
    const audio = new Audio(url);
    audio.onended = () => setPlayingAudio(null);
    audio.play().catch(() => setPlayingAudio(null));
  };

  const handleStartStory = (story: Story) => {
    setActiveStory(story);
    setIsAIStory(false);
    setCurrentSequence(story.lines);
    setDisplayedLines([story.lines[0]]);
    setCurrentLineIndex(0);
    setShowQuestion(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setCompleted(false);
    audioService.play(SoundEffect.CLICK);
  };

  const handleStartAIStory = async (starter: typeof AI_STORY_STARTERS[0], customCtx?: string) => {
    if (!isPremium) {
      addNotification(t.premium_only_ai_desc, 'warning');
      return;
    }
    
    if (starter.id === 'custom' && !customCtx) {
      setShowCustomInput(true);
      return;
    }

    const contextToUse = customCtx || starter.context;
    
    setIsAIStory(true);
    setAIStoryContext(contextToUse);
    setAIHistory([]);
    setDisplayedLines([]);
    setIsLoadingAI(true);
    setCompleted(false);
    setShowCustomInput(false);
    audioService.play(SoundEffect.CLICK);
    useEnergy('story');

    try {
      const scene = await fetchStoryScene(targetLang, uiLang, contextToUse, [], lessonDifficulty, special);
      if (scene) {
        setCurrentAIScene(scene);
        setDisplayedLines([{
          speaker: 'Narrator',
          text: scene.sceneText,
          translation: scene.sceneTranslation,
          visualAid: scene.visualAid
        }]);
      }
    } catch (err) {
      handleAppError(err, addNotification);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAIChoice = async (choice: { text: string; translation: string; id: string }) => {
    if (!currentAIScene) return;

    // Add user choice to history
    const newHistory = [...aiHistory, { scene: currentAIScene.sceneText, choice: choice.text }];
    setAIHistory(newHistory);

    // Add choice to displayed lines
    setDisplayedLines(prev => [...prev, {
      speaker: 'Vault Dweller',
      text: choice.text,
      translation: choice.translation
    }]);

    setIsLoadingAI(true);
    audioService.play(SoundEffect.CLICK);
    useEnergy('story');

    try {
      const nextScene = await fetchStoryScene(targetLang, uiLang, aiStoryContext, newHistory, lessonDifficulty, special);
      if (nextScene) {
        setCurrentAIScene(nextScene);
        setDisplayedLines(prev => [...prev, {
          speaker: 'Narrator',
          text: nextScene.sceneText,
          translation: nextScene.sceneTranslation,
          visualAid: nextScene.visualAid
        }]);
        
        if (nextScene.isEnding) {
          setCompleted(true);
        }
      }
    } catch (err) {
      handleAppError(err, addNotification);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleNextLine = () => {
    if (!activeStory) return;
    
    if (currentLineIndex < currentSequence.length - 1) {
      const nextLine = currentSequence[currentLineIndex + 1];
      setDisplayedLines(prev => [...prev, nextLine]);
      setCurrentLineIndex(prev => prev + 1);
      audioService.play(SoundEffect.CLICK);
    } else {
      setShowQuestion(true);
      audioService.play(SoundEffect.SUCCESS);
    }
  };

  const handleChoice = (choice: any) => {
    // Add the choice as a line from the Vault Dweller
    const choiceLine: StoryLine = {
      speaker: 'Vault Dweller',
      text: choice.text,
      translation: choice.translation
    };
    
    setDisplayedLines(prev => [...prev, choiceLine]);
    
    // Add bonuses if any
    if (choice.xpBonus) {
      const curatorBonus = equippedPerks?.includes('curator') ? 1.25 : 1;
      addXp(Math.round(choice.xpBonus * curatorBonus));
    }
    if (choice.creditsBonus) addCredits(choice.creditsBonus);
    useEnergy('story');
    
    // Switch to the next sequence
    if (choice.nextLines && choice.nextLines.length > 0) {
      setCurrentSequence(choice.nextLines);
      setCurrentLineIndex(0);
      
      // Add the first line of the next sequence immediately
      setDisplayedLines(prev => [...prev, choice.nextLines[0]]);
    } else {
      // End of story path, go to questions
      setShowQuestion(true);
    }
    
    audioService.play(SoundEffect.CLICK);
  };

  const handleAnswer = (index: number) => {
    if (!activeStory || selectedOption !== null) return;
    setSelectedOption(index);
    const currentQuestion = activeStory.questions[currentQuestionIndex];
    const correct = index === currentQuestion.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      audioService.play(SoundEffect.SUCCESS);
      
      if (currentQuestionIndex === activeStory.questions.length - 1) {
        // All questions completed
        setCompleted(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b']
        });
        const curatorBonus = equippedPerks?.includes('curator') ? 1.25 : 1;
      addXp(Math.round(activeStory.xpReward * curatorBonus));
        addCredits(activeStory.creditsReward);
        addNotification(
          (t.story_completed_reward || 'Story Completed! +{xp} XP, +{credits} {creditsLabel}')
            .replace('{xp}', activeStory.xpReward.toString())
            .replace('{credits}', activeStory.creditsReward.toString())
            .replace('{creditsLabel}', t.credits || 'Credits'),
          'success'
        );
      }
    } else {
      audioService.play(SoundEffect.ERROR);
    }
  };

  const handleRetryQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    audioService.play(SoundEffect.CLICK);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setAiExplanation(null);
    setCurrentQuestionIndex(prev => prev + 1);
    audioService.play(SoundEffect.CLICK);
  };

  const handleFetchAIExplanation = async () => {
    if (!activeStory || selectedOption === null || isFetchingAIExplanation || !isPremium) return;
    
    const currentQuestion = activeStory.questions[currentQuestionIndex];
    setIsFetchingAIExplanation(true);
    
    try {
      const explanation = await fetchGrammarExplanation(
        currentQuestion.question,
        currentQuestion.options[selectedOption],
        currentQuestion.options[currentQuestion.correctIndex],
        targetLang,
        uiLang
      );
      setAiExplanation(explanation);
    } catch (e) {
      handleAppError(e, addNotification);
    } finally {
      setIsFetchingAIExplanation(false);
    }
  };

  const handleExitStory = () => {
    setActiveStory(null);
    setIsAIStory(false);
    setCurrentAIScene(null);
    setAIHistory([]);
    setDisplayedLines([]);
    setCompleted(false);
    setShowQuestion(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setAiExplanation(null);
    audioService.play(SoundEffect.CLICK);
  };

  const handleFinishAIStory = () => {
    const xpReward = 50;
    const creditsReward = 25;
    const curatorBonus = equippedPerks?.includes('curator') ? 1.25 : 1;
    const finalXp = Math.round(xpReward * curatorBonus);
    addXp(finalXp);
    addCredits(creditsReward);
    
    const notificationText = (t.ai_story_completed || 'AI Story Completed! +{xp} XP, +{credits} Credits')
      .replace('{xp}', xpReward.toString())
      .replace('{credits}', creditsReward.toString());
      
    addNotification(notificationText, 'success');
    
    clearSavedProgress();
    handleExitStory();
    audioService.play(SoundEffect.SUCCESS);
  };

  if (activeStory || isAIStory) {
    const lastLine = displayedLines[displayedLines.length - 1];
    const hasChoices = lastLine?.choices && lastLine.choices.length > 0;

    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-20">
        <button 
          onClick={handleExitStory}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 transition-colors font-bold uppercase tracking-wider text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back_to_stories || 'Back to Stories'}
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl min-h-[400px] flex flex-col">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center flex items-center justify-center gap-2">
            {isAIStory ? (
              <>
                <Sparkles className="w-6 h-6 text-indigo-500" />
                {t.ai_stories}
              </>
            ) : (
              uiLang === 'ru' && activeStory?.title_ru ? activeStory.title_ru : activeStory?.title
            )}
          </h2>
          
          <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[500px] scroll-smooth">
            <AnimatePresence mode="popLayout">
              {displayedLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col ${i % 2 === 0 ? 'items-start' : 'items-end'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm relative group ${
                    i % 2 === 0 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none' 
                      : 'bg-indigo-600 text-white rounded-br-none'
                  }`}>
                    {line.visualAid && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 rounded-xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-700"
                      >
                        <img 
                          src={line.visualAid} 
                          alt="Story Visual" 
                          className="w-full aspect-video object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    )}
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="text-[10px] font-black opacity-50 uppercase tracking-widest">{line.speaker}</div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleSaveExample(line)}
                          className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-500 transition-colors"
                          title={t.save_example}
                        >
                          <BookmarkPlus className="w-3 h-3" />
                        </button>
                        {line.audioUrl && (
                          <button 
                            onClick={() => playLineAudio(line.audioUrl!)}
                            className={`p-1 rounded-full transition-colors ${
                              playingAudio === line.audioUrl 
                                ? 'bg-indigo-500 text-white animate-pulse' 
                                : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-500'
                            }`}
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-lg leading-relaxed font-medium">{line.text}</div>
                    <div className="text-sm opacity-70 mt-2 italic border-t border-white/10 dark:border-slate-700 pt-2">{line.translation}</div>
                  </div>
                </motion.div>
              ))}
              {isLoadingAI && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800"
                >
                  <TerminalLoader text={t.generating_story || "CRAFTING NARRATIVE"} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isAIStory ? (
            <div className="mt-8 space-y-4">
              {(currentAIScene?.languageTip || (currentAIScene?.keyVocabulary && currentAIScene.keyVocabulary.length > 0) || (currentAIScene?.grammarBreakdown && currentAIScene.grammarBreakdown.length > 0)) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {currentAIScene.languageTip && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">{t.language_tip || 'Observation'}</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">{currentAIScene.languageTip}</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentAIScene.keyVocabulary && currentAIScene.keyVocabulary.length > 0 && (
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t.vocabulary || 'Vocabulary'}</span>
                        </div>
                        <div className="space-y-3">
                          {currentAIScene.keyVocabulary.map((vocab, idx) => (
                            <div key={idx} className="group">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">{vocab.word}</span>
                                <span className="text-xs text-slate-400 italic">{vocab.translation}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">{vocab.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentAIScene.grammarBreakdown && currentAIScene.grammarBreakdown.length > 0 && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t.grammar || 'Grammar'}</span>
                        </div>
                        <div className="space-y-3">
                          {currentAIScene.grammarBreakdown.map((grammar, idx) => (
                            <div key={idx}>
                              <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">{grammar.rule}</div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{grammar.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {!completed ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentAIScene?.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleAIChoice(choice)}
                      disabled={isLoadingAI}
                      className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl text-left font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all active:scale-[0.98] disabled:opacity-50 relative group overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-indigo-600 dark:text-indigo-400 mb-1 leading-tight">{choice.text}</div>
                          <div className="text-xs opacity-50 italic">{choice.translation}</div>
                        </div>
                        {choice.statType && (
                          <div className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-0.5 border ${
                            (special?.[choice.statType as keyof typeof special] || 0) >= 7
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                          }`}>
                            <span className="opacity-60">{choice.statType}</span>
                            <span className="text-xs">{special?.[choice.statType as keyof typeof special] || 1}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-6">
                  {currentAIScene?.outcomeSummary && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-3xl text-left"
                    >
                      <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">{t.fate_revealed || 'THE FATE REVEALED'}</h4>
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                        "{currentAIScene.outcomeSummary}"
                      </p>
                    </motion.div>
                  )}
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{t.story_ending}</p>
                  <button
                    onClick={handleFinishAIStory}
                    className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    {t.finish_and_claim}
                  </button>
                </div>
              )}
            </div>
          ) : (
            !showQuestion ? (
              <div className="mt-8 flex flex-col gap-4 items-center">
                {hasChoices ? (
                  <div className="w-full grid grid-cols-1 gap-3">
                    {lastLine.choices?.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => handleChoice(choice)}
                        className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl text-left font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all active:scale-[0.98]"
                      >
                        <div className="text-indigo-600 dark:text-indigo-400 mb-1">{choice.text}</div>
                        <div className="text-xs opacity-50 italic">{choice.translation}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={handleNextLine}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
                  >
                    {currentLineIndex === currentSequence.length - 1 ? (t.check_understanding || 'Check Understanding') : (t.continue || 'Continue')}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs">
                    <CheckCircle className="w-4 h-4" />
                    {t.check_understanding || 'Check Understanding'}
                  </div>
                  <div className="text-xs font-bold text-slate-400">
                    {currentQuestionIndex + 1} / {activeStory?.questions.length}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  {activeStory?.questions[currentQuestionIndex].question}
                </h3>

                <div className="space-y-3">
                  {activeStory?.questions[currentQuestionIndex].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={selectedOption !== null}
                      className={`w-full p-5 rounded-2xl text-left font-bold transition-all border-2 relative overflow-hidden group ${
                        selectedOption === i
                          ? isCorrect 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-400'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span>{option}</span>
                        {selectedOption === i && (
                          isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5 rotate-45" />
                        )}
                      </div>
                      {selectedOption === i && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.1 }}
                          className={`absolute inset-0 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {isCorrect !== null && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-6 p-5 rounded-2xl text-sm font-medium border ${
                        isCorrect 
                          ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      <div className="font-bold uppercase tracking-wider text-[10px] mb-1 opacity-60">
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </div>
                      {activeStory?.questions[currentQuestionIndex].explanation}

                      {isCorrect === false && isPremium && (
                        <div className="mt-4 pt-4 border-t border-rose-200/30 dark:border-rose-800/30">
                          {!aiExplanation ? (
                            <button
                              onClick={handleFetchAIExplanation}
                              disabled={isFetchingAIExplanation}
                              className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold hover:opacity-80 transition-opacity text-xs uppercase tracking-widest"
                            >
                              {isFetchingAIExplanation ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Bot className="w-3 h-3" />
                              )}
                              {t.why_incorrect || 'Why is this incorrect?'}
                            </button>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-4"
                            >
                              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-widest mb-2">
                                <Bot className="w-3 h-3" />
                                {t.ai_analysis || 'Fennec Analysis'}
                              </div>
                              <p className="text-rose-900/80 dark:text-rose-100/80 leading-relaxed italic">
                                {aiExplanation.explanation}
                              </p>
                              
                              {aiExplanation.correctExamples && aiExplanation.correctExamples.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">{t.examples || 'Examples'}</div>
                                  {aiExplanation.correctExamples.map((ex, idx) => (
                                    <div key={idx} className="bg-white/40 dark:bg-black/20 p-2 rounded-lg text-xs">
                                      <div className="font-bold">"{ex.sentence}"</div>
                                      <div className="opacity-60">{ex.translation}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 flex flex-col items-center gap-4">
                  {completed ? (
                    <button
                      onClick={isAIStory ? handleFinishAIStory : handleExitStory}
                      className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                    >
                      <Award className="w-5 h-5" />
                      {t.finish_story || 'Finish Story'}
                    </button>
                  ) : isCorrect === true ? (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
                    >
                      {t.continue || 'Continue'}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : isCorrect === false ? (
                    <button
                      onClick={handleRetryQuestion}
                      className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2"
                    >
                      {t.retry || 'Retry'}
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>
              </motion.div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:scale-150" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-500 font-mono font-bold uppercase tracking-widest text-[9px] mb-1">
              <Bot className="w-3.5 h-3.5" />
              <span>STORY_DB // ARCHIVE_V2</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
              {t.stories_title || 'Linguistic Archive'}
            </h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {t.stories_subtitle || 'Interactive narratives for contextual immersion'}
            </p>
          </div>
          
          <div className="relative w-full max-w-sm group/search">
            <input 
              type="text"
              placeholder={t.search_placeholder_stories || 'Search archives...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase tracking-widest"
            />
            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-700 group-focus-within/search:text-indigo-500 transition-colors" />
          </div>
        </div>
      </div>

      {/* Custom Story Input Modal/Overlay */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.create_custom_story}</h3>
                  <p className="text-xs text-slate-500">{t.custom_story_desc || 'Write any topic and let AI craft the narrative.'}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.custom_story_prompt}</label>
                  <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={t.custom_story_placeholder}
                    className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-medium text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t.close}
                </button>
                <button 
                  onClick={() => customPrompt && handleStartAIStory(AI_STORY_STARTERS[0], customPrompt)}
                  disabled={!customPrompt || isLoadingAI}
                  className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                   {isLoadingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                   {t.generate_story}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-4 tracking-tighter uppercase">
            <BookOpen className="w-10 h-10 text-indigo-500" />
            {t.wasteland_chronicles || 'Linguistic Archive'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-[0.2em] text-[10px]">{t.stories_subtitle || 'Interactive narratives for contextual immersion'}</p>
        </div>
      </div>

      {/* AI Stories Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t.ai_stories}</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100 dark:border-indigo-800">
            <Bot className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {t.difficulty || 'Difficulty'}: {lessonDifficulty}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredStarters.map((starter) => {
            const IconComponent = ICON_MAP[starter.icon] || Sparkles;
            return (
              <motion.button
                key={starter.id}
                whileHover={{ y: -5 }}
                onClick={() => handleStartAIStory(starter)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl text-left group relative overflow-hidden h-full flex flex-col"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconComponent className="w-12 h-12 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">
                  {t[starter.titleKey as keyof typeof t] || starter.titleKey}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
                  {t[starter.descKey as keyof typeof t] || starter.descKey}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <Play className="w-3 h-3 fill-current" />
                    {t.start_ai_story}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">50 XP</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">25 Caps</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Classic Stories Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t.classic_stories || 'Classic Stories'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t.level || 'Level'} {story.level}
                  </span>
                  {story.category && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      story.category === 'Survival' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' :
                      story.category === 'Social' ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400' :
                      story.category === 'Technical' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' :
                      'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
                    }`}>
                      {story.category}
                    </span>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">
                {uiLang === 'ru' && story.title_ru ? story.title_ru : story.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                {uiLang === 'ru' && story.description_ru ? story.description_ru : story.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Award className="w-3 h-3" />
                    {story.xpReward} XP
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="w-3 h-3" />
                    {story.creditsReward} {t.credits || 'Credits'}
                  </div>
                </div>
                <button
                  onClick={() => handleStartStory(story)}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

