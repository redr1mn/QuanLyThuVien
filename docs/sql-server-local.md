# SQL Server local setup

Backend dùng SQL Server qua Entity Framework Core. Không commit mật khẩu, connection string có secret hoặc seed password vào repository.

## Connection string

Runtime của ASP.NET Core đọc biến `ConnectionStrings__LibraryDb`.

PowerShell:

```powershell
$env:ConnectionStrings__LibraryDb = 'Server=.;Database=QuanLyThuVien;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True'
```

Khi chạy lệnh EF Core ở design-time, `DesignTimeDbContextFactory` yêu cầu biến
`LIBRARY_DB_CONNECTION`. Có thể gán cùng một giá trị:

```powershell
$env:LIBRARY_DB_CONNECTION = $env:ConnectionStrings__LibraryDb
```

Sau đó chạy migration từ thư mục `backend`:

```powershell
dotnet ef database update --project QuanLyThuVien/QuanLyThuVien.csproj --startup-project QuanLyThuVien/QuanLyThuVien.csproj
```

## Development seed

Seed chỉ chạy khi bật hai biến môi trường sau. Password dưới đây chỉ là ví dụ local; hãy thay bằng giá trị tạm của máy phát triển.

```powershell
$env:Library__SeedDevelopmentUsers = 'true'
$env:Library__DevelopmentSeedPassword = '<local-only-password>'
dotnet run --project QuanLyThuVien/QuanLyThuVien.csproj
```

Seed tạo các role `Reader`, `Staff`, `Admin` và tài khoản phát triển tương ứng. Production phải tạo tài khoản bằng quy trình quản trị thật.

## Data flow

```text
React + Axios
  -> ASP.NET Core API + cookie session
  -> Application services / validation
  -> EF Core transaction
  -> SQL Server
```

Circulation rechecks selected copies in a serializable transaction. Loan and fine history are stored in SQL Server; frontend state is only a server projection and never the authority.
