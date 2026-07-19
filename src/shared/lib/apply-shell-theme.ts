import type { ShellTheme } from '@/shared/model';

/** Keep shadcn `.dark` and MF `data-rmf-theme` in sync. */
export function applyShellTheme(theme: ShellTheme): void {
  document.documentElement.dataset.rmfTheme = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
