using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuanLyThuVien.Application.Features.Auth;
using QuanLyThuVien.Domain.Entities;
using QuanLyThuVien.Infrastructure.Persistence;
using Xunit;

namespace QuanLyThuVien.Tests.Application;

public sealed class RegistrationTests
{
    [Fact]
    public async Task Register_creates_reader_account_and_linked_member()
    {
        await using var provider = CreateProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IAuthService>();

        var result = await service.RegisterAsync(new RegisterRequest(
            "newreader",
            "reader@example.com",
            "StrongPass1",
            "Nguyễn Độc Giả",
            "0901234567",
            "Hà Nội"), CancellationToken.None);

        Assert.True(result.Succeeded);
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var user = await userManager.FindByNameAsync("newreader");
        Assert.NotNull(user);
        Assert.Equal("Reader", (await userManager.GetRolesAsync(user!)).Single());

        var dbContext = scope.ServiceProvider.GetRequiredService<LibraryDbContext>();
        var member = await dbContext.Members.SingleAsync(member => member.Id == user!.MemberId);
        Assert.Equal("Nguyễn Độc Giả", member.FullName);
        Assert.Equal("newreader", user.UserName);
    }

    [Fact]
    public async Task Register_rejects_duplicate_username_or_email()
    {
        await using var provider = CreateProvider();
        using var scope = provider.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IAuthService>();
        var request = new RegisterRequest("duplicate", "duplicate@example.com", "StrongPass1", "Reader", null, null);

        Assert.True((await service.RegisterAsync(request, CancellationToken.None)).Succeeded);
        var duplicate = await service.RegisterAsync(request with { Email = "other@example.com" }, CancellationToken.None);

        Assert.False(duplicate.Succeeded);
        Assert.Contains("đã được sử dụng", duplicate.Error, StringComparison.OrdinalIgnoreCase);
    }

    private static ServiceProvider CreateProvider()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddDbContext<LibraryDbContext>(options => options.UseInMemoryDatabase(Guid.NewGuid().ToString()));
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddEntityFrameworkStores<LibraryDbContext>()
            .AddDefaultTokenProviders();
        services.AddScoped<IAuthService, AuthService>();
        return services.BuildServiceProvider();
    }
}
