using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using QuanLyThuVien.Models;

namespace QuanLyThuVien.Controllers;

public class AccountController(IWebHostEnvironment environment) : Controller
{
    [HttpGet]
    public IActionResult Login(string? returnUrl = null) => View(new LoginViewModel
    {
        ReturnUrl = Url.IsLocalUrl(returnUrl) ? returnUrl : null
    });

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        // TODO: Thay bằng dịch vụ xác thực tài khoản thật khi kết nối cơ sở dữ liệu.
        if (!environment.IsDevelopment())
        {
            ModelState.AddModelError("", "Đăng nhập chưa được kết nối với hệ thống tài khoản. Liên hệ thủ thư để được hỗ trợ.");
            return View(model);
        }

        if (!ModelState.IsValid)
            return View(model);

        // Chuẩn hóa username demo; không trim/đổi chữ hoa thường của mật khẩu vì đó là dữ liệu xác thực.
        var account = model.Username.Trim().ToLowerInvariant() switch
        {
            "reader" => (Name: "Nguyễn Minh Anh", Role: "Reader"),
            "staff" => (Name: "Trần Thu Hà", Role: "Staff"),
            "admin" => (Name: "Lê Hoàng Nam", Role: "Admin"),
            _ => (Name: "", Role: "")
        };

        if (account.Name.Length == 0 || model.Password != "ThuVien@123")
        {
            ModelState.AddModelError("", "Tên đăng nhập hoặc mật khẩu không đúng. Kiểm tra lại rồi thử đăng nhập.");
            return View(model);
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, model.Username.Trim().ToLowerInvariant()),
            new Claim(ClaimTypes.Name, account.Name),
            new Claim(ClaimTypes.Role, account.Role),
            new Claim("authentication_source", "demo")
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        // IsPersistent quyết định cookie có sống qua lần đóng trình duyệt; ExpiresUtc giới hạn hiệu lực ticket.
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity), new AuthenticationProperties
            {
                IsPersistent = model.RememberMe,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(model.RememberMe ? 24 * 7 : 8)
            });

        TempData["AccountStatus"] = $"Đã đăng nhập với tên {account.Name}.";
        // Không dùng Redirect trực tiếp với dữ liệu form để tránh chuyển người dùng sang website bên ngoài.
        return Url.IsLocalUrl(model.ReturnUrl)
            ? LocalRedirect(model.ReturnUrl!)
            : RedirectToAction("Index", "Home");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        TempData["AccountStatus"] = "Đã đăng xuất.";
        return RedirectToAction("Login");
    }
}
