import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldAlert, CheckCircle2, XCircle, ArrowRight, Zap, Database, Cpu, AlertTriangle, RefreshCw, Volume2, Award, Keyboard as KeyboardIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { WORDS_BY_LANG, Word } from '../data/gameData';
import { UI_TRANSLATIONS } from '../data/translations';
import { playPronunciation } from '../utils/audio';
import { audioService, SoundEffect } from '../services/audioService';
import SEO from '../components/SEO';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

export default function RepairTerminal() {
  const { mistakes, targetLang, uiLang, repairMistake, credits, xp } = useStore();
  const caps = credits; // Keep for minimal changes in rest of file
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const mistakeList = useMemo(() => {
    const allWords = WORDS_BY_LANG[targetLang] || [];
    return Object.values(mistakes)
      .filter(m => m.lang === targetLang)
      .map(m => {
        const word = allWords.find(w => w.id.toString() === m.wordId);
        return { ...m, wordData: word };
      })
      .filter(m => m.wordData) as (any & { wordData: Word })[];
  }, [mistakes, targetLang]);

  const currentMistake = mistakeList[currentIndex];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (status !== 'idle' || !currentMistake) return;

    const isCorrect = typedAnswer.toLowerCase().trim() === currentMistake.wordData.word.toLowerCase().trim();
    
    if (isCorrect) {
      setStatus('correct');
      audioService.play(SoundEffect.SUCCESS);
      setTimeout(() => {
        repairMistake(currentMistake.wordId, targetLang, true);
        setTypedAnswer('');
        setStatus('idle');
        setShowHint(false);
        // If it was the last one and it got deleted, currentIndex might need adjustment
        // but useMemo will update mistakeList, so we just stay at same index or 0
        if (currentIndex >= mistakeList.length - 1) {
          setCurrentIndex(0);
        }
      }, 1500);
    } else {
      setStatus('incorrect');
      audioService.play(SoundEffect.ERROR);
      setTimeout(() => {
        repairMistake(currentMistake.wordId, targetLang, false);
        setStatus('idle');
        setTypedAnswer('');
      }, 1500);
    }
  };

  if (mistakeList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SEO title={`${t.repair_terminal_title || 'Repair Terminal'} - Fennec`} description={t.repair_terminal_desc} />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900 border-2 border-emerald-500/30 p-8 rounded-[2rem] text-center shadow-2xl shadow-emerald-500/10"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-mono font-bold text-emerald-500 mb-4 uppercase tracking-tighter">{t.system_integrity || 'System Integrity'}: 100%</h1>
          <p className="text-slate-400 font-mono text-sm mb-8">
            {t.no_mistakes_desc || 'No corrupted data fragments detected in the current sector. All linguistic matrices are stable.'}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-emerald-500 text-slate-950 py-4 rounded-xl font-mono font-bold hover:bg-emerald-400 transition-colors uppercase tracking-widest"
          >
            {t.return_to_dashboard || 'Return to Dashboard'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 bg-slate-50 dark:bg-slate-950">
      <SEO title={`${t.repair_terminal || 'Repair Terminal'} - Fennec`} description={t.mistakes_bank} />
      
      <div className="max-w-4xl mx-auto">
        {/* Vault-Tec Style Header */}
        <div className="mb-8 relative">
          <div className="bg-yellow-400 p-4 flex items-center justify-between shadow-[0_4px_0_0_#ca8a04] border-2 border-slate-900">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 flex items-center justify-center border-2 border-slate-800 shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]">
                <Terminal className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  {t.nav_terminal || 'Terminal'} <span className="text-slate-700/50">//</span> {t.repair_terminal || 'Repair Terminal'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-4 h-1 bg-slate-900"></div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">System Status: Diagnostics</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-1 text-right">Vault-Tec OS v42.0</div>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-3 h-3 bg-slate-900 rounded-full animate-pulse"></div>
                <div className="text-xs font-black text-slate-900 uppercase">Sector: {targetLang.toUpperCase()}</div>
              </div>
            </div>
          </div>
          {/* Accent border below */}
          <div className="h-2 w-full flex">
            <div className="flex-1 bg-slate-900"></div>
            <div className="w-1/3 bg-yellow-400"></div>
            <div className="w-1/6 bg-slate-900"></div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/5 dark:bg-slate-900 p-4 border-2 border-slate-200 dark:border-slate-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-8 h-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Database className="w-full h-full" />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.corrupted || 'Corrupted'}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{mistakeList.length}</div>
          </div>
          
          <div className="bg-slate-900/5 dark:bg-slate-900 p-4 border-2 border-slate-200 dark:border-slate-800 relative group overflow-hidden">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.integrity || 'Integrity'}</div>
            <div className="text-2xl font-black text-emerald-500 tabular-nums">{Math.max(0, Math.round((1 - mistakeList.length / 50) * 100))}%</div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 mt-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${Math.max(0, Math.round((1 - mistakeList.length / 50) * 100))}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-900/5 dark:bg-slate-900 p-4 border-2 border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.buffer || 'Buffer'}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{currentIndex + 1}<span className="text-slate-400 text-sm mx-1">/</span>{mistakeList.length}</div>
          </div>

          <div className="bg-slate-900/5 dark:bg-slate-900 p-4 border-2 border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.bonus || 'Bonus'}</div>
            <div className="flex items-center gap-2">
               <Award className="w-4 h-4 text-amber-500" />
               <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">System Reward</span>
            </div>
          </div>
        </div>

        {/* Main Terminal Screen */}
        <div className="bg-[#0c140c] border-[3px] border-emerald-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          {/* CRT Effects */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-3xl">
            {/* Scanlines */}
            <div className="absolute inset-0"></div>
            {/* Corner Gloom */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
            {/* Screen Flicker */}
            <motion.div 
              animate={{ opacity: [0.03, 0.05, 0.03] }}
              transition={{ repeat: Infinity, duration: 0.1 }}
              className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
            />
          </div>
          
          <div className="relative z-20 flex-1 flex flex-col min-h-[400px]">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-12 gap-6">
              <div className="space-y-1 text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 text-amber-500 mb-4 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full w-fit mx-auto md:mx-0">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.corrupted_fragment || 'Corrupted Data Fragment'}</span>
                </div>
                
                <h2 className="text-4xl md:text-7xl font-mono font-bold text-emerald-400 tracking-tighter drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                  {currentMistake.wordData.translations[uiLang] || currentMistake.wordData.translation}
                </h2>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-6">
                  <div className="px-4 py-2 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-xl">
                    <div className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-1">{t.repair_status || 'Repair Status'}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <div 
                            key={i} 
                            className={`w-6 h-3 border border-emerald-500/30 ${i < currentMistake.repairCount ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-transparent'}`}
                          ></div>
                        ))}
                      </div>
                      <span className="font-mono text-sm text-emerald-500 font-bold">{currentMistake.repairCount}/3</span>
                    </div>
                  </div>
                  
                  <div className="px-4 py-2 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-xl">
                    <div className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-1">Sector ID</div>
                    <div className="font-mono text-sm text-emerald-500 font-bold">{targetLang.toUpperCase()}-{currentMistake.wordId}</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => playPronunciation(currentMistake.wordData.word, targetLang)}
                className="group p-6 bg-emerald-500 text-slate-950 rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none"
              >
                <Volume2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full mt-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500/50 font-mono text-xl animate-pulse">{'>'}</div>
                  <input
                    autoFocus
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    disabled={status !== 'idle'}
                    placeholder={t.enter_repair_sequence || "ENTER REPAIR SEQUENCE..."}
                    className="w-full bg-emerald-500/5 border-[3px] border-emerald-500/20 rounded-2xl py-8 pl-12 pr-24 text-3xl font-mono text-emerald-400 outline-none focus:border-emerald-500/50 transition-all placeholder:text-emerald-500/10 uppercase tracking-wider"
                  />
                  
                  <button
                    type="button"
                    onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                    className={`absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
                      isKeyboardOpen 
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                        : 'bg-emerald-500/5 border-2 border-emerald-500/20 text-emerald-500/50 hover:text-emerald-500 hover:border-emerald-500/40'
                    }`}
                  >
                    <KeyboardIcon className="w-6 h-6" />
                  </button>
                  
                <AnimatePresence>
                  {status !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute inset-0 rounded-2xl flex items-center justify-center font-mono font-bold text-3xl uppercase tracking-widest z-40 ${
                        status === 'correct' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.8)]' : 'bg-rose-600 text-white shadow-[0_0_30px_rgba(225,29,72,0.8)]'
                      }`}
                    >
                      {status === 'correct' ? (
                        <div className="flex items-center gap-4">
                          <CheckCircle2 className="w-10 h-10" />
                          {t.sequence_valid || 'Valid'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <XCircle className="w-10 h-10" />
                          {t.corruption_detected || 'Error'}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>

                <AnimatePresence>
                  {isKeyboardOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <VirtualKeyboard
                        language={targetLang}
                        onInput={(char) => setTypedAnswer(prev => prev + char)}
                        onDelete={() => setTypedAnswer(prev => prev.slice(0, -1))}
                        onEnter={handleSubmit}
                        onClose={() => setIsKeyboardOpen(false)}
                        variant="terminal"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={status !== 'idle' || !typedAnswer.trim()}
                    className="flex-[2] bg-emerald-500 text-slate-950 py-6 rounded-2xl font-black text-xl hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 uppercase tracking-[0.2em] shadow-[0_6px_0_0_#059669] active:translate-y-1 active:shadow-none"
                  >
                    {t.execute_repair || 'Execute Repair'}
                    <ArrowRight className="w-6 h-6" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="flex-1 bg-slate-900 border-[3px] border-emerald-500/20 text-emerald-500 py-6 rounded-2xl font-black text-base hover:bg-emerald-500/10 transition-all uppercase tracking-[0.1em] active:translate-y-1"
                  >
                    {showHint ? (t.hide_hint || 'Hide Hint') : (t.request_hint || 'Request Hint')}
                  </button>
                </div>
              </form>

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-8 p-6 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 animate-pulse"></div>
                    <div className="flex items-center gap-2 text-emerald-500/60 mb-3">
                      <Cpu className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.hint_subroutine || 'Hint Subroutine'}</span>
                    </div>
                    <p className="text-emerald-400 font-mono text-3xl tracking-widest pl-2">
                       {currentMistake.wordData.word.split('').map((char, i) => (
                         <span key={i} className="mr-2">
                           {i === 0 ? char : (char === ' ' ? ' ' : '░')}
                         </span>
                       ))}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 flex items-center justify-between">
            <button 
              onClick={() => setCurrentIndex(prev => (prev - 1 + mistakeList.length) % mistakeList.length)}
              className="group flex items-center gap-3 px-6 py-3 bg-slate-900 text-slate-400 hover:text-white border-2 border-slate-800 hover:border-slate-700 transition-all rounded-xl"
            >
              <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
              <span className="text-xs font-black uppercase tracking-widest">{t.previous || 'Previous'}</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Link Established</span>
            </div>

            <button 
              onClick={() => setCurrentIndex(prev => (prev + 1) % mistakeList.length)}
              className="group flex items-center gap-3 px-6 py-3 bg-slate-900 text-slate-400 hover:text-white border-2 border-slate-800 hover:border-slate-700 transition-all rounded-xl"
            >
              <span className="text-xs font-black uppercase tracking-widest">{t.next || 'Next'}</span>
              <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
            </button>
        </div>
      </div>
    </div>
  );
}
