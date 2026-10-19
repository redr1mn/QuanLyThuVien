using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Application.Features.Circulation;
using QuanLyThuVien.Application.Features.Members;
using QuanLyThuVien.Application.Features.Reservations;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Application.Features.ReaderAccount;

public sealed class ReaderAccountService(LibraryDbContext dbContext)
{
    public async Task<ReaderAccountView> GetAsync(string userId, CancellationToken cancellationToken)
    {
        var member = await dbContext.Users.Where(user => user.Id == userId).Select(user => user.Member).SingleOrDefaultAsync(cancellationToken) ?? throw new KeyNotFoundException("Tài khoản chưa liên kết hồ sơ độc giả.");
        var loans = await dbContext.Loans.AsNoTracking().Include(loan => loan.Member).Include(loan => loan.Items).Include(loan => loan.Fines).Where(loan => loan.MemberId == member.Id).OrderByDescending(loan => loan.BorrowedAtUtc).ToListAsync(cancellationToken);
        var reservations = await dbContext.Reservations.AsNoTracking().Include(item => item.Book).Where(item => item.MemberId == member.Id).OrderByDescending(item => item.CreatedAtUtc).ToListAsync(cancellationToken);
        var details = new MemberDetails(member.Id, member.CardNumber, member.FullName, member.Email, member.Phone, member.Address, member.MemberType, member.IssuedAtUtc, member.ExpiresAtUtc, member.Status.ToString(), member.MaxBooks, loans.Count(loan => loan.Status == LoanStatus.Open), loans.Count(loan => loan.Status == LoanStatus.Open && loan.DueAtUtc < DateTimeOffset.UtcNow));
        return new ReaderAccountView(details, loans.Where(loan => loan.Status == LoanStatus.Open).Select(ToLoan).ToArray(), loans.Where(loan => loan.Status != LoanStatus.Open).Select(ToLoan).ToArray(), reservations.Select(item => new ReservationItem(item.Id, item.MemberId, item.BookId, item.Book.Title, item.Status.ToString(), item.CreatedAtUtc, item.ExpiresAtUtc)).ToArray(), loans.SelectMany(loan => loan.Fines).Where(fine => fine.PaidAtUtc is null).Sum(fine => fine.Amount));
    }

    private static LoanListItem ToLoan(Domain.Entities.Loan loan) => new(loan.Id, loan.MemberId, loan.Member.FullName, loan.BorrowedAtUtc, loan.DueAtUtc, loan.Status.ToString(), loan.Items.Select(item => item.BookCopyId).ToArray(), loan.Fines.Sum(fine => fine.Amount), loan.RenewalCount);
}
