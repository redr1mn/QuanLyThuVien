import { useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/auth-store';
import { getApiErrorMessage } from '../../shared/api/api-error';

// React port of Views/Shared/_Layout.cshtml and _PrimaryNavigation.cshtml.
export function LibraryHeader() {
  const { user, logout } = useAuthStore();
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function signOut() {
    setBusy(true); setError('');
    try { await logout(); navigate('/login', { replace: true }); }
    catch (reason) { setError(getApiErrorMessage(reason)); }
    finally { setBusy(false); }
  }
  const link = (to: string, label: string) => <NavLink className={({ isActive }) => `library-nav-link ${isActive ? 'is-current' : ''}`} to={to} end={to === '/'} onClick={() => setMenu(false)}>{label}</NavLink>;
  return <><a className="skip-link" href="#main-content">Đến nội dung chính</a><header className="library-header"><nav className="library-masthead navbar" aria-label="Điều hướng chính">
    <Link className="library-brand" to="/" aria-label="Thư viện — Trang chủ"><svg className="library-mark" viewBox="0 0 44 48" fill="none" aria-hidden="true"><path d="M6 5h10v38H6zM20 5h6v38h-6zM29 7l5-1 6 36-5 1z" stroke="currentColor" strokeWidth="1.5" /><path d="M8 12h6M8 35h6M22 12h2M22 35h2" stroke="currentColor" /></svg><span className="library-name">Thư viện</span></Link>
    <button className="navbar-toggler" type="button" aria-expanded={menu} aria-controls="library-navigation" onClick={() => setMenu(value => !value)}>Menu</button>
    <div className={`library-navigation ${menu ? 'is-open' : ''}`} id="library-navigation"><div className="library-nav">{link('/', 'Trang chủ')}{user?.role === 'Reader' && link('/reader/account', 'Tài khoản độc giả')}{(user?.role === 'Staff' || user?.role === 'Admin') && <NavGroup label="Nghiệp vụ thư viện">{link('/staff/books', 'Quản lý sách')}{link('/staff/readers', 'Quản lý độc giả & Thẻ')}{link('/staff/circulation', 'Mượn trả sách')}{user.role === 'Staff' && link('/admin/reports', 'Thống kê & Báo cáo')}</NavGroup>}{user?.role === 'Admin' && <NavGroup label="Quản trị">{link('/admin/dashboard', 'Tổng quan')}{link('/admin/reports', 'Thống kê & Báo cáo')}{link('/admin/users', 'Nhân viên & Phân quyền')}</NavGroup>}</div></div>
    <div className="library-account">{user ? <details className="shell-dropdown"><summary className="library-account-button"><span className="library-account-name">{user.displayName}</span><span aria-hidden="true">▾</span></summary><div className="shell-dropdown-menu"><span className="library-record">{user.role}</span><button className="library-text-button" type="button" disabled={busy} onClick={() => void signOut()}>Đăng xuất</button></div></details> : <Link className="library-login" to="/login">Đăng nhập</Link>}</div>
  </nav></header>{error && <p className="notice notice-error" role="alert">{error}</p>}</>;
}
function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return <details className="library-nav-group shell-dropdown"><summary className="library-nav-link">{label}</summary><div className="shell-dropdown-menu">{children}</div></details>;
}
export function LibraryFooter() {
  return <footer className="library-footer"><div className="library-information"><section id="library-about" tabIndex={-1} aria-labelledby="library-about-title"><h2 id="library-about-title">Giới thiệu</h2><p>Tra cứu sách theo tên, tác giả hoặc ISBN. Độc giả có thể theo dõi thẻ thư viện và lịch sử mượn trả sau khi đăng nhập.</p></section><section id="library-rules" tabIndex={-1} aria-labelledby="library-rules-title"><h2 id="library-rules-title">Nội quy thư viện</h2><p>Sử dụng thẻ thư viện còn hiệu lực khi mượn sách. Giữ gìn sách và trả đúng hạn ghi trên phiếu mượn. Liên hệ thủ thư để được hướng dẫn về gia hạn thẻ, sách quá hạn hoặc hư hỏng.</p></section></div><div className="library-colophon"><span>© {new Date().getFullYear()} Thư viện</span><Link to="/register">Đăng ký thẻ thư viện</Link><a href="#main-content">Về đầu nội dung</a></div></footer>;
}
