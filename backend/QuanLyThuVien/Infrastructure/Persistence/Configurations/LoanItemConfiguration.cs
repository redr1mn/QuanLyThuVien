using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuanLyThuVien.Domain.Entities;

namespace QuanLyThuVien.Infrastructure.Persistence.Configurations;

public sealed class LoanItemConfiguration : IEntityTypeConfiguration<LoanItem>
{
    public void Configure(EntityTypeBuilder<LoanItem> builder)
    {
        builder.HasKey(item => item.Id);
        builder.Property(item => item.ReturnCondition).HasMaxLength(80);
        builder.HasIndex(item => new { item.LoanId, item.BookCopyId }).IsUnique();
        builder.HasOne(item => item.Loan)
            .WithMany(loan => loan.Items)
            .HasForeignKey(item => item.LoanId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(item => item.BookCopy)
            .WithMany(copy => copy.LoanItems)
            .HasForeignKey(item => item.BookCopyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
