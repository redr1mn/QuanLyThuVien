using QuanLyThuVien.Domain.Enums;

namespace QuanLyThuVien.Domain.Entities;

public sealed class Member
{
    public int Id { get; set; }
    public string CardNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string MemberType { get; set; } = "Reader";
    public DateTimeOffset IssuedAtUtc { get; set; }
    public DateTimeOffset ExpiresAtUtc { get; set; }
    public MemberStatus Status { get; set; } = MemberStatus.Active;
    public int MaxBooks { get; set; } = 5;

    public ApplicationUser? User { get; set; }
    public ICollection<Loan> Loans { get; set; } = new List<Loan>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
