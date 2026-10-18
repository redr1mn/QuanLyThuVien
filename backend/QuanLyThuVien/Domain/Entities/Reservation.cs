using QuanLyThuVien.Domain.Enums;

namespace QuanLyThuVien.Domain.Entities;

public sealed class Reservation
{
    public long Id { get; set; }
    public int MemberId { get; set; }
    public int BookId { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Waiting;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ExpiresAtUtc { get; set; }
    public DateTimeOffset? FulfilledAtUtc { get; set; }

    public Member Member { get; set; } = null!;
    public Book Book { get; set; } = null!;
}
