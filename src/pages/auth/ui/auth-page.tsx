import { APP_LOCALES, type AppLocale } from '@/shared/i18n';
import type { ShellTheme } from '@/shared/model';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn';
import { MoonIcon, SunIcon } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type AuthMode = 'login' | 'register';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:3000';

/** PoC one-click login. */
const TEST_USER = {
  email: 'user@mail.com',
  password: '1Qwe-rty',
} as const;

export const RMF_ACCESS_TOKEN_KEY = 'rmf-access-token';
export const RMF_AUTH_EMAIL_KEY = 'rmf-auth-email';

type AuthPageProps = {
  mode: AuthMode;
  theme: ShellTheme;
  locale: AppLocale;
  onThemeToggle(): void;
  onLocaleChange(locale: AppLocale): void;
};

function navigateTo(href: string) {
  window.history.pushState(null, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function persistSession(accessToken: string, email: string) {
  window.localStorage.setItem(RMF_ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(RMF_AUTH_EMAIL_KEY, email);
}

export function clearSession() {
  window.localStorage.removeItem(RMF_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(RMF_AUTH_EMAIL_KEY);
}

export function getAccessToken(): string | null {
  return window.localStorage.getItem(RMF_ACCESS_TOKEN_KEY);
}

export function getAuthEmail(): string | null {
  return window.localStorage.getItem(RMF_AUTH_EMAIL_KEY);
}

async function postAuth(
  path: '/v1/auth/login' | '/v1/auth/register',
  body: Record<string, string>
): Promise<{ accessToken: string }> {
  const response = await fetch(`${API_BASE}${path}`, {
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

export async function logoutFromApi(): Promise<void> {
  try {
    await fetch(`${API_BASE}/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    clearSession();
  }
}

/** Clear session; call API only when a LS token exists. */
export async function logoutSession(): Promise<void> {
  if (!getAccessToken()) {
    clearSession();
    return;
  }

  await logoutFromApi();
}

export function AuthPage({
  mode,
  theme,
  locale,
  onThemeToggle,
  onLocaleChange,
}: AuthPageProps) {
  const { t } = useTranslation();
  const isLogin = mode === 'login';
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { accessToken } = isLogin
        ? await postAuth('/v1/auth/login', { email, password })
        : await postAuth('/v1/auth/register', {
            email,
            password,
            ...(username.trim() ? { username: username.trim() } : {}),
          });

      persistSession(accessToken, email);
      navigateTo('/host');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setPending(false);
    }
  }

  async function loginAsTestUser() {
    setEmail(TEST_USER.email);
    setPassword(TEST_USER.password);
    setError(null);
    setPending(true);

    try {
      const { accessToken } = await postAuth('/v1/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
      persistSession(accessToken, TEST_USER.email);
      navigateTo('/host');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm font-semibold tracking-tight">
          {t('shell.brand')}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={locale}
            onValueChange={(value) => {
              if (value === 'en' || value === 'ru') {
                onLocaleChange(value);
              }
            }}
          >
            <SelectTrigger
              className="w-[7.5rem]"
              aria-label={t('shell.language')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APP_LOCALES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={isDark ? t('shell.themeLight') : t('shell.themeDark')}
            onClick={onThemeToggle}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? t('auth.loginDescription')
                : t('auth.registerDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form noValidate className="space-y-4" onSubmit={onSubmit}>
              {!isLogin ? (
                <div className="space-y-2">
                  <Label htmlFor="auth-username">{t('auth.username')}</Label>
                  <Input
                    id="auth-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    placeholder={t('auth.usernamePlaceholder')}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="auth-email">{t('auth.email')}</Label>
                <Input
                  required
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  placeholder={t('auth.emailPlaceholder')}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password">{t('auth.password')}</Label>
                <Input
                  required
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  placeholder={t('auth.passwordPlaceholder')}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {!isLogin ? (
                  <p className="text-muted-foreground text-xs">
                    {t('auth.passwordHint')}
                  </p>
                ) : null}
              </div>

              {error ? (
                <p className="text-destructive text-sm break-all">{error}</p>
              ) : null}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending
                  ? t('auth.pending')
                  : isLogin
                    ? t('auth.loginSubmit')
                    : t('auth.registerSubmit')}
              </Button>

              {isLogin ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={pending}
                  onClick={() => void loginAsTestUser()}
                >
                  {t('auth.testUserLogin')}
                </Button>
              ) : null}
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            {isLogin ? (
              <p className="text-muted-foreground text-sm">
                {t('auth.noAccount')}{' '}
                <button
                  type="button"
                  className="text-foreground font-medium underline-offset-4 hover:underline"
                  onClick={() => navigateTo('/register')}
                >
                  {t('auth.goRegister')}
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  className="text-foreground font-medium underline-offset-4 hover:underline"
                  onClick={() => navigateTo('/login')}
                >
                  {t('auth.goLogin')}
                </button>
              </p>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
