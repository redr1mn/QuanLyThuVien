import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CatalogPage from '../../features/catalog/pages/CatalogPage';
import CirculationPage from '../../features/circulation/pages/CirculationPage';
import MembersPage from '../../features/members/pages/MembersPage';
import ReaderAccountPage from '../../features/reader-account/pages/ReaderAccountPage';
import ReportsPage from '../../features/reports/pages/ReportsPage';
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
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireRole><AuthenticatedLayout /></RequireRole>}>
        <Route path="reader/account" element={<RequireRole roles={['Reader']}><ReaderAccountPage /></RequireRole>} />
        <Route path="staff/readers" element={<RequireRole roles={['Staff', 'Admin']}><MembersPage /></RequireRole>} />
        <Route path="staff/circulation" element={<RequireRole roles={['Staff', 'Admin']}><CirculationPage /></RequireRole>} />
        <Route path="admin/reports" element={<RequireRole roles={['Staff', 'Admin']}><ReportsPage /></RequireRole>} />
      </Route>
      <Route path="*" element={<PlaceholderPage title="Không tìm thấy trang" />} />
    </Routes>
  </BrowserRouter>;
}
