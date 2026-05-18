import { supabase, getCurrentSession, onAuthStateChange, signOutSupabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export { signOutSupabase as signOut };

function getRedirectUrl(): string {
  if (typeof window === 'undefined') return '';
  // Production URL from env or fallback to current origin (works for both local dev and production)
  return import.meta.env.VITE_APP_URL || window.location.origin;
}

function isCapacitor(): boolean {
  try {
    return !!(window as any).Capacitor?.isNativePlatform();
  } catch {
    return false;
  }
}

// Google Sign-In
export async function signInWithGoogle() {
  const redirectTo = getRedirectUrl();
  console.log('[Auth] signInWithGoogle — redirectTo:', redirectTo);

  if (isCapacitor()) {
    console.log('[Auth] Capacitor detected, using Browser.open + deep link flow');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (data?.url) {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: data.url });
    }
    return null;
  }

  // Web: Supabase SDK handles the full PKCE redirect flow automatically
  console.log('[Auth] Web environment — SD K redirects to Google OAuth...');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) throw error;
  // On web, the call above redirects the browser — code below never executes
  return null;
}

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

// Send password reset link
export async function resetPassword(email: string) {
  console.log('[Auth] Resetting password for:', email);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectUrl(),
  });
  if (error) {
    console.error('[Auth] resetPassword error:', error.message);
    throw error;
  }
  console.log('[Auth] Reset link sent');
  return { success: true };
}

export function subscribeToAuthChanges(callback: (user: any | null) => void) {
  const { data: { subscription } } = onAuthStateChange((_event, session) => {
    callback(mapSupabaseUser(session?.user || null));
  });
  return subscription.unsubscribe;
}
