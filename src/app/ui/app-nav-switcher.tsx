import { type PageMeta, pages } from '@/app/model/routing';
import { cn } from '@/shared/lib';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type AppNavSwitcherProps = {
  currentPage: PageMeta;
  onNavigate: (href: string) => void;
  className?: string;
};

export function AppNavSwitcher({
  currentPage,
  onNavigate,
  className,
}: AppNavSwitcherProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={t('nav.switcherAria')}
          className={cn(
            'max-w-full min-w-0 justify-between gap-1.5',
            className
          )}
        >
          <span className="truncate">{t(currentPage.labelKey)}</span>
          <ChevronsUpDownIcon className="text-muted-foreground size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        {pages.map((page) => {
          const isActive = page.key === currentPage.key;

          return (
            <DropdownMenuItem
              key={page.key}
              className={cn(isActive && 'bg-accent/60')}
              onClick={() => onNavigate(page.href)}
            >
              <CheckIcon
                className={cn(
                  'size-4 shrink-0',
                  isActive ? 'opacity-100' : 'opacity-0'
                )}
              />
              <span className="min-w-0 truncate">{t(page.labelKey)}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
