const ACCESS_TOKEN_KEY = 'rmf-access-token';
const AUTH_EMAIL_KEY = 'rmf-auth-email';

type SessionListener = () => void;

const sessionListeners = new Set<SessionListener>();

function notifySessionChanged(): void {
  sessionListeners.forEach((listener) => listener());
}

export function persistSession(accessToken: string, email: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(AUTH_EMAIL_KEY, email);
  notifySessionChanged();
}

export function clearSession(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_EMAIL_KEY);
  notifySessionChanged();
}

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAuthEmail(): string | null {
  return window.localStorage.getItem(AUTH_EMAIL_KEY);
}

export function subscribeSession(listener: SessionListener): () => void {
  sessionListeners.add(listener);

  return () => {
    sessionListeners.delete(listener);
  };
}
