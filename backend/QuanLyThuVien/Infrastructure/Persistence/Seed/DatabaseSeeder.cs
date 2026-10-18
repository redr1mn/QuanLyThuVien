using Microsoft.AspNetCore.Identity;

namespace QuanLyThuVien.Infrastructure.Persistence.Seed;

public static class DatabaseSeeder
{
    public static readonly string[] Roles = ["Reader", "Staff", "Admin"];

    public static async Task SeedRolesAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}
