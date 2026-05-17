import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import Markdown from 'react-markdown';
import { useStore } from '../store/useStore';
import { useT } from '../lib/i18n';
import { UI_TRANSLATIONS } from '../data/translations';
import SEO from '../components/SEO';
import { Bot, Cpu, Database, Activity, Send, RefreshCw, User, Mic, MicOff, Volume2, Lock, Sparkles, Keyboard, Loader2, History, Plus, Trash2, MessageSquare, ChevronLeft, Menu, CloudOff } from 'lucide-react';
import { AdBanner } from '../components/AdBanner';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

import { TerminalLoader } from '../components/TerminalLoader';
import { transcribeAudio } from '../services/geminiService';
import { audioService, SoundEffect } from '../services/audioService';
import { handleAppError } from '../lib/errors';
import { isSpeechRecognitionSupported, startSpeechRecognition } from '../utils/speech';

const SPECIAL_CHARS: Record<string, string[]> = {
  sr: ['ђ', 'ј', 'љ', 'њ', 'ћ', 'џ', 'ш', 'ч', 'ж'],
  es: ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'],
  fr: ['à', 'â', 'æ', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü'],
  de: ['ä', 'ö', 'ü', 'ß'],
  it: ['à', 'è', 'é', 'ì', 'í', 'ò', 'ó', 'ù', 'ú'],
  ru: ['ё', 'ъ', 'ь', 'э', 'ы'],
};

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  options?: string[];
}

interface AIChatProps {
  scenarioState?: { scenario?: string, prompt?: string, title?: string } | null;
}

export default function AIChat({ scenarioState: propsScenarioState }: AIChatProps = {}) {
  const uiLang = useStore(state => state.uiLang);
  const targetLang = useStore(state => state.targetLang);
  const displayName = useStore(state => state.displayName);
  const updateSpecial = useStore(state => state.updateSpecial);
  const addXp = useStore(state => state.addXp);
  const addCredits = useStore(state => state.addCredits);
  const addCaps = addCredits; // Keep for minimal changes in rest of file
  const takeDamage = useStore(state => state.takeDamage);
  const useEnergy = useStore(state => state.useEnergy);
  const isPremium = useStore(state => state.isPremium);
  const buyPremium = useStore(state => state.buyPremium);
  const isOnline = useStore(state => state.isOnline);
  const addNotification = useStore(state => state.addNotification);
  const chatMetrics = useStore(state => state.chatMetrics);
  const recordChatMessage = useStore(state => state.recordChatMessage);
  const chatSessions = useStore(state => state.chatSessions);
  const currentSessionId = useStore(state => state.currentSessionId);
  const addChatMessage = useStore(state => state.addChatMessage);
  const createNewChatSession = useStore(state => state.createNewChatSession);
  const deleteChatSession = useStore(state => state.deleteChatSession);
  const updateChatSession = useStore(state => state.updateChatSession);
  const setCurrentSessionId = useStore(state => state.setCurrentSessionId);
  const t = useT();
  const location = useLocation();
  const scenarioState = propsScenarioState || (location.state as { scenario?: string, prompt?: string, title?: string } | null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      const session = chatSessions.find(s => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
        // If it's a new session with no messages, add greeting
        if (session.messages.length === 0) {
          const greeting: Message = {
            id: '1',
            role: 'model',
            content: scenarioState?.prompt ? `[SCENARIO INITIATED: ${scenarioState.title}]\n\n${t.ai_greeting}` : t.ai_greeting,
            timestamp: new Date().toISOString()
          };
          setMessages([greeting]);
          addChatMessage(currentSessionId, greeting);
        }
      }
    } else {
      // If no session, create one
      const title = scenarioState?.title || t.new_conversation || 'Brotherhood Dialogue';
    const id = createNewChatSession(title);
  }
}, [currentSessionId]);

