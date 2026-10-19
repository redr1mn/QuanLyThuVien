namespace QuanLyThuVien.Application.Features.Circulation;

public sealed record BorrowCommand(int MemberId, IReadOnlyCollection<int> CopyIds, DateTimeOffset DueAt);
public sealed record ReturnItemCommand(int CopyId, string Condition);
public sealed record ReturnCommand(IReadOnlyCollection<ReturnItemCommand> Items);
public sealed record LoanListItem(long Id, int MemberId, string MemberName, DateTimeOffset BorrowedAtUtc, DateTimeOffset DueAtUtc, string Status, IReadOnlyList<int> CopyIds, decimal FineTotal, int RenewalCount);
