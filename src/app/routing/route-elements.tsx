import { defaultModuleHref } from '@/app/remote-navigation/nav-config';
import { AppShell } from '@/app/shell/app-shell';
import { AuthPage } from '@/pages/authentication';
import { RemotePage } from '@/pages/remote';
import { RemoteAngularPage } from '@/pages/remote-angular';
import { getAccessToken } from '@/shared/auth';
import type { ShellTheme } from '@/shared/config';
import {
  type AppLocale,
  i18n,
  persistLocale,
  readStoredLocale,
} from '@/shared/i18n';
import { applyShellTheme } from '@/shared/lib';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

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

  return <RemotePage theme={theme} locale={locale} />;
}

export function RemoteAngularRoute() {
  const { theme, locale } = useOutletContext<ShellOutletContext>();

  return <RemoteAngularPage theme={theme} locale={locale} />;
}
