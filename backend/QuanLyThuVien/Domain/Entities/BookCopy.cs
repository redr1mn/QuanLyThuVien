using QuanLyThuVien.Domain.Enums;

namespace QuanLyThuVien.Domain.Entities;

public sealed class BookCopy
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string ShelfLocation { get; set; } = string.Empty;
    public BookCopyStatus Status { get; set; } = BookCopyStatus.Available;
    public DateTimeOffset AcquiredAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public Book Book { get; set; } = null!;
    public ICollection<LoanItem> LoanItems { get; set; } = new List<LoanItem>();
}
