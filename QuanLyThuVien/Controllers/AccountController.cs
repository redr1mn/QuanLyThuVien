using Microsoft.AspNetCore.Mvc;

namespace QuanLyThuVien.Controllers;

// Khung giao diện, chưa triển khai xác thực hoặc xử lý đăng nhập/đăng xuất.
public class AccountController : Controller
{
    [HttpGet]
    public IActionResult Login() => View();
}
