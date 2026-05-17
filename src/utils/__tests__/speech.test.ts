/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSpeechRecognition, isSpeechRecognitionSupported, startSpeechRecognition } from '../speech';

class MockSpeechRecognition {
  lang = '';
  continuous = false;
  interimResults = false;
  onstart: (() => void) | null = null;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
}

describe('speech recognition', () => {
  let mockRecognition: MockSpeechRecognition;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRecognition = new MockSpeechRecognition();
    vi.stubGlobal('SpeechRecognition', vi.fn(() => mockRecognition));
    vi.stubGlobal('webkitSpeechRecognition', undefined);
  });

  describe('getSpeechRecognition', () => {
    it('returns a SpeechRecognition instance when supported', () => {
      const recognition = getSpeechRecognition();
      expect(recognition).toBeInstanceOf(MockSpeechRecognition);
    });

    it('returns null when not supported', () => {
      vi.stubGlobal('SpeechRecognition', undefined);
      expect(getSpeechRecognition()).toBeNull();
    });

    it('returns null in non-browser environment', () => {
      vi.stubGlobal('SpeechRecognition', undefined);
      const windowSpy = vi.spyOn(globalThis as any, 'window', 'get');
      windowSpy.mockReturnValue(undefined as any);
      expect(getSpeechRecognition()).toBeNull();
      windowSpy.mockRestore();
    });
  });

  describe('isSpeechRecognitionSupported', () => {
    it('returns true when supported', () => {
      expect(isSpeechRecognitionSupported()).toBe(true);
    });

    it('returns false when not supported', () => {
      vi.stubGlobal('SpeechRecognition', undefined);
      expect(isSpeechRecognitionSupported()).toBe(false);
    });
  });

  describe('startSpeechRecognition', () => {
    it('configures and starts recognition', () => {
      const onResult = vi.fn();
      const onStart = vi.fn();
      const recognition = startSpeechRecognition({
        lang: 'en-US',
        continuous: true,
        interimResults: false,
        onResult,
        onStart,
      }) as any;
      expect(recognition).not.toBeNull();
      expect(recognition.lang).toBe('en-US');
      expect(recognition.continuous).toBe(true);
      expect(recognition.interimResults).toBe(false);
      expect(recognition.start).toHaveBeenCalled();
    });

    it('returns null and calls onError when unsupported', () => {
      vi.stubGlobal('SpeechRecognition', undefined);
      const onError = vi.fn();
      const result = startSpeechRecognition({
        lang: 'en',
        onError,
      });
      expect(result).toBeNull();
      expect(onError).toHaveBeenCalledWith('Speech recognition not supported');
    });

    it('handles result events with final transcript', () => {
      const onResult = vi.fn();
      const recognition = startSpeechRecognition({
        lang: 'en',
        onResult,
      }) as any;
      recognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: true, 0: { transcript: 'hello' } },
          { isFinal: true, 0: { transcript: ' world' } },
        ],
      });
      expect(onResult).toHaveBeenCalled();
      const [transcript, isFinal] = onResult.mock.calls[0];
      expect(transcript).toBe('hello world');
      expect(isFinal).toBe(true);
    });

    it('handles result events with interim transcript', () => {
      const onResult = vi.fn();
      const recognition = startSpeechRecognition({
        lang: 'en',
        onResult,
      }) as any;
      recognition.onresult({
        resultIndex: 0,
        results: [
          { isFinal: false, [0]: { transcript: 'thinking' } },
        ],
      });
      expect(onResult).toHaveBeenCalledWith('thinking', false);
    });

    it('handles error events', () => {
      const onError = vi.fn();
      const recognition = startSpeechRecognition({
        lang: 'en',
        onError,
      }) as any;
      recognition.onerror({ error: 'no-speech' });
      expect(onError).toHaveBeenCalledWith('no-speech');
    });

    it('handles start events', () => {
      const onStart = vi.fn();
      const recognition = startSpeechRecognition({
        lang: 'en',
        onStart,
      }) as any;
      recognition.onstart();
      expect(onStart).toHaveBeenCalled();
    });

    it('handles end events', () => {
      const onEnd = vi.fn();
      const recognition = startSpeechRecognition({
        lang: 'en',
        onEnd,
      }) as any;
      recognition.onend();
      expect(onEnd).toHaveBeenCalled();
    });

    it('handles start() throwing an error', () => {
      mockRecognition.start.mockImplementation(() => { throw new Error('permission denied'); });
      const onError = vi.fn();
      const result = startSpeechRecognition({ lang: 'en', onError });
      expect(result).toBeNull();
      expect(onError).toHaveBeenCalledWith('Failed to start');
    });
  });
});