const handleNewChat = () => {
  const title = t.new_conversation || 'Brotherhood Dialogue';
  createNewChatSession(title);
  setIsSidebarOpen(false);
};

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setIsSidebarOpen(false);
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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scenarioCompleted, setScenarioCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = chatSessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
  const recognitionRef = useRef<any>(null);

  const requestPersonalizedTips = async () => {
    if (!isPremium) return;
    if (isLoading) return;
    
    // Gather user data for the prompt
    const state = useStore.getState();
    const xp = state.xp;
    const level = Math.floor(xp / 100) + 1;
    const special = state.special;
    const targetLang = state.targetLang;
    const completedLessons = state.completedLessons.length;
    const mistakesCount = Object.keys(state.mistakes).length;
    
    const prompt = `[SYSTEM REQUEST: MISSION PERFORMANCE ANALYSIS]
Academic Stats:
- Initiate Level: ${level}
- Earned XP: ${xp}
- Target Specialization: ${targetLang}
- Sector Modules Completed: ${completedLessons}
- Active Knowledge Gaps: ${mistakesCount}
- Cognitive Profile: Concentration:${special.S}, Insight:${special.P}, Stamina:${special.E}, Eloquence:${special.C}, Cognition:${special.I}, Speed:${special.A}, Intuition:${special.L}

Based on these parameters, provide 3-4 personalized, data-driven strategy tips for this initiate. The tips should be practical, tactical, and maintain your persona as the Vault Overseer. Focus on how they can achieve mastery in ${targetLang} given their current performance.`;

    await handleSend(undefined, prompt);
  };

  const speak = (text: string, id: string) => {
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
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(id);
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Boot sequence animation
    const sequence = [
      "LINGUA AI UNIFIED OPERATING SYSTEM",
      "COPYRIGHT 2026 LINGUA AI INC.",
      "-Server 1-",
      "Initializing AI Tutor Module...",
      "Loading linguistic databases...",
      "Establishing neural link...",
      "Connection established."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      setBootSequence(prev => [...prev, sequence[i]]);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => setIsBooting(false), 500);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for MediaRecorder support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // MediaRecorder is supported
    } else {
      console.warn('MediaRecorder not supported');
    }
  }, []);

  const startRecording = async () => {
    if (isSpeechRecognitionSupported()) {
      const recognition = startSpeechRecognition({
        lang: targetLang === 'en' ? 'en-US' : 
              targetLang === 'ru' ? 'ru-RU' :
              targetLang === 'es' ? 'es-ES' :
              targetLang === 'fr' ? 'fr-FR' :
              targetLang === 'de' ? 'de-DE' :
              targetLang === 'it' ? 'it-IT' :
              targetLang === 'ja' ? 'ja-JP' :
              targetLang === 'zh' ? 'zh-CN' :
              targetLang === 'sr' ? 'sr-RS' : targetLang,
        onStart: () => {
          setIsListening(true);
        },
        onResult: (transcript, isFinal) => {
          setInput(transcript);
          if (isFinal) {
            handleSend(undefined, transcript);
          }
        },
        onEnd: () => {
          setIsListening(false);
        },
        onError: (err) => {
          console.error('Speech recognition error:', err);
          setIsListening(false);
          addNotification('Speech recognition failed. Falling back to recording.', 'warning');
          startFallbackRecording();
        }
      });
      recognitionRef.current = recognition;
    } else {
      startFallbackRecording();
    }
  };

  const startFallbackRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleVoiceRecording(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      addNotification('Microphone access denied or not available.', 'error');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const transcription = await transcribeAudio(base64Audio, 'audio/webm', targetLang);
      
      if (transcription && transcription.trim()) {
        setInput(transcription);
        // Automatically send if it's a clear transcription
        setTimeout(() => handleSend(undefined, transcription), 500);
      } else {
        addNotification('Could not understand the audio. Please try again.', 'warning');
      }
    } catch (err) {
      handleAppError(err, addNotification);
    } finally {
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        
        let systemInstruction = `You are The Overseer, the absolute authority of the Brotherhood. Your primary goal is to ensure the linguistic competence of all initiates.
You must act as an expert linguist, providing clear explanations, correcting mistakes firmly but fairly, and offering practical language exercises. 
- If the user asks for a translation, provide it along with pronunciation and context.
- GRAMMAR & VOCABULARY: If the user makes a grammatical or vocabulary mistake, you MUST provide an in-depth explanation of the underlying rules in ${uiLang}. Do not just identify the mistake. Explain exactly why it is wrong, provide the correct translation, and offer 2-3 alternative correct phrasings.
- Focus heavily on pronunciation. If the user asks about pronunciation, provides phonetic spellings, or makes phonetic mistakes, provide detailed feedback on their pronunciation errors.
- SUGGESTED REPLIES: For EVERY response, you MUST provide 3-4 potential replies for the user in the target language (${targetLang}) in the 'options' field. These should vary in complexity and tone (e.g., one simple, one detailed, one questioning).
- Speak with a professional, slightly cold, but ultimately supportive tone. Refer to the user as "initiate" or "member".`;
        
        if (scenarioState?.prompt) {
          systemInstruction = `${scenarioState.prompt}
          
Additionally, focus heavily on pronunciation, grammar, and vocabulary. If the user makes a grammatical or vocabulary mistake, you MUST provide an in-depth explanation of the underlying rules in ${uiLang}, explain exactly why it is wrong, and offer 2-3 alternative correct phrasings.
- SUGGESTED REPLIES: For EVERY response, you MUST provide 3-4 potential replies for the user in the target language (${targetLang}) in the 'options' field.`;
        }

        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          history: messages.length > 0 ? messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          })) : [],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                message: {
                  type: Type.STRING,
                  description: 'The text message to display to the user.'
                },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING
                  },
                  description: 'Required. A list of 3-4 potential replies or choices for the user to select from in the target language.'
                },
                progress: {
                  type: Type.NUMBER,
                  description: 'Optional. The completion percentage of the current scenario (0-100).'
                },
                feedback: {
                  type: Type.STRING,
                  description: 'Optional. If the user made a mistake, provide the correction and explanation here.'
                }
              },
              required: ['message']
            },
            tools: [{ googleSearch: {} }]
          }
        });
      }
    } catch (err) {
      handleAppError(err, addNotification);
    }
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    if (!isPremium) return;
    
    if (!isOnline) {
      addNotification(t.offline_ai_warning, 'warning');
      return;
    }

    const msgToSend = overrideInput || input.trim();
    if (!msgToSend || isLoading || !currentSessionId) return;

    const userMsg = msgToSend;
    setInput('');

    // Update session title if it's new
    if (messages.length <= 1 && messages[0]?.role === 'model' && currentSessionId) {
      const session = chatSessions.find(s => s.id === currentSessionId);
      if (session && (session.title === (t.new_conversation || 'New Conversation') || session.title === (t.overseer_ai || 'AI Tutor'))) {
        const newTitle = userMsg.length > 40 ? userMsg.substring(0, 37) + '...' : userMsg;
        updateChatSession(currentSessionId, { title: newTitle });
      }
    }

    const timestamp = new Date().toISOString();
    const userMsgObj: Message = { id: Date.now().toString(), role: 'user', content: userMsg, timestamp };
    setMessages(prev => [...prev, userMsgObj]);
    addChatMessage(currentSessionId, userMsgObj);
    useEnergy('chat');
    setIsLoading(true);

    // Calculate performance metrics for dynamic difficulty
    const accuracy = chatMetrics.totalMessages > 0 
      ? Math.max(0, 1 - (chatMetrics.feedbackCount / chatMetrics.totalMessages))
      : 1;
    const speedSeconds = chatMetrics.totalMessages > 0
      ? (chatMetrics.totalResponseTime / chatMetrics.totalMessages) / 1000
      : 5;

    const performanceMeta = `[DYNAMIC DIFFICULTY ADAPTATION: Accuracy ${(accuracy * 100).toFixed(0)}%, Speed ${speedSeconds.toFixed(1)}s. ${accuracy > 0.8 && speedSeconds < 10 ? "Status: EXCELING. Increase complexity and colloquialisms." : "Status: STRUGGLING. Simplify sentences and grammar hints."}]`;

    const finalUserMsg = overrideInput?.includes('[SYSTEM REQUEST') ? userMsg : `${performanceMeta}\n${userMsg}`;

    try {
      if (!chatRef.current) {
        throw new Error('Chat session not initialized. Missing API key?');
      }
      const response = await chatRef.current.sendMessage({ message: finalUserMsg });
      let parsedResponse = { message: 'ERROR: INVALID RESPONSE FORMAT.', options: undefined, progress: undefined as number | undefined, feedback: undefined as string | undefined };
      try {
        if (response.text) {
          parsedResponse = JSON.parse(response.text);
        }
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
      }

      if (parsedResponse.feedback) {
        takeDamage(5);
      }

      if (parsedResponse.progress !== undefined) {
        setProgress(parsedResponse.progress);
      } else if (scenarioState?.scenario && !scenarioCompleted) {
        setProgress(prev => Math.min(prev + 10, 90));
      }

      let finalMessage = parsedResponse.message;
      if (parsedResponse.feedback) {
        finalMessage = parsedResponse.feedback + "\n\n" + finalMessage;
      }
      
      // Record analytics
      recordChatMessage(!!parsedResponse.feedback);

      // Check for success trigger
      if (finalMessage.includes('[SUCCESS]') && !scenarioCompleted && scenarioState?.scenario) {
        setScenarioCompleted(true);
        setProgress(100);
        finalMessage = finalMessage.replace('[SUCCESS]', '\n\n*** SCENARIO COMPLETED SUCCESSFULLY ***\nREWARDS GRANTED: +1 CHARISMA, +50 XP, +20 CREDITS');
        updateSpecial('C', 1);
        addXp(50);
        addCaps(20);
      }

      addXp(5); // Reward for each exchange

      const modelMsgId = (Date.now() + 1).toString();
      const modelMsg: Message = {
        id: modelMsgId,
        role: 'model',
        content: finalMessage,
        timestamp: new Date().toISOString(),
        options: parsedResponse.options
      };
      
      setMessages(prev => [...prev, modelMsg]);
      addChatMessage(currentSessionId, modelMsg);

      if (autoSpeak) {
        speak(finalMessage, modelMsgId);
      }
    } catch (error) {
      handleAppError(error, addNotification);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: t.ai_error,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <SEO 
          title={`${t.overseer_ai} - Premium Required`} 
          description="Upgrade to premium to access advanced AI features."
        />
        
        <div className="bg-white dark:bg-slate-800 rounded-[40px] border-2 border-slate-200 dark:border-slate-700 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Background elements */}
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
    <div className="flex h-[calc(100vh-8rem)] gap-8 relative font-sans">
      {/* Sidebar for History */}
      <AnimatePresence>
        {(isSidebarOpen || isLargeScreen) && (
          <motion.div 
            initial={isLargeScreen ? false : { opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className={`fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border shadow-2xl lg:relative lg:shadow-none lg:z-0 lg:flex rounded-[2.5rem] overflow-hidden flex-col h-full transition-all`}
          >
            <div className="p-8 border-b border-border flex items-center justify-between bg-muted/50">
              <h2 className="font-bold text-lg flex items-center gap-3 uppercase tracking-tight text-slate-900 dark:text-white">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <History className="w-5 h-5 text-indigo-500" />
                </div>
                {t.history}
              </h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder={t.search_sessions || "Search Archives..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-10 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                {t.new_chat}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3 custom-scrollbar">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-16 opacity-30">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">{t.no_history || 'NO ARCHIVED SESSIONS'}</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div 
                    key={session.id}
                    className={`group relative rounded-2xl transition-all cursor-pointer border ${
                      currentSessionId === session.id 
                        ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 shadow-lg shadow-primary/5' 
                        : 'bg-card border-border hover:border-primary/20 hover:bg-muted/50 shadow-sm'
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <div className="p-5 pr-10">
                      {editingSessionId === session.id ? (
                        <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="text"
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            onBlur={handleRename}
                            className="flex-1 bg-white dark:bg-slate-900 border border-primary/30 rounded px-2 py-1 text-xs font-bold font-sans tracking-tight text-slate-900 dark:text-white outline-none"
                          />
                        </div>
                      ) : (
                        <h3 className={`text-sm font-bold tracking-tight uppercase truncate ${currentSessionId === session.id ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                          {session.title}
                        </h3>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {formatTimestamp(session.timestamp)}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           {session.messages.length} <MessageSquare className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleStartRename(e, session.id, session.title)}
                        className="p-1.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-primary rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm transition-all"
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
                        className="p-1.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm transition-all"
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

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && !isLargeScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-card rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-border relative overflow-hidden transition-all group">
        <SEO 
          title={scenarioState?.title || 'AI Tutor'} 
          description="Practice your language skills with an AI tutor."
        />
        
        {/* Header */}
        <div className="p-8 border-b border-border flex items-center justify-between relative z-10 bg-card/80 backdrop-blur-xl">
          <div className="flex items-center gap-6 relative z-10">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-slate-100 dark:border-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm relative shrink-0">
               <Cpu className="w-8 h-8 text-primary" />
               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 animate-pulse shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  {t.overseer_ai || 'OVERSEER INTERFACE'}
                </h1>
                {scenarioState?.title && (
                  <span className="text-[9px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 font-bold px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 uppercase tracking-widest shadow-sm">
                    {scenarioState.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-emerald-500" />
                   {t.encryption_active || 'SECURE DATA CHANNEL'}
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <span>BROTHERHOOD VERSION 4.2.1-SECURE</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 relative z-10">
            <button
              onClick={() => { audioService.play(SoundEffect.CLICK); setAutoSpeak(!autoSpeak); }}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border font-bold uppercase text-[10px] tracking-widest transition-all shadow-sm ${
                autoSpeak 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'bg-background text-slate-500 border-border hover:border-primary/20'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${autoSpeak ? 'animate-pulse' : ''}`} />
              {autoSpeak ? t.auto_speak_on : t.auto_speak_off}
            </button>

            <button
              onClick={() => {
                // Since sessions are already saved, this is an explicit "sync/verify" save
                audioService.play(SoundEffect.CLICK);
                addNotification(t.encounter_archived || 'Session archived successfully.', 'success');
              }}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 font-bold uppercase text-[10px] tracking-widest hover:text-primary hover:border-primary/20 transition-all shadow-sm"
            >
              <History className="w-4 h-4" />
              {t.save_session || 'Archive'}
            </button>
            
            {isPremium && (
              <button
                onClick={requestPersonalizedTips}
                disabled={isLoading}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border bg-amber-500 text-white border-amber-400 font-bold uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                <Sparkles className="w-4 h-4" />
                {t.get_tips}
              </button>
            )}

            <div className="hidden xl:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 text-[9px] font-bold text-slate-400 tracking-widest"><Cpu className="w-4 h-4" /> SYS.OK</div>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-bold tracking-widest transition-all shadow-sm ${
                isOnline 
                  ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/40' 
                  : 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/40'
              }`}>
                <Activity className={`w-4 h-4 ${isOnline ? 'animate-pulse' : ''}`} /> 
                {isOnline ? 'NET.ON' : 'NET.OFF'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Area */}
        {scenarioState?.scenario && !isBooting && (
          <div className="px-8 pt-8 relative z-10">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 relative shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <Activity className={`w-4 h-4 ${scenarioCompleted ? 'text-emerald-500' : 'text-primary'}`} />
                  {t.scenario_progress || 'SCENARIO MASTER LEVEL'}
                </span>
                <div className="bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm flex items-center gap-2">
                   {progress}% <span className="text-slate-300">COMPLETE</span>
                </div>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full rounded-full shadow-lg ${
                    scenarioCompleted 
                      ? 'bg-emerald-500' 
                      : 'bg-primary'
                  } transition-all duration-1000`}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto px-8 py-10 relative z-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-10">
            {isBooting ? (
              <div className="space-y-2 font-mono text-xs text-slate-400 dark:text-slate-500 pt-10">
                {bootSequence.map((line, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4"
                  >
                    <span className="text-slate-300">[{idx.toString().padStart(2, '0')}]</span>
                    <span>{line}</span>
                  </motion.div>
                ))}
                <div className="animate-pulse pl-12 text-primary">_</div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="mb-12 text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700 text-center flex flex-col items-center gap-4">
                  <div className="w-px h-12 bg-gradient-to-b from-transparent to-slate-200 dark:to-slate-800" />
                  ACADEMIC YEAR: {new Date().toLocaleDateString()}
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                </div>

                {!isOnline && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 bg-amber-50 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30 rounded-[2rem] p-8 flex items-start gap-6 shadow-lg shadow-amber-500/5"
                  >
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 shadow-sm">
                       <CloudOff className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight mb-2">
                        {t.offline_chat_title || 'Communication Lost'}
                      </h3>
                      <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-bold uppercase tracking-widest leading-relaxed">
                        {t.offline_chat_desc || 'Deep-space communication is currently offline. AI services require a network connection.'}
                      </p>
                    </div>
                  </motion.div>
                )}
                
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group/msg`}
                    >
                      <div className={`max-w-[90%] md:max-w-[75%] flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                         <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg border relative group cursor-pointer ${
                           msg.role === 'user' 
                             ? 'bg-primary text-white border-primary shadow-primary/20' 
                             : 'bg-card text-foreground border-border'
                         }`}>
                           {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                           {msg.role === 'model' && (
                             <button 
                               onClick={() => speak(msg.content, msg.id)}
                               className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-xl border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                             >
                                <Volume2 className="w-3.5 h-3.5" />
                             </button>
                           )}
                         </div>
                         
                         <div className={`space-y-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`rounded-[2rem] p-8 shadow-xl border leading-relaxed transition-all relative ${
                              msg.role === 'user'
                                ? 'bg-primary/5 border-primary/20 rounded-tr-none text-slate-800 dark:text-slate-200'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-tl-none shadow-indigo-500/5'
                            }`}>
                               <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-p:font-medium prose-p:leading-relaxed prose-p:text-sm">
                          <div className="markdown-body text-sm leading-relaxed">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                               </div>

                               {msg.role === 'model' && msg.options && msg.options.length > 0 && (
                                 <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 space-y-3">
                                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {t.suggested_replies || 'BROTHERHOOD SUGGESTIONS'}
                                   </div>
                                   <div className="flex flex-wrap gap-3">
                                      {msg.options.map((option, i) => (
                                        <button
                                          key={i}
                                          onClick={() => !isLoading && handleSend(undefined, option)}
                                          disabled={isLoading}
                                          className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-5 py-3 rounded-2xl transition-all active:scale-95 text-left max-w-xs md:max-w-md uppercase tracking-tight"
                                        >
                                          {option}
                                        </button>
                                      ))}
                                   </div>
                                 </div>
                               )}
                            </div>
                            <div className={`flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest transition-opacity mb-2 px-2 ${msg.role === 'user' ? 'flex-row-reverse text-slate-400' : 'text-slate-400'}`}>
                               <span>{msg.role === 'user' ? (displayName || 'STUDENT') : (t.overseer_ai || 'DEAN AI')}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-200" />
                               <span>{formatTimestamp(msg.timestamp)}</span>
                               {msg.role === 'model' && isSpeaking === msg.id && (
                                 <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            <div ref={messagesEndRef} className="h-20" />
          </div>
        </div>

        {/* Input Dock */}
        <div className="p-10 relative z-20 bg-card border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-6 items-end">
              <div className="relative group shrink-0">
                 <button 
                  onClick={() => { audioService.play(SoundEffect.CLICK); setIsListening(true); startRecording(); }}
                  disabled={isLoading || isListening}
                  className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all shadow-lg active:scale-90 ${
                    isListening 
                      ? 'bg-rose-500 border-rose-400 text-white animate-pulse shadow-rose-500/20' 
                      : 'bg-muted border-border text-slate-400 hover:border-primary/40 hover:text-primary'
                  }`}
                 >
                   {isListening ? <div className="flex items-center gap-1.5"><Mic className="w-8 h-8" /></div> : <Mic className="w-8 h-8" />}
                 </button>
                 <div className="absolute -top-3 -right-3 text-[8px] font-bold text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm uppercase tracking-widest">{t.voice_input || 'VOICE'}</div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={t.type_message || 'ENUNCIATE YOUR ACADEMIC INQUIRY...'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isLoading}
                    className="w-full bg-muted border border-border rounded-[2rem] py-6 pl-10 pr-24 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold uppercase tracking-widest text-[10px] shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 text-foreground"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                    <button className="text-slate-300 hover:text-primary transition-colors">
                      <Keyboard className="w-6 h-6" onClick={() => setIsKeyboardOpen(!isKeyboardOpen)} />
                    </button>
                    <button 
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className={`p-3 rounded-2xl transition-all active:scale-95 ${
                        isLoading || !input.trim()
                          ? 'text-slate-200 dark:text-slate-700'
                          : 'text-primary'
                      }`}
                    >
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
                
                {/* Special Characters Support */}
                {SPECIAL_CHARS[targetLang] && (
                  <div className="flex flex-wrap gap-2 px-2">
                    {SPECIAL_CHARS[targetLang].map(char => (
                      <button
                        key={char}
                        onClick={() => { audioService.play(SoundEffect.CLICK); setInput(prev => prev + char); }}
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-xs font-bold font-mono hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-center text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-8 flex items-center justify-center gap-4">
               <div className="w-12 h-px bg-slate-100 dark:bg-slate-800" />
               BROTHERHOOD LINGUISTICS INTERFACE — SECURED BY LINGUA CRYPTOGRAPHY
               <div className="w-12 h-px bg-slate-100 dark:bg-slate-800" />
            </p>
          </div>
        </div>
      </div>

      {isListening && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex flex-col items-center justify-center"
        >
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-16 flex flex-col items-center text-center shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 max-w-lg mx-auto transform translate-y-[-10%] relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
              
              <div className="relative mb-12">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }} 
                  className="w-40 h-40 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 relative z-10"
                >
                  <Mic className="w-16 h-16" />
                </motion.div>
                <div className="absolute inset-0 animate-ping bg-rose-500/20 rounded-full" />
                <div className="absolute inset-[-20px] animate-ping bg-rose-500/10 rounded-full [animation-delay:0.5s]" />
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{t.listening || 'LISTENING...'}</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-12 leading-relaxed">
                {t.listening_desc || 'THE BROTHERHOOD IS PROCESSING YOUR PHONETIC OUTPUT. ENUNCIATE CLEARLY.'}
              </p>

              <div className="flex gap-6">
                <button 
                  onClick={() => { audioService.play(SoundEffect.CLICK); stopRecording(); }}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-10 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xl active:scale-95"
                >
                  {t.cancel || 'ABORT'}
                </button>
                <button 
                  onClick={() => { audioService.play(SoundEffect.CLICK); stopRecording(); }}
                  className="bg-rose-500 text-white border-2 border-rose-400 px-10 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all shadow-[0_15px_30px_rgba(244,63,94,0.3)] active:scale-95"
                >
                  {t.finish || 'PROCESS VOICE'}
                </button>
              </div>
           </div>
        </motion.div>
      )}

      {isKeyboardOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[110] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-8 shadow-[0_-30px_100px_rgba(0,0,0,0.1)] backdrop-blur-xl">
           <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                 <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-3">
                    <Keyboard className="w-5 h-5" />
                    BROTHERHOOD CHARACTER INPUT VIRTUAL INTERFACE
                 </h4>
                 <button onClick={() => setIsKeyboardOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                    <ChevronLeft className="w-6 h-6 rotate-270" />
                 </button>
              </div>
              <VirtualKeyboard 
                onInput={(char) => setInput(prev => prev + char)} 
                onDelete={() => setInput(prev => prev.slice(0, -1))}
                onClose={() => setIsKeyboardOpen(false)}
              />
           </div>
        </div>
      )}
    </div>
  );
}
