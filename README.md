# 🏠 Mini Apartment Management - Automation Tests

Bộ test automation sử dụng Playwright cho hệ thống quản lý căn hộ mini.

## 📋 Tổng Quan

Dự án này chứa các test automation kiểm thử các chức năng chính của hệ thống:
- **Authentication**: Đăng ký, Đăng nhập, Quản lý session.
- **Room Management**: Quản lý phòng, Phân trang.
- **Billing (Hóa Đơn)**: Tạo, Xem, Sửa, Xóa hóa đơn.
- **Payment (Thanh Toán)**: Xử lý thanh toán.
- **Reports (Báo Cáo)**: Công nợ.
- **RBAC**: Kiểm soát quyền truy cập.
- **Assets (Tài Sản)** & **Notifications (Thông Báo)**.
- **API Testing**: Kiểm thử trực tiếp các API endpoints.

## 🚀 Bắt Đầu Nhanh

### 1. Cài Đặt

Yêu cầu: Node.js >= 18.0.0

```bash
# Cài đặt dependencies
npm install

# Cài đặt Playwright browsers
npm run setup
```

### 2. Cấu Hình Môi Trường

Copy file `env.test` thành `.env` (nếu cần) và cập nhật thông tin:

```env
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
...
```

### 3. Chạy Tests

#### Chạy toàn bộ tests
```bash
npm test
```

#### Chạy theo chức năng (Modules)

| Chức năng | Lệnh | Mô tả |
|-----------|------|-------|
| **Auth** | `npm run test:auth` | Login, Register, Session |
| **Room Management** | `npm run test:room-management` | Quản lý phòng, Pagination |
| **Billing** | `npm run test:billing` | CRUD Hóa đơn (Điện/Nước/Dịch vụ) |
| **Payment** | `npm run test:billing:payment` | Chức năng thanh toán |
| **Reports** | `npm run test:billing:debt` | Báo cáo công nợ |
| **RBAC** | `npm run test:rabc` | Access Control (Admin/User/Tenant) |
| **API** | `npm run test:api` | API Endpoints (Auth, Rooms) |

#### Các chế độ chạy khác

```bash
# UI Mode (Giao diện trực quan của Playwright)
npm run test:ui

# Headed Mode (Mở trình duyệt khi chạy)
npm run test:headed

# Debug Mode
npm run test:debug
```

## 📁 Cấu Trúc Thư Mục Test (`tests/e2e`)

```
tests/e2e/
├── api/                # API Tests
├── auth/               # Login, Register
├── bao-cao/            # Reports (Công nợ)
├── dashboard/          # Dashboard UI
├── hoa-don/            # Quản lý hóa đơn (CRUD)
├── rbac/               # Role-Based Access Control
├── room-management/    # Quản lý phòng
├── tai-san/            # Quản lý tài sản
├── thanh-toan/         # Thanh toán hóa đơn
└── thong-bao/          # Quản lý thông báo
```

## 📊 Báo Cáo Kết Quả

Sau khi chạy test, bạn có thể xem báo cáo chi tiết:

```bash
# Mở báo cáo Playwright (HTML)
npm run report

# Tạo và mở báo cáo Allure (Đẹp hơn)
npm run report:allure
```

## 📝 Lưu ý phát triển

- **Page Objects**: Các file Page Object Model nằm trong thư mục `tests/pages/`.
- **Utils**: Các hàm hỗ trợ chung nằm trong `tests/utils/`.
- **Config**: `playwright.config.js` chứa cấu hình timeout, browser, base URL.

---
**Troubleshooting**:
- Nếu gặp lỗi liên quan đến browser, chạy lại: `npm run install:browsers`
- Đảm bảo server backend và frontend đang chạy trước khi start test.
- Kiểm tra file `.env` đã trỏ đúng PORT của server chưa.
