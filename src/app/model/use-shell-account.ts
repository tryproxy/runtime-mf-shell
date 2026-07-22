import { getAccessToken, getAuthEmail } from '@/shared/auth';
import { API_BASE_URL } from '@/shared/config';
import { useEffect, useState } from 'react';

export type AccountMe = {
  id: string;
  role: string;
  status: string;
  profile: {
    displayName: string | null;
    email: string | null;
    handle: string | null;
  } | null;
};

export type UseShellAccountResult = {
  me: AccountMe | null;
  loading: boolean;
  displayName: string | null;
  secondary: string | null;
  fallbackEmail: string | null;
};

export function initialFrom(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

/** Loads GET /v1/account/me when a bearer token exists. */
export function useShellAccount(): UseShellAccountResult {
  const fallbackEmail = getAuthEmail();
  const [me, setMe] = useState<AccountMe | null>(null);
  const [loading, setLoading] = useState(Boolean(getAccessToken()));

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      setMe(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/v1/account/me`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as AccountMe;
        if (!cancelled) {
          setMe(data);
        }
      } catch {
        if (!cancelled) {
          setMe(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName =
    me?.profile?.displayName?.trim() ||
    me?.profile?.handle?.trim() ||
    me?.profile?.email?.trim() ||
    fallbackEmail ||
    null;

  const secondary =
    me?.profile?.email?.trim() ||
    (me?.profile?.handle ? `@${me.profile.handle}` : null) ||
    (fallbackEmail && fallbackEmail !== displayName ? fallbackEmail : null);

  return { me, loading, displayName, secondary, fallbackEmail };
}
