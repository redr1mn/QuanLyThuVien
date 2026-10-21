import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoanForm } from '../components/LoanForm';
import { ReturnForm } from '../components/ReturnForm';
import { LoanLedger } from '../components/LoanLedger';
import { useCirculationStore } from '../store/circulation-store';
import { Pagination } from '../../../shared/components/Editorial';
import { WorkspacePage, Metrics, exportCsv } from '../../../shared/components/WorkspacePage';

const tabs = [['list', 'Phiếu mượn & Quá hạn'], ['borrow', 'Lập phiếu mượn'], ['return', 'Trả sách & Thu phạt']] as const;
export default function CirculationPage() {
  const { loans, page, pageSize, totalCount, status, overdueOnly, receipt, isLoading, isSaving, error, load, borrow, returnLoan, renew } = useCirculationStore();
  const [params, setParams] = useSearchParams();
  const tab = tabs.some(([key]) => key === params.get('tab')) ? params.get('tab')! : 'list';
  const selectedLoan = loans.find(loan => loan.id === Number(params.get('loan')) && loan.status === 'Open');
  useEffect(() => { void load({ status: tab === 'return' ? 'Open' : '', overdueOnly: false, page: 1 }); }, [load, tab]);
  const chooseReturn = (id: number) => setParams({ tab: 'return', loan: String(id) });
  return <WorkspacePage title="Mượn trả sách" tabs={tabs}>
    {error && <p role="alert" className="ws-notice">{error}<button onClick={() => void load()}>Thử lại</button></p>}
    {receipt && <div className="ws-slip" role="status"><h3>Biên nhận phiếu #{receipt.id}</h3><p>{receipt.memberName} · {receipt.status === 'Returned' ? 'Đã trả sách' : 'Đã ghi nhận phiếu mượn'} · Hạn {new Date(receipt.dueAtUtc).toLocaleDateString('vi-VN')}</p><p className="ws-billing-total">Tiền phạt theo máy chủ: <strong className="library-record">{receipt.fineTotal.toLocaleString('vi-VN')} đ</strong></p></div>}
    {tab === 'borrow' ? <LoanForm initialBookId={Number(params.get('book')) || undefined} busy={isSaving} onSubmit={borrow} /> : <>
      {tab === 'list' && <Metrics items={[["Tổng phiếu phù hợp", totalCount], ["Đang mượn · Trang này", loans.filter(loan => loan.status === 'Open').length], ["Quá hạn · Trang này", loans.filter(loan => loan.status === 'Open' && new Date(loan.dueAtUtc).getTime() < Date.now()).length], ["Đã trả · Trang này", loans.filter(loan => loan.status === 'Returned').length]]} />}
      <div className="ws-toolbar">{tab === 'list' && <><label className="ws-field">Trạng thái phiếu<select value={status} onChange={event => void load({ status: event.target.value, page: 1 })}><option value="">Tất cả</option><option value="Open">Đang mượn</option><option value="Returned">Đã trả</option><option value="Cancelled">Đã hủy</option></select></label><label className="availability-toggle"><input type="checkbox" checked={overdueOnly} onChange={event => void load({ overdueOnly: event.target.checked, page: 1 })} />Chỉ phiếu quá hạn</label></>}<button onClick={() => exportCsv('so-muon-tra-trang-hien-tai', [['Phiếu', 'Độc giả', 'ID bản sao', 'Ngày mượn', 'Hạn trả', 'Trạng thái', 'Phạt ghi nhận'], ...loans.map(loan => [loan.id, loan.memberName, loan.copyIds.join('; '), loan.borrowedAtUtc, loan.dueAtUtc, loan.status, loan.fineTotal])])}>Xuất CSV (trang này)</button><button onClick={() => window.print()}>In sổ</button></div>
      {isLoading && <p role="status">Đang mở sổ lưu thông…</p>}
      {tab === 'return' && selectedLoan ? <section className="ws-panel"><h2>Trả sách & Thu phạt</h2><ReturnForm key={selectedLoan.id} loan={selectedLoan} busy={isSaving} onSubmit={returnLoan} onClose={() => setParams({ tab: 'return' })} /></section> : <><p className="ws-muted">{tab === 'return' ? 'Chọn phiếu đang mở để kiểm tra từng bản sao và ghi nhận trả sách.' : 'Tiền phạt hiển thị là số tiền đã được máy chủ ghi nhận.'}</p><LoanLedger loans={loans} busy={isSaving} onReturn={loan => chooseReturn(loan.id)} onRenew={id => void renew(id)} /><Pagination page={page} pageSize={pageSize} totalCount={totalCount} disabled={isLoading} onChange={next => void load({ page: next })} /></>}
    </>}
  </WorkspacePage>;
}
