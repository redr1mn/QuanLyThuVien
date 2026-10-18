using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using QuanLyThuVien.Application.Common;
using QuanLyThuVien.Application.Features.Circulation;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;
using Xunit;

namespace QuanLyThuVien.Tests.Application;

public sealed class CirculationServiceTests
{
    private static readonly DateTimeOffset Now = new(2026, 10, 18, 0, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task Borrow_and_return_updates_copy_and_fine_in_one_use_case()
    {
        await using var context = new LibraryDbContext(new DbContextOptionsBuilder<LibraryDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var category = new Category { Name = "Test", Slug = "test" };
        var member = new Member { CardNumber = "C-1", FullName = "Reader", ExpiresAtUtc = Now.AddYears(1), MaxBooks = 5 };
        var book = new Book { Title = "Book", Author = "Author", Category = category, ReplacementPrice = 100 };
        var copy = new BookCopy { Barcode = "B-1", ShelfLocation = "A", Book = book };
        context.AddRange(category, member, book, copy); await context.SaveChangesAsync();
        var service = new CirculationService(context, new FixedClock(Now), Options.Create(new LibraryOptions { DailyFine = 10 }));
        var loan = await service.BorrowAsync(new BorrowCommand(member.Id, [copy.Id], Now.AddDays(1)), CancellationToken.None);
        Assert.Equal(LoanStatus.Open.ToString(), loan.Status); Assert.Equal(BookCopyStatus.OnLoan, copy.Status);
        var returned = await service.ReturnAsync(loan.Id, new ReturnCommand([new ReturnItemCommand(copy.Id, "Damaged")]), CancellationToken.None);
        Assert.Equal(LoanStatus.Returned.ToString(), returned.Status); Assert.Equal(10m, returned.FineTotal); Assert.Equal(BookCopyStatus.Available, copy.Status);
    }

    private sealed class FixedClock(DateTimeOffset value) : IClock { public DateTimeOffset UtcNow => value; }
}
