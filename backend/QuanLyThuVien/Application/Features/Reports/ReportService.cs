using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Application.Features.Reports;
public sealed class ReportService(LibraryDbContext dbContext)
{
    public async Task<ReportOverview> OverviewAsync(DateTimeOffset from, DateTimeOffset to, CancellationToken cancellationToken)
    {
        if (to < from) throw new System.ComponentModel.DataAnnotations.ValidationException("Khoảng thời gian không hợp lệ.");
        var active = await dbContext.Loans.CountAsync(loan => loan.Status == LoanStatus.Open, cancellationToken);
        var overdue = await dbContext.Loans.CountAsync(loan => loan.Status == LoanStatus.Open && loan.DueAtUtc < DateTimeOffset.UtcNow, cancellationToken);
        var books = await dbContext.Books.CountAsync(book => !book.IsDeleted, cancellationToken);
        var members = await dbContext.Members.CountAsync(cancellationToken);
        var borrows = await dbContext.Loans.Where(loan => loan.BorrowedAtUtc >= from && loan.BorrowedAtUtc <= to).CountAsync(cancellationToken);
        var returns = await dbContext.Loans.Where(loan => loan.ReturnedAtUtc >= from && loan.ReturnedAtUtc <= to).CountAsync(cancellationToken);
        var top = await dbContext.LoanItems.Where(item => item.Loan.BorrowedAtUtc >= from && item.Loan.BorrowedAtUtc <= to).GroupBy(item => new { item.BookCopy.BookId, item.BookCopy.Book.Title }).OrderByDescending(group => group.Count()).Take(5).Select(group => new TopBookReport(group.Key.BookId, group.Key.Title, group.Count())).ToListAsync(cancellationToken);
        return new ReportOverview(active, overdue, books, members, borrows, returns, top);
    }
}
