/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sounds } from '../sounds';

const mockOscillator = {
  type: 'square',
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

const mockAudioContext = {
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGain),
  get currentTime() { return 100; },
  get state() { return 'running'; },
  resume: vi.fn(),
};

describe('SoundManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));
    vi.stubGlobal('webkitAudioContext', undefined);
  });

  it('playClick creates an 800Hz square wave', () => {
    sounds.playClick();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(800, 100);
    expect(mockOscillator.type).toBe('square');
  });

  it('playCorrect plays two sine tones', () => {
    vi.useFakeTimers();
    sounds.playCorrect();
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(600, 100);
    vi.advanceTimersByTime(50);
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(900, 100);
    vi.useRealTimers();
  });

  it('playIncorrect plays two sawtooth tones', () => {
    vi.useFakeTimers();
    sounds.playIncorrect();
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(200, 100);
    expect(mockOscillator.type).toBe('sawtooth');
    vi.advanceTimersByTime(100);
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(150, 100);
    vi.useRealTimers();
  });

  it('playLevelUp plays a fanfare of 4 notes', () => {
    vi.useFakeTimers();
    sounds.playLevelUp();
    vi.advanceTimersByTime(600);
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 100);
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 100);
    vi.useRealTimers();
  });

  it('playToggle plays a 1200Hz square wave', () => {
    sounds.playToggle();
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(1200, 100);
    expect(mockOscillator.type).toBe('square');
  });

  it('initializes AudioContext lazily', () => {
    expect(mockAudioContext.resume).not.toHaveBeenCalled();
  });


});
