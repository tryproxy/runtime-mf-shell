import { Panel } from '@/shared/ui/panel';
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
        <h3 className="text-rmf-fg text-lg font-semibold">{t('host.title')}</h3>
        <p className="text-rmf-muted mt-1 text-sm">{t('host.description')}</p>
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

      <div className="rounded-rmf-md border-rmf-border bg-rmf-surface shadow-rmf-sm border p-5">
        <p className="text-rmf-subtle text-sm font-medium">
          {t('host.crashTitle')}
        </p>
        <p className="text-rmf-muted mt-2 text-sm">{t('host.crashDesc')}</p>
        <button
          type="button"
          className="rounded-rmf-md mt-4 border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700"
          onClick={() => setShouldCrash(true)}
        >
          {t('host.crashButton')}
        </button>
      </div>
    </section>
  );
}
