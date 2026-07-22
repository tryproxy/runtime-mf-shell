import { API_BASE_URL } from '@/shared/config';
import { clearSession, getAccessToken } from './session';

async function logoutFromApi(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    clearSession();
  }
}

/** Clear the local session; notify the API when a bearer token exists. */
export async function logoutSession(): Promise<void> {
  if (!getAccessToken()) {
    clearSession();
    return;
  }

  await logoutFromApi();
}
