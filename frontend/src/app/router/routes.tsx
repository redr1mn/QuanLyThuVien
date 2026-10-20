import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CatalogPage from '../../features/catalog/pages/CatalogPage';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import PublicLayout from '../layouts/PublicLayout';

function PlaceholderPage({ title }: { title: string }) {
  return <section aria-labelledby="page-title"><h1 id="page-title">{title}</h1><p>Trang đang được kết nối vào feature module.</p></section>;
}

export function AppRoutes() {
  return <BrowserRouter>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<CatalogPage />} />
        <Route path="login" element={<PlaceholderPage title="Đăng nhập" />} />
        <Route path="register" element={<PlaceholderPage title="Đăng ký" />} />
      </Route>
      <Route element={<AuthenticatedLayout />}>
        <Route path="reader/account" element={<PlaceholderPage title="Tài khoản độc giả" />} />
        <Route path="staff/readers" element={<PlaceholderPage title="Quản lý độc giả" />} />
        <Route path="staff/circulation" element={<PlaceholderPage title="Mượn trả sách" />} />
        <Route path="admin/reports" element={<PlaceholderPage title="Báo cáo" />} />
      </Route>
      <Route path="*" element={<PlaceholderPage title="Không tìm thấy trang" />} />
    </Routes>
  </BrowserRouter>;
}
