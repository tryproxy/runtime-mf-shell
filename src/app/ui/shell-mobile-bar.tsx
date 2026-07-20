import { defaultModuleHref } from '@/app/model/nav-config';
import { logoutSession } from '@/pages/auth';
import { cn } from '@/shared/lib';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn';
import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MessageCircleIcon,
  SearchIcon,
  SettingsIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type ShellMobileBarProps = {
  className?: string;
};

/** Compact-only bottom bar — Home + Settings active; other icons dimmed. */
export function ShellMobileBar({ className }: ShellMobileBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
        className="text-foreground hover:bg-muted/60 flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors"
        onClick={() => {
          void navigate(defaultModuleHref);
        }}
      >
        <HomeIcon className="size-6" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        disabled
        aria-label={t('shell.mobileSearch')}
        className="text-muted-foreground/35 flex size-11 cursor-not-allowed items-center justify-center rounded-full"
      >
        <SearchIcon className="size-6" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        disabled
        aria-label={t('shell.mobileMessages')}
        className="text-muted-foreground/35 flex size-11 cursor-not-allowed items-center justify-center rounded-full"
      >
        <MessageCircleIcon className="size-6" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        disabled
        aria-label={t('shell.mobileNotifications')}
        className="text-muted-foreground/35 flex size-11 cursor-not-allowed items-center justify-center rounded-full"
      >
        <BellIcon className="size-6" strokeWidth={1.5} />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('shell.mobileSettings')}
            className="text-foreground size-11 rounded-full"
          >
            <SettingsIcon className="size-6" strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="min-w-40">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              void logoutSession().then(() => {
                void navigate('/login');
              });
            }}
          >
            <LogOutIcon className="size-4 shrink-0" />
            {t('auth.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
