import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Trash2, 
  MessageSquare, 
  Info, 
  Languages, 
  Sparkles, 
  MapPin, 
  Coffee, 
  ShoppingBag, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  Lock, 
  Keyboard as KeyboardIcon,
  History,
  Plus,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { AdBanner } from '../components/AdBanner';
import { useStore } from '../store/useStore';
import { UI_TRANSLATIONS } from '../data/translations';
import { fetchConversationResponse, ConversationResponse } from '../services/geminiService';
import SEO from '../components/SEO';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

const SPECIAL_CHARS: Record<string, string[]> = {
  sr: ['ђ', 'ј', 'љ', 'њ', 'ћ', 'џ', 'ш', 'ч', 'ж'],
  es: ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'],
  fr: ['à', 'â', 'æ', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü'],
  de: ['ä', 'ö', 'ü', 'ß'],
  it: ['à', 'è', 'é', 'ì', 'í', 'ò', 'ó', 'ù', 'ú'],
  ru: ['ё', 'ъ', 'ь', 'э', 'ы'],
};

const Conversation: React.FC = () => {
  const { 
    uiLang, 
    targetLang, 
    chatSessions,
    currentSessionId,
    addChatMessage,
    setCurrentSessionId,
    deleteChatSession,
    createNewChatSession,
    updateChatSession,
    addNotification,
    addXp,
    addCredits: addCaps,
    updateSpecial,
    takeDamage,
    useEnergy,
    isPremium,
    buyPremium,
    lessonContext,
    recordChatMessage,
    chatMetrics
  } = useStore();
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastResponse, setLastResponse] = useState<ConversationResponse | null>(null);
  const [scenario, setScenario] = useState('A friendly conversation in a post-apocalyptic wasteland');
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.en;

  const handleStartRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setRenameValue(currentTitle);
  };

  const handleRename = () => {
    if (editingSessionId && renameValue.trim()) {
      updateChatSession(editingSessionId, { title: renameValue.trim() });
      addNotification(t.session_renamed || 'Session renamed successfully.', 'success');
      setEditingSessionId(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const options: Intl.DateTimeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      };
      
      if (isToday) {
        return date.toLocaleTimeString([], options);
      }
      
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], options)}`;
    } catch {
      return timestamp;
    }
  };

  const speak = (text: string, idx: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langMap: Record<string, string> = {
        en: 'en-US',
        ru: 'ru-RU',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        ja: 'ja-JP',
        zh: 'zh-CN',
        sr: 'sr-RS'
      };
      
      utterance.lang = langMap[targetLang] || 'en-US';
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsSpeaking(idx);
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const conversationHistory = currentSession?.messages.map(m => ({ role: m.role, text: m.content, timestamp: m.timestamp })) || [];

  const scenarios = [
    { id: 'general', label: t.scenario_general || 'General Chat', icon: <MessageSquare className="w-4 h-4" />, prompt: 'A friendly conversation in a post-apocalyptic wasteland' },
    { id: 'trading', label: t.scenario_trading || 'Trading Post', icon: <ShoppingBag className="w-4 h-4" />, prompt: 'Negotiating for supplies at a wasteland trading post' },
    { id: 'survival', label: t.scenario_survival || 'Survival Tips', icon: <ShieldAlert className="w-4 h-4" />, prompt: 'Discussing survival strategies and dangerous areas' },
    { id: 'diner', label: t.scenario_diner || 'Broken Diner', icon: <Coffee className="w-4 h-4" />, prompt: 'Ordering food and hearing rumors at a dusty roadside diner' },
    { id: 'exploration', label: t.scenario_exploration || 'Exploration', icon: <MapPin className="w-4 h-4" />, prompt: 'Planning an expedition to a ruined city' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [conversationHistory, isTyping]);

  useEffect(() => {
    if (!currentSessionId && chatSessions.length > 0) {
      setCurrentSessionId(chatSessions[0].id);
    }
  }, [currentSessionId, chatSessions, setCurrentSessionId]);

  const handleSend = async (overrideInput?: string) => {
    if (!isPremium) return;
    const msgToSend = overrideInput || input.trim();
    if (!msgToSend || isTyping || !currentSessionId) return;

    if (conversationHistory.length === 0 && currentSessionId) {
      const newTitle = msgToSend.length > 30 ? msgToSend.substring(0, 27) + '...' : msgToSend;
      updateChatSession(currentSessionId, { title: newTitle });
    }

    setInput('');
    const timestamp = new Date().toISOString();
    addChatMessage(currentSessionId, {
      id: Date.now().toString(),
      role: 'user',
      content: msgToSend,
      timestamp
    });
    useEnergy('chat');
    setIsTyping(true);

    try {
      const accuracy = chatMetrics.totalMessages > 0 
        ? Math.max(0, 1 - (chatMetrics.feedbackCount / chatMetrics.totalMessages))
        : 1;
      const speedSeconds = chatMetrics.totalMessages > 0
        ? (chatMetrics.totalResponseTime / chatMetrics.totalMessages) / 1000
        : 5;

      const response = await fetchConversationResponse(
        [...conversationHistory, { role: 'user', text: msgToSend }],
        targetLang,
        uiLang,
        scenario,
        lessonContext,
        { accuracy, speedSeconds }
      );

      if (response) {
        addChatMessage(currentSessionId, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: response.text,
          timestamp: new Date().toISOString()
        });
        recordChatMessage(!!response.feedback);
        setLastResponse(response);
        addXp(5);

        if (response.feedback) {
          takeDamage(5);
        }

        if (response.text.includes('[SUCCESS]')) {
          updateSpecial('C', 1);
          addXp(50);
          addCaps(20);
          addNotification('Scenario Success! +1 Charisma, +50 XP, +20 Credits', 'success');
        }
      } else {
        addNotification('Could not connect to the AI Tutor.', 'error');
      }
    } catch (error) {
      console.error('Conversation error:', error);
      addNotification('An error occurred during the conversation.', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleNewChat = () => {
    const title = t.new_conversation || 'Wasteland Dialogue';
    const id = createNewChatSession(title);
    setCurrentSessionId(id);
    setLastResponse(null);
    setIsHistoryOpen(false);
  };

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <SEO 
          title={`${t.tutor_ai} - Premium Required`} 
          description="Upgrade to premium to access advanced AI features."
        />
        
        <div className="bg-white dark:bg-slate-800 rounded-[40px] border-2 border-slate-200 dark:border-slate-700 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 shadow-inner">
              <Lock className="w-12 h-12" />
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              {t.premium_only_ai}
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mb-10 leading-relaxed">
              {t.premium_only_ai_desc}
            </p>
            
            <button
              onClick={buyPremium}
              className="group relative inline-flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Sparkles className="w-6 h-6" />
              {t.unlock_ai}
            </button>
            
            <div className="mt-12 w-full max-w-md">
              <AdBanner position="inline" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] max-w-6xl mx-auto gap-6">
      {/* History Sidebar (Desktop) */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                {t.history || 'History'}
              </h2>
              <button 
                onClick={handleNewChat}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {chatSessions.length === 0 ? (
                <div className="text-center py-12 opacity-30">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">{t.no_history || 'No History'}</p>
                </div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setCurrentSessionId(session.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border group relative ${
                      currentSessionId === session.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {editingSessionId === session.id ? (
                      <input 
                        type="text"
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        className="w-full bg-white dark:bg-slate-900 border border-indigo-300 rounded px-2 py-1 text-xs font-bold font-sans outline-none mb-1 text-slate-900 dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className={`text-sm font-bold truncate pr-12 ${currentSessionId === session.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {session.title}
                      </h3>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">{formatTimestamp(session.timestamp)}</p>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => handleStartRename(e, session.id, session.title)}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this session?')) {
                            deleteChatSession(session.id);
                          }
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  {t.history || 'History'}
                </h2>
                <button onClick={() => setIsHistoryOpen(false)}>
                   <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                 <button
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  {t.new_chat || 'New Chat'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => { setCurrentSessionId(session.id); setIsHistoryOpen(false); }}
                    className={`p-4 rounded-2xl cursor-pointer border ${
                      currentSessionId === session.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200'
                        : 'border-transparent'
                    }`}
                  >
                    <h3 className="text-sm font-bold truncate">{session.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">{formatTimestamp(session.timestamp)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <SEO 
          title={t.tutor_ai || 'AI Tutor'} 
          description="Practice your language skills with an AI tutor."
        />

        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isHistoryOpen 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600'
                }`}
                title="Toggle History"
              >
                <History className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <ShieldCheck className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{t.tutor_ai || 'The Elder'}</h1>
                  <p className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase tracking-widest">{t.ai_tutor_desc || 'Wasteland Mentor'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  addNotification(t.encounter_archived || 'Session archived successfully.', 'success');
                }}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs hover:text-indigo-600 hover:border-indigo-500/50 transition-all shadow-sm active:scale-95"
              >
                <History className="w-4 h-4" />
                {t.save_session || 'Archive'}
              </button>
              <button
                onClick={handleNewChat}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {t.new_chat || 'New Chat'}
              </button>
              <button
                onClick={() => {
                  if (currentSessionId) deleteChatSession(currentSessionId);
                  setLastResponse(null);
                }}
                className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                title="Clear Current Session"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setScenario(s.prompt);
                  if (currentSessionId) deleteChatSession(currentSessionId);
                  addNotification(`${t.scenario_changed || 'Scenario changed to'}: ${s.label}`, 'info');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  scenario === s.prompt
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-500/50'
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {conversationHistory.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-indigo-500" />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {t.start_conversation || 'Start a conversation'}
                    </p>
                    <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">
                      {t.conversation_desc || `Practice your skills. The AI will provide feedback.`}
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {conversationHistory.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-indigo-100 dark:bg-indigo-900/50'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-slate-500" /> : <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <motion.div 
                        layout
                        className={`p-4 rounded-2xl shadow-sm relative group ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <button
                          onClick={() => speak(msg.text, idx)}
                          className={`absolute -top-2 ${msg.role === 'user' ? '-left-2' : '-right-2'} p-1.5 rounded-lg transition-all shadow-sm ${
                            isSpeaking === idx
                              ? 'bg-indigo-500 text-white scale-110'
                              : 'bg-white dark:bg-slate-700 text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isSpeaking === idx ? 'animate-pulse' : ''}`} />
                        </button>
                      </motion.div>
                      <motion.span 
                        layout
                        className="text-[10px] text-slate-400 dark:text-slate-500 font-mono px-1"
                      >
                        {formatTimestamp(msg.timestamp)}
                      </motion.span>
                    </div>
                  </motion.div>
                ))}

                {!isTyping && conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'model' && lastResponse?.suggestedNextSteps && lastResponse.suggestedNextSteps.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 ml-11 mt-2 mb-4"
                  >
                    {lastResponse.suggestedNextSteps.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 font-medium text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-end gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-bl-none shadow-sm">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
              <AnimatePresence>
                {isKeyboardOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <VirtualKeyboard
                      language={targetLang}
                      onInput={(char) => setInput(prev => prev + char)}
                      onDelete={() => setInput(prev => prev.slice(0, -1))}
                      onEnter={handleSend}
                      onClose={() => setIsKeyboardOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.ai_placeholder || "Type your message..."}
                  disabled={isTyping}
                  className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 pr-24 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm disabled:opacity-50"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                    className={`p-2.5 rounded-xl transition-all ${
                      isKeyboardOpen 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600'
                    }`}
                    title="Toggle Keyboard"
                  >
                    <KeyboardIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                {t.learning_insight || 'Learning Insight'}
              </h2>

              {!lastResponse && !isTyping && (
                <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <Info className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-xs font-medium text-slate-400">
                    {t.send_message_feedback || 'Send a message to get feedback.'}
                  </p>
                </div>
              )}

              {isTyping && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
              )}

              {lastResponse && !isTyping && (
                <div className="space-y-6">
                  {lastResponse.feedback && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4" />
                        {t.feedback || 'Feedback'}
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                        {lastResponse.feedback}
                      </p>
                    </motion.div>
                  )}

                  {lastResponse.translation && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 p-4 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                        <Languages className="w-4 h-4" />
                        {t.translation || 'Translation'}
                      </div>
                      <p className="text-sm text-indigo-800 dark:text-indigo-200 italic leading-relaxed">
                        {lastResponse.translation}
                      </p>
                    </motion.div>
                  )}

                  {lastResponse.suggestedNextSteps && lastResponse.suggestedNextSteps.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                        <ChevronRight className="w-4 h-4" />
                        {t.next_steps || 'Next Steps'}
                      </div>
                      <div className="flex flex-col gap-2">
                        {lastResponse.suggestedNextSteps.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-left p-3 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-indigo-50 rounded-xl text-slate-600 hover:text-indigo-600 transition-all group flex items-center justify-between shadow-sm"
                          >
                            <span className="line-clamp-2">{suggestion}</span>
                            <Send className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                      <CheckCircle2 className="w-3 h-3" />
                      {t.progress_synced || 'Progress Synced'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
