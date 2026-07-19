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

export function HostPage() {
  const { t } = useTranslation();
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error('PoC crash: intentional shell render error');
  }

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          {t('host.title')}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {t('host.description')}
        </p>
      </div>

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
