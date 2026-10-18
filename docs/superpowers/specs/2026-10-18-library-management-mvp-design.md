# Library Management MVP Design

## Goal

Biến phần demo hiện tại thành một hệ thống quản lý thư viện có dữ liệu thật, có API và có ranh giới rõ ràng giữa nghiệp vụ backend với giao diện frontend. Phạm vi đầu tiên phải chạy được theo từng vertical slice, không tạo các màn hình chỉ có dữ liệu giả.

Database được chốt là **SQL Server**. Backend tiếp tục là một ASP.NET Core MVC application có Razor shell và API cùng host; frontend tiếp tục là React/Vite được mount từ các trang hiện tại.

## Current state

- `backend/QuanLyThuVien` mới có controller trả Razor View; chưa có EF Core, database, API hoặc service nghiệp vụ.
- `frontend` có React/Vite nhưng `BookCatalog` dùng mock data và `Workspace` dùng state/localStorage cho demo.
- Đăng nhập đang dùng ba tài khoản hardcode trong Development và cookie demo.
- Chưa có `[Authorize]` thực sự cho các nghiệp vụ Staff/Admin.
- Chưa có `axios`, `zod`, `zustand`, API contract hoặc validation tại biên frontend.

## Chosen architecture

### Backend: modular monolith, feature-oriented application layer

Không tách thành nhiều project .NET ở giai đoạn này. Giữ một host để giảm chi phí vận hành, nhưng tách rõ domain, application, infrastructure, API và Razor web shell.

```text
backend/QuanLyThuVien/
├── Api/
│   ├── Controllers/
│   ├── Contracts/
│   └── Middleware/
├── Application/
│   ├── Common/
│   └── Features/
│       ├── Auth/
│       ├── Catalog/
│       ├── Members/
│       ├── Circulation/
│       ├── Reservations/
│       └── Reports/
├── Domain/
│   ├── Entities/
│   ├── Enums/
│   ├── Exceptions/
│   └── Rules/
├── Infrastructure/
│   ├── Authentication/
│   ├── Persistence/
│   │   ├── Configurations/
│   │   ├── Migrations/
│   │   └── Seed/
│   └── Services/
├── Controllers/                 # Razor page controllers
├── Models/                      # Razor-only view models during migration
├── Views/
└── Program.cs
```

Rules:

- `Domain` không tham chiếu ASP.NET, EF Core hoặc UI.
- `Application` chứa use case, validation và port/interface; không truy cập `DbContext` trực tiếp trong controller.
- `Infrastructure` hiện thực persistence, Identity và các adapter ngoài.
- `Api` chỉ nhận request, gọi application use case và trả contract.
- `Controllers`/`Views` giữ vai trò page shell và điều hướng Razor; không chứa logic mượn/trả.
- Các API dùng cookie authentication same-origin trong giai đoạn đầu. Axios gửi `withCredentials: true`; không đưa access token vào localStorage.

### Frontend: feature modules with shared boundaries

```text
frontend/src/
├── app/
│   ├── App.tsx
│   ├── providers.tsx
│   └── routes.ts
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── schemas/
│   │   ├── store/
│   │   ├── components/
│   │   └── pages/
│   ├── catalog/
│   │   ├── api/
│   │   ├── schemas/
│   │   ├── store/
│   │   ├── components/
│   │   └── pages/
│   ├── members/
│   ├── circulation/
│   ├── reservations/
│   └── reports/
├── shared/
│   ├── api/
│   │   ├── http-client.ts
│   │   └── api-error.ts
│   ├── components/
│   ├── schemas/
│   ├── stores/
│   ├── types/
│   └── utils/
├── pages/
└── styles/
```

Rules:

- Components không gọi Axios trực tiếp; gọi feature API/service.
- `http-client.ts` là nơi cấu hình base URL, cookie credentials, timeout và xử lý lỗi chung.
- Zod parse response API trước khi đưa vào UI, đồng thời validate form input.
- Zustand giữ session, filter, modal, loading/error và state dùng chung; không được dùng như database hay nguồn sự thật thay cho SQL Server.
- Giữ hybrid Razor route trong MVP; chưa thêm React Router chỉ để tạo thêm một lớp routing.

## Data model

Dùng ASP.NET Core Identity cho tài khoản và role thay cho cơ chế username/password hardcode hiện tại.

Các aggregate/entity chính:

- `ApplicationUser`, `IdentityRole`: tài khoản, trạng thái khóa và role `Reader`, `Staff`, `Admin`.
- `Member`: hồ sơ độc giả, mã thẻ, loại độc giả, hạn thẻ và trạng thái.
- `Category`: thể loại sách.
- `Book`: thông tin thư mục: ISBN, tiêu đề, tác giả, nhà xuất bản, năm xuất bản, mô tả, thể loại và trạng thái xóa mềm.
- `BookCopy`: từng bản vật lý, mã barcode, vị trí kệ và trạng thái `Available`, `OnLoan`, `Reserved`, `Lost`, `Damaged`.
- `Loan`, `LoanItem`: phiếu mượn, độc giả, người xử lý, thời điểm mượn/hạn trả/trả và từng bản sách.
- `Reservation`: yêu cầu đặt trước theo thứ tự thời gian, trạng thái và thời hạn nhận sách.
- `Fine`: khoản phạt do quá hạn, mất hoặc hư hỏng; giữ nguyên số tiền tại thời điểm phát sinh.

Quy tắc nghiệp vụ cốt lõi:

```text
Available copy
   ↓ borrow
OnLoan
   ↓ return
Available / Damaged / Lost

No available copy
   ↓ reserve
Reserved
   ↓ checkout or expire/cancel
OnLoan / Available
```

