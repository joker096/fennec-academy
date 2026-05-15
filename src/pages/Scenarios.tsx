import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, ShoppingCart, Cross, Coffee, ArrowLeft, Terminal, Lock, Sparkles, Utensils, Map, BookOpen, Hammer, Shield, Compass } from 'lucide-react';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import AIChat from './AIChat';
import { AdBanner } from '../components/AdBanner';

const SCENARIOS = [
  {
    id: 'monorail',
    icon: Train,
    title: { ru: 'Станция монорельса', en: 'Train Station' },
    desc: { 
      ru: 'Потренируйтесь покупать билеты и узнавать расписание поездов у ворчливого кассира.', 
      en: 'Practice buying tickets and asking for train times with a grumpy ticket clerk.' 
    },
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    prompt: 'You are a ticket clerk at a train station. The user is a traveler. They need to buy a ticket to a city and ask when the next train leaves. Speak ONLY in the target language. Act slightly grumpy but helpful. Wait for the user to ask. When the user successfully buys the ticket and asks the time, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 1 }
  },
  {
    id: 'trading_post',
    icon: ShoppingCart,
    title: { ru: 'Торговый центр', en: 'Shopping Mall' },
    desc: { 
      ru: 'Потренируйтесь торговаться и покупать припасы у сурового рыночного торговца.', 
      en: 'Practice haggling for prices and buying supplies with a tough market merchant.' 
    },
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    prompt: 'You are a merchant at a local market. The user wants to buy some water and a snack, and needs to ask for the price and haggle. Speak ONLY in the target language. Act like a tough negotiator. When the user successfully completes the purchase, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 3, lessonId: '102' }
  },
  {
    id: 'clinic',
    icon: Cross,
    title: { ru: 'Клиника', en: 'Local Clinic' },
    desc: { 
      ru: 'Потренируйтесь описывать свои симптомы и просить лекарства у измотанного врача.', 
      en: 'Practice describing your symptoms and asking for medicine with an exhausted doctor.' 
    },
    color: 'text-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    prompt: 'You are a doctor at a local clinic. The user comes in feeling sick (a cold or a headache). They need to describe their symptoms and ask for medicine. Speak ONLY in the target language. Act professional but exhausted. When the user successfully describes symptoms and gets the medicine, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 5, lessonId: '1401' }
  },
  {
    id: 'saloon',
    icon: Coffee,
    title: { ru: 'Местное кафе', en: 'Local Cafe' },
    desc: { 
      ru: 'Потренируйтесь заказывать еду и напитки, болтая с дружелюбным бариста.', 
      en: 'Practice ordering food and drinks while chatting with a friendly barista.' 
    },
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    prompt: 'You are a barista at a local cafe. The user walks in to order a coffee and ask for directions. Speak ONLY in the target language. Act friendly and talkative. When the user successfully orders and asks a question, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 7, lessonId: '601' }
  },
  {
    id: 'diner',
    icon: Utensils,
    title: { ru: 'Закусочная "Пустошь"', en: 'Wasteland Diner' },
    desc: { 
      ru: 'Закажите полноценный обед и обсудите меню с очень занятым официантом.', 
      en: 'Order a full meal and discuss the menu with a very busy waiter.' 
    },
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    prompt: 'You are a waiter at a busy wasteland diner. The user wants to order a full meal (appetizer, main course, and drink). Speak ONLY in the target language. Act busy and slightly impatient but professional. When the user successfully orders all three items, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 9, lessonId: '801' }
  },
  {
    id: 'fancy_restaurant',
    icon: Utensils,
    title: { ru: 'Ресторан "Гурман"', en: 'The Gourmand Restaurant' },
    desc: { 
      ru: 'Закажите изысканный ужин в элитном послевоенном заведении с вежливым официантом.', 
      en: 'Order an exquisite dinner in an elite post-war establishment with a friendly waiter.' 
    },
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    prompt: 'You are a friendly and extremely polite waiter at a high-end restaurant called "The Gourmand". The user is a guest looking to order dinner. Speak ONLY in the target language. Guide the user through the menu, offer recommendations, and provide polite corrections if they make mistakes. You must collect their order for a starter, a main course, and a dessert. Act refined, welcoming, and helpful. When the user successfully orders all three courses, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 10, lessonId: '801' }
  },
  {
    id: 'checkpoint',
    icon: Map,
    title: { ru: 'Блокпост Альфа', en: 'Checkpoint Alpha' },
    desc: { 
      ru: 'Узнайте дорогу до ближайшего убежища у патрульного робота.', 
      en: 'Ask for directions to the nearest vault from a patrol robot.' 
    },
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    prompt: 'You are a patrol robot at a wasteland checkpoint. The user is lost and needs directions to "Vault 101". Speak ONLY in the target language. Act helpful but speak in a slightly robotic, formal tone. When the user successfully asks for directions and understands your instructions, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 11, lessonId: '1001' }
  },
  {
    id: 'library',
    icon: BookOpen,
    title: { ru: 'Старая библиотека', en: 'Old Library' },
    desc: { 
      ru: 'Обсудите свои хобби и любимые книги с хранителем знаний.', 
      en: 'Discuss your hobbies and favorite books with a knowledge keeper.' 
    },
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    prompt: 'You are a librarian in an old, dusty library. The user wants to talk about their hobbies and find a book to read. Speak ONLY in the target language. Act wise, calm, and passionate about books. When the user successfully discusses at least two hobbies and asks for a book recommendation, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 13, lessonId: '1201' }
  },
  {
    id: 'scavenger',
    icon: Hammer,
    title: { ru: 'Лагерь мусорщиков', en: "Scavenger's Camp" },
    desc: { 
      ru: 'Договоритесь о покупке редких деталей у подозрительного мусорщика.', 
      en: 'Negotiate for rare parts with a suspicious scavenger.' 
    },
    color: 'text-slate-500',
    bgColor: 'bg-slate-50 dark:bg-slate-900/20',
    borderColor: 'border-slate-200 dark:border-slate-800',
    prompt: 'You are a wasteland scavenger. You have a rare "Fusion Core" that the user wants. Speak ONLY in the target language. Act suspicious and greedy. The user must convince you to trade it for a fair price. When the user successfully negotiates a deal, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 15, lessonId: '1101' }
  },
  {
    id: 'survivalist',
    icon: Shield,
    title: { ru: 'Бункер выживальщика', en: "Survivalist's Bunker" },
    desc: { 
      ru: 'Обсудите советы по выживанию в радиоактивной пустыне с опытным отшельником.', 
      en: 'Discuss survival tips in the radioactive desert with an experienced hermit.' 
    },
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    prompt: 'You are an old survivalist living in a fortified bunker. The user wants to learn how to survive in the "Glowing Sea". Speak ONLY in the target language. Act cautious but wise. The user must ask for at least three survival tips (water, radiation, food). When the user successfully learns three tips, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 17, lessonId: '1401' }
  },
  {
    id: 'caravan',
    icon: Compass,
    title: { ru: 'Стоянка каравана', en: 'Caravan Stop' },
    desc: { 
      ru: 'Узнайте новости о дорогах и опасностях у лидера каравана.', 
      en: 'Get news about roads and dangers from a caravan leader.' 
    },
    color: 'text-lime-500',
    bgColor: 'bg-lime-50 dark:bg-lime-900/20',
    borderColor: 'border-lime-200 dark:border-lime-800',
    prompt: 'You are a caravan leader resting at a stop. The user wants to know about the road ahead and the nearest settlement. Speak ONLY in the target language. Act weary but knowledgeable. The user must ask about the "Diamond City" and any dangers on the road. When the user successfully gets the information, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 19, lessonId: '1001' }
  },
  {
    id: 'vault_hotel',
    icon: Lock,
    title: { ru: 'Гостиница "Убежище"', en: 'Vault Hotel' },
    desc: { 
      ru: 'Заселитесь в номер и расспросите об услугах в сохранившемся довоенном стиле.', 
      en: 'Check into a room and ask about amenities in a preserved pre-war style.' 
    },
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    prompt: 'You are a front desk clerk at a luxury vault hotel. The user wants to check in for two nights and ask if breakfast is included. Speak ONLY in the target language. Act overly polite and formal, like a pre-war automated personality. When the user successfully checks in and asks about amenities, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 14, lessonId: '1201' }
  },
  {
    id: 'weapon_shop',
    icon: Hammer,
    title: { ru: 'Оружейная мастерская', en: 'Weapon Workshop' },
    desc: { 
      ru: 'Попросите починить ваше снаряжение и опишите характер повреждений.', 
      en: 'Ask to repair your gear and describe the type of damage.' 
    },
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-50 dark:bg-zinc-900/20',
    borderColor: 'border-zinc-200 dark:border-zinc-800',
    prompt: 'You are a master gunsmith. The user has a broken "Plasma Rifle" and a damaged "Power Armor" piece. They must describe how it broke and ask for a repair quote. Speak ONLY in the target language. Act like a busy professional who values technical accuracy. When the user successfully describes the damage and agrees on a price, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 8, lessonId: '601' }
  },
  {
    id: 'raider_gate',
    icon: Shield,
    title: { ru: 'Ворота лагеря', en: 'Raider Gate' },
    desc: { 
      ru: 'Убедите охранника пропустить вас без боя, используя дипломатию.', 
      en: 'Convince the guard to let you pass without a fight using diplomacy.' 
    },
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    prompt: 'You are a hostile raider guard. The user is trying to pass into your territory. You are aggressive and untrusting. The user must convince you they are not a threat and offer a small bribe or a good reason to enter. Speak ONLY in the target language. Act aggressive but open to negotiation. When the user successfully negotiates passage, append exactly "[SUCCESS]" to your response.',
    unlockRequirement: { level: 12, lessonId: '1001' }
  }
];

