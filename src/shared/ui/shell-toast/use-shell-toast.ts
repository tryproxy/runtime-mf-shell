import { useContext } from 'react';
import { ShellToastContext } from './shell-toast-context';

export function useShellToast() {
  const toast = useContext(ShellToastContext);

  if (!toast) {
    throw new Error('useShellToast must be used within ShellToastProvider');
  }

  return toast;
}
