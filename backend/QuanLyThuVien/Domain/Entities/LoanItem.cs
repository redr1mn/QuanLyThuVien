namespace QuanLyThuVien.Domain.Entities;

public sealed class LoanItem
{
    public long Id { get; set; }
    public long LoanId { get; set; }
    public int BookCopyId { get; set; }
    public DateTimeOffset? ReturnedAtUtc { get; set; }
    public string? ReturnCondition { get; set; }

    public Loan Loan { get; set; } = null!;
    public BookCopy BookCopy { get; set; } = null!;
    public ICollection<Fine> Fines { get; set; } = new List<Fine>();
}
