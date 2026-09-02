import { submitAuth } from '../api/submit-auth';
import { submitAsoLogin } from '../api/submit-aso-login';
import {
  persistAccessToken,
  persistSession,
  type AuthProvider,
} from '@/shared/auth';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/shadcn';
import { EyeIcon, EyeOffIcon, MoonIcon, SunIcon } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export type AuthMode = 'login' | 'register';

/** PoC-only one-click ASO login credentials. */
const ASO_TEST_USER = {
  email: 'testabc5@test.ru',
  password: 'testabc5',
} as const;

/** PoC-only one-click Custom login credentials. */
const CUSTOM_TEST_USER = {
  email: 'user@mail.com',
  password: '1Qwe-rty',
} as const;

const TEST_USER_BUTTON_CLASS =
  'text-foreground h-12 w-full cursor-pointer rounded-md border border-dashed bg-transparent px-4 text-sm font-medium underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50';

type AuthPageProps = {
  mode: AuthMode;
  theme: ShellTheme;
  locale: AppLocale;
  onThemeToggle(): void;
  onLocaleChange(locale: AppLocale): void;
};

const CUSTOM_POST_AUTH_PATH = '/host/style-guide';

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

  return CUSTOM_POST_AUTH_PATH;
}

function resolveAsoPath(redirectTo: string): string {
  if (redirectTo === '/aso' || redirectTo.startsWith('/aso/')) {
    return redirectTo;
  }

  return '/aso';
}

