using QuanLyThuVien.Domain.Enums;

namespace QuanLyThuVien.Domain.Entities;

public sealed class Loan
{
    public long Id { get; set; }
    public int MemberId { get; set; }
    public string? ProcessedByUserId { get; set; }
    public DateTimeOffset BorrowedAtUtc { get; set; }
    public DateTimeOffset DueAtUtc { get; set; }
    public DateTimeOffset? ReturnedAtUtc { get; set; }
    public LoanStatus Status { get; set; } = LoanStatus.Open;
    public int RenewalCount { get; set; }

    public Member Member { get; set; } = null!;
    public ApplicationUser? ProcessedByUser { get; set; }
    public ICollection<LoanItem> Items { get; set; } = new List<LoanItem>();
    public ICollection<Fine> Fines { get; set; } = new List<Fine>();
}
