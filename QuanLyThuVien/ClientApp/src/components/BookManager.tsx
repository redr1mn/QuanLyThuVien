import React, { useState } from 'react';

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  isAvailable: boolean;
}

interface BookManagerProps {
  initialBooks?: Book[];
  title?: string;
}

const defaultBooks: Book[] = [
  { id: 1, title: 'Lập trình C# cơ bản và nâng cao', author: 'Phạm Hữu Ngôn', category: 'Công nghệ thông tin', isAvailable: true },
  { id: 2, title: 'Clean Architecture trong ASP.NET Core', author: 'Steve Smith', category: 'Kiến trúc phần mềm', isAvailable: false },
  { id: 3, title: 'Thiết kế giao diện hiện đại với React', author: 'Dan Abramov', category: 'Frontend', isAvailable: true },
  { id: 4, title: 'Nhập môn Cơ sở dữ liệu SQL Server', author: 'Lê Minh Tuấn', category: 'Dữ liệu', isAvailable: true },
];

export const BookManager: React.FC<BookManagerProps> = ({ 
  initialBooks = defaultBooks,
  title = 'Bảng Quản Lý Sách Nhanh (React Widget)' 
}) => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('Công nghệ thông tin');

  const categories = ['All', ...Array.from(new Set(books.map((b) => b.category)))];

  const handleToggleStatus = (id: number) => {
    setBooks(prev => 
      prev.map(book => 
        book.id === id ? { ...book, isAvailable: !book.isAvailable } : book
      )
    );
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const newBook: Book = {
      id: Date.now(),
      title: newTitle.trim(),
      author: newAuthor.trim(),
      category: newCategory,
      isAvailable: true,
    };

    setBooks([newBook, ...books]);
    setNewTitle('');
    setNewAuthor('');
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa cuốn sách này?')) {
      setBooks(prev => prev.filter(b => b.id !== id));
    }
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || b.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="card shadow-sm border my-4">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0">📚 {title}</h5>
        <span className="badge bg-light text-primary">React 18 Component</span>
      </div>
      <div className="card-body">
        {/* Bộ lọc và Tìm kiếm */}
        <div className="row g-2 mb-3">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm kiếm theo tên sách hoặc tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select 
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'Tất cả thể loại' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Danh sách sách */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Thể loại</th>
                <th>Trạng thái</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Không tìm thấy sách nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>#{book.id}</td>
                    <td><strong>{book.title}</strong></td>
                    <td className="text-muted">{book.author}</td>
                    <td>
                      <span className="badge bg-secondary">{book.category}</span>
                    </td>
                    <td>
                      {book.isAvailable ? (
                        <span className="badge bg-success">Có sẵn</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Đang mượn</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className={`btn btn-sm me-2 ${book.isAvailable ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleToggleStatus(book.id)}
                      >
                        {book.isAvailable ? 'Đánh dấu Mượn' : 'Đánh dấu Trả'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(book.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Form thêm sách nhanh */}
        <div className="mt-4 pt-3 border-top">
          <h6 className="fw-bold mb-3 text-secondary">➕ Thêm sách mới nhanh (Demo tương tác tức thì)</h6>
          <form onSubmit={handleAddBook} className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Tên cuốn sách..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Tác giả..."
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                <option value="Kiến trúc phần mềm">Kiến trúc phần mềm</option>
                <option value="Frontend">Frontend</option>
                <option value="Dữ liệu">Dữ liệu</option>
                <option value="Kinh tế">Kinh tế</option>
                <option value="Văn học">Văn học</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary btn-sm w-100">
                Thêm ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookManager;
