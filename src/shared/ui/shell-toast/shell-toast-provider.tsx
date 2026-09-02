import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import { ShellToastContext } from './shell-toast-context';

type ShellToast = {
  id: number;
  message: string;
};

export function ShellToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ShellToast[]>([]);

  const show = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4_000);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ShellToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="bg-foreground text-background rounded-lg px-3 py-2 text-sm shadow-md"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ShellToastContext.Provider>
  );
}
