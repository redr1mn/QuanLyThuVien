namespace QuanLyThuVien.Application.Features.Auth;

public interface IAuthService
{
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task LogoutAsync();
}
