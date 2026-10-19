namespace QuanLyThuVien.Application.Features.Catalog;

public sealed record CatalogQuery(
    string? Query = null,
    int? CategoryId = null,
    bool AvailableOnly = false,
    int Page = 1,
    int PageSize = 20);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public sealed record CategoryListItem(int Id, string Name, string Slug);

public sealed record BookListItem(
    int Id,
    string? Isbn,
    string Title,
    string Author,
    string? Publisher,
    int? PublishYear,
    int CategoryId,
    string CategoryName,
    decimal ReplacementPrice,
    string? CoverImage,
    int AvailableCopies,
    int TotalCopies);

public sealed record BookDetails(
    int Id,
    string? Isbn,
    string Title,
    string Author,
    string? Publisher,
    int? PublishYear,
    string? Description,
    decimal ReplacementPrice,
    int CategoryId,
    string CategoryName,
    IReadOnlyList<BookCopyItem> Copies);

public sealed record BookCopyItem(int Id, string Barcode, string ShelfLocation, string Status);

public sealed record CreateBookRequest(
    string Title,
    string Author,
    int CategoryId,
    string? Isbn = null,
    string? Publisher = null,
    int? PublishYear = null,
    string? Description = null,
    decimal ReplacementPrice = 0,
    string? CoverImage = null);

public sealed record UpdateBookRequest(
    string Title,
    string Author,
    int CategoryId,
    string? Isbn = null,
    string? Publisher = null,
    int? PublishYear = null,
    string? Description = null,
    decimal ReplacementPrice = 0,
    string? CoverImage = null);

public sealed record CreateCategoryRequest(string Name, string Slug);

public sealed record AddBookCopyRequest(string Barcode, string ShelfLocation);
