import { supabase, getCurrentSession, onAuthStateChange, signOutSupabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export { signOutSupabase as signOut };

/**
 * Converts Supabase User to Firebase-compatible user shape
 */
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return { success: true, user: mapSupabaseUser(data.user) };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
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

export async function resetPassword(email: string) {
  console.log('[Auth] Requesting password reset for:', email);
  // In Capacitor WebView window.location.origin can be 'file://' or 'capacitor://localhost'
  // which Supabase will reject as redirect URL. Use a hosted standalone reset page instead.
  const redirectTo = 'https://joker096.github.io/fennec-reset-password/';
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    console.error('[Auth] resetPassword error:', error.message);
    throw error;
  }
  console.log('[Auth] resetPassword success');
  return { success: true };
}

export function subscribeToAuthChanges(
  callback: (user: any | null) => void
) {
  const { data: { subscription } } = onAuthStateChange((_event, session) => {
    callback(mapSupabaseUser(session?.user || null));
  });
  return subscription.unsubscribe;
}
