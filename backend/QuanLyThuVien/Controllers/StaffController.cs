using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace QuanLyThuVien.Controllers;

// Chỉ trả về trang khung. TODO: Phân quyền backend trước khi thêm dữ liệu/nghiệp vụ.
[Authorize(Roles = "Staff,Admin")]
public class StaffController : Controller
{
    public IActionResult Books() => View();
    public IActionResult Readers() => View();

    public IActionResult Circulation(string? tab)
    {
        // Query parameter giữ tab khi tải lại/Back; giá trị không hợp lệ quay về danh sách phiếu.
        ViewData["ActiveTab"] = tab is "borrow" or "return" ? tab : "list";
        return View();
    }

    [HttpGet("Staff/Borrow/Index")]
    public IActionResult BorrowIndex() => RedirectToAction(nameof(Circulation), new { tab = "list" });

    [HttpGet("Staff/Borrow/Create")]
    public IActionResult BorrowCreate() => RedirectToAction(nameof(Circulation), new { tab = "borrow" });

    [HttpGet("Staff/Return/Process")]
    public IActionResult ReturnProcess() => RedirectToAction(nameof(Circulation), new { tab = "return" });
}
