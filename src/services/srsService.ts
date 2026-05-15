
/**
 * Advanced Spaced Repetition System (SRS) Service
 * Inspired by FSRS v4.5 and Circadian Rhythm Research
 */

export interface SRSStats {
  interval: number;
  stability: number;
  difficulty: number;
  easeFactor: number;
  lastReviewed: string;
  nextReviewDate: string;
  correctStreak: number;
  lapses: number;
  sessionFailures: number;
  mnemonicImageUrl?: string;
  mastered: boolean;
  isLeech?: boolean;
}

export interface UserContext {
  special: {
    S: number;
    P: number;
    E: number;
    C: number;
    I: number;
    A: number;
    L: number;
  };
  sessionReviews: number;
  dailyReviews: number;
  equippedPerks: string[];
  synergies?: string[];
  cognitiveLoad?: number;
  hydrationLevel?: number;
  weather?: string;
}

export class SRSService {
  /**
   * Calculate circadian rhythm factor.
   * Enhanced model: considers user's local "Biological Prime Time" and "Slump" periods.
   * Peaks at 10:00 (prime focus) and 19:00 (memory consolidation).
   * Slump at 14:00-16:00 (post-lunch dip).
   * Late night (00:00-05:00) has a significant consolidation penalty.
   */
  public static getCircadianFactor(hour: number, weather?: string): number {
    // Primary focus peak at 10 AM (Gaussian distribution)
    const focusPeak = Math.exp(-Math.pow(hour - 10, 2) / 8);
    // Consolidation peak at 7 PM (Gaussian distribution)
    const consolidationPeak = 0.9 * Math.exp(-Math.pow(hour - 19, 2) / 10);
    
    // The "Afternoon Slump" - around 2:30 PM (14.5)
    // Dips retention by about 15%
    const afternoonSlump = 0.2 * Math.exp(-Math.pow(hour - 14.5, 2) / 4);

    // Morning clarity (Post-sleep) - 6 AM to 10 AM
    const morningClarity = hour >= 6 && hour <= 10 ? 1.2 : 1.0;
    
    // Dip at 3 AM (Very low - lack of sleep severely harms memory)
    // Severe penalty for late-night "crunching"
    const sleepDeprivation = (hour >= 0 && hour <= 5) ? 0.6 : 0;
    
    // Weather factors: hazardous conditions distract and stress the survivor
    let weatherPenalty = 0;
    if (weather === 'acid_rain' || weather === 'dust_storm') weatherPenalty = 0.25;
    if (weather === 'fog') weatherPenalty = 0.12;

    const baseline = 0.8;
    // Calculate final factor (0 to 1.5)
    const rawFactor = (baseline + 0.6 * Math.max(focusPeak, consolidationPeak) - afternoonSlump) * morningClarity - sleepDeprivation - weatherPenalty;
    
    return Math.max(0.05, rawFactor);
  }

  /**
   * Calculate fatigue multiplier (SRS 4.0).
   * Considers physical needs, session energy, and brain-strain accumulation.
   * Special (E) Endurance stat acts as a powerful buffer against memory decay.
   * Special (I) Intelligence stat improves recovery and focus resilience.
   */
  public static getFatigueMultiplier(context: UserContext & { sessionStartTime?: number; currentMistakeStreak?: number }): number {
    // Endurance (E) scales mitigation linearly - physical stamina
    // Intelligence (I) scales focus resilience - mental stamina
    const enduranceMitigation = 1 + (context.special.E - 5) * 0.15;
    const intelligenceResilience = 1 + (context.special.I - 5) * 0.1;
    const combinedResilience = (enduranceMitigation * 0.6) + (intelligenceResilience * 0.4);
    
    // Time-on-task effect: cognitive performance drops exponentially after a certain threshold
    const sessionTimeMinutes = context.sessionStartTime ? (Date.now() - context.sessionStartTime) / (1000 * 60) : 0;
    // Penalty starts steepening after 15 minutes of continuous study
    const timeFatigue = Math.pow(Math.max(0, sessionTimeMinutes - 15), 1.3) * 0.015;
    
    // Accumulation fatigue: Based on total workload (current session + daily total)
    let loadFatigue = (context.sessionReviews * 0.01) + (context.dailyReviews * 0.005);
    
    // Neural Jamming: Processing too much data at once
    if (context.sessionReviews >= 25) {
      loadFatigue += 0.25; 
    }
    
    // Bio-Metabolic stress: Hunger/Thirst impact mental clarity
    // These are now more linear - even slight drops impact performance
    const cognitiveLoadVal = context.cognitiveLoad ?? 100;
    const hydrationLevelVal = context.hydrationLevel ?? 100;
    
    const hungerFatigue = Math.max(0, (100 - cognitiveLoadVal) * 0.005);
    const thirstFatigue = Math.max(0, (100 - hydrationLevelVal) * 0.008);
    
    // Frustration factor: Repeated mistakes cloud judgment
    const streakPenalty = (context.currentMistakeStreak || 0) * 0.08;

    const perkFatigueMitigation = context.equippedPerks.includes('deep_focus') ? 0.5 : 1.0;
    const totalFatigue = ((timeFatigue + loadFatigue + hungerFatigue + thirstFatigue + streakPenalty) * perkFatigueMitigation) / combinedResilience;
    
    // Return performance multiplier: 1.0 is full mental energy, 0.05 is exhaustion
    // Standard logistic function for smoother performance scaling
    return Math.max(0.01, 1 / (1 + Math.exp(12 * (totalFatigue - 0.65))));
  }

