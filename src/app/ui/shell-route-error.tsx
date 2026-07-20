import { ShellErrorFallback } from '@/app/ui/shell-error-fallback';
import { defaultModuleHref } from '@/app/model/nav-config';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

/** React Router `errorElement` — replaces the default ugly crash screen. */
export function ShellRouteError() {
  const error = useRouteError();

  const message = (() => {
    if (isRouteErrorResponse(error)) {
      return `${error.status} ${error.statusText}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  })();

  return (
    <ShellErrorFallback
      message={message}
      onRetry={() => {
        window.location.assign(defaultModuleHref);
      }}
    />
  );
}
