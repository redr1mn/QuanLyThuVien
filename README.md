# 📚 Hệ Thống Quản Lý Thư Viện (QuanLyThuVien)

Dự án Web Quản Lý Thư Viện được xây dựng theo mô hình kiến trúc **Hybrid Web Application**: kết hợp nền tảng **ASP.NET Core 10.0 MVC** (Backend, Routing, Razor Views) với **React 18 + TypeScript + Vite + Tailwind CSS v4** (Interactive UI Widgets).

---

## 🌟 Điểm nổi bật về kiến trúc (Hybrid Model)

- **Kết hợp linh hoạt**: Giữ nguyên toàn bộ cấu trúc định tuyến, Controller, Razor Views và Authentication của ASP.NET Core MVC, đồng thời nhúng các React Components tương tác cao vào bất kỳ trang `.cshtml` nào.
- **Hot Module Replacement (HMR)**: Sử dụng Vite Dev Server cho phép cập nhật tức thì giao diện React và CSS khi code mà không cần tải lại toàn bộ trang.
- **Tự động Mount**: Chỉ cần gắn thuộc tính `data-react-component="TênComponent"` và `data-props='{...}'` vào bất kỳ thẻ HTML nào, component sẽ tự khởi tạo.
- **Production-Ready**: Cơ chế tự động phát hiện thông minh (`_ViteScripts.cshtml`) — tự động chuyển sang bundle tĩnh trong `wwwroot/dist/` khi chạy Production hoặc khi không bật Vite Dev Server.
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
  dotnet run
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
   *Vite sẽ biên dịch TypeScript và tối ưu bundle vào thư mục `wwwroot/dist/assets/main.js` và `main.css`.*

2. **Chạy ASP.NET Core:**
   ```bash
   dotnet run
   ```
   *Hệ thống sẽ tự động nhận diện file bundle tĩnh trong `wwwroot/dist` và phục vụ mà không cần bật server Vite.*

> **Mẹo**: Bạn cũng có thể cấu hình ép buộc dùng bundle tĩnh trong `appsettings.Development.json` bằng cách đổi `"DevServer": false`.

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
import Counter from './components/Counter';
import BookManager from './components/BookManager';
import UserCard from './components/UserCard'; // 1. Import component mới

const componentRegistry: Record<string, React.ComponentType<any>> = {
  Counter,
  BookManager,
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

<div data-react-component="BookManager" 
     data-props='{"initialBooks": @Html.Raw(System.Text.Json.JsonSerializer.Serialize(Model))}'>
</div>
```

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
    │   │   └── Index.cshtml         # Trang chủ demo nhúng React Components
    │   └── Shared/
    │       ├── _Layout.cshtml       # Layout chính tích hợp _ViteScripts
    │       └── _ViteScripts.cshtml  # Script loader thông minh (Dev HMR / Prod Bundle)
    ├── ClientApp/                   # Mã nguồn Frontend React (Vite + TypeScript)
    │   ├── src/
    │   │   ├── components/          # Thư mục chứa các React Components
    │   │   │   ├── BookManager.tsx  # Widget quản lý sách demo
    │   │   │   └── Counter.tsx      # Widget bộ đếm demo
    │   │   ├── index.css            # Tailwind CSS v4 & Global CSS
    │   │   └── main.tsx             # Entry point & Auto-mount logic cho React
    │   ├── package.json             # Cấu hình dependencies npm
    │   ├── tsconfig.json            # Cấu hình TypeScript
    │   └── vite.config.ts           # Cấu hình Vite build & output sang wwwroot/dist
    ├── Properties/
    │   └── launchSettings.json      # Cấu hình URL và cổng chạy khi Debug
    ├── wwwroot/                     # Tài nguyên tĩnh phục vụ web
    │   ├── dist/                    # Bundle thành phẩm do Vite sinh ra khi build
    │   │   ├── assets/
    │   │   │   ├── main.js
    │   │   │   └── main.css
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
