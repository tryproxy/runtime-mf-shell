import { ASO_API_BASE_URL } from '@/shared/config';

type AsoLoginResponse = {
  accessToken?: unknown;
  refreshToken?: unknown;
};

/**
 * ASO product login — same contract as ASO Admin:
 * POST /api/auth/login with `{ username: email, password }`.
 */
export async function submitAsoLogin(
  email: string,
  password: string
): Promise<{ accessToken: string }> {
  if (!ASO_API_BASE_URL) {
    throw new Error('VITE_ASO_API_BASE_URL is not configured');
  }

  const response = await fetch(`${ASO_API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: email.trim(),
      password,
    }),
  });

  const text = await response.text();
  let data: AsoLoginResponse | null = null;

  if (text) {
    try {
      data = JSON.parse(text) as AsoLoginResponse;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
  }

  if (typeof data?.accessToken !== 'string' || !data.accessToken) {
    throw new Error('ASO login response did not include accessToken');
  }

  return { accessToken: data.accessToken };
}
