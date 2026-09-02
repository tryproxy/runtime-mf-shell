import { createContext } from 'react';

export type ShellToastApi = {
  show(message: string): void;
};

export const ShellToastContext = createContext<ShellToastApi | null>(null);
