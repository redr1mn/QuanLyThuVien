using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
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

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
