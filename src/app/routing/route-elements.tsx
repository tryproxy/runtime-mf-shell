import { defaultModuleHref } from '@/app/remote-navigation/nav-config';
import { useRemoteNavManifests } from '@/app/remote-navigation/use-remote-nav-manifests';
import { AppShell } from '@/app/shell/app-shell';
import { AuthPage } from '@/pages/authentication';
import { AsoPage } from '@/pages/aso';
import { RemotePage } from '@/pages/remote';
import { RemoteAngularPage } from '@/pages/remote-angular';
import { getAccessToken, persistAccessToken } from '@/shared/auth';
import type { ShellTheme } from '@/shared/config';
import {
  type AppLocale,
  i18n,
  persistLocale,
  readStoredLocale,
} from '@/shared/i18n';
import { applyShellTheme } from '@/shared/lib';
import { useEffect, useState } from 'react';
import {
  Navigate,
  Outlet,
  useLocation,
  useOutletContext,
} from 'react-router-dom';

export type ShellOutletContext = {
  theme: ShellTheme;
  locale: AppLocale;
  onThemeToggle(): void;
  onLocaleChange(locale: AppLocale): void;
};

export function AppRoot() {
  const [theme, setTheme] = useState<ShellTheme>(() => {
    const storedTheme = window.localStorage.getItem('shell-theme');

    return storedTheme === 'light' ? 'light' : 'dark';
  });
  const [locale, setLocale] = useState<AppLocale>(() => readStoredLocale());

  useEffect(() => {
    window.localStorage.setItem('shell-theme', theme);
    applyShellTheme(theme);
  }, [theme]);

  useEffect(() => {
    persistLocale(locale);
    void i18n.changeLanguage(locale);
  }, [locale]);

  const context: ShellOutletContext = {
    theme,
    locale,
    onThemeToggle: () =>
      setTheme((current) => (current === 'light' ? 'dark' : 'light')),
    onLocaleChange: setLocale,
  };

  return <Outlet context={context} />;
}

export function AuthRoute({ mode }: { mode: 'login' | 'register' }) {
  const { theme, locale, onThemeToggle, onLocaleChange } =
    useOutletContext<ShellOutletContext>();

  if (getAccessToken()) {
    return <Navigate replace to={defaultModuleHref} />;
  }

  return (
    <AuthPage
      mode={mode}
      theme={theme}
      locale={locale}
      onThemeToggle={onThemeToggle}
      onLocaleChange={onLocaleChange}
    />
  );
}

function resolveAsoReturnTo(value: string | null): string {
  if (!value) {
    return '/aso';
  }

  try {
    const url = new URL(value, window.location.origin);
    const isAsoPath =
      url.origin === window.location.origin &&
      (url.pathname === '/aso' || url.pathname.startsWith('/aso/'));

    if (!isAsoPath || url.pathname === '/aso/login') {
      return '/aso';
    }

    url.searchParams.delete('access_token');
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/aso';
  }
}

/**
 * Shell-owned token handoff for an ASO deep link. The token is removed from
 * browser-visible URL state before the authenticated route mounts.
 */
export function AsoAccessTokenRoute() {
  const location = useLocation();
  const [target, setTarget] = useState<string | null>(null);
  const query = new URLSearchParams(location.search);
  const accessToken = query.get('access_token')?.trim();
  const returnTo = query.get('returnTo');

  useEffect(() => {
    if (!accessToken) {
      setTarget('/login');
      return;
    }

    persistAccessToken(accessToken);
    setTarget(resolveAsoReturnTo(returnTo));
  }, [accessToken, returnTo]);

  return target ? <Navigate replace to={target} /> : null;
}

export function ShellLayout() {
  const context = useOutletContext<ShellOutletContext>();

  return (
    <AppShell
      theme={context.theme}
      locale={context.locale}
      onThemeToggle={context.onThemeToggle}
      onLocaleChange={context.onLocaleChange}
    >
      <Outlet context={context} />
    </AppShell>
  );
}

export function RemoteRoute() {
  const { theme, locale } = useOutletContext<ShellOutletContext>();
  const { ensureNav } = useRemoteNavManifests();

  return (
    <RemotePage
      theme={theme}
      locale={locale}
      onRetry={() => void ensureNav('remote')}
    />
  );
}

export function RemoteAngularRoute() {
  const { theme, locale } = useOutletContext<ShellOutletContext>();
  const { ensureNav } = useRemoteNavManifests();

  return (
    <RemoteAngularPage
      theme={theme}
      locale={locale}
      onRetry={() => void ensureNav('remoteAngular')}
    />
  );
}

export function AsoRoute() {
  const { theme, locale } = useOutletContext<ShellOutletContext>();
  const { ensureNav } = useRemoteNavManifests();

  return (
    <AsoPage
      theme={theme}
      locale={locale}
      onRetry={() => void ensureNav('aso')}
    />
  );
}
