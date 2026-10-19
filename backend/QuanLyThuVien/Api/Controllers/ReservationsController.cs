using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.Reservations;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Api.Controllers;
[ApiController, Route("api/reservations"), Authorize]
public sealed class ReservationsController(ReservationService service, LibraryDbContext dbContext) : ControllerBase
{
    [HttpPost, Authorize(Roles = "Reader,Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<ReservationItem>>> Create(CreateReservationRequest request, CancellationToken cancellationToken)
    {
        if (User.IsInRole("Reader"))
        {
            var linkedMemberId = await dbContext.Users.Where(user => user.Id == User.FindFirstValue(ClaimTypes.NameIdentifier)).Select(user => user.MemberId).SingleOrDefaultAsync(cancellationToken);
            if (!linkedMemberId.HasValue || linkedMemberId.Value != request.MemberId) return Forbid();
        }
        return Ok(ApiEnvelope<ReservationItem>.Success(await service.CreateAsync(request, cancellationToken)));
    }
    [HttpDelete("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<object>>> Cancel(long id, CancellationToken cancellationToken) { var memberId = await dbContext.Users.Where(user => user.Id == User.FindFirstValue(ClaimTypes.NameIdentifier)).Select(user => user.MemberId).SingleOrDefaultAsync(cancellationToken); await service.CancelAsync(id, memberId, User.IsInRole("Staff") || User.IsInRole("Admin"), cancellationToken); return Ok(ApiEnvelope<object>.Success(new { cancelled = true })); }
}
