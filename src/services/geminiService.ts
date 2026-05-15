import { GoogleGenAI, Type } from "@google/genai";
import { db, doc, getDoc, setDoc, OperationType, handleFirestoreError } from '../firebase';
import { NetworkError, ApiError } from '../lib/errors';

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export const getGenAI = () => {
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') : null;
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const activeKey = storedKey || envKey;

  if (!ai || currentApiKey !== activeKey) {
    if (activeKey) {
      ai = new GoogleGenAI({ apiKey: activeKey });
      currentApiKey = activeKey;
    }
  }
  return ai;
};

export const hasApiKey = () => {
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') : null;
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  return !!(storedKey || envKey);
};

export const clearGenAI = () => {
  ai = null;
  currentApiKey = null;
};

const checkPrerequisites = () => {
  if (!navigator.onLine) {
    throw new NetworkError();
  }
  const genAI = getGenAI();
  if (!genAI) {
    throw new ApiError('Intelligence system offline. Please configure your Gemini API key in Settings.');
  }
  return genAI;
};

export interface ContextualExample {
  sentence: string;
  translation: string;
  source: 'news' | 'books' | 'social media';
  sourceName?: string;
}

const cache: Record<string, any> = {};

async function fetchFromSharedCache<T>(
  type: 'grammar' | 'vocabulary' | 'deep_dive' | 'correct_explanation',
  key: string,
  targetLang: string,
  uiLang: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cacheKey = `${type}_${key}_${targetLang}_${uiLang}`.replace(/[^a-zA-Z0-9_]/g, '_');
  
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const local = localStorage.getItem(cacheKey);
    if (local) {
      const parsed = JSON.parse(local);
      cache[cacheKey] = parsed;
      return parsed;
    }
  } catch {}

  const generated = await fetcher();
  cache[cacheKey] = generated;
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(generated));
  } catch {}

  return generated;
}

async function generateWithAI(prompt: string, systemInstruction?: string): Promise<string> {
  const genAI = checkPrerequisites();
  const model = "gemini-3-flash-preview";
  
  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }]
    }
  ];

  const result = await genAI.models.generateContent({
    model,
    contents,
    config: systemInstruction ? {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    } : {}
  });
  
  return result.text;
}

export async function explainGrammar(
  word: string,
  targetLang: string,
  uiLang: string
): Promise<{
  grammar: string;
  usage: string;
  commonMistakes: string[];
}> {
  return fetchFromSharedCache('grammar', word, targetLang, uiLang, async () => {
    const prompt = `Explain the grammar of "${word}" in ${targetLang} for someone who speaks ${uiLang}. Include: grammar rules, usage patterns, and common mistakes. Format as JSON with keys: grammar, usage, commonMistakes (array).`;
    const response = await generateWithAI(prompt, `You are a grammar expert. Respond ONLY with valid JSON.`);
    try {
      return JSON.parse(response);
    } catch {
      return { grammar: response, usage: '', commonMistakes: [] };
    }
  });
}

export async function getVocabularyDetails(
  word: string,
  targetLang: string,
  uiLang: string
): Promise<{
  definition: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  wordType: string;
}> {
  return fetchFromSharedCache('vocabulary', word, targetLang, uiLang, async () => {
    const prompt = `Provide vocabulary details for "${word}" in ${targetLang} (UI in ${uiLang}). Format as JSON with keys: definition, examples (array), synonyms (array), antonyms (array), wordType.`;
    const response = await generateWithAI(prompt, `You are a vocabulary expert. Respond ONLY with valid JSON.`);
    try {
      return JSON.parse(response);
    } catch {
      return { definition: response, examples: [], synonyms: [], antonyms: [], wordType: 'unknown' };
    }
  });
}

export async function getDeepDive(
  word: string,
  targetLang: string,
  uiLang: string
): Promise<{
  etymology: string;
  culturalContext: string;
  relatedExpressions: string[];
}> {
  return fetchFromSharedCache('deep_dive', word, targetLang, uiLang, async () => {
    const prompt = `Provide deep dive into "${word}" in ${targetLang} (UI in ${uiLang}). Format as JSON with keys: etymology, culturalContext, relatedExpressions (array).`;
    const response = await generateWithAI(prompt, `You are a linguistics expert. Respond ONLY with valid JSON.`);
    try {
      return JSON.parse(response);
    } catch {
      return { etymology: response, culturalContext: '', relatedExpressions: [] };
    }
  });
}

