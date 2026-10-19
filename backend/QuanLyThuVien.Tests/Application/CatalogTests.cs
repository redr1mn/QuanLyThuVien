using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Application.Features.Catalog;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;
using Xunit;

namespace QuanLyThuVien.Tests.Application;

public class CatalogTests
{
    [Fact]
    public async Task List_filters_by_query_category_and_availability_with_pagination()
    {
        await using var context = CreateContext();
        var category = new Category { Name = "Công nghệ", Slug = "cong-nghe" };
        var otherCategory = new Category { Name = "Văn học", Slug = "van-hoc" };
        context.Categories.AddRange(category, otherCategory);
        context.Books.AddRange(
            new Book
            {
                Title = "Lập trình C#",
                Author = "Nguyễn An",
                Category = category,
                Copies = [new BookCopy { Barcode = "CAT-001", ShelfLocation = "A.01", Status = BookCopyStatus.Available }]
            },
            new Book
            {
                Title = "Tác phẩm văn học",
                Author = "Trần Bình",
                Category = otherCategory,
                Copies = [new BookCopy { Barcode = "CAT-002", ShelfLocation = "B.01", Status = BookCopyStatus.OnLoan }]
            });
        await context.SaveChangesAsync();

        var result = await new CatalogService(context).ListAsync(
            new CatalogQuery("c#", category.Id, AvailableOnly: true, Page: 1, PageSize: 1),
            CancellationToken.None);

        Assert.Equal(1, result.TotalCount);
        Assert.Single(result.Items);
        Assert.Equal("Lập trình C#", result.Items[0].Title);
        Assert.Equal(1, result.Items[0].AvailableCopies);
    }

    private static LibraryDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<LibraryDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new LibraryDbContext(options);
    }
}
