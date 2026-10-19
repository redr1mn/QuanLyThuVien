using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Application.Features.Catalog;

public sealed class CatalogService(LibraryDbContext dbContext)
{
    public async Task<PagedResult<BookListItem>> ListAsync(CatalogQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        var books = dbContext.Books.AsNoTracking().Where(book => !book.IsDeleted);

        if (!string.IsNullOrWhiteSpace(query.Query))
        {
            var search = query.Query.Trim().ToLower();
            books = books.Where(book => book.Title.ToLower().Contains(search)
                || book.Author.ToLower().Contains(search)
                || (book.Isbn != null && book.Isbn.ToLower().Contains(search)));
        }

        if (query.CategoryId is not null)
            books = books.Where(book => book.CategoryId == query.CategoryId.Value);

        if (query.AvailableOnly)
            books = books.Where(book => book.Copies.Any(copy => copy.Status == BookCopyStatus.Available));

        var totalCount = await books.CountAsync(cancellationToken);
        var items = await books
            .OrderBy(book => book.Title)
            .ThenBy(book => book.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(book => new BookListItem(
                book.Id,
                book.Isbn,
                book.Title,
                book.Author,
                book.Publisher,
                book.PublishYear,
                book.CategoryId,
                book.Category.Name,
                book.ReplacementPrice,
                book.CoverImage,
                book.Copies.Count(copy => copy.Status == BookCopyStatus.Available),
                book.Copies.Count()))
            .ToListAsync(cancellationToken);

        return new PagedResult<BookListItem>(items, page, pageSize, totalCount);
    }

    public async Task<BookDetails> GetAsync(int id, CancellationToken cancellationToken)
    {
        var book = await dbContext.Books.AsNoTracking()
            .Include(candidate => candidate.Category)
            .Include(candidate => candidate.Copies)
            .SingleOrDefaultAsync(candidate => candidate.Id == id && !candidate.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy sách.");

        return ToDetails(book);
    }

    public async Task<BookDetails> CreateAsync(CreateBookRequest request, CancellationToken cancellationToken)
    {
        ValidateBook(request.Title, request.Author, request.ReplacementPrice);
        await EnsureCategoryExistsAsync(request.CategoryId, cancellationToken);
        await EnsureIsbnAvailableAsync(request.Isbn, null, cancellationToken);

        var book = new Book
        {
            Isbn = Normalize(request.Isbn),
            Title = request.Title.Trim(),
            Author = request.Author.Trim(),
            Publisher = Normalize(request.Publisher),
            PublishYear = request.PublishYear,
            Description = Normalize(request.Description),
            ReplacementPrice = request.ReplacementPrice,
            CategoryId = request.CategoryId,
            CoverImage = Normalize(request.CoverImage)
        };
        dbContext.Books.Add(book);
        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetAsync(book.Id, cancellationToken);
    }

    public async Task<BookDetails> UpdateAsync(int id, UpdateBookRequest request, CancellationToken cancellationToken)
    {
        ValidateBook(request.Title, request.Author, request.ReplacementPrice);
        await EnsureCategoryExistsAsync(request.CategoryId, cancellationToken);
        await EnsureIsbnAvailableAsync(request.Isbn, id, cancellationToken);

        var book = await dbContext.Books.Include(candidate => candidate.Category).Include(candidate => candidate.Copies)
            .SingleOrDefaultAsync(candidate => candidate.Id == id && !candidate.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy sách.");

        book.Isbn = Normalize(request.Isbn);
        book.Title = request.Title.Trim();
        book.Author = request.Author.Trim();
        book.Publisher = Normalize(request.Publisher);
        book.PublishYear = request.PublishYear;
        book.Description = Normalize(request.Description);
        book.ReplacementPrice = request.ReplacementPrice;
        book.CategoryId = request.CategoryId;
        book.CoverImage = Normalize(request.CoverImage);
        book.UpdatedAtUtc = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetAsync(book.Id, cancellationToken);
    }

    public async Task<BookCopyItem> AddCopyAsync(int bookId, AddBookCopyRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Barcode) || string.IsNullOrWhiteSpace(request.ShelfLocation))
            throw new ValidationException("Mã barcode và vị trí kệ là bắt buộc.");
        if (!await dbContext.Books.AnyAsync(book => book.Id == bookId && !book.IsDeleted, cancellationToken))
            throw new KeyNotFoundException("Không tìm thấy sách.");
        if (await dbContext.BookCopies.AnyAsync(copy => copy.Barcode == request.Barcode.Trim(), cancellationToken))
            throw new ValidationException("Barcode đã tồn tại.");

        var copy = new BookCopy
        {
            BookId = bookId,
            Barcode = request.Barcode.Trim(),
            ShelfLocation = request.ShelfLocation.Trim()
        };
        dbContext.BookCopies.Add(copy);
        await dbContext.SaveChangesAsync(cancellationToken);
        return new BookCopyItem(copy.Id, copy.Barcode, copy.ShelfLocation, copy.Status.ToString());
    }

    public async Task<IReadOnlyList<CategoryListItem>> CategoriesAsync(CancellationToken cancellationToken) =>
        await dbContext.Categories.AsNoTracking()
            .Where(category => category.IsActive)
            .OrderBy(category => category.Name)
            .Select(category => new CategoryListItem(category.Id, category.Name, category.Slug))
            .ToListAsync(cancellationToken);

    public async Task<CategoryListItem> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Slug))
            throw new ValidationException("Tên và slug thể loại là bắt buộc.");
        var category = new Category { Name = request.Name.Trim(), Slug = request.Slug.Trim().ToLowerInvariant() };
        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);
        return new CategoryListItem(category.Id, category.Name, category.Slug);
    }

    public async Task<CategoryListItem> UpdateCategoryAsync(int id, CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Slug))
            throw new ValidationException("Tên và slug thể loại là bắt buộc.");
        var category = await dbContext.Categories.SingleOrDefaultAsync(candidate => candidate.Id == id && candidate.IsActive, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy thể loại.");
        category.Name = request.Name.Trim();
        category.Slug = request.Slug.Trim().ToLowerInvariant();
        await dbContext.SaveChangesAsync(cancellationToken);
        return new CategoryListItem(category.Id, category.Name, category.Slug);
    }

    private async Task EnsureCategoryExistsAsync(int categoryId, CancellationToken cancellationToken)
    {
        if (!await dbContext.Categories.AnyAsync(category => category.Id == categoryId && category.IsActive, cancellationToken))
            throw new ValidationException("Thể loại không tồn tại hoặc đã bị khóa.");
    }

    private async Task EnsureIsbnAvailableAsync(string? isbn, int? currentBookId, CancellationToken cancellationToken)
    {
        var normalized = Normalize(isbn);
        if (normalized is not null && await dbContext.Books.AnyAsync(book => book.Isbn == normalized && book.Id != currentBookId && !book.IsDeleted, cancellationToken))
            throw new ValidationException("ISBN đã tồn tại.");
    }

    private static void ValidateBook(string title, string author, decimal replacementPrice)
    {
        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(author))
            throw new ValidationException("Tên sách và tác giả là bắt buộc.");
        if (replacementPrice < 0)
            throw new ValidationException("Giá thay thế không được âm.");
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static BookDetails ToDetails(Book book) => new(
        book.Id,
        book.Isbn,
        book.Title,
        book.Author,
        book.Publisher,
        book.PublishYear,
        book.Description,
        book.ReplacementPrice,
        book.CategoryId,
        book.Category.Name,
        book.Copies.OrderBy(copy => copy.Barcode)
            .Select(copy => new BookCopyItem(copy.Id, copy.Barcode, copy.ShelfLocation, copy.Status.ToString()))
            .ToList());
}
