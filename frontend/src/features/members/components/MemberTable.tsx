import type { MemberListItem } from '../../../shared/schemas/members';

export function MemberTable({ members }: { members: MemberListItem[] }) {
  return <div className="ws-table-scroll"><table className="ws-table"><thead><tr><th>Mã thẻ</th><th>Độc giả</th><th>Liên hệ</th><th>Hạn thẻ</th><th>Đang mượn</th><th>Trạng thái</th></tr></thead><tbody>{members.length ? members.map(member => <tr key={member.id}><td>{member.cardNumber}</td><td><strong>{member.fullName}</strong><small>{member.memberType}</small></td><td>{member.email ?? '—'}<small>{member.phone ?? '—'}</small></td><td>{new Date(member.expiresAtUtc).toLocaleDateString('vi-VN')}</td><td>{member.currentLoanCount}{member.overdueCount ? ` · quá hạn ${member.overdueCount}` : ''}</td><td>{member.status}</td></tr>) : <tr><td colSpan={6} className="ws-empty">Chưa có hồ sơ phù hợp.</td></tr>}</tbody></table></div>;
}