- Mọi kiểm tra giới hạn mượn, thẻ hết hạn, sách đang mượn và quyền thao tác phải được thực hiện ở backend.
- Tạo loan và đổi trạng thái copy phải nằm trong một transaction SQL Server.
- Endpoint mượn/trả phải chống xử lý lặp bằng trạng thái hiện tại và khóa/transaction phù hợp.
- Không xóa vật lý `Book` đã có lịch sử mượn; dùng soft delete hoặc trạng thái inactive.

## MVP capabilities

### Auth and authorization

- Đăng nhập, đăng xuất, lấy session hiện tại.
- Tài khoản được lưu trong SQL Server, password được hash bởi ASP.NET Core Identity.
- `[Authorize]` và policy/role được áp dụng ở API; menu frontend chỉ là hiển thị, không phải cơ chế bảo mật.

### Catalog

- Public catalog: tìm kiếm, lọc, phân trang, xem chi tiết và tình trạng còn bản.
- Staff/Admin: tạo, sửa, khóa mềm sách; quản lý category và book copies.

### Members

- Staff/Admin xem danh sách, tìm kiếm, tạo và cập nhật độc giả.
- Quản lý mã thẻ, hạn thẻ, trạng thái khóa và giới hạn mượn.
- Reader chỉ xem hồ sơ và lịch sử của chính mình.

### Circulation

- Staff tạo phiếu mượn, chọn độc giả và các bản sách.
- Staff xử lý trả sách, tình trạng sách và tiền phạt.
- Reader xem sách đang mượn, hạn trả, lịch sử và tiền phạt của chính mình.

### Reservations and reports

- Reader đặt/hủy đặt trước sách hết bản.
- Staff xem hàng chờ và xử lý đặt trước.
- Admin/Staff xem dashboard cơ bản: đang mượn, quá hạn, số lượng sách, độc giả và lưu lượng mượn/trả.

Deferred work: email/notification, barcode scanner, import/export Excel, audit log nâng cao, thanh toán online, multi-branch inventory và báo cáo phân tích nâng cao.

## API boundary

API đặt dưới `/api` và trả response thống nhất:

```json
{
  "data": {},
  "errors": []
}
```

Các endpoint MVP dự kiến:

```text
GET    /api/auth/me
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/books
GET    /api/books/{id}
POST   /api/books
PUT    /api/books/{id}
POST   /api/books/{id}/copies

GET    /api/members
GET    /api/members/{id}
POST   /api/members
PUT    /api/members/{id}

GET    /api/loans
POST   /api/loans
POST   /api/loans/{id}/return

GET    /api/reservations
POST   /api/reservations
DELETE /api/reservations/{id}

GET    /api/reports/overview
```

DTO/API contract tách khỏi entity EF. Response list có pagination metadata; lỗi validation trả `400`, chưa đăng nhập `401`, thiếu quyền `403`, không tồn tại `404`, conflict nghiệp vụ `409`.

## SQL Server and configuration

- Dùng `Microsoft.EntityFrameworkCore.SqlServer` và EF Core migrations.
- Connection string đặt trong `ConnectionStrings:LibraryDb` ở local configuration hoặc User Secrets/environment variable; không commit password.
- Migration đặt tại `Infrastructure/Persistence/Migrations`.
- Seed role và dữ liệu demo phải idempotent, chỉ bật bằng cấu hình Development hoặc lệnh rõ ràng.
- Không tự động chạy migration destructive trong production startup.
- Có health check database cơ bản trước khi coi backend đã sẵn sàng.

## Delivery sequence

1. Foundation: package dependencies, SQL Server connection, Identity, `DbContext`, migration đầu tiên, API error contract và test database configuration.
2. Auth: login/logout/session, role policy và thay thế tài khoản hardcode.
3. Catalog: books, categories, copies, search/filter/pagination và frontend Axios/Zod/Zustand.
4. Members: member card/status và quyền Reader/Staff.
5. Circulation: borrow/return/fine transaction cùng integration tests cho các rule chính.
6. Reservations/reports: hàng chờ đặt trước, dashboard và cập nhật README/setup.

Mỗi bước phải có backend test phù hợp, frontend typecheck/build và không chuyển sang bước sau khi API contract chưa ổn định.

## Verification and acceptance criteria

- `dotnet build` pass từ root.
- EF Core tạo được migration và database SQL Server local bằng connection string được cung cấp ngoài source.
- API test xác nhận `401/403`, role access, validation và các conflict mượn/trả.
- Frontend có `axios`, `zod`, `zustand` trong dependency và không còn API call trực tiếp từ component.
- Frontend build/typecheck pass; các state loading/error/empty/unauthorized có trong các màn hình server-backed.
- Catalog và workspace không còn lấy dữ liệu nghiệp vụ từ `localStorage` sau khi vertical slice tương ứng hoàn tất.
- Mọi thao tác mượn/trả cập nhật `Loan`, `LoanItem`, `BookCopy` và `Fine` nhất quán trong SQL Server transaction.
- README ghi rõ cách cấu hình SQL Server, chạy migration, seed dữ liệu và khởi chạy frontend/backend.

## Non-goals

- Không tạo microservices hoặc project .NET riêng cho từng module.
- Không giữ mock/localStorage làm nguồn dữ liệu chính cho nghiệp vụ đã có API.
- Không thêm React Router nếu hybrid Razor routing vẫn đáp ứng được các route hiện tại.
- Không triển khai notification, barcode, Excel import hoặc thanh toán trong MVP đầu tiên.
