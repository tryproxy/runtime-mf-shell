import { getAccessToken } from '@/shared/auth';
import {
  Navigate,
  Outlet,
  useLocation,
  useOutletContext,
} from 'react-router-dom';

/** Protect shell module routes: no local access token means `/login`. */
export function RequireAuth() {
  const ctx = useOutletContext();
  const location = useLocation();

  if (!getAccessToken()) {
    const from = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate replace to="/login" state={{ from: from || '/host' }} />;
  }

  return <Outlet context={ctx} />;
}
