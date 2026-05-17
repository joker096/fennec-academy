/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SRSService, SRSStats, UserContext } from '../srsService';

const defaultStats: SRSStats = {
  interval: 0,
  stability: 0,
  difficulty: 5,
  easeFactor: 2.5,
  lastReviewed: new Date().toISOString(),
  nextReviewDate: new Date().toISOString(),
  correctStreak: 0,
  lapses: 0,
  sessionFailures: 0,
  mastered: false,
};

const defaultContext: UserContext = {
  special: { S: 5, P: 5, E: 5, C: 5, I: 5, A: 5, L: 5 },
  sessionReviews: 0,
  dailyReviews: 0,
  equippedPerks: [],
};

describe('SRSService.getCircadianFactor', () => {
  it('peaks around 10 AM', () => {
    const f10 = SRSService.getCircadianFactor(10);
    const f2 = SRSService.getCircadianFactor(2);
    expect(f10).toBeGreaterThan(f2);
  });

  it('has a second peak around 7 PM', () => {
    const f19 = SRSService.getCircadianFactor(19);
    const f14 = SRSService.getCircadianFactor(14);
    expect(f19).toBeGreaterThan(f14);
  });

  it('has lowest values at late night (0-5)', () => {
    const f3 = SRSService.getCircadianFactor(3);
    const f10 = SRSService.getCircadianFactor(10);
    expect(f3).toBeLessThan(f10);
  });

  it('returns minimum 0.05', () => {
    const f = SRSService.getCircadianFactor(3, 'acid_rain');
    expect(f).toBeGreaterThanOrEqual(0.05);
  });

  it('applies weather penalty for acid_rain', () => {
    const clear = SRSService.getCircadianFactor(10, 'clear');
    const acid = SRSService.getCircadianFactor(10, 'acid_rain');
    expect(acid).toBeLessThan(clear);
  });

  it('applies weather penalty for dust_storm', () => {
    const clear = SRSService.getCircadianFactor(10, 'clear');
    const storm = SRSService.getCircadianFactor(10, 'dust_storm');
    expect(storm).toBeLessThan(clear);
  });

  it('applies smaller penalty for fog', () => {
    const clear = SRSService.getCircadianFactor(10, 'clear');
    const fog = SRSService.getCircadianFactor(10, 'fog');
    expect(fog).toBeLessThan(clear);
  });
});

