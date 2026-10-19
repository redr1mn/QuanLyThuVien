using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Application.Features.Reports;
using QuanLyThuVien.Application.Features.Reservations;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Infrastructure.Persistence;
using Xunit;

namespace QuanLyThuVien.Tests.Application;

public sealed class ReservationAndReportTests
{
    [Fact]
    public async Task Duplicate_waiting_reservation_is_rejected_and_only_owner_can_cancel()
    {
        await using var context = CreateContext();
        var member = new Member { CardNumber = "R-1", FullName = "Reader", ExpiresAtUtc = DateTimeOffset.UtcNow.AddYears(1) };
        var category = new Category { Name = "Test", Slug = "test" };
        var book = new Book { Title = "Book", Author = "Author", Category = category };
        context.AddRange(member, category, book); await context.SaveChangesAsync();
        var service = new ReservationService(context);
        await service.CreateAsync(new CreateReservationRequest(member.Id, book.Id), CancellationToken.None);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateAsync(new CreateReservationRequest(member.Id, book.Id), CancellationToken.None));
        await Assert.ThrowsAsync<ReservationForbiddenException>(() => service.CancelAsync(1, 99, false, CancellationToken.None));
    }

    [Fact]
    public async Task Report_returns_zero_for_empty_date_range()
    {
        await using var context = CreateContext();
        var report = await new ReportService(context).OverviewAsync(DateTimeOffset.UtcNow.AddDays(-2), DateTimeOffset.UtcNow.AddDays(-1), CancellationToken.None);
        Assert.Equal(0, report.ActiveLoans); Assert.Equal(0, report.BorrowVolume);
    }

    private static LibraryDbContext CreateContext() => new(new DbContextOptionsBuilder<LibraryDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
}
