namespace QuanLyThuVien.Domain.Entities;

public sealed class Fine
{
    public long Id { get; set; }
    public long LoanId { get; set; }
    public long? LoanItemId { get; set; }
    public decimal Amount { get; set; }
    public decimal DailyRate { get; set; }
    public int DaysOverdue { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? PaidAtUtc { get; set; }

    public Loan Loan { get; set; } = null!;
    public LoanItem? LoanItem { get; set; }
}
