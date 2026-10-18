namespace QuanLyThuVien.Application.Common;

public sealed class LibraryOptions
{
    public const string SectionName = "Library";

    public string ConnectionStringName { get; set; } = "LibraryDb";
}
