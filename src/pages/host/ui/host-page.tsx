import { getAccessToken, getAuthEmail, logoutSession } from '@/shared/auth';
import { Panel } from '@/shared/ui/panel';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function HostPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [shouldCrash, setShouldCrash] = useState(false);
  const [email, setEmail] = useState(() => getAuthEmail());
  const signedIn = Boolean(getAccessToken());

  if (shouldCrash) {
    throw new Error('PoC crash: intentional shell render error');
  }

  return (
    <section className="wideMobile:p-6 space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          {t('host.title')}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('host.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
          <CardDescription>
            {signedIn && email
              ? `${t('auth.signedInAs')} ${email}`
              : t('auth.loginDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {signedIn ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void logoutSession().then(() => {
                  setEmail(null);
                  void navigate('/login');
                });
              }}
            >
              {t('auth.logout')}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={() => {
                  void navigate('/login');
                }}
              >
                {t('auth.goLoginPage')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void navigate('/register');
                }}
              >
                {t('auth.goRegisterPage')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel
          title={t('host.owner')}
          value={t('host.ownerValue')}
          description={t('host.ownerDesc')}
        />
        <Panel
          title={t('host.role')}
          value={t('host.roleValue')}
          description={t('host.roleDesc')}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('host.crashTitle')}</CardTitle>
          <CardDescription>{t('host.crashDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShouldCrash(true)}
          >
            {t('host.crashButton')}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
