using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using QuanLyThuVien.Application.Common;
using QuanLyThuVien.Application.Features.Circulation;
using QuanLyThuVien.Application.Features.ReaderAccount;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;
using Xunit;

namespace QuanLyThuVien.Tests.Application;

public sealed class RenewalAndReaderAccountTests
{
    private static readonly DateTimeOffset Now = new(2026, 10, 19, 0, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task Reader_can_renew_own_open_loan_once_when_no_waiting_reservation_exists()
    {
        await using var context = CreateContext();
        var member = new Member { CardNumber = "R-RENEW", FullName = "Reader", ExpiresAtUtc = Now.AddYears(1), MaxBooks = 5 };
        var category = new Category { Name = "Test", Slug = "test" };
        var book = new Book { Title = "Renewable", Author = "Author", Category = category };
        var copy = new BookCopy { Barcode = "RENEW-001", ShelfLocation = "A.01", Book = book, Status = BookCopyStatus.OnLoan };
        var loan = new Loan { Member = member, BorrowedAtUtc = Now.AddDays(-2), DueAtUtc = Now.AddDays(2), Status = LoanStatus.Open, Items = [new LoanItem { BookCopy = copy }] };
        context.AddRange(member, category, book, copy, loan); await context.SaveChangesAsync();
        var service = new CirculationService(context, new FixedClock(Now), Options.Create(new LibraryOptions { DailyFine = 10000m }));

        var renewed = await service.RenewAsync(loan.Id, member.Id, isStaff: false, CancellationToken.None);

        Assert.Equal(1, renewed.RenewalCount);
        Assert.Equal(Now.AddDays(9), renewed.DueAtUtc);
        await Assert.ThrowsAsync<ConflictException>(() => service.RenewAsync(loan.Id, member.Id, false, CancellationToken.None));
    }

    [Fact]
    public async Task Reader_account_returns_only_the_linked_member_projection()
    {
        await using var context = CreateContext();
        var member = new Member { CardNumber = "R-ACCOUNT", FullName = "Account Reader", ExpiresAtUtc = Now.AddYears(1) };
        var user = new ApplicationUser { Id = "reader-user", UserName = "reader", NormalizedUserName = "READER", Member = member };
        context.AddRange(member, user); await context.SaveChangesAsync();

        var account = await new ReaderAccountService(context).GetAsync(user.Id, CancellationToken.None);

        Assert.Equal(member.Id, account.Profile.Id);
        Assert.Equal("Account Reader", account.Profile.FullName);
        Assert.Empty(account.CurrentLoans);
        Assert.Empty(account.History);
    }

    private static LibraryDbContext CreateContext() => new(new DbContextOptionsBuilder<LibraryDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private sealed class FixedClock(DateTimeOffset value) : IClock { public DateTimeOffset UtcNow => value; }
}
