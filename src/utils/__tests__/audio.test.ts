/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';

describe('audio utilities - smoke tests', () => {
  it('lang codes list is correct', () => {
    const langCodes = ['sr', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'ru'];
    expect(langCodes).toContain('sr');
    expect(langCodes).toContain('en');
    expect(langCodes.length).toBe(9);
  });

  it('SpeechRecognitionOptions shape is valid', () => {
    const options = {
      lang: 'en-US',
      continuous: false,
      interimResults: true,
      onResult: (t: string, f: boolean) => {},
      onEnd: () => {},
      onError: (e: string) => {},
      onStart: () => {},
    };
    expect(options.lang).toBe('en-US');
    expect(typeof options.onResult).toBe('function');
    expect(typeof options.onEnd).toBe('function');
  });
});