export default function Scenarios() {
  const navigate = useNavigate();
  const { uiLang, isPremium, buyPremium, xp, completedLessons, addNotification } = useStore();
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);

  const userLevel = Math.floor(xp / 100) + 1;

  const checkUnlocked = (scenario: typeof SCENARIOS[0]) => {
    const { level, lessonId } = scenario.unlockRequirement;
    const levelMet = level ? userLevel >= level : true;
    const lessonMet = lessonId ? completedLessons.includes(lessonId) : true;
    return levelMet || lessonMet;
  };

  const handleScenarioClick = (scenario: typeof SCENARIOS[0]) => {
    if (!checkUnlocked(scenario)) {
      const { level, lessonId } = scenario.unlockRequirement;
      let message = t.requires_level.replace('{level}', level.toString());
      if (lessonId) {
        message += t.or_lesson.replace('{lesson}', lessonId);
      }
      addNotification(message, 'warning');
      return;
    }
    setSelectedScenario(scenario);
  };

  if (selectedScenario) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-terminal text-primary scanlines relative overflow-hidden">
        <SEO 
          title={selectedScenario.title[uiLang as keyof typeof selectedScenario.title] || selectedScenario.title.en} 
          description={t.scenarios_desc}
        />
        <header className="h-20 flex items-center px-6 max-w-5xl mx-auto w-full gap-6 border-b border-primary/20 z-10 relative">
          <button onClick={() => setSelectedScenario(null)} className="p-3 text-primary hover:text-white transition-all rounded-xl hover:bg-primary/20 border border-transparent hover:border-primary/30">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center gap-4">
            <span className="font-black text-xl drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]">
              {selectedScenario.title[uiLang as keyof typeof selectedScenario.title] || selectedScenario.title.en}
            </span>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10 z-10 relative">
          <div className="glass-card p-4 md:p-8 border-primary/10 min-h-[600px]">
            <AIChat 
              scenarioState={{ 
                scenario: selectedScenario.id, 
                prompt: selectedScenario.prompt, 
                title: selectedScenario.title[uiLang as keyof typeof selectedScenario.title] || selectedScenario.title.en 
              }} 
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-terminal text-primary scanlines relative overflow-hidden">
      <SEO 
        title={t.scenarios} 
        description={t.scenarios_desc}
      />
      <header className="h-20 flex items-center px-6 max-w-5xl mx-auto w-full gap-6 border-b border-primary/20 z-10 relative">
        <button onClick={() => navigate('/')} className="p-3 text-primary hover:text-white transition-all rounded-xl hover:bg-primary/20 border border-transparent hover:border-primary/30">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center gap-4">
          <span className="font-black text-xl drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]">
            {t.scenarios.toUpperCase()}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10 z-10 relative">
        <div className="glass-card p-12 md:p-16 border-primary/20 text-center mb-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10">
            <h1 className="text-5xl font-black mb-6 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] uppercase tracking-tighter">
              {t.scenarios}
            </h1>
            <p className="text-primary/70 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
              {t.scenarios_desc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SCENARIOS.map(scenario => {
            const Icon = scenario.icon;
            const isUnlocked = checkUnlocked(scenario);
            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario)}
                className={`relative glass-card border-primary/10 p-10 text-left transition-all group flex flex-col h-full overflow-hidden ${
                  isUnlocked 
                    ? 'hover:border-primary/40 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] hover:-translate-y-1' 
                    : 'opacity-50 grayscale'
                }`}
              >
                <div className="absolute inset-0 bg-primary/2 animate-pulse group-hover:bg-primary/5 transition-all" />
                <div className="relative z-10 flex items-center gap-6 mb-8">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] bg-primary/10 border border-primary/30 text-primary`}>
                    {isUnlocked ? <Icon className="w-10 h-10" /> : <Lock className="w-10 h-10 text-primary/40" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-2xl text-primary uppercase transition-colors flex items-center gap-3">
                      {scenario.title[uiLang as keyof typeof scenario.title] || scenario.title.en}
                      {!isPremium && <Lock className="w-5 h-5 text-primary/30" />}
                    </h3>
                    {!isUnlocked && (
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mt-2">
                        <Lock className="w-3.5 h-3.5" />
                        {t.requires_level.replace('{level}', scenario.unlockRequirement.level.toString())}
                      </span>
                    )}
                    {isUnlocked && !isPremium && (
                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2 mt-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t.premium_ai}
                      </span>
                    )}
                  </div>
                </div>
                <p className="relative z-10 text-primary/70 font-medium flex-1 text-lg leading-relaxed">
                  {scenario.desc[uiLang as keyof typeof scenario.desc] || scenario.desc.en}
                </p>
                <div className="relative z-10 mt-10 pt-8 border-t border-primary/10 flex justify-between items-center">
                  <span className="text-primary/40 uppercase tracking-widest text-xs font-black">{t.reward_label}</span>
                  <span className="text-primary bg-primary/10 px-4 py-2 rounded-xl font-black text-sm border border-primary/20 drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.3)]">{t.scenario_reward_text}</span>
                </div>
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <span className={`bg-primary text-black text-xs font-black px-5 py-3 rounded-xl uppercase tracking-widest shadow-xl shadow-primary/30`}>
                    {!isUnlocked ? (t.locked_caps || 'LOCKED') : (isPremium ? t.start_btn : t.buy_btn)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {!isPremium && (
          <div className="mt-12">
            <AdBanner position="bottom" />
          </div>
        )}
      </main>
    </div>
  );
}
