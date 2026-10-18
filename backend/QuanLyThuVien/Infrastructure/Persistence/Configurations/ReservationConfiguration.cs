using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuanLyThuVien.Domain.Entities;

namespace QuanLyThuVien.Infrastructure.Persistence.Configurations;

public sealed class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.HasKey(reservation => reservation.Id);
        builder.HasIndex(reservation => new { reservation.BookId, reservation.CreatedAtUtc });
        builder.HasIndex(reservation => new { reservation.MemberId, reservation.BookId, reservation.Status })
            .IsUnique()
            .HasFilter("[Status] = 0");
        builder.HasOne(reservation => reservation.Member)
            .WithMany(member => member.Reservations)
            .HasForeignKey(reservation => reservation.MemberId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(reservation => reservation.Book)
            .WithMany(book => book.Reservations)
            .HasForeignKey(reservation => reservation.BookId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
