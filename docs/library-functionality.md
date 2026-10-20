# Tài liệu chi tiết chức năng web quản lý thư viện

> Cập nhật: 19/10/2026  
> Trạng thái: MVP đã có backend, SQL Server, frontend React và các luồng nghiệp vụ chính.

## 1. Phạm vi hệ thống

Web quản lý thư viện hỗ trợ các nhóm nghiệp vụ:

- Tra cứu sách, thể loại và tình trạng bản sao.
- Quản lý độc giả, sách, thể loại và bản sao sách.
- Mượn, trả, gia hạn, đặt trước và tính phạt.
- Trang tài khoản riêng cho độc giả.
- Báo cáo tổng quan cho nhân viên/quản trị viên.
- Đăng nhập bằng ASP.NET Core Identity và phân quyền theo role.
- Lưu dữ liệu nghiệp vụ trong SQL Server.

Tài liệu này mô tả chức năng hiện có trong source code. Những phần được đánh dấu **giới hạn** hoặc **chưa hoàn thiện** không nên được hiểu là đã sẵn sàng cho production.

## 2. Kiến trúc và luồng dữ liệu

```text
React SPA/Vite (`frontend`)
  ├─ Axios: gọi HTTP API
  ├─ Zod: kiểm tra dữ liệu response/request ở frontend
  └─ Zustand: lưu state theo feature
        ↓ cookie session
ASP.NET Core API (`backend`)
        ↓
Application Services + Domain Rules
        ↓ EF Core
SQL Server: QuanLyThuVien
```

### Nguyên tắc nguồn dữ liệu

| Thành phần | Vai trò |
|---|---|
| SQL Server | Nguồn dữ liệu chính cho sách, độc giả, mượn trả, đặt trước và tiền phạt. |
| ASP.NET Core Identity | Quản lý tài khoản, cookie session và role. |
| Application services | Thực thi quy tắc nghiệp vụ và transaction. |
| React/Zustand | Projection phục vụ giao diện; không được xem là nguồn dữ liệu chính. |
| Axios | HTTP client dùng chung, gửi cookie và chuẩn hóa lỗi API. |

Các thao tác mượn/trả được xử lý trong transaction SQL Server. Frontend không tự quyết định việc cấp sách, cập nhật tồn kho hoặc tính phạt.

## 3. Vai trò và quyền hạn

| Vai trò | Quyền chính |
|---|---|
| Guest | Xem catalog công khai và trang đăng nhập; không được gọi nghiệp vụ bảo vệ. |
| Reader | Xem tài khoản của chính mình, khoản đang mượn, lịch sử, đặt trước và gia hạn khoản mượn của mình. |
| Staff | Quản lý sách/thể loại/bản sao, độc giả, mượn trả, đặt trước và báo cáo. |
| Admin | Có toàn bộ quyền Staff, đồng thời truy cập Users và Settings. |

Các API protected kiểm tra role ở backend. Việc ẩn menu ở frontend chỉ là trải nghiệm người dùng, không phải cơ chế bảo mật.

## 4. Các màn hình và route

| Route | Mục đích | Trạng thái hiện tại |
|---|---|---|
| `/` | Catalog công khai, tìm kiếm và lọc sách | Đã nối Catalog API |
| `/login` | Đăng nhập cookie session | Đã có Identity và API auth |
| `/register` | Đăng ký tài khoản Reader và thẻ độc giả | Đã tạo Member/User trong transaction |
| `/reader/account` | Hồ sơ, khoản mượn, lịch sử và đặt trước | Đã nối API; action bị giới hạn theo role |
| `/staff/readers` | Danh sách, tạo và sửa độc giả | Đã nối API |
| `/staff/circulation` | Danh sách, mượn, trả và gia hạn | Đã nối API |
| `/admin/reports` | Báo cáo tổng quan, lưu thông, quá hạn, phạt | Đã nối API |
| `/admin/users` | Quản trị người dùng | Chưa có UI/API đầy đủ; backlog |
| `/admin/settings` | Cấu hình quản trị | Chưa có UI/API đầy đủ; backlog |

Frontend route guard chỉ điều hướng trải nghiệm; API vẫn giữ phân quyền độc lập. Backend không còn Razor page route.

## 5. Chức năng theo nghiệp vụ

### 5.1. Đăng nhập và phiên làm việc

- Đăng nhập bằng username/email và password qua ASP.NET Core Identity.
- Server tạo cookie session.
- Axios gửi cookie với `withCredentials`.
- `GET /api/auth/me` trả về người dùng hiện tại và role.
- Đăng xuất xoá session qua cả API và form MVC.
- Tài khoản không có role phù hợp sẽ nhận `401` hoặc `403`.

