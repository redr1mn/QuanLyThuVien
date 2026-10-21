import { useEffect, useState } from 'react';
import { MemberForm } from '../components/MemberForm';
import { MemberTable, type MemberAction } from '../components/MemberTable';
import { useMembersStore } from '../store/members-store';
import { membersApi } from '../api/members-api';
import type { MemberDetails, UpdateMemberInput } from '../../../shared/schemas/members';
import { getApiErrorMessage } from '../../../shared/api/api-error';
import { Dialog, Pagination } from '../../../shared/components/Editorial';
import { WorkspacePage, Metrics } from '../../../shared/components/WorkspacePage';

export default function MembersPage() {
  const { items, totalCount, page, pageSize, isLoading, isSaving, error, status, load, create, update } = useMembersStore();
  const [editor, setEditor] = useState<MemberDetails | 'new' | null>(null);
  const [mode, setMode] = useState<MemberAction>('edit');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [opening, setOpening] = useState(false);
  useEffect(() => { void load({ pageSize: 8 }); }, [load]);
  async function edit(id: number, action: MemberAction) {
    setOpening(true); setMessage(''); useMembersStore.setState({ error: null });
    try { setEditor(await membersApi.get(id)); setMode(action); }
    catch (reason) { useMembersStore.setState({ error: getApiErrorMessage(reason) }); }
    finally { setOpening(false); }
  }
  async function toggle(member: MemberDetails) {
    const input: UpdateMemberInput = { cardNumber: member.cardNumber, fullName: member.fullName, email: member.email ?? undefined, phone: member.phone ?? undefined, address: member.address ?? undefined, memberType: member.memberType, maxBooks: member.maxBooks, expiresAtUtc: member.expiresAtUtc, status: member.status === 'Suspended' ? 'Active' : 'Suspended' };
    if (await update(member.id, input)) { setEditor(null); setMessage('Đã cập nhật trạng thái thẻ.'); }
  }
  return <WorkspacePage title="Quản lý độc giả & Thẻ">
    {!isLoading && !error && <Metrics items={[["Hồ sơ phù hợp", totalCount], ["Hoạt động · Trang này", items.filter(member => member.status === 'Active').length], ["Sắp hết hạn · Trang này", items.filter(member => member.status === 'Active' && new Date(member.expiresAtUtc).getTime() > Date.now() && new Date(member.expiresAtUtc).getTime() <= Date.now() + 30 * 86400000).length], ["Hết hạn / Khóa · Trang này", items.filter(member => member.status !== 'Active').length]]} />}
    <form className="ws-toolbar" onSubmit={event => { event.preventDefault(); void load({ query, page: 1 }); }}><label className="ws-field ws-search">Tìm kiếm<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Mã thẻ, họ tên, email…" /></label><label className="ws-field">Trạng thái thẻ<select value={status} onChange={event => void load({ status: event.target.value, page: 1 })}><option value="">Tất cả</option><option value="Active">Hoạt động</option><option value="Suspended">Tạm khóa</option><option value="Expired">Hết hạn</option></select></label><button>Tìm kiếm</button><button type="button" className="ws-primary" onClick={() => { useMembersStore.setState({ error: null }); setEditor('new'); setMode('edit'); }}>Đăng ký độc giả mới</button></form>
    {message && <p role="status" className="ws-notice">{message}</p>}{error && !editor && <p role="alert" className="ws-notice">{error}<button onClick={() => void load()}>Thử lại</button></p>}{(isLoading || opening) && <p role="status">Đang mở hồ sơ…</p>}
    {!isLoading && <MemberTable members={items} busy={opening || isSaving} onAction={(id, action) => void edit(id, action)} />}
    <Pagination page={page} pageSize={pageSize} totalCount={totalCount} disabled={isLoading} onChange={next => void load({ page: next })} />
    {editor && <Dialog title={editor === 'new' ? 'Thêm độc giả' : mode === 'card' ? 'Thẻ thư viện' : mode === 'status' ? 'Xác nhận thao tác' : mode === 'renew' ? 'Gia hạn thẻ độc giả' : 'Cập nhật độc giả'} onClose={() => !isSaving && setEditor(null)}>{error && <p role="alert" className="ws-notice">{error}</p>}
      {editor !== 'new' && mode === 'status' ? <><p>{editor.status === 'Suspended' ? 'Mở khóa' : 'Khóa'} thẻ <span className="library-record">{editor.cardNumber}</span> của {editor.fullName}?</p><div className="ws-actions"><button onClick={() => setEditor(null)}>Hủy bỏ</button><button className="ws-primary" disabled={isSaving} onClick={() => void toggle(editor)}>Xác nhận</button></div></> : editor !== 'new' && mode === 'card' ? <div className="ws-slip ws-print-card"><div className="ws-card-top"><span>Thẻ thư viện</span><span className="library-record">{editor.cardNumber}</span></div><div className="ws-card-monogram" aria-hidden="true">TV</div><h3>{editor.fullName}</h3><p>{editor.memberType} · Có hiệu lực đến {new Date(editor.expiresAtUtc).toLocaleDateString('vi-VN')}</p><button onClick={() => window.print()}>In thẻ</button></div> : <MemberForm member={editor === 'new' ? undefined : editor} busy={isSaving} onSubmit={async input => { const saved = editor === 'new' ? await create(input) : await update(editor.id, input); if (saved) { setEditor(null); setMessage('Đã lưu hồ sơ và hiệu lực thẻ.'); } return saved; }} />}
    </Dialog>}
  </WorkspacePage>;
}
