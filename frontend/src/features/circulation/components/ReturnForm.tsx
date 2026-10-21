import { useState } from 'react';
import type { Loan, ReturnItem, ReturnCondition } from '../../../shared/schemas/circulation';

export function ReturnForm({ loan, busy, onSubmit, onClose }: { loan: Loan; busy?: boolean; onClose: () => void; onSubmit: (id: number, items: ReturnItem[]) => Promise<boolean> }) {
  const [conditions, setConditions] = useState<Record<number, ReturnCondition>>({});
  return <form onSubmit={async event => { event.preventDefault(); if (await onSubmit(loan.id, loan.copyIds.map(copyId => ({ copyId, condition: conditions[copyId] ?? 'Normal' })))) onClose(); }}>
    <p className="ws-book-title">Phiếu #{loan.id} · {loan.memberName}</p><p className="ws-muted">Kiểm tra từng bản sao. Phiếu được đóng khi nhận lại toàn bộ bản sách.</p>
    <fieldset disabled={busy}>{loan.copyIds.map(copyId => <div className="ws-return-item" key={copyId}><label htmlFor={`condition-${copyId}`} className="library-record">Bản sao / #{copyId}</label><select id={`condition-${copyId}`} value={conditions[copyId] ?? 'Normal'} onChange={event => setConditions(state => ({ ...state, [copyId]: event.target.value as ReturnCondition }))}><option value="Normal">Bình thường</option><option value="Damaged">Hư hỏng</option><option value="Lost">Mất sách</option></select></div>)}</fieldset>
    <p className="ws-note">Tiền phạt được máy chủ tính sau khi ghi nhận tình trạng và ngày trả. Biên nhận sẽ hiển thị số tiền chính thức.</p>
    <button className="ws-primary" disabled={busy}>{busy ? 'Đang ghi nhận…' : 'Xác nhận trả toàn bộ sách'}</button>
  </form>;
}
