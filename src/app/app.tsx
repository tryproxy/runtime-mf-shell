import {
  type ModuleKey,
  useActivePage,
  useLocationPathname,
} from '@/app/model/routing';
import { AppShell } from '@/app/ui/app-shell';
import { AuthPage, type AuthMode } from '@/pages/auth';
import { HostPage } from '@/pages/host';
import { RemotePage } from '@/pages/remote';
import { RemoteAngularPage } from '@/pages/remote-angular';
import {
  type AppLocale,
  i18n,
  persistLocale,
  readStoredLocale,
} from '@/shared/i18n';
import { applyShellTheme } from '@/shared/lib/apply-shell-theme';
import type { ShellTheme } from '@/shared/model';
import { useEffect, useState } from 'react';

function getAuthMode(pathname: string): AuthMode | null {
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return 'login';
  }

  if (pathname === '/register' || pathname.startsWith('/register/')) {
    return 'register';
  }

  return null;
}

function App() {
  const pathname = useLocationPathname();
  const authMode = getAuthMode(pathname);
  const activeModule = useActivePage();
  const [theme, setTheme] = useState<ShellTheme>(() => {
    const storedTheme = window.localStorage.getItem('shell-theme');

    return storedTheme === 'dark' ? 'dark' : 'light';
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

  const onThemeToggle = () =>
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));

  if (authMode) {
    return (
      <AuthPage
        mode={authMode}
        theme={theme}
        locale={locale}
        onThemeToggle={onThemeToggle}
        onLocaleChange={setLocale}
      />
    );
  }

  return (
    <AppShell
      theme={theme}
      locale={locale}
      onThemeToggle={onThemeToggle}
      onLocaleChange={setLocale}
    >
      <PageContent activeModule={activeModule} theme={theme} locale={locale} />
    </AppShell>
  );
}

type PageContentProps = {
  activeModule: ModuleKey;
  theme: ShellTheme;
  locale: AppLocale;
};

function PageContent({ activeModule, theme, locale }: PageContentProps) {
  if (activeModule === 'remote') {
    return <RemotePage theme={theme} locale={locale} />;
  }

  if (activeModule === 'remoteAngular') {
    return <RemoteAngularPage theme={theme} locale={locale} />;
  }

  return <HostPage />;
}

export default App;
