const ACCESS_TOKEN_KEY = 'rmf-access-token';
const AUTH_EMAIL_KEY = 'rmf-auth-email';
const AUTH_PROVIDER_KEY = 'rmf-auth-provider';

export type AuthProvider = 'aso' | 'custom';

type SessionListener = () => void;

const sessionListeners = new Set<SessionListener>();

function notifySessionChanged(): void {
  sessionListeners.forEach((listener) => listener());
}

export function persistSession(
  accessToken: string,
  email: string,
  provider: AuthProvider
): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(AUTH_EMAIL_KEY, email);
  window.localStorage.setItem(AUTH_PROVIDER_KEY, provider);
  notifySessionChanged();
}

/**
 * Stores a bearer token received by a shell-owned URL bootstrap route.
 * No display identity is inferred from an unverified token.
 */
export function persistAccessToken(
  accessToken: string,
  provider: AuthProvider
): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.removeItem(AUTH_EMAIL_KEY);
  window.localStorage.setItem(AUTH_PROVIDER_KEY, provider);
  notifySessionChanged();
}

export function clearSession(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_EMAIL_KEY);
  window.localStorage.removeItem(AUTH_PROVIDER_KEY);
  notifySessionChanged();
}

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAuthEmail(): string | null {
  return window.localStorage.getItem(AUTH_EMAIL_KEY);
}

export function getAuthProvider(): AuthProvider | null {
  const provider = window.localStorage.getItem(AUTH_PROVIDER_KEY);

  if (provider === 'aso' || provider === 'custom') {
    return provider;
  }

  // Tokens created before provider-aware sessions were introduced are ASO.
  return provider === null && getAccessToken() ? 'aso' : null;
}

export function subscribeSession(listener: SessionListener): () => void {
  sessionListeners.add(listener);

  return () => {
    sessionListeners.delete(listener);
  };
}
