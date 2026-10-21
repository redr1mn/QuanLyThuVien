import { useState, type FormEvent } from 'react';
import type { MemberDetails, UpdateMemberInput } from '../../../shared/schemas/members';

export function MemberForm({ member, busy, onSubmit }: { member?: MemberDetails; busy?: boolean; onSubmit: (input: UpdateMemberInput) => Promise<boolean> }) {
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? '').trim();
    const expiry = new Date(`${text('expiresAt')}T23:59:59`);
    if (!Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now()) { setError('Hạn thẻ phải nằm sau ngày hiện tại.'); return; }
    const input: UpdateMemberInput = { cardNumber: text('cardNumber'), fullName: text('fullName'), email: text('email') || undefined, phone: text('phone') || undefined, address: text('address') || undefined, memberType: text('memberType'), maxBooks: Number(text('maxBooks')), expiresAtUtc: expiry.toISOString(), status: text('status') as UpdateMemberInput['status'] || 'Active' };
    if (!input.cardNumber || !input.fullName || !input.memberType) { setError('Nhập đủ số thẻ, họ tên và loại thẻ.'); return; }
    setError('');
    if (!(await onSubmit(input))) setError('Chưa lưu được hồ sơ. Xem thông báo từ máy chủ và thử lại.');
  }
  return <form onSubmit={submit}><fieldset className="ws-form-grid" disabled={busy}>
    <label className="ws-field">Số thẻ *<input name="cardNumber" defaultValue={member?.cardNumber} required autoFocus /></label>
    <label className="ws-field">Họ và tên *<input name="fullName" defaultValue={member?.fullName} required /></label>
    <label className="ws-field">Email<input name="email" type="email" defaultValue={member?.email ?? ''} /></label>
    <label className="ws-field">Số điện thoại<input name="phone" defaultValue={member?.phone ?? ''} /></label>
    <label className="ws-field">Địa chỉ<input name="address" defaultValue={member?.address ?? ''} /></label>
    <label className="ws-field">Loại thẻ<input name="memberType" defaultValue={member?.memberType ?? 'Reader'} required /></label>
    <label className="ws-field">Số sách tối đa<input name="maxBooks" type="number" min="1" max="100" defaultValue={member?.maxBooks ?? 5} required /></label>
    <label className="ws-field">Hạn thẻ / Gia hạn đến<input name="expiresAt" type="date" defaultValue={member?.expiresAtUtc.slice(0, 10)} required /></label>
    {member && <label className="ws-field">Trạng thái thẻ<select name="status" defaultValue={member.status}><option value="Active">Hoạt động</option><option value="Suspended">Tạm khóa</option><option value="Expired">Hết hạn</option></select></label>}
  </fieldset>{error && <p className="notice notice-error" role="alert">{error}</p>}<button className="ws-primary" disabled={busy}>{busy ? 'Đang lưu…' : member ? 'Lưu hồ sơ & hạn thẻ' : 'Tạo hồ sơ độc giả'}</button></form>;
}
