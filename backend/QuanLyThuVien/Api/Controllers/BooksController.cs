using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.Catalog;

namespace QuanLyThuVien.Api.Controllers;

[ApiController]
[Route("api/books")]
public sealed class BooksController(CatalogService catalogService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiEnvelope<PagedResult<BookListItem>>>> List(
        [FromQuery] CatalogQuery query,
        CancellationToken cancellationToken) => Ok(ApiEnvelope<PagedResult<BookListItem>>.Success(
            await catalogService.ListAsync(query, cancellationToken)));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiEnvelope<BookDetails>>> Get(int id, CancellationToken cancellationToken) =>
        Ok(ApiEnvelope<BookDetails>.Success(await catalogService.GetAsync(id, cancellationToken)));

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<BookDetails>>> Create(
        CreateBookRequest request,
        CancellationToken cancellationToken) =>
        Ok(ApiEnvelope<BookDetails>.Success(await catalogService.CreateAsync(request, cancellationToken)));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<BookDetails>>> Update(
        int id,
        UpdateBookRequest request,
        CancellationToken cancellationToken) =>
        Ok(ApiEnvelope<BookDetails>.Success(await catalogService.UpdateAsync(id, request, cancellationToken)));

    [HttpPost("{id:int}/copies")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<BookCopyItem>>> AddCopy(
        int id,
        AddBookCopyRequest request,
        CancellationToken cancellationToken) =>
        Ok(ApiEnvelope<BookCopyItem>.Success(await catalogService.AddCopyAsync(id, request, cancellationToken)));
}
