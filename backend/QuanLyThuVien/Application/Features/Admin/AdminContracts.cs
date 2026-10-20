using QuanLyThuVien.Application.Features.Catalog;

namespace QuanLyThuVien.Application.Features.Admin;

public sealed record AdminDashboard(
    int TotalUsers,
    int ActiveUsers,
    int Readers,
    int Staff,
    int Admins,
    int Books,
    int ActiveLoans,
    int OverdueLoans);

public sealed record AdminUserQuery(string? Query = null, int Page = 1, int PageSize = 20);

public sealed record AdminUserListItem(
    string Id,
    string UserName,
    string? Email,
    string DisplayName,
    string Role,
    bool IsActive,
    int? MemberId);

public sealed record AdminUserStatusRequest(bool IsActive);

public sealed record AdminUserRoleRequest(string Role);

public sealed record AdminOperationResult(bool Succeeded, string? Error = null)
{
    public static AdminOperationResult Success() => new(true);
    public static AdminOperationResult Failure(string error) => new(false, error);
}
