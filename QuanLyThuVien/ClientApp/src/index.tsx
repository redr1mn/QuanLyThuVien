import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BookCatalog from './components/BookCatalog';
import './index.css';

const container = document.getElementById('book-catalog-root');

if (container) {
  // TODO: Đọc JSON từ #book-data để dùng Model Razor; hiện chưa truyền props nên catalog dùng MOCK_BOOKS.
  createRoot(container).render(
    <StrictMode>
      <BookCatalog />
    </StrictMode>
  );
}
