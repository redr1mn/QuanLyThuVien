namespace QuanLyThuVien.Application.Features.Reports;
public sealed record ReportOverview(int ActiveLoans, int OverdueLoans, int Books, int Members, int BorrowVolume, int ReturnVolume, IReadOnlyList<TopBookReport> TopBooks);
public sealed record TopBookReport(int BookId, string Title, int BorrowCount);
