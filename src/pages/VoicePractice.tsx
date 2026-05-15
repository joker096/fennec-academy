import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, Check, X, ArrowRight, Zap, Shield, Star, Trophy, Info, AlertCircle, Sparkles, Lightbulb, RefreshCw, Play, Database } from 'lucide-react';
import { useStore } from '../store/useStore';
import { WORDS_BY_LANG, Word } from '../data/gameData';
import { playPronunciation } from '../utils/audio';
import { isSpeechRecognitionSupported, startSpeechRecognition } from '../utils/speech';
import { UI_TRANSLATIONS } from '../data/translations';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { fetchPronunciationFeedback, PronunciationFeedback } from '../services/geminiService';
import { handleAppError } from '../lib/errors';

export default function VoicePractice() {
  const navigate = useNavigate();
  const targetLang = useStore(state => state.targetLang);
  const uiLang = useStore(state => state.uiLang);
  const addXp = useStore(state => state.addXp);
  const addCredits = useStore(state => state.addCredits);
  const addCaps = addCredits;
  const addNotification = useStore(state => state.addNotification);
  const updateSpecial = useStore(state => state.updateSpecial);
  const isPremium = useStore(state => state.isPremium);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS['en'];

  useEffect(() => {
    const allWords = WORDS_BY_LANG[targetLang] || [];
    const mistakeBank = useStore.getState().mistakes;
    
    // Filter mistakes for the current target language that haven't been fully repaired
    const langMistakes = Object.values(mistakeBank)
      .filter(m => m.lang === targetLang && m.repairCount < 3)
      .map(m => allWords.find(w => w.id.toString() === m.wordId))
      .filter((w): w is Word => !!w);

    // Combine mistakes with random words, prioritizing mistakes
    let sessionWords = [...langMistakes];
    
    if (sessionWords.length < 10) {
      const remainingCount = 10 - sessionWords.length;
      const otherWords = allWords.filter(w => !langMistakes.some(m => m.id === w.id));
      const randomWords = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, remainingCount);
      sessionWords = [...sessionWords, ...randomWords];
    } else {
      sessionWords = sessionWords.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    setWords(sessionWords);

    if (isSpeechRecognitionSupported()) {
      setIsSpeechSupported(true);
    }
  }, [targetLang, t, addNotification]);

  const currentWord = words[currentIndex];

  const startRecording = async () => {
    if (!isSpeechSupported) {
      addNotification(t.speech_not_supported || 'Speech recognition is not supported in your browser.', 'error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setTranscript('');
      setFeedback(null);
      setAudioUrl(null);
      setStatus('recording');
      
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
        interimResults: true,
        onStart: () => setIsListening(true),
        onResult: (text, isFinal) => {
          setTranscript(text);
        },
        onEnd: () => {
          setIsListening(false);
          // Wait a bit to ensure all onResult events settled
          setTimeout(() => {
            setStatus(currentStatus => {
              if (currentStatus === 'recording') {
                processResult();
                return 'recording'; // processResult will change it
              }
              return currentStatus;
            });
          }, 500);
        },
        onError: (err) => {
          console.error('Speech recognition error:', err);
          setIsListening(false);
          setStatus('idle');
          addNotification(t.speech_error || 'Speech recognition failed', 'error');
        }
      });
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start recording:', err);
      addNotification('Microphone access denied or failed.', 'error');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const processResult = async () => {
    if (!transcript || !currentWord || !isPremium) {
      setStatus('idle');
      return;
    }

    setStatus('processing');
    setIsFetchingFeedback(true);
    
    try {
      const res = await fetchPronunciationFeedback(currentWord.word, transcript, targetLang, uiLang);
      setFeedback(res);
      
      const repairMistake = useStore.getState().repairMistake;
      const addMistake = useStore.getState().addMistake;

      if (res?.isCorrect) {
        setSessionScore(s => s + 1);
        addXp(15);
        addCaps(5);
        addNotification(`+15 XP, +5 Credits`, 'success');
        
        // Repair mistake if it exists
        repairMistake(currentWord.id.toString(), targetLang, true);

        // Chance to increase Charisma on perfect pronunciation
        if (Math.random() < 0.1) {
          updateSpecial('C', 1);
        }
      } else if (res) {
        // If it's a mistake, track it
        addMistake(currentWord.id.toString(), targetLang);
        repairMistake(currentWord.id.toString(), targetLang, false);
      }
    } catch (error) {
      handleAppError(error, addNotification);
    } finally {
      setIsFetchingFeedback(false);
      setStatus('done');
    }
  };

  const handleRetry = () => {
    setTranscript('');
    setFeedback(null);
    setAudioUrl(null);
    setStatus('idle');
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(c => c + 1);
      setTranscript('');
      setFeedback(null);
      setAudioUrl(null);
      setStatus('idle');
    } else {
      const finalXp = sessionScore * 10 + 50;
      addXp(finalXp);
      addNotification(`${t.calibration_complete || 'Voice Calibration Complete!'} +${finalXp} XP`, 'success');
      navigate('/');
    }
  };

  if (words.length === 0) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-mono text-amber-500 relative overflow-hidden">
      <SEO 
        title={t.voice_calibration || 'Voice Calibration'}
        description="Practice your pronunciation with AI feedback."
      />
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20" />
      
      {/* Background patterns */}
      <div className="fixed inset-0 blueprint-grid opacity-[0.05] pointer-events-none z-0" />

      <header className="h-16 flex items-center px-4 max-w-4xl mx-auto w-full gap-4 border-b border-amber-500/20 z-10 relative bg-slate-900 shadow-lg shadow-amber-500/5">
        <button onClick={() => navigate('/')} className="p-2 text-amber-500/50 hover:text-amber-500 transition-colors rounded-full hover:bg-amber-500/10">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 text-slate-950 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Mic className="w-4 h-4" />
          </div>
          <h1 className="font-bold text-lg uppercase tracking-tighter">{t.voice_calibration || 'Voice Calibration'}</h1>
        </div>
        <div className="flex items-center gap-4 font-bold text-lg ml-auto">
          <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Trophy className="w-5 h-5" />
            {sessionScore}/{words.length}
          </div>
        </div>
      </header>

      <div className="w-full px-4 py-3 bg-slate-900 border-b border-amber-500/20 z-10 relative flex gap-1.5 justify-center items-center">
        {words.map((_, idx) => (
          <div 
            key={idx}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              idx < currentIndex ? 'bg-amber-500' : 
              idx === currentIndex ? 'bg-amber-500 animate-pulse scale-y-125 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
              'bg-amber-500/10'
            }`}
          />
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full p-6 relative z-10">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-500/20 p-8 text-center relative overflow-hidden"
        >
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 -mr-12 -mt-12 rounded-full" />
          
          <div className="mb-8">
            <div className="text-xs font-bold text-amber-500/60 uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
              <Database className="w-3 h-3" />
              {t.target_word || 'Target Word'}
            </div>
            <h2 className="text-5xl font-black text-amber-500 mb-4 tracking-tighter uppercase">
              {currentWord.word}
            </h2>
            <div className="text-xl text-amber-500/40 font-medium italic">
              {currentWord.transcription}
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <button 
              onClick={() => playPronunciation(currentWord.word, targetLang)}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 transition-all border border-amber-500/20"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Volume2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{t.listen || 'Listen'}</span>
            </button>
          </div>

          <div className="space-y-8">
            <div className="relative flex flex-col items-center">
              <AnimatePresence mode="wait">
                {status === 'recording' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20" />
                      <button 
                        onClick={stopRecording}
                        className="w-24 h-24 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl relative z-10"
                      >
                        <MicOff className="w-10 h-10" />
                      </button>
                    </div>
                    <div className="text-rose-500 font-bold animate-pulse flex items-center gap-2 uppercase tracking-widest text-sm">
                      <div className="w-2 h-2 bg-rose-500 rounded-full" />
                      {t.recording || 'Recording...'}
                    </div>
                    <p className="text-amber-500/60 italic text-lg font-mono">
                      "{transcript || '...'}"
                    </p>
                  </motion.div>
                ) : status === 'processing' ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <div className="text-amber-500 font-bold uppercase tracking-widest">{t.analyzing || 'Analyzing...'}</div>
                  </motion.div>
                ) : status === 'done' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full space-y-6"
                  >
                    <div className={`p-6 rounded-2xl border-2 ${
                      feedback?.isCorrect 
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-500' 
                        : 'bg-rose-500/5 border-rose-500/30 text-rose-500'
                    }`}>
                      <div className="flex items-center justify-center gap-3 mb-3">
                        {feedback?.isCorrect ? (
                          <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center">
                            <X className="w-6 h-6" />
                          </div>
                        )}
                        <span className="text-2xl font-black uppercase tracking-tighter">
                          {feedback?.isCorrect ? (t.perfect || 'Perfect!') : (t.keep_trying || 'Keep Trying!')}
                        </span>
                      </div>
                      <p className="text-lg font-bold mb-2 uppercase">"{transcript}"</p>
                      {feedback?.phoneticSpelling && (
                        <div className="text-sm font-mono opacity-60 mb-3">
                          [{feedback.phoneticSpelling}]
                        </div>
                      )}
                      {feedback?.feedback && (
                        <p className="text-sm opacity-80 mb-4">{feedback.feedback}</p>
                      )}
                      
                      {feedback?.tips && feedback.tips.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-current/10 text-left">
                          <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60 flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" />
                            {t.tips || 'Tips for Improvement'}
                          </div>
                          <ul className="space-y-2">
                            {feedback.tips.map((tip, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-40" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {audioUrl && (
                        <button 
                          onClick={() => {
                            const audio = new Audio(audioUrl);
                            audio.play();
                          }}
                          className="w-full py-4 bg-amber-500/5 text-amber-500 rounded-2xl font-bold text-lg hover:bg-amber-500/10 transition-all border border-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                          <Play className="w-5 h-5" />
                          {t.playback_recording || 'Playback Recording'}
                        </button>
                      )}

                      <button 
                        onClick={handleNext}
                        className="w-full py-4 bg-amber-500 text-slate-950 rounded-2xl font-bold text-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 uppercase tracking-widest"
                      >
                        {t.continue || 'Continue'}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                      
                      {!feedback?.isCorrect && (
                        <button 
                          onClick={handleRetry}
                          className="w-full py-4 bg-slate-800 text-amber-500/60 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest border border-amber-500/10"
                        >
                          <RefreshCw className="w-5 h-5" />
                          {t.try_again || 'Try Again'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <button 
                      onClick={startRecording}
                      className="w-24 h-24 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group border-4 border-amber-500/20"
                    >
                      <Mic className="w-10 h-10 group-hover:animate-pulse" />
                    </button>
                    <div className="text-amber-500/60 font-bold uppercase tracking-widest text-xs">
                      {t.tap_to_speak || 'Tap to Speak'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="bg-slate-900 p-4 rounded-2xl border border-amber-500/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs mb-1 uppercase tracking-widest">{t.calibration_tip_1 || 'Clear Voice'}</h4>
              <p className="text-[10px] text-amber-500/40 uppercase leading-relaxed">{t.calibration_tip_1_desc || 'Speak clearly and at a normal volume for best results.'}</p>
            </div>
          </div>
          <div className="bg-slate-900 p-4 rounded-2xl border border-amber-500/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs mb-1 uppercase tracking-widest">{t.calibration_tip_2 || 'Listen First'}</h4>
              <p className="text-[10px] text-amber-500/40 uppercase leading-relaxed">{t.calibration_tip_2_desc || 'Listen to the pronunciation before you try to repeat it.'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
