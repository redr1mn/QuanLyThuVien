using QuanLyThuVien.Application.Features.Circulation;
using QuanLyThuVien.Application.Features.Members;
using QuanLyThuVien.Application.Features.Reservations;

namespace QuanLyThuVien.Application.Features.ReaderAccount;

public sealed record ReaderAccountView(MemberDetails Profile, IReadOnlyList<LoanListItem> CurrentLoans, IReadOnlyList<LoanListItem> History, IReadOnlyList<ReservationItem> Reservations, decimal OutstandingFines);
