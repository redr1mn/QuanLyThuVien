using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.Reports;
namespace QuanLyThuVien.Api.Controllers;
[ApiController, Route("api/reports"), Authorize(Roles = "Staff,Admin")]
public sealed class ReportsController(ReportService service) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<ActionResult<ApiEnvelope<ReportOverview>>> Overview([FromQuery] DateTimeOffset from, [FromQuery] DateTimeOffset to, CancellationToken cancellationToken) => Ok(ApiEnvelope<ReportOverview>.Success(await service.OverviewAsync(from, to, cancellationToken)));
}
