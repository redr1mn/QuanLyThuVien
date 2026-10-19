import { useEffect, useState } from 'react';
import { MemberForm } from '../components/MemberForm';
import { MemberTable } from '../components/MemberTable';
import { useMembersStore } from '../store/members-store';

export default function MembersPage() {
  const { items, totalCount, isLoading, error, query, load, create } = useMembersStore();
  const [showForm, setShowForm] = useState(false);
  useEffect(() => { void load(); }, [load]);
  return <section aria-labelledby="members-title"><div className="ws-section-heading"><div><h1 id="members-title">Quản lý độc giả</h1><p>{totalCount} hồ sơ trong hệ thống</p></div><button className="ws-primary" onClick={() => setShowForm(value => !value)}>Đăng ký độc giả</button></div><div className="ws-toolbar"><label className="ws-field">Tìm kiếm<input value={query} onChange={event => void load({ query: event.target.value })} placeholder="Mã thẻ, họ tên, email…" /></label></div>{showForm && <section className="ws-panel"><MemberForm onSubmit={async input => { const saved = await create(input); if (saved) setShowForm(false); return saved; }} /></section>}{isLoading && <p role="status">Đang tải hồ sơ…</p>}{error && <p role="alert">{error}</p>}{!isLoading && !error && <MemberTable members={items} />}</section>;
}
