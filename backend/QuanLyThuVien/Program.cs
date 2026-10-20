using Microsoft.EntityFrameworkCore;
using QuanLyThuVien.Application.Common;
using QuanLyThuVien.Application.Features.Auth;
using QuanLyThuVien.Application.Features.Admin;
using QuanLyThuVien.Application.Features.Catalog;
using QuanLyThuVien.Application.Features.Members;
using QuanLyThuVien.Application.Features.Circulation;
using QuanLyThuVien.Application.Features.Reservations;
using QuanLyThuVien.Application.Features.Reports;
using QuanLyThuVien.Application.Features.ReaderAccount;
using QuanLyThuVien.Api.Middleware;
using QuanLyThuVien.Infrastructure.Authentication;
using QuanLyThuVien.Infrastructure.Persistence;
using QuanLyThuVien.Infrastructure.Persistence.Seed;
using QuanLyThuVien.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Development.local.json", optional: true, reloadOnChange: false);

builder.Services.AddControllers();
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
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<CatalogService>();
builder.Services.AddScoped<MemberService>();
builder.Services.AddScoped<CirculationService>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddScoped<ReaderAccountService>();
builder.Services.AddSingleton<IClock, SystemClock>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseMiddleware<ApiExceptionMiddleware>();

// Khôi phục ClaimsPrincipal từ cookie trước khi middleware phân quyền đọc User/role.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Configuration.GetValue<bool>("Library:SeedDevelopmentUsers"))
{
    using var scope = app.Services.CreateScope();
    await DatabaseSeeder.SeedDevelopmentUsersAsync(scope.ServiceProvider, app.Configuration);
}


app.Run();

public partial class Program { }