export async function correctExplanation(
  userSentence: string,
  correctSentence: string,
  explanation: string,
  targetLang: string
): Promise<string> {
  const cacheKey = `correct_${userSentence}_${targetLang}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const response = await generateWithAI(
    `Explain why "${userSentence}" is incorrect compared to "${correctSentence}" in ${targetLang}. Original explanation: "${explanation}". Provide a clear correction explanation.`
  );
  
  cache[cacheKey] = response;
  return response;
}

export async function ContextualExample(
  word: string,
  targetLang: string,
  uiLang: string
): Promise<ContextualExample[]> {
  const cacheKey = `examples_${word}_${targetLang}_${uiLang}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const prompt = `Generate 3 example sentences using "${word}" in ${targetLang} (UI: ${uiLang}). Format as JSON array with objects: { sentence, translation, source, sourceName } where source is one of: news, books, social media.`;
  const response = await generateWithAI(prompt, `You are a language expert. Respond ONLY with valid JSON array.`);

  try {
    const examples = JSON.parse(response);
    cache[cacheKey] = examples;
    return examples;
  } catch {
    return [];
  }
}

export async function generateMnemonic(
  word: string,
  targetLang: string,
  translation: string
): Promise<string> {
  const prompt = `Create a memorable mnemonic or memory trick for "${word}" (${targetLang} = "${translation}"). Make it vivid and memorable. Keep it short (under 100 characters).`;
  return generateWithAI(prompt);
}

export async function generateFlashcardContent(
  word: string,
  targetLang: string,
  uiLang: string,
  wordType: 'word' | 'phrase' = 'word'
): Promise<{
  front: string;
  back: string;
  hint: string;
  mnemonic: string;
}> {
  const prompt = wordType === 'phrase'
    ? `Create flashcard content for phrase "${word}" in ${targetLang} (UI: ${uiLang}). Format as JSON: { front, back, hint, mnemonic }`
    : `Create flashcard content for word "${word}" in ${targetLang} (UI: ${uiLang}). Format as JSON: { front, back, hint, mnemonic }`;

  const response = await generateWithAI(prompt, `You are a flashcard expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      front: word,
      back: '',
      hint: '',
      mnemonic: ''
    };
  }
}

export async function chatWithAI(
  messages: { role: 'user' | 'model'; content: string }[],
  systemPrompt: string,
  targetLang: string,
  uiLang: string
): Promise<string> {
  const genAI = checkPrerequisites();
  const model = "gemini-3-flash-preview";
  
  const contents = messages.map(m => ({
    role: m.role as "user" | "model",
    parts: [{ text: m.content }]
  }));

  const systemInstruction = `${systemPrompt}

Teaching ${targetLang} to someone who speaks ${uiLang}.
Always respond in ${uiLang} for explanations.
Keep responses concise but informative.`;

  const result = await genAI.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    }
  });
  
  return result.text;
}

export async function analyzePronunciation(
  targetWord: string,
  userAttempt: string,
  targetLang: string
): Promise<{
  isCorrect: boolean;
  feedback: string;
  suggestions: string[];
}> {
  const prompt = `Compare user pronunciation attempt "${userAttempt}" with correct pronunciation "${targetWord}" in ${targetLang}. 
Format as JSON: { isCorrect (boolean), feedback (string), suggestions (array of strings) }`;

  const response = await generateWithAI(prompt, `You are a pronunciation coach. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      isCorrect: userAttempt.toLowerCase() === targetWord.toLowerCase(),
      feedback: 'Could not analyze pronunciation.',
      suggestions: []
    };
  }
}

export async function generateStoryPrompt(
  topic: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  targetLang: string,
  uiLang: string
): Promise<{
  title: string;
  setting: string;
  characters: string[];
  plotPoints: string[];
  targetVocabulary: string[];
}> {
  const prompt = `Create a story prompt about "${topic}" for ${difficulty} level in ${targetLang} (UI: ${uiLang}).
Format as JSON: { title, setting, characters (array), plotPoints (array), targetVocabulary (array) }`;

  const response = await generateWithAI(prompt, `You are a creative writing expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      title: topic,
      setting: '',
      characters: [],
      plotPoints: [],
      targetVocabulary: []
    };
  }
}

export async function generateConversationScenario(
  situation: string,
  targetLang: string,
  uiLang: string
): Promise<{
  context: string;
  suggestedPhrases: { phrase: string; translation: string; whenToUse: string }[];
  culturalNotes: string[];
}> {
  const prompt = `Create a conversation scenario for situation "${situation}" in ${targetLang} (UI: ${uiLang}).
Format as JSON: { context, suggestedPhrases (array of {phrase, translation, whenToUse}), culturalNotes (array) }`;

  const response = await generateWithAI(prompt, `You are a language learning expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      context: situation,
      suggestedPhrases: [],
      culturalNotes: []
    };
  }
}