function resolveCustomPath(redirectTo: string): string {
  const pathname = redirectTo.split(/[?#]/, 1)[0];

  if (pathname === '/' || pathname === '/host' || pathname === '/host/') {
    return CUSTOM_POST_AUTH_PATH;
  }

  return redirectTo;
}

type CredentialsFieldsProps = {
  idPrefix: string;
  email: string;
  emailAutoComplete: 'email' | 'username';
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  showPassword: boolean;
  onEmailChange(value: string): void;
  onPasswordChange(value: string): void;
  onShowPasswordToggle(): void;
};

function CredentialsFields({
  idPrefix,
  email,
  emailAutoComplete,
  emailPlaceholder,
  password,
  passwordPlaceholder,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
}: CredentialsFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>{t('auth.email')}</Label>
        <Input
          required
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          autoComplete={emailAutoComplete}
          value={email}
          placeholder={emailPlaceholder}
          className="h-11 px-3"
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-password`}>{t('auth.password')}</Label>
        <div className="relative">
          <Input
            required
            id={`${idPrefix}-password`}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            placeholder={passwordPlaceholder}
            className="h-11 px-3 pr-11 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
            onChange={(event) => onPasswordChange(event.target.value)}
          />
          <button
            type="button"
            className="text-foreground hover:bg-muted absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md"
            aria-label={
              showPassword ? t('auth.hidePassword') : t('auth.showPassword')
            }
            onClick={onShowPasswordToggle}
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
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

  const [asoEmail, setAsoEmail] = useState('');
  const [asoPassword, setAsoPassword] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [asoAccessToken, setAsoAccessToken] = useState('');
  const [loginProvider, setLoginProvider] = useState<AuthProvider>('aso');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function selectLoginProvider(provider: string): void {
    if (provider !== 'aso' && provider !== 'custom') {
      return;
    }

    setLoginProvider(provider);
    setError(null);
    setShowPassword(false);
  }

  async function onSubmitCustomLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { accessToken } = await submitAuth('/v1/auth/login', {
        email: customEmail,
        password: customPassword,
      });
      persistSession(accessToken, customEmail.trim(), 'custom');
      void navigate(resolveCustomPath(redirectTo), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setPending(false);
    }
  }

  async function onSubmitAsoLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const { accessToken } = await submitAsoLogin(asoEmail, asoPassword);
      persistSession(accessToken, asoEmail.trim(), 'aso');
      void navigate(resolveAsoPath(redirectTo), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setPending(false);
    }
  }

  async function loginAsAsoTestUser() {
    setAsoEmail(ASO_TEST_USER.email);
    setAsoPassword(ASO_TEST_USER.password);
    setError(null);
    setPending(true);

    try {
      const { accessToken } = await submitAsoLogin(
        ASO_TEST_USER.email,
        ASO_TEST_USER.password
      );
      persistSession(accessToken, ASO_TEST_USER.email, 'aso');
      void navigate(resolveAsoPath(redirectTo), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'));
    } finally {
      setPending(false);
    }
  }

  async function loginAsCustomTestUser() {
    setCustomEmail(CUSTOM_TEST_USER.email);
    setCustomPassword(CUSTOM_TEST_USER.password);
    setError(null);
    setPending(true);

    try {
      const { accessToken } = await submitAuth('/v1/auth/login', {
        email: CUSTOM_TEST_USER.email,
        password: CUSTOM_TEST_USER.password,
      });
      persistSession(accessToken, CUSTOM_TEST_USER.email, 'custom');
      void navigate(resolveCustomPath(redirectTo), { replace: true });
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
    persistAccessToken(accessToken, 'aso');
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

      <main className="flex flex-1 items-start justify-center px-4 py-8">
        <Card className="w-full max-w-[22.4rem]">
          <CardHeader>
            <CardTitle>
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <Tabs value={loginProvider} onValueChange={selectLoginProvider}>
                <TabsList aria-label={t('auth.providerLabel')}>
                  <TabsTrigger value="aso" disabled={pending}>
                    {t('auth.providerAso')}
                  </TabsTrigger>
                  <TabsTrigger value="custom" disabled={pending}>
                    {t('auth.providerCustom')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="aso" className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {t('auth.asoLoginDescription')}
                  </p>
                  <button
                    type="button"
                    className={TEST_USER_BUTTON_CLASS}
                    disabled={pending}
                    onClick={() => void loginAsAsoTestUser()}
                  >
                    {t('auth.asoTestUserLogin')}
                  </button>
                  <form
                    noValidate
                    className="space-y-4"
                    onSubmit={(event) => {
                      void onSubmitAsoLogin(event);
                    }}
                  >
                    <CredentialsFields
                      idPrefix="auth-aso"
                      email={asoEmail}
                      emailAutoComplete="username"
                      emailPlaceholder={t('auth.emailPlaceholder')}
                      password={asoPassword}
                      passwordPlaceholder={t('auth.passwordPlaceholder')}
                      showPassword={showPassword}
                      onEmailChange={setAsoEmail}
                      onPasswordChange={setAsoPassword}
                      onShowPasswordToggle={() =>
                        setShowPassword((value) => !value)
                      }
                    />

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

                  <div className="text-muted-foreground flex items-center gap-3 text-xs font-medium tracking-wide uppercase">
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
                      <Label htmlFor="auth-aso-token">
                        {t('auth.asoToken')}
                      </Label>
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
                      {t('auth.asoTokenSubmit')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {t('auth.customLoginDescription')}
                  </p>
                  <button
                    type="button"
                    className={TEST_USER_BUTTON_CLASS}
                    disabled={pending}
                    onClick={() => void loginAsCustomTestUser()}
                  >
                    {t('auth.customTestUserLogin')}
                  </button>
                  <form
                    noValidate
                    className="space-y-4"
                    onSubmit={(event) => {
                      void onSubmitCustomLogin(event);
                    }}
                  >
                    <CredentialsFields
                      idPrefix="auth-custom"
                      email={customEmail}
                      emailAutoComplete="email"
                      emailPlaceholder={CUSTOM_TEST_USER.email}
                      password={customPassword}
                      passwordPlaceholder={CUSTOM_TEST_USER.password}
                      showPassword={showPassword}
                      onEmailChange={setCustomEmail}
                      onPasswordChange={setCustomPassword}
                      onShowPasswordToggle={() =>
                        setShowPassword((value) => !value)
                      }
                    />

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
                        {pending ? t('auth.pending') : t('auth.loginSubmit')}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t('auth.registerDisabledHint')}
              </p>
            )}
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
