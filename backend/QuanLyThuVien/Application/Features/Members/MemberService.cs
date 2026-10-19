using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;
using QuanLyThuVien.Application.Features.Catalog;

namespace QuanLyThuVien.Application.Features.Members;

public sealed class ForbiddenException(string message) : Exception(message);

public sealed class MemberService(LibraryDbContext dbContext)
{
    private sealed record LoanCounts(int Current, int Overdue);
    public async Task<PagedResult<MemberListItem>> ListAsync(MemberQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = dbContext.Members.AsNoTracking().AsQueryable();
        var search = request.Query?.Trim().ToLowerInvariant();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(member => member.CardNumber.ToLower().Contains(search) || member.FullName.ToLower().Contains(search) || (member.Email != null && member.Email.ToLower().Contains(search)) || (member.Phone != null && member.Phone.Contains(search)));
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<MemberStatus>(request.Status, true, out var status))
            query = query.Where(member => member.Status == status);

        var total = await query.CountAsync(cancellationToken);
        var members = await query.OrderBy(member => member.FullName).ThenBy(member => member.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        var ids = members.Select(member => member.Id).ToArray();
        var counts = await dbContext.Loans.AsNoTracking().Where(loan => ids.Contains(loan.MemberId) && loan.Status == LoanStatus.Open)
            .GroupBy(loan => loan.MemberId).Select(group => new { MemberId = group.Key, Current = group.Count(), Overdue = group.Count(loan => loan.DueAtUtc < DateTimeOffset.UtcNow) }).ToDictionaryAsync(row => row.MemberId, row => new LoanCounts(row.Current, row.Overdue), cancellationToken);
        return new PagedResult<MemberListItem>(members.Select(member => ToListItem(member, counts.GetValueOrDefault(member.Id) ?? new LoanCounts(0, 0))).ToArray(), page, pageSize, total);
    }

    public async Task<MemberDetails> GetAsync(int id, string? userId, bool isStaff, CancellationToken cancellationToken)
    {
        if (!isStaff && !await dbContext.Users.AnyAsync(user => user.Id == userId && user.MemberId == id, cancellationToken))
            throw new ForbiddenException("Bạn chỉ được xem hồ sơ độc giả đã liên kết.");
        var member = await dbContext.Members.AsNoTracking().SingleOrDefaultAsync(item => item.Id == id, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy hồ sơ độc giả.");
        return await ToDetailsAsync(member, cancellationToken);
    }

    public async Task<MemberDetails> CreateAsync(CreateMemberRequest request, CancellationToken cancellationToken)
    {
        Validate(request.CardNumber, request.FullName, request.Email, request.Phone, request.MaxBooks, request.ExpiresAtUtc);
        var card = request.CardNumber.Trim();
        if (await dbContext.Members.AnyAsync(member => member.CardNumber == card, cancellationToken))
            throw new ValidationException("Số thẻ đã tồn tại.");
        var member = new Member { CardNumber = card, FullName = request.FullName.Trim(), Email = NormalizeOptional(request.Email), Phone = NormalizeOptional(request.Phone), Address = NormalizeOptional(request.Address), MemberType = request.MemberType.Trim(), MaxBooks = request.MaxBooks, IssuedAtUtc = DateTimeOffset.UtcNow, ExpiresAtUtc = request.ExpiresAtUtc, Status = MemberStatus.Active };
        dbContext.Members.Add(member);
        await dbContext.SaveChangesAsync(cancellationToken);
        return await ToDetailsAsync(member, cancellationToken);
    }

    public async Task<MemberDetails> UpdateAsync(int id, UpdateMemberRequest request, CancellationToken cancellationToken)
    {
        Validate(request.CardNumber, request.FullName, request.Email, request.Phone, request.MaxBooks, request.ExpiresAtUtc);
        if (!Enum.TryParse<MemberStatus>(request.Status, true, out var status)) throw new ValidationException("Trạng thái độc giả không hợp lệ.");
        var member = await dbContext.Members.SingleOrDefaultAsync(item => item.Id == id, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy hồ sơ độc giả.");
        var card = request.CardNumber.Trim();
        if (await dbContext.Members.AnyAsync(item => item.Id != id && item.CardNumber == card, cancellationToken)) throw new ValidationException("Số thẻ đã tồn tại.");
        member.CardNumber = card; member.FullName = request.FullName.Trim(); member.Email = NormalizeOptional(request.Email); member.Phone = NormalizeOptional(request.Phone); member.Address = NormalizeOptional(request.Address); member.MemberType = request.MemberType.Trim(); member.MaxBooks = request.MaxBooks; member.ExpiresAtUtc = request.ExpiresAtUtc; member.Status = status;
        await dbContext.SaveChangesAsync(cancellationToken);
        return await ToDetailsAsync(member, cancellationToken);
    }

    private async Task<MemberDetails> ToDetailsAsync(Member member, CancellationToken cancellationToken)
    {
        var loans = await dbContext.Loans.AsNoTracking().Where(loan => loan.MemberId == member.Id && loan.Status == LoanStatus.Open).ToListAsync(cancellationToken);
        return new MemberDetails(member.Id, member.CardNumber, member.FullName, member.Email, member.Phone, member.Address, member.MemberType, member.IssuedAtUtc, member.ExpiresAtUtc, member.Status.ToString(), member.MaxBooks, loans.Count, loans.Count(loan => loan.DueAtUtc < DateTimeOffset.UtcNow));
    }

    private static MemberListItem ToListItem(Member member, LoanCounts counts) => new(member.Id, member.CardNumber, member.FullName, member.Email, member.Phone, member.MemberType, member.ExpiresAtUtc, member.Status.ToString(), counts.Current, counts.Overdue);

    private static void Validate(string card, string fullName, string? email, string? phone, int maxBooks, DateTimeOffset expiresAtUtc)
    {
        if (string.IsNullOrWhiteSpace(card) || string.IsNullOrWhiteSpace(fullName) || maxBooks is < 1 or > 100 || expiresAtUtc <= DateTimeOffset.UtcNow) throw new ValidationException("Thông tin độc giả không hợp lệ.");
        if (!string.IsNullOrWhiteSpace(email) && !new EmailAddressAttribute().IsValid(email.Trim())) throw new ValidationException("Email không hợp lệ.");
        if (!string.IsNullOrWhiteSpace(phone) && !Regex.IsMatch(phone.Trim(), "^[0-9+() .-]{7,30}$")) throw new ValidationException("Số điện thoại không hợp lệ.");
    }

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