export async function generateQuizQuestions(
  topic: string,
  count: number,
  difficulty: 'easy' | 'medium' | 'hard',
  targetLang: string,
  uiLang: string
): Promise<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}[]> {
  const prompt = `Generate ${count} quiz questions about "${topic}" for ${difficulty} level in ${targetLang} (UI: ${uiLang}).
Format as JSON array: [{ question, options (array of 4), correctAnswer (0-3), explanation }]`;

  const response = await generateWithAI(prompt, `You are a quiz expert. Respond ONLY with valid JSON array.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return [];
  }
}

export async function generateImagePrompt(
  word: string,
  targetLang: string,
  style: 'realistic' | 'artistic' | 'memorable' = 'memorable'
): Promise<string> {
  const prompt = `Generate an image prompt for "${word}" in ${targetLang} for creating a memorable mnemonic image.
Style: ${style}. Make it vivid and easy to remember.`;
  return generateWithAI(prompt);
}

export async function analyzeWriting(
  text: string,
  targetLang: string,
  uiLang: string
): Promise<{
  grammar: { score: number; issues: { original: string; correction: string; explanation: string }[] };
  vocabulary: { score: number; suggestions: { original: string; better: string; reason: string }[] };
  style: { score: number; feedback: string };
  overallScore: number;
}> {
  const prompt = `Analyze this text in ${targetLang}: "${text}"
Provide detailed feedback on grammar, vocabulary, and style.
Format as JSON: { grammar: { score, issues: [{original, correction, explanation}] }, vocabulary: { score, suggestions: [{original, better, reason}] }, style: { score, feedback }, overallScore }`;

  const response = await generateWithAI(prompt, `You are a writing coach. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      grammar: { score: 0, issues: [] },
      vocabulary: { score: 0, suggestions: [] },
      style: { score: 0, feedback: '' },
      overallScore: 0
    };
  }
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const prompt = `Translate from ${sourceLang} to ${targetLang}: "${text}". Provide ONLY the translation.`;
  return generateWithAI(prompt);
}

export async function getLanguageTips(
  targetLang: string,
  uiLang: string,
  topic?: string
): Promise<{
  tips: string[];
  commonMistakes: { mistake: string; correction: string; explanation: string }[];
  cultureNotes: string[];
}> {
  const topicPart = topic ? ` focused on ${topic}` : '';
  const prompt = `Provide language learning tips for ${targetLang} (UI: ${uiLang})${topicPart}.
Format as JSON: { tips (array), commonMistakes: [{mistake, correction, explanation}], cultureNotes (array) }`;

  const response = await generateWithAI(prompt, `You are a language learning expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      tips: [],
      commonMistakes: [],
      cultureNotes: []
    };
  }
}

export async function generateMatchPairs(
  words: string[],
  targetLang: string,
  uiLang: string
): Promise<{
  pairs: { word: string; translation: string; imagePrompt: string }[];
}> {
  const prompt = `Create matching pairs for words: ${words.join(', ')} in ${targetLang} (UI: ${uiLang}).
Format as JSON: { pairs: [{ word, translation, imagePrompt }] }`;

  const response = await generateWithAI(prompt, `You are a matching game expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return { pairs: [] };
  }
}

export async function generateRepairScenario(
  word: string,
  mistakes: string[],
  targetLang: string,
  uiLang: string
): Promise<{
  scenario: string;
  hints: string[];
  correctAnswer: string;
  explanation: string;
}> {
  const prompt = `Create a repair terminal scenario for word "${word}" where user made mistakes: ${mistakes.join(', ')} in ${targetLang} (UI: ${uiLang}).
Format as JSON: { scenario, hints (array), correctAnswer, explanation }`;

  const response = await generateWithAI(prompt, `You are a game designer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      scenario: word,
      hints: [],
      correctAnswer: word,
      explanation: ''
    };
  }
}

export async function generateHackingScenario(
  difficulty: 'easy' | 'medium' | 'hard',
  targetLang: string,
  words: string[]
): Promise<{
  encryptedText: string;
  decryptedText: string;
  hints: string[];
  translation: string;
}> {
  const prompt = `Create a hacking terminal challenge using words: ${words.join(', ')} in ${targetLang} with ${difficulty} difficulty.
Format as JSON: { encryptedText, decryptedText, hints (array), translation }`;

  const response = await generateWithAI(prompt, `You are a game designer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      encryptedText: words.join(''),
      decryptedText: words.join(''),
      hints: [],
      translation: ''
    };
  }
}

