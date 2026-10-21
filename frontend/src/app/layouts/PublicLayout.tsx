import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../features/auth/store/auth-store';
import { LibraryHeader, LibraryFooter } from './LibraryShell';

export default function PublicLayout() {
  const { hasCheckedSession, isLoading, loadSession } = useAuthStore();
  useEffect(() => { if (!hasCheckedSession && !isLoading) void loadSession(); }, [loadSession, hasCheckedSession, isLoading]);
  return <div className="library-shell library-app"><LibraryHeader /><main id="main-content" className="library-content" tabIndex={-1}><Outlet /></main><LibraryFooter /></div>;
}
