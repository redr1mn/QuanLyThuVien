using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace QuanLyThuVien.Controllers;

// Chỉ trả về trang khung, chưa tải dữ liệu độc giả.
// TODO: Đã có cookie xác thực; thêm Authorize(Roles = "Reader") trước khi trả dữ liệu cá nhân.
[Authorize(Roles = "Reader")]
public class ReaderController : Controller
{
    public IActionResult Account(string? tab)
    {
        // Chỉ nhận các tab đã định nghĩa; URL lạ quay về hồ sơ thay vì để view chọn một phần nội dung tùy ý.
        ViewData["ActiveTab"] = tab is "loans" or "history" or "reservations" ? tab : "profile";
        return View();
    }

    public IActionResult Profile() => RedirectToAction(nameof(Account), new { tab = "profile" });
    public IActionResult BorrowHistory() => RedirectToAction(nameof(Account), new { tab = "history" });
}
