import { API_BASE_URL } from '@/shared/config';
import { clearSession, getAccessToken, getAuthProvider } from './session';

const LOGOUT_NOTIFICATION_TIMEOUT_MS = 2_000;

async function notifyLogoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      signal: AbortSignal.timeout(LOGOUT_NOTIFICATION_TIMEOUT_MS),
    });
  } catch {
    // Local sign-out must not depend on an unavailable legacy API endpoint.
  }
}

/** Clear the local session immediately; notify the legacy API best-effort. */
export async function logoutSession(): Promise<void> {
  const shouldNotifyApi =
    getAuthProvider() === 'custom' && Boolean(getAccessToken());

  clearSession();

  if (shouldNotifyApi) {
    void notifyLogoutApi();
  }
}
