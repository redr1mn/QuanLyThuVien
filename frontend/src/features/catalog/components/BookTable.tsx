import type { BookListItem } from '../../../shared/schemas/catalog';
import { Link } from 'react-router-dom';

export function BookTable({ books }: { books: BookListItem[] }) {
  if (!books.length) return <p role="status">Không có sách phù hợp.</p>;

  return (
    <div className="ws-table-scroll" role="region" aria-label="Danh mục sách">
      <table className="ws-table">
        <thead><tr><th>Tên sách</th><th>Tác giả</th><th>Thể loại</th><th>Còn / Tổng</th></tr></thead>
        <tbody>{books.map((book) => <tr key={book.id}>
          <td><Link className="book-table-link" to={`/books/${book.id}`}>{book.title}</Link></td>
          <td>{book.author}</td>
          <td>{book.categoryName}</td>
          <td>{book.availableCopies} / {book.totalCopies}</td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
