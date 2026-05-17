/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mapSupabaseUser,
  signUpWithEmail,
  signInWithEmail,
  handleAuthState,
  subscribeToAuthChanges,
  sendResetOTP,
  verifyResetOTP,
  updatePassword,
} from '../auth';

// Mock Supabase module
const mockUnsubscribe = vi.fn();

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: mockUnsubscribe } } })),
      signOut: vi.fn(),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      updateUser: vi.fn(),
    },
  },
  getCurrentSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: mockUnsubscribe } } })),
  signOutSupabase: vi.fn(),
}));

import { supabase, getCurrentSession } from '../supabase';

const mockedSignUp = supabase.auth.signUp as ReturnType<typeof vi.fn>;
const mockedSignIn = supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>;
const mockedGetCurrentSession = getCurrentSession as unknown as ReturnType<typeof vi.fn>;
const mockedSignInWithOtp = supabase.auth.signInWithOtp as ReturnType<typeof vi.fn>;
const mockedVerifyOtp = supabase.auth.verifyOtp as ReturnType<typeof vi.fn>;
const mockedUpdateUser = supabase.auth.updateUser as ReturnType<typeof vi.fn>;

describe('auth helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('mapSupabaseUser', () => {
    it('returns null for null user', () => {
      expect(mapSupabaseUser(null)).toBeNull();
    });

    it('maps Supabase user correctly', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.png',
        },
      } as any;

      const result = mapSupabaseUser(user);
      expect(result).toEqual({
        uid: 'user-123',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/avatar.png',
        role: 'user',
      });
    });

    it('falls back to email prefix for displayName', () => {
      const user = {
        id: 'user-456',
        email: 'john@example.com',
        user_metadata: {},
      } as any;

      const result = mapSupabaseUser(user);
      expect(result?.displayName).toBe('john');
    });
  });

  describe('signUpWithEmail', () => {
    it('creates user successfully', async () => {
      const fakeUser = {
        id: 'new-user',
        email: 'new@example.com',
        user_metadata: {},
      };
      mockedSignUp.mockResolvedValue({ data: { user: fakeUser }, error: null });

      const result = await signUpWithEmail('new@example.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.user?.uid).toBe('new-user');
      expect(mockedSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      });
    });

    it('throws on error', async () => {
      mockedSignUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already registered' },
      });

      await expect(signUpWithEmail('existing@example.com', 'password123')).rejects.toThrow(
        'Email already registered'
      );
    });
  });

  describe('signInWithEmail', () => {
    it('signs in user successfully', async () => {
      const fakeUser = {
        id: 'user-789',
        email: 'test@example.com',
        user_metadata: {},
      };
      mockedSignIn.mockResolvedValue({ data: { user: fakeUser }, error: null });

      const result = await signInWithEmail('test@example.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.user?.uid).toBe('user-789');
      expect(mockedSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('throws on invalid credentials', async () => {
      mockedSignIn.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(signInWithEmail('test@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid login credentials'
      );
    });
  });

  describe('handleAuthState', () => {
    it('returns user when session exists', async () => {
      const fakeUser = {
        id: 'session-user',
        email: 'session@example.com',
        user_metadata: {},
      };
      mockedGetCurrentSession.mockResolvedValue({
        user: fakeUser,
      });

      const result = await handleAuthState();
      expect(result.success).toBe(true);
      expect(result.user?.uid).toBe('session-user');
    });

    it('returns null user when no session', async () => {
      mockedGetCurrentSession.mockResolvedValue(null);

      const result = await handleAuthState();
      expect(result.success).toBe(true);
      expect(result.user).toBeNull();
    });

    it('returns error on failure', async () => {
      mockedGetCurrentSession.mockRejectedValue(new Error('Network error'));

      const result = await handleAuthState();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('subscribeToAuthChanges', () => {
    it('returns unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToAuthChanges(callback);
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('sendResetOTP', () => {
    it('sends OTP successfully', async () => {
      mockedSignInWithOtp.mockResolvedValue({ error: null });

      const result = await sendResetOTP('user@example.com');
      expect(result.success).toBe(true);
      expect(mockedSignInWithOtp).toHaveBeenCalledWith({
        email: 'user@example.com',
        options: { shouldCreateUser: false },
      });
    });

    it('throws on error', async () => {
      mockedSignInWithOtp.mockResolvedValue({
        error: { message: 'Email not found' },
      });

      await expect(sendResetOTP('bad@example.com')).rejects.toThrow('Email not found');
    });
  });

  describe('verifyResetOTP', () => {
    it('verifies OTP successfully', async () => {
      const fakeUser = { id: 'user-otp', email: 'user@example.com', user_metadata: {} };
      mockedVerifyOtp.mockResolvedValue({ data: { user: fakeUser }, error: null });

      const result = await verifyResetOTP('user@example.com', '123456');
      expect(result.success).toBe(true);
      expect(result.user?.uid).toBe('user-otp');
      expect(mockedVerifyOtp).toHaveBeenCalledWith({
        email: 'user@example.com',
        token: '123456',
        type: 'magiclink',
      });
    });

    it('throws on invalid code', async () => {
      mockedVerifyOtp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid code' },
      });

      await expect(verifyResetOTP('user@example.com', '000000')).rejects.toThrow('Invalid code');
    });
  });

  describe('updatePassword', () => {
    it('updates password successfully', async () => {
      const fakeUser = { id: 'user-updated', email: 'user@example.com', user_metadata: {} };
      mockedUpdateUser.mockResolvedValue({ data: { user: fakeUser }, error: null });

      const result = await updatePassword('newpass123');
      expect(result.success).toBe(true);
      expect(result.user?.uid).toBe('user-updated');
      expect(mockedUpdateUser).toHaveBeenCalledWith({ password: 'newpass123' });
    });

    it('throws on error', async () => {
      mockedUpdateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Weak password' },
      });

      await expect(updatePassword('123')).rejects.toThrow('Weak password');
    });
  });
});
