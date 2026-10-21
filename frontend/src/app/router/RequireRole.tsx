import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth-store';
import type { AuthSession } from '../../features/auth/schemas/auth';

type Props = { children: ReactNode; roles?: AuthSession['role'][] };

export default function RequireRole({ children, roles }: Props) {
  const location = useLocation();
  const { user, isLoading, hasCheckedSession, loadSession } = useAuthStore();

  useEffect(() => {
    if (!hasCheckedSession && !isLoading) void loadSession();
  }, [hasCheckedSession, isLoading, loadSession]);

  if (!hasCheckedSession || isLoading) return <p role="status" className="p-8">Đang kiểm tra phiên đăng nhập…</p>;
  if (!user) return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
