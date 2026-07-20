import { setAppRouter } from '@/app/model/app-router-ref';
import { buildModuleRoutes } from '@/app/model/build-module-routes';
import { defaultModuleHref } from '@/app/model/nav-config';
import { AppShell } from '@/app/ui/app-shell';
import { RequireAuth } from '@/app/ui/require-auth';
import { ShellRouteError } from '@/app/ui/shell-route-error';
import { AuthPage, getAccessToken } from '@/pages/auth';
import { HostPage } from '@/pages/host';
import { RemotePage } from '@/pages/remote';
import { RemoteAngularPage } from '@/pages/remote-angular';
import { installHistorySync } from '@/remote-runtime/lib/create-host-bridge';
import {
  type AppLocale,
  i18n,
  persistLocale,
  readStoredLocale,
} from '@/shared/i18n';
import { applyShellTheme } from '@/shared/lib/apply-shell-theme';
import type { ShellTheme } from '@/shared/model';
import { useEffect, useState } from 'react';
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useOutletContext,
} from 'react-router-dom';

export type ShellOutletContext = {
  theme: ShellTheme;
  locale: AppLocale;
  onThemeToggle(): void;
  onLocaleChange(locale: AppLocale): void;
};

function AppRoot() {
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

function AuthRoute({ mode }: { mode: 'login' | 'register' }) {
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

function ShellLayout() {
  const ctx = useOutletContext<ShellOutletContext>();

  return (
    <AppShell
      theme={ctx.theme}
      locale={ctx.locale}
      onThemeToggle={ctx.onThemeToggle}
      onLocaleChange={ctx.onLocaleChange}
    >
      <Outlet context={ctx} />
    </AppShell>
  );
}

function RemoteRoute() {
  const { theme, locale } = useOutletContext<ShellOutletContext>();

  return <RemotePage theme={theme} locale={locale} />;
}

function RemoteAngularRoute() {
  const { theme, locale } = useOutletContext<ShellOutletContext>();

  return <RemoteAngularPage theme={theme} locale={locale} />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppRoot />,
    errorElement: <ShellRouteError />,
    children: [
      { index: true, element: <Navigate replace to={defaultModuleHref} /> },
      { path: 'login', element: <AuthRoute mode="login" /> },
      { path: 'register', element: <AuthRoute mode="register" /> },
      {
        element: <RequireAuth />,
        errorElement: <ShellRouteError />,
        children: [
          {
            element: <ShellLayout />,
            errorElement: <ShellRouteError />,
            children: buildModuleRoutes({
              host: <HostPage />,
              remote: <RemoteRoute />,
              remoteAngular: <RemoteAngularRoute />,
            }),
          },
        ],
      },
      { path: '*', element: <Navigate replace to={defaultModuleHref} /> },
    ],
  },
]);

setAppRouter(router);
installHistorySync();

export default function App() {
  return <RouterProvider router={router} />;
}
