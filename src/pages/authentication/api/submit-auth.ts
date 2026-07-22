import { API_BASE_URL } from '@/shared/config';

/** Submit login or registration credentials for the authentication page. */
export async function submitAuth(
  path: '/v1/auth/login' | '/v1/auth/register',
  body: Record<string, string>
): Promise<{ accessToken: string }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return (await response.json()) as { accessToken: string };
}
