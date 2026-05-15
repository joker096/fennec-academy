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

export interface NarrativeContext {
  characterName: string;
  characterDescription: string;
  scenarioDescription: string;
  history: { role: 'user' | 'model', text: string }[];
  targetLang: string;
  userLvl: number;
  special?: { S: number, P: number, E: number, C: number, I: number, A: number, L: number };
  narrativeState?: string;
}

export interface EncounterOutcome {
  healthChange: number;
  creditsChange: number;
  xpChange: number;
  isGameOver: boolean;
  explanation: string;
  resolutionStatus?: 'success' | 'partial' | 'failure';
}

export const encounterService = {
  async generateResponse(context: NarrativeContext, userMessage: string) {
    const genAI = getAi();
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }
    const systemInstruction = `
      You are an AI character in an advanced academic social simulation for language learning.
      Character Name: ${context.characterName}
      Character Bio: ${context.characterDescription}
      Scenario: ${context.scenarioDescription}
      Target Language for Practice: ${context.targetLang}
      User Proficiency Level: ${context.userLvl}
      User Faculty Attributes: Concentration:${context.special?.S}, Perception:${context.special?.P}, Analytical:${context.special?.E}, Communication:${context.special?.C}, Intelligence:${context.special?.I}, Speed:${context.special?.A}, Creativity:${context.special?.L}
      Current Narrative State: ${context.narrativeState || 'Neutral/Initial'}

      The user will respond to you in ${context.targetLang}. 
      You should:
      1. Respond in character, staying true to your role and expertise.
      2. Keep responses relatively short (2-3 sentences).
      3. Use natural language appropriate for a ${context.userLvl} level learner of ${context.targetLang}.
      4. If the user makes a clear mistake in ${context.targetLang}, gently correct them *after* your in-character response, in a separate section marked "Correction:".
      5. Evaluate the user's language accuracy and appropriateness of their response to determine the encounter outcome.
      6. Branching Logic & Outcomes:
         - Create distinct narrative paths based on the user's tone and language quality.
         - Paths can be: [Diplomatic], [Scientific/Academic], [Direct/Hostile], [Technical].
         - The user's choices should lead to different outcomes (Success, Partial Success, Failure).
         - SUCCESS: High XP and Credits. Usually achieved through accuracy and politeness or technical skill.
         - PARTIAL SUCCESS: Medium rewards, maybe some small health loss.
         - FAILURE: No rewards, significant health loss, encounter ends.
      
      7. Choice Types & Requirements:
         - Standard choices: No requirements.
         - Stat-locked choices: Require a specific attribute to be high (e.g., [Intelligence 7+], [Perception 6+]).
      
      8. Provide 3-4 possible choices for the user's next action or dialogue. 
          CRITICAL: Include the "branch" type and optional "requirement" string for each choice.
      
      9. Mentions: If user has high stats, mention how they helped in the "explanation".
      
      10. Image Generation: Provide a descriptive 'sceneImagePrompt' for the current moment in the story. Style: Cinematic digital art, modern academic fallout aesthetic.
    `;

    const contents = [
      ...context.history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents as any,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              characterResponse: { 
                type: Type.STRING, 
                description: "What the character says to the user in the target language." 
              },
              correction: { 
                type: Type.STRING, 
                description: "Helpful feedback on the user's language usage, if necessary. Empty string if perfect." 
              },
              narrativeState: {
                type: Type.STRING,
                description: "A short summary of the current story state (e.g. 'Negotiating payment', 'Researching together')."
              },
              sceneImagePrompt: {
                type: Type.STRING,
                description: "A descriptive prompt for an image representing this scene."
              },
              outcome: {
                type: Type.OBJECT,
                properties: {
                  healthChange: { type: Type.INTEGER },
                  creditsChange: { type: Type.INTEGER },
                  xpChange: { type: Type.INTEGER },
                  isGameOver: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING },
                  resolutionStatus: { type: Type.STRING, enum: ["success", "partial", "failure"] }
                },
                required: ["healthChange", "creditsChange", "xpChange", "isGameOver", "explanation", "resolutionStatus"]
              },
              suggestedChoices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    branch: { type: Type.STRING, enum: ["diplomatic", "academic", "direct", "scientific", "hostile", "technical"] },
                    requirement: { type: Type.STRING, description: "Optional requirement text, e.g. '[Intelligence 7+]'" }
                  },
                  required: ["text", "translation", "branch"]
                }
              }
            },
            required: ["characterResponse", "suggestedChoices", "outcome", "narrativeState", "sceneImagePrompt"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Encounter logic failed:", error);
      return {
        characterResponse: "...",
        outcome: { healthChange: 0, creditsChange: 0, xpChange: 10, isGameOver: false, explanation: "System unstable." },
        suggestedChoices: [{ text: "Keep moving", translation: "Продолжить", branch: "direct" }],
        narrativeState: "Error",
        sceneImagePrompt: "An empty research corridor."
      };
    }
  },

  async generatePortraitPrompt(name: string, description: string) {
    const prompt = `A highly detailed professional portrait of ${name}, an academic expert. Bio: ${description}. Clean, modern aesthetic, professional attire, cinematic studio lighting, professional digital art.`;
    return prompt;
  },

  async generateIntro(context: Omit<NarrativeContext, 'history' | 'userLvl'> & { userLvl: number, special?: NarrativeContext['special'] }) {
    const systemInstruction = `
      You are a simulation coordinator for an advanced language learning platform.
      Create a compelling opening for an academic simulation with ${context.characterName}.
      Character Bio: ${context.characterDescription}
      Scenario: ${context.scenarioDescription}
      Target Language: ${context.targetLang}
      User Faculty Attributes: Communication: ${context.special?.C}, Creativity: ${context.special?.L}
      
      Start with a technical description of the social environment and the first dialogue from the character in ${context.targetLang}.
      If the user has high Communication (>= 7), include a special introductory choice that uses academic diplomacy.
    `;

    const genAI = getAi();
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Start the encounter.",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              npc: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  visualDescription: { type: Type.STRING }
                }
              },
              sceneDescription: { type: Type.STRING },
              characterFirstLine: { type: Type.STRING },
              suggestedChoices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    branch: { type: Type.STRING, enum: ["diplomatic", "academic", "direct", "scientific", "hostile", "technical"] },
                    requirement: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["sceneDescription", "characterFirstLine", "suggestedChoices"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      return null;
    }
  }
};
