import { WorkspacePage } from '../../../shared/components/WorkspacePage';
import { useEffect } from 'react';
import { useAdminStore } from '../store/admin-store';

export default function AdminDashboardPage() {
  const { dashboard, isLoading, error, loadDashboard } = useAdminStore();
  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  return <WorkspacePage title="Tổng quan hệ thống">

    {isLoading && <p role="status">Đang tải số liệu…</p>}
    {error && <p role="alert">{error}</p>}
    {dashboard && <div className="ws-metrics admin-metrics">
      <div><dt>Tổng tài khoản</dt><dd>{dashboard.totalUsers}</dd></div><div><dt>Đang hoạt động</dt><dd>{dashboard.activeUsers}</dd></div><div><dt>Độc giả</dt><dd>{dashboard.readers}</dd></div><div><dt>Nhân viên</dt><dd>{dashboard.staff}</dd></div><div><dt>Admin</dt><dd>{dashboard.admins}</dd></div><div><dt>Sách</dt><dd>{dashboard.books}</dd></div><div><dt>Đang mượn</dt><dd>{dashboard.activeLoans}</dd></div><div><dt>Quá hạn</dt><dd>{dashboard.overdueLoans}</dd></div>
    </div>}
  </WorkspacePage>;
}
