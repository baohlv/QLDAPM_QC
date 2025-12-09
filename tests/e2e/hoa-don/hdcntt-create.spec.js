import { test, expect } from '@playwright/test';

/**
 * Test Suite: Tạo Hóa Đơn (HDCNTT-CREATE)
 * Mô tả: Kiểm thử chức năng tạo hóa đơn điện nước cho căn hộ
 */
test.describe('Bộ test case Tạo Hóa Đơn (HDCNTT-CREATE)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Step 1: Đăng nhập với tài khoản Chủ trọ
    await page.goto('/login');
    await page.fill('input[id="username"]', process.env.ADMIN_EMAIL);
    await page.fill('input[id="password"]', process.env.ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Chờ đăng nhập thành công và chuyển hướng
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Step 2: Điều hướng đến menu "Hóa đơn điện nước"
    // Từ layout.tsx, menu có label "Quản lý Thanh toán" và href "/billing"
    await page.getByRole('link', { name: 'Quản lý Thanh toán' }).click();
    
    // Đảm bảo đã sang trang danh sách hóa đơn trước khi click "Thêm mới"
    await expect(page.getByRole('heading', { name: 'Hóa đơn điện nước' })).toBeVisible();
    
    // Step 3: Click nút "Thêm mới hóa đơn"
    await page.getByRole('link', { name: 'Thêm mới hóa đơn' }).click();
    
    // Đảm bảo đã điều hướng đến trang Tạo hóa đơn
    await expect(page).toHaveURL(/.*\/billing\/add/);
  });

  test('HDCNTT_CREATE_1: Kiểm tra giao diện tạo hóa đơn', async ({ page }) => {
    
    // Kỳ vọng 1: Validate Form tạo hóa đơn hiển thị
    await expect(page.getByRole('heading', { name: 'Thêm mới hóa đơn' })).toBeVisible();
    await page.waitForTimeout(1000);
    console.log(`✅ Kỳ vọng 1: Validate Form tạo hóa đơn hiển thị`);
    // Kiểm tra form chứa tất cả các trường cần thiết
    const formContainer = page.locator('form');
    await expect(formContainer).toBeVisible();
        
    // Kỳ vọng 2: Validate các trường nhập liệu tồn tại
    
    // Trường chọn phòng
    await expect(page.locator('select[name="roomId"]')).toBeVisible();
    await expect(page.getByText('Mã phòng')).toBeVisible();
    
    // Trường Tháng/Năm
    await expect(page.locator('input[name="monthYear"]')).toBeVisible();
    await expect(page.getByText('Tháng/Năm')).toBeVisible();
    
    // Các trường nhập chỉ số điện
    await expect(page.locator('input[name="startElectric"]')).toBeVisible();
    await expect(page.getByText('Số điện đầu kỳ')).toBeVisible();
    
    await expect(page.locator('input[name="endElectric"]')).toBeVisible();
    await expect(page.getByText('Số điện cuối kỳ')).toBeVisible();
    
    // Các trường nhập chỉ số nước
    await expect(page.locator('input[name="startWater"]')).toBeVisible();
    await expect(page.getByText('Số nước đầu kỳ')).toBeVisible();
    
    await expect(page.locator('input[name="endWater"]')).toBeVisible();
    await expect(page.getByText('Số nước cuối kỳ')).toBeVisible();
    
    // Kỳ vọng 3: Validate các trường tính toán tự động (read-only)
    
    // Tiền điện - phải hiển thị và bị disabled (read-only)
    const electricCostField = page.locator('input').filter({ hasText: /^0$/ }).first();
    await expect(page.getByText('Tiền điện (VNĐ)')).toBeVisible();
    
    // Tiền nước - phải hiển thị và bị disabled (read-only)
    await expect(page.getByText('Tiền nước (VNĐ)')).toBeVisible();
    
    // Kỳ vọng 4: Validate trường "Tổng tiền" tự động tính
    await expect(page.getByText('Tổng tiền (VNĐ)')).toBeVisible();
    
    // Kiểm tra các trường readonly (bg-gray-100 là dấu hiệu của readonly field)
    const readonlyFields = page.locator('input.bg-gray-100');
    const readonlyCount = await readonlyFields.count();
    expect(readonlyCount).toBe(3); // Tiền điện, Tiền nước, Tổng tiền
    
    // Kỳ vọng 5: Kiểm tra nút submit
    await expect(page.getByRole('button', { name: 'Thêm hóa đơn' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thêm hóa đơn' })).toBeEnabled();
    
    // Kỳ vọng 6: Kiểm tra bảng giá điện và nước hiển thị (reference tables)
    // Từ page.tsx, có ElectricityPriceTable và WaterPriceTable
    // await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(page.locator('h2:has-text("GIÁ ĐIỆN TIÊU DÙNG")')).toBeVisible();
    await expect(page.locator('h2:has-text("GIÁ NƯỚC TIÊU DÙNG")')).toBeVisible();
    await page.waitForTimeout(1000);
    // console.log(`✅ Kỳ vọng 6: Kiểm tra bảng giá điện và nước hiển thị`);
    
    await page.waitForTimeout(1000);
    console.log('✅ HDCNTT_CREATE_1: Giao diện tạo hóa đơn hiển thị đầy đủ các trường');
  });

  // test('HDCNTT_CREATE_2: Kiểm tra chọn phòng và kỳ thanh toán', async ({ page }) => {
    
  //   // Step 4: Chọn một phòng
  //   const roomSelect = page.locator('select[name="roomId"]');
  //   await expect(roomSelect).toBeVisible();
    
  //   // Kiểm tra dropdown có option mặc định
  //   await expect(roomSelect.locator('option').first()).toHaveText('-- Chọn phòng đang thuê --');
    
  //   // Đếm số phòng có sẵn (trừ option mặc định)
  //   const roomOptions = roomSelect.locator('option');
  //   const roomCount = await roomOptions.count();
  //   console.log(`Số phòng có sẵn: ${roomCount - 1}`); // -1 vì có option placeholder
    
  //   // Nếu có phòng, chọn phòng đầu tiên
  //   if (roomCount > 1) {
  //     await roomSelect.selectOption({ index: 1 }); // Chọn phòng đầu tiên (sau placeholder)
      
  //     // Verify đã chọn phòng
  //     const selectedValue = await roomSelect.inputValue();
  //     expect(selectedValue).not.toBe('');
      
  //     console.log(`✅ Đã chọn phòng ID: ${selectedValue}`);
  //   }
    
  //   // Kiểm tra trường Tháng/Năm có giá trị mặc định (tháng hiện tại)
  //   const monthYearInput = page.locator('input[name="monthYear"]');
  //   const monthYearValue = await monthYearInput.inputValue();
  //   expect(monthYearValue).toMatch(/^\d{2}\/\d{4}$/); // Format MM/YYYY
    
  //   console.log(`✅ Kỳ thanh toán mặc định: ${monthYearValue}`);
    
  //   // Kỳ vọng: Sau khi chọn phòng, form vẫn sẵn sàng để nhập dữ liệu
  //   await expect(page.locator('input[name="startElectric"]')).toBeEnabled();
  //   await expect(page.locator('input[name="startWater"]')).toBeEnabled();
  // });

  // test('HDCNTT_CREATE_3: Kiểm tra tính toán tự động tiền điện nước', async ({ page }) => {
    
  //   // Chọn một phòng
  //   const roomSelect = page.locator('select[name="roomId"]');
  //   const roomCount = await roomSelect.locator('option').count();
    
  //   if (roomCount > 1) {
  //     await roomSelect.selectOption({ index: 1 });
  //   }
    
  //   // Nhập chỉ số điện
  //   await page.locator('input[name="startElectric"]').fill('100');
  //   await page.locator('input[name="endElectric"]').fill('150'); // Tiêu thụ 50 kWh
    
  //   // Nhập chỉ số nước
  //   await page.locator('input[name="startWater"]').fill('20');
  //   await page.locator('input[name="endWater"]').fill('25'); // Tiêu thụ 5 m³
    
  //   // Chờ một chút để các hàm tính toán chạy (useEffect)
  //   await page.waitForTimeout(500);
    
  //   // Kiểm tra tiền điện được tính tự động (phải > 0)
  //   const electricCostInput = page.locator('input[readonly]').nth(0);
  //   const electricCost = await electricCostInput.inputValue();
    
  //   // Remove định dạng tiền tệ để kiểm tra giá trị số
  //   const electricCostNum = parseFloat(electricCost.replace(/[^\d]/g, ''));
  //   expect(electricCostNum).toBeGreaterThan(0);
    
  //   console.log(`✅ Tiền điện tự động: ${electricCost}`);
    
  //   // Kiểm tra tiền nước được tính tự động (phải > 0)
  //   const waterCostInput = page.locator('input[readonly]').nth(1);
  //   const waterCost = await waterCostInput.inputValue();
    
  //   const waterCostNum = parseFloat(waterCost.replace(/[^\d]/g, ''));
  //   expect(waterCostNum).toBeGreaterThan(0);
    
  //   console.log(`✅ Tiền nước tự động: ${waterCost}`);
    
  //   // Kiểm tra tổng tiền = tiền điện + tiền nước
  //   const totalCostInput = page.locator('input[readonly]').nth(2);
  //   const totalCost = await totalCostInput.inputValue();
    
  //   const totalCostNum = parseFloat(totalCost.replace(/[^\d]/g, ''));
  //   expect(totalCostNum).toBe(electricCostNum + waterCostNum);
    
  //   console.log(`✅ Tổng tiền tự động: ${totalCost}`);
  //   console.log(`✅ HDCNTT_CREATE_3: Tính toán tự động hoạt động chính xác`);
  // });

  // test('HDCNTT_CREATE_4: Kiểm tra validation chỉ số đầu/cuối kỳ', async ({ page }) => {
    
  //   // Chọn một phòng
  //   const roomSelect = page.locator('select[name="roomId"]');
  //   const roomCount = await roomSelect.locator('option').count();
    
  //   if (roomCount > 1) {
  //     await roomSelect.selectOption({ index: 1 });
  //   }
    
  //   // Test case: Chỉ số cuối kỳ < đầu kỳ (ĐIỆN)
  //   await page.locator('input[name="startElectric"]').fill('200');
  //   await page.locator('input[name="endElectric"]').fill('150'); // Sai: cuối < đầu
    
  //   // Blur để trigger validation
  //   await page.locator('input[name="endElectric"]').blur();
    
  //   // Chờ một chút để validation chạy
  //   await page.waitForTimeout(300);
    
  //   // Kiểm tra xuất hiện thông báo lỗi cho điện
  //   const electricError = page.locator('p.text-red-600').filter({ hasText: /điện/i });
  //   await expect(electricError).toBeVisible();
    
  //   console.log('✅ Validation điện: Hiển thị lỗi khi cuối kỳ < đầu kỳ');
    
  //   // Sửa lại cho đúng
  //   await page.locator('input[name="endElectric"]').fill('250');
  //   await page.locator('input[name="endElectric"]').blur();
  //   await page.waitForTimeout(300);
    
  //   // Lỗi phải biến mất
  //   await expect(electricError).not.toBeVisible();
    
  //   // Test case: Chỉ số cuối kỳ < đầu kỳ (NƯỚC)
  //   await page.locator('input[name="startWater"]').fill('50');
  //   await page.locator('input[name="endWater"]').fill('30'); // Sai: cuối < đầu
    
  //   // Blur để trigger validation
  //   await page.locator('input[name="endWater"]').blur();
  //   await page.waitForTimeout(300);
    
  //   // Kiểm tra xuất hiện thông báo lỗi cho nước
  //   const waterError = page.locator('p.text-red-600').filter({ hasText: /nước/i });
  //   await expect(waterError).toBeVisible();
    
  //   console.log('✅ Validation nước: Hiển thị lỗi khi cuối kỳ < đầu kỳ');
    
  //   // Sửa lại cho đúng
  //   await page.locator('input[name="endWater"]').fill('60');
  //   await page.locator('input[name="endWater"]').blur();
  //   await page.waitForTimeout(300);
    
  //   // Lỗi phải biến mất
  //   await expect(waterError).not.toBeVisible();
    
  //   console.log('✅ HDCNTT_CREATE_4: Validation hoạt động chính xác');
  // });

  // test('HDCNTT_CREATE_5: Kiểm tra validation chỉ nhập số', async ({ page }) => {
    
  //   // Thử nhập chữ vào trường số điện
  //   await page.locator('input[name="startElectric"]').fill('abc123def');
    
  //   await page.locator('input[name="startElectric"]').fill('-10');
  //   // Kiểm tra chỉ có số được giữ lại (theo handleNumberInput trong BillForm.tsx)
  //   await page.locator('input[name="startElectric"]').fill('123');
  //   const startElectricValue = await page.locator('input[name="startElectric"]').inputValue( );
  //   expect(startElectricValue).toBe('123'); // Chỉ số được giữ lại
    
  //   console.log('✅ Validation: Chỉ cho phép nhập số vào các trường chỉ số');
    
  //   // Thử nhập ký tự đặc biệt
  //   await page.locator('input[name="endElectric"]').fill('10050');
  //   const endElectricValue = await page.locator('input[name="endElectric"]').inputValue();
  //   expect(endElectricValue).toBe('10050'); // Chỉ số được giữ lại
    
  //   console.log('✅ HDCNTT_CREATE_5: Chỉ cho phép nhập số nguyên dương');
  // });

  // test('HDCNTT_CREATE_6: Kiểm tra format Tháng/Năm', async ({ page }) => {
    
  //   const monthYearInput = page.locator('input[name="monthYear"]');
    
  //   // Clear giá trị mặc định
  //   await monthYearInput.clear();
    
  //   // Nhập format không có dấu /
  //   await monthYearInput.fill('122024');
    
  //   // Kiểm tra tự động format thành MM/YYYY
  //   const formattedValue = await monthYearInput.inputValue();
  //   expect(formattedValue).toBe('12/2024');
    
  //   console.log(`✅ Tự động format: 122024 → ${formattedValue}`);
    
  //   // Thử nhập format khác
  //   await monthYearInput.clear();
  //   await monthYearInput.fill('012025');
    
  //   const formattedValue2 = await monthYearInput.inputValue();
  //   expect(formattedValue2).toBe('01/2025');
    
  //   console.log('✅ HDCNTT_CREATE_6: Format Tháng/Năm hoạt động chính xác');
  // });

  // test('HDCNTT_CREATE_7: Kiểm tra các trường bắt buộc', async ({ page }) => {
    
  //   // Thử submit form mà không điền gì
  //   await page.getByRole('button', { name: 'Thêm hóa đơn' }).click();
    
  //   // Kiểm tra validation HTML5 (required attribute)
  //   // Trường roomId là required
  //   const roomSelect = page.locator('select[name="roomId"]');
  //   const isRoomInvalid = await roomSelect.evaluate((el) => !el.checkValidity());
  //   expect(isRoomInvalid).toBe(true);
    
  //   console.log('✅ Validation: Phòng là bắt buộc');
    
  //   // Chọn phòng
  //   const roomCount = await roomSelect.locator('option').count();
  //   if (roomCount > 1) {
  //     await roomSelect.selectOption({ index: 1 });
  //   }
    
  //   // Thử submit lại
  //   await page.getByRole('button', { name: 'Thêm hóa đơn' }).click();
    
  //   // Kiểm tra các trường khác (monthYear, startElectric, v.v.)
  //   const monthYearInput = page.locator('input[name="monthYear"]');
  //   const isMonthYearInvalid = await monthYearInput.evaluate((el) => !el.checkValidity());
    
  //   // Nếu trường có validation, nó sẽ invalid khi empty
  //   if (isMonthYearInvalid) {
  //     console.log('✅ Validation: Tháng/Năm là bắt buộc');
  //   }
    
  //   console.log('✅ HDCNTT_CREATE_7: Tất cả các trường bắt buộc được validate');
  // });
});
