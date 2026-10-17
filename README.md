# 📚 Hệ Thống Quản Lý Thư Viện (QuanLyThuVien)

Dự án Web Quản Lý Thư Viện được xây dựng theo mô hình kiến trúc **Hybrid Web Application**: kết hợp nền tảng **ASP.NET Core 10.0 MVC** (Backend, Routing, Razor Views) với **React 18 + TypeScript + Vite + Tailwind CSS v4** (Interactive UI Widgets).

---

## 🌟 Điểm nổi bật về kiến trúc (Hybrid Model)

- **Kết hợp linh hoạt**: Giữ nguyên toàn bộ cấu trúc định tuyến, Controller, Razor Views và Authentication của ASP.NET Core MVC, đồng thời nhúng các React Components tương tác cao vào bất kỳ trang `.cshtml` nào.
- **Hot Module Replacement (HMR)**: Sử dụng Vite Dev Server cho phép cập nhật tức thì giao diện React và CSS khi code mà không cần tải lại toàn bộ trang.
- **Tự động Mount**: Chỉ cần gắn thuộc tính `data-react-component="TênComponent"` và `data-props='{...}'` vào bất kỳ thẻ HTML nào, component sẽ tự khởi tạo.
- **Bundle frontend**: `_ViteScripts.cshtml` chuyển sang bundle tĩnh trong `wwwroot/dist/` khi chạy Production hoặc khi tắt Vite Dev Server. Phần xác thực hiện dùng tài khoản mẫu trong Development, chưa kết nối cơ sở dữ liệu.
- **Tự động hóa đóng gói**: Khi chạy `dotnet publish`, dự án tự động kích hoạt `npm install` và `npm run build` để đóng gói frontend.

---

## 🛠️ Yêu cầu môi trường (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

| Công cụ | Phiên bản khuyến nghị | Lệnh kiểm tra |
| :--- | :--- | :--- |
| **.NET SDK** | .NET 10.0 trở lên | `dotnet --version` |
| **Node.js** | v18.x trở lên (khuyến nghị v20.x hoặc v24.x) | `node -v` |
| **npm** | v9.x trở lên | `npm -v` |
| **IDE / Editor** | Visual Studio 2022 (v17.10+) / VS Code / Rider | - |

---

## 📥 1. Hướng dẫn Cài đặt & Setup

### Bước 1: Clone kho mã nguồn
```bash
git clone https://github.com/<your-username>/QuanLyThuVien.git
cd QuanLyThuVien
```

### Bước 2: Cài đặt thư viện Frontend (React / Vite)
Di chuyển vào thư mục `ClientApp` và chạy `npm install`:
```bash
cd QuanLyThuVien/ClientApp
npm install
cd ../..
```

### Bước 3: Khôi phục và build Backend .NET
```bash
dotnet restore
dotnet build
```

---

## 🚀 2. Hướng dẫn Khởi chạy dự án

Bạn có thể chạy dự án theo một trong hai chế độ dưới đây:

### 🔹 Chế độ 1: Môi trường Phát triển (Development Mode - Khuyến nghị)
Chế độ này mang lại trải nghiệm lập trình tốt nhất với tính năng **Hot Module Replacement (HMR)**: khi bạn chỉnh sửa React Component hoặc Tailwind CSS, trình duyệt sẽ tự động cập nhật ngay lập tức.

Mở **2 cửa sổ Terminal**:

- **Terminal 1: Khởi chạy Vite Dev Server**
  ```bash
  cd QuanLyThuVien/ClientApp
  npm run dev
  ```
  > Vite Dev Server sẽ chạy tại địa chỉ: `http://localhost:5173`

- **Terminal 2: Khởi chạy ASP.NET Core Web**
  ```bash
  cd QuanLyThuVien
  dotnet run --launch-profile https
  ```
  *(Hoặc mở file `QuanLyThuVien.slnx` bằng Visual Studio và bấm **F5** hoặc **Ctrl + F5**).*

Truy cập trình duyệt theo URL được cung cấp bởi ASP.NET Core:
- **HTTPS**: `https://localhost:7244`
- **HTTP**: `http://localhost:5194`

---

### 🔹 Chế độ 2: Chế độ Độc lập / Production (Standalone Mode)
Nếu bạn không muốn chạy đồng thời 2 terminal hoặc muốn kiểm tra bản build tĩnh:

1. **Build mã nguồn React thành file bundle tĩnh:**
   ```bash
   cd QuanLyThuVien/ClientApp
   npm run build
   cd ..
   ```
   *Vite biên dịch TypeScript và tạo các entry `main.js`, `index.js`, CSS và các chunk dùng chung trong `wwwroot/dist/assets/`.*