### 5.2. Đăng ký tài khoản Reader

Người dùng có thể tự đăng ký tại `/register`. Form nhận họ tên, email, username, mật khẩu xác nhận, số điện thoại và địa chỉ tùy chọn.

Khi đăng ký thành công, backend trong cùng transaction SQL Server:

1. Sinh số thẻ dạng `LIB-...` không trùng.
2. Tạo Member trạng thái `Active`, loại `Reader`, thời hạn mặc định 1 năm và giới hạn 5 sách.
3. Tạo ApplicationUser liên kết với Member.
4. Đảm bảo role `Reader` tồn tại và gán role cho tài khoản.
5. Chuyển người dùng về trang đăng nhập cùng thông báo số thẻ.

Nếu tạo tài khoản hoặc cấp role thất bại, transaction rollback để không còn Member/User mồ côi. Người dùng không được tự đăng ký role `Staff` hoặc `Admin`.

### 5.3. Catalog sách

Catalog hỗ trợ:

- Tìm theo tiêu đề, ISBN hoặc tác giả.
- Lọc theo thể loại và trạng thái.
- Phân trang.
- Xem chi tiết sách.
- Xem số lượng bản sao và trạng thái bản sao.
- Staff/Admin tạo, sửa sách và thêm bản sao.
- Staff/Admin tạo, sửa thể loại.

Một cuốn sách (`Book`) có thể có nhiều bản sao vật lý (`BookCopy`). Việc mượn luôn thực hiện trên bản sao cụ thể, không chỉ trên metadata của sách.

### 5.4. Quản lý độc giả

Staff/Admin có thể:

- Xem danh sách độc giả có phân trang, tìm kiếm và lọc trạng thái.
- Tạo hồ sơ độc giả.
- Cập nhật thông tin và trạng thái độc giả.
- Xem chi tiết độc giả.

Các trạng thái độc giả gồm `Active`, `Suspended` và `Expired`. Độc giả không ở trạng thái hợp lệ không được tạo khoản mượn.

Reader chỉ được truy cập dữ liệu Member được liên kết với tài khoản Identity của mình. Nếu tài khoản Reader chưa liên kết Member, API trả về lỗi thay vì trả nhầm dữ liệu.

### 5.5. Mượn sách

Staff/Admin gửi member và danh sách bản sao cần mượn. Backend kiểm tra:

- Độc giả tồn tại và đang hoạt động.
- Bản sao tồn tại.
- Bản sao đang ở trạng thái có thể mượn.
- Không vi phạm giới hạn mượn.
- Các dữ liệu liên quan được cập nhật trong một transaction.

Khi thành công, hệ thống tạo `Loan`, `LoanItem` và chuyển bản sao sang trạng thái `OnLoan`.

### 5.6. Trả sách và tính phạt

Staff/Admin xử lý trả theo mã khoản mượn và tình trạng sách.

- Khoản mượn đang mở chuyển sang `Returned` khi toàn bộ bản sao đã trả.
- Bản sao trả bình thường chuyển về `Available`.
- Bản sao bị đánh dấu mất giữ trạng thái `Lost`.
- Bản sao hỏng được tính phí hỏng nhưng hiện tại được đưa về `Available` theo rule hiện hành.
- Phạt quá hạn được tính theo số ngày quá hạn nhân đơn giá phạt mỗi ngày.
- Phí tình trạng: hỏng là 10% giá trị sách, mất là 100% giá trị sách.
- Phạt được lưu thành bản ghi `Fine` gắn với khoản mượn.

Hiện có dữ liệu `PaidAtUtc` trong model Fine nhưng chưa có API thu tiền/đánh dấu đã thu tiền hoàn chỉnh.

### 5.7. Gia hạn

Reader được gia hạn khoản mượn của chính mình; Staff/Admin có thể thực hiện theo quyền nghiệp vụ.

Điều kiện gia hạn:

- Khoản mượn còn đang mở.
- Người gọi là chủ khoản mượn, hoặc là Staff/Admin.
- Chưa quá hạn.
- Chưa gia hạn lần trước.
- Không có người khác đang chờ đặt trước cùng sách.

Mỗi khoản mượn được gia hạn tối đa một lần và thời hạn được cộng thêm 7 ngày. Vi phạm điều kiện trả về conflict thay vì âm thầm thay đổi dữ liệu.

### 5.8. Đặt trước sách

Reader, Staff và Admin có thể tạo đặt trước; Reader chỉ được đặt cho Member đã liên kết với chính tài khoản của mình.

Quy tắc chính:

- Một Member không thể có nhiều lượt chờ cùng một Book.
- Đặt trước mới ở trạng thái `Waiting`.
- Người tạo có thể huỷ đặt trước của mình.
- Staff/Admin có thể huỷ đặt trước theo quyền quản lý.

