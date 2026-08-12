// import { submitAuth } from '../api/submit-auth';
import { submitAsoLogin } from '../api/submit-aso-login';
import { persistAccessToken, persistSession } from '@/shared/auth';
import type { ShellTheme } from '@/shared/config';
import { APP_LOCALES, isAppLocale, type AppLocale } from '@/shared/i18n';
import {
  Button,
  Card,
  CardContent,
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
import { EyeIcon, EyeOffIcon, MoonIcon, SunIcon } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export type AuthMode = 'login' | 'register';

/** PoC-only one-click ASO login credentials. */
const TEST_USER = {
  email: 'testabc5@test.ru',
  password: 'testabc5',
} as const;

type AuthPageProps = {
  mode: AuthMode;
  theme: ShellTheme;
  locale: AppLocale;
  onThemeToggle(): void;
  onLocaleChange(locale: AppLocale): void;
};

function resolvePostAuthPath(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof (state as { from: unknown }).from === 'string'
  ) {
    const from = (state as { from: string }).from;

    if (from.startsWith('/') && !from.startsWith('//')) {
      return from;
    }
  }

  return '/host';
}

function resolveAsoPath(redirectTo: string): string {
  if (redirectTo === '/aso' || redirectTo.startsWith('/aso/')) {
    return redirectTo;
  }

  return '/aso';
}

