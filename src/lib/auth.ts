import { supabase, getCurrentSession, onAuthStateChange, signOutSupabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export { signOutSupabase as signOut };

export function mapSupabaseUser(user: User | null): {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'user' | 'admin';
} | null {
  if (!user) return null;
  return {
    uid: user.id,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null,
    email: user.email || null,
    photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    role: user.user_metadata?.role || 'user',
  };
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { success: true, user: mapSupabaseUser(data.user) };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { success: true, user: mapSupabaseUser(data.user) };
}

export async function handleAuthState() {
  try {
    const session = await getCurrentSession();
    if (session?.user) {
      return { success: true, user: mapSupabaseUser(session.user) };
    }
    return { success: true, user: null };
  } catch (error: any) {
    return { success: false, user: null, error: error.message };
  }
}

// Send OTP code to email for password reset
export async function sendResetOTP(email: string) {
  console.log('[Auth] Sending reset OTP to:', email);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) {
    console.error('[Auth] sendResetOTP error:', error.message);
    throw error;
  }
  console.log('[Auth] Reset OTP sent');
  return { success: true };
}

// Verify OTP and set session, then update password
export async function verifyResetOTP(email: string, token: string) {
  console.log('[Auth] Verifying reset OTP for:', email);
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'magiclink',
  });
  if (error) {
    console.error('[Auth] verifyResetOTP error:', error.message);
    throw error;
  }
  console.log('[Auth] OTP verified, session established');
  return { success: true, user: mapSupabaseUser(data.user) };
}

// Update password after session is active
export async function updatePassword(newPassword: string) {
  console.log('[Auth] Updating password');
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error('[Auth] updatePassword error:', error.message);
    throw error;
  }
  console.log('[Auth] Password updated');
  return { success: true, user: mapSupabaseUser(data.user) };
}

export function subscribeToAuthChanges(callback: (user: any | null) => void) {
  const { data: { subscription } } = onAuthStateChange((_event, session) => {
    callback(mapSupabaseUser(session?.user || null));
  });
  return subscription.unsubscribe;
}