Việc tự động thông báo sách đã sẵn sàng chưa được triển khai trong MVP.

### 5.9. Trang tài khoản Reader

Trang Reader Account tổng hợp:

- Thông tin hồ sơ.
- Khoản đang mượn.
- Nút gia hạn nếu khoản mượn đủ điều kiện.
- Lịch sử mượn trả.
- Các lượt đặt trước.
- Tổng phạt còn phải xử lý.

Dữ liệu được lấy từ `GET /api/reader/account`, không lấy từ localStorage hay dữ liệu demo.

### 5.10. Báo cáo

Staff/Admin có thể lấy báo cáo tổng quan theo khoảng thời gian, gồm các nhóm số liệu về:

- Số khoản mượn.
- Số lượt trả.
- Số khoản quá hạn.
- Tổng tiền phạt.
- Số liệu catalog và độc giả theo projection hiện tại.

Báo cáo chỉ đọc và yêu cầu khoảng thời gian `from`/`to`.

## 6. API hiện có

Tất cả response nghiệp vụ dùng envelope thống nhất, thường có dạng `success`, `data` và thông tin lỗi/phân trang.

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/health` | Public | Kiểm tra API đang hoạt động. |
| GET | `/api/auth/me` | Auth | Lấy session và role hiện tại. |
| POST | `/api/auth/login` | Public | Đăng nhập. |
| POST | `/api/auth/register` | Public | Đăng ký tài khoản Reader và Member. |
| POST | `/api/auth/logout` | Auth | Đăng xuất. |
| GET | `/api/books` | Public | Danh sách catalog có lọc/phân trang. |
| GET | `/api/books/{id}` | Public | Chi tiết sách. |
| POST | `/api/books` | Staff/Admin | Tạo sách. |
| PUT | `/api/books/{id}` | Staff/Admin | Sửa sách. |
| POST | `/api/books/{id}/copies` | Staff/Admin | Thêm bản sao. |
| GET | `/api/categories` | Public | Danh sách thể loại. |
| POST | `/api/categories` | Staff/Admin | Tạo thể loại. |
| PUT | `/api/categories/{id}` | Staff/Admin | Sửa thể loại. |
| GET | `/api/members` | Staff/Admin | Danh sách độc giả. |
| GET | `/api/members/{id}` | Reader theo scope hoặc Staff/Admin | Chi tiết độc giả. |
| POST | `/api/members` | Staff/Admin | Tạo độc giả. |
| PUT | `/api/members/{id}` | Staff/Admin | Cập nhật độc giả. |
| GET | `/api/loans` | Auth | Staff/Admin xem theo bộ lọc; Reader chỉ xem khoản của mình. |
| POST | `/api/loans` | Staff/Admin | Tạo khoản mượn. |
| POST | `/api/loans/{id}/return` | Staff/Admin | Trả sách và tính phạt. |
| POST | `/api/loans/{id}/renew` | Auth | Gia hạn theo scope và rule. |
| POST | `/api/reservations` | Reader/Staff/Admin | Tạo đặt trước. |
| DELETE | `/api/reservations/{id}` | Chủ sở hữu hoặc Staff/Admin | Huỷ đặt trước. |
| GET | `/api/reader/account` | Reader | Projection tài khoản cá nhân. |
| GET | `/api/reports/overview` | Staff/Admin | Báo cáo theo khoảng thời gian. |

## 7. Trạng thái nghiệp vụ

### Khoản mượn

```text
Open
  ├─ Return đủ bản sao → Returned
  └─ Renew hợp lệ      → Open + due date mới
```

Không cho trả lặp khoản mượn đã `Returned`. Không cho gia hạn quá hạn, gia hạn lần hai hoặc gia hạn khi có lượt chờ phù hợp.

### Bản sao sách

```text
Available → OnLoan → Available
                    ├→ Lost
                    └→ Available + phí hỏng
