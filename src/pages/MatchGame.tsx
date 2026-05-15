import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { WORDS_BY_LANG } from '../data/gameData';
import { UI_TRANSLATIONS } from '../data/translations';
import { ArrowLeft, Zap, Timer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { AdBanner } from '../components/AdBanner';
import { audioService, SoundEffect } from '../services/audioService';

interface MatchItem {
  id: string;
  text: string;
  type: 'native' | 'target';
  wordId: string;
}

export default function MatchGame() {
  const { targetLang, uiLang, xp, addXp, addCredits, updateSpecial, isPremium, hasSynergy } = useStore();
  const addCaps = addCredits; // Keep for minimal changes in rest of file
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const navigate = useNavigate();

  const [items, setItems] = useState<MatchItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  
  // Agility Synergy: Tier 1 (+5s), Tier 2 (+10s)
  const agilityBonus = hasSynergy('A', 2) ? 10 : hasSynergy('A', 1) ? 5 : 0;
  const [timeLeft, setTimeLeft] = useState(60 + agilityBonus);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Agility Synergy message
    if (agilityBonus > 0 && isPlaying && timeLeft === (60 + agilityBonus)) {
      useStore.getState().addNotification(`Agility Synergy: +${agilityBonus}s Time Bonus!`, 'success');
    }
  }, [isPlaying]);

  useEffect(() => {
    // Reset time with bonus when starting over
    if (!isPlaying && !gameOver && timeLeft === 0) {
      setTimeLeft(60 + agilityBonus);
    }
  }, [isPlaying, gameOver, agilityBonus]);

  useEffect(() => {
    // Initial generation
    const allWords = WORDS_BY_LANG[targetLang] || WORDS_BY_LANG['sr'];
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5).slice(0, 6);
    
    const newItems: MatchItem[] = [];
    shuffledWords.forEach(word => {
      newItems.push({ id: `n_${word.id}`, text: word.translations[uiLang] || word.translation, type: 'native', wordId: word.id.toString() });
      newItems.push({ id: `t_${word.id}`, text: word.word, type: 'target', wordId: word.id.toString() });
    });

    setItems(newItems.sort(() => Math.random() - 0.5));
  }, [targetLang]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isPlaying) {
      handleGameOver();
    }
  }, [isPlaying, timeLeft]);

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    if (score > 0) {
      audioService.play(SoundEffect.SUCCESS);
      const xpReward = score * 5; // Increased reward for continuous play
      const creditReward = Math.floor(score / 1.5);
      
      addXp(xpReward);
      addCredits(creditReward);
      
      // Chance to increase Speed (Agility) if score is high
      if (score >= 15 && Math.random() < 0.3) {
        updateSpecial('A', 1);
      }
    }
  };

  const [mismatch, setMismatch] = useState<string | null>(null);

  const handleSelect = (item: MatchItem) => {
    if (!isPlaying && !gameOver) setIsPlaying(true);
    if (mismatch) return;

    audioService.play(SoundEffect.CLICK);

    if (!selected) {
      setSelected(item.id);
    } else {
      const selectedItem = items.find(i => i.id === selected);
      if (selectedItem && selectedItem.wordId === item.wordId && selectedItem.type !== item.type) {
        // Match!
        audioService.play(SoundEffect.SUCCESS);
        // Luck Synergy: Lucky Streak (+25% or +50% extra Credits/XP)
        let luckyBonus = 1;
        if (useStore.getState().hasSynergy('L', 2)) {
          luckyBonus = 1.5;
        } else if (useStore.getState().hasSynergy('L', 1)) {
          luckyBonus = 1.25;
        }
        
        setMatched(prev => [...prev, item.wordId]);
        setScore(s => s + 1);
        addXp(Math.floor(1 * luckyBonus));
        addCredits(Math.floor(2 * luckyBonus));
        setSelected(null);
        
        // Remove from items and add a new pair after a short delay for animation
        setTimeout(() => {
          const allWords = WORDS_BY_LANG[targetLang] || WORDS_BY_LANG['sr'];
          
          setItems(currentItems => {
            const remaining = currentItems.filter(i => i.wordId !== item.wordId);
            
            // Find a word not currently on the board
            const currentOnBoardIds = remaining.map(i => i.wordId);
            const availableWords = allWords.filter(w => !currentOnBoardIds.includes(w.id.toString()));
            
            // If we run out of words, just pick a random one
            const pool = availableWords.length > 0 ? availableWords : allWords;
            const newWord = pool[Math.floor(Math.random() * pool.length)];
            
            const newPair: MatchItem[] = [
              { id: `n_${newWord.id}_${Date.now()}`, text: newWord.translations[uiLang] || newWord.translation, type: 'native', wordId: newWord.id.toString() },
              { id: `t_${newWord.id}_${Date.now()}`, text: newWord.word, type: 'target', wordId: newWord.id.toString() }
            ];
            
            return [...remaining, ...newPair].sort(() => Math.random() - 0.5);
          });
          
          setMatched(prev => prev.filter(id => id !== item.wordId));
        }, 300);
      } else {
        // Mismatch
        audioService.play(SoundEffect.ERROR);
        setMismatch(item.id);
        setTimeout(() => {
          setMismatch(null);
          setSelected(null);
        }, 500);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <SEO 
        title={t.match_madness} 
        description={t.match_madness_desc}
      />
      
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          {t.dashboard}
        </Link>
        <div className="flex items-center gap-6 font-bold text-lg">
          <div className="flex items-center gap-2 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-4 py-1.5 rounded-xl">
            <Zap className="w-5 h-5 fill-current" />
            {score}
          </div>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl ${timeLeft <= 10 ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 animate-pulse' : 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'}`}>
            <Timer className="w-5 h-5" />
            0:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {!gameOver ? (
        <div className="grid grid-cols-2 gap-4">
          {items.map(item => {
            const isMatched = matched.includes(item.wordId);
            const isSelected = selected === item.id;
            const isMismatch = mismatch === item.id || (mismatch && selected === item.id);
            
            return (
              <motion.button
                key={item.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: isMatched ? 0.95 : isSelected ? 1.05 : 1, 
                  opacity: 1,
                  x: isMismatch ? [-4, 4, -4, 4, 0] : 0,
                  rotate: isMismatch ? [-1, 1, -1, 1, 0] : 0
                }}
                transition={{ duration: 0.3 }}
                whileHover={!isMatched && !isMismatch ? { scale: 1.03, y: -2 } : {}}
                whileTap={!isMatched && !isMismatch ? { scale: 0.97 } : {}}
                onClick={() => handleSelect(item)}
                disabled={isMatched || !!mismatch}
                className={`
                  p-6 rounded-2xl font-bold text-lg md:text-xl transition-all shadow-md border-2 relative overflow-hidden
                  ${isMatched ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 opacity-60' : 
                    isMismatch ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400' :
                    isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 
                    'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-600'}
                `}
              >
                <AnimatePresence>
                  {isMatched && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-2 right-2 text-emerald-500"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="relative z-10">{item.text}</span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl text-center shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white mb-6">
              {t.match_complete}
            </h2>
            <div className="text-lg text-slate-600 dark:text-slate-300 mb-8 space-y-3 font-medium">
              <p className="flex items-center justify-center gap-2">
              <span className="text-slate-400">{t.score || 'Score'}:</span> 
              <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider">{score}</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-slate-400">{t.xp_earned || 'XP Earned'}:</span> 
              <span className="font-bold text-indigo-500">+{score * 5}</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-slate-400">{t.caps_earned || 'Credits Earned'}:</span> 
              <span className="font-bold text-amber-500">+{Math.floor(score / 1.5)}</span>
            </p>
            {score >= 15 && (
              <p className="text-emerald-500 font-bold text-sm uppercase animate-bounce mt-4">
                {t.speed_boost_achieved || 'Agility Training Successful! Speed Enhanced.'}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setScore(0);
              setTimeLeft(60);
              setGameOver(false);
              setMatched([]);
              setIsPlaying(false);
              // Force re-generation of items if needed, though they already recycle
            }}
            className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md hover:bg-indigo-600 hover:shadow-lg transition-all uppercase tracking-widest"
          >
            {t.play_again || 'Initiate New Session'}
          </button>
          </div>
        </div>
      )}

      {!isPremium && (
        <div className="mt-12">
          <AdBanner />
        </div>
      )}
    </div>
  );
}
