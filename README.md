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
