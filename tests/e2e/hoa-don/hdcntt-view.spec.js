import { test, expect } from '@playwright/test';

/**
 * Test Suite: Xem Danh Sách và Chi Tiết Hóa Đơn (HDCNTT-VIEW)
 * Mô tả: Kiểm thử chức năng xem danh sách và chi tiết hóa đơn điện nước
 */

test.describe('Bộ test case Xem Hóa Đơn (HDCNTT-VIEW)', () => {

  test.beforeEach(async ({ page }) => {
    // Step 1: Đăng nhập với tài khoản Chủ trọ
    await page.goto('/login');
    await page.fill('input[id="username"]', process.env.ADMIN_EMAIL);
    await page.fill('input[id="password"]', process.env.ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Chờ đăng nhập thành công và chuyển hướng
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Step 2: Điều hướng đến "Hóa đơn điện nước"
    await page.getByRole('link', { name: 'Quản lý Thanh toán' }).click();

    // Đảm bảo đã sang trang danh sách hóa đơn
    await expect(page.getByRole('heading', { name: 'Hóa đơn điện nước' })).toBeVisible();

    // Chờ table load xong
    await page.waitForSelector('table', { timeout: 10000 });
  });

  test('HDCNTT_VIEW_1: Kiểm tra hiển thị danh sách hóa đơn', async ({ page }) => {
    // Kỳ vọng 1: Kiểm tra bảng hóa đơn hiển thị
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Kỳ vọng 2: Kiểm tra các cột header của bảng
    // Dựa trên Billings_Table.tsx, các cột bao gồm:
    // STT, Mã hóa đơn, Phòng, Tháng, Số điện (kWh), Số nước (m³), 
    // Tiền điện, Tiền nước, Tổng tiền, Trạng thái, Hành động

    await expect(table.getByRole('columnheader', { name: 'STT' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Mã hóa đơn' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Phòng' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Tháng' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /Số điện/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /Số nước/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Tiền điện' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Tiền nước' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Tổng tiền' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Trạng thái' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Hành động' })).toBeVisible();

    await page.waitForTimeout(1000);
    console.log('✅ Tất cả các cột header hiển thị đúng');

    // Kỳ vọng 3: Kiểm tra có ít nhất 1 hàng dữ liệu trong tbody
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    await page.waitForTimeout(1000);
    console.log(`✅ Danh sách có ${rowCount} hóa đơn`);

    // Kỳ vọng 4: Kiểm tra màu sắc/icon phân biệt trạng thái
    // StatusBadge component có các class riêng cho từng trạng thái
    
    // Tìm badge trạng thái (có thể là "Đã thanh toán" hoặc "Chưa thanh toán")
    const statusBadges = page.locator('tbody tr span.inline-flex.items-center');
    const badgeCount = await statusBadges.count();
    expect(badgeCount).toBeGreaterThan(0);

    // Kiểm tra badge có chứa icon (dấu chấm tròn)
    const firstBadge = statusBadges.first();
    await expect(firstBadge).toBeVisible();
    
    // Kiểm tra có text trạng thái
    const badgeText = await firstBadge.textContent();
    expect(badgeText).toMatch(/(Đã thanh toán|Chưa thanh toán|Quá hạn|Đã hủy)/);

    await page.waitForTimeout(1000);
    console.log(`✅ Badge trạng thái hiển thị: ${badgeText}`);

    // Kiểm tra màu sắc phân biệt (dựa trên class CSS)
    // Đã thanh toán: text-emerald-700 bg-emerald-100
    // Chưa thanh toán: text-rose-700 bg-rose-100
    // Quá hạn: text-orange-700 bg-orange-100
    
    const paidBadges = page.locator('span.text-emerald-700');
    const unpaidBadges = page.locator('span.text-rose-700');
    const overdueBadges = page.locator('span.text-orange-700');
    
    const hasPaid = await paidBadges.count() > 0;
    const hasUnpaid = await unpaidBadges.count() > 0;
    const hasOverdue = await overdueBadges.count() > 0;

    // Ít nhất phải có một loại trạng thái
    expect(hasPaid || hasUnpaid || hasOverdue).toBe(true);

    if (hasPaid) console.log('✅ Có hóa đơn "Đã thanh toán" (màu xanh)');
    if (hasUnpaid) console.log('✅ Có hóa đơn "Chưa thanh toán" (màu đỏ)');
    if (hasOverdue) console.log('✅ Có hóa đơn "Quá hạn" (màu cam)');

    await page.waitForTimeout(1000);
    console.log('✅ HDCNTT_VIEW_1: Danh sách hóa đơn hiển thị đầy đủ và đúng định dạng');
  });

  // test('HDCNTT_VIEW_2: Kiểm tra xem chi tiết hóa đơn', async ({ page }) => {
  //   // 1. Lấy hàng đầu tiên trong danh sách
  //   const firstRow = page.locator('tbody tr').first();
  //   await expect(firstRow).toBeVisible();

  //   // Lấy thông tin hóa đơn từ hàng đầu tiên để verify sau
  //   const invoiceCode = await firstRow.locator('td').nth(1).textContent();
  //   const roomName = await firstRow.locator('td').nth(2).textContent();
    
  //   console.log(`Đang xem chi tiết hóa đơn: ${invoiceCode?.trim()} - Phòng: ${roomName?.trim()}`);

  //   // 2. Click vào hàng để xem chi tiết (toàn bộ hàng có cursor-pointer)
  //   await firstRow.click();

  //   // Kỳ vọng 1: Chuyển đến trang chi tiết hóa đơn
  //   // URL pattern: /billing/detail/[billing_code]
  //   await expect(page).toHaveURL(/.*\/billing\/detail\/.+/, { timeout: 10000 });

  //   // Kỳ vọng 2: Hiển thị heading "Thông tin hóa đơn"
  //   await expect(page.getByRole('heading', { name: 'Thông tin hóa đơn' })).toBeVisible();

  //   console.log('✅ Đã chuyển đến trang chi tiết hóa đơn');

  //   // Kỳ vọng 3: Hiển thị breadcrumb với "Quản lý hóa đơn" và "Chi tiết hóa đơn"
  //   await expect(page.getByText('Quản lý hóa đơn')).toBeVisible();
  //   await expect(page.getByText('Chi tiết hóa đơn')).toBeVisible();

  //   // Kỳ vọng 4: Hiển thị các thông tin chi tiết hóa đơn
  //   // Dựa trên component InfoItem trong page.tsx

  //   // Thông tin cơ bản
  //   await expect(page.getByText('Mã hóa đơn')).toBeVisible();
  //   await expect(page.getByText('Tháng/Năm')).toBeVisible();
  //   await expect(page.getByText('Ngày tạo')).toBeVisible();
  //   await expect(page.getByText('Mã phòng')).toBeVisible();
  //   await expect(page.getByText('Trạng thái')).toBeVisible();

  //   console.log('✅ Thông tin cơ bản hiển thị đầy đủ');

  //   // Kỳ vọng 5: Hiển thị chi tiết điện nước
  //   // Số điện đầu kỳ/cuối kỳ
  //   await expect(page.getByText('Số điện đầu kỳ')).toBeVisible();
  //   await expect(page.getByText('Số điện cuối kỳ')).toBeVisible();

  //   // Số nước đầu kỳ/cuối kỳ
  //   await expect(page.getByText('Số nước đầu kỳ')).toBeVisible();
  //   await expect(page.getByText('Số nước cuối kỳ')).toBeVisible();

  //   console.log('✅ Thông tin chỉ số điện nước hiển thị đầy đủ');

  //   // Kỳ vọng 6: Hiển thị tiền điện, tiền nước
  //   await expect(page.getByText('Tiền điện')).toBeVisible();
  //   await expect(page.getByText('Tiền nước')).toBeVisible();

  //   // Kiểm tra format tiền tệ (VND)
  //   const electricityCost = page.locator('text=/Tiền điện/').locator('xpath=../p[contains(@class,"font-bold")]');    const electricityCostText = await electricityCost.textContent();
  //   expect(electricityCostText).toMatch(/VND|—/); // Có thể là VND hoặc —

  //   console.log('✅ Tiền điện và tiền nước hiển thị đúng format');

  //   // Kỳ vọng 7: Hiển thị Tổng tiền với format nổi bật
  //   const totalAmount = page.getByText('Tổng tiền').locator('xpath=../..').locator('.text-xl.font-bold');
  //   await expect(totalAmount).toBeVisible();
    
  //   const totalAmountText = await totalAmount.textContent();
  //   expect(totalAmountText).toMatch(/VND/);
    
  //   console.log(`✅ Tổng tiền hiển thị: ${totalAmountText}`);

  //   // Kỳ vọng 8: Hiển thị bảng giá điện và nước (bên phải)
  //   // Kiểm tra tab "GIÁ ĐIỆN TIÊU DÙNG" và "GIÁ NƯỚC TIÊU DÙNG"
  //   await expect(page.getByRole('button', { name: 'GIÁ ĐIỆN TIÊU DÙNG' })).toBeVisible();
  //   await expect(page.getByRole('button', { name: 'GIÁ NƯỚC TIÊU DÙNG' })).toBeVisible();

  //   // Kiểm tra bảng giá điện hiển thị (mặc định tab active)
  //   await expect(page.getByText(/Bậc 1: Cho kWh từ 0 - 100/)).toBeVisible();
    
  //   console.log('✅ Bảng giá điện nước hiển thị');

  //   // Kỳ vọng 9: Kiểm tra nút "Cập nhật thông tin"
  //   const updateButton = page.getByRole('link', { name: 'Cập nhật thông tin' });
  //   await expect(updateButton).toBeVisible();

  //   // Kỳ vọng 10: Kiểm tra section thanh toán hiển thị
  //   await expect(page.getByText('Thanh toán hóa đơn')).toBeVisible();
    
  //   // Kiểm tra nút thanh toán hoặc label "Đã thanh toán"
  //   const paymentButton = page.getByRole('button', { name: 'Thanh toán' });
  //   const paidLabel = page.getByText('Đã thanh toán').last();
    
  //   const hasPaymentButton = await paymentButton.isVisible().catch(() => false);
  //   const hasPaidLabel = await paidLabel.isVisible().catch(() => false);
    
  //   expect(hasPaymentButton || hasPaidLabel).toBe(true);
    
  //   if (hasPaymentButton) {
  //     console.log('✅ Nút "Thanh toán" hiển thị (hóa đơn chưa thanh toán)');
  //   } else {
  //     console.log('✅ Label "Đã thanh toán" hiển thị (hóa đơn đã thanh toán)');
  //   }

  //   console.log('✅ HDCNTT_VIEW_2: Trang chi tiết hóa đơn hiển thị đầy đủ thông tin');
  // });

  // test('HDCNTT_VIEW_3: Kiểm tra hiển thị bảng giá điện và nước trên trang chi tiết', async ({ page }) => {
  //   // Test case bổ sung: Kiểm tra chi tiết hơn về bảng giá

  //   // 1. Vào chi tiết một hóa đơn
  //   const firstRow = page.locator('tbody tr').first();
  //   await firstRow.click();

  //   await expect(page).toHaveURL(/.*\/billing\/detail\/.+/);
  //   await expect(page.getByRole('heading', { name: 'Thông tin hóa đơn' })).toBeVisible();

  //   // 2. Kiểm tra tab GIÁ ĐIỆN TIÊU DÙNG (mặc định active)
  //   const electricTab = page.getByRole('button', { name: 'GIÁ ĐIỆN TIÊU DÙNG' });
  //   await expect(electricTab).toBeVisible();
    
  //   // Kiểm tra tab có class active
  //   const electricTabClass = await electricTab.getAttribute('class');
  //   expect(electricTabClass).toContain('bg-slate-700'); // Active tab có bg-slate-700

  //   console.log('✅ Tab "GIÁ ĐIỆN TIÊU DÙNG" đang active');

  //   // 3. Kiểm tra nội dung bảng giá điện
  //   await expect(page.getByText('Bậc 1: Cho kWh từ 0 - 100')).toBeVisible();
  //   await expect(page.getByText('Bậc 2: Cho kWh từ 101 - 200')).toBeVisible();
  //   await expect(page.getByText('Bậc 3: Cho kWh từ 201 - 400')).toBeVisible();
  //   await expect(page.getByText('Bậc 4: Cho kWh từ 401 - 600')).toBeVisible();
  //   await expect(page.getByText('Bậc 5: Cho kWh từ 601 trở lên')).toBeVisible();

  //   // Kiểm tra giá tiền hiển thị (hardcoded trong component)
  //   await expect(page.getByText('1.984')).toBeVisible(); // Giá bậc 1
  //   await expect(page.getByText('3.350')).toBeVisible(); // Giá bậc 5

  //   console.log('✅ Bảng giá điện hiển thị đầy đủ 5 bậc');

  //   // 4. Click vào tab GIÁ NƯỚC TIÊU DÙNG
  //   const waterTab = page.getByRole('button', { name: 'GIÁ NƯỚC TIÊU DÙNG' });
  //   await waterTab.click();

  //   // Chờ nội dung thay đổi
  //   await page.waitForTimeout(300);

  //   // Kiểm tra tab nước đã active
  //   const waterTabClass = await waterTab.getAttribute('class');
  //   expect(waterTabClass).toContain('bg-slate-700');

  //   console.log('✅ Đã chuyển sang tab "GIÁ NƯỚC TIÊU DÙNG"');

  //   // 5. Kiểm tra nội dung bảng giá nước
  //   await expect(page.getByText('Bậc 1: 0 - 24 m³')).toBeVisible();
  //   await expect(page.getByText('Bậc 2: 25 - 36 m³')).toBeVisible();
  //   await expect(page.getByText('Bậc 3: 37 - 48 m³')).toBeVisible();

  //   // Kiểm tra giá tiền
  //   await expect(page.getByText('5.485')).toBeVisible(); // Giá bậc 1
  //   await expect(page.getByText('11.799')).toBeVisible(); // Giá bậc 3

  //   console.log('✅ Bảng giá nước hiển thị đầy đủ 3 bậc');

  //   // 6. Kiểm tra header bảng giá
  //   await expect(page.getByText('Định mức áp dụng')).toBeVisible();
  //   await expect(page.getByText(/Giá \(đồng\/m³\)/)).toBeVisible();

  //   console.log('✅ HDCNTT_VIEW_3: Bảng giá điện và nước hoạt động chính xác');
  // });

  // test('HDCNTT_VIEW_4: Kiểm tra điều hướng từ danh sách về chi tiết', async ({ page }) => {
  //   // Test case bổ sung: Kiểm tra navigation và back button

  //   // 1. Lưu URL danh sách
  //   const listPageUrl = page.url();

  //   // 2. Click vào hóa đơn thứ 2 (nếu có)
  //   const secondRow = page.locator('tbody tr').nth(1);
  //   const rowCount = await page.locator('tbody tr').count();

  //   if (rowCount < 2) {
  //     console.log('⚠️ Chỉ có 1 hóa đơn, skip test case này');
  //     test.skip();
  //     return;
  //   }

  //   await secondRow.click();

  //   // 3. Kiểm tra đã chuyển sang chi tiết
  //   await expect(page).toHaveURL(/.*\/billing\/detail\/.+/);
  //   const detailPageUrl = page.url();
  //   expect(detailPageUrl).not.toBe(listPageUrl);

  //   console.log('✅ Đã chuyển sang trang chi tiết');

  //   // 4. Click nút back (ArrowLeft icon)
  //   const backButton = page.locator('button').filter({ has: page.locator('svg') }).first();
  //   await backButton.click();

  //   // 5. Kiểm tra đã quay về danh sách
  //   await expect(page.getByRole('heading', { name: 'Hóa đơn điện nước' })).toBeVisible();
  //   await expect(page.locator('table')).toBeVisible();

  //   console.log('✅ Nút back hoạt động chính xác');

  //   // 6. Click vào breadcrumb "Quản lý hóa đơn"
  //   await secondRow.click(); // Vào chi tiết lại
  //   await expect(page).toHaveURL(/.*\/billing\/detail\/.+/);

  //   const breadcrumbLink = page.getByRole('link', { name: 'Quản lý hóa đơn' });
  //   await breadcrumbLink.click();

  //   // 7. Kiểm tra đã quay về danh sách
  //   await expect(page.getByRole('heading', { name: 'Hóa đơn điện nước' })).toBeVisible();

  //   console.log('✅ Breadcrumb link hoạt động chính xác');
  //   console.log('✅ HDCNTT_VIEW_4: Điều hướng giữa các trang hoạt động đúng');
  // });

});

