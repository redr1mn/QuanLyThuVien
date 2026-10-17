using System.ComponentModel.DataAnnotations;

namespace QuanLyThuVien.Models;

public class LoginViewModel
{
    [Required(ErrorMessage = "Nhập tên đăng nhập hoặc email.")]
    [StringLength(100, ErrorMessage = "Tên đăng nhập không được vượt quá 100 ký tự.")]
    [Display(Name = "Tên đăng nhập / Email")]
    public string Username { get; set; } = "";

    [Required(ErrorMessage = "Nhập mật khẩu.")]
    [StringLength(128, ErrorMessage = "Mật khẩu không được vượt quá 128 ký tự.")]
    [DataType(DataType.Password)]
    [Display(Name = "Mật khẩu")]
    public string Password { get; set; } = "";

    [Display(Name = "Ghi nhớ đăng nhập")]
    public bool RememberMe { get; set; }

    public string? ReturnUrl { get; set; }
}
