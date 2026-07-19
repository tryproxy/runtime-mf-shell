import { type PageKey, getPageByKey, useActivePage } from '@/app/model/routing';
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
  const activePage = useActivePage();
  const currentPage = getPageByKey(activePage);
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
      currentPage={currentPage}
      theme={theme}
      locale={locale}
      onThemeToggle={() =>
        setTheme((currentTheme) =>
          currentTheme === 'light' ? 'dark' : 'light'
        )
      }
      onLocaleChange={setLocale}
    >
      <PageContent activePage={activePage} theme={theme} locale={locale} />
    </AppShell>
  );
}

type PageContentProps = {
  activePage: PageKey;
  theme: ShellTheme;
  locale: AppLocale;
};

function PageContent({ activePage, theme, locale }: PageContentProps) {
  if (activePage === 'remote') {
    return <RemotePage theme={theme} locale={locale} />;
  }

  if (activePage === 'remoteAngular') {
    return <RemoteAngularPage theme={theme} locale={locale} />;
  }

  return <HostPage />;
}

export default App;
