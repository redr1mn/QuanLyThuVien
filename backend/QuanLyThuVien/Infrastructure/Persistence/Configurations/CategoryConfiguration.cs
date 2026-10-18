using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuanLyThuVien.Domain.Entities;

namespace QuanLyThuVien.Infrastructure.Persistence.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(category => category.Id);
        builder.Property(category => category.Name).HasMaxLength(120).IsRequired();
        builder.Property(category => category.Slug).HasMaxLength(140).IsRequired();
        builder.HasIndex(category => category.Name).IsUnique();
        builder.HasIndex(category => category.Slug).IsUnique();
    }
}
