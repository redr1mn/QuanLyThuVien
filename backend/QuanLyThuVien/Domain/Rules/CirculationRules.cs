using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;

namespace QuanLyThuVien.Domain.Rules;

public static class CirculationRules
{
    public static void ValidateBorrow(Member member, IReadOnlyCollection<BookCopy> copies, int currentLoanCount, IReadOnlyCollection<Loan> overdueLoans, DateTimeOffset now, DateTimeOffset dueAt)
    {
        if (member.Status != MemberStatus.Active || member.ExpiresAtUtc <= now) throw new InvalidOperationException("Thẻ độc giả không còn hiệu lực.");
        if (overdueLoans.Count > 0) throw new InvalidOperationException("Độc giả đang có sách quá hạn.");
        if (copies.Count == 0 || copies.Count + currentLoanCount > member.MaxBooks) throw new InvalidOperationException("Vượt quá giới hạn số sách được mượn.");
        if (copies.Any(copy => copy.Status != BookCopyStatus.Available)) throw new InvalidOperationException("Có bản sách không còn sẵn sàng.");
        if (dueAt <= now || dueAt > now.AddDays(7)) throw new InvalidOperationException("Hạn trả phải nằm trong 7 ngày kể từ ngày mượn.");
    }

    public static decimal CalculateFine(DateTimeOffset dueAt, DateTimeOffset returnedAt, decimal dailyFine, string condition, decimal conditionCharge)
    {
        var overdueDays = Math.Max(0, (returnedAt.Date - dueAt.Date).Days);
        return overdueDays * dailyFine + (overdueDays > 0 || !string.Equals(condition, "Normal", StringComparison.OrdinalIgnoreCase) ? conditionCharge : 0m);
    }

    public static void ValidateReturn(Loan loan)
    {
        if (loan.Status != LoanStatus.Open || loan.ReturnedAtUtc is not null) throw new InvalidOperationException("Phiếu mượn đã được xử lý.");
    }

    public static BookCopyStatus StatusAfterReturn(string condition) => string.Equals(condition, "Lost", StringComparison.OrdinalIgnoreCase) ? BookCopyStatus.Lost : BookCopyStatus.Available;
}
