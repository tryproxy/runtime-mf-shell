import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app';

const storedTheme = window.localStorage.getItem('shell-theme');
document.documentElement.dataset.rmfTheme =
  storedTheme === 'dark' ? 'dark' : 'light';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
