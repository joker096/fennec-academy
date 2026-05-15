import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MessageCircle, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Shield, 
  Skull, 
  CircleUser, 
  Info, 
  Heart, 
  Trophy,
  Terminal,
  ChevronRight,
  TrendingUp,
  Brain,
  Star,
  UserCheck,
  Cpu,
  Microscope,
  Eye,
  Speech,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import { encounterService, EncounterOutcome } from '../services/encounterService';
import { fetchVisualAid } from '../services/geminiService';
import { audioService, SoundEffect } from '../services/audioService';
import { TerminalLoader } from '../components/TerminalLoader';
import SEO from '../components/SEO';
import canvasConfetti from 'canvas-confetti';

const TEMPLATES = [
  {
    id: 'researcher',
    icon: Sparkles,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    translations: {
      en: {
        name: 'The Senior Researcher',
        description: 'An expert specialized in ancient linguistic data looking for archives. They are curious but methodical.',
        scenario: 'You encounter a researcher analyzing a digital archive in a crumbling library. They look up from their tablet as you approach.'
      },
      ru: {
        name: 'Старший исследователь',
        description: 'Эксперт в области древних лингвистических данных, ищущий архивы. Любопытен, но методичен.',
        scenario: 'Вы встречаете исследователя, анализирующего цифровой архив в разрушенной библиотеке. Он отрывается от своего планшета, когда вы приближаетесь.'
      }
    }
  },
  {
    id: 'officer',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    translations: {
      en: {
        name: 'Academic Supply Officer',
        description: 'A university representative managing resource distribution. They seek collaboration.',
        scenario: 'A sleek research hover-transport stops on a dusty road. An officer in a lab coat steps out with a friendly gesture.'
      },
      ru: {
        name: 'Офицер по академическому снабжению',
        description: 'Представитель университета, управляющий распределением ресурсов. Ищет сотрудничества.',
        scenario: 'Изящный исследовательский ховер-транспорт останавливается на пыльной дороге. Офицер в лабораторном халате выходит с дружелюбным жестом.'
      }
    }
  },
  {
    id: 'proctor',
    icon: Shield,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    translations: {
      en: {
        name: 'Security Proctor',
        description: 'A strict administrator overseeing campus safety. You may need to verify your credentials.',
        scenario: 'A campus security proctor steps forward near a neon gate, scanning your biometric data. "State your identification and objective!"'
      },
      ru: {
        name: 'Проктор безопасности',
        description: 'Строгий администратор, надзирающий за безопасностью кампуса. Возможно, вам придется подтвердить свои данные.',
        scenario: 'Проктор безопасности кампуса выходит вперед у неоновых ворот, сканируя ваши биометрические данные. "Назовите вашу личность и цель!"'
      }
    }
  },
  {
    id: 'rogue_agent',
    icon: Eye,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    translations: {
      en: {
        name: 'The Rogue Agent',
        description: 'A former intelligence operative known for gathering "forbidden" pre-war data. Very perceptive.',
        scenario: 'A shadowy figure leans against a rusted terminal in a dark alley. They seem to be waiting for someone... or something.'
      },
      ru: {
        name: 'Изгой-агент',
        description: 'Бывший оперативный сотрудник разведки, известный сбором «запрещенных» довоенных данных. Очень проницателен.',
        scenario: 'Темная фигура прислонилась к заржавевшему терминалу в темном переулке. Кажется, она кого-то или чего-то ждет...'
      }
    }
  },
  {
    id: 'sentry_bot',
    icon: Cpu,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    translations: {
      en: {
        name: 'Sentry-01 Archive Guardian',
        description: 'An automated security unit protecting a data vault. It only responds to high-level technical codes.',
        scenario: 'A heavy metallic door slides open, revealing a buzzing sentry bot. "ACCESS DENIED. PROVIDE OVERRIDE COMMANDS IN THE PRIMARY ARCHIVE LANGUAGE."'
      },
      ru: {
        name: 'Страж архива Sentry-01',
        description: 'Автоматизированная единица безопасности, охраняющая хранилище данных. Реагирует только на высокоуровневые технические коды.',
        scenario: 'Тяжелая металлическая дверь открывается, открывая гудящего бота-часового. «ДОСТУП ЗАПРЕЩЕН. ПРЕДОСТАВЬТЕ КОМАНДЫ ПЕРЕОПРЕДЕЛЕНИЯ НА ОСНОВНОМ ЯЗЫКЕ АРХИВА».'
      }
    }
  },
  {
    id: 'wandering_scholar',
    icon: Microscope,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    translations: {
      en: {
        name: 'Wandering Scholar',
        description: 'A brilliant but eccentric scientist traveling between outposts to document rare artifacts.',
        scenario: 'A person with a backpack full of specimen jars is examining a glowing plant in a radioactive crater.'
      },
      ru: {
        name: 'Странствующий ученый',
        description: 'Блестящий, но эксцентричный ученый, путешествующий между аванпостами, чтобы документировать редкие артефакты.',
        scenario: 'Человек с рюкзаком, полным банок с образцами, изучает светящееся растение в радиоактивном кратере.'
      }
    }
  },
  {
    id: 'data_merchant',
    icon: Terminal,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    translations: {
      en: {
        name: 'The Data Merchant',
        description: 'A trader dealing in encrypted knowledge bits and legacy software. They value efficiency.',
        scenario: 'A colorful tent stands in the ruins of a tech park. Inside, a merchant surrounded by blinking servers waits.'
      },
      ru: {
        name: 'Торговец данными',
        description: 'Трейдер, занимающийся зашифрованными битами знаний и устаревшим ПО. Ценит эффективность.',
        scenario: 'В руинах технопарка стоит красочная палатка. Внутри ждет торговец, окруженный мигающими серверами.'
      }
    }
  },
  {
    id: 'broken_ai',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    translations: {
      en: {
        name: 'Failing Sub-Routine',
        description: 'A fragmented AI consciousness attempting to maintain its primary mission. It fluctuates between logic and chaos.',
        scenario: 'A terminal screen flickers rapidly. A voice crackles through a nearby speaker: "CORRUPTION DETECTED. HELP ME RESTORE THE VERB-CORE."'
      },
      ru: {
        name: 'Сбоящая подпрограмма',
        description: 'Фрагментированное сознание ИИ, пытающееся сохранить свою основную миссию. Колеблется между логикой и хаосом.',
        scenario: 'Экран терминала быстро мигает. Из ближайшего динамика раздается треск голоса: «ОБНАРУЖЕНО ПОВРЕЖДЕНИЕ. ПОМОГИТЕ МНЕ ВОССТАНОВИТЬ ЯДРО ГЛАГОЛОВ».'
      }
    }
  }
];