2. **Chạy ASP.NET Core:**
   ```bash
   dotnet run
   ```
   *Hệ thống sẽ tự động nhận diện file bundle tĩnh trong `wwwroot/dist` và phục vụ mà không cần bật server Vite.*

> **Cấu hình hiện tại**: `Vite:DevServer` đang là `true` trong `appsettings.Development.json`. Để dùng bundle tĩnh mà không chạy Vite, đổi giá trị này thành `false`, rồi khởi động lại ứng dụng. Chạy bằng bundle tĩnh trong Development vẫn dùng được tài khoản mẫu; đây không phải môi trường Production.

---

## 🔐 Đăng nhập và trạng thái thanh điều hướng

### Chức năng đã triển khai

- Trang `/Account/Login` có tên đăng nhập/email, mật khẩu, hiện/ẩn mật khẩu, ghi nhớ đăng nhập và thông báo lỗi.
- Validation phía trình duyệt và server: bắt buộc nhập, giới hạn tên đăng nhập 100 ký tự và mật khẩu 128 ký tự.
- Có ba nút điền nhanh tên tài khoản mẫu. Người dùng tự nhập mật khẩu và bấm **Đăng nhập**.
- Xác thực bằng cookie `QuanLyThuVien.Session`, lưu claim ID, tên hiển thị và vai trò. Cookie có `HttpOnly` và `SameSite=Lax`.
- Không chọn ghi nhớ: cookie phiên, thời hạn xác thực 8 giờ. Chọn ghi nhớ: cookie lưu qua lần đóng trình duyệt, thời hạn ban đầu 7 ngày. Cơ chế cookie có thể gia hạn phiên khi sử dụng.
- Đăng nhập thành công chuyển về trang chủ hoặc `ReturnUrl` nội bộ hợp lệ; không chuyển hướng sang website bên ngoài.
- Đăng xuất bằng POST, xóa cookie xác thực và chuyển về trang đăng nhập.
- Cả POST đăng nhập và đăng xuất đều kiểm tra antiforgery token.
- Khi truy cập lại trang đăng nhập trong một phiên hợp lệ, trang hiển thị tài khoản hiện tại và nút đăng xuất để đổi tài khoản.

### Tài khoản mẫu — chỉ dùng trong Development

| Tên đăng nhập | Tên hiển thị trên navbar | Vai trò |
| :--- | :--- | :--- |
| `reader` | Nguyễn Minh Anh | `Reader` |
| `staff` | Trần Thu Hà | `Staff` |
| `admin` | Lê Hoàng Nam | `Admin` |

**Mật khẩu chung:** `ThuVien@123`.

Các tài khoản được khai báo trực tiếp trong `QuanLyThuVien/Controllers/AccountController.cs`, ở action POST `Login`; chưa lưu trong database. Dù nhãn ô nhập có ghi email, bản demo hiện chỉ xác thực ba tên đăng nhập trên.

Ngoài Development, giao diện không hiển thị các nút tài khoản mẫu, nút gửi form bị vô hiệu hóa và backend từ chối đăng nhập demo. Cookie có claim `authentication_source=demo` cũng bị từ chối nếu dùng ngoài Development.

### Navbar theo trạng thái đăng nhập

| Trạng thái | Nhóm điều hướng | Khu vực riêng bên phải |
| :--- | :--- | :--- |
| Guest | Trang chủ | Đăng nhập |
| Reader | Trang chủ, Độc giả | Tên người dùng → dropdown Đăng xuất |
| Staff | Trang chủ, Nghiệp vụ thư viện | Tên người dùng → dropdown Đăng xuất |
| Admin | Trang chủ, Nghiệp vụ thư viện, Quản trị | Tên người dùng → dropdown Đăng xuất |

Nhóm menu được căn giữa, mục đang chọn được gạch chân. Tên tài khoản và mũi tên có khoảng cách cố định 8px; gạch chân chỉ áp dụng cho tên. Khu vực tài khoản nằm ngoài phần menu thu gọn và vẫn hiện trên điện thoại.

**Lưu ý về quyền:** menu hiển thị theo role, nhưng các controller nghiệp vụ hiện vẫn là trang khung và chưa có `[Authorize]`. Ẩn menu chưa ngăn truy cập trực tiếp bằng URL. Sidebar quản lý còn hỗ trợ xem trước các mục cho guest trong Development khi mở trực tiếp trang quản lý.

### Cách thử

