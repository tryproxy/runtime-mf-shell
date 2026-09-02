import { defaultModuleHref } from '@/app/remote-navigation/nav-config';
import { buildModuleRoutes } from '@/app/routing/build-module-routes';
import {
  AppRoot,
  AsoAccessTokenRoute,
  AsoRoute,
  AuthRoute,
  RemoteAngularRoute,
  RemoteRoute,
  ShellLayout,
  ZeywinRoute,
} from '@/app/routing/route-elements';
import { installHistorySync } from '@/app/routing/router-navigation';
import { ShellRouteError } from '@/app/error-handling/shell-route-error';
import { RequireAuth } from '@/app/routing/require-auth';
import { HostPage, HostStyleGuidePage } from '@/pages/host';
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppRoot />,
    errorElement: <ShellRouteError />,
    children: [
      { index: true, element: <Navigate replace to={defaultModuleHref} /> },
      { path: 'login', element: <AuthRoute mode="login" /> },
      { path: 'register', element: <AuthRoute mode="register" /> },
      { path: 'auth/callback', element: <AsoAccessTokenRoute /> },
      { path: 'aso/login', element: <AsoAccessTokenRoute /> },
      {
        element: <RequireAuth />,
        errorElement: <ShellRouteError />,
        children: [
          {
            element: <ShellLayout />,
            errorElement: <ShellRouteError />,
            children: buildModuleRoutes({
              host: {
                element: <Outlet />,
                children: [
                  { index: true, element: <HostPage /> },
                  { path: 'style-guide', element: <HostStyleGuidePage /> },
                ],
              },
              remote: { element: <RemoteRoute /> },
              remoteAngular: { element: <RemoteAngularRoute /> },
              aso: { element: <AsoRoute /> },
              zeywin: { element: <ZeywinRoute /> },
            }),
          },
        ],
      },
      { path: '*', element: <Navigate replace to={defaultModuleHref} /> },
    ],
  },
]);

installHistorySync(appRouter);