```

`OnLoan` là trạng thái chặn mượn trùng. Trạng thái cuối cùng sau trả phụ thuộc tình trạng được Staff chọn.

### Đặt trước

```text
Waiting → Cancelled
```

MVP chưa có bước tự động chuyển `Waiting` sang trạng thái sẵn sàng nhận sách hoặc hệ thống thông báo.

## 8. Mô hình dữ liệu SQL Server

| Entity | Ý nghĩa |
|---|---|
| `ApplicationUser` | Tài khoản Identity, role và liên kết Member nếu là Reader. |
| `Member` | Hồ sơ độc giả, trạng thái và thông tin liên hệ. |
| `Category` | Thể loại sách. |
| `Book` | Metadata sách: ISBN, tiêu đề, tác giả, nhà xuất bản, giá trị. |
| `BookCopy` | Bản sao vật lý và trạng thái hiện tại. |
| `Loan` | Phiếu mượn của một Member, hạn trả và trạng thái. |
| `LoanItem` | Chi tiết các bản sao trong phiếu mượn. |
| `Reservation` | Lượt đặt trước theo Member và Book. |
| `Fine` | Phạt quá hạn hoặc tình trạng sách. |

Migrations hiện có:

- `20261018150935_InitialLibrarySchema`
- `20261019133902_AddLoanRenewalCount`

## 9. Cấu trúc thư mục chính

```text
backend/QuanLyThuVien/
├─ Api/
│  ├─ Controllers/       # HTTP API và authorization boundary
│  └─ Middleware/        # Chuẩn hóa lỗi API
├─ Application/Features/  # Auth, Catalog, Members, Circulation, Reservations...
├─ Domain/
│  ├─ Entities/           # Mô hình nghiệp vụ
│  ├─ Enums/              # Trạng thái
│  └─ Rules/              # Quy tắc thuần nghiệp vụ
├─ Infrastructure/
│  ├─ Authentication/     # Identity setup
│  └─ Persistence/       # DbContext, configurations, migrations, seed
└─ QuanLyThuVien.csproj   # API host

frontend/src/
├─ features/
│  ├─ auth/
│  ├─ catalog/
│  ├─ members/
│  ├─ circulation/
│  ├─ reservations/
│  ├─ reader-account/
│  └─ reports/
├─ shared/
│  ├─ api/                # Axios client, envelope, API error
│  └─ schemas/            # Zod schemas
└─ app/                   # App root, layout và route guard
└─ pages/                 # Các màn hình theo route
└─ styles/                # Shared feature styles
```

## 10. Xử lý lỗi và trạng thái giao diện

- `401 Unauthorized`: chưa đăng nhập hoặc session hết hạn.
- `403 Forbidden`: đã đăng nhập nhưng không đúng role hoặc vượt data scope.
- `404 Not Found`: không tìm thấy sách, độc giả, bản sao hoặc khoản mượn.
- `409 Conflict`: vi phạm trạng thái nghiệp vụ như mượn trùng, trả lặp, gia hạn không hợp lệ.
- `422 Validation`: dữ liệu request không hợp lệ.
- Frontend có trạng thái loading, error và empty cho các màn hình đã nối API.
- Response được parse bằng Zod trước khi đưa vào store của feature.

## 11. SQL Server local

Hướng dẫn cài đặt, migration, connection string và seed local nằm tại [`docs/sql-server-local.md`](sql-server-local.md).

Connection string mặc định dùng placeholder, không commit password thật:

```json
{
  "ConnectionStrings": {
    "LibraryDb": "Server=localhost;Database=QuanLyThuVien;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True"
  }
}
```

Credential seed local phải truyền bằng environment variable hoặc user secrets. Không ghi password, connection string production hay secret vào repository.

## 12. Phần còn thiếu hoặc cần hoàn thiện

Các mục sau chưa nên mô tả là đã hoàn thành:

1. UI quản trị sách/thể loại/bản sao cần hoàn thiện đầy đủ trên Catalog API; hiện API và catalog đọc đã có, nhưng chưa có route Staff Books riêng.
2. Admin Users chưa có API quản trị tài khoản, gán role hoặc khoá tài khoản hoàn chỉnh.
3. Admin Settings hiện là khung màn hình, chưa có cấu hình nghiệp vụ lưu SQL Server.
4. Chưa có API ghi nhận đã thu tiền phạt hoặc quy trình thanh toán.
5. Chưa có thông báo tự động khi sách đặt trước sẵn sàng.
6. Chưa có xuất Excel/PDF, barcode/QR scanner hoặc import hàng loạt.
7. Chưa có bộ kiểm thử E2E trình duyệt; hiện có unit/application/API tests và smoke test cho SQL Server.
8. Chưa có audit log đầy đủ cho thao tác nhạy cảm của Staff/Admin.
9. Chưa có cơ chế phân bổ sách tự động theo hàng đợi đặt trước.

## 13. Kiểm chứng hiện tại

Các kiểm tra đã thực hiện cho implementation hiện tại:

- Backend tests: **23/23 passed**.
- Frontend tests: **13/13 passed**.
- Frontend TypeScript typecheck/build: **passed**.
- Backend solution build: **passed**.
- SQL Server smoke test: đăng nhập Reader, lấy reader account và gia hạn khoản mượn thành công; `RenewalCount` tăng lên 1 và hạn trả được cộng 7 ngày.

Khi thêm tính năng mới, cần cập nhật tài liệu này cùng với API contract, role matrix, migration và test tương ứng.
