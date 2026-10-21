import { useEffect, useRef, type ReactNode } from 'react';

export function PageHeading({ index, title, description, children, id }: { index: string; title: string; description: string; children?: ReactNode; id?: string }) {
  return <header className="editorial-heading"><div><p className="eyebrow">SỔ CÁI THƯ VIỆN / {index}</p><h1 id={id}>{title}</h1><p className="editorial-subtitle">{description}</p></div>{children}</header>;
}

export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); trigger?.focus(); };
  }, []);
  return <dialog ref={ref} className="ws-dialog" aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="ws-section-heading"><h2 id="dialog-title">{title}</h2><button type="button" onClick={onClose} aria-label="Đóng hộp thoại">Đóng ×</button></div>{children}
  </dialog>;
}

export function Pagination({ page, pageSize, totalCount, disabled, onChange }: { page: number; pageSize: number; totalCount: number; disabled?: boolean; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(totalCount / pageSize));
  return <nav className="ws-pagination" aria-label="Phân trang"><span>{totalCount} bản ghi · Trang {page}/{pages}</span><div className="ws-actions"><button type="button" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>Trước</button><button type="button" disabled={disabled || page >= pages} onClick={() => onChange(page + 1)}>Sau</button></div></nav>;
}

