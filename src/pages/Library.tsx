import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import { BookOpen, Lock, Play, Search, Filter, Database, Download, Terminal, AlertCircle, Keyboard as KeyboardIcon, CheckCircle2, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import Tooltip from '../components/Tooltip';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { AdBanner } from '../components/AdBanner';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { AnimatePresence } from 'motion/react';

export default function Library() {
  const navigate = useNavigate();
  const { xp, uiLang, equippedPerks, isPremium, mistakes, completedLessons, targetLang } = useStore();
  const currentLevel = Math.floor(xp / 100) + 1;
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const hasHacker = equippedPerks.includes('hacker');

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [downloadingTape, setDownloadingTape] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(false);

  useEffect(() => {
    if (downloadingTape !== null) {
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setDownloadingTape(null);
              setDownloadProgress(0);
            }, 500);
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [downloadingTape]);

  const handleTapeClick = (tapeId: number, isUnlocked: boolean) => {
    if (!isUnlocked || downloadingTape !== null) return;
    setDownloadingTape(tapeId);
    setDownloadProgress(0);
  };

  const holotapes = useMemo(() => [
    {
      id: 1,
      title: t.holotape_1_title,
      description: t.holotape_1_desc,
      unlockLevel: 2,
      color: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      type: 'module',
      imageUrl: 'https://picsum.photos/seed/wasteland_basics/600/400'
    },
    {
      id: 2,
      title: t.holotape_2_title,
      description: t.holotape_2_desc,
      unlockLevel: 5,
      color: 'bg-indigo-100 dark:bg-indigo-900/30',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      type: 'module',
      imageUrl: 'https://picsum.photos/seed/wasteland_intermediate/600/400'
    },
    {
      id: 3,
      title: t.holotape_3_title,
      description: t.holotape_3_desc,
      unlockLevel: 10,
      color: 'bg-indigo-200 dark:bg-indigo-900/40',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      type: 'module',
      imageUrl: 'https://picsum.photos/seed/wasteland_advanced/600/400'
    },
    {
      id: 4,
      title: t.Article_1_title,
      description: t.Article_1_desc,
      unlockLevel: 3,
      color: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      type: 'book',
      imageUrl: 'https://picsum.photos/seed/wasteland_travel/600/400'
    },
    {
      id: 5,
      title: t.Article_2_title,
      description: t.Article_2_desc,
      unlockLevel: 7,
      color: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      type: 'book',
      imageUrl: 'https://picsum.photos/seed/wasteland_food/600/400'
    },
    {
      id: 6,
      title: t.Article_3_title,
      description: t.Article_3_desc,
      unlockLevel: 12,
      color: 'bg-amber-200 dark:bg-amber-900/40',
      textColor: 'text-amber-700 dark:text-amber-300',
      type: 'book',
      imageUrl: 'https://picsum.photos/seed/wasteland_family/600/400'
    }
  ], [t]);

  const filteredHolotapes = useMemo(() => holotapes.filter(tape => {
    const isUnlocked = currentLevel >= tape.unlockLevel || hasHacker;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
                          tape.title.toLowerCase().includes(query) || 
                          tape.description.toLowerCase().includes(query);
    
    if (!matchesSearch) return false;
    
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  }), [holotapes, currentLevel, hasHacker, searchQuery, filter]);

  return (
    <div className="space-y-12 pb-20 font-sans relative">
      <SEO 
        title={t.library} 
        description={t.library_seo_desc}
      />
      <div className="bg-card p-8 md:p-12 rounded-2xl border border-border text-center relative overflow-hidden group shadow-xl">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(currentColor_1px,transparent_0)] bg-[size:30px_30px]" />
        <div className="relative z-10 space-y-6">
          <Database className="w-20 h-20 mx-auto mb-4 text-primary" />
          <h1 className="text-5xl font-bold tracking-tight text-foreground">{t.library || 'Central Archives'}</h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
            {t.library_desc || 'DATABASE ACCESS GRANTED. RETRIEVING LINGUISTIC HOLOTAPES...'}
          </p>
        </div>
      </div>

      <KnowledgeGraph searchQuery={searchQuery} />

      {/* Broken Terminal (Mistakes Bank) */}
      <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
          <Terminal className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-10 pb-6 border-b border-border">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-sm">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight">{t.broken_terminal}</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.5em]">{t.mistakes_bank_version || 'ANOMALY DETECTION SYSTEM V2.4'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-left space-y-8">
              <p className="text-muted-foreground font-medium text-sm leading-loose uppercase tracking-widest max-w-md">
                {t.mistakes_bank_desc || 'Linguistic anomalies detected in neural patterns. Manual recalibration required to ensure structural integrity of learned data bits.'}
              </p>
              <div className="flex items-center gap-10">
                <div className="text-center bg-muted/50 p-4 border border-border rounded-2xl shadow-inner">
                  <div className="text-5xl font-bold text-foreground mb-1">{Object.keys(mistakes).length}</div>
                  <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.4em]">{t.anomalies || 'DATA ERRORS'}</div>
                </div>
                <div className="w-px h-16 bg-border" />
                <Tooltip content={t.tooltip_repair_terminal}>
                  <button 
                    onClick={() => navigate('/flashcards?mode=mistakes')}
                    disabled={Object.keys(mistakes).length === 0}
                    className="flex-1 py-5 bg-primary text-white rounded-2xl font-bold text-xl uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    <span className="relative z-10">{t.repair_terminal}</span>
                  </button>
                </Tooltip>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-xl border border-border p-4 text-[10px] text-muted-foreground font-medium h-56 overflow-y-auto custom-scrollbar text-left shadow-inner uppercase tracking-wider">
              {Object.keys(mistakes).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(mistakes).map(([wordId, mistake]) => (
                    <div key={wordId} className="flex justify-between items-center border-b border-border/5 pb-2 group hover:bg-muted/50 transition-colors">
                      <span className="text-foreground transition-colors">&gt; {wordId.split('_')[1]}</span>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors tracking-[0.2em] text-[9px]">{t.repair_lvl}: {mistake.repairCount}/3 CORRECTED</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center italic opacity-40 text-[10px] font-bold tracking-[0.6em] text-center px-10">
                  {t.no_anomalies || 'NEURAL PATHWAYS OPERATING AT 100% EFFICIENCY'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isPremium && (
        <div className="my-12">
          <AdBanner />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-lg relative overflow-hidden">
        <div className="relative w-full md:w-[32rem] z-10 flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={t.search_placeholder_modules || 'SEEK DATA...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border border-border text-foreground pl-12 pr-6 py-4 rounded-2xl outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground text-sm font-bold uppercase tracking-widest shadow-inner"
            />
          </div>
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className={`p-4 rounded-2xl border transition-all group ${
              showKeyboard 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-muted border-border text-muted-foreground hover:text-primary hover:border-primary shadow-sm'
            }`}
            title={t.virtual_keyboard}
          >
            <KeyboardIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto z-10">
          <Filter className="w-6 h-6 text-muted-foreground" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="flex-1 md:w-56 bg-muted border border-border text-foreground px-6 py-4 rounded-2xl outline-none focus:border-primary/40 transition-all cursor-pointer text-[10px] font-bold uppercase tracking-[0.3em] shadow-sm appearance-none"
          >
            <option value="all">{t.filter_all}</option>
            <option value="unlocked">{t.filter_unlocked}</option>
            <option value="locked">{t.filter_locked}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
        {filteredHolotapes.map((tape) => {
          const isUnlocked = currentLevel >= tape.unlockLevel || hasHacker;
          const isDownloading = downloadingTape === tape.id;
          
          return (
            <div 
              key={tape.id}
className={`relative rounded-[2rem] overflow-hidden transition-all duration-500 bg-card border shadow-xl group ${
                 isUnlocked
                   ? 'border-border hover:border-primary/40 cursor-pointer hover:-translate-y-2 hover:shadow-2xl'
                   : 'border-border opacity-60 grayscale cursor-not-allowed'
               }`}
              onClick={() => handleTapeClick(tape.id, isUnlocked)}
            >
              {/* Top Bar */}
              <div className={`px-6 py-4 flex justify-between items-center border-b relative z-10 ${isUnlocked ? 'bg-muted/30 border-border' : 'bg-muted/40 border-border'}`}>
                <div className="flex items-center gap-3">
                  {tape.type === 'book' ? (
                    <BookOpen className={`w-5 h-5 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  ) : (
                    <Database className={`w-5 h-5 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className={`font-bold text-[11px] tracking-[0.3em] uppercase ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {tape.type === 'book' ? (t.book || 'VOL') : (t.sector || 'SEC')} {tape.id}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {completedLessons.includes(`${targetLang}_${tape.id}`) && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                  {isUnlocked ? (
                    <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Tape Graphic */}
              <div className={`h-48 relative flex items-center justify-center overflow-hidden border-b border-border ${tape.color}`}>
                {tape.imageUrl && (
                  <img 
                    src={tape.imageUrl} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700 grayscale"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className={`text-2xl font-bold text-center ${tape.textColor} uppercase tracking-tighter relative z-10 px-6 group-hover:scale-110 transition-transform duration-500`}>
                  {tape.title}
                </div>
              </div>

              {/* Bottom Info Area */}
              <div className="p-6 bg-card relative group-hover:bg-muted/50 transition-colors">
                <p className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed min-h-[44px] uppercase tracking-wider">
                  {tape.description}
                </p>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-[9px] font-bold tracking-[0.3em] text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                  <span>VAULT-TEC © 2077</span>
                  <span>MK-IV FORMAT</span>
                </div>
              </div>

              {/* Locked Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-muted/80 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center text-foreground">
                  <div className="bg-card border border-border p-6 rounded-2xl mb-4 shadow-xl">
                    <Lock className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <span className="font-bold uppercase tracking-[0.5em] text-xs">
                    {t.level || 'ACCESS LEVEL'} {tape.unlockLevel}
                  </span>
                </div>
              )}

              {/* Downloading Overlay */}
              {isDownloading && (
                <div className="absolute inset-0 bg-card/95 backdrop-blur-md z-40 flex flex-col items-center justify-center text-foreground p-10 font-sans">
                  <Loader2 className="w-12 h-12 mb-8 text-primary animate-spin" />
                  <div className="w-full bg-muted h-3 border border-border rounded-full mb-4 overflow-hidden shadow-inner relative">
                    <div 
                      className="h-full bg-primary shadow-lg transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-xs uppercase tracking-[0.5em] animate-pulse">
                      {t.downloading || 'DECRYPTING DATA'} {downloadProgress}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {showKeyboard && (
          <VirtualKeyboard 
            currentValue={searchQuery}
            onInput={(char) => setSearchQuery(prev => prev + char)}
            onDelete={() => setSearchQuery(prev => prev.slice(0, -1))}
            onClose={() => setShowKeyboard(false)}
            onEnter={() => setShowKeyboard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