describe('SRSService.getFatigueMultiplier', () => {
  it('returns 1.0 for fresh session with average stats', () => {
    const f = SRSService.getFatigueMultiplier(defaultContext);
    expect(f).toBeGreaterThan(0.5);
    expect(f).toBeLessThanOrEqual(1);
  });

  it('decreases with high session reviews', () => {
    const fresh = SRSService.getFatigueMultiplier({ ...defaultContext, sessionReviews: 0 });
    const tired = SRSService.getFatigueMultiplier({ ...defaultContext, sessionReviews: 30 });
    expect(tired).toBeLessThan(fresh);
  });

  it('decreases with high daily reviews', () => {
    const fresh = SRSService.getFatigueMultiplier(defaultContext);
    const tired = SRSService.getFatigueMultiplier({ ...defaultContext, dailyReviews: 100 });
    expect(tired).toBeLessThan(fresh);
  });

  it('higher endurance mitigates fatigue', () => {
    const fatiguingContext = { ...defaultContext, sessionReviews: 30, dailyReviews: 50, currentMistakeStreak: 3 };
    const lowE = SRSService.getFatigueMultiplier({ ...fatiguingContext, special: { ...fatiguingContext.special, E: 1 } });
    const highE = SRSService.getFatigueMultiplier({ ...fatiguingContext, special: { ...fatiguingContext.special, E: 10 } });
    expect(highE).toBeGreaterThan(lowE);
  });

  it('higher intelligence mitigates fatigue', () => {
    const fatiguingContext = { ...defaultContext, sessionReviews: 30, dailyReviews: 50, currentMistakeStreak: 3 };
    const lowI = SRSService.getFatigueMultiplier({ ...fatiguingContext, special: { ...fatiguingContext.special, I: 1 } });
    const highI = SRSService.getFatigueMultiplier({ ...fatiguingContext, special: { ...fatiguingContext.special, I: 10 } });
    expect(highI).toBeGreaterThan(lowI);
  });

  it('deep_focus perk reduces fatigue', () => {
    const noPerk = SRSService.getFatigueMultiplier({ ...defaultContext, sessionReviews: 30 });
    const withPerk = SRSService.getFatigueMultiplier({ ...defaultContext, sessionReviews: 30, equippedPerks: ['deep_focus'] });
    expect(withPerk).toBeGreaterThan(noPerk);
  });

  it('mistake streak adds penalty', () => {
    const noMistakes = SRSService.getFatigueMultiplier(defaultContext);
    const withMistakes = SRSService.getFatigueMultiplier({ ...defaultContext, currentMistakeStreak: 5 });
    expect(withMistakes).toBeLessThan(noMistakes);
  });

  it('low cognitive load increases fatigue', () => {
    const full = SRSService.getFatigueMultiplier({ ...defaultContext, cognitiveLoad: 100 });
    const hungry = SRSService.getFatigueMultiplier({ ...defaultContext, cognitiveLoad: 30 });
    expect(hungry).toBeLessThan(full);
  });

  it('low hydration increases fatigue', () => {
    const full = SRSService.getFatigueMultiplier({ ...defaultContext, hydrationLevel: 100 });
    const thirsty = SRSService.getFatigueMultiplier({ ...defaultContext, hydrationLevel: 20 });
    expect(thirsty).toBeLessThan(full);
  });

  it('returns minimum 0.01', () => {
    const extreme = SRSService.getFatigueMultiplier({
      ...defaultContext,
      sessionReviews: 100,
      dailyReviews: 200,
      currentMistakeStreak: 20,
      special: { ...defaultContext.special, E: 1, I: 1 },
    });
    expect(extreme).toBeGreaterThanOrEqual(0.01);
  });

  it('considers session start time', () => {
    const fresh = SRSService.getFatigueMultiplier({ ...defaultContext, sessionStartTime: Date.now() });
    const old = SRSService.getFatigueMultiplier({ ...defaultContext, sessionStartTime: Date.now() - 3600000 });
    expect(old).toBeLessThan(fresh);
  });
});

