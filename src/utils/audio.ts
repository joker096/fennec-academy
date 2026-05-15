import { WORDS_BY_LANG } from '../data/gameData';
import { GoogleGenAI } from "@google/genai";

let currentAudio: HTMLAudioElement | null = null;
let ai: GoogleGenAI | null = null;

const getAi = () => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
      ai = new GoogleGenAI({ apiKey });
    }
  }
  return ai;
};

const langNames: Record<string, string> = {
  'sr': 'Serbian', 
  'en': 'English', 
  'es': 'Spanish',
  'fr': 'French', 
  'de': 'German', 
  'it': 'Italian',
  'ja': 'Japanese', 
  'zh': 'Chinese',
  'ru': 'Russian'
};

export const playPronunciation = async (text: string, langId: string) => {
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  window.speechSynthesis.cancel();

  // Try to find the word in our dataset to play the local audio file
  const words = WORDS_BY_LANG[langId] || [];
  // Find by exact word match (case-insensitive)
  const wordObj = words.find(w => w.word.toLowerCase() === text.toLowerCase());

  if (wordObj) {
    const audioUrl = `/audio/${langId}/${wordObj.id}.mp3`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    
    audio.play().catch(err => {
      console.warn("Local audio playback failed, falling back to high-quality Gemini TTS", err);
      fallbackGeminiTTS(text, langId);
    });
  } else {
    // If word not found in dataset (e.g. native translations or dynamically generated text), use fallback
    fallbackGeminiTTS(text, langId);
  }
};

const fallbackGeminiTTS = async (text: string, langId: string) => {
  const genAI = getAi();
  if (!genAI) {
    fallbackSpeechSynthesis(text, langId);
    return;
  }

  const langName = langNames[langId] || 'English';
  const prompt = `Pronounce the following word in ${langName}: ${text}. Speak clearly and naturally as a native speaker.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.play().catch(err => {
        console.warn("Gemini TTS playback failed, falling back to browser speech synthesis", err);
        fallbackSpeechSynthesis(text, langId);
      });
    } else {
      fallbackSpeechSynthesis(text, langId);
    }
  } catch (error) {
    console.error("Gemini TTS error:", error);
    fallbackSpeechSynthesis(text, langId);
  }
};

const fallbackSpeechSynthesis = (text: string, langId: string) => {
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      'sr': 'sr-RS', 
      'en': 'en-US', 
      'es': 'es-ES',
      'fr': 'fr-FR', 
      'de': 'de-DE', 
      'it': 'it-IT',
      'ja': 'ja-JP', 
      'zh': 'zh-CN',
      'ru': 'ru-RU'
    };
    
    const targetLang = langMap[langId] || 'en-US';
    utterance.lang = targetLang;
    utterance.rate = 0.85; // Slightly slower for learning clarity

    const voices = window.speechSynthesis.getVoices();
    
    // 1. Try to find an exact match (e.g., 'es-ES')
    let voice = voices.find(v => v.lang.replace('_', '-') === targetLang);
    
    // 2. Try to find a broad match (e.g., any 'es-...' voice)
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    }

    // 3. Fallbacks for specific languages (e.g., Serbian often lacks a native voice on some OS)
    if (langId === 'sr' && !voice) {
       voice = voices.find(v => v.lang.startsWith('hr') || v.lang.startsWith('bs') || v.lang.startsWith('ru'));
    }

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Handle async voice loading in some browsers
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = speak;
    // Fallback if event doesn't fire
    setTimeout(speak, 500);
  } else {
    speak();
  }
};
