# quan-ly-quay-bia-nhom-7

## Chạy ứng dụng

Yêu cầu Node.js 18 trở lên.

```sh
npm install
npm run dev
```

Mở URL Vite hiển thị trong terminal. Trang đăng nhập nằm ở `/`, dashboard ở `/dashboard.html`.

Tài khoản demo:

- Nhân viên: `nhanvien@quaybia.vn` / `123456`
- Quản lý: `quanly@quaybia.vn` / `123456`

Ứng dụng hiện dùng `localStorage` cho phiên đăng nhập và dữ liệu giao diện demo; dữ liệu chưa đồng bộ giữa nhiều thiết bị và chưa kết nối API backend. Chạy `npm run build` để tạo bản production đa trang trong `dist/`.