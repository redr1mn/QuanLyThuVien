import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/admin-store';

const roles = ['Reader', 'Staff', 'Admin'];

export default function AdminUsersPage() {
  const { users, totalUsers, isLoading, error, loadUsers, setStatus, setRole } = useAdminStore();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { void loadUsers(); }, [loadUsers]);

  async function submitSearch(event: React.FormEvent) { event.preventDefault(); setSubmittedQuery(query.trim()); await loadUsers(query.trim()); }
  async function toggleStatus(id: string, isActive: boolean) { setMessage(null); if (await setStatus(id, !isActive)) { setMessage('Đã cập nhật trạng thái tài khoản.'); await loadUsers(submittedQuery); } }
  async function changeRole(id: string, role: string) { setMessage(null); if (await setRole(id, role)) { setMessage('Đã cập nhật vai trò.'); await loadUsers(submittedQuery); } }

  return <section aria-labelledby="admin-users-title">
    <div className="ws-page-heading"><div><p className="ws-eyebrow">QUẢN TRỊ</p><h1 id="admin-users-title">Quản lý tài khoản</h1><p>{totalUsers} tài khoản trong hệ thống.</p></div></div>
    <form className="admin-user-search" onSubmit={submitSearch}><label htmlFor="admin-user-query">Tìm theo tên, email hoặc tên đăng nhập</label><div><input id="admin-user-query" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nhập từ khóa" /><button type="submit">Tìm kiếm</button></div></form>
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}{isLoading && <p role="status">Đang tải danh sách…</p>}
    <div className="ws-panel admin-user-table-wrap"><table className="admin-user-table"><thead><tr><th>Tài khoản</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td><strong>{user.displayName}</strong><small>{user.userName}</small></td><td>{user.email ?? '—'}</td><td><select value={roles.includes(user.role) ? user.role : 'Reader'} aria-label={`Vai trò ${user.userName}`} onChange={event => void changeRole(user.id, event.target.value)}>{roles.map(role => <option key={role}>{role}</option>)}</select></td><td><span className={`admin-status ${user.isActive ? 'is-active' : 'is-inactive'}`}>{user.isActive ? 'Hoạt động' : 'Đã khóa'}</span></td><td><button type="button" className="library-text-button" onClick={() => void toggleStatus(user.id, user.isActive)}>{user.isActive ? 'Khóa' : 'Mở khóa'}</button></td></tr>)}</tbody></table>{!isLoading && users.length === 0 && <p>Không tìm thấy tài khoản.</p>}</div>
  </section>;
}
