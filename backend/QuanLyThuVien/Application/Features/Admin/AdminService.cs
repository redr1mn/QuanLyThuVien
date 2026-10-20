using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Domain.Enums;
using QuanLyThuVien.Infrastructure.Persistence;
using QuanLyThuVien.Application.Features.Catalog;

namespace QuanLyThuVien.Application.Features.Admin;

public sealed class AdminService(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    LibraryDbContext dbContext)
{
    private static readonly string[] SupportedRoles = ["Reader", "Staff", "Admin"];

    public async Task<AdminDashboard> DashboardAsync(CancellationToken cancellationToken)
    {
        var totalUsers = await userManager.Users.CountAsync(cancellationToken);
        var activeUsers = await userManager.Users.CountAsync(user => user.IsActive, cancellationToken);
        var readers = await CountRoleAsync("Reader", cancellationToken);
        var staff = await CountRoleAsync("Staff", cancellationToken);
        var admins = await CountRoleAsync("Admin", cancellationToken);
        var books = await dbContext.Books.CountAsync(book => !book.IsDeleted, cancellationToken);
        var activeLoans = await dbContext.Loans.CountAsync(loan => loan.Status == LoanStatus.Open, cancellationToken);
        var overdueLoans = await dbContext.Loans.CountAsync(loan => loan.Status == LoanStatus.Open && loan.DueAtUtc < DateTimeOffset.UtcNow, cancellationToken);

        return new AdminDashboard(totalUsers, activeUsers, readers, staff, admins, books, activeLoans, overdueLoans);
    }

    public async Task<PagedResult<AdminUserListItem>> UsersAsync(AdminUserQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        var usersQuery = userManager.Users.Include(user => user.Member).AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query.Query))
        {
            var term = query.Query.Trim();
            usersQuery = usersQuery.Where(user =>
                (user.UserName != null && user.UserName.Contains(term)) ||
                (user.Email != null && user.Email.Contains(term)) ||
                (user.Member != null && user.Member.FullName.Contains(term)));
        }

        var totalCount = await usersQuery.CountAsync(cancellationToken);
        var users = await usersQuery
            .OrderBy(user => user.UserName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = new List<AdminUserListItem>(users.Count);
        foreach (var user in users)
        {
            var role = (await userManager.GetRolesAsync(user)).FirstOrDefault() ?? "Chưa cấp quyền";
            items.Add(new AdminUserListItem(user.Id, user.UserName ?? user.Email ?? user.Id, user.Email, user.Member?.FullName ?? user.UserName ?? user.Id, role, user.IsActive, user.MemberId));
        }

        return new PagedResult<AdminUserListItem>(items, page, pageSize, totalCount);
    }

    public async Task<AdminOperationResult> SetStatusAsync(string id, bool isActive, string? currentUserId, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null)
            return AdminOperationResult.Failure("Không tìm thấy tài khoản.");
        if (string.Equals(id, currentUserId, StringComparison.Ordinal) && !isActive)
            return AdminOperationResult.Failure("Không thể tự khóa tài khoản Admin đang đăng nhập.");

        user.IsActive = isActive;
        var result = await userManager.UpdateAsync(user);
        return result.Succeeded
            ? AdminOperationResult.Success()
            : AdminOperationResult.Failure(string.Join(" ", result.Errors.Select(error => error.Description)));
    }

    public async Task<AdminOperationResult> SetRoleAsync(string id, string role, string? currentUserId, CancellationToken cancellationToken)
    {
        var normalizedRole = SupportedRoles.FirstOrDefault(candidate => candidate.Equals(role.Trim(), StringComparison.OrdinalIgnoreCase));
        if (normalizedRole is null)
            return AdminOperationResult.Failure("Vai trò không hợp lệ.");

        var user = await userManager.FindByIdAsync(id);
        if (user is null)
            return AdminOperationResult.Failure("Không tìm thấy tài khoản.");
        if (string.Equals(id, currentUserId, StringComparison.Ordinal))
            return AdminOperationResult.Failure("Không thể tự thay đổi vai trò tài khoản đang đăng nhập.");
        if (!await roleManager.RoleExistsAsync(normalizedRole))
            return AdminOperationResult.Failure("Vai trò chưa được cấu hình.");

        var currentRoles = await userManager.GetRolesAsync(user);
        var removeResult = await userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded)
            return AdminOperationResult.Failure(string.Join(" ", removeResult.Errors.Select(error => error.Description)));

        var addResult = await userManager.AddToRoleAsync(user, normalizedRole);
        return addResult.Succeeded
            ? AdminOperationResult.Success()
            : AdminOperationResult.Failure(string.Join(" ", addResult.Errors.Select(error => error.Description)));
    }

    private async Task<int> CountRoleAsync(string role, CancellationToken cancellationToken)
        => (await userManager.GetUsersInRoleAsync(role)).Count(user => user.IsActive);
}
