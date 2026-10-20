using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.Auth;

namespace QuanLyThuVien.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpGet("me")]
    [Authorize]
    public ActionResult<ApiEnvelope<AuthSession>> Me()
    {
        var session = AuthService.GetSession(User);
        return session is null
            ? Unauthorized(ApiEnvelope<AuthSession>.Failure(new ApiError("session_invalid", "Phiên đăng nhập không hợp lệ.")))
            : Ok(ApiEnvelope<AuthSession>.Success(session));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiEnvelope<AuthSession>>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        return result.Succeeded
            ? Ok(ApiEnvelope<AuthSession>.Success(result.Session!))
            : Unauthorized(ApiEnvelope<AuthSession>.Failure(new ApiError("invalid_credentials", result.Error!)));
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiEnvelope<object>>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);
        return result.Succeeded
            ? StatusCode(StatusCodes.Status201Created, ApiEnvelope<object>.Success(new { cardNumber = result.CardNumber }))
            : Conflict(ApiEnvelope<object>.Failure(new ApiError("registration_failed", result.Error!)));
    }

    [HttpPost("logout")]
    public async Task<ActionResult<ApiEnvelope<object>>> Logout()
    {
        await authService.LogoutAsync();
        return Ok(ApiEnvelope<object>.Success(new { loggedOut = true }));
    }
}
