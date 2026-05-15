import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Volume2, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import { WORDS_BY_LANG } from '../data/gameData';

export default function CardOfTheDay() {
  const uiLang = useStore(state => state.uiLang);
  const targetLang = useStore(state => state.targetLang);
  const [isOpen, setIsOpen] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  useEffect(() => {
    // Select a random card based on the current date
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Filter words by target language if not 'all'
    let availableWords: any[] = [];
    if (targetLang === 'all') {
      availableWords = Object.values(WORDS_BY_LANG).flat();
    } else {
      availableWords = WORDS_BY_LANG[targetLang] || [];
    }

    if (availableWords.length > 0) {
      const index = seed % availableWords.length;
      setCard(availableWords[index]);
    }

    // Check if user has seen it today
    const lastSeen = localStorage.getItem('cardOfTheDayLastSeen');
    if (lastSeen !== today) {
      setIsOpen(true);
      localStorage.setItem('cardOfTheDayLastSeen', today);
    }
  }, [targetLang]);

  const speakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!card) return;
    
    const utterance = new SpeechSynthesisUtterance(card.word);
    
    // Try to set appropriate language
    if (targetLang === 'es') utterance.lang = 'es-ES';
    else if (targetLang === 'fr') utterance.lang = 'fr-FR';
    else if (targetLang === 'de') utterance.lang = 'de-DE';
    else if (targetLang === 'it') utterance.lang = 'it-IT';
    else if (targetLang === 'ja') utterance.lang = 'ja-JP';
    else if (targetLang === 'zh') utterance.lang = 'zh-CN';
    else if (targetLang === 'ru') utterance.lang = 'ru-RU';
    else if (targetLang === 'sr') utterance.lang = 'sr-RS';
    else utterance.lang = 'en-US';

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen || !card) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-80"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900/30 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-5 h-5 text-amber-300" />
              {t.card_of_the_day || 'Card of the Day'}
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 perspective-1000">
            <motion.div
              className="relative w-full h-40 cursor-pointer preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front */}
              <motion.div 
                className="absolute inset-0 bg-slate-50 dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center p-4 shadow-inner"
                animate={{ opacity: isFlipped ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white text-center">
                  {card.word}
                </h3>
                {card.transcription && (
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-mono text-sm">
                    {card.transcription}
                  </p>
                )}
                
                <button 
                  onClick={speakWord}
                  className="absolute bottom-3 right-3 p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                
                <div className="absolute top-3 right-3 text-slate-400">
                  <RefreshCw className="w-4 h-4 opacity-50" />
                </div>
              </motion.div>

              {/* Back */}
              <motion.div 
                className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center p-4 shadow-inner"
                animate={{ opacity: isFlipped ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ 
                  transform: 'rotateY(180deg)'
                }}
              >
                <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 text-center">
                  {card.translations?.[uiLang] || card.translation}
                </h3>
                <p className="text-indigo-500/70 dark:text-indigo-400/70 mt-4 text-sm font-medium uppercase tracking-widest">
                  {t.translation || 'Translation'}
                </p>
              </motion.div>
            </motion.div>
            
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
              {t.tap_to_flip || 'Tap to flip'}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