1. Dừng ứng dụng đang chạy, build lại và khởi chạy profile `https` trong Development.
2. Mở `https://localhost:7244/Account/Login`.
3. Chọn tài khoản mẫu, nhập mật khẩu chung rồi bấm **Đăng nhập**.
4. Kiểm tra tên người dùng và nhóm menu tương ứng trên navbar; tải lại trang để kiểm tra phiên.
5. Mở dropdown tên tài khoản, chọn **Đăng xuất**; navbar trở lại trạng thái guest.

Nếu thay đổi controller hoặc cấu hình xác thực nhưng ứng dụng vẫn chạy bản cũ, trong Visual Studio dùng **Shift + F5 → Ctrl + Shift + B → F5**. Nhấn **Ctrl + F5 trên trình duyệt** để tải lại CSS/JS.

### File phụ trách

| File trong `QuanLyThuVien/` | Nội dung |
| :--- | :--- |
| `Controllers/AccountController.cs` | GET/POST đăng nhập, tài khoản mẫu, tạo claim, đăng xuất |
| `Models/LoginViewModel.cs` | Dữ liệu form và validation |
| `Program.cs` | Đăng ký cookie và middleware xác thực, từ chối phiên demo ngoài Development |
| `Views/Account/Login.cshtml` | Form, tài khoản xem thử và trạng thái đã đăng nhập |
| `wwwroot/css/login.css`, `wwwroot/js/login.js` | Giao diện, hiện/ẩn mật khẩu, điền nhanh username |
| `Views/Shared/_Layout.cshtml` | Đăng nhập/tên người dùng, Đăng xuất và thông báo kết quả |
| `Views/Shared/_PrimaryNavigation.cshtml` | Nhóm menu theo vai trò; guest chỉ thấy Trang chủ |
| `Views/Shared/_WorkspaceNavigation.cshtml` | Sidebar quản lý |
| `wwwroot/css/library-shell.css` | Bố cục navbar và hệ chữ dùng chung |

`bin/LayoutCheck/check-login.ps1` là script kiểm tra cục bộ đã dùng để thử đăng nhập/đăng xuất, cookie, menu theo vai trò, thông tin sai, antiforgery và giới hạn môi trường. Đây **không phải nguồn dữ liệu người dùng**, không cần chạy để dùng website. File nằm trong `bin/`, không được Git theo dõi và có thể không tồn tại ở máy khác hoặc sau khi clean build.

### Backend còn cần triển khai

- [ ] Thiết kế dữ liệu tài khoản/vai trò; liên kết tài khoản với hồ sơ độc giả và nhân viên.
- [ ] Thay tài khoản mẫu bằng dịch vụ xác thực hoặc ASP.NET Core Identity; hỗ trợ đăng nhập bằng username/email thật.
- [ ] Lưu và kiểm tra mật khẩu bằng password hash; bỏ mật khẩu demo viết trực tiếp trong controller.
- [ ] Kiểm tra trạng thái tài khoản bị khóa/ngừng hoạt động.
- [ ] Thêm `[Authorize]`, role/policy cho controller, action và API; kiểm tra quyền và phạm vi dữ liệu ở backend.
- [ ] Giữ quyền lập phiếu mượn và xử lý trả sách cho Staff theo đặc tả; không tự cấp cho Admin chỉ vì có menu quản lý.
- [ ] Triển khai cấp tài khoản, đổi mật khẩu, quên/đặt lại mật khẩu; hiện chỉ có hướng dẫn liên hệ thủ thư.
- [ ] Giới hạn số lần thử đăng nhập, khóa tạm thời và ghi nhật ký phù hợp.
- [ ] Thu hồi phiên khi tài khoản bị khóa, đổi mật khẩu hoặc thay đổi quyền.
- [ ] Lấy thẻ, sách đang mượn, lịch sử và tiền phạt theo ID người dùng hiện tại.
- [ ] Cấu hình cookie `Secure` qua HTTPS và lưu/chia sẻ khóa Data Protection phù hợp khi triển khai máy chủ.

---

## 🗂️ Các màn hình đang chuẩn bị triển khai

| Màn hình | Đường dẫn | Trạng thái |
| :--- | :--- | :--- |
| Trang chủ & Tra cứu, chi tiết sách trong modal | `/` | Có giao diện React và dữ liệu mẫu |
| Đăng nhập | `/Account/Login` | Có giao diện và xác thực demo |
| Tài khoản độc giả | `/Reader/Account?tab=profile` | Trang khung, tab `profile`, `loans`, `history`, `reservations` |
| Quản lý sách | `/Staff/Books` | Trang khung |
| Quản lý độc giả & Thẻ | `/Staff/Readers` | Trang khung |
| Mượn trả sách | `/Staff/Circulation?tab=list` | Trang khung, tab `list`, `borrow`, `return` |
| Thống kê & Báo cáo | `/Admin/Reports?tab=overview` | Trang khung, tab `overview`, `circulation`, `overdue`, `fines` |
| Nhân viên & Phân quyền | `/Admin/Users` | Trang khung |
| Cấu hình hệ thống | `/Admin/Settings` | Trang khung |

