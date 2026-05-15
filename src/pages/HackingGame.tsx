import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { WORDS_BY_LANG } from '../data/gameData';
import { UI_TRANSLATIONS } from '../data/translations';
import { ArrowLeft, Terminal, ShieldAlert, ShieldCheck, Zap, Timer, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { audioService, SoundEffect } from '../services/audioService';

export default function HackingGame() {
  const { targetLang, uiLang, addXp, addCredits, updateSpecial, isPremium, equippedPerks, chatMetrics } = useStore();
  const addCaps = addCredits; // Keep for minimal changes in rest of file
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const navigate = useNavigate();

  // Performance metrics for difficulty adjustment
  const accuracy = chatMetrics.totalMessages > 0 
    ? Math.max(0, 1 - (chatMetrics.feedbackCount / chatMetrics.totalMessages))
    : 0.7; // Default bit higher than mid
  const speedSeconds = chatMetrics.totalMessages > 0
    ? (chatMetrics.totalResponseTime / chatMetrics.totalMessages) / 1000
    : 8;

  const isProLearner = accuracy > 0.85 && speedSeconds < 12;

  const hasArcher = equippedPerks.includes('archer');
  const hasExpertHacker = equippedPerks.includes('expert_hacker');
  
  // Intelligence Synergy: Tier 1 (+2 attempts), Tier 2 (+5 attempts)
  const iBonus = useStore.getState().hasSynergy('I', 2) ? 5 : useStore.getState().hasSynergy('I', 1) ? 2 : 0;
  const maxAttempts = 4 + (hasArcher ? 1 : 0) + (hasExpertHacker ? 1 : 0) + iBonus;

  const [words, setWords] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(maxAttempts);
  const [history, setHistory] = useState<{ word: string; likeness: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initGame = () => {
    setIsLoading(true);
    const allWords = WORDS_BY_LANG[targetLang] || WORDS_BY_LANG['sr'];
    
    // Group words by length
    const wordsByLength: Record<number, string[]> = {};
    allWords.forEach(w => {
      const len = w.word.length;
      if (len >= 4 && len <= 10) { // Increased max length potential
        if (!wordsByLength[len]) wordsByLength[len] = [];
        wordsByLength[len].push(w.word.toUpperCase());
      }
    });

    // Pick a length that has at least 10 words
    const validLengths = Object.keys(wordsByLength).map(Number).filter(len => wordsByLength[len].length >= 10);
    
    // Higher performance = biased towards longer words
    let selectedLength;
    if (isProLearner) {
      selectedLength = Math.max(...validLengths);
    } else if (accuracy < 0.5) {
      selectedLength = Math.min(...validLengths);
    } else {
      selectedLength = validLengths[Math.floor(Math.random() * validLengths.length)] || 5;
    }
    
    // More candidates for higher accuracy
    const candidateCount = isProLearner ? 16 : 12;
    const candidates = [...wordsByLength[selectedLength]].sort(() => Math.random() - 0.5).slice(0, candidateCount);
    const selectedPassword = candidates[Math.floor(Math.random() * candidates.length)];

    setWords(candidates.sort());
    setPassword(selectedPassword);
    setAttempts(maxAttempts);
    setHistory([]);
    setGameOver(false);
    setWon(false);
    setIsLoading(false);
  };

  useEffect(() => {
    initGame();
  }, [targetLang]);

  const getLikeness = (word: string, target: string) => {
    let likeness = 0;
    for (let i = 0; i < Math.min(word.length, target.length); i++) {
      if (word[i] === target[i]) likeness++;
    }
    return likeness;
  };

  const handleGuess = (guess: string) => {
    if (gameOver || won) return;

    audioService.play(SoundEffect.CLICK);

    if (guess === password) {
      setWon(true);
      setGameOver(true);
      audioService.play(SoundEffect.SUCCESS);
      addXp(50);
      addCaps(25);
      if (Math.random() < 0.2) updateSpecial('I', 1);
    } else {
      const likeness = getLikeness(guess, password);
      setHistory([{ word: guess, likeness }, ...history]);
      setAttempts(a => a - 1);
      
      if (attempts <= 1) {
        setGameOver(true);
        audioService.play(SoundEffect.ERROR);
      } else {
        audioService.play(SoundEffect.ERROR);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono">
      <SEO 
        title={t.terminal_hacking} 
        description={t.hacking_desc}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between bg-black p-5 rounded-t-3xl border-x border-t border-emerald-500/30">
        <Link to="/" className="flex items-center gap-2 font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          {t.dashboard}
        </Link>
        <div className="flex items-center gap-6 font-bold text-lg text-emerald-500">
          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
            <Terminal className="w-5 h-5" />
            UNIVERSITY ARCHIVE RETRIEVAL SYSTEM
          </div>
        </div>
      </div>

      <div className="bg-black border border-emerald-500/30 p-8 rounded-b-3xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] relative overflow-hidden min-h-[600px]">
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none z-50" />
        
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-emerald-500 animate-pulse text-xl">
            {t.initializing_boot || 'INITIALIZING BOOT SEQUENCE...'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            {/* Left Column: Word List */}
            <div className="space-y-6">
              <div className="text-emerald-500 mb-8">
                <p className="mb-2">{t.robco_welcome || 'WELCOME TO UNIVERSITY CENTRAL ARCHIVES'}</p>
                <p className="mb-4">{t.password_required || 'ACCESS CODE REQUIRED'}</p>
                <div className="flex items-center gap-2">
                  <span>{t.attempts_left}:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: maxAttempts }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-3 h-5 border border-emerald-500/50 ${i < attempts ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1">
                {words.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGuess(word)}
                    disabled={gameOver || won || history.some(h => h.word === word)}
                    className={`
                      text-left px-4 py-1 hover:bg-emerald-500 hover:text-black transition-colors group flex items-center gap-4
                      ${history.some(h => h.word === word) ? 'opacity-30 cursor-not-allowed' : 'text-emerald-500'}
                      ${gameOver || won ? 'pointer-events-none' : ''}
                    `}
                  >
                    <span className="opacity-50 group-hover:opacity-100">0x{Math.floor(Math.random() * 9000 + 1000).toString(16).toUpperCase()}</span>
                    <span className="font-bold tracking-widest">{word}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Log & Status */}
            <div className="flex flex-col h-full border-l border-emerald-500/20 pl-8">
              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-4">
                <AnimatePresence mode="popLayout">
                  {won && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-emerald-500/20 border border-emerald-500 text-emerald-500 rounded-xl flex items-center gap-3"
                    >
                      <ShieldCheck className="w-6 h-6" />
                      <div>
                        <p className="font-bold text-lg">{t.hacking_access_granted || 'ARCHIVE ACCESS GRANTED'}</p>
                        <p className="text-xs opacity-80">{t.data_recovery_complete || 'KNOWLEDGE RETRIEVAL COMPLETE'}</p>
                      </div>
                    </motion.div>
                  )}

                  {gameOver && !won && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-rose-500/20 border border-rose-500 text-rose-500 rounded-xl flex items-center gap-3"
                    >
                      <ShieldAlert className="w-6 h-6" />
                      <div>
                        <p className="font-bold text-lg">{t.terminal_locked || 'SYSTEM LOCKOUT'}</p>
                        <p className="text-xs opacity-80">{t.security_lockout || 'ACADEMIC INTEGRITY VIOLATION DETECTED'}</p>
                      </div>
                    </motion.div>
                  )}

                  {history.map((entry, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-emerald-500/70 text-sm border-b border-emerald-500/10 pb-2"
                    >
                      <p className="flex justify-between">
                        <span>{entry.word}</span>
                        <span className="font-bold text-emerald-500">{t.likeness}: {entry.likeness}</span>
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!gameOver && !won && history.length === 0 && (
                  <div className="text-emerald-500/40 italic text-sm">
                    {t.hacking_instructions}
                  </div>
                )}
              </div>

              {(gameOver || won) && (
                <button
                  onClick={initGame}
                  className="mt-8 w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  {t.play_again}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-emerald-500 font-bold mb-1 uppercase tracking-wider text-sm">{t.overseer_tip}</h4>
          <p className="text-emerald-500/60 text-xs leading-relaxed">
            {t.likeness_desc}
          </p>
        </div>
      </div>
    </div>
  );
}
