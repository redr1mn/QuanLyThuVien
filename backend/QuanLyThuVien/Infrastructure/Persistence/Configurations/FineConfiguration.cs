using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuanLyThuVien.Domain.Entities;

namespace QuanLyThuVien.Infrastructure.Persistence.Configurations;

public sealed class FineConfiguration : IEntityTypeConfiguration<Fine>
{
    public void Configure(EntityTypeBuilder<Fine> builder)
    {
        builder.HasKey(fine => fine.Id);
        builder.Property(fine => fine.Amount).HasColumnType("decimal(18,2)");
        builder.Property(fine => fine.DailyRate).HasColumnType("decimal(18,2)");
        builder.Property(fine => fine.Reason).HasMaxLength(300).IsRequired();
        builder.HasIndex(fine => new { fine.LoanId, fine.PaidAtUtc });
        builder.HasOne(fine => fine.Loan)
            .WithMany(loan => loan.Fines)
            .HasForeignKey(fine => fine.LoanId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(fine => fine.LoanItem)
            .WithMany(item => item.Fines)
            .HasForeignKey(fine => fine.LoanItemId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
