import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RotateCw, Trash2, Star, Zap, Clock } from 'lucide-react';
import { Flashcard } from './Flashcard';
import { useStore } from '../store/useStore';
import { Word } from '../data/gameData';
import { UI_TRANSLATIONS } from '../data/translations';
import { audioService, SoundEffect } from '../services/audioService';

interface SRSFlashcardProps {
  word: Word;
  onComplete?: (quality: number) => void;
  className?: string;
}

export const SRSFlashcard: React.FC<SRSFlashcardProps> = ({
  word,
  onComplete,
  className = ""
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const targetLang = useStore(state => state.targetLang);
  const uiLang = useStore(state => state.uiLang);
  const updateFlashcardProgress = useStore(state => state.updateFlashcardProgress);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  // Reset state when word changes
  useEffect(() => {
    setIsFlipped(false);
    setIsCorrect(false);
    setIsIncorrect(false);
  }, [word]);

  const handleGrade = (quality: number) => {
    if (quality >= 3) {
      setIsCorrect(true);
      audioService.play(SoundEffect.SUCCESS);
    } else {
      setIsIncorrect(true);
      audioService.play(SoundEffect.ERROR);
    }

    setTimeout(() => {
      updateFlashcardProgress(word.id.toString(), targetLang, quality);
      if (onComplete) onComplete(quality);
    }, 600);
  };

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <Flashcard
        word={word.word}
        translation={word.translations[uiLang] || word.translation}
        transcription={word.transcription}
        lang={targetLang}
        uiLang={uiLang}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
        isCorrect={isCorrect}
        isIncorrect={isIncorrect}
      />

      <AnimatePresence>
        {isFlipped && !isCorrect && !isIncorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-[400px] grid grid-cols-2 gap-4"
          >
            <button
              onClick={() => handleGrade(1)}
              className="flex flex-col items-center justify-center p-5 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-2xl hover:bg-rose-100 transition-all group shadow-sm active:scale-95"
            >
              <Trash2 className="w-6 h-6 text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-none">{t.again || 'Again'}</span>
            </button>
            <button
              onClick={() => handleGrade(3)}
              className="flex flex-col items-center justify-center p-5 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl hover:bg-amber-100 transition-all group shadow-sm active:scale-95"
            >
              <Clock className="w-6 h-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-none">{t.hard || 'Hard'}</span>
            </button>
            <button
              onClick={() => handleGrade(4)}
              className="flex flex-col items-center justify-center p-5 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl hover:bg-indigo-100 transition-all group shadow-sm active:scale-95"
            >
              <Check className="w-6 h-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">{t.good || 'Good'}</span>
            </button>
            <button
              onClick={() => handleGrade(5)}
              className="flex flex-col items-center justify-center p-5 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl hover:bg-emerald-100 transition-all group shadow-sm active:scale-95"
            >
              <Zap className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">{t.easy || 'Easy'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFlipped && (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic animate-pulse">
          Click the card to reveal translation and grade your memory
        </p>
      )}
    </div>
  );
};
