import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/admin-store';
import { Pagination } from '../../../shared/components/Editorial';
import { WorkspacePage } from '../../../shared/components/WorkspacePage';

const roles = ['Reader', 'Staff', 'Admin'];

export default function AdminUsersPage() {
  const { users, totalUsers, page, pageSize, isLoading, error, loadUsers, setStatus, setRole } = useAdminStore();
  const [isSaving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { void loadUsers(); }, [loadUsers]);

  async function submitSearch(event: React.FormEvent) { event.preventDefault(); setSubmittedQuery(query.trim()); await loadUsers(query.trim()); }
  async function toggleStatus(id: string, isActive: boolean) { setSaving(true); setMessage(null); try { if (await setStatus(id, !isActive)) { setMessage('Đã cập nhật trạng thái tài khoản.'); await loadUsers(submittedQuery, page); } } finally { setSaving(false); } }
  async function changeRole(id: string, role: string) { setSaving(true); setMessage(null); try { if (await setRole(id, role)) { setMessage('Đã cập nhật vai trò.'); await loadUsers(submittedQuery, page); } } finally { setSaving(false); } }

  return <WorkspacePage title="Nhân viên & Phân quyền">
<div className="ws-section-heading"><p>Hồ sơ tài khoản và quyền làm việc.</p><span className="library-record">{totalUsers} tài khoản</span></div>
    <form className="admin-user-search" onSubmit={submitSearch}><label htmlFor="admin-user-query">Tìm theo tên, email hoặc tên đăng nhập</label><div><input id="admin-user-query" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nhập từ khóa" /><button type="submit">Tìm kiếm</button></div></form>
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}{isLoading && <p role="status">Đang tải danh sách…</p>}
    <div className="ws-table-scroll"><table className="ws-table"><thead><tr><th>Tài khoản</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td><strong>{user.displayName}</strong><small>{user.userName}</small></td><td>{user.email ?? '—'}</td><td><select disabled={isLoading || isSaving} value={roles.includes(user.role) ? user.role : 'Reader'} aria-label={`Vai trò ${user.userName}`} onChange={event => void changeRole(user.id, event.target.value)}>{roles.map(role => <option key={role}>{role}</option>)}</select></td><td><span className={`admin-status ${user.isActive ? 'is-active' : 'is-inactive'}`}>{user.isActive ? 'Hoạt động' : 'Đã khóa'}</span></td><td><button disabled={isLoading || isSaving} type="button" className="library-text-button" onClick={() => void toggleStatus(user.id, user.isActive)}>{user.isActive ? 'Khóa' : 'Mở khóa'}</button></td></tr>)}</tbody></table>{!isLoading && users.length === 0 && <p className="ws-empty">Không tìm thấy tài khoản.</p>}</div>
    <Pagination page={page} pageSize={pageSize} totalCount={totalUsers} disabled={isLoading || isSaving} onChange={next => void loadUsers(submittedQuery, next)} />
  </WorkspacePage>;
}
