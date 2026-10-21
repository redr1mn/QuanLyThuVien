import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CatalogPage from '../../features/catalog/pages/CatalogPage';
import BookManagementPage from '../../features/catalog/pages/BookManagementPage';
import BookDetailsPage from '../../features/catalog/pages/BookDetailsPage';
import CirculationPage from '../../features/circulation/pages/CirculationPage';
import MembersPage from '../../features/members/pages/MembersPage';
import ReaderAccountPage from '../../features/reader-account/pages/ReaderAccountPage';
import ReportsPage from '../../features/reports/pages/ReportsPage';
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage';
import AdminUsersPage from '../../features/admin/pages/AdminUsersPage';
import LoginPage from '../../pages/auth/LoginPage';
import RegisterPage from '../../pages/auth/RegisterPage';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import PublicLayout from '../layouts/PublicLayout';
import RequireRole from './RequireRole';

function PlaceholderPage({ title }: { title: string }) {
  return <section aria-labelledby="page-title"><h1 id="page-title">{title}</h1><p>Trang đang được kết nối vào feature module.</p></section>;
}

export function AppRoutes() {
  return <BrowserRouter>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<CatalogPage />} />
        <Route path="books/:id" element={<BookDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireRole><AuthenticatedLayout /></RequireRole>}>
        <Route path="staff/books" element={<RequireRole roles={['Staff', 'Admin']}><BookManagementPage /></RequireRole>} />
        <Route path="reader/account" element={<RequireRole roles={['Reader']}><ReaderAccountPage /></RequireRole>} />
        <Route path="staff/readers" element={<RequireRole roles={['Staff', 'Admin']}><MembersPage /></RequireRole>} />
        <Route path="staff/circulation" element={<RequireRole roles={['Staff', 'Admin']}><CirculationPage /></RequireRole>} />
        <Route path="admin/reports" element={<RequireRole roles={['Staff', 'Admin']}><ReportsPage /></RequireRole>} />
        <Route path="admin/dashboard" element={<RequireRole roles={['Admin']}><AdminDashboardPage /></RequireRole>} />
        <Route path="admin/users" element={<RequireRole roles={['Admin']}><AdminUsersPage /></RequireRole>} />
      </Route>
      <Route path="*" element={<PlaceholderPage title="Không tìm thấy trang" />} />
    </Routes>
  </BrowserRouter>;
}
