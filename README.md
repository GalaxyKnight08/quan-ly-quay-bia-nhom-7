# quan-ly-quay-bia-nhom-7

## Chạy ứng dụng

Yêu cầu Node.js 18 trở lên. Giao diện được viết bằng React 19 và TypeScript.

```sh
npm install
npm run dev
```

Mở URL Vite hiển thị trong terminal. Trang đăng nhập nằm ở `/`, dashboard ở `/dashboard.html`.

Chạy `npm run typecheck` để kiểm tra kiểu. `npm run build` tự chạy type-check trước khi build production.

Tài khoản demo:

- Nhân viên: `lan@biahoi.vn` hoặc `minh@biahoi.vn` / `123456`
- Quản lý ca: `hung@biahoi.vn` / `123456`
- Chủ quán: `hoa@biahoi.vn` / `123456`
- Tài khoản đã khóa: `khoa@biahoi.vn`

Ứng dụng hiện dùng `localStorage` cho phiên đăng nhập và dữ liệu giao diện demo; dữ liệu chưa đồng bộ giữa nhiều thiết bị và chưa kết nối API backend. Chạy `npm run build` để tạo bản production đa trang trong `dist/`.

## Giao diện theo SRS

Sau khi đăng nhập, các màn hình được đăng ký theo phân hệ trong `assets/js/modules`: Quầy (FR-02–10), Quản trị (FR-11–15) và Báo cáo (FR-16–19). Vai trò và quyền của từng chức năng được khai báo tại `utils/permissions.ts`; menu chỉ hiện chức năng được phép và bộ nạp module kiểm tra quyền lần nữa trước khi hiển thị nội dung. Ví dụ, Quản lý ca xem tổng quan/ngày và nhật ký hủy giảm, còn hao hụt keg, món bán chạy và các cấu hình quản trị chỉ dành cho Chủ quán.

Đây là prototype giao diện với dữ liệu minh họa. Kiểm tra quyền ở frontend chỉ phục vụ giao diện, không thay thế kiểm tra quyền ở backend; đăng nhập/phân quyền API, lưu lịch sử, đồng bộ đa thiết bị, VietQR thật, nhật ký kiểm toán và nghiệp vụ kho cần được nối với API trước khi nghiệm thu.