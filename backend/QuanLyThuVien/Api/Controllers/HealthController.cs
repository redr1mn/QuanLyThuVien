using Microsoft.AspNetCore.Mvc;

namespace QuanLyThuVien.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        data = new { status = "ok" },
        errors = Array.Empty<object>()
    });
}
