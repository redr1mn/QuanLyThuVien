import { useState, type FormEvent } from 'react';
import { bookInputSchema, type BookDetails } from '../../../shared/schemas/catalog';
import { useCatalogStore } from '../store/catalog-store';

export function BookEditor({ book, onSaved }: { book?: BookDetails & { coverImage?: string | null }; onSaved: () => void }) {
  const { categories, categoryError, loadCategories, save, isSaving, error } = useCatalogStore();
  const [validation, setValidation] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? '').trim();
    const parsed = bookInputSchema.safeParse({ title: text('title'), author: text('author'), categoryId: Number(text('categoryId')), isbn: text('isbn') || null, publisher: text('publisher') || null, publishYear: text('publishYear') ? Number(text('publishYear')) : null, description: text('description') || null, replacementPrice: Number(text('replacementPrice')), coverImage: text('coverImage') || null });
    if (!parsed.success) { setValidation(parsed.error.issues[0].message); return; }
    setValidation('');
    if (await save(parsed.data, book?.id)) onSaved();
  }
  return <form onSubmit={submit}>
    <fieldset className="ws-form-grid" disabled={isSaving}>
      <label className="ws-field">Tên sách *<input name="title" defaultValue={book?.title} required autoFocus /></label>
      <label className="ws-field">Tác giả *<input name="author" defaultValue={book?.author} required /></label>
      <label className="ws-field">Thể loại *<select name="categoryId" defaultValue={book?.categoryId ?? ''} required><option value="" disabled>Chọn thể loại</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="ws-field">ISBN<input name="isbn" defaultValue={book?.isbn ?? ''} /></label>
      <label className="ws-field">Nhà xuất bản<input name="publisher" defaultValue={book?.publisher ?? ''} /></label>
      <label className="ws-field">Năm xuất bản<input name="publishYear" type="number" defaultValue={book?.publishYear ?? ''} /></label>
      <label className="ws-field">Giá thay thế (đ)<input name="replacementPrice" type="number" min="0" step="0.01" defaultValue={book?.replacementPrice ?? 0} required /></label>
      <label className="ws-field">Đường dẫn ảnh bìa<input name="coverImage" type="url" defaultValue={book?.coverImage ?? ''} /></label>
      <label className="ws-field ws-full">Mô tả<textarea name="description" rows={4} defaultValue={book?.description ?? ''} /></label>
    </fieldset>
    {categoryError && <p role="alert">{categoryError} <button type="button" onClick={() => void loadCategories()}>Tải lại thể loại</button></p>}
    {(validation || error) && <p className="notice notice-error" role="alert">{validation || error}</p>}
    <button className="ws-primary" disabled={isSaving || !categories.length}>{isSaving ? 'Đang lưu…' : 'Lưu hồ sơ sách'}</button>
  </form>;
}
