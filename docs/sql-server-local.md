# Thiết lập máy phát triển mới

Ứng dụng dùng React + Vite, ASP.NET Core 10, EF Core 10 và SQL Server. Các lệnh
bên dưới dành cho Windows PowerShell, chạy từ thư mục gốc repository trừ khi có
ghi chú khác.

## Phần mềm cần cài

- .NET 10 SDK.
- Node.js 22 trở lên, kèm npm.
- SQL Server Express hoặc Developer local, hoặc một SQL Server instance có thể
  truy cập. Tài khoản Windows hiện tại cần quyền tạo database; SSMS chỉ cần nếu
  muốn xem dữ liệu bằng giao diện.
- Git để lấy source code.

Instance SQL Server Express mặc định thường là `localhost\SQLEXPRESS`. Nếu máy
dùng default instance hoặc tên instance khác, thay giá trị `Server` trong
connection string bên dưới.

## Lấy source và cài dependency

Clone repository rồi mở PowerShell tại thư mục gốc trước khi chạy các lệnh sau.

```powershell
dotnet restore QuanLyThuVien.slnx
dotnet tool restore
cd frontend
npm ci
cd ..
```

`.config/dotnet-tools.json` pin `dotnet-ef` ở phiên bản `10.0.13`, cùng phiên
bản EF Core của backend. `dotnet tool restore` cài công cụ local cho repository;
không cần cài `dotnet-ef` global.

## Kết nối SQL Server và tạo schema

Đặt hai biến môi trường trong PowerShell hiện tại. Chúng cần cùng giá trị:

```powershell
$connectionString = 'Server=localhost\SQLEXPRESS;Database=QuanLyThuVien;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True'
$env:ConnectionStrings__LibraryDb = $connectionString
$env:LIBRARY_DB_CONNECTION = $connectionString
```

`ConnectionStrings__LibraryDb` được backend dùng lúc chạy. `LIBRARY_DB_CONNECTION`
được EF design-time factory dùng khi chạy migration. Biến môi trường chỉ có hiệu
lực trong PowerShell hiện tại; đặt lại chúng trong terminal chạy backend.

Chạy migration để tạo database và toàn bộ schema hiện có:

```powershell
dotnet ef database update --project backend/QuanLyThuVien/QuanLyThuVien.csproj --startup-project backend/QuanLyThuVien/QuanLyThuVien.csproj
```

Lệnh này cần kết nối SQL hợp lệ và quyền tạo database nếu `QuanLyThuVien` chưa
tồn tại. Ứng dụng không tự chạy migration lúc khởi động. Dùng EF migrations để
cập nhật schema; file `InitialLibrarySchema.sql` chỉ chứa migration ban đầu và
không thay thế được các migration mới hơn.

## Tài khoản và dữ liệu mẫu

Muốn tạo tài khoản development cho Reader, Staff và Admin, bật seed trước khi
chạy backend. Seed chỉ tạo role, ba tài khoản và thẻ thành viên liên kết; mật
khẩu là giá trị bạn nhập tại máy và chỉ dùng cho tài khoản mới.

```powershell
$env:Library__SeedDevelopmentUsers = 'true'
$env:Library__DevelopmentSeedPassword = '<mat-khau-development-cua-ban>'
dotnet run --project backend/QuanLyThuVien/QuanLyThuVien.csproj --launch-profile http
```

Tên đăng nhập là `reader`, `staff` và `admin`. Khi được tạo mới trên database
sạch, cả ba dùng mật khẩu development đã đặt ở trên; seed không đặt lại mật khẩu
của tài khoản đã tồn tại. Không commit mật khẩu hoặc connection string vào repository.
Nên dùng biến môi trường như ví dụ trên; nếu lưu cấu hình vào
`backend/QuanLyThuVien/appsettings.Development.local.json`, hãy đảm bảo file đó
được thêm vào `.gitignore` trước khi commit.

Migration và seed hiện tại **không** tạo danh mục, sách, bản sách, phiếu mượn,
đặt trước hoặc tiền phạt. Database mới có catalog trống. Database local có dữ
liệu catalog mẫu, nhưng các hàng đó chưa được đóng gói thành seed/script trong
repository nên không tự xuất hiện trên máy mới. Độc giả thông thường có thể
đăng ký từ giao diện sau khi backend đã kết nối database.

## Chạy ứng dụng

Sau khi tạo schema, mở hai terminal. Đặt lại connection string trong terminal
backend rồi chạy API:

```powershell
$connectionString = 'Server=localhost\SQLEXPRESS;Database=QuanLyThuVien;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True'
$env:ConnectionStrings__LibraryDb = $connectionString
dotnet run --project backend/QuanLyThuVien/QuanLyThuVien.csproj --launch-profile http
```

Trong terminal thứ hai:

```powershell
cd frontend
npm run dev
```

Mở `http://localhost:5173`. Vite proxy `/api` tới backend ở
`http://localhost:5194`. Endpoint `GET http://localhost:5194/api/health` xác nhận
HTTP API đang phản hồi, nhưng không kiểm tra kết nối SQL; thử thêm
`GET http://localhost:5194/api/categories` để xác nhận backend đọc được database.
Backend chỉ phục vụ API nên `/` trả 404 là bình thường.

## Lỗi thường gặp

- **`dotnet ef` không tìm thấy:** chạy `dotnet tool restore` từ thư mục gốc.
- **Không kết nối được SQL Server:** kiểm tra service SQL Server đang chạy, tên
  instance trong `Server=...`, Windows authentication và quyền tạo database.
- **API health trả 200 nhưng catalog báo 500:** health endpoint không kiểm tra
  database. Xác nhận đã đặt `ConnectionStrings__LibraryDb` trong terminal backend
  và đã chạy `dotnet ef database update`.
- **Cổng đã được sử dụng:** dừng tiến trình đang giữ cổng 5194 (API) hoặc 5173
  (Vite), rồi khởi động lại.
- **HTTPS local báo chứng chỉ:** chạy `dotnet dev-certs https --trust`; profile
  `http` vẫn dùng được cho phát triển local.
