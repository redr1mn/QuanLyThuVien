using Microsoft.AspNetCore.Mvc;
using QuanLyThuVien.Application.Features.Auth;
using QuanLyThuVien.Models;

namespace QuanLyThuVien.Controllers;

public class AccountController(IAuthService authService) : Controller
{
    [HttpGet]
    public IActionResult Login(string? returnUrl = null) => View(new LoginViewModel
    {
        ReturnUrl = Url.IsLocalUrl(returnUrl) ? returnUrl : null
    });

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return View(model);

        var result = await authService.LoginAsync(
            new LoginRequest(model.Username.Trim(), model.Password, model.RememberMe),
            cancellationToken);

        if (!result.Succeeded)
        {
            ModelState.AddModelError(string.Empty, result.Error ?? "Đăng nhập không thành công.");
            return View(model);
        }

        TempData["AccountStatus"] = $"Đã đăng nhập với tên {result.Session!.DisplayName}.";
        return Url.IsLocalUrl(model.ReturnUrl)
            ? LocalRedirect(model.ReturnUrl!)
            : RedirectToAction("Index", "Home");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await authService.LogoutAsync();
        TempData["AccountStatus"] = "Đã đăng xuất.";
        return RedirectToAction("Login");
    }

    [HttpGet]
    public IActionResult AccessDenied() => View("Error");
}
