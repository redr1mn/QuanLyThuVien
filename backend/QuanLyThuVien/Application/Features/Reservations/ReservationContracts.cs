namespace QuanLyThuVien.Application.Features.Reservations;
public sealed record CreateReservationRequest(int MemberId, int BookId);
public sealed record ReservationItem(long Id, int MemberId, int BookId, string BookTitle, string Status, DateTimeOffset CreatedAtUtc, DateTimeOffset? ExpiresAtUtc);
