using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Options;
using QuanLyThuVien.Application.Common;
using QuanLyThuVien.Application.Features.Catalog;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Domain.Rules;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Application.Features.Circulation;

public sealed class CirculationForbiddenException(string message) : Exception(message);
public sealed class ConflictException(string message) : Exception(message);

public sealed class CirculationService(LibraryDbContext dbContext, IClock clock, IOptions<LibraryOptions> options)
{
    public async Task<LoanListItem> BorrowAsync(BorrowCommand command, CancellationToken cancellationToken)
    {
        await using var transaction = await BeginTransactionAsync(cancellationToken);
        var member = await dbContext.Members.SingleOrDefaultAsync(item => item.Id == command.MemberId, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy độc giả.");
        var copies = await dbContext.BookCopies.Include(copy => copy.Book).Where(copy => command.CopyIds.Contains(copy.Id)).ToListAsync(cancellationToken);
        if (copies.Count != command.CopyIds.Distinct().Count()) throw new KeyNotFoundException("Không tìm thấy một hoặc nhiều bản sách.");
        var openLoans = await dbContext.Loans.Include(loan => loan.Items).Where(loan => loan.MemberId == member.Id && loan.Status == LoanStatus.Open).ToListAsync(cancellationToken);
        var overdue = openLoans.Where(loan => loan.DueAtUtc < clock.UtcNow).ToArray();
        try { CirculationRules.ValidateBorrow(member, copies, openLoans.Sum(loan => loan.Items.Count), overdue, clock.UtcNow, command.DueAt); }
        catch (InvalidOperationException exception) when (copies.Any(copy => copy.Status != BookCopyStatus.Available)) { throw new ConflictException(exception.Message); }
        var loan = new Loan { MemberId = member.Id, BorrowedAtUtc = clock.UtcNow, DueAtUtc = command.DueAt, Status = LoanStatus.Open };
        foreach (var copy in copies) { copy.Status = BookCopyStatus.OnLoan; loan.Items.Add(new LoanItem { BookCopyId = copy.Id }); }
        dbContext.Loans.Add(loan);
        await dbContext.SaveChangesAsync(cancellationToken);
        await CommitAsync(transaction, cancellationToken);
        return ToListItem(loan, member.FullName, 0m);
    }

    public async Task<LoanListItem> ReturnAsync(long id, ReturnCommand command, CancellationToken cancellationToken)
    {
        await using var transaction = await BeginTransactionAsync(cancellationToken);
        var loan = await dbContext.Loans.Include(item => item.Member).Include(item => item.Items).ThenInclude(item => item.BookCopy).ThenInclude(copy => copy.Book).Include(item => item.Fines).SingleOrDefaultAsync(item => item.Id == id, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy phiếu mượn.");
        try { CirculationRules.ValidateReturn(loan); } catch (InvalidOperationException exception) { throw new ConflictException(exception.Message); }
        var requested = command.Items.ToDictionary(item => item.CopyId);
        if (requested.Count != loan.Items.Count || loan.Items.Any(item => !requested.ContainsKey(item.BookCopyId))) throw new InvalidOperationException("Cần xử lý toàn bộ bản sách trong phiếu.");
        var returnedAt = clock.UtcNow;
        foreach (var item in loan.Items)
        {
            var condition = requested[item.BookCopyId].Condition;
            item.ReturnedAtUtc = returnedAt; item.ReturnCondition = condition; item.BookCopy.Status = CirculationRules.StatusAfterReturn(condition);
            var conditionCharge = condition.Equals("Lost", StringComparison.OrdinalIgnoreCase) ? item.BookCopy.Book.ReplacementPrice : condition.Equals("Damaged", StringComparison.OrdinalIgnoreCase) ? item.BookCopy.Book.ReplacementPrice * 0.1m : 0m;
            var amount = CirculationRules.CalculateFine(loan.DueAtUtc, returnedAt, options.Value.DailyFine, condition, conditionCharge);
            if (amount > 0) loan.Fines.Add(new Fine { LoanItemId = item.Id, Amount = amount, DailyRate = options.Value.DailyFine, DaysOverdue = Math.Max(0, (returnedAt.Date - loan.DueAtUtc.Date).Days), Reason = condition });
        }
        loan.ReturnedAtUtc = returnedAt; loan.Status = LoanStatus.Returned;
        await dbContext.SaveChangesAsync(cancellationToken);
        await CommitAsync(transaction, cancellationToken);
        return ToListItem(loan, loan.Member.FullName, loan.Fines.Sum(fine => fine.Amount));
    }

    public async Task<LoanListItem> RenewAsync(long id, int? memberId, bool isStaff, CancellationToken cancellationToken)
    {
        await using var transaction = await BeginTransactionAsync(cancellationToken);
        var loan = await dbContext.Loans.Include(item => item.Member).Include(item => item.Items).ThenInclude(item => item.BookCopy).Include(item => item.Fines).SingleOrDefaultAsync(item => item.Id == id, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy phiếu mượn.");
        if (!isStaff && loan.MemberId != memberId) throw new CirculationForbiddenException("Bạn không được gia hạn phiếu mượn của độc giả khác.");
        if (loan.Status != LoanStatus.Open || loan.RenewalCount >= 1 || loan.DueAtUtc < clock.UtcNow) throw new ConflictException("Phiếu mượn không đủ điều kiện gia hạn.");
        var bookIds = await dbContext.LoanItems.Where(item => item.LoanId == loan.Id).Select(item => item.BookCopy.BookId).ToArrayAsync(cancellationToken);
        if (await dbContext.Reservations.AnyAsync(item => bookIds.Contains(item.BookId) && item.Status == ReservationStatus.Waiting && item.MemberId != loan.MemberId, cancellationToken)) throw new ConflictException("Sách đã có độc giả khác đặt trước.");
        loan.DueAtUtc = loan.DueAtUtc.AddDays(7); loan.RenewalCount++;
        await dbContext.SaveChangesAsync(cancellationToken); await CommitAsync(transaction, cancellationToken);
        return ToListItem(loan, loan.Member.FullName, loan.Fines.Sum(fine => fine.Amount));
    }

    public async Task<PagedResult<LoanListItem>> ListAsync(int? memberId, string? status, bool overdueOnly, int page, int pageSize, CancellationToken cancellationToken)
    {
        page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 100);
        var query = dbContext.Loans.AsNoTracking().Include(loan => loan.Member).Include(loan => loan.Items).Include(loan => loan.Fines).AsQueryable();
        if (memberId.HasValue) query = query.Where(loan => loan.MemberId == memberId.Value);
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<LoanStatus>(status, true, out var parsed)) query = query.Where(loan => loan.Status == parsed);
        if (overdueOnly) query = query.Where(loan => loan.Status == LoanStatus.Open && loan.DueAtUtc < clock.UtcNow);
        var total = await query.CountAsync(cancellationToken);
        var loans = await query.OrderByDescending(loan => loan.BorrowedAtUtc).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new PagedResult<LoanListItem>(loans.Select(loan => ToListItem(loan, loan.Member.FullName, loan.Fines.Sum(fine => fine.Amount))).ToArray(), page, pageSize, total);
    }

    private static LoanListItem ToListItem(Loan loan, string memberName, decimal fineTotal) => new(loan.Id, loan.MemberId, memberName, loan.BorrowedAtUtc, loan.DueAtUtc, loan.Status.ToString(), loan.Items.Select(item => item.BookCopyId).ToArray(), fineTotal, loan.RenewalCount);
    private Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken) => dbContext.Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory" ? Task.FromResult<IDbContextTransaction>(new NoopTransaction()) : dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, cancellationToken);
    private static Task CommitAsync(IDbContextTransaction transaction, CancellationToken cancellationToken) => transaction.CommitAsync(cancellationToken);

    private sealed class NoopTransaction : IDbContextTransaction
    {
        public Guid TransactionId => Guid.Empty;
        public void Dispose() { }
        public ValueTask DisposeAsync() => ValueTask.CompletedTask;
        public void Commit() { }
        public Task CommitAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
        public void Rollback() { }
        public Task RollbackAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
        public void CreateSavepoint(string name) { }
        public Task CreateSavepointAsync(string name, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public void RollbackToSavepoint(string name) { }
        public Task RollbackToSavepointAsync(string name, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public void ReleaseSavepoint(string name) { }
        public Task ReleaseSavepointAsync(string name, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
