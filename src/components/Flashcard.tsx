import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Mic, MicOff, Check, X, RotateCw, Lightbulb, Zap } from 'lucide-react';
import { audioService, SoundEffect } from '../services/audioService';
import { playPronunciation } from '../utils/audio';
import Tooltip from './Tooltip';

export interface FlashcardProps {
  word: string;
  translation: string;
  transcription?: string;
  lang: string;
  uiLang: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  visualAid?: string | null;
  pronunciationFeedback?: {
    isCorrect: boolean;
    feedback: string;
    phoneticSpelling?: string;
  } | null;
  isListening?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
  isSpeechSupported?: boolean;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  backHeader?: React.ReactNode;
  backFooter?: React.ReactNode;
  dir?: 'ltr' | 'rtl';
}

export const Flashcard: React.FC<FlashcardProps> = ({
  word,
  translation,
  transcription,
  lang,
  uiLang,
  isFlipped = false,
  onFlip,
  isCorrect = false,
  isIncorrect = false,
  visualAid,
  pronunciationFeedback,
  isListening = false,
  onStartListening,
  onStopListening,
  isSpeechSupported = false,
  className = "",
  header,
  footer,
  backHeader,
  backFooter,
  dir = 'ltr'
}) => {
  const handleFlip = () => {
    if (onFlip) {
      onFlip();
    }
    audioService.play(SoundEffect.CARD_FLIP);
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPronunciation(word, lang);
  };

  return (
    <div 
      className={`relative w-full max-w-[340px] aspect-[2.5/3.5] perspective-1000 ${className}`}
      onClick={handleFlip}
    >
      <motion.div
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          scale: isCorrect ? [1, 1.05, 1] : 1,
          x: isIncorrect ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ 
          rotateY: { type: "spring", stiffness: 260, damping: 20 },
          scale: { duration: 0.3 },
          x: { duration: 0.4, ease: "easeInOut" }
        }}
        style={{ transformStyle: "preserve-3d" }}
        className={`absolute inset-0 w-full h-full cursor-pointer rounded border-4 bg-black/90 transition-all duration-500 shadow-xl font-terminal ${
          isCorrect ? 'border-primary shadow-[0_0_20px_rgba(24,255,98,0.3)]' : 
          isIncorrect ? 'border-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 
          'border-primary/20 hover:border-primary/40'
        }`}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 w-full h-full flex flex-col rounded-sm overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {header ? header : (
            <div className="bg-primary/5 px-6 py-4 flex justify-between items-center border-b border-primary/20">
              <span className="font-black text-primary/40 text-[10px] tracking-[0.3em] uppercase">
                {lang?.toUpperCase()} DATA_STREAM
              </span>
              <RotateCw className="w-4 h-4 text-primary/60 animate-spin-slow" />
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6" dir={dir}>
            <div className="absolute top-4 left-4 text-[8px] text-primary/20 font-black uppercase tracking-widest">
              Ref_ID: {Math.floor(Math.random() * 9999)}
            </div>
            <h2 className="text-4xl font-black text-primary drop-shadow-[0_0_10px_var(--primary-glow)] leading-tight uppercase tracking-widest">
              {word}
            </h2>
            {transcription && (
              <p className="text-xs text-primary/60 font-black bg-primary/5 px-4 py-1.5 rounded border border-primary/10 uppercase tracking-widest">
                {transcription}
              </p>
            )}

            <div className="flex items-center gap-4 mt-4">
              <button 
                onClick={playAudio}
                className="p-4 bg-primary/10 text-primary border-2 border-primary/20 rounded hover:bg-primary hover:text-black transition-all shadow-[0_0_15px_rgba(24,255,98,0.1)] active:scale-95"
              >
                <Volume2 className="w-6 h-6" />
              </button>

              {isSpeechSupported && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    isListening ? onStopListening?.() : onStartListening?.();
                  }}
                  className={`p-4 rounded border-2 transition-all shadow-sm ${
                    isListening 
                      ? 'bg-rose-500 border-rose-500 text-white animate-pulse' 
                      : 'bg-black border-primary/20 text-primary/60 hover:border-primary hover:text-primary'
                  }`}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              )}
            </div>

            {pronunciationFeedback && (
              <div className={`mt-4 w-full p-4 rounded border-2 text-left text-[10px] font-black uppercase tracking-widest ${
                pronunciationFeedback.isCorrect ? 'bg-primary/20 border-primary text-primary' : 'bg-rose-500/20 border-rose-500 text-rose-500'
              }`}>
                <p className="mb-2 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${pronunciationFeedback.isCorrect ? 'bg-primary' : 'bg-rose-500'}`} />
                  {pronunciationFeedback.isCorrect ? 'VALID_AUDIO' : 'CORRECTION_REQUIRED:'}
                </p>
                <p className="opacity-80 leading-relaxed">{pronunciationFeedback.feedback}</p>
              </div>
            )}
          </div>

          <div className="p-4 text-center text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 border-t border-primary/10">
            {footer || 'PRESS_TO_DECRYPT'}
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full flex flex-col rounded-sm overflow-hidden bg-black shadow-[inset_0_0_40px_rgba(24,255,98,0.05)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {backHeader ? backHeader : (
            <div className="bg-primary px-6 py-4 flex justify-between items-center text-black border-b border-primary shadow-[0_0_20px_rgba(24,255,98,0.3)]">
              <span className="text-[10px] font-black uppercase tracking-widest">DECRYPTED_OUTPUT</span>
              <RotateCw className="w-4 h-4 animate-spin-slow" />
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[linear-gradient(rgba(24,255,98,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(24,255,98,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" dir={dir}>
            <div className="space-y-2">
              <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.3em] border-b border-primary/10 pb-1">
                EN_MATRIX: {word}
              </p>
              <h2 className="text-3xl font-black text-primary drop-shadow-[0_0_8px_var(--primary-glow)] leading-tight uppercase tracking-widest">
                {translation}
              </h2>
              {transcription && (
                <p className="text-[10px] text-primary/60 font-black bg-primary/5 px-3 py-1 rounded border border-primary/10 uppercase tracking-widest inline-block">
                  {transcription}
                </p>
              )}
            </div>

            {visualAid && (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={visualAid}
                alt={word}
                referrerPolicy="no-referrer"
                className="w-32 h-32 object-cover rounded border-2 border-primary/20 shadow-lg grayscale brightness-50 hover:brightness-100 transition-all duration-700 mt-4"
              />
            )}
            
            <button 
              onClick={playAudio}
              className="mt-6 flex items-center gap-3 px-6 py-3 bg-primary/10 text-primary border-2 border-primary/20 rounded text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(24,255,98,0.1)] hover:bg-primary hover:text-black transition-all"
            >
              <Volume2 className="w-4 h-4" />
              PLAYBACK_REPLAY
            </button>
          </div>

          <div className="p-4 text-center text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 border-t border-primary/10">
            {backFooter || 'RETURN_TO_FRONT'}
          </div>
        </div>
      </motion.div>

      {/* Result Icons Overlay */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-4 -right-4 z-50 bg-primary text-black p-3 rounded shadow-[0_0_20px_rgba(24,255,98,0.6)] border-2 border-primary"
          >
            <Check className="w-6 h-6 stroke-[4px]" />
          </motion.div>
        )}
        {isIncorrect && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-4 -right-4 z-50 bg-rose-500 text-white p-3 rounded shadow-[0_0_20px_rgba(239,68,68,0.6)] border-2 border-rose-500"
          >
            <X className="w-6 h-6 stroke-[4px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