describe('SRSService.calculateUpdate', () => {
  let baseDate: number;

  beforeEach(() => {
    baseDate = new Date(2025, 0, 15, 10, 0, 0).getTime();
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('successful reviews (quality >= 3)', () => {
    it('sets interval to 1 on first correct streak', () => {
      const result = SRSService.calculateUpdate(defaultStats, 4, 'hola', defaultContext);
      expect(result.interval).toBe(1);
      expect(result.correctStreak).toBe(1);
      expect(result.sessionFailures).toBe(0);
    });

    it('increases interval on second correct streak', () => {
      const stats = { ...defaultStats, correctStreak: 1, interval: 1 };
      const result = SRSService.calculateUpdate(stats, 4, 'hola', defaultContext);
      expect(result.interval).toBeGreaterThanOrEqual(3);
      expect(result.correctStreak).toBe(2);
    });

    it('grows interval exponentially on subsequent streaks', () => {
      const stats: SRSStats = {
        ...defaultStats,
        correctStreak: 5,
        interval: 10,
        easeFactor: 2.5,
      };
      const result = SRSService.calculateUpdate(stats, 4, 'hola', defaultContext);
      expect(result.interval).toBeGreaterThan(10);
      expect(result.correctStreak).toBe(6);
    });

    it('increases ease factor with high quality', () => {
      const result = SRSService.calculateUpdate(defaultStats, 5, 'test', defaultContext);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('memory_master perk boosts ease factor', () => {
      const base = SRSService.calculateUpdate(defaultStats, 4, 'test', defaultContext);
      const perk = SRSService.calculateUpdate(defaultStats, 4, 'test', { ...defaultContext, equippedPerks: ['memory_master'] });
      expect(perk.easeFactor).toBeGreaterThan(base.easeFactor);
    });

    it('linguist perk boosts ease factor', () => {
      const base = SRSService.calculateUpdate(defaultStats, 4, 'test', defaultContext);
      const perk = SRSService.calculateUpdate(defaultStats, 4, 'test', { ...defaultContext, equippedPerks: ['linguist'] });
      expect(perk.easeFactor).toBeGreaterThan(base.easeFactor);
    });

    it('higher quality gives larger ease factor increase', () => {
      const q3 = SRSService.calculateUpdate(defaultStats, 3, 'test', defaultContext);
      const q5 = SRSService.calculateUpdate(defaultStats, 5, 'test', defaultContext);
      expect(q5.easeFactor).toBeGreaterThan(q3.easeFactor);
    });

    it('marks as mastered when interval is large', () => {
      const stats: SRSStats = {
        ...defaultStats,
        correctStreak: 10,
        interval: 50,
        easeFactor: 2.5,
      };
      const result = SRSService.calculateUpdate(stats, 4, 'test', defaultContext);
      expect(result.mastered).toBe(true);
    });
  });

  describe('failed reviews (quality < 3)', () => {
    it('resets interval and correct streak on failure', () => {
      const stats = { ...defaultStats, correctStreak: 5, interval: 10 };
      const result = SRSService.calculateUpdate(stats, 0, 'hola', defaultContext);
      expect(result.interval).toBe(0);
      expect(result.correctStreak).toBe(0);
      expect(result.mastered).toBe(false);
    });

    it('increments lapses on failure', () => {
      const result = SRSService.calculateUpdate(defaultStats, 1, 'test', defaultContext);
      expect(result.lapses).toBe(1);
    });

    it('decreases ease factor on failure', () => {
      const stats = { ...defaultStats, easeFactor: 2.5 };
      const result = SRSService.calculateUpdate(stats, 0, 'test', defaultContext);
      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('marks as leech after 8 lapses', () => {
      const stats = { ...defaultStats, lapses: 7, easeFactor: 2.0 };
      const result = SRSService.calculateUpdate(stats, 0, 'test', defaultContext);
      expect(result.isLeech).toBe(true);
      expect(result.lapses).toBe(8);
    });

    it('increases difficulty on failure', () => {
      const stats = { ...defaultStats, difficulty: 5 };
      const result = SRSService.calculateUpdate(stats, 0, 'test', defaultContext);
      expect(result.difficulty).toBeGreaterThan(5);
    });
  });

  describe('intelligence scaling', () => {
    it('higher intelligence gives longer intervals on success', () => {
      const lowI = SRSService.calculateUpdate(
        { ...defaultStats, correctStreak: 2, interval: 4 },
        4, 'test',
        { ...defaultContext, special: { ...defaultContext.special, I: 1 } }
      );
      const highI = SRSService.calculateUpdate(
        { ...defaultStats, correctStreak: 2, interval: 4 },
        4, 'test',
        { ...defaultContext, special: { ...defaultContext.special, I: 10 } }
      );
      expect(highI.interval).toBeGreaterThanOrEqual(lowI.interval);
    });
  });

  describe('edge cases', () => {
    it('handles minimum stats gracefully', () => {
      const minStats: SRSStats = { ...defaultStats, easeFactor: 0, difficulty: 1 };
      const result = SRSService.calculateUpdate(minStats, 0, 'a', defaultContext);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
      expect(result.difficulty).toBeGreaterThan(1);
    });

    it('handles long words with high complexity', () => {
      const longWord = 'pneumonoultramicroscopicsilicovolcanoconiosis';
      const result = SRSService.calculateUpdate(defaultStats, 4, longWord, defaultContext);
      expect(result.interval).toBe(1);
    });

    it('handles words with unicode characters', () => {
      const unicodeWord = 'こんにちは';
      const result = SRSService.calculateUpdate(defaultStats, 4, unicodeWord, defaultContext);
      expect(result.interval).toBe(1);
    });

    it('sets nextReviewDate to 15 min for failed cards', () => {
      const result = SRSService.calculateUpdate(defaultStats, 0, 'test', defaultContext);
      const nextDate = new Date(result.nextReviewDate);
      const diffMs = nextDate.getTime() - baseDate;
      expect(diffMs).toBe(15 * 60 * 1000);
    });

    it('sets nextReviewDate to future for successful cards', () => {
      const result = SRSService.calculateUpdate(defaultStats, 4, 'test', defaultContext);
      const nextDate = new Date(result.nextReviewDate);
      expect(nextDate.getTime()).toBeGreaterThan(baseDate);
    });

    it('preserves mnemonicImageUrl', () => {
      const stats = { ...defaultStats, mnemonicImageUrl: 'http://example.com/img.jpg' };
      const result = SRSService.calculateUpdate(stats, 4, 'test', defaultContext);
      expect(result.mnemonicImageUrl).toBe('http://example.com/img.jpg');
    });
  });
});
