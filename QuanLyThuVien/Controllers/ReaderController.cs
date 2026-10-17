using Microsoft.AspNetCore.Mvc;

namespace QuanLyThuVien.Controllers;

// Chỉ trả về trang khung, chưa tải dữ liệu độc giả.
// TODO: Thêm Authorize(Roles = "Reader") khi triển khai xác thực.
public class ReaderController : Controller
{
    public IActionResult Account(string? tab)
    {
        ViewData["ActiveTab"] = tab is "loans" or "history" or "reservations" ? tab : "profile";
        return View();
    }

    public IActionResult Profile() => RedirectToAction(nameof(Account), new { tab = "profile" });
    public IActionResult BorrowHistory() => RedirectToAction(nameof(Account), new { tab = "history" });
}
