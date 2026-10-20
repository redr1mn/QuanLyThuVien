using System.ComponentModel.DataAnnotations;

namespace QuanLyThuVien.Models;

public sealed class RegisterViewModel
{
    [Required(ErrorMessage = "Nhập tên đăng nhập.")]
    [StringLength(100, ErrorMessage = "Tên đăng nhập không được vượt quá 100 ký tự.")]
    [Display(Name = "Tên đăng nhập")]
    public string Username { get; set; } = "";

    [Required(ErrorMessage = "Nhập email.")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
    [StringLength(320, ErrorMessage = "Email không được vượt quá 320 ký tự.")]
    [Display(Name = "Email")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Nhập họ và tên.")]
    [StringLength(200, ErrorMessage = "Họ tên không được vượt quá 200 ký tự.")]
    [Display(Name = "Họ và tên")]
    public string FullName { get; set; } = "";

    [StringLength(30, ErrorMessage = "Số điện thoại không được vượt quá 30 ký tự.")]
    [Display(Name = "Số điện thoại")]
    public string? Phone { get; set; }

    [StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự.")]
    [Display(Name = "Địa chỉ")]
    public string? Address { get; set; }

    [Required(ErrorMessage = "Nhập mật khẩu.")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Mật khẩu phải dài từ 8 đến 128 ký tự.")]
    [DataType(DataType.Password)]
    [Display(Name = "Mật khẩu")]
    public string Password { get; set; } = "";

    [Required(ErrorMessage = "Xác nhận mật khẩu.")]
    [Compare(nameof(Password), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    [DataType(DataType.Password)]
    [Display(Name = "Xác nhận mật khẩu")]
    public string ConfirmPassword { get; set; } = "";
}
