import {
  initialFrom,
  type UseShellAccountResult,
} from '@/app/model/use-shell-account';
import { cn } from '@/shared/lib';
import { useTranslation } from 'react-i18next';

type ShellHeaderProfileProps = {
  account: UseShellAccountResult;
  className?: string;
};

/**
 * Mobile shell profile — avatar always; name when the header slot is wide enough.
 * Uses a container query so the name collapses before it fights the action buttons.
 */
export function ShellHeaderProfile({
  account,
  className,
}: ShellHeaderProfileProps) {
  const { t } = useTranslation();
  const { loading, displayName } = account;
  const label = displayName ?? t('auth.accountFallback');

  return (
    <div
      className={cn('@container min-w-0', className)}
      title={loading ? t('auth.accountLoading') : label}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          aria-hidden
          className="bg-muted text-foreground ring-border flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1"
        >
          {loading ? '…' : initialFrom(label)}
        </div>
        <div className="hidden min-w-0 flex-1 flex-col @[11rem]:flex">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
            {t('auth.accountFallback')}
          </p>
          <p className="truncate text-sm font-semibold tracking-tight">
            {loading ? t('auth.accountLoading') : label}
          </p>
        </div>
      </div>
    </div>
  );
}
