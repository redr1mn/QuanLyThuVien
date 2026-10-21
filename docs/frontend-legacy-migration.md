# Chuyển giao diện từ qlthuvien_old

Nguồn tham chiếu: `C:/Users/Legion/Documents/qlthuvien_old/QuanLyThuVien/`.

## Phần được chuyển trực tiếp

| Frontend cũ | Frontend React hiện tại | Cách chuyển |
|---|---|---|
| `ClientApp/src/components/BookCatalog.tsx` | `frontend/src/features/catalog/components/BookCatalog.tsx` | Giữ markup bìa sách, lưới ấn bản, gáy sách/sổ cái, sidebar và hồ sơ chi tiết. Tách dữ liệu/handler ra `CatalogPage` để gọi API. |
| `wwwroot/css/library-shell.css` | `frontend/src/styles/library-shell.css` | Sao chép nguyên file. |
| `ClientApp/src/components/workspace.css` | `frontend/src/styles/workspace.css` | Sao chép nguyên file. |
| `wwwroot/css/login.css` | `frontend/src/styles/login.css` | Sao chép nguyên file. |
| `Views/Shared/_Layout.cshtml`, `_PrimaryNavigation.cshtml` | `frontend/src/app/layouts/LibraryShell.tsx` | Chuyển header, logo SVG, menu phân quyền và footer sang React. |
| `Views/Shared/_LayoutAdmin.cshtml`, `_WorkspaceNavigation.cshtml` | `frontend/src/app/layouts/AuthenticatedLayout.tsx` | Khôi phục sidebar chức năng, không dùng sidebar editorial tự dựng ở lượt trước. |
| `Views/Account/Login.cshtml` | `frontend/src/app/layouts/AuthFrame.tsx`, `frontend/src/pages/auth/LoginPage.tsx` | Khôi phục bố cục hai cột, hình gáy sách SVG, lời giới thiệu và form đăng nhập. |
| `Workspace.tsx` và các view Staff/Reader/Admin | Các feature pages, `WorkspacePage.tsx`, `LoanLedger.tsx` | Giữ bố cục metrics, bảng, dialog, thẻ, tab query string, in và CSV; tách nghiệp vụ theo module. |

SHA-256 đối chiếu ba file CSS gốc và bản sao tại thời điểm chuyển:

- `library-shell.css`: `9066BF03DF1C07F2B6DBBACA0FD1E05A7A546CECDE7040BE70A95F19CED2EFC4`
- `workspace.css`: `255A65508E0C017F3DAC301A633ECD12DA656A25B80DCF8D4FFEEB58F422D4EB`
- `login.css`: `C4468595E61BE41290AC1F215CDA7E18E4998DAF8CFE7970ED33B4D5ADFAF8D8`

`legacy-adapters.css` chỉ điều chỉnh phần tương thích React, điều hướng không phụ thuộc Bootstrap JavaScript, dialog native và các form mới. Không sửa ba file CSS sao chép ở trên.

## Những khác biệt có chủ đích để khớp backend

- Không chuyển mock inventory, `workspace-data.ts`, localStorage hoặc giao dịch mô phỏng. Dữ liệu và mutation đi qua Axios/cookie/Zustand.
- Bản sao có barcode, kệ và trạng thái riêng. Danh sách đầu sách không trả tọa độ kệ: lưới hiển thị mã hồ sơ; tọa độ thật nằm trong hồ sơ chi tiết/bảng bản sao.
- Tạo/sửa sách và nhập bản sao là hai thao tác. Không có nút xóa đầu sách vì backend không cung cấp endpoint này.
- Độc giả không có ngày sinh; dùng `cardNumber`, trạng thái Active/Suspended/Expired và hạn thẻ. Sửa/gia hạn/khóa đều gọi PUT hồ sơ.
- Mượn theo copyIds, chỉ chọn Available, tối đa 7 ngày. Trả toàn bộ bản sao của phiếu với Normal/Damaged/Lost; tiền phạt do API trả về.
- Reader nhận hướng dẫn mượn tại quầy; chỉ Staff/Admin lập phiếu. Đặt trước và hủy đặt trước dùng API thật.
- Tab cá nhân giữ thẻ và thông tin liên hệ ở chế độ đọc: chưa có API cho Reader tự sửa hồ sơ/đổi mật khẩu.
- Chỉ số số bản in và các phân bố không có endpoint tổng hợp được ghi rõ phạm vi trang hiện tại. Bộ lọc NXB, bảng độc giả tích cực, biểu đồ theo tháng và cấu hình hệ thống không được dựng dữ liệu thay thế.
- Báo cáo mượn/trả và top sách dùng overview theo kỳ. Quá hạn là danh sách hiện tại. Tab tiền phạt không khẳng định tổng tiền đã thu vì chưa có API thu phạt theo kỳ.
- CSV bảng phân trang ghi rõ chỉ xuất trang hiện tại; CSV báo cáo xuất các số liệu overview thực sự trả về.
- Không chuyển tài khoản demo hoặc mật khẩu mẫu của bản Razor cũ.

## Kiểm tra

`npm test`, `npm run typecheck`, `npm run build` trong `frontend/`.

Kiểm thử `legacy-catalog.test.mjs` render component production với fixture chỉ nằm trong test để kiểm tra bìa, sidebar, chế độ xem, hồ sơ chi tiết và trạng thái lỗi. Không có fixture nào được import vào ứng dụng.

Kiểm tra trình duyệt thực hiện được với catalog và đăng nhập. Cần backend cổng 5194, SQL Server đã cấu hình và tài khoản có quyền để kiểm thử end-to-end các trang nghiệp vụ; không nới route guard để xem trước.
