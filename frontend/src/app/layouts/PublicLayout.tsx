import { Link, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../features/auth/store/auth-store';

export default function PublicLayout() {
  const { user, loadSession } = useAuthStore();
  useEffect(() => { if (!user) void loadSession(); }, [loadSession, user]);
  return <main className="library-app min-h-screen bg-[#F4F1EA] text-[#141413]">
    <header className="library-header border-b border-[#D2CBB8] px-4 py-4 sm:px-6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4" aria-label="Điều hướng công khai">
        <Link to="/" className="library-brand font-serif text-2xl"><span className="library-brand-mark" aria-hidden="true">Q</span><span>Thư viện</span></Link>
        <div className="flex items-center gap-4">
          {user ? <Link className="library-header-link" to={user.role === 'Reader' ? '/reader/account' : '/staff/readers'}>Mở không gian của tôi</Link> : <><Link className="library-header-link" to="/login">Đăng nhập</Link><Link className="library-primary-link" to="/register">Đăng ký</Link></>}
        </div>
      </nav>
    </header>
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"><Outlet /></div>
  </main>;
}
