const OAUTH_STATE_KEY = 'oauth_state';
const OAUTH_STATE_COOKIE = 'oauth_state_fb';
const STATE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateState(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function saveState(state: string): void {
  let saved = false;

  try {
    sessionStorage.setItem(OAUTH_STATE_KEY, state);
    saved = true;
  } catch (e) {
    // sessionStorage may be inaccessible (e.g., Safari ITP, private mode, storage partitioning)
  }

  if (!saved) {
    try {
      localStorage.setItem(OAUTH_STATE_KEY, state);
      saved = true;
    } catch (e) {
      // localStorage may also be unavailable
    }
  }

  if (!saved) {
    try {
      const expires = new Date(Date.now() + STATE_TTL_MS).toUTCString();
      // SameSite=None requires Secure; for redirect flows Lax is usually enough
      document.cookie = `${OAUTH_STATE_COOKIE}=${encodeURIComponent(state)}; expires=${expires}; path=/; Secure; SameSite=Lax`;
    } catch (e) {
      // Cookie setting failed — last resort exhausted
      console.warn('[authState] Unable to persist OAuth state. Auth flow may fail.');
    }
  }
}

export function getState(): string | null {
  let state: string | null = null;

  try {
    state = sessionStorage.getItem(OAUTH_STATE_KEY);
    if (state) {
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      return state;
    }
  } catch (e) {
    // ignore
  }

  try {
    state = localStorage.getItem(OAUTH_STATE_KEY);
    if (state) {
      localStorage.removeItem(OAUTH_STATE_KEY);
      return state;
    }
  } catch (e) {
    // ignore
  }

  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + OAUTH_STATE_COOKIE + '=([^;]*)'));
    if (match) {
      state = decodeURIComponent(match[1]);
      // Clear the cookie immediately after reading
      document.cookie = `${OAUTH_STATE_COOKIE}=; max-age=0; path=/`;
      return state;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export function clearState(): void {
  try { sessionStorage.removeItem(OAUTH_STATE_KEY); } catch (e) {}
  try { localStorage.removeItem(OAUTH_STATE_KEY); } catch (e) {}
  try { document.cookie = `${OAUTH_STATE_COOKIE}=; max-age=0; path=/`; } catch (e) {}
}

export function handleOAuthCallback(url: string = typeof window !== 'undefined' ? window.location.href : ''): {
  success: boolean;
  state: string | null;
  error?: string;
} {
  const urlObj = new URL(url);
  const urlState = urlObj.searchParams.get('state');
  const savedState = getState();

  if (!savedState) {
    return {
      success: false,
      state: urlState,
      error: 'Unable to process request due to missing initial state. This may happen if browser sessionStorage is inaccessible or accidentally cleared.',
    };
  }

  if (urlState && urlState !== savedState) {
    return {
      success: false,
      state: urlState,
      error: 'OAuth state mismatch. Possible CSRF attack.',
    };
  }

  return { success: true, state: savedState };
}
