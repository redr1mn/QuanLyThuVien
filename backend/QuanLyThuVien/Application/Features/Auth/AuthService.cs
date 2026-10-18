using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Application.Features.Auth;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    LibraryDbContext dbContext) : IAuthService
{
    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var identifier = request.Username.Trim();
        var normalizedIdentifier = identifier.ToUpperInvariant();
        var user = await dbContext.Users
            .Include(candidate => candidate.Member)
            .SingleOrDefaultAsync(candidate =>
                candidate.NormalizedUserName == normalizedIdentifier
                || candidate.NormalizedEmail == normalizedIdentifier,
                cancellationToken);

        if (user is null || !user.IsActive)
            return AuthResult.Invalid("Tên đăng nhập hoặc mật khẩu không đúng.");

        var passwordResult = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!passwordResult.Succeeded)
            return AuthResult.Invalid("Tên đăng nhập hoặc mật khẩu không đúng.");

        await signInManager.SignInAsync(user, new AuthenticationProperties
        {
            IsPersistent = request.RememberMe,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(request.RememberMe ? 24 * 7 : 8)
        });

        var roles = await userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Reader";
        var displayName = user.Member?.FullName ?? user.UserName ?? user.Email ?? user.Id;
        return AuthResult.Success(new AuthSession(user.Id, displayName, role));
    }

    public Task LogoutAsync() => signInManager.SignOutAsync();

    public static AuthSession? GetSession(ClaimsPrincipal principal)
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var displayName = principal.FindFirstValue(ClaimTypes.Name);
        var role = principal.FindFirstValue(ClaimTypes.Role);

        return userId is null || displayName is null || role is null
            ? null
            : new AuthSession(userId, displayName, role);
    }
}
