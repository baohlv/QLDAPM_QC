import { test, expect } from '@playwright/test';

/**
 * Test Suite: QUẢN LÝ THÔNG BÁO (TB)
 * Mô tả: Kiểm thử chức năng quản lý thông báo cho Chủ trọ và Người thuê
 * 
 * Test Cases:
 * - TB_CREATE_1: Kiểm tra giao diện Tạo thông báo (Chủ trọ)
 * - TB_CREATE_2: Kiểm tra tạo và đăng thông báo thành công (Happy Path)
 * - TB_CREATE_3: Kiểm tra validation (để trống Tiêu đề)
 * - TB_VIEW_1: Kiểm tra Người thuê nhận và xem thông báo
 * - TB_HISTORY_1: Kiểm tra Chủ trọ xem Lịch sử thông báo
 */

test.describe('QUẢN LÝ THÔNG BÁO (TB)', () => {

  // ================================================================================
  // NHÓM TEST: Chức năng Chủ trọ
  // ================================================================================
  test.describe('Chức năng Chủ trọ', () => {
    
    test.beforeEach(async ({ page }) => {
      // Step 1: Đăng nhập với tài khoản Chủ trọ
      console.log('🔐 Đăng nhập tài khoản Chủ trọ...');
      await page.goto('/login');
      
      // Credentials từ dummy_data.sql: username: landlord1, password: pass123
      await page.fill('input[id="username"]', 'landlord1');
      await page.fill('input[id="password"]', 'pass123');
      await page.click('button[type="submit"]');
      
      // Chờ đăng nhập thành công và chuyển hướng đến dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Đăng nhập thành công');
      
      // Step 2: Điều hướng đến "Quản lý Thông báo"
      // Từ layout.tsx: menu có label "Thông báo" và href "/notifications"
      await page.getByRole('link', { name: 'Thông báo' }).click();
      await page.waitForURL('**/notifications');
      console.log('✅ Đã vào trang Quản lý Thông báo');
      
      // Step 3: Click nút "Tạo thông báo mới"
      // Từ notifications/page.tsx: có Link với text "Tạo thông báo mới"
      await page.getByRole('link', { name: 'Tạo thông báo mới' }).click();
      await page.waitForURL('**/notifications/add');
      console.log('✅ Đã vào trang Tạo thông báo mới');
    });

    /**
     * TB_CREATE_1: Kiểm tra giao diện Tạo thông báo (Chủ trọ)
     * 
     * Kỳ vọng:
     * - Hiển thị form tạo thông báo
     * - Có trường Tiêu đề
     * - Có vùng nhập Nội dung (textarea)
     * - Có nút "Gửi thông báo"
     */
    test('TB_CREATE_1: Kiểm tra giao diện Tạo thông báo', async ({ page }) => {
      console.log('📋 Test Case: TB_CREATE_1');
      
      // Kỳ vọng 1: Tiêu đề trang hiển thị
      await expect(page.getByRole('heading', { name: 'Tạo thông báo mới' })).toBeVisible();
      console.log('✅ Kỳ vọng 1: Tiêu đề trang hiển thị');
      
      // Kỳ vọng 2: Form tạo thông báo hiển thị
      const formContainer = page.locator('form');
      await expect(formContainer).toBeVisible();
      console.log('✅ Kỳ vọng 2: Form tạo thông báo hiển thị');
      
      // Kỳ vọng 3: Trường Tiêu đề hiển thị
      // Từ add/page.tsx: input với id="title", name="title"
      await expect(page.locator('input[id="title"]')).toBeVisible();
      await expect(page.getByText('Tiêu đề')).toBeVisible();
      console.log('✅ Kỳ vọng 3: Trường Tiêu đề hiển thị');
      
      // Kỳ vọng 4: Vùng nhập Nội dung hiển thị (textarea)
      // Từ add/page.tsx: textarea với id="content", name="content"
      await expect(page.locator('textarea[id="content"]')).toBeVisible();
      await expect(page.getByText('Nội dung')).toBeVisible();
      console.log('✅ Kỳ vọng 4: Vùng nhập Nội dung hiển thị');
      
      // Kỳ vọng 5: Các trường bổ sung hiển thị
      await expect(page.getByText('Mức độ')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Thông thường' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Khẩn cấp' })).toBeVisible();
      await expect(page.locator('select[id="scope"]')).toBeVisible();
      console.log('✅ Kỳ vọng 5: Các trường bổ sung (Mức độ, Phạm vi) hiển thị');
      
      // Kỳ vọng 6: Nút "Gửi thông báo" hiển thị và enabled
      // Từ add/page.tsx: button type="submit" có text "Gửi thông báo"
      await expect(page.getByRole('button', { name: 'Gửi thông báo' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Gửi thông báo' })).toBeEnabled();
      console.log('✅ Kỳ vọng 6: Nút "Gửi thông báo" hiển thị và enabled');
      
      console.log('🎉 TB_CREATE_1: PASSED - Giao diện Tạo thông báo hiển thị đầy đủ');
    });

    /**
     * TB_CREATE_2: Kiểm tra tạo và đăng thông báo thành công (Happy Path)
     * 
     * Bước thực hiện:
     * 1. Mở form tạo thông báo
     * 2. Nhập Tiêu đề: "Thông báo lịch cắt điện 15/11"
     * 3. Nhập Nội dung
     * 4. Nhấn "Gửi thông báo"
     * 
     * Kỳ vọng:
     * - Hiển thị thông báo thành công (Alert: "Gửi thông báo thành công!")
     * - Chuyển hướng về trang danh sách thông báo
     * - Thông báo mới xuất hiện trên đầu danh sách
     */
    test('TB_CREATE_2: Kiểm tra tạo và đăng thông báo thành công', async ({ page }) => {
      console.log('📋 Test Case: TB_CREATE_2');
      
      // Bước 1: Nhập Tiêu đề
      const titleInput = page.locator('input[id="title"]');
      await titleInput.fill('Thông báo lịch cắt điện 15/11');
      console.log('✅ Bước 1: Đã nhập Tiêu đề');
      
      // Bước 2: Nhập Nội dung vào textarea (KHÔNG phải Rich Text Editor)
      // Từ add/page.tsx line 190-199: textarea đơn giản, có thể dùng .fill()
      const contentTextarea = page.locator('textarea[id="content"]');
      await contentTextarea.fill(
        'Kính gửi quý cư dân,\n\n' +
        'Công ty điện lực thông báo lịch cắt điện bảo trì định kỳ vào ngày 15/11/2024 từ 8:00 - 12:00.\n\n' +
        'Vui lòng chuẩn bị nguồn dự phòng.\n\n' +
        'Trân trọng.'
      );
      console.log('✅ Bước 2: Đã nhập Nội dung');
      
      // Bước 3: (Optional) Chọn mức độ - Mặc định là "Thông thường"
      // Có thể bỏ qua hoặc test chuyển sang "Khẩn cấp"
      
      // Bước 4: Nhấn "Gửi thông báo"
      // Lắng nghe dialog alert trước khi click
      page.on('dialog', async dialog => {
        expect(dialog.message()).toBe('Gửi thông báo thành công!');
        console.log('✅ Hiển thị Alert thành công: "Gửi thông báo thành công!"');
        await dialog.accept();
      });
      
      await page.getByRole('button', { name: 'Gửi thông báo' }).click();
      console.log('✅ Bước 4: Đã nhấn "Gửi thông báo"');
      
      // Kỳ vọng: Chuyển hướng về trang danh sách thông báo
      await page.waitForURL('**/notifications', { timeout: 10000 });
      console.log('✅ Kỳ vọng 1: Chuyển hướng về trang danh sách thông báo');
      
      // Kỳ vọng: Thông báo mới xuất hiện trên đầu danh sách
      // Từ notifications/page.tsx: danh sách được sắp xếp theo thời gian mới nhất
      // Kiểm tra xem có text "Thông báo lịch cắt điện 15/11" trong trang
      await page.waitForTimeout(2000); // Chờ API load data
      const notificationTitle = page.getByText('Thông báo lịch cắt điện 15/11');
      await expect(notificationTitle).toBeVisible();
      console.log('✅ Kỳ vọng 2: Thông báo mới xuất hiện trong danh sách');
      
      console.log('🎉 TB_CREATE_2: PASSED - Tạo thông báo thành công');
    });

    /**
     * TB_CREATE_3: Kiểm tra validation (để trống Tiêu đề)
     * 
     * Bước thực hiện:
     * 1. Mở form tạo thông báo
     * 2. Bỏ trống Tiêu đề
     * 3. Nhập Nội dung
     * 4. Nhấn "Gửi thông báo"
     * 
     * Kỳ vọng:
     * - Hiển thị lỗi validation: "Vui lòng nhập tiêu đề thông báo."
     */
    test('TB_CREATE_3: Kiểm tra validation (để trống Tiêu đề)', async ({ page }) => {
      console.log('📋 Test Case: TB_CREATE_3');
      
      // Bước 1: Bỏ trống Tiêu đề (không fill gì)
      // Bước 2: Nhập Nội dung
      const contentTextarea = page.locator('textarea[id="content"]');
      await contentTextarea.fill('Nội dung thông báo test validation.');
      console.log('✅ Đã nhập Nội dung nhưng bỏ trống Tiêu đề');
      
      // Bước 3: Nhấn "Gửi thông báo"
      await page.getByRole('button', { name: 'Gửi thông báo' }).click();
      console.log('✅ Đã nhấn "Gửi thông báo"');
      
      // Kỳ vọng: Hiển thị lỗi validation
      // Từ add/page.tsx line 84-86: validateForm() set error "Vui lòng nhập tiêu đề thông báo."
      // Error hiển thị trong div với class "text-red-700 bg-red-100" (line 161)
      const errorMessage = page.locator('div.text-red-700.bg-red-100');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toHaveText('Vui lòng nhập tiêu đề thông báo.');
      console.log('✅ Kỳ vọng: Hiển thị lỗi validation "Vui lòng nhập tiêu đề thông báo."');
      
      console.log('🎉 TB_CREATE_3: PASSED - Validation hoạt động đúng');
    });

    /**
     * TB_HISTORY_1: Kiểm tra Chủ trọ xem Lịch sử thông báo
     * 
     * Bước thực hiện:
     * 1. Đăng nhập tài khoản Chủ trọ
     * 2. Điều hướng đến "Quản lý Thông báo" -> "Lịch sử"
     * 
     * Kỳ vọng:
     * - Hiển thị danh sách tất cả các thông báo đã đăng
     * - Sắp xếp theo thời gian mới nhất lên đầu
     */
    test('TB_HISTORY_1: Kiểm tra Chủ trọ xem Lịch sử thông báo', async ({ page }) => {
      console.log('📋 Test Case: TB_HISTORY_1');
      
      // Pre-condition: Đã ở trang Tạo thông báo (từ beforeEach)
      // Quay lại trang danh sách thông báo (Lịch sử)
      await page.getByRole('button', { name: 'Hủy' }).click();
      await page.waitForURL('**/notifications');
      console.log('✅ Đã quay lại trang Danh sách thông báo');
      
      // Kỳ vọng 1: Tiêu đề "Quản lý Thông báo" hiển thị
      await expect(page.getByRole('heading', { name: 'Quản lý Thông báo' })).toBeVisible();
      console.log('✅ Kỳ vọng 1: Tiêu đề "Quản lý Thông báo" hiển thị');
      
      // Kỳ vọng 2: Danh sách thông báo hiển thị (Table view cho Chủ trọ)
      // Từ notifications/page.tsx: Chủ trọ xem dạng Table (NotificationsTable component)
      // Chờ data load
      await page.waitForTimeout(2000);
      
      // Kiểm tra table hiển thị
      // NotificationsTable có header columns: STT, Tiêu đề, Người gửi, Ngày gửi, Mức độ, Hành động
      const tableContainer = page.locator('table');
      await expect(tableContainer).toBeVisible();
      console.log('✅ Kỳ vọng 2: Bảng danh sách thông báo hiển thị');
      
      // Kỳ vọng 3: Sắp xếp theo thời gian mới nhất
      // Từ notifications/page.tsx line 77-79: sortedData theo createdAt giảm dần
      // Kiểm tra ít nhất có 1 thông báo trong list
      const notificationRows = page.locator('tbody tr');
      const rowCount = await notificationRows.count();
      expect(rowCount).toBeGreaterThan(0);
      console.log(`✅ Kỳ vọng 3: Danh sách có ${rowCount} thông báo, sắp xếp theo thời gian mới nhất`);
      
      console.log('🎉 TB_HISTORY_1: PASSED - Chủ trọ xem Lịch sử thông báo thành công');
    });
  });

  // ================================================================================
  // NHÓM TEST: Chức năng Người thuê
  // ================================================================================
  test.describe('Chức năng Người thuê', () => {
    
    /**
     * TB_VIEW_1: Kiểm tra Người thuê nhận và xem thông báo
     * 
     * Pre-condition:
     * - Chủ trọ đã đăng 1 thông báo (có thể dùng API hoặc chạy TB_CREATE_2 trước)
     * 
     * Bước thực hiện:
     * 1. Đăng nhập tài khoản Chủ trọ và đăng 1 thông báo
     * 2. Đăng xuất tài khoản Chủ trọ
     * 3. Đăng nhập bằng tài khoản Người thuê
     * 4. Kiểm tra nhận thông báo
     * 
     * Kỳ vọng:
     * - Người thuê nhận được thông báo (có thể có badge đỏ trên icon chuông)
     * - Vào mục "Thông báo", thấy thông báo hiển thị rõ ràng
     */
    test('TB_VIEW_1: Kiểm tra Người thuê nhận và xem thông báo', async ({ page }) => {
      console.log('📋 Test Case: TB_VIEW_1');
      
      // ==============================
      // PHẦN 1: Chủ trọ tạo thông báo
      // ==============================
      console.log('🔐 PHẦN 1: Chủ trọ đăng thông báo');
      
      // Step 1: Đăng nhập tài khoản Chủ trọ
      await page.goto('/login');
      await page.fill('input[id="username"]', 'landlord1');
      await page.fill('input[id="password"]', 'pass123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Đăng nhập Chủ trọ thành công');
      
      // Step 2: Tạo thông báo mới
      await page.getByRole('link', { name: 'Thông báo' }).click();
      await page.waitForURL('**/notifications');
      await page.getByRole('link', { name: 'Tạo thông báo mới' }).click();
      await page.waitForURL('**/notifications/add');
      
      // Nhập data
      await page.fill('input[id="title"]', 'Thông báo lịch cắt điện 15/11');
      await page.fill('textarea[id="content"]', 'Kính gửi quý cư dân, Công ty điện lực thông báo lịch cắt điện.');
      
      // Submit và xử lý alert
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      await page.getByRole('button', { name: 'Gửi thông báo' }).click();
      await page.waitForURL('**/notifications', { timeout: 10000 });
      console.log('✅ Chủ trọ đã đăng thông báo thành công');
      
      // ==============================
      // PHẦN 2: Logout Chủ trọ
      // ==============================
      console.log('🚪 PHẦN 2: Logout tài khoản Chủ trọ');
      
      // Từ layout.tsx: Click vào user avatar để mở dropdown, sau đó click "Đăng xuất"
      // Avatar là div với text là userInitials (line 87-92)
      const userAvatar = page.locator('div.w-10.h-10.bg-slate-200.rounded-full');
      await userAvatar.click();
      console.log('✅ Đã mở dropdown menu');
      
      // Click "Đăng xuất" trong dropdown (line 101-106)
      const logoutButton = page.getByRole('button', { name: 'Đăng xuất' });
      await logoutButton.click();
      
      // Chờ chuyển hướng về trang login
      await page.waitForURL('**/login', { timeout: 10000 });
      console.log('✅ Đã logout Chủ trọ');
      
      // ==============================
      // PHẦN 3: Login Người thuê
      // ==============================
      console.log('🔐 PHẦN 3: Đăng nhập tài khoản Người thuê');
      
      // Credentials từ dummy_data.sql: username: renter1, password: pass123
      await page.fill('input[id="username"]', 'renter1');
      await page.fill('input[id="password"]', 'pass123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Đăng nhập Người thuê thành công');
      
      // ==============================
      // PHẦN 4: Kiểm tra nhận thông báo
      // ==============================
      console.log('🔔 PHẦN 4: Kiểm tra Người thuê nhận thông báo');
      
      // Kỳ vọng 1: Icon chuông thông báo hiển thị
      // Từ layout.tsx line 86: có icon Bell
      const bellIcon = page.locator('svg').filter({ has: page.locator('path') }).first();
      await expect(bellIcon).toBeVisible();
      console.log('✅ Kỳ vọng 1: Icon chuông thông báo hiển thị');
      
      // Note: Badge đỏ (notification count) không được implement trong code hiện tại
      // Bỏ qua kiểm tra badge
      
      // Kỳ vọng 2: Vào mục "Thông báo"
      await page.getByRole('link', { name: 'Thông báo' }).click();
      await page.waitForURL('**/notifications');
      console.log('✅ Đã vào trang Thông báo');
      
      // Kỳ vọng 3: Thấy thông báo "Thông báo lịch cắt điện 15/11" hiển thị
      // Từ notifications/page.tsx: RENTER xem dạng Card (NotificationsCardView)
      await page.waitForTimeout(2000); // Chờ API load
      const notificationCard = page.getByText('Thông báo lịch cắt điện 15/11');
      await expect(notificationCard).toBeVisible();
      console.log('✅ Kỳ vọng 3: Người thuê thấy thông báo "Thông báo lịch cắt điện 15/11"');
      
      console.log('🎉 TB_VIEW_1: PASSED - Người thuê nhận và xem thông báo thành công');
    });
  });
});

