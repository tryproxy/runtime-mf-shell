import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/shared/i18n';
import './index.css';
import App from './app';
import { ShellErrorBoundary } from './ui/shell-error-boundary';

const storedTheme = window.localStorage.getItem('shell-theme');
document.documentElement.dataset.rmfTheme =
  storedTheme === 'dark' ? 'dark' : 'light';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ShellErrorBoundary>
      <App />
    </ShellErrorBoundary>
  </StrictMode>
);
