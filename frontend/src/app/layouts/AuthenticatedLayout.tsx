import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth-store';
import type { AuthSession } from '../../features/auth/schemas/auth';
import { LibraryHeader, LibraryFooter } from './LibraryShell';

const navItems: Array<{ to: string; label: string; roles: AuthSession['role'][] }> = [
  { to: '/staff/books', label: 'Quản lý sách', roles: ['Staff', 'Admin'] },
  { to: '/staff/readers', label: 'Quản lý độc giả & Thẻ', roles: ['Staff', 'Admin'] },
  { to: '/staff/circulation', label: 'Mượn trả sách', roles: ['Staff', 'Admin'] },
  { to: '/admin/reports', label: 'Thống kê & Báo cáo', roles: ['Staff', 'Admin'] },
  { to: '/admin/users', label: 'Nhân viên & Phân quyền', roles: ['Admin'] },
  { to: '/admin/dashboard', label: 'Tổng quan hệ thống', roles: ['Admin'] },
  { to: '/reader/account', label: 'Tài khoản độc giả', roles: ['Reader'] },
];

export default function AuthenticatedLayout() {
  const { user } = useAuthStore();
  // LibraryHeader contains the account menu and Đăng xuất; NavLink supplies aria-current.
  return <div className="library-shell library-app"><LibraryHeader /><main id="main-content" className="library-content" tabIndex={-1}><div className="library-workspace"><aside className="library-workspace-sidebar" aria-label="Điều hướng quản lý"><nav className="library-workspace-links" aria-label="Chức năng quản lý">{navItems.filter(item => user && item.roles.includes(user.role)).map(item => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}</nav></aside><div className="library-workspace-content ws-root"><Outlet /></div></div></main><LibraryFooter /></div>;
}
