import {
  initialFrom,
  type UseShellAccountResult,
} from '@/app/model/use-shell-account';
import { cn } from '@/shared/lib';
import { useTranslation } from 'react-i18next';

type ShellAccountFooterProps = {
  account: UseShellAccountResult;
  className?: string;
};

/** Bottom-left sidebar profile using shell account state. */
export function ShellAccountFooter({
  account,
  className,
}: ShellAccountFooterProps) {
  const { t } = useTranslation();
  const { loading, displayName, secondary } = account;
  const label = displayName ?? t('auth.accountFallback');

  return (
    <div
      className={cn(
        'border-sidebar-border flex shrink-0 items-center gap-2.5 border-t px-3 py-2.5',
        className
      )}
    >
      <div
        aria-hidden
        className="bg-sidebar-accent text-sidebar-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      >
        {loading ? '…' : initialFrom(label)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {loading ? t('auth.accountLoading') : label}
        </p>
        {secondary && !loading ? (
          <p className="text-muted-foreground truncate text-xs">{secondary}</p>
        ) : null}
      </div>
    </div>
  );
}
