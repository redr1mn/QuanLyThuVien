namespace QuanLyThuVien.Application.Features.Auth;

public sealed record LoginRequest(string Username, string Password, bool RememberMe);

public sealed record RegisterRequest(string Username, string Email, string Password, string FullName, string? Phone, string? Address);

public sealed record RegistrationResult(bool Succeeded, string? CardNumber, string? Error)
{
    public static RegistrationResult Failure(string error) => new(false, null, error);

    public static RegistrationResult Success(string cardNumber) => new(true, cardNumber, null);
}

public sealed record AuthSession(string UserId, string DisplayName, string Role);

public sealed record AuthResult(bool Succeeded, AuthSession? Session, string? Error)
{
    public static AuthResult Invalid(string error) => new(false, null, error);

    public static AuthResult Success(AuthSession session) => new(true, session, null);
}