interface EncounterState {
  sceneDescription: string;
  characterDialogue: string;
  npcImageUrl: string | null;
  sceneVisualUrl: string | null;
  choices: { text: string; translation: string; branch?: string; requirement?: string }[];
  history: { role: 'user' | 'model'; text: string }[];
  isThinking: boolean;
  correction: string | null;
  lastOutcome: EncounterOutcome | null;
  narrativeState: string;
  activeNpc?: { name: string; visualDescription: string };
}

export default function Encounters() {
  const navigate = useNavigate();
  const { uiLang, targetLang, xp, addXp, addCredits, addNotification, health: hp, takeDamage, special, createNewChatSession } = useStore();
  const addCaps = addCredits;
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [state, setState] = useState<EncounterState | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const [outcomeData, setOutcomeData] = useState<{ xp: number, credits: number, healthChange: number, status?: 'success' | 'partial' | 'failure' } | null>(null);

  const userLevel = Math.floor(Math.sqrt(xp / 100)) + 1;

  const generateNPCImage = async (template: typeof TEMPLATES[0]) => {
    const trans = template.translations[uiLang] || template.translations.en;
    const prompt = await encounterService.generatePortraitPrompt(trans.name, trans.description);
    
    try {
      // Use the prompt to generate a Dicebear-based placeholder that looks better
      return `https://api.dicebear.com/7.x/notionists/svg?seed=${template.id}-${Math.random()}`;
    } catch (error) {
      return null;
    }
  };

  const startEncounter = async (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setIsEnding(false);
    setOutcomeData(null);
    
    setState({
      sceneDescription: '',
      characterDialogue: '',
      npcImageUrl: null,
      sceneVisualUrl: null,
      choices: [],
      history: [],
      isThinking: true,
      correction: null,
      lastOutcome: null,
      narrativeState: 'Initializing'
    });

    const trans = template.translations[uiLang] || template.translations.en;
    const [intro, npcImageUrl] = await Promise.all([
      encounterService.generateIntro({
        characterName: trans.name,
        characterDescription: trans.description,
        scenarioDescription: trans.scenario,
        targetLang,
        userLvl: userLevel,
        special
      }),
      generateNPCImage(template)
    ]);

    if (intro) {
      setState(prev => prev ? ({
        ...prev,
        sceneDescription: intro.sceneDescription,
        characterDialogue: intro.characterFirstLine,
        choices: intro.suggestedChoices,
        npcImageUrl,
        isThinking: false,
        activeNpc: intro.npc,
        history: [{ role: 'model' as const, text: intro.characterFirstLine }],
        narrativeState: 'Initial Contact'
      }) : null);
    }
  };

  const handleChoice = async (choiceText: string) => {
    if (!state || !selectedTemplate || state.isThinking) return;

    setState(prev => prev ? ({ ...prev, isThinking: true, correction: null }) : null);

    const trans = selectedTemplate.translations[uiLang] || selectedTemplate.translations.en;
    const response = await encounterService.generateResponse({
      characterName: trans.name,
      characterDescription: trans.description,
      scenarioDescription: trans.scenario,
      history: state.history,
      targetLang,
      userLvl: userLevel,
      special,
      narrativeState: state.narrativeState
    }, choiceText);

    if (response) {
      const outcome = response.outcome as EncounterOutcome;
      
      // Perception Synergy: Critical Hit
      const pBonus = useStore.getState().hasSynergy('P', 2) ? 0.25 : useStore.getState().hasSynergy('P', 1) ? 0.10 : 0;
      const isCrit = pBonus > 0 && Math.random() < pBonus;
      let multiplier = 1;
      
      if (isCrit) {
        multiplier = 2;
        addNotification(t.critical_hit || 'CRITICAL HIT! Double Rewards', 'success');
        audioService.play(SoundEffect.XP_GAIN);
        
        // Visual effect for crit could be added here
      }

      // Update global store based on outcome
      if (outcome.xpChange > 0) addXp(Math.floor(outcome.xpChange * multiplier));
      if (outcome.creditsChange !== 0) addCredits(Math.floor(outcome.creditsChange * multiplier));
      
      if (outcome.healthChange < 0) {
        takeDamage(Math.abs(outcome.healthChange));
        audioService.play(SoundEffect.HURT);
        addNotification(outcome.explanation, 'error');
      } else if (outcome.healthChange > 0) {
        useStore.getState().heal();
        addNotification(outcome.explanation, 'success');
      }

      // Generate scene visual if prompt is new
      let sceneVisualUrl = state.sceneVisualUrl;
      if (response.sceneImagePrompt) {
        try {
          const visual = await fetchVisualAid(response.sceneImagePrompt, targetLang);
          if (visual) sceneVisualUrl = visual;
        } catch (err) {
          console.warn("Scene visual gen failed", err);
        }
      }

      setState(prev => {
        if (!prev) return null;
        const newHistory = [
          ...prev.history,
          { role: 'user' as const, text: choiceText },
          { role: 'model' as const, text: response.characterResponse }
        ];

        return {
          ...prev,
          characterDialogue: response.characterResponse,
          choices: response.suggestedChoices,
          history: newHistory,
          isThinking: false,
          correction: response.correction,
          lastOutcome: outcome,
          narrativeState: response.narrativeState,
          sceneVisualUrl,
          activeNpc: response.npc || prev.activeNpc
        };
      });

      if (outcome.isGameOver) {
        setTimeout(() => {
          handleVictory(outcome);
        }, 2000);
      }
    }
  };

  const handleVictory = (outcome: EncounterOutcome) => {
    setOutcomeData({
      xp: Math.max(0, outcome.xpChange),
      credits: Math.max(0, outcome.creditsChange),
      healthChange: outcome.healthChange,
      status: outcome.resolutionStatus
    });
    setIsEnding(true);
    audioService.play(SoundEffect.SUCCESS);
    
    if (outcome.resolutionStatus === 'success') {
      canvasConfetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#fbbf24', '#ffffff']
      });
    } else if (outcome.resolutionStatus === 'partial') {
      canvasConfetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#ffffff']
      });
    }
  };

  if (isEnding) {
    const statusColors = {
      success: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      partial: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      failure: 'text-destructive bg-destructive/10 border-destructive/20'
    };

    const statusIcons = {
      success: Trophy,
      partial: Star,
      failure: Skull
    };

    const StatusIcon = statusIcons[outcomeData?.status || 'partial'];

    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center text-foreground font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card p-8 rounded-[2.5rem] shadow-2xl border border-border text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border shadow-lg ${statusColors[outcomeData?.status || 'partial']}`}>
            <StatusIcon className="w-10 h-10" />
          </div>

          <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border ${statusColors[outcomeData?.status || 'partial']}`}>
            {outcomeData?.status || 'RESOLVED'}
          </div>

          <h2 className="text-3xl font-display font-black mb-4 uppercase tracking-tighter text-foreground leading-none">
            {outcomeData?.status === 'success' ? (t.encounter_victory || 'Mission Accomplished') :
             outcomeData?.status === 'failure' ? (t.encounter_failure || 'Connection Lost') :
             (t.encounter_partial || 'Archives Accessed')}
          </h2>
          
          <p className="text-muted-foreground mb-8 text-sm font-medium leading-relaxed">
            {state?.lastOutcome?.explanation || (t.encounter_victory_desc || 'You navigated the situation successfully.')}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-secondary p-4 rounded-2xl border border-border">
              <div className="text-primary font-black text-2xl mb-1">+{outcomeData?.xp || 0}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.xp || 'XP'}</div>
            </div>
            <div className="bg-secondary p-4 rounded-2xl border border-border">
              <div className="text-amber-500 font-black text-2xl mb-1">+{outcomeData?.credits || 0}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.credits || 'CREDITS'}</div>
            </div>
            {outcomeData && outcomeData.healthChange !== 0 && (
              <div className="col-span-2 bg-secondary p-4 rounded-2xl border border-border">
                <div className={`font-black text-2xl mb-1 ${outcomeData.healthChange > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                   {outcomeData.healthChange > 0 ? '+' : ''}{outcomeData.healthChange}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.efficiency || 'EFFICIENCY'}</div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              {t.encounter_end || 'RETURN TO BASE'}
            </button>
            <button 
              onClick={() => {
                const trans = selectedTemplate.translations[uiLang] || selectedTemplate.translations.en;
                const title = `ARCHIVE: ${trans.name}`;
                createNewChatSession(title, state?.history.map((h, i) => ({
                  id: i.toString(),
                  role: h.role,
                  content: h.text,
                  timestamp: new Date().toISOString()
                })) || []);
                addNotification(t.encounter_archived || 'Encounter archived successfully.', 'success');
              }}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              {t.archive_encounter || 'Archive Dialogue'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (state && selectedTemplate) {
    const selectedTrans = selectedTemplate.translations[uiLang] || selectedTemplate.translations.en;
    return (
      <div className="min-h-screen bg-background flex flex-col text-foreground selection:bg-primary/30 font-sans">
        <SEO title={selectedTrans.name} description={selectedTrans.description} />
        
        <header className="h-16 flex items-center px-6 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-20">
          <button onClick={() => setSelectedTemplate(null)} className="p-2 -ml-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="ml-4 flex items-center gap-3">
             <div className={`p-2 rounded-xl bg-secondary border border-border ${selectedTemplate.color}`}>
                <selectedTemplate.icon className="w-5 h-5" />
             </div>
             <span className="font-display font-bold text-foreground uppercase tracking-tight">{selectedTrans.name}</span>
          </div>
          <div className="ml-auto">
             <div className="flex items-center gap-1.5 text-destructive font-bold text-[10px] uppercase tracking-widest">
                <Heart className="w-3 h-3" fill="currentColor" />
                {t.efficiency || 'Efficiency'} {Math.round(hp)}%
             </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-1 aspect-square rounded-[2.5rem] bg-card border border-border overflow-hidden relative shadow-xl group"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={state.sceneVisualUrl || state.npcImageUrl || 'placeholder'}
                  src={state.sceneVisualUrl || state.npcImageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedTemplate.id}`} 
                  alt={selectedTrans.name} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                 <Terminal className="w-3 h-3 text-primary" />
                 {state.narrativeState}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2 bg-card p-6 rounded-[2.5rem] border border-border flex flex-col justify-center relative overflow-hidden shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 relative z-10">
                 <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Microscope className="w-4 h-4" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.narrative_flow || 'NARRATIVE LOG'}</span>
              </div>
              <p className="text-foreground italic leading-relaxed relative z-10 font-medium">
                 {state.sceneDescription || t.loading || 'SETTING THE SCENE...'}
              </p>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col justify-end gap-6 relative">
             <AnimatePresence mode="wait">
                <motion.div 
                  key={state.characterDialogue}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card border border-border text-foreground p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden"
                >
                   <div className="absolute -top-6 -left-6 w-20 h-20 bg-secondary rounded-3xl p-1 shadow-lg border border-border overflow-hidden">
                      <div className={`w-full h-full rounded-2xl flex items-center justify-center bg-card shadow-inner ${selectedTemplate.color}`}>
                         <selectedTemplate.icon className="w-10 h-10" />
                      </div>
                   </div>

                   <div className="ml-12 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                             {selectedTrans.name} | {t.comm_link || 'LINK ACTIVE'}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-lg font-black uppercase tracking-tighter text-foreground leading-none">
                               {state.activeNpc?.name || selectedTrans.name}
                            </span>
                            <div className="flex items-center gap-1.5 ml-2 mr-2 opacity-50">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                               <span className="text-[8px] font-black uppercase tracking-widest">{state.history.length / 2}/10</span>
                            </div>
                            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                               <motion.div 
                                  className="h-full bg-primary"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(state.history.length / 2) * 10}%` }}
                               />
                            </div>
                          </div>
                        </div>
                        {state.lastOutcome && (
                          <div className={`flex items-center gap-1.5 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${state.lastOutcome.healthChange < 0 ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'}`}>
                             {state.lastOutcome.healthChange < 0 ? <Skull className="w-2.5 h-2.5" /> : <Star className="w-2.5 h-2.5" />}
                             {state.lastOutcome.explanation}
                          </div>
                        )}
                      </div>
                      <p className="text-xl md:text-2xl font-display font-medium text-foreground leading-relaxed">
                         {state.characterDialogue || '...'}
                      </p>
                      
                      {state.correction && (
                        <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/20 backdrop-blur-sm relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2 opacity-10">
                              <Speech className="w-12 h-12" />
                           </div>
                           <div className="flex items-center justify-between mb-1 relative z-10">
                               <div className="text-[10px] font-black uppercase tracking-widest text-primary">{t.linguistic_patch || 'LINGUISTIC PATCH'}</div>
                            </div>
                           <p className="text-sm font-semibold text-muted-foreground leading-relaxed italic relative z-10">
                              {state.correction}
                           </p>
                        </div>
                      )}
                   </div>
                </motion.div>
             </AnimatePresence>

             {state.isThinking && (
               <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-[2.5rem] border border-border">
                  <div className="flex items-center gap-3 bg-card px-8 py-4 rounded-[2rem] shadow-2xl border border-border">
                     <TerminalLoader text={t.analyzing_choices || "ANALYZING NEURAL PATHS"} />
                  </div>
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
             {state.choices.map((choice, i) => {
                const branchColors: Record<string, string> = {
                  diplomatic: 'hover:border-emerald-500/50 hover:bg-emerald-500/5 text-emerald-600',
                  academic: 'hover:border-indigo-500/50 hover:bg-indigo-500/5 text-indigo-600',
                  direct: 'hover:border-slate-500/50 hover:bg-slate-500/5 text-slate-600',
                  scientific: 'hover:border-violet-500/50 hover:bg-violet-500/5 text-violet-600',
                  hostile: 'hover:border-destructive/50 hover:bg-destructive/5 text-destructive',
                  technical: 'hover:border-cyan-500/50 hover:bg-cyan-500/5 text-cyan-600'
                };

                const branchIcons: Record<string, any> = {
                  diplomatic: Heart,
                  academic: Brain,
                  direct: Zap,
                  scientific: Microscope,
                  hostile: Skull,
                  technical: Cpu
                };

                const BranchIcon = branchIcons[choice.branch || 'direct'] || Zap;

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleChoice(choice.text)}
                    disabled={state.isThinking}
                    className={`group relative bg-secondary border border-border p-4 rounded-2xl text-left transition-all active:scale-95 disabled:opacity-50 shadow-sm ${branchColors[choice.branch || 'direct']}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-start gap-3">
                         <div className="p-1.5 rounded-lg bg-current/5 shrink-0 mt-0.5">
                            <BranchIcon className="w-3.5 h-3.5" />
                         </div>
                         <div className="text-sm font-bold text-foreground group-hover:text-current transition-colors">
                           {choice.text}
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {choice.requirement && (
                          <div className="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-lg border border-primary/20 whitespace-nowrap">
                            {choice.requirement}
                          </div>
                        )}
                        {choice.branch && (
                          <div className="text-[8px] font-black uppercase tracking-tighter opacity-50">
                            [{choice.branch}]
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground ml-8 uppercase tracking-widest font-black opacity-0 group-hover:opacity-100 transition-opacity">
                       {choice.translation}
                    </div>
                  </motion.button>
                );
             })}
             
             <div className="md:col-span-2 flex flex-col gap-2">
                <div className="flex gap-2">
                   <div className="relative flex-1 group">
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text"
                        placeholder={t.choice_talk || 'TRANSMIT MESSAGE...'}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && userInput && (handleChoice(userInput), setUserInput(''))}
                        disabled={state.isThinking}
                        className="w-full bg-card border border-border rounded-2xl pl-12 pr-6 py-4 font-sans font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      />
                   </div>
                   <button 
                     onClick={() => userInput && (handleChoice(userInput), setUserInput(''))}
                     disabled={!userInput || state.isThinking}
                     className="bg-primary text-primary-foreground p-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                   >
                      <ArrowLeft className="w-6 h-6 rotate-180" />
                   </button>
                </div>
             </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/30">
       <SEO title={t.encounters || 'ENCOUNTERS'} description={t.encounters_desc} />
       
       <header className="h-20 flex items-center px-8 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-20">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="ml-4">
             <h1 className="text-2xl font-display font-black uppercase tracking-widest text-foreground">{t.encounters || 'ENCOUNTERS'}</h1>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t.encounters_desc || 'SATELLITE LINK ACTIVE'}</p>
          </div>
       </header>

       <main className="flex-1 max-w-5xl mx-auto w-full p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {TEMPLATES.map(template => {
               const trans = template.translations[uiLang] || template.translations.en;
               return (
                <motion.button
                  key={template.id}
                  whileHover={{ y: -5 }}
                  onClick={() => startEncounter(template)}
                  className="bg-card border border-border rounded-[2.5rem] p-8 text-left transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/10 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 transition-colors duration-500" />
                  
                  <div className="relative z-10 h-full flex flex-col">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-border shadow-sm group-hover:scale-110 transition-transform ${template.color} bg-secondary`}>
                       <template.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-display font-black text-foreground mb-2 uppercase tracking-tight group-hover:text-primary transition-colors">
                       {trans.name}
                    </h3>
                    <p className="text-muted-foreground text-xs font-bold leading-relaxed mb-8 uppercase tracking-wider">
                       {trans.description}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                       <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                          <Zap className="w-3 h-3" />
                          {t.encounter_start || 'INITIATE'}
                       </div>
                       <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </motion.button>
               );
             })}
          </div>
       </main>
    </div>
  );
}
