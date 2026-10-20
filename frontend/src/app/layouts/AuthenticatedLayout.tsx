import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth-store';
import type { AuthSession } from '../../features/auth/schemas/auth';

const navItems: Array<{ to: string; label: string; roles: AuthSession['role'][] }> = [
  { to: '/', label: 'Tra cứu', roles: ['Reader', 'Staff', 'Admin'] },
  { to: '/reader/account', label: 'Tài khoản', roles: ['Reader'] },
  { to: '/staff/readers', label: 'Độc giả', roles: ['Staff', 'Admin'] },
  { to: '/staff/circulation', label: 'Mượn trả', roles: ['Staff', 'Admin'] },
  { to: '/admin/reports', label: 'Báo cáo', roles: ['Staff', 'Admin'] },
] as const;

export default function AuthenticatedLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return <main className="library-app min-h-screen bg-[#F4F1EA] text-[#141413]">
    <header className="library-header border-b border-[#D2CBB8] px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="library-brand font-serif text-2xl" onClick={() => setMenuOpen(false)}>
          <span className="library-brand-mark" aria-hidden="true">Q</span>
          <span>Thư viện</span>
        </Link>
        <button className="library-menu-toggle" type="button" aria-expanded={isMenuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(value => !value)}>
          {isMenuOpen ? 'Đóng menu' : 'Mở menu'}
        </button>
        <nav id="primary-navigation" className={`library-navigation ${isMenuOpen ? 'is-open' : ''}`} aria-label="Điều hướng chính">
          {/* NavLink supplies aria-current="page" for the active route. */}
          {navItems.filter(item => user && item.roles.includes(user.role)).map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => isActive ? 'is-active' : undefined} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
        </nav>
        <div className="library-account-menu">
          <span className="library-user-name">{user?.displayName}</span>
          <span className="library-role-label">{user?.role}</span>
          <button className="library-text-button" type="button" onClick={() => void signOut()}>Đăng xuất</button>
        </div>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"><Outlet /></div>
  </main>;
}
