/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, triggerLevelUpEffects } from '../utils';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles clsx array syntax', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });

  it('merges tailwind classes without conflicts', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('triggerLevelUpEffects', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires confetti on call', async () => {
    const confetti = (await import('canvas-confetti')).default;
    triggerLevelUpEffects();
    vi.advanceTimersByTime(250);
    expect(confetti).toHaveBeenCalled();
    expect(confetti).toHaveBeenCalledTimes(2);
  });

  it('stops after duration', async () => {
    const confetti = (await import('canvas-confetti')).default;
    triggerLevelUpEffects();
    vi.advanceTimersByTime(3000);
    const callsBefore = confetti.mock.calls.length;
    vi.advanceTimersByTime(250);
    expect(confetti.mock.calls.length).toBe(callsBefore);
  });
});
