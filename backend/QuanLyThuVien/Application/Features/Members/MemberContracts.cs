namespace QuanLyThuVien.Application.Features.Members;

public sealed record MemberQuery(string? Query = null, string? Status = null, int Page = 1, int PageSize = 20);

public sealed record MemberListItem(int Id, string CardNumber, string FullName, string? Email, string? Phone, string MemberType, DateTimeOffset ExpiresAtUtc, string Status, int CurrentLoanCount, int OverdueCount);

public sealed record MemberDetails(int Id, string CardNumber, string FullName, string? Email, string? Phone, string? Address, string MemberType, DateTimeOffset IssuedAtUtc, DateTimeOffset ExpiresAtUtc, string Status, int MaxBooks, int CurrentLoanCount, int OverdueCount);

public sealed record CreateMemberRequest(string CardNumber, string FullName, string? Email, string? Phone, string? Address, string MemberType, int MaxBooks, DateTimeOffset ExpiresAtUtc);

public sealed record UpdateMemberRequest(string CardNumber, string FullName, string? Email, string? Phone, string? Address, string MemberType, int MaxBooks, DateTimeOffset ExpiresAtUtc, string Status);
