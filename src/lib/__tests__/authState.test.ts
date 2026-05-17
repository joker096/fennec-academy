/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateState,
  saveState,
  getState,
  clearState,
  handleOAuthCallback,
} from '../authState';

const OAUTH_STATE_KEY = 'oauth_state';
const OAUTH_STATE_COOKIE = 'oauth_state_fb';

describe('authState', () => {
  beforeEach(() => {
    clearState();
  });

  afterEach(() => {
    clearState();
  });

  describe('generateState', () => {
    it('generates a non-empty string', () => {
      const state = generateState();
      expect(typeof state).toBe('string');
      expect(state.length).toBeGreaterThan(0);
    });

    it('generates unique values', () => {
      const s1 = generateState();
      const s2 = generateState();
      expect(s1).not.toBe(s2);
    });
  });

  describe('saveState + getState', () => {
    it('stores and retrieves from sessionStorage by default', () => {
      const state = 'test-session-123';
      saveState(state);
      expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBe(state);

      const retrieved = getState();
      expect(retrieved).toBe(state);
      expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
    });

    it('falls back to localStorage when sessionStorage is unavailable', () => {
      const originalSessionStorage = window.sessionStorage;
      Object.defineProperty(window, 'sessionStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const state = 'test-local-456';
      saveState(state);
      expect(localStorage.getItem(OAUTH_STATE_KEY)).toBe(state);

      const retrieved = getState();
      expect(retrieved).toBe(state);
      expect(localStorage.getItem(OAUTH_STATE_KEY)).toBeNull();

      // Restore
      Object.defineProperty(window, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });

    it('falls back to cookie when both storages are unavailable', () => {
      const originalSessionStorage = window.sessionStorage;
      const originalLocalStorage = window.localStorage;

      Object.defineProperty(window, 'sessionStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const state = 'test-cookie-789';
      saveState(state);
      expect(document.cookie).toContain(encodeURIComponent(state));

      const retrieved = getState();
      expect(retrieved).toBe(state);
      expect(document.cookie).not.toContain(encodeURIComponent(state));

      // Restore
      Object.defineProperty(window, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    });

    it('clears state from all storages', () => {
      saveState('clear-test');
      clearState();
      expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
      expect(localStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
      expect(document.cookie).not.toContain('clear-test');
    });
  });

  describe('handleOAuthCallback', () => {
    it('returns success when state matches', () => {
      const state = 'matching-state';
      saveState(state);
      const result = handleOAuthCallback(`https://app.test/callback?state=${state}&code=abc`);
      expect(result.success).toBe(true);
      expect(result.state).toBe(state);
    });

    it('returns error when saved state is missing', () => {
      clearState();
      const result = handleOAuthCallback(`https://app.test/callback?state=whatever&code=abc`);
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing initial state');
    });

    it('returns error when state mismatch', () => {
      saveState('real-state');
      const result = handleOAuthCallback(`https://app.test/callback?state=fake-state&code=abc`);
      expect(result.success).toBe(false);
      expect(result.error).toContain('state mismatch');
    });
  });
});
