using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuanLyThuVien.Domain.Entities;

namespace QuanLyThuVien.Infrastructure.Persistence.Configurations;

public sealed class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> builder)
    {
        builder.HasKey(loan => loan.Id);
        builder.HasIndex(loan => new { loan.MemberId, loan.Status });
        builder.HasIndex(loan => loan.DueAtUtc);
        builder.HasOne(loan => loan.Member)
            .WithMany(member => member.Loans)
            .HasForeignKey(loan => loan.MemberId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(loan => loan.ProcessedByUser)
            .WithMany()
            .HasForeignKey(loan => loan.ProcessedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
