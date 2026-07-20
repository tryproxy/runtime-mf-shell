import { getAccessToken } from '@/pages/auth';
import {
  Navigate,
  Outlet,
  useLocation,
  useOutletContext,
} from 'react-router-dom';

/** Protects shell module routes — no LS access token → /login. */
export function RequireAuth() {
  const ctx = useOutletContext();
  const location = useLocation();

  if (!getAccessToken()) {
    const from = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate replace to="/login" state={{ from: from || '/host' }} />;
  }

  return <Outlet context={ctx} />;
}
