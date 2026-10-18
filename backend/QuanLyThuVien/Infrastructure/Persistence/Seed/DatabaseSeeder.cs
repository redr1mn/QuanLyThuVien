using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Domain.Entities;

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

    public static async Task SeedDevelopmentUsersAsync(IServiceProvider services, IConfiguration configuration)
    {
        if (!configuration.GetValue<bool>("Library:SeedDevelopmentUsers"))
            return;

        var password = configuration["Library:DevelopmentSeedPassword"];
        if (string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException("Library:DevelopmentSeedPassword is required when development seeding is enabled.");

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var dbContext = services.GetRequiredService<QuanLyThuVien.Infrastructure.Persistence.LibraryDbContext>();
        await SeedRolesAsync(services);

        var users = new[]
        {
            (Username: "reader", Email: "reader@library.local", Role: "Reader", Name: "Độc giả thử nghiệm", Card: "SEED-READER"),
            (Username: "staff", Email: "staff@library.local", Role: "Staff", Name: "Thủ thư thử nghiệm", Card: "SEED-STAFF"),
            (Username: "admin", Email: "admin@library.local", Role: "Admin", Name: "Quản trị thử nghiệm", Card: "SEED-ADMIN")
        };

        foreach (var seed in users)
        {
            var user = await userManager.FindByNameAsync(seed.Username);
            if (user is null)
            {
                user = new ApplicationUser
                {
                    UserName = seed.Username,
                    Email = seed.Email,
                    EmailConfirmed = true,
                    IsActive = true
                };
                var createResult = await userManager.CreateAsync(user, password);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join(", ", createResult.Errors.Select(error => error.Description));
                    throw new InvalidOperationException($"Could not seed {seed.Username}: {errors}");
                }
            }

            if (!await userManager.IsInRoleAsync(user, seed.Role))
                await userManager.AddToRoleAsync(user, seed.Role);

            if (user.MemberId is null)
            {
                var member = await dbContext.Members.SingleOrDefaultAsync(candidate => candidate.CardNumber == seed.Card);
                if (member is null)
                {
                    member = new Member
                    {
                        CardNumber = seed.Card,
                        FullName = seed.Name,
                        Email = seed.Email,
                        MemberType = seed.Role,
                        IssuedAtUtc = DateTimeOffset.UtcNow,
                        ExpiresAtUtc = DateTimeOffset.UtcNow.AddYears(1)
                    };
                    dbContext.Members.Add(member);
                    await dbContext.SaveChangesAsync();
                }

                user.MemberId = member.Id;
                await userManager.UpdateAsync(user);
            }
        }
    }
}