Các màn hình gộp dùng query parameter `tab` để tải lại và dùng Back/Forward vẫn giữ mục đang mở. Các trang Staff/Admin dùng `_LayoutAdmin.cshtml` với sidebar. Giới thiệu và Nội quy hiện nằm ở footer, chưa tách trang riêng.

## 🎨 Quy tắc thiết kế: The Living Colophon

| Vai trò | Quy ước |
| :--- | :--- |
| Nền chính / bề mặt phụ | `#F4F1EA` / `#E8E3D8`, không dùng nền trắng tinh |
| Đường kẻ | `1px solid #D2CBB8`, ưu tiên góc vuông |
| Mực chính / chú thích | `#141413` / `#5C5954` |
| Active / hết sách | `#8C2D19` |
| Dấu còn sách / liên kết / tọa độ kệ | `#1E3A5F` |
| Tiêu đề và tên sách | Newsreader (`font-serif`), tracking chặt, leading sát |
| Dữ liệu lưu trữ | IBM Plex Mono (`font-mono`), `tabular-nums`, uppercase, tracking rộng, cỡ 12px |
| Menu, nút, form và mô tả | Inter (`font-sans`) |

Font được tải chung trong `_Layout.cshtml`. CSS của Razor và theme Tailwind trong `ClientApp/src/index.css` dùng cùng hệ chữ.

---

## 🧩 3. Hướng dẫn Phát triển Component React mới

### Bước 1: Tạo Component mới
Tạo một file `.tsx` trong thư mục `QuanLyThuVien/ClientApp/src/components/`, ví dụ `UserCard.tsx`:

```tsx
import React from 'react';

interface UserCardProps {
  fullName: string;
  role?: string;
  borrowedCount?: number;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  fullName, 
  role = 'Độc giả', 
  borrowedCount = 0 
}) => {
  return (
    <div className="card shadow-sm border p-3">
      <h5 className="text-primary mb-1">{fullName}</h5>
      <span className="badge bg-secondary mb-2 align-self-start">{role}</span>
      <p className="text-muted mb-0">Số sách đang mượn: <strong>{borrowedCount}</strong></p>
    </div>
  );
};

export default UserCard;
```

### Bước 2: Đăng ký Component vào Registry
Mở file `QuanLyThuVien/ClientApp/src/main.tsx` và thêm component vào `componentRegistry`:

```tsx
import BookCatalog from './components/BookCatalog';
import UserCard from './components/UserCard'; // 1. Import component mới

const componentRegistry: Record<string, React.ComponentType<any>> = {
  BookCatalog,
  UserCard, // 2. Đăng ký tại đây
};
```

### Bước 3: Nhúng vào Razor View (`.cshtml`)
Mở bất kỳ file Razor View nào (ví dụ `Views/Home/Index.cshtml`) và thêm thẻ HTML:

```html
<div data-react-component="UserCard" 
     data-props='{"fullName": "Nguyễn Văn A", "role": "Thủ thư", "borrowedCount": 3}'>
</div>
```

---

## 🔄 4. Truyền dữ liệu từ C# Controller sang React Component

Để truyền dữ liệu từ C# Model sang React Component, bạn có thể chuyển đổi Model thành JSON:

**Trong Controller (`Controllers/HomeController.cs`):**
```csharp
public IActionResult Index()
{
    var books = new List<Book>
    {
        new Book { Id = 1, Title = "Lập trình C# căn bản", Author = "Microsoft" },
        new Book { Id = 2, Title = "React & TypeScript Thực chiến", Author = "Meta" }
    };

    return View(books);
}
```

**Trong Razor View (`Views/Home/Index.cshtml`):**
```html
@model IEnumerable<QuanLyThuVien.Models.Book>

@{
    var json = System.Text.Json.JsonSerializer.Serialize(new { initialBooks = Model },
        new System.Text.Json.JsonSerializerOptions
        {
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
        });
}
<div data-react-component="BookCatalog" data-props="@json"></div>
```

Razor sẽ encode JSON trong thuộc tính HTML; không dùng `Html.Raw` cho dữ liệu chèn trực tiếp vào thuộc tính. Đây là cách nhúng component qua registry; trang chủ hiện được mount riêng bằng `src/index.tsx`, không gắn thêm `data-react-component` lên cùng container để tránh mount hai lần.

