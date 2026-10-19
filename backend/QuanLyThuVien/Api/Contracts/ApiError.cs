namespace QuanLyThuVien.Api.Contracts;

public sealed record ApiError(string Code, string Message, string? Field = null);
