import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Volume2, Star, Zap, Newspaper, X, Filter, ArrowUpDown, ChevronRight, Sparkles, Lock, Keyboard as KeyboardIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { WORDS_BY_LANG, LANGUAGES, Word, COURSES_BY_LANG } from '../data/gameData';
import { UI_TRANSLATIONS, COURSE_TRANSLATIONS } from '../data/translations';
import { playPronunciation } from '../utils/audio';
import { fetchContextualExamples, ContextualExample, fetchDeepDive, DeepDiveResponse } from '../services/geminiService';
import { handleAppError } from '../lib/errors';
import Tooltip from '../components/Tooltip';
import SEO from '../components/SEO';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

export default function VocabularyBank() {
  const { targetLang, uiLang, isPremium, flashcardProgress, savedExamples, saveExample, addNotification, mistakes, customWords, addCustomWord } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered' | 'unseen' | 'mistakes'>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'mastery'>('alphabetical');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [examples, setExamples] = useState<ContextualExample[]>([]);
  const [isFetchingExamples, setIsFetchingExamples] = useState(false);
  const [deepDive, setDeepDive] = useState<DeepDiveResponse | null>(null);
  const [isFetchingDeepDive, setIsFetchingDeepDive] = useState(false);
  const [activeTab, setActiveTab] = useState<'examples' | 'analysis'>('examples');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newTranscription, setNewTranscription] = useState('');

  const allWords = useMemo(() => {
    const langWords = WORDS_BY_LANG[targetLang] || [];
    const customLangWords = customWords[targetLang] || [];
    return [...langWords, ...customLangWords];
  }, [targetLang, customWords]);

  const filteredWords = useMemo(() => {
    return allWords.filter((w, index) => {
      const matchesSearch = w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (w.translations[uiLang] || w.translation).toLowerCase().includes(searchQuery.toLowerCase());
      
      const key = `${targetLang}_${w.id}`;
      const progress = flashcardProgress[key];
      const isMistake = !!mistakes[`${targetLang}_${w.id}`];
      
      // Course/Topic filter
      let matchesCourse = true;
      if (selectedCourseId !== 'all') {
        const langWords = WORDS_BY_LANG[targetLang] || [];
        const isOfficial = index < langWords.length;
        if (isOfficial) {
          const start = (selectedCourseId - 1) * 5;
          const end = start + 10;
          matchesCourse = index >= start && index < end;
        } else {
          matchesCourse = false;
        }
      }

      if (!matchesCourse) return false;

      if (filter === 'learning') return matchesSearch && progress && !progress.mastered;
      if (filter === 'mastered') return matchesSearch && progress?.mastered;
      if (filter === 'unseen') return matchesSearch && !progress;
      if (filter === 'mistakes') return matchesSearch && isMistake;
      return matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'alphabetical') return a.word.localeCompare(b.word);
      
      const progressA = flashcardProgress[`${targetLang}_${a.id}`];
      const progressB = flashcardProgress[`${targetLang}_${b.id}`];
      const masteryA = progressA?.mastered ? 100 : (progressA?.correctStreak || 0) * 15;
      const masteryB = progressB?.mastered ? 100 : (progressB?.correctStreak || 0) * 15;
      return masteryB - masteryA;
    });
  }, [allWords, searchQuery, filter, sortBy, targetLang, uiLang, flashcardProgress]);

  const handleWordSelect = async (word: Word) => {
    setSelectedWord(word);
    setExamples([]);
    setDeepDive(null);
    setActiveTab('examples');
    
    if (isPremium) {
      setIsFetchingExamples(true);
      try {
        const res = await fetchContextualExamples(word.word, targetLang, uiLang);
        setExamples(res);
      } catch (err) {
        handleAppError(err, addNotification);
      } finally {
        setIsFetchingExamples(false);
      }
    }
  };

  const handleFetchDeepDive = async () => {
    if (!selectedWord || !isPremium) return;
    setIsFetchingDeepDive(true);
    try {
      const res = await fetchDeepDive(selectedWord.word, targetLang, uiLang);
      setDeepDive(res);
    } catch (err) {
      handleAppError(err, addNotification);
    } finally {
      setIsFetchingDeepDive(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* SEO */}
      <SEO title={`${t.vocabulary_bank} - Fennec`} description={t.vocabulary_bank_desc} />
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            {t.vocabulary_bank}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t.vocabulary_bank_desc}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Sparkles className="w-5 h-5" />
          {t.add_new_word}
        </button>
      </div>

      {/* Topics / Courses Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.topics || 'Browse by Topic'}</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setSelectedCourseId('all')}
            className={`px-6 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all border-2 ${
              selectedCourseId === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                : 'bg-card text-slate-500 border-border hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            {t.filter_all}
          </button>
          {(COURSES_BY_LANG[targetLang] || []).map(course => {
            const translation = COURSE_TRANSLATIONS[uiLang]?.[course.id] || COURSE_TRANSLATIONS['en']?.[course.id];
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`px-6 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all border-2 flex items-center gap-3 ${
                  selectedCourseId === course.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                    : 'bg-card text-slate-500 border-border hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${course.color || 'bg-indigo-500'}`} />
                {translation?.title || course.title.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Word List */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-card p-8 rounded-3xl border border-border shadow-xl">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={t.search_placeholder || 'Search words...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
              <button
                onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                  isKeyboardOpen 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Toggle Keyboard"
              >
                <KeyboardIcon className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {isKeyboardOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <VirtualKeyboard
                    language={targetLang}
                    onInput={(char) => setSearchQuery(prev => prev + char)}
                    onDelete={() => setSearchQuery(prev => prev.slice(0, -1))}
                    onEnter={() => setIsKeyboardOpen(false)}
                    onClose={() => setIsKeyboardOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2 mb-6">
              {(['all', 'learning', 'mastered', 'unseen', 'mistakes'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === f 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-muted text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {t[`filter_${f}`] || f}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {filteredWords.length} {t.words}
              </span>
              <button 
                onClick={() => setSortBy(sortBy === 'alphabetical' ? 'mastery' : 'alphabetical')}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ArrowUpDown className="w-3 h-3" />
                {sortBy === 'alphabetical' ? t.sort_alphabetical : t.sort_mastery}
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredWords.map(w => {
                const progress = flashcardProgress[`${targetLang}_${w.id}`];
                const mastery = progress?.mastered ? 100 : Math.min(90, (progress?.correctStreak || 0) * 15);
                const isSelected = selectedWord?.id === w.id;

                return (
                    <button
                      key={w.id}
                      onClick={() => handleWordSelect(w)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-background border-border hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm'
                    }`}
                  >
                    <div className="text-left" dir={targetLang === 'ar' ? 'rtl' : 'ltr'}>
                      <div className="font-bold text-sm">{w.word}</div>
                      <div className="text-[10px] opacity-70">{w.translations[uiLang] || w.translation}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {progress?.mastered && <Star className="w-3 h-3 text-amber-500 fill-current" />}
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${mastery >= 80 ? 'bg-emerald-500' : mastery >= 50 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content: Word Details */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedWord ? (
              <motion.div
                key={selectedWord.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="p-8 md:p-10 bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div dir={targetLang === 'ar' ? 'rtl' : 'ltr'}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{LANGUAGES.find(l => l.id === targetLang)?.flag}</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                          {t.vocabulary_label}
                        </span>
                      </div>
                      <h2 className="text-5xl font-display font-bold mb-2 tracking-tight">{selectedWord.word}</h2>
                      <p className="text-xl text-indigo-100 font-medium">{selectedWord.translations[uiLang] || selectedWord.translation}</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => playPronunciation(selectedWord.word, targetLang)}
                        className="p-4 bg-white/20 hover:bg-white/30 rounded-2xl transition-all group"
                      >
                        <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      </button>
                      <button 
                        className="flex items-center gap-2 px-6 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg"
                        onClick={() => addNotification(t.added_to_review, 'success')}
                      >
                        <Zap className="w-5 h-5 fill-current" />
                        {t.review_now}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setActiveTab('examples')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                      activeTab === 'examples' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {t.real_life_examples}
                    {activeTab === 'examples' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('analysis');
                      if (!deepDive) handleFetchDeepDive();
                    }}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                      activeTab === 'analysis' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {t.deep_analysis}
                    {activeTab === 'analysis' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600" />}
                  </button>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10">
                  {activeTab === 'examples' && (
                    <div className="space-y-6">
                      {!isPremium ? (
                        <div className="bg-muted/50 p-10 rounded-3xl border-2 border-dashed border-border text-center">
                          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">{t.premium_examples_title}</h3>
                          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            {t.premium_examples_desc}
                          </p>
                          <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 mx-auto">
                            <Sparkles className="w-5 h-5" />
                            {t.upgrade_to_premium || 'Upgrade to Premium'}
                          </button>
                        </div>
                      ) : isFetchingExamples ? (
                        <div className="space-y-6">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse space-y-3">
                              <div className="h-6 bg-muted rounded-xl w-full"></div>
                              <div className="h-4 bg-muted rounded-xl w-2/3"></div>
                            </div>
                          ))}
                        </div>
                      ) : examples.length > 0 ? (
                        <div className="space-y-6">
                          {examples.map((ex, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-muted/50 p-6 rounded-3xl border border-border group hover:border-indigo-500/30 transition-all"
                            >
                              <div className="flex justify-between items-start gap-4 mb-3">
                                <p className="text-lg font-medium text-foreground leading-relaxed">
                                  {ex.sentence}
                                </p>
                                <button 
                                  onClick={() => playPronunciation(ex.sentence, targetLang)}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors shrink-0"
                                >
                                  <Volume2 className="w-5 h-5" />
                                </button>
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 italic mb-4">
                                {ex.translation}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded-lg ${
                                    ex.source === 'news' ? 'bg-blue-100 text-blue-600' :
                                    ex.source === 'books' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-rose-100 text-rose-600'
                                  }`}>
                                    {ex.source === 'news' ? <Newspaper className="w-3 h-3" /> :
                                     ex.source === 'books' ? <BookOpen className="w-3 h-3" /> :
                                     <Search className="w-3 h-3" />}
                                  </div>
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {ex.sourceName}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => saveExample(selectedWord.word, ex, targetLang)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    savedExamples.some(s => s.sentence === ex.sentence)
                                      ? 'bg-amber-100 text-amber-600 border border-amber-200'
                                      : 'bg-background text-slate-400 border border-border hover:border-amber-500 hover:text-amber-500'
                                  }`}
                                >
                                  <Star className={`w-3.5 h-3.5 ${savedExamples.some(s => s.sentence === ex.sentence) ? 'fill-current' : ''}`} />
                                  {savedExamples.some(s => s.sentence === ex.sentence) ? t.saved || 'Saved' : t.save || 'Save'}
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-slate-500 italic">{t.no_examples_found || 'No real-life examples found for this word.'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div className="space-y-8">
                      {isFetchingDeepDive ? (
                        <div className="space-y-6">
                          <div className="animate-pulse h-20 bg-muted rounded-3xl"></div>
                          <div className="animate-pulse h-40 bg-muted rounded-3xl"></div>
                        </div>
                      ) : deepDive ? (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-8"
                        >
                          {deepDive.etymology && (
                            <section>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                {t.etymology}
                              </h4>
                              <div className="bg-muted/50 p-6 rounded-3xl border border-border italic text-slate-600 dark:text-slate-400">
                                "{deepDive.etymology}"
                              </div>
                            </section>
                          )}

                          <section>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-indigo-500" />
                              {t.grammar_rules}
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {deepDive.grammarRules.map((rule, i) => (
                                <li key={i} className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-sm text-indigo-700 dark:text-indigo-300 font-medium flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                                  {rule}
                                </li>
                              ))}
                            </ul>
                          </section>

                          {deepDive.mnemonics && (
                            <section>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                {t.mnemonic || 'Mnemonic Device'}
                              </h4>
                              <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300 font-medium">
                                {deepDive.mnemonics}
                              </div>
                            </section>
                          )}
                        </motion.div>
                      ) : (
                        <div className="text-center py-10">
                          <button 
                            onClick={handleFetchDeepDive}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
                          >
                            {t.start_deep_analysis || 'Start Deep Analysis'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-muted/50 rounded-[2.5rem] border-2 border-dashed border-border">
                <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center shadow-xl mb-6">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{t.select_a_word || 'Select a Word'}</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs">
                  {t.select_word_desc || 'Choose a word from the list to see real-life examples, etymology, and grammar rules.'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Add New Word Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-indigo-600 text-white">
                <div>
                  <h3 className="text-2xl font-display font-bold">{t.add_new_word}</h3>
                  <p className="text-indigo-100 text-sm opacity-80">{t.vocabulary_label}</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    {t.word_label}
                  </label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder={t.word_placeholder}
                    className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    {t.translation_label}
                  </label>
                  <input
                    type="text"
                    value={newTranslation}
                    onChange={(e) => setNewTranslation(e.target.value)}
                    placeholder={t.translation_placeholder}
                    className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    {t.pronunciation_label}
                  </label>
                  <input
                    type="text"
                    value={newTranscription}
                    onChange={(e) => setNewTranscription(e.target.value)}
                    placeholder={t.pronunciation_placeholder}
                    className="w-full px-5 py-4 bg-muted/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-muted text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={() => {
                      if (!newWord.trim()) {
                        addNotification(t.validate_empty_word, 'error');
                        return;
                      }
                      if (!newTranslation.trim()) {
                        addNotification(t.validate_empty_translation, 'error');
                        return;
                      }
                      addCustomWord(newWord, newTranslation, newTranscription);
                      addNotification(t.word_added_success, 'success');
                      setNewWord('');
                      setNewTranslation('');
                      setNewTranscription('');
                      setIsAddModalOpen(false);
                    }}
                    className="flex-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    {t.add_word_confirm}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
