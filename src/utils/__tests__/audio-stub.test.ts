/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Stub Audio for jsdom
class MockAudio {
  src = '';
  play = vi.fn().mockResolvedValue(undefined as any);
  pause = vi.fn();
  load = vi.fn();
  currentTime = 0;
  volume = 1;
  muted = false;
  constructor(src: string) { this.src = src; }
}
vi.stubGlobal('Audio', MockAudio as any);

describe('Audio stub in jsdom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates Audio with src set', () => {
    const audio = new (globalThis as any).Audio('test.mp3');
    expect(audio.src).toContain('test.mp3');
    expect(typeof audio.play).toBe('function');
  });

  it('can call play()', async () => {
    const audio = new (globalThis as any).Audio('test.mp3');
    await expect(audio.play()).resolves.toBeUndefined();
    expect(audio.play).toHaveBeenCalledTimes(1);
  });
});