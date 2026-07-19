import { type ModuleKey, useActivePage } from '@/app/model/routing';
import { AppShell } from '@/app/ui/app-shell';
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

function App() {
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

  return (
    <AppShell
      theme={theme}
      locale={locale}
      onThemeToggle={() =>
        setTheme((currentTheme) =>
          currentTheme === 'light' ? 'dark' : 'light'
        )
      }
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