export async function generateAIChatResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'model'; content: string }[],
  targetLang: string,
  uiLang: string,
  isOverseer: boolean = false
): Promise<string> {
  const genAI = checkPrerequisites();
  const model = "gemini-3-flash-preview";
  
  const overseerPrompt = isOverseer
    ? `You are the Overseer of Vault-Tec Language Survival. You are wise, slightly sarcastic, and use Vault-Tec terminology. Your goal is to help the user learn ${targetLang} while maintaining the wasteland atmosphere.`
    : `You are a helpful AI tutor helping someone learn ${targetLang} (UI: ${uiLang}). Be encouraging and provide clear explanations.`;

  const contents = [
    ...conversationHistory.map(m => ({
      role: m.role as "user" | "model",
      parts: [{ text: m.content }]
    })),
    {
      role: "user" as const,
      parts: [{ text: userMessage }]
    }
  ];

  const result = await genAI.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: {
        parts: [{ text: overseerPrompt }]
      }
    }
  });
  
  return result.text;
}

export async function analyzeLessonPerformance(
  words: { word: string; userAnswer: string; correct: boolean }[],
  targetLang: string
): Promise<{
  overallScore: number;
  weakAreas: string[];
  strongAreas: string[];
  suggestions: string[];
  encouragement: string;
}> {
  const prompt = `Analyze lesson performance in ${targetLang}: ${JSON.stringify(words)}.
Format as JSON: { overallScore (0-100), weakAreas (array), strongAreas (array), suggestions (array), encouragement (string) }`;

  const response = await generateWithAI(prompt, `You are an educational analyst. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      overallScore: 0,
      weakAreas: [],
      strongAreas: [],
      suggestions: [],
      encouragement: ''
    };
  }
}

export async function generateMiniLesson(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  targetLang: string,
  uiLang: string
): Promise<{
  title: string;
  content: string;
  examples: string[];
  exercises: { question: string; options: string[]; correctAnswer: number }[];
  culturalNote: string;
}> {
  const prompt = `Create a mini lesson about "${topic}" for ${difficulty} level in ${targetLang} (UI: ${uiLang}).
Format as JSON: { title, content, examples (array), exercises: [{question, options (array of 4), correctAnswer (0-3)}], culturalNote }`;

  const response = await generateWithAI(prompt, `You are an educational content creator. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      title: topic,
      content: '',
      examples: [],
      exercises: [],
      culturalNote: ''
    };
  }
}

export async function generateEncounterNarrative(
  encounterType: 'combat' | 'dialogue' | 'discovery' | 'survival',
  targetLang: string,
  difficulty: number,
  vocabulary: string[]
): Promise<{
  title: string;
  narrative: string;
  choices: { text: string; outcome: string; vocabulary: string[] }[];
  successCriteria: string[];
}> {
  const prompt = `Create a ${encounterType} encounter in ${targetLang} using vocabulary: ${vocabulary.join(', ')}.
Difficulty: ${difficulty}/10. Format as JSON: { title, narrative, choices: [{text, outcome, vocabulary (array)}], successCriteria (array) }`;

  const response = await generateWithAI(prompt, `You are a narrative designer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      title: encounterType,
      narrative: '',
      choices: [],
      successCriteria: []
    };
  }
}

export async function generateStoryChapter(
  storyId: string,
  previousChoices: string[],
  targetLang: string,
  uiLang: string
): Promise<{
  chapterTitle: string;
  content: string;
  choices: { choiceId: string; text: string; consequence: string }[];
  newVocabulary: string[];
  culturalNote: string;
}> {
  const prompt = `Generate next chapter for story "${storyId}" in ${targetLang} (UI: ${uiLang}).
Previous choices: ${previousChoices.join(' -> ')}. 
Format as JSON: { chapterTitle, content, choices: [{choiceId, text, consequence}], newVocabulary (array), culturalNote }`;

  const response = await generateWithAI(prompt, `You are a creative writer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      chapterTitle: 'Chapter',
      content: '',
      choices: [],
      newVocabulary: [],
      culturalNote: ''
    };
  }
}

