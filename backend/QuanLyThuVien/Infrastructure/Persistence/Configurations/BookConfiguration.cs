using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuanLyThuVien.Domain.Entities;

namespace QuanLyThuVien.Infrastructure.Persistence.Configurations;

public sealed class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.HasKey(book => book.Id);
        builder.Property(book => book.Isbn).HasMaxLength(20);
        builder.Property(book => book.Title).HasMaxLength(300).IsRequired();
        builder.Property(book => book.Author).HasMaxLength(200).IsRequired();
        builder.Property(book => book.Publisher).HasMaxLength(200);
        builder.Property(book => book.Description).HasMaxLength(4000);
        builder.Property(book => book.CoverImage).HasMaxLength(1000);
        builder.Property(book => book.ReplacementPrice).HasColumnType("decimal(18,2)");
        builder.HasIndex(book => book.Isbn)
            .IsUnique()
            .HasFilter("[Isbn] IS NOT NULL");
        builder.HasIndex(book => new { book.Title, book.Author });
        builder.HasOne(book => book.Category)
            .WithMany(category => category.Books)
            .HasForeignKey(book => book.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
