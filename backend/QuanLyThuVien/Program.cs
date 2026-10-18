using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Application.Common;
using QuanLyThuVien.Infrastructure.Authentication;
using QuanLyThuVien.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.Configure<LibraryOptions>(builder.Configuration.GetSection(LibraryOptions.SectionName));
builder.Services.AddDbContext<LibraryDbContext>((serviceProvider, options) =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var connectionName = configuration
        .GetSection(LibraryOptions.SectionName)
        .GetValue<string>(nameof(LibraryOptions.ConnectionStringName)) ?? "LibraryDb";
    var connectionString = configuration.GetConnectionString(connectionName);

    if (!string.IsNullOrWhiteSpace(connectionString))
        options.UseSqlServer(connectionString);
});
builder.Services.AddLibraryIdentity();
builder.Services.AddHealthChecks().AddDbContextCheck<LibraryDbContext>("sql-server");
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.Cookie.Name = "QuanLyThuVien.Session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.Events.OnValidatePrincipal = async context =>
        {
            // Cookie demo có thể còn sau khi đổi môi trường; phải từ chối ở server dù form demo đã bị ẩn.
            if (!builder.Environment.IsDevelopment()
                && context.Principal?.HasClaim("authentication_source", "demo") == true)
            {
                context.RejectPrincipal();
                await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            }
        };
    });

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // Chỉ bật HSTS ngoài Development để không buộc trình duyệt ghi nhớ HTTPS cho các cổng thử cục bộ.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

// Khôi phục ClaimsPrincipal từ cookie trước khi middleware phân quyền và Razor đọc User/role.
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();
app.MapControllers();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();

public partial class Program { }
