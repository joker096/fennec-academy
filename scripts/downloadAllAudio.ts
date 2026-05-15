import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from "@google/genai";
import { WORDS_BY_LANG } from '../src/data/gameData';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set. Skipping audio download.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const downloadAudio = async (text: string, langId: string, filepath: string): Promise<void> => {
  if (fs.existsSync(filepath)) {
    return;
  }

  const langName = langNames[langId] || 'English';
  const prompt = `Pronounce the following word in ${langName}: ${text}. Speak clearly and naturally as a native speaker.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            // Use different voices for variety if possible, but 'Kore' is a good default
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const buffer = Buffer.from(base64Audio, 'base64');
      fs.writeFileSync(filepath, buffer);
    } else {
      throw new Error(`No audio data returned for ${text} in ${langId}`);
    }
  } catch (error: any) {
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
      console.error('Invalid Gemini API Key. Skipping audio download.');
      process.exit(0); // Exit gracefully to not block build
    }
    throw error;
  }
};

async function main() {
  const publicAudioDir = path.join(process.cwd(), 'public', 'audio');
  if (!fs.existsSync(publicAudioDir)) {
    fs.mkdirSync(publicAudioDir, { recursive: true });
  }

  for (const [lang, words] of Object.entries(WORDS_BY_LANG)) {
    if (lang !== 'en') continue; // Test with English only first
    const langDir = path.join(publicAudioDir, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }

    console.log(`Generating high-quality audio for ${lang}... (${words.length} words)`);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const filepath = path.join(langDir, `${word.id}.mp3`);
      
      try {
        await downloadAudio(word.word, lang, filepath);
        if (i % 10 === 0) {
          console.log(`  Progress: ${i}/${words.length}`);
        }
        // Gemini API has rate limits, but for TTS it's usually fine to go a bit faster
        await delay(200); 
      } catch (err) {
        console.error(`Error generating audio for ${word.word}:`, err);
        // Wait a bit longer on error
        await delay(2000);
      }
    }
  }
  console.log('Done!');
}

main().catch(console.error);
