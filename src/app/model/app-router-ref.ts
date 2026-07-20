import type { createBrowserRouter } from 'react-router-dom';

type AppRouter = ReturnType<typeof createBrowserRouter>;

/** Set once from createBrowserRouter — avoids cycles with RemoteSlot → bridge. */
let appRouter: AppRouter | null = null;

export function setAppRouter(router: AppRouter): void {
  appRouter = router;
}

export function getAppRouter(): AppRouter {
  if (!appRouter) {
    throw new Error('App router is not ready yet');
  }

  return appRouter;
}
