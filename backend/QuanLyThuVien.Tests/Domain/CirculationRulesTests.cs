using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Domain.Rules;
using Xunit;

namespace QuanLyThuVien.Tests.Domain;

public sealed class CirculationRulesTests
{
    private static readonly DateTimeOffset Now = new(2026, 10, 18, 0, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Borrow_rejects_expired_locked_over_limit_overdue_and_unavailable()
    {
        var member = new Member { FullName = "Reader", Status = MemberStatus.Active, ExpiresAtUtc = Now.AddDays(1), MaxBooks = 2 };
        var copy = new BookCopy { Status = BookCopyStatus.Available };
        CirculationRules.ValidateBorrow(member, [copy], 1, [], Now, Now.AddDays(7));
        Assert.Throws<InvalidOperationException>(() => CirculationRules.ValidateBorrow(member, [copy], 1, [], Now, Now.AddDays(8)));
        copy.Status = BookCopyStatus.OnLoan;
        Assert.Throws<InvalidOperationException>(() => CirculationRules.ValidateBorrow(member, [copy], 0, [], Now, Now.AddDays(7)));
    }

    [Fact]
    public void Fine_calculation_handles_overdue_and_conditions()
    {
        Assert.Equal(35m, CirculationRules.CalculateFine(Now.AddDays(-2), Now, 10m, "Normal", 15m));
        Assert.Equal(120m, CirculationRules.CalculateFine(Now.AddDays(-2), Now, 10m, "Damaged", 100m));
        Assert.Equal(0m, CirculationRules.CalculateFine(Now.AddDays(2), Now, 10m, "Normal", 100m));
    }

    [Fact]
    public void Return_rejects_repeated_return_and_lost_copy_stays_unavailable()
    {
        var loan = new Loan { Status = LoanStatus.Returned };
        Assert.Throws<InvalidOperationException>(() => CirculationRules.ValidateReturn(loan));
        Assert.Equal(BookCopyStatus.Lost, CirculationRules.StatusAfterReturn("Lost"));
        Assert.Equal(BookCopyStatus.Available, CirculationRules.StatusAfterReturn("Normal"));
    }
}