export async function generateScenarioDialogue(
  scenario: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  targetLang: string,
  uiLang: string
): Promise<{
  situation: string;
  dialogues: { speaker: string; text: string; translation: string; grammar: string }[];
  vocabulary: { word: string; translation: string; usage: string }[];
  culturalNotes: string[];
}> {
  const prompt = `Create dialogue scenario "${scenario}" for ${difficulty} level in ${targetLang} (UI: ${uiLang}).
Format as JSON: { situation, dialogues: [{speaker, text, translation, grammar}], vocabulary: [{word, translation, usage}], culturalNotes (array) }`;

  const response = await generateWithAI(prompt, `You are a dialogue expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      situation: scenario,
      dialogues: [],
      vocabulary: [],
      culturalNotes: []
    };
  }
}

export async function generateQuestDescription(
  questType: 'daily' | 'weekly' | 'story' | 'achievement',
  difficulty: 'easy' | 'medium' | 'hard',
  targetLang: string,
  uiLang: string
): Promise<{
  title: string;
  description: string;
  objectives: { id: string; text: string; completed: boolean }[];
  rewards: { type: string; amount: number }[];
  tips: string[];
}> {
  const prompt = `Generate a ${questType} quest for ${difficulty} level in ${targetLang} (UI: ${uiLang}).
Format as JSON: { title, description, objectives: [{id, text, completed}], rewards: [{type, amount}], tips (array) }`;

  const response = await generateWithAI(prompt, `You are a game designer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      title: questType,
      description: '',
      objectives: [],
      rewards: [],
      tips: []
    };
  }
}

export async function generateFactionContent(
  factionId: string,
  targetLang: string,
  uiLang: string
): Promise<{
  name: string;
  description: string;
  goals: string[];
  activities: { id: string; name: string; description: string; xpReward: number }[];
  memberBenefits: string[];
}> {
  const prompt = `Generate content for faction "${factionId}" in ${targetLang} (UI: ${uiLang}).
Format as JSON: { name, description, goals (array), activities: [{id, name, description, xpReward}], memberBenefits (array) }`;

  const response = await generateWithAI(prompt, `You are a world-building expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      name: factionId,
      description: '',
      goals: [],
      activities: [],
      memberBenefits: []
    };
  }
}

export async function generateLeaderboardCommentary(
  rank: number,
  userName: string,
  targetLang: string
): Promise<string> {
  const prompt = `Generate a brief, encouraging leaderboard commentary for user "${userName}" who is rank #${rank} in ${targetLang}. Be motivating and use gaming/wasteland terminology.`;
  return generateWithAI(prompt);
}

export async function generateAchievementUnlock(
  achievementId: string,
  userName: string,
  targetLang: string,
  uiLang: string
): Promise<{
  title: string;
  description: string;
  celebrationText: string;
  unlockedRewards: { type: string; item: string }[];
}> {
  const prompt = `Generate achievement unlock content for "${achievementId}" earned by "${userName}" in ${targetLang} (UI: ${uiLang}).
Format as JSON: { title, description, celebrationText, unlockedRewards: [{type, item}] }`;

  const response = await generateWithAI(prompt, `You are a gaming expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      title: achievementId,
      description: '',
      celebrationText: '',
      unlockedRewards: []
    };
  }
}

export async function generateVocabularyBankContent(
  word: string,
  targetLang: string,
  uiLang: string
): Promise<{
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  examples: { sentence: string; translation: string }[];
  synonyms: string[];
  antonyms: string[];
  etymology: string;
  culturalNotes: string[];
  mnemonic: string;
}> {
  const prompt = `Generate comprehensive vocabulary bank entry for "${word}" in ${targetLang} (UI: ${uiLang}).
Format as JSON: { word, pronunciation, partOfSpeech, definition, examples: [{sentence, translation}], synonyms (array), antonyms (array), etymology, culturalNotes (array), mnemonic }`;

  const response = await generateWithAI(prompt, `You are a lexicographer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      word,
      pronunciation: '',
      partOfSpeech: '',
      definition: '',
      examples: [],
      synonyms: [],
      antonyms: [],
      etymology: '',
      culturalNotes: [],
      mnemonic: ''
    };
  }
}

export async function generateGrammarLabContent(
  topic: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  targetLang: string,
  uiLang: string
): Promise<{
  topic: string;
  explanation: string;
  rules: { rule: string; examples: { correct: string; incorrect: string; explanation: string }[] }[];
  exercises: { type: string; question: string; options: string[]; correctAnswer: number; explanation: string }[];
  tips: string[];
}> {
  const prompt = `Generate grammar lab content for "${topic}" at ${difficulty} level in ${targetLang} (UI: ${uiLang}).
Format as JSON: { topic, explanation, rules: [{rule, examples: [{correct, incorrect, explanation}]}], exercises: [{type, question, options (array of 4), correctAnswer (0-3), explanation}], tips (array) }`;

  const response = await generateWithAI(prompt, `You are a grammar expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      topic,
      explanation: '',
      rules: [],
      exercises: [],
      tips: []
    };
  }
}

export async function generateVocabularySuggestions(
  knownWords: string[],
  targetLang: string,
  uiLang: string
): Promise<{
  suggestions: { word: string; reason: string; difficulty: string }[];
  themedLists: { theme: string; words: string[] }[];
}> {
  const prompt = `Suggest new vocabulary for someone who knows: ${knownWords.join(', ')} in ${targetLang} (UI: ${uiLang}).
Format as JSON: { suggestions: [{word, reason, difficulty}], themedLists: [{theme, words (array)}] }`;

  const response = await generateWithAI(prompt, `You are a vocabulary expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      suggestions: [],
      themedLists: []
    };
  }
}

