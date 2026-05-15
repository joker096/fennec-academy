import { GoogleGenAI, Type } from "@google/genai";

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

export interface MnemonicResponse {
  isAbstract: boolean;
  visualPrompt: string;
  explanation: string;
}

export class MnemonicService {
  /**
   * Determines if a word is abstract and generates a visual mnemonic prompt.
   */
  static async getMnemonicPrompt(word: string, translation: string, targetLang: string): Promise<MnemonicResponse> {
    const genAI = getAi();
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the word "${word}" (Translation: "${translation}") in ${targetLang}. 
        Determine if it is abstract (hard to visualize literally, like "justice", "logic", "grammar term") or concrete (easy to visualize, like "apple", "dog").
        If abstract, create a creative visual mnemonic prompt for an AI image generator to help a student remember it.
        The prompt should be vivid, symbolic, and evocative.
        Return the result in JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isAbstract: { type: Type.BOOLEAN },
              visualPrompt: { type: Type.STRING, description: "A detailed visual description for an image generator." },
              explanation: { type: Type.STRING, description: "How this image helps remember the word." }
            },
            required: ["isAbstract", "visualPrompt", "explanation"]
          }
        }
      });

      return JSON.parse(response.text || '{}') as MnemonicResponse;
    } catch (error) {
      console.error("Error getting mnemonic prompt:", error);
      return { isAbstract: false, visualPrompt: '', explanation: '' };
    }
  }

  /**
   * Generates a mnemonic image using Gemini.
   */
  static async generateMnemonicImage(visualPrompt: string): Promise<string | null> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A cinematic, vibrant mnemonic illustration: ${visualPrompt}. Digital art style, clean composition, educational focus, fallout wasteland aesthetic accents.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error generating mnemonic image:", error);
      return null;
    }
  }
}
