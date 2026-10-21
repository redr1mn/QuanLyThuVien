import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { WorkspacePage, Metrics, exportCsv } from '../../../shared/components/WorkspacePage';
import { Pagination } from '../../../shared/components/Editorial';
import { useReportsStore } from '../store/reports-store';
import { useCirculationStore } from '../../circulation/store/circulation-store';
import { LoanLedger } from '../../circulation/components/LoanLedger';

const dateInput = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const tabs = [['overview', 'Tổng quan'], ['circulation', 'Mượn trả'], ['overdue', 'Sách quá hạn'], ['fines', 'Tiền phạt']] as const;
export default function ReportsPage() {
  const { report, isLoading, error, load } = useReportsStore();
  const circulation = useCirculationStore();
  const [params] = useSearchParams();
  const tab = params.get('tab') ?? 'overview';
  const [from, setFrom] = useState(() => dateInput(new Date(Date.now() - 90 * 86400000)));
  const [to, setTo] = useState(() => dateInput(new Date()));
  const [period, setPeriod] = useState('90 ngày gần nhất');
  const [validation, setValidation] = useState('');
  const [appliedPeriod, setAppliedPeriod] = useState('');
  function refresh() {
    if (!from || !to || from > to) { setValidation('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.'); return; }
    setValidation(''); setAppliedPeriod(`${from} — ${to}`);
    void load(new Date(`${from}T00:00:00`).toISOString(), new Date(`${to}T23:59:59.999`).toISOString());
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (tab === 'overview' || tab === 'overdue') void circulation.load({ status: 'Open', overdueOnly: true, page: 1, pageSize: 8 }); }, [tab, circulation.load]);
  function changePeriod(value: string) {
    setPeriod(value); const now = new Date(); const today = dateInput(now); setTo(today);
    if (value !== 'Tùy chọn') setFrom(value === 'Hôm nay' ? today : value === 'Tháng này' ? `${today.slice(0, 7)}-01` : value === 'Năm nay' ? `${today.slice(0, 4)}-01-01` : dateInput(new Date(now.getTime() - 90 * 86400000)));
  }
  function exportReport() {
    if (!report) return;
    exportCsv('bao-cao-thu-vien', [['Kỳ đã áp dụng', appliedPeriod], ['Lượt mượn trong kỳ', report.borrowVolume], ['Lượt trả trong kỳ', report.returnVolume], ['Đầu sách hiện tại', report.books], ['Độc giả hiện tại', report.members], ['Phiếu đang mượn hiện tại', report.activeLoans], ['Phiếu quá hạn hiện tại', report.overdueLoans], [], ['Đầu sách', 'Lượt mượn'], ...report.topBooks.map(book => [book.title, book.borrowCount])]);
  }
  return <WorkspacePage title="Thống kê & Báo cáo" tabs={tabs}>
    <form className="ws-toolbar" onSubmit={event => { event.preventDefault(); refresh(); }}><label className="ws-field">Kỳ báo cáo<select value={period} onChange={event => changePeriod(event.target.value)}>{['90 ngày gần nhất', 'Hôm nay', 'Tháng này', 'Năm nay', 'Tùy chọn'].map(value => <option key={value}>{value}</option>)}</select></label><label className="ws-field">Từ ngày<input type="date" value={from} max={to} onChange={event => { setFrom(event.target.value); setPeriod('Tùy chọn'); }} required /></label><label className="ws-field">Đến ngày<input type="date" min={from} value={to} onChange={event => { setTo(event.target.value); setPeriod('Tùy chọn'); }} required /></label><button className="ws-primary" disabled={isLoading}>Xem báo cáo</button><button type="button" disabled={!report || isLoading} onClick={exportReport}>Xuất CSV</button><button type="button" disabled={isLoading} onClick={() => window.print()}>In / Lưu PDF</button></form>
    {validation && <p role="alert" className="ws-notice">{validation}</p>}{isLoading && <p role="status">Đang mở sổ dữ liệu…</p>}{error && <p role="alert" className="ws-notice">{error}<button onClick={refresh}>Thử lại</button></p>}
    {!isLoading && !error && report && <><p className="library-record">Kỳ báo cáo: {appliedPeriod}</p><Metrics items={[["Lượt mượn trong kỳ", report.borrowVolume], ["Lượt trả trong kỳ", report.returnVolume], ["Đầu sách · Hiện tại", report.books], ["Độc giả · Hiện tại", report.members], ["Phiếu đang mượn · Hiện tại", report.activeLoans], ["Phiếu quá hạn · Hiện tại", report.overdueLoans]]} />
      {(tab === 'overview' || tab === 'circulation') && <div className="ws-split"><section className="ws-panel"><h2>Nhịp mượn sách</h2><p className="ws-muted">Tổng lượt mượn và trả trong kỳ báo cáo đã chọn.</p><div className="ws-chart">{[['Mượn', report.borrowVolume], ['Trả', report.returnVolume]].map(([label, value]) => <div key={label}><span className="library-record">{label}</span><div className="ws-track" aria-hidden="true"><span style={{ width: `${Number(value) / Math.max(1, report.borrowVolume, report.returnVolume) * 100}%` }} /></div><b className="library-record">{value}</b></div>)}</div></section><section className="ws-panel"><h2>Sách được mượn nhiều</h2><div className="ws-table-scroll"><table className="ws-table"><thead><tr><th>Tên sách</th><th>Lượt mượn</th></tr></thead><tbody>{report.topBooks.map(book => <tr key={book.bookId}><td><Link className="ws-book-title" to={`/books/${book.bookId}`}>{book.title}</Link></td><td className="library-record">{book.borrowCount}</td></tr>)}{!report.topBooks.length && <tr><td colSpan={2} className="ws-empty">Chưa có dữ liệu trong kỳ.</td></tr>}</tbody></table></div></section></div>}
      {(tab === 'overview' || tab === 'overdue') && <section className="ws-panel"><h2>Cần nhắc trả sách</h2><p className="ws-muted">Phiếu chưa trả và đang quá hạn tại thời điểm hiện tại, không giới hạn theo kỳ báo cáo.</p>{circulation.isLoading ? <p role="status">Đang tải phiếu quá hạn…</p> : circulation.error ? <p role="alert">{circulation.error}</p> : <><LoanLedger loans={circulation.loans} /><Pagination page={circulation.page} pageSize={circulation.pageSize} totalCount={circulation.totalCount} onChange={page => void circulation.load({ page })} /></>}</section>}
      {tab === 'fines' && <section className="ws-panel"><h2>Tiền phạt & Bồi thường</h2><p>Tiền phạt đã ghi nhận được hiển thị trên từng phiếu sau khi trả sách. Báo cáo tổng tiền đã thu theo kỳ hiện chưa có dữ liệu.</p><Link to="/staff/circulation">Xem sổ mượn trả →</Link></section>}
    </>}
  </WorkspacePage>;
}
