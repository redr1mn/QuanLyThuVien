using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Application.Features.Auth;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    RoleManager<IdentityRole> roleManager,
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
        var role = roles.FirstOrDefault();
        if (role is null)
            return AuthResult.Invalid("Tài khoản chưa được cấp vai trò.");
        var displayName = user.Member?.FullName ?? user.UserName ?? user.Email ?? user.Id;
        return AuthResult.Success(new AuthSession(user.Id, displayName, role));
    }

    public async Task<RegistrationResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var username = request.Username.Trim();
        var email = request.Email.Trim();
        var fullName = request.FullName.Trim();

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(fullName))
            return RegistrationResult.Failure("Vui lòng nhập đầy đủ tên đăng nhập, email và họ tên.");

        if (await userManager.FindByNameAsync(username) is not null || await userManager.FindByEmailAsync(email) is not null)
            return RegistrationResult.Failure("Tên đăng nhập hoặc email đã được sử dụng.");

        IDbContextTransaction? transaction = null;
        if (dbContext.Database.IsRelational())
            transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var member = new Member
        {
            CardNumber = await GenerateCardNumberAsync(cancellationToken),
            FullName = fullName,
            Email = email,
            Phone = NormalizeOptional(request.Phone),
            Address = NormalizeOptional(request.Address),
            MemberType = "Reader",
            IssuedAtUtc = DateTimeOffset.UtcNow,
            ExpiresAtUtc = DateTimeOffset.UtcNow.AddYears(1),
            MaxBooks = 5
        };

        ApplicationUser? createdUser = null;
        try
        {
            dbContext.Members.Add(member);
            await dbContext.SaveChangesAsync(cancellationToken);

            var user = new ApplicationUser
            {
                UserName = username,
                Email = email,
                MemberId = member.Id,
                IsActive = true
            };
            var createResult = await userManager.CreateAsync(user, request.Password);
            if (!createResult.Succeeded)
            {
                await RollbackAsync(transaction, member, null, cancellationToken);
                return RegistrationResult.Failure(string.Join(" ", createResult.Errors.Select(error => error.Description)));
            }
            createdUser = user;

            if (!await roleManager.RoleExistsAsync("Reader"))
            {
                var roleCreateResult = await roleManager.CreateAsync(new IdentityRole("Reader"));
                if (!roleCreateResult.Succeeded)
                {
                    await RollbackAsync(transaction, member, createdUser, cancellationToken);
                    return RegistrationResult.Failure("Không thể tạo vai trò độc giả.");
                }
            }

            var roleResult = await userManager.AddToRoleAsync(user, "Reader");
            if (!roleResult.Succeeded)
            {
                await RollbackAsync(transaction, member, createdUser, cancellationToken);
                return RegistrationResult.Failure("Không thể cấp quyền độc giả cho tài khoản.");
            }

            if (transaction is not null)
                await transaction.CommitAsync(cancellationToken);

            return RegistrationResult.Success(member.CardNumber);
        }
        catch
        {
            await RollbackAsync(transaction, member, createdUser, cancellationToken);
            throw;
        }
        finally
        {
            if (transaction is not null)
                await transaction.DisposeAsync();
        }
    }

    public Task LogoutAsync() => signInManager.SignOutAsync();

    private async Task<string> GenerateCardNumberAsync(CancellationToken cancellationToken)
    {
        string cardNumber;
        do
        {
            cardNumber = $"LIB-{Guid.NewGuid():N}";
        }
        while (await dbContext.Members.AnyAsync(member => member.CardNumber == cardNumber, cancellationToken));

        return cardNumber;
    }

    private async Task RollbackAsync(IDbContextTransaction? transaction, Member member, ApplicationUser? user, CancellationToken cancellationToken)
    {
        if (transaction is not null)
        {
            await transaction.RollbackAsync(cancellationToken);
            return;
        }

        if (user?.Id is not null)
            await userManager.DeleteAsync(user);
        dbContext.Members.Remove(member);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

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
