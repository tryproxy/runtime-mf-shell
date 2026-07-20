import {
  getAccessToken,
  getAuthEmail,
} from '@/pages/auth';
import { cn } from '@/shared/lib';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type AccountMe = {
  id: string;
  role: string;
  status: string;
  profile: {
    displayName: string | null;
    email: string | null;
    handle: string | null;
  } | null;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:3000';

function initialFrom(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

/** Bottom-left sidebar profile — loads GET /v1/account/me when a token exists. */
export function ShellAccountFooter({ className }: { className?: string }) {
  const { t } = useTranslation();
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
        const response = await fetch(`${API_BASE}/v1/account/me`, {
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
    t('auth.accountFallback');

  const secondary =
    me?.profile?.email?.trim() ||
    (me?.profile?.handle ? `@${me.profile.handle}` : null) ||
    (fallbackEmail && fallbackEmail !== displayName ? fallbackEmail : null);

  return (
    <div
      className={cn(
        'border-sidebar-border flex shrink-0 items-center gap-2.5 border-t px-3 py-3',
        className
      )}
    >
      <div
        aria-hidden
        className="bg-sidebar-accent text-sidebar-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      >
        {loading ? '…' : initialFrom(displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {loading ? t('auth.accountLoading') : displayName}
        </p>
        {secondary && !loading ? (
          <p className="text-muted-foreground truncate text-xs">{secondary}</p>
        ) : null}
      </div>
    </div>
  );
}
