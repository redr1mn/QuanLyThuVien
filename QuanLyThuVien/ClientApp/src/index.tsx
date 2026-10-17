import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BookCatalog from './components/BookCatalog';
import './index.css'; // chứa @tailwind base; @tailwind components; @tailwind utilities;

const container = document.getElementById('book-catalog-root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      {/* Bản catalog hiện tại tự dùng dữ liệu mẫu khi không truyền initialBooks. */}
      <BookCatalog />
    </StrictMode>
  );
}
