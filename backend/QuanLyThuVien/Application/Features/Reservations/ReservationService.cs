using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Application.Features.Reservations;
public sealed class ReservationForbiddenException(string message) : Exception(message);
public sealed class ReservationService(LibraryDbContext dbContext)
{
    public async Task<ReservationItem> CreateAsync(CreateReservationRequest request, CancellationToken cancellationToken)
    {
        var member = await dbContext.Members.FindAsync([request.MemberId], cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy độc giả.");
        var book = await dbContext.Books.FindAsync([request.BookId], cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy sách.");
        var now = DateTimeOffset.UtcNow;
        var existing = await dbContext.Reservations.AnyAsync(item => item.MemberId == member.Id && item.BookId == book.Id && item.Status == ReservationStatus.Waiting && (item.ExpiresAtUtc == null || item.ExpiresAtUtc > now), cancellationToken);
        if (existing) throw new InvalidOperationException("Độc giả đã đặt trước đầu sách này.");
        var reservation = new Reservation { MemberId = member.Id, BookId = book.Id, CreatedAtUtc = now, Status = ReservationStatus.Waiting };
        dbContext.Reservations.Add(reservation); await dbContext.SaveChangesAsync(cancellationToken);
        return ToItem(reservation, book.Title);
    }
    public async Task CancelAsync(long id, int? memberId, bool isStaff, CancellationToken cancellationToken)
    {
        var reservation = await dbContext.Reservations.SingleOrDefaultAsync(item => item.Id == id, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy yêu cầu đặt trước.");
        if (!isStaff && reservation.MemberId != memberId) throw new ReservationForbiddenException("Bạn không sở hữu yêu cầu đặt trước này.");
        if (reservation.Status != ReservationStatus.Waiting) throw new InvalidOperationException("Yêu cầu đặt trước đã được xử lý.");
        reservation.Status = ReservationStatus.Cancelled; await dbContext.SaveChangesAsync(cancellationToken);
    }
    private static ReservationItem ToItem(Reservation item, string title) => new(item.Id, item.MemberId, item.BookId, title, item.Status.ToString(), item.CreatedAtUtc, item.ExpiresAtUtc);
}