  /**
   * Calculate cognitive load of a word.
   */
  private static getWordComplexityFactor(word: string): number {
    // Longer words and words with complex character patterns are harder
    const lengthFactor = Math.min(1.4, 0.7 + (word.length * 0.07));
    // Non-ASCII characters (kanji, cyrillic, etc) add specific complexity
    const complexityScore = word.split('').reduce((acc, char) => {
      const code = char.charCodeAt(0);
      if (code > 20000) return acc + 1.25; // Kanji-like
      if (code > 127) return acc + 1.1; // Extended
      return acc + 1;
    }, 0) / word.length;
    
    return lengthFactor * complexityScore;
  }

  /**
   * Calculate next interval and update stats using enhanced SM-2 algorithm.
   * Incorporates circadian factors, fatigue, and "Heroic Recall" rewards.
   * quality: 0 (forgot) to 5 (perfect)
   */
  public static calculateUpdate(
    current: SRSStats,
    quality: number,
    word: string,
    context: UserContext & { sessionStartTime?: number; currentMistakeStreak?: number }
  ): SRSStats {
    const now = new Date();
    const hour = now.getHours();
    
    // 1. Environmental & Biological Factors
    const circadian = this.getCircadianFactor(hour, context.weather);
    const fatigue = this.getFatigueMultiplier(context);
    const complexity = this.getWordComplexityFactor(word);
    
    // Intelligence (I) now has a much stronger role in memory architecture
    // It provides a "Retention Scaling" factor that directly boosts stability growth
    const intelligenceRetentionScaling = 1 + (context.special.I - 5) * 0.08;
    
    // Perception (P) still helps with initial encoding ease
    const focusBonus = 0.05 * (context.special.P - 5);
    
    // Perception Synergy: Boost interval growth
    const perceptionSynergyMultiplier = context.synergies?.includes('P') ? 1.2 : 1.0;
    
    // Agility (A) bonus for "Reflexive Recall"
    const speedBonus = quality >= 4 ? 0.08 * (context.special.A - 5) : 0;

    // 2. SM-2 Algorithm Logic
    let { stability, difficulty, interval, correctStreak, lapses, sessionFailures, mastered, easeFactor, isLeech } = current;
    
    // Default initial ease factor is 2.5
    if (!easeFactor) easeFactor = 2.5;
    if (lapses === undefined) lapses = 0;

    if (quality >= 3) {
      // SUCCESS
      
      // Calculate "Encoding environment" quality
      const stabilityMultiplier = (circadian * 0.25) + (fatigue * 0.75);
      
      const heroicRecallWeight = quality >= 4 ? Math.max(0, 1 - (fatigue + circadian)) : 0;
      const heroicBonus = heroicRecallWeight * 0.5 * intelligenceRetentionScaling;

      // Penalty for previous lapses - each lapse slows down the growth of the interval
      const lapsePenaltyFactor = Math.max(0.5, 1 - (lapses * 0.1));

      if (correctStreak === 0) {
        interval = 1;
      } else if (correctStreak === 1) {
        interval = Math.ceil(4 * intelligenceRetentionScaling * lapsePenaltyFactor); 
      } else if (correctStreak === 2) {
        interval = Math.ceil(10 * intelligenceRetentionScaling * lapsePenaltyFactor);
      } else {
        // SM-2: I(n) = I(n-1) * EF
        const adjustedEF = easeFactor * intelligenceRetentionScaling * stabilityMultiplier;
        const growthFactor = (adjustedEF * (1 / complexity) + heroicBonus) * lapsePenaltyFactor * perceptionSynergyMultiplier;
        interval = Math.ceil(interval * Math.max(1.2, growthFactor));
      }
      
      correctStreak += 1;
      sessionFailures = 0;

      // Update Easiness Factor (EF)
      // Classic Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      const deltaEF = 0.1 - (5 - quality) * (0.1 + (5 - quality) * 0.02);
      
      const perkBoost = context.equippedPerks.includes('memory_master') ? 0.3 : 0;
      const linguistBoost = context.equippedPerks.includes('linguist') ? 0.2 : 0;
      
      easeFactor = Math.max(1.3, easeFactor + deltaEF + focusBonus + speedBonus + perkBoost + linguistBoost + (heroicBonus * 0.4));
      
      stability = interval;
      difficulty = Math.max(1, Math.min(10, 11 - (easeFactor * intelligenceRetentionScaling / 2.5)));
    } else {
      // FAILURE
      
      const fatigueExcuse = (fatigue < 0.4 || circadian < 0.4) ? 0.2 : 0;
      
      correctStreak = 0;
      lapses = (lapses || 0) + 1;
      sessionFailures = (sessionFailures || 0) + 1;
      mastered = false;
      interval = 0; 
      
      // Reduce ease factor on failure more significantly if multiple lapses
      const baseEFReduction = 0.2 + (lapses * 0.05);
      const intelligenceMitigation = Math.max(0, (context.special.I - 5) * 0.02);
      easeFactor = Math.max(1.3, easeFactor - (baseEFReduction - fatigueExcuse - intelligenceMitigation));
      
      stability = 0.3;
      difficulty = Math.min(10, difficulty + (1.5 - fatigueExcuse));

      // Leech Detection: If a word is forgotten too many times, mark as leech
      if (lapses >= 8) {
        isLeech = true;
      }
    }

    // Mastered check: Harder to master if Intelligence is low
    const masteryThreshold = Math.ceil(60 / intelligenceRetentionScaling);
    if (interval >= masteryThreshold || (correctStreak >= 12 && interval >= 25)) {
      mastered = true;
    }

    const nextReview = new Date();
    if (interval === 0) {
      nextReview.setMinutes(nextReview.getMinutes() + 15); // Review in 15 mins for failed cards
    } else {
      nextReview.setDate(nextReview.getDate() + interval);
      
      // Dynamic Prime-Time Scheduling (SRS 4.5)
      // High Intelligence (I) users naturally optimize their review windows for better consolidation.
      // We automatically shift reviews toward the user's biological peaks (10:00 or 19:00).
      const nextHour = nextReview.getHours();
      const intelligence = context.special.I || 5;
      const optimizationStrength = 0.1 * intelligence; // 0 to 1 scaling

      if (nextHour >= 0 && nextHour <= 7) {
        // Late night review? Shift to morning peak.
        nextReview.setHours(10, 0, 0, 0);
      } else if (nextHour >= 13 && nextHour <= 17) {
        // Afternoon slump? Shift to evening consolidation peak if Intelligence is high enough.
        if (Math.random() < optimizationStrength) {
          nextReview.setHours(19, 0, 0, 0);
        }
      } else if (nextHour >= 21) {
        // Very late? Shift to next day's morning peak.
        nextReview.setDate(nextReview.getDate() + 1);
        nextReview.setHours(10, 0, 0, 0);
      }
      
      // Prioritize recall when most likely to forget:
      // If the word was hard (low ease) or complexity was high, we slightly 
      // nudge the review EARLIER into a slot where focus is predicted to be high.
      if (complexity > 1.2 || easeFactor < 2.0) {
        const nudgeMinutes = (1.5 - fatigue) * 120; // Up to 3 hours earlier nudge
        nextReview.setMinutes(nextReview.getMinutes() - nudgeMinutes);
      }
    }

    return {
      interval,
      stability,
      difficulty,
      easeFactor,
      lastReviewed: now.toISOString(),
      nextReviewDate: nextReview.toISOString(),
      correctStreak,
      lapses: lapses || 0,
      sessionFailures: sessionFailures || 0,
      mnemonicImageUrl: current.mnemonicImageUrl,
      mastered,
      isLeech
    };
  }
}