export function AuthPage({
  mode,
  theme,
  locale,
  onThemeToggle,
  onLocaleChange,
}: AuthPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = mode === 'login';
  const isDark = theme === 'dark';
  const redirectTo = resolvePostAuthPath(location.state);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Nest register field — kept for restore with the commented Nest form.
  // const [username, setUsername] = useState('');
  const [asoAccessToken, setAsoAccessToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  /*
  // Nest PoC email/password auth (demo remotes). Restore when needed.
  async function onSubmitNest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { accessToken } = isLogin
        ? await submitAuth('/v1/auth/login', { email, password })
        : await submitAuth('/v1/auth/register', {
            email,
            password,
            ...(username.trim() ? { username: username.trim() } : {}),
          });

      persistSession(accessToken, email);
      void navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setPending(false);
    }
  }

  async function loginAsNestTestUser() {
    setEmail(TEST_USER.email);
    setPassword(TEST_USER.password);
    setError(null);
    setPending(true);

    try {
      const { accessToken } = await submitAuth('/v1/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
      persistSession(accessToken, TEST_USER.email);
      void navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setPending(false);
    }
  }
  */

  async function onSubmitAsoLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { accessToken } = await submitAsoLogin(email, password);
      persistSession(accessToken, email.trim());
      void navigate(resolveAsoPath(redirectTo), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setPending(false);
    }
  }

  async function loginAsAsoTestUser() {
    setEmail(TEST_USER.email);
    setPassword(TEST_USER.password);
    setError(null);
    setPending(true);

    try {
      const { accessToken } = await submitAsoLogin(
        TEST_USER.email,
        TEST_USER.password
      );
      persistSession(accessToken, TEST_USER.email);
      void navigate(resolveAsoPath(redirectTo), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setPending(false);
    }
  }

  function loginAsAsoToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = asoAccessToken.trim();

    if (!accessToken) {
      setError(t('auth.asoTokenRequired'));
      return;
    }

    setError(null);
    persistAccessToken(accessToken);
    void navigate(resolveAsoPath(redirectTo), { replace: true });
  }

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm font-semibold tracking-tight">
          {t('shell.brand')}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={locale}
            onValueChange={(value) => {
              if (isAppLocale(value)) {
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
            <SelectContent align="end">
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
        <Card className="w-full max-w-[22.4rem]">
          <CardHeader>
            <CardTitle>
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </CardTitle>
            {isLogin ? (
              <button
                type="button"
                className="text-foreground mt-3 h-12 w-full cursor-pointer rounded-md border border-dashed bg-transparent px-4 text-sm font-medium underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                disabled={pending}
                onClick={() => void loginAsAsoTestUser()}
              >
                {t('auth.testUserLogin')}
              </button>
            ) : null}
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <>
                <p className="text-muted-foreground mb-4 text-sm">
                  {t('auth.asoLoginDescription')}
                </p>
                <form
                  noValidate
                  className="space-y-4"
                  onSubmit={(event) => {
                    void onSubmitAsoLogin(event);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="auth-aso-email">{t('auth.email')}</Label>
                    <Input
                      required
                      id="auth-aso-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      placeholder={t('auth.emailPlaceholder')}
                      className="h-11 px-3"
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auth-aso-password">
                      {t('auth.password')}
                    </Label>
                    <div className="relative">
                      <Input
                        required
                        id="auth-aso-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        placeholder={t('auth.passwordPlaceholder')}
                        className="h-11 px-3 pr-11 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <button
                        type="button"
                        className="text-foreground hover:bg-muted absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md"
                        aria-label={
                          showPassword
                            ? t('auth.hidePassword')
                            : t('auth.showPassword')
                        }
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error ? (
                    <p className="text-destructive pt-2 text-sm break-all">
                      {error}
                    </p>
                  ) : null}

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="h-11 w-full"
                      disabled={pending}
                    >
                      {pending ? t('auth.pending') : t('auth.asoLoginSubmit')}
                    </Button>
                  </div>
                </form>

                <div className="text-muted-foreground my-4 flex items-center gap-3 text-xs font-medium tracking-wide uppercase">
                  <span aria-hidden className="bg-border h-px flex-1" />
                  {t('auth.or')}
                  <span aria-hidden className="bg-border h-px flex-1" />
                </div>
                <form
                  noValidate
                  className="space-y-4"
                  onSubmit={loginAsAsoToken}
                >
                  <div className="space-y-2">
                    <Label htmlFor="auth-aso-token">{t('auth.asoToken')}</Label>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {t('auth.asoTokenExampleHint')}
                    </p>
                    <p
                      aria-hidden
                      className="bg-muted/60 text-muted-foreground rounded-md px-3 py-2 font-mono text-[11px] leading-snug break-all"
                    >
                      {t('auth.asoTokenExample')}
                    </p>
                    <Input
                      id="auth-aso-token"
                      name="asoAccessToken"
                      type="password"
                      autoComplete="off"
                      value={asoAccessToken}
                      placeholder={t('auth.asoTokenPlaceholder')}
                      className="h-11 px-3"
                      onChange={(event) => {
                        setAsoAccessToken(event.target.value);
                        if (error) {
                          setError(null);
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-11 w-full"
                    disabled={pending}
                  >
                    {t('auth.asoTestUserLogin')}
                  </Button>
                </form>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t('auth.registerDisabledHint')}
              </p>
            )}

            {/* Nest PoC email/password form — restore for demo-remote Nest auth.
            <div className="text-muted-foreground mb-4 flex items-center gap-3 text-xs font-medium tracking-wide uppercase">
              <span aria-hidden className="bg-border h-px flex-1" />
              {t('auth.or')}
              <span aria-hidden className="bg-border h-px flex-1" />
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              {isLogin
                ? t('auth.loginDescription')
                : t('auth.registerDescription')}
            </p>
            <form noValidate className="space-y-4" onSubmit={onSubmitNest}>
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
                    className="h-11 px-3"
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
                  className="h-11 px-3"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    required
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={password}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="h-11 px-3 pr-11 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="text-foreground hover:bg-muted absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md"
                    aria-label={
                      showPassword
                        ? t('auth.hidePassword')
                        : t('auth.showPassword')
                    }
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
                {!isLogin ? (
                  <p className="text-muted-foreground text-xs">
                    {t('auth.passwordHint')}
                  </p>
                ) : null}
              </div>

              {error ? (
                <p className="text-destructive pt-2 text-sm break-all">
                  {error}
                </p>
              ) : null}

              <div className="pt-4">
                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={pending}
                >
                  {pending
                    ? t('auth.pending')
                    : isLogin
                      ? t('auth.loginSubmit')
                      : t('auth.registerSubmit')}
                </Button>
              </div>
            </form>
            */}
          </CardContent>
          {isLogin ? null : (
            <CardFooter className="justify-center">
              <p className="text-muted-foreground text-sm">
                {t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  className="text-foreground font-medium underline-offset-4 hover:underline"
                  onClick={() => {
                    void navigate('/login');
                  }}
                >
                  {t('auth.goLogin')}
                </button>
              </p>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
}
