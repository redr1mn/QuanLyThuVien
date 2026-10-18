using Microsoft.AspNetCore.Identity;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Infrastructure.Persistence;

namespace QuanLyThuVien.Infrastructure.Authentication;

public static class IdentitySetup
{
    public static IServiceCollection AddLibraryIdentity(this IServiceCollection services)
    {
        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Lockout.MaxFailedAccessAttempts = 5;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<LibraryDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        return services;
    }
}
