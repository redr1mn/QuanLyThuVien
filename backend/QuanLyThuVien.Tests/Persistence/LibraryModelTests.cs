using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Infrastructure.Persistence;
using Xunit;

namespace QuanLyThuVien.Tests.Persistence;

public class LibraryModelTests
{
    private static LibraryDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<LibraryDbContext>()
            .UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=QuanLyThuVien_ModelTests;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;

        return new LibraryDbContext(options);
    }

    [Fact]
    public void Library_model_has_unique_catalog_identifiers()
    {
        using var context = CreateContext();

        var isbnIndex = context.Model.FindEntityType(typeof(Book))!
            .GetIndexes()
            .Single(index => index.Properties.Count == 1 && index.Properties[0].Name == nameof(Book.Isbn));
        var barcodeIndex = context.Model.FindEntityType(typeof(BookCopy))!
            .GetIndexes()
            .Single(index => index.Properties.Count == 1 && index.Properties[0].Name == nameof(BookCopy.Barcode));
        var cardIndex = context.Model.FindEntityType(typeof(Member))!
            .GetIndexes()
            .Single(index => index.Properties.Count == 1 && index.Properties[0].Name == nameof(Member.CardNumber));

        Assert.True(isbnIndex.IsUnique);
        Assert.True(barcodeIndex.IsUnique);
        Assert.True(cardIndex.IsUnique);
    }

    [Fact]
    public void Library_model_preserves_loan_copy_relationships_and_fine_precision()
    {
        using var context = CreateContext();

        var loanItem = context.Model.FindEntityType(typeof(LoanItem))!;
        Assert.Contains(loanItem.GetForeignKeys(), foreignKey => foreignKey.PrincipalEntityType.ClrType == typeof(Loan));
        Assert.Contains(loanItem.GetForeignKeys(), foreignKey => foreignKey.PrincipalEntityType.ClrType == typeof(BookCopy));

        var amount = context.Model.FindEntityType(typeof(Fine))!.FindProperty(nameof(Fine.Amount))!;
        Assert.Equal("decimal(18,2)", amount.GetColumnType());
    }
}
