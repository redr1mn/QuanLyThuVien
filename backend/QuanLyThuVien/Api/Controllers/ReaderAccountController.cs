using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.ReaderAccount;

namespace QuanLyThuVien.Api.Controllers;

[ApiController]
[Route("api/reader/account")]
[Authorize(Roles = "Reader")]
public sealed class ReaderAccountController(ReaderAccountService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<ReaderAccountView>>> Get(CancellationToken cancellationToken) => Ok(ApiEnvelope<ReaderAccountView>.Success(await service.GetAsync(User.FindFirstValue(ClaimTypes.NameIdentifier)!, cancellationToken)));
}