export async function generateRepairTerminalContent(
  words: string[],
  mistakes: { word: string; mistake: string }[],
  targetLang: string,
  uiLang: string
): Promise<{
  scenario: string;
  entries: { id: string; corrupted: string; repaired: string; hint: string }[];
  rewards: { type: string; amount: number };
}> {
  const prompt = `Create repair terminal content using words: ${words.join(', ')} with mistakes: ${JSON.stringify(mistakes)} in ${targetLang} (UI: ${uiLang}).
Format as JSON: { scenario, entries: [{id, corrupted, repaired, hint}], rewards: {type, amount} }`;

  const response = await generateWithAI(prompt, `You are a game designer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      scenario: 'Repair Terminal',
      entries: [],
      rewards: { type: 'xp', amount: 0 }
    };
  }
}

export async function generateVaultRoomContent(
  roomId: string,
  targetLang: string,
  uiLang: string
): Promise<{
  name: string;
  description: string;
  upgrades: { id: string; name: string; description: string; cost: number; benefit: string }[];
  collectionRewards: { type: string; amount: number };
  unlockRequirement: string;
}> {
  const prompt = `Generate content for vault room "${roomId}" in ${targetLang} (UI: ${uiLang}).
Format as JSON: { name, description, upgrades: [{id, name, description, cost, benefit}], collectionRewards: {type, amount}, unlockRequirement }`;

  const response = await generateWithAI(prompt, `You are a world-building expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      name: roomId,
      description: '',
      upgrades: [],
      collectionRewards: { type: 'xp', amount: 0 },
      unlockRequirement: ''
    };
  }
}

export async function generatePerkDescription(
  perkId: string,
  targetLang: string,
  uiLang: string
): Promise<{
  name: string;
  description: string;
  effect: string;
  requirements: string[];
  synergyWith: string[];
  lore: string;
}> {
  const prompt = `Generate description for perk "${perkId}" in ${targetLang} (UI: ${uiLang}).
Format as JSON: { name, description, effect, requirements (array), synergyWith (array), lore }`;

  const response = await generateWithAI(prompt, `You are a game designer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      name: perkId,
      description: '',
      effect: '',
      requirements: [],
      synergyWith: [],
      lore: ''
    };
  }
}

export async function generateAdminInsights(
  usersData: { total: number; active: number; newThisWeek: number },
  targetLang: string
): Promise<{
  summary: string;
  trends: string[];
  recommendations: string[];
  alerts: string[];
}> {
  const prompt = `Generate admin insights for platform with ${usersData.total} total users, ${usersData.active} active, ${usersData.newThisWeek} new this week in ${targetLang}.
Format as JSON: { summary, trends (array), recommendations (array), alerts (array) }`;

  const response = await generateWithAI(prompt, `You are an analytics expert. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      summary: '',
      trends: [],
      recommendations: [],
      alerts: []
    };
  }
}

