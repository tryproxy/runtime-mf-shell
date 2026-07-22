import { defaultModuleHref } from '@/app/remote-navigation/nav-config';
import { buildModuleRoutes } from '@/app/routing/build-module-routes';
import {
  AppRoot,
  AuthRoute,
  RemoteAngularRoute,
  RemoteRoute,
  ShellLayout,
} from '@/app/routing/route-elements';
import { installHistorySync } from '@/app/routing/router-navigation';
import { ShellRouteError } from '@/app/error-handling/shell-route-error';
import { RequireAuth } from '@/app/routing/require-auth';
import { HostPage } from '@/pages/host';
import { Navigate, createBrowserRouter } from 'react-router-dom';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppRoot />,
    errorElement: <ShellRouteError />,
    children: [
      { index: true, element: <Navigate replace to={defaultModuleHref} /> },
      { path: 'login', element: <AuthRoute mode="login" /> },
      { path: 'register', element: <AuthRoute mode="register" /> },
      {
        element: <RequireAuth />,
        errorElement: <ShellRouteError />,
        children: [
          {
            element: <ShellLayout />,
            errorElement: <ShellRouteError />,
            children: buildModuleRoutes({
              host: <HostPage />,
              remote: <RemoteRoute />,
              remoteAngular: <RemoteAngularRoute />,
            }),
          },
        ],
      },
      { path: '*', element: <Navigate replace to={defaultModuleHref} /> },
    ],
  },
]);

installHistorySync(appRouter);
