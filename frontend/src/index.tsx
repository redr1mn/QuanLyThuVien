import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BookCatalog from './components/BookCatalog';
import './index.css';

const container = document.getElementById('book-catalog-root');

if (container) {
  // Trang catalog lấy dữ liệu từ API; JSON Razor legacy không còn là nguồn dữ liệu chính.
  createRoot(container).render(
    <StrictMode>
      <BookCatalog />
    </StrictMode>
  );
}
