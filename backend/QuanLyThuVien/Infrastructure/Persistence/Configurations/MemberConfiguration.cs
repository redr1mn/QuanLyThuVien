using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuanLyThuVien.Domain.Entities;

namespace QuanLyThuVien.Infrastructure.Persistence.Configurations;

public sealed class MemberConfiguration : IEntityTypeConfiguration<Member>
{
    public void Configure(EntityTypeBuilder<Member> builder)
    {
        builder.HasKey(member => member.Id);
        builder.Property(member => member.CardNumber).HasMaxLength(40).IsRequired();
        builder.Property(member => member.FullName).HasMaxLength(200).IsRequired();
        builder.Property(member => member.Email).HasMaxLength(320);
        builder.Property(member => member.Phone).HasMaxLength(30);
        builder.Property(member => member.Address).HasMaxLength(500);
        builder.Property(member => member.MemberType).HasMaxLength(50).IsRequired();
        builder.HasIndex(member => member.CardNumber).IsUnique();
        builder.HasIndex(member => member.Email);
        builder.HasIndex(member => member.Status);
    }
}