---

## 📁 5. Cấu trúc thư mục dự án

```
QuanLyThuVien/
├── QuanLyThuVien.slnx               # Solution file của giải pháp .NET
├── README.md                        # Tài liệu hướng dẫn dự án
└── QuanLyThuVien/                   # Thư mục chính của dự án web
    ├── Controllers/                 # C# MVC Controllers (HomeController,...)
    ├── Models/                      # Các C# ViewModels / Entities
    ├── Views/                       # Razor Views (.cshtml)
    │   ├── Home/
    │   │   └── Index.cshtml         # Trang chủ tra cứu sách bằng React
    │   ├── Account/Login.cshtml     # Form đăng nhập và tài khoản xem thử
    │   ├── Reader/Account.cshtml    # Trang khung tài khoản độc giả
    │   ├── Staff/                  # Trang khung sách, độc giả, mượn trả
    │   ├── Admin/                  # Trang khung báo cáo, nhân viên, cấu hình
    │   └── Shared/
    │       ├── _Layout.cshtml       # Layout chính tích hợp _ViteScripts
    │       ├── _LayoutAdmin.cshtml  # Layout quản lý có sidebar
    │       ├── _PrimaryNavigation.cshtml # Navbar theo vai trò
    │       ├── _WorkspaceNavigation.cshtml # Sidebar quản lý
    │       └── _ViteScripts.cshtml  # Script loader thông minh (Dev HMR / Prod Bundle)
    ├── ClientApp/                   # Mã nguồn Frontend React (Vite + TypeScript)
    │   ├── src/
    │   │   ├── components/          # Thư mục chứa các React Components
    │   │   │   └── BookCatalog.tsx  # Tra cứu, danh mục và modal chi tiết sách
    │   │   ├── index.css            # Tailwind CSS v4 & Global CSS
    │   │   ├── main.tsx             # Registry & Auto-mount logic cho React
    │   │   └── index.tsx            # Mount BookCatalog ở trang chủ
    │   ├── package.json             # Cấu hình dependencies npm
    │   ├── tsconfig.json            # Cấu hình TypeScript
    │   └── vite.config.ts           # Cấu hình Vite build & output sang wwwroot/dist
    ├── Properties/
    │   └── launchSettings.json      # Cấu hình URL và cổng chạy khi Debug
    ├── wwwroot/                     # Tài nguyên tĩnh phục vụ web
    │   ├── dist/                    # Bundle thành phẩm do Vite sinh ra khi build
    │   │   ├── assets/
    │   │   │   ├── main.js
    │   │   │   ├── index.js
    │   │   │   └── index.css
    │   │   └── .vite/manifest.json
    │   ├── css/
    │   └── js/
    ├── appsettings.json             # Cấu hình hệ thống
    ├── appsettings.Development.json # Cấu hình Vite Dev Server URL & Mode
    ├── Program.cs                   # Điểm khởi chạy của ứng dụng ASP.NET Core
    └── QuanLyThuVien.csproj         # File cấu hình dự án .NET & script tự build Vite
```

---

## 📦 6. Đóng gói & Triển khai (Publish)

File cấu hình `QuanLyThuVien.csproj` đã được tích hợp sẵn target `PublishRunVite`. Khi bạn thực hiện lệnh publish:

```bash
dotnet publish -c Release -o ./publish
```

Hệ thống sẽ tự động:
1. Chạy `npm install` trong thư mục `ClientApp`.
2. Chạy `npm run build` để sinh ra file bundle tối ưu vào `wwwroot/dist`.
3. Đóng gói toàn bộ ứng dụng ASP.NET Core cùng các file tĩnh vào thư mục `./publish`.

---

## ❓ 7. Xử lý sự cố thường gặp (Troubleshooting)

- **Lỗi chứng chỉ HTTPS trên môi trường Local:**
  ```bash
  dotnet dev-certs https --trust
  ```
- **React Component không hiển thị hoặc báo spinner loading liên tục:**
  - Hãy kiểm tra xem bạn đã chạy `npm run dev` trong thư mục `ClientApp` chưa (nếu ở chế độ Development).
  - Hoặc chạy `npm run build` để sinh bundle tĩnh.
  - Kiểm tra Console trình duyệt (F12) xem có báo lỗi thiếu component trong registry của `main.tsx` không.
- **Port 5173 bị chiếm dụng:**
  - Nếu port 5173 bị chương trình khác sử dụng, bạn có thể thay đổi port trong file `ClientApp/vite.config.ts` và cập nhật tương ứng tại `QuanLyThuVien/appsettings.Development.json`.
