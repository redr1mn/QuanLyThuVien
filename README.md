# Quản lý thư viện

Ứng dụng được tách thành hai phần độc lập:

- `frontend/`: React 18 + TypeScript + Vite, chạy tại `http://localhost:5173`.
- `backend/`: ASP.NET Core 10 REST API, ASP.NET Core Identity, EF Core và SQL Server.

Frontend là ứng dụng người dùng duy nhất. Backend không còn render Razor/MVC page và không phục vụ giao diện tại `/`.

## Kiến trúc

```text
Browser
  -> React SPA (frontend:5173)
  -> Vite proxy /api
  -> ASP.NET Core API (backend:5194 hoặc 7244)
  -> Application services
  -> EF Core
  -> SQL Server: QuanLyThuVien
```

Frontend dùng Axios để gọi API, Zod để kiểm tra payload và Zustand để lưu session/UI state. Cookie Identity được gửi qua proxy bằng `withCredentials`.

## Yêu cầu

- .NET SDK 10+
- Node.js 18+
- npm 9+
- SQL Server local hoặc SQL Server instance có thể truy cập từ máy phát triển

## Cài đặt

```powershell
cd frontend
npm ci
cd ..
dotnet restore QuanLyThuVien.slnx
```

Thiết lập SQL Server cho PowerShell hiện tại:

```powershell
$env:ConnectionStrings__LibraryDb = 'Server=.;Database=QuanLyThuVien;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True'
$env:LIBRARY_DB_CONNECTION = $env:ConnectionStrings__LibraryDb
```

Chi tiết migration, seed và xử lý lỗi xem [docs/sql-server-local.md](docs/sql-server-local.md).

## Chạy local

Mở hai terminal.

Terminal 1 — API:

```powershell
cd backend/QuanLyThuVien
dotnet run --launch-profile http
```

Terminal 2 — frontend:

```powershell
cd frontend
npm run dev
```

Mở **http://localhost:5173**. Vite proxy các request `/api` tới `http://localhost:5194`.

Kiểm tra API trực tiếp tại `http://localhost:5194/api/health` hoặc `https://localhost:7244/api/health`.

`http://localhost:5194/` trả `404` có chủ đích vì backend chỉ là API.

## Tài khoản development

Seed tài khoản chỉ bật khi chạy local:

```powershell
$env:Library__SeedDevelopmentUsers = 'true'
$env:Library__DevelopmentSeedPassword = '<local-only-password>'
dotnet run --project backend/QuanLyThuVien/QuanLyThuVien.csproj --launch-profile http
```

Seed tạo các role `Reader`, `Staff`, `Admin` và các tài khoản tương ứng. Không commit password vào source control.

## Route frontend

| Route | Quyền | Chức năng |
|---|---|---|
| `/` | Public | Catalog, tìm kiếm và chi tiết sách |
| `/login` | Public | Đăng nhập |
| `/register` | Public | Đăng ký Reader và tạo thẻ |
| `/reader/account` | Reader | Hồ sơ, khoản mượn, lịch sử, đặt trước |
| `/staff/readers` | Staff/Admin | Quản lý độc giả |
| `/staff/circulation` | Staff/Admin | Mượn, trả và gia hạn |
| `/admin/reports` | Staff/Admin | Báo cáo lưu thông, quá hạn và phạt |

Route guard chỉ cải thiện UX; quyền thật vẫn được kiểm tra tại API.

## Kiểm tra

```powershell
cd frontend
npm test
npm run typecheck
npm run build

cd ..
dotnet test backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj
dotnet build QuanLyThuVien.slnx
```

Tài liệu chức năng chi tiết: [docs/library-functionality.md](docs/library-functionality.md).

## Frontend — The Living Colophon

Giao diện dùng nền giấy `#F4F1EA`, bề mặt `#E8E3D8`, lưới `#D2CBB8`, mực `#141413`, ghi chú `#5C5954`, điểm nhấn `#8C2D19` và dấu thư viện `#1E3A5F`. Ba giọng chữ: Newsreader, IBM Plex Mono và Inter (Google Fonts, có font hệ thống dự phòng).

- `/staff/books`: Staff/Admin biên mục, cập nhật đầu sách và nhập bản sao theo barcode/kệ.
- `/staff/readers`: tìm kiếm, phân trang, thêm/sửa hồ sơ, đổi trạng thái và hạn thẻ qua `PUT /api/members/{id}`.
- `/staff/circulation`: chọn thẻ Active, tra đầu sách và chọn bản sao Available; hạn trả tối đa 7 ngày. Trả toàn bộ bản sao trong phiếu theo contract backend, với Normal/Damaged/Lost. Tiền phạt lấy từ biên nhận API.
- `/admin/reports`: chọn kỳ, số liệu tổng quan, xếp hạng sách và in báo cáo.
- `/admin/users`: phân trang, khóa/mở khóa và đổi vai trò.

Contract nguồn là các DTO/controller trong `backend/QuanLyThuVien`: envelope thực tế `{ data, errors }`; trạng thái bản sao gồm cả `Reserved` và `Damaged`. Frontend dùng cookie qua Axios, dữ liệu nghiệp vụ trong Zustand, không lưu dữ liệu thư viện ở localStorage.

Kiểm thử bổ sung `frontend/tests/backend-contracts.test.mjs` chạy trực tiếp schema production, kiểm tra trạng thái bản sao/thẻ, dữ liệu biên mục, bản sao trùng và biên thời hạn 7 ngày. Chạy `npm test`, `npm run typecheck`, `npm run build` trong `frontend/`. Kiểm thử thao tác thật cần backend ở cổng 5194, SQL Server đã cấu hình và tài khoản Staff/Admin.

Chi tiết nguồn frontend cũ được chuyển, các file CSS sao chép nguyên bản và khác biệt do contract backend: [Chuyển giao diện từ qlthuvien_old](docs/frontend-legacy-migration.md).
