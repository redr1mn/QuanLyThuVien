import type { BookListItem } from '../../../shared/schemas/catalog';
import { Link } from 'react-router-dom';

export function BookTable({ books }: { books: BookListItem[] }) {
  if (!books.length) return <p role="status">Không có sách phù hợp.</p>;

  return (
    <div className="ws-table-scroll" role="region" aria-label="Danh mục sách">
      <table className="ws-table ws-catalog-book-table">
        <thead><tr><th>Hồ sơ / Tên sách</th><th>Xuất bản</th><th>Thể loại</th><th>Lưu thông</th></tr></thead>
        <tbody>{books.map((book) => <tr key={book.id}>
          <td><span className="library-record catalog-book-id">BK / {String(book.id).padStart(5, '0')}</span><Link className="book-table-link ws-book-title" to={`/books/${book.id}`}>{book.title}</Link><small>{book.author}</small></td>
          <td>{book.publisher || '—'}<small className="library-record">{book.publishYear ?? '—'}</small></td>
          <td>{book.categoryName}</td>
          <td><span className={`ws-stamp ${book.availableCopies ? '' : 'ws-danger'}`}>{book.availableCopies ? 'Còn sách' : 'Hết sách'}</span><small className="library-record">{book.availableCopies} / {book.totalCopies} BẢN</small></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
