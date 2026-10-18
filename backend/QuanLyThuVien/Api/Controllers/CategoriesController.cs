using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.Catalog;

namespace QuanLyThuVien.Api.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController(CatalogService catalogService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<CategoryListItem>>>> List(CancellationToken cancellationToken) =>
        Ok(ApiEnvelope<IReadOnlyList<CategoryListItem>>.Success(await catalogService.CategoriesAsync(cancellationToken)));

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<CategoryListItem>>> Create(
        CreateCategoryRequest request,
        CancellationToken cancellationToken) =>
        Ok(ApiEnvelope<CategoryListItem>.Success(await catalogService.CreateCategoryAsync(request, cancellationToken)));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<CategoryListItem>>> Update(
        int id,
        CreateCategoryRequest request,
        CancellationToken cancellationToken) =>
        Ok(ApiEnvelope<CategoryListItem>.Success(await catalogService.UpdateCategoryAsync(id, request, cancellationToken)));
}
