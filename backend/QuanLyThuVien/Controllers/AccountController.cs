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

    [HttpGet]
    public IActionResult Register() => View(new RegisterViewModel());

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return View(model);

        var result = await authService.RegisterAsync(
            new RegisterRequest(model.Username, model.Email, model.Password, model.FullName, model.Phone, model.Address),
            cancellationToken);

        if (!result.Succeeded)
        {
            ModelState.AddModelError(string.Empty, result.Error ?? "Đăng ký không thành công.");
            return View(model);
        }

        TempData["AccountStatus"] = $"Đăng ký thành công. Số thẻ của bạn là {result.CardNumber}. Bạn có thể đăng nhập ngay.";
        return RedirectToAction(nameof(Login));
    }

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
