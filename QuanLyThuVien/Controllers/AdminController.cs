using Microsoft.AspNetCore.Mvc;

namespace QuanLyThuVien.Controllers;

// Chỉ trả về trang khung. TODO: Thêm Authorize(Roles = "Admin") trước khi thêm dữ liệu/nghiệp vụ.
public class AdminController : Controller
{
    public IActionResult Users() => View();
    public IActionResult Settings() => View();

    public IActionResult Reports(string? tab)
    {
        // Chuẩn hóa tab từ URL; Dashboard cũ chuyển hướng tới cùng màn hình với tab overview.
        ViewData["ActiveTab"] = tab is "circulation" or "overdue" or "fines" ? tab : "overview";
        return View();
    }

    public IActionResult Dashboard() => RedirectToAction(nameof(Reports), new { tab = "overview" });
}
