using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuanLyThuVien.Domain.Entities;

namespace QuanLyThuVien.Infrastructure.Persistence.Configurations;

public sealed class BookCopyConfiguration : IEntityTypeConfiguration<BookCopy>
{
    public void Configure(EntityTypeBuilder<BookCopy> builder)
    {
        builder.HasKey(copy => copy.Id);
        builder.Property(copy => copy.Barcode).HasMaxLength(80).IsRequired();
        builder.Property(copy => copy.ShelfLocation).HasMaxLength(80).IsRequired();
        builder.HasIndex(copy => copy.Barcode).IsUnique();
        builder.HasIndex(copy => new { copy.BookId, copy.Status });
        builder.HasOne(copy => copy.Book)
            .WithMany(book => book.Copies)
            .HasForeignKey(copy => copy.BookId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
