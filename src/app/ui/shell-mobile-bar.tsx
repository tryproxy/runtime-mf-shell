import { cn } from '@/shared/lib';
import {
  BellIcon,
  HomeIcon,
  MessageCircleIcon,
  SearchIcon,
  SettingsIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ShellMobileBarProps = {
  className?: string;
};

/** Compact-only Twitter-style bottom bar — icons are placeholders for now. */
export function ShellMobileBar({ className }: ShellMobileBarProps) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('shell.mobileBarAria')}
      className={cn(
        'bg-card/95 border-border supports-backdrop-filter:bg-card/80 flex shrink-0 items-center justify-around border-t px-2 py-2 backdrop-blur md:hidden',
        className
      )}
    >
      <button
        type="button"
        aria-label={t('shell.mobileHome')}
        className="text-foreground flex size-11 cursor-default items-center justify-center rounded-full"
      >
        <HomeIcon className="size-6" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        aria-label={t('shell.mobileSearch')}
        className="text-foreground flex size-11 cursor-default items-center justify-center rounded-full"
      >
        <SearchIcon className="size-6" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        aria-label={t('shell.mobileMessages')}
        className="text-foreground flex size-11 cursor-default items-center justify-center rounded-full"
      >
        <MessageCircleIcon className="size-6" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        aria-label={t('shell.mobileNotifications')}
        className="text-foreground flex size-11 cursor-default items-center justify-center rounded-full"
      >
        <BellIcon className="size-6" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        aria-label={t('shell.mobileSettings')}
        className="text-foreground flex size-11 cursor-default items-center justify-center rounded-full"
      >
        <SettingsIcon className="size-6" strokeWidth={1.5} />
      </button>
    </nav>
  );
}
