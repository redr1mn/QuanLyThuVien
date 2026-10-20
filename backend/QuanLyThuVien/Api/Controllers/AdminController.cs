using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.Admin;
using QuanLyThuVien.Application.Features.Catalog;

namespace QuanLyThuVien.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminController(AdminService adminService) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiEnvelope<AdminDashboard>>> Dashboard(CancellationToken cancellationToken)
        => Ok(ApiEnvelope<AdminDashboard>.Success(await adminService.DashboardAsync(cancellationToken)));

    [HttpGet("users")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<AdminUserListItem>>>> Users([FromQuery] AdminUserQuery query, CancellationToken cancellationToken)
        => Ok(ApiEnvelope<PagedResult<AdminUserListItem>>.Success(await adminService.UsersAsync(query, cancellationToken)));

    [HttpPatch("users/{id}/status")]
    public async Task<ActionResult<ApiEnvelope<object?>>> SetStatus(string id, AdminUserStatusRequest request, CancellationToken cancellationToken)
        => await ExecuteMutationAsync(() => adminService.SetStatusAsync(id, request.IsActive, User.FindFirstValue(ClaimTypes.NameIdentifier), cancellationToken));

    [HttpPatch("users/{id}/role")]
    public async Task<ActionResult<ApiEnvelope<object?>>> SetRole(string id, AdminUserRoleRequest request, CancellationToken cancellationToken)
        => await ExecuteMutationAsync(() => adminService.SetRoleAsync(id, request.Role, User.FindFirstValue(ClaimTypes.NameIdentifier), cancellationToken));

    private async Task<ActionResult<ApiEnvelope<object?>>> ExecuteMutationAsync(Func<Task<AdminOperationResult>> operation)
    {
        var result = await operation();
        if (result.Succeeded)
            return Ok(ApiEnvelope<object?>.Success(null));
        if (result.Error == "Không tìm thấy tài khoản.")
            return NotFound(ApiEnvelope<object?>.Failure(new ApiError("not_found", result.Error)));
        return BadRequest(ApiEnvelope<object?>.Failure(new ApiError("invalid_operation", result.Error!)));
    }
}
