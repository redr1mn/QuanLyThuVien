using Microsoft.AspNetCore.Identity;

namespace QuanLyThuVien.Domain.Entities;

public sealed class ApplicationUser : IdentityUser
{
    public int? MemberId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public Member? Member { get; set; }
}
