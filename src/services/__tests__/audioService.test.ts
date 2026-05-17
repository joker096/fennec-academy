/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { audioService, SoundEffect, AmbientSound } from '../audioService';

function setupAudioMock() {
  const mockAudio = {
    src: '',
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    currentTime: 0,
    volume: 1,
    loop: false,
    addEventListener: vi.fn(),
  };
  const AudioMock = vi.fn((src?: string) => {
    mockAudio.src = src || '';
    return mockAudio;
  });
  vi.stubGlobal('Audio', AudioMock);
  return { AudioMock, mockAudio };
}

describe('AudioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('SoundEffect enum', () => {
    it('has all sound effect paths', () => {
      expect(SoundEffect.CLICK).toContain('.wav');
      expect(SoundEffect.SUCCESS).toContain('.wav');
      expect(SoundEffect.LEVEL_UP).toContain('.wav');
      expect(SoundEffect.XP_GAIN).toContain('.wav');
      expect(SoundEffect.CARD_FLIP).toContain('.wav');
      expect(SoundEffect.NOTIFICATION).toContain('.wav');
      expect(SoundEffect.ERROR).toContain('.wav');
      expect(SoundEffect.STIMPAK).toContain('.wav');
      expect(SoundEffect.EAT).toContain('.wav');
      expect(SoundEffect.DRINK).toContain('.wav');
      expect(SoundEffect.HURT).toContain('.wav');
      expect(SoundEffect.COLLECT).toContain('.wav');
    });

    it('CHECK and REMOVE are aliases', () => {
      expect(SoundEffect.CHECK).toBe(SoundEffect.SUCCESS);
      expect(SoundEffect.REMOVE).toBe(SoundEffect.CLICK);
    });
  });

  describe('AmbientSound enum', () => {
    it('has valid URL patterns', () => {
      expect(AmbientSound.RAIN).toContain('https://');
      expect(AmbientSound.WIND).toContain('https://');
      expect(AmbientSound.THUNDER).toContain('https://');
      expect(AmbientSound.STORM).toContain('https://');
    });
  });

  describe('play', () => {
    it('does nothing when disabled', () => {
      const { AudioMock } = setupAudioMock();
      audioService.setEnabled(false);
      audioService.play(SoundEffect.CLICK);
      expect(AudioMock).not.toHaveBeenCalled();
    });

    it('creates and plays audio when enabled', () => {
      const { AudioMock, mockAudio } = setupAudioMock();
      audioService.setEnabled(true);
      audioService.play(SoundEffect.NOTIFICATION);
      expect(AudioMock).toHaveBeenCalledWith(SoundEffect.NOTIFICATION);
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('can play by string path', () => {
      const { AudioMock } = setupAudioMock();
      audioService.setEnabled(true);
      audioService.play('/custom/sound.mp3');
      expect(AudioMock).toHaveBeenCalledWith('/custom/sound.mp3');
    });

    it('caches audio elements', () => {
      const { AudioMock } = setupAudioMock();
      audioService.setEnabled(true);
      audioService.play(SoundEffect.STIMPAK);
      audioService.play(SoundEffect.STIMPAK);
      expect(AudioMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('setEnabled / isEnabled', () => {
    it('defaults to enabled', () => {
      expect(audioService.isEnabled()).toBe(true);
    });

    it('stores enabled state in localStorage', () => {
      audioService.setEnabled(false);
      expect(audioService.isEnabled()).toBe(false);
      expect(localStorage.getItem('soundEnabled')).toBe('false');

      audioService.setEnabled(true);
      expect(audioService.isEnabled()).toBe(true);
      expect(localStorage.getItem('soundEnabled')).toBe('true');
    });
  });

  describe('playAmbient', () => {
    it('does nothing when disabled', () => {
      const { AudioMock } = setupAudioMock();
      audioService.setEnabled(false);
      audioService.playAmbient(AmbientSound.RAIN);
      expect(AudioMock).not.toHaveBeenCalled();
    });

    it('starts playing ambient sound when enabled', () => {
      const { AudioMock, mockAudio } = setupAudioMock();
      audioService.setEnabled(true);
      audioService.playAmbient(AmbientSound.STORM);
      expect(AudioMock).toHaveBeenCalledWith(AmbientSound.STORM);
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('does not restart if same ambient is already playing', () => {
      vi.useFakeTimers();
      const { AudioMock, mockAudio } = setupAudioMock();
      audioService.setEnabled(true);
      audioService.playAmbient(AmbientSound.RAIN);
      AudioMock.mockClear();
      mockAudio.play.mockClear();
      audioService.playAmbient(AmbientSound.RAIN);
      expect(mockAudio.play).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