export async function generateDailyChallenge(
  targetLang: string,
  uiLang: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<{
  title: string;
  description: string;
  type: string;
  data: any;
  rewards: { xp: number; streakBonus: number };
  tips: string[];
}> {
  const prompt = `Generate daily challenge for ${difficulty} level in ${targetLang} (UI: ${uiLang}).
Format as JSON: { title, description, type, data, rewards: {xp, streakBonus}, tips (array) }`;

  const response = await generateWithAI(prompt, `You are a challenge designer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      title: 'Daily Challenge',
      description: '',
      type: 'flashcards',
      data: {},
      rewards: { xp: 0, streakBonus: 0 },
      tips: []
    };
  }
}

export async function generateWeeklyBonus(
  targetLang: string,
  uiLang: string
): Promise<{
  title: string;
  description: string;
  multiplier: number;
  duration: string;
  bonusRewards: { type: string; amount: number }[];
}> {
  const prompt = `Generate weekly bonus content in ${targetLang} (UI: ${uiLang}).
Format as JSON: { title, description, multiplier, duration, bonusRewards: [{type, amount}] }`;

  const response = await generateWithAI(prompt, `You are a reward designer. Respond ONLY with valid JSON.`);
  
  try {
    return JSON.parse(response);
  } catch {
    return {
      title: 'Weekly Bonus',
      description: '',
      multiplier: 1,
      duration: '7 days',
      bonusRewards: []
    };
  }
}

export async function fetchContextualExamples(word: string, targetLang: string, uiLang: string): Promise<ContextualExample[]> {
   return ContextualExample(word, targetLang, uiLang);
 }

export async function fetchCorrectExplanation(
   userSentence: string,
   correctSentence: string,
   targetLang: string,
   uiLang: string,
   contextData?: any,
   lessonDifficulty?: string
): Promise<string> {
   return correctExplanation(userSentence, correctSentence, '', targetLang);
 }

 export async function fetchVisualAid(word: string, targetLang: string, keyword?: string, style?: 'memorable' | 'artistic' | boolean): Promise<string> {
   const styleStr = style === true ? 'memorable' : style === false ? 'artistic' : style || 'memorable';
   return generateImagePrompt(word, targetLang, styleStr);
 }

 export async function fetchAIHint(word: string, targetLang: string, context?: string, uiLang?: string, correctAnswer?: string, isCorrectionContext?: boolean, contextData?: any, lessonDifficulty?: string): Promise<string> {
   return generateMnemonic(word, targetLang, context || correctAnswer || '');
 }

 export async function fetchDeepDive(word: string, targetLang: string, uiLang: string, difficulty?: string): Promise<DeepDiveResponse> {
   return getDeepDive(word, targetLang, uiLang) as any;
 }

 export async function fetchVocabularyExplanation(
   word: string,
   wrongAnswer: string,
   correctAnswer: string,
   targetLang: string,
   uiLang?: string,
   lessonDifficulty?: string
 ): Promise<VocabularyExplanation> {
   return getVocabularyDetails(word, targetLang, uiLang || '') as any;
 }

export async function fetchGrammarExplanation(
   word: string,
   userAnswer: string,
   correctAnswer: string,
   targetLang: string,
   uiLang: string,
   contextData?: any,
   lessonDifficulty?: string
 ): Promise<GrammarExplanation> {
   return explainGrammar(word, targetLang, uiLang || '') as any;
 }

export interface DeepDiveResponse {
  etymology: string;
  culturalContext: string;
  relatedExpressions: string[];
  definition?: string;
  mnemonics?: string;
  commonMistakes?: string[];
  grammarRules?: string[];
  pronunciationTips?: string[];
  culturalNotes?: string[];
}

export interface VocabularyExplanation {
  definition: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  wordType: string;
  explanation?: string;
  pronunciationTips?: string[];
  commonMistakes?: string[];
  alternatives?: { phrase: string; translation: string }[];
}

export interface GrammarExplanation {
  grammar: string;
  usage: string;
  commonMistakes: string[];
  explanation?: string;
  pronunciationTips?: string[];
  correctExamples?: { sentence: string; translation: string }[];
  alternativePhrases?: { phrase: string; translation: string }[];
}

export interface PronunciationFeedback {
  isCorrect: boolean;
  feedback: string;
  suggestions: string[];
  phoneticSpelling?: string;
  tips?: string[];
}

export interface DeepDiveResponse {
  etymology: string;
  culturalContext: string;
  relatedExpressions: string[];
  definition?: string;
  mnemonics?: string;
  commonMistakes?: string[];
  grammarRules?: string[];
  pronunciationTips?: string[];
  culturalNotes?: string[];
}

export async function fetchPronunciationFeedback(
   targetWord: string,
   userAttempt: string,
   targetLang: string,
   uiLang?: string,
   transcription?: string
): Promise<PronunciationFeedback> {
   return analyzePronunciation(targetWord, userAttempt, targetLang) as any;
 }

 export async function transcribeAudio(
  audioData: string,
  mimeType: string,
  targetLang: string
): Promise<string> {
  const genAI = checkPrerequisites();
  const model = "gemini-3-flash-preview";
  
  const audioPart = {
    mimeType,
    data: audioData.split(',')[1] || audioData
  };
  
  const contents = [{
    role: "user",
    parts: [
      { text: `Please transcribe this audio. Respond with ONLY the transcription in ${targetLang}. If you cannot understand the audio, respond with an empty string.` },
      { inlineData: audioPart }
    ]
  }];

  const result = await genAI.models.generateContent({
    model,
    contents
  });
  
  return result.text || '';
}

export interface ConversationResponse {
  text: string;
  feedback?: string;
  correction?: string;
  suggestions?: string[];
  culturalNote?: string;
  suggestedNextSteps?: string[];
  translation?: string;
}

export async function fetchConversationResponse(
   conversationHistory: { role: string; text: string }[],
   targetLang: string,
   uiLang: string,
   scenario: string,
   lessonContext?: string | { currentWord: string; translation: string; mistakes: string[] },
   metrics?: { accuracy: number; speedSeconds: number }
): Promise<ConversationResponse> {
  const genAI = checkPrerequisites();
  const model = "gemini-3-flash-preview";
  
  const metricsPart = metrics 
    ? `\nUser performance metrics - Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%, Response time: ${metrics.speedSeconds.toFixed(1)}s`
    : '';
  
  const contextPart = lessonContext ? `\nCurrent lesson context: ${lessonContext}` : '';
  
  const systemInstruction = `You are a friendly conversation tutor helping someone learn ${targetLang} through role-play scenarios.
${scenario}${contextPart}${metricsPart}
- Be encouraging and supportive
- If the user makes a mistake, provide gentle feedback
- Keep responses natural and conversational
- Always respond in ${uiLang} for explanations
- Use simple ${targetLang} vocabulary appropriate for learners
- Include occasional cultural notes when relevant`;
  
  const contents = conversationHistory.map(m => ({
    role: m.role as "user" | "model",
    parts: [{ text: m.text }]
  }));
  
  contents.push({ role: "user", parts: [{ text: "(continue the conversation)" }] });

  const result = await genAI.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: { parts: [{ text: systemInstruction }] }
    }
  });
  
  return { text: result.text || '' };
}

export interface InteractiveStoryScene {
   sceneText: string;
   sceneTranslation: string;
   choices: { id: string; text: string; translation: string; statType?: string }[];
   visualAid?: string;
   isEnding?: boolean;
   grammarNote?: string;
   languageTip?: string;
   keyVocabulary?: { word: string; translation: string; explanation: string }[];
   grammarBreakdown?: { rule: string; explanation: string }[];
   outcomeSummary?: string;
}

export async function fetchStoryScene(
   targetLang: string,
   uiLang: string,
   context: string,
   history: { scene: string; choice: string }[],
   difficulty: 'easy' | 'medium' | 'hard' | number,
   special?: { C: number; I: number; A: number }
): Promise<InteractiveStoryScene> {
   const genAI = checkPrerequisites();
   const model = "gemini-3-flash-preview";

   let historyText = '';
   if (history.length > 0) {
     historyText = '\n\nStory so far:\n' + history.map(h => `- ${h.scene}\n  User chose: ${h.choice}`).join('\n');
   }

   const systemInstruction = `You are an interactive story narrator for a language learning game set in a post-apocalyptic world.
   Create the next scene in ${targetLang} (UI: ${uiLang}).
   Difficulty: ${difficulty}/10.
   Context: ${context}${historyText}

   Format as JSON: { sceneText, sceneTranslation, choices: [{id, text, translation}], visualAid?, isEnding?, grammarNote? }
   - Provide 2-4 choices
   - sceneText is the narration in ${targetLang}
   - sceneTranslation is the ${uiLang} translation
   - visualAid describes an image prompt for the scene
   - isEnding is true if this is a scene ending
   - grammarNote is optional grammar tip`;

   const contents = [{ role: "user" as const, parts: [{ text: "Continue the story." }] }];

   const result = await genAI.models.generateContent({
     model,
     contents,
     config: {
       systemInstruction: { parts: [{ text: systemInstruction }] }
     }
   });

   try {
     return JSON.parse(result.text || '{}');
   } catch {
     return {
       sceneText: result.text || 'The wasteland stretches on...',
       sceneTranslation: 'The wasteland stretches on...',
       choices: []
     };
   }
 }

export interface ConversationResponse {
   text: string;
   feedback?: string;
   correction?: string;
   suggestions?: string[];
   culturalNote?: string;
   suggestedNextSteps?: string[];
   translation?: string;
}

export interface GrammarAnalysis {
   hasErrors: boolean;
   score: number;
   errors: { error: string; explanation: string; suggestion: string }[];
   suggestions: string[];
   alternatives?: string[];
   overallFeedback?: string;
}

export async function analyzeGrammar(
  text: string,
  targetLang: string,
  uiLang: string
): Promise<GrammarAnalysis> {
const prompt = `Analyze this text in ${targetLang} (UI: ${uiLang}): "${text}"
   Provide grammar feedback. Format as JSON: { score (0-100), errors: [{error, explanation, suggestion}], suggestions (array), alternatives? (array of strings), overallFeedback? }`;

  const response = await generateWithAI(prompt, `You are a grammar expert. Respond ONLY with valid JSON.`);
  
try {
     return JSON.parse(response);
   } catch {
     return {
        score: 100,
        hasErrors: false,
        errors: [],
        suggestions: []
      };
   }
 }