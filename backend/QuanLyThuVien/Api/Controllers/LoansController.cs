using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.Catalog;
using QuanLyThuVien.Application.Features.Circulation;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Api.Controllers;

[ApiController]
[Route("api/loans")]
[Authorize]
public sealed class LoansController(CirculationService circulationService, LibraryDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<LoanListItem>>>> List([FromQuery] string? status, [FromQuery] int? memberId, [FromQuery] bool overdueOnly, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        if (!User.IsInRole("Staff") && !User.IsInRole("Admin"))
        {
            memberId = await dbContext.Users.Where(user => user.Id == User.FindFirstValue(ClaimTypes.NameIdentifier)).Select(user => user.MemberId).SingleOrDefaultAsync(cancellationToken);
            if (!memberId.HasValue) return Forbid();
        }
        return Ok(ApiEnvelope<PagedResult<LoanListItem>>.Success(await circulationService.ListAsync(memberId, status, overdueOnly, page, pageSize, cancellationToken)));
    }

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<LoanListItem>>> Borrow(BorrowCommand command, CancellationToken cancellationToken) => Ok(ApiEnvelope<LoanListItem>.Success(await circulationService.BorrowAsync(command, cancellationToken)));

    [HttpPost("{id:long}/return")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<LoanListItem>>> Return(long id, ReturnCommand command, CancellationToken cancellationToken) => Ok(ApiEnvelope<LoanListItem>.Success(await circulationService.ReturnAsync(id, command, cancellationToken)));

    [HttpPost("{id:long}/renew")]
    public async Task<ActionResult<ApiEnvelope<LoanListItem>>> Renew(long id, CancellationToken cancellationToken)
    {
        var isStaff = User.IsInRole("Staff") || User.IsInRole("Admin");
        var memberId = isStaff ? null : await dbContext.Users.Where(user => user.Id == User.FindFirstValue(ClaimTypes.NameIdentifier)).Select(user => user.MemberId).SingleOrDefaultAsync(cancellationToken);
        if (!isStaff && !memberId.HasValue) return Forbid();
        return Ok(ApiEnvelope<LoanListItem>.Success(await circulationService.RenewAsync(id, memberId, isStaff, cancellationToken)));
    }
}
