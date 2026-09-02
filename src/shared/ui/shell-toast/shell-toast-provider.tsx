import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/shadcn';
import { ShellToastContext } from './shell-toast-context';

type ShellToast = {
  id: number;
  message: string;
};

export function ShellToastProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<ShellToast[]>([]);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), 4_000)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ShellToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed right-6 bottom-24 z-50 flex max-w-sm flex-col gap-2 md:bottom-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="bg-card text-card-foreground pointer-events-auto relative min-w-64 rounded-lg border px-4 py-3 pr-10 text-sm shadow-md"
          >
            {toast.message}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="absolute top-2 right-2"
              aria-label={t('shell.toastClose')}
              onClick={() => dismiss(toast.id)}
            >
              <XIcon />
            </Button>
          </div>
        ))}
      </div>
    </ShellToastContext.Provider>
  );
}
