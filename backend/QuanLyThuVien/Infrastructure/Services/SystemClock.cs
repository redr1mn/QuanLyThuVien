using QuanLyThuVien.Application.Common;

namespace QuanLyThuVien.Infrastructure.Services;

public sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
