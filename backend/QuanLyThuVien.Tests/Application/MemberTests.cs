using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Application.Features.Members;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;
using Xunit;

namespace QuanLyThuVien.Tests.Application;

public sealed class MemberTests
{
    [Fact]
    public async Task Create_rejects_duplicate_card_number()
    {
        await using var context = CreateContext();
        context.Members.Add(new Member { CardNumber = "CARD-001", FullName = "Existing", IssuedAtUtc = DateTimeOffset.UtcNow, ExpiresAtUtc = DateTimeOffset.UtcNow.AddYears(1) });
        await context.SaveChangesAsync();

        await Assert.ThrowsAsync<ValidationException>(() => new MemberService(context).CreateAsync(
            new CreateMemberRequest("CARD-001", "New reader", "new@example.com", "0901234567", null, "Reader", 5, DateTimeOffset.UtcNow.AddYears(1)), CancellationToken.None));
    }

    [Fact]
    public async Task Get_rejects_expired_or_locked_member_for_reader_access()
    {
        await using var context = CreateContext();
        var member = new Member { CardNumber = "CARD-002", FullName = "Locked", IssuedAtUtc = DateTimeOffset.UtcNow.AddYears(-2), ExpiresAtUtc = DateTimeOffset.UtcNow.AddDays(-1), Status = MemberStatus.Suspended };
        context.Members.Add(member);
        await context.SaveChangesAsync();

        await Assert.ThrowsAsync<ForbiddenException>(() => new MemberService(context).GetAsync(member.Id, "reader-member", isStaff: false, CancellationToken.None));
    }

    [Theory]
    [InlineData("not-an-email", "0901234567")]
    [InlineData("valid@example.com", "abc")]
    public async Task Create_rejects_invalid_email_or_phone(string email, string phone)
    {
        await using var context = CreateContext();

        await Assert.ThrowsAsync<ValidationException>(() => new MemberService(context).CreateAsync(
            new CreateMemberRequest("CARD-003", "Reader", email, phone, null, "Reader", 5, DateTimeOffset.UtcNow.AddYears(1)), CancellationToken.None));
    }

    private static LibraryDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<LibraryDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new LibraryDbContext(options);
    }
}
