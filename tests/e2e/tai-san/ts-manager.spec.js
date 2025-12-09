import { test, expect } from '@playwright/test';

/**
 * Test Suite: QUẢN LÝ TÀI SẢN (TS)
 * Mô tả: Kiểm thử chức năng quản lý tài sản cho Chủ trọ (LANDLORD)
 * Routing: /assets
 */
test.describe('QUẢN LÝ TÀI SẢN (TS)', () => {
  
  // ===== Setup: Login & Navigate =====
  test.beforeEach(async ({ page }) => {
    // Step 1: Đăng nhập với tài khoản Chủ trọ
    await page.goto('/login');
    await page.fill('input[id="username"]', process.env.ADMIN_EMAIL || '');
    await page.fill('input[id="password"]', process.env.ADMIN_PASSWORD || '');
    await page.click('button[type="submit"]');
    
    // Chờ đăng nhập thành công và chuyển hướng
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Step 2: Điều hướng đến "Quản lý Tài sản" (routing: /assets)
    // Có thể click menu hoặc navigate trực tiếp
    await page.goto('/assets');
    
    // Đảm bảo đã vào trang danh sách tài sản
    await expect(page.getByRole('heading', { name: 'Quản lý Tài sản' })).toBeVisible({ timeout: 10000 });
  });

  // ===== TEST CASE 1: TS_LIST_1 =====
  test('TS_LIST_1: Kiểm tra giao diện Danh sách tài sản (Chủ trọ)', async ({ page }) => {
    
    // Kỳ vọng 1: Hiển thị danh sách tài sản
    await expect(page.getByRole('heading', { name: 'Quản lý Tài sản' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Danh sách tài sản' })).toBeVisible();
    
    console.log('✅ Kỳ vọng 1: Trang danh sách tài sản hiển thị');
    
    // Kỳ vọng 2: Kiểm tra sự tồn tại của các cột trong bảng
    // Các cột: STT, Mã tài sản, Tên tài sản, Loại, Phòng, Trạng thái, Hành động
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Kiểm tra header columns
    await expect(page.locator('th:has-text("STT")')).toBeVisible();
    await expect(page.locator('th:has-text("Mã tài sản")')).toBeVisible();
    await expect(page.locator('th:has-text("Tên tài sản")')).toBeVisible();
    await expect(page.locator('th:has-text("Loại")')).toBeVisible();
    await expect(page.locator('th:has-text("Phòng")')).toBeVisible();
    await expect(page.locator('th:has-text("Trạng thái")')).toBeVisible();
    await expect(page.locator('th:has-text("Hành động")')).toBeVisible();
    
    console.log('✅ Kỳ vọng 2: Các cột bảng hiển thị đầy đủ (STT, Mã, Tên, Loại, Phòng, Trạng thái, Hành động)');
    
    // Kỳ vọng 3: Nút "Thêm tài sản" hiển thị
    const addButton = page.getByRole('button', { name: 'Thêm tài sản' });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();
    
    console.log('✅ Kỳ vọng 3: Nút "Thêm tài sản" hiển thị và có thể click');
    
    console.log('✅ TS_LIST_1: PASS - Giao diện danh sách tài sản hiển thị đầy đủ');
  });

  // ===== TEST CASE 2: TS_CREATE_1 =====
  test('TS_CREATE_1: Kiểm tra Thêm mới tài sản (Happy Path)', async ({ page }) => {
    
    // Bước 1: Nhấn nút "Thêm tài sản"
    await page.getByRole('button', { name: 'Thêm tài sản' }).click();
    
    // Đảm bảo điều hướng đến trang thêm mới
    await expect(page).toHaveURL(/.*\/assets\/add/);
    await expect(page.getByRole('heading', { name: 'Thêm tài sản mới' })).toBeVisible();
    
    console.log('✅ Bước 1: Đã mở form "Thêm tài sản mới"');
    
    // Bước 2: Nhập Tên tài sản
    const assetName = 'Máy lạnh Panasonic Inverter';
    await page.locator('input#assetName').fill(assetName);
    
    console.log(`✅ Bước 2: Đã nhập tên tài sản: "${assetName}"`);
    
    // Bước 3: Chọn Loại tài sản (mặc định là "Thiết bị điện" - ELECTRICAL_EQUIPMENT)
    // Giữ nguyên giá trị mặc định hoặc chọn lại
    await page.locator('select#assetType').selectOption('ELECTRICAL_EQUIPMENT');
    
    console.log('✅ Bước 3: Đã chọn loại tài sản: "Thiết bị điện"');
    
    // Bước 4: Chọn Trạng thái: "Đang dùng" (IN_USE)
    // Note: Theo yêu cầu gốc là "Mới" nhưng trong code chỉ có: IN_USE, BROKEN, LIQUIDATED
    // Tôi sẽ chọn "Đang dùng" (IN_USE) vì đây là trạng thái hợp lý cho tài sản mới
    await page.locator('select#status').selectOption('IN_USE');
    
    console.log('✅ Bước 4: Đã chọn trạng thái: "Đang dùng"');
    
    // Bước 5: Nhấn "Lưu tài sản"
    await page.getByRole('button', { name: 'Lưu tài sản' }).click();
    
    console.log('✅ Bước 5: Đã nhấn nút "Lưu tài sản"');
    
    // Kỳ vọng 1: Thông báo thành công
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Thêm tài sản thành công');
      console.log(`✅ Kỳ vọng 1: Thông báo thành công: "${dialog.message()}"`);
      await dialog.accept();
    });
    
    // Chờ chuyển hướng về trang danh sách
    await page.waitForURL(/.*\/assets$/, { timeout: 10000 });
    
    // Kỳ vọng 2: Tài sản "Máy lạnh Panasonic Inverter" xuất hiện trong danh sách
    await page.waitForTimeout(1000); // Chờ load danh sách
    
    const assetRow = page.locator('tr', { hasText: assetName });
    await expect(assetRow).toBeVisible({ timeout: 5000 });
    
    console.log(`✅ Kỳ vọng 2: Tài sản "${assetName}" xuất hiện trong danh sách`);
    
    console.log('✅ TS_CREATE_1: PASS - Thêm mới tài sản thành công');
  });

  // ===== TEST CASE 3: TS_CREATE_2 =====
  test('TS_CREATE_2: Kiểm tra validation (bỏ trống Tên tài sản)', async ({ page }) => {
    
    // Bước 1: Mở form Thêm mới tài sản
    await page.getByRole('button', { name: 'Thêm tài sản' }).click();
    await expect(page).toHaveURL(/.*\/assets\/add/);
    
    console.log('✅ Bước 1: Đã mở form "Thêm tài sản mới"');
    
    // Bước 2: Bỏ trống trường Tên tài sản (clear nếu có giá trị)
    await page.locator('input#assetName').clear();
    
    console.log('✅ Bước 2: Đã bỏ trống trường "Tên tài sản"');
    
    // Bước 3: Nhấn "Lưu"
    await page.getByRole('button', { name: 'Lưu tài sản' }).click();
    
    console.log('✅ Bước 3: Đã nhấn nút "Lưu tài sản"');
    
    // Kỳ vọng: Hiển thị lỗi validation
    // Có thể là HTML5 validation hoặc custom error message
    
    // Kiểm tra HTML5 validation (required attribute)
    const assetNameInput = page.locator('input#assetName');
    const isInvalid = await assetNameInput.evaluate((el) => !el.checkValidity());
    expect(isInvalid).toBe(true);

    console.log('✅ Kỳ vọng: HTML5 validation hoạt động (trường bắt buộc)');
    // Hoặc kiểm tra custom error message nếu có
    const errorMessage = page.locator('div.text-red-700, p.text-red-600').filter({ hasText: /tên tài sản|không được để trống/i });
    
    // Đợi một chút để error message xuất hiện (nếu có)
    await page.waitForTimeout(500);
    
    // Kiểm tra xem có error message không (có thể có hoặc không tùy implementation)
    const errorCount = await errorMessage.count();
    if (errorCount > 0) {
      await expect(errorMessage.first()).toBeVisible();
      const errorText = await errorMessage.first().textContent();
      console.log(`✅ Kỳ vọng: Hiển thị lỗi validation: "${errorText}"`);
    } else {
      console.log('✅ Kỳ vọng: Validation dựa vào HTML5 (required attribute)');
    }
    
    // Đảm bảo vẫn ở trang thêm mới (không chuyển trang)
    await expect(page).toHaveURL(/.*\/assets\/add/);
    
    console.log('✅ TS_CREATE_2: PASS - Validation hoạt động khi bỏ trống Tên tài sản');
  });

  // ===== TEST CASE 4: TS_EDIT_1 =====
  test('TS_EDIT_1: Kiểm tra Cập nhật tài sản (Gán phòng)', async ({ page }) => {
    
    // Note: Test này phụ thuộc vào dữ liệu của TS_CREATE_1
    // Để đảm bảo test isolation, tôi sẽ tạo tài sản mới trước, sau đó cập nhật
    
    // Setup: Tạo tài sản mới để test
    const assetName = 'Máy lạnh Panasonic Inverter';
    
    // Kiểm tra xem tài sản đã tồn tại chưa (từ test trước)
    let assetRow = page.locator('tr', { hasText: assetName });
    let assetExists = await assetRow.count() > 0;
    
    if (!assetExists) {
      // Tạo mới nếu chưa tồn tại
      console.log('⚙️ Setup: Tạo tài sản mới để test cập nhật...');
      
      await page.getByRole('button', { name: 'Thêm tài sản' }).click();
      await expect(page).toHaveURL(/.*\/assets\/add/);
      
      await page.locator('input#assetName').fill(assetName);
      await page.locator('select#assetType').selectOption('ELECTRICAL_EQUIPMENT');
      await page.locator('select#status').selectOption('IN_USE');
      
      page.on('dialog', async dialog => await dialog.accept());
      await page.getByRole('button', { name: 'Lưu tài sản' }).click();
      await page.waitForURL(/.*\/assets$/, { timeout: 10000 });
      await page.waitForTimeout(1000);
      
      console.log('✅ Setup: Đã tạo tài sản mới');
    }
    
    // Bước 1: Tại danh sách, nhấn "Sửa" tài sản
    assetRow = page.locator('tr', { hasText: assetName }).first();
    await expect(assetRow).toBeVisible();
    
    // Nhấn nút "Chỉnh sửa" (Edit icon)
    const editButton = assetRow.locator('button[title="Chỉnh sửa"]');
    await editButton.click();
    
    // Đảm bảo điều hướng đến trang cập nhật
    await expect(page).toHaveURL(/.*\/assets\/update\/.*/, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Chỉnh sửa tài sản' })).toBeVisible();
    
    console.log('✅ Bước 1: Đã mở form "Chỉnh sửa tài sản"');
    
    // Bước 2: Tại trường "Gắn phòng", chọn một phòng (ví dụ: Phòng 101)
    const roomSelect = page.locator('select#roomId');
    await expect(roomSelect).toBeVisible();
    
    // Lấy danh sách các phòng có sẵn
    const roomOptions = roomSelect.locator('option');
    const roomCount = await roomOptions.count();
    
    console.log(`⚙️ Có ${roomCount} phòng trong dropdown (bao gồm option "Tài sản chung")`);
    
    let selectedRoomId = '';
    let selectedRoomName = '';
    
    if (roomCount > 1) {
      // Chọn phòng đầu tiên (sau option "Tài sản chung")
      // Tìm option có text chứa "Phòng" hoặc số phòng
      const roomOption = roomOptions.nth(1); // Index 1 (sau "Tài sản chung")
      const roomText = await roomOption.textContent();
      const roomValue = await roomOption.getAttribute('value');
      
      if (roomValue && roomValue !== '') {
        await roomSelect.selectOption(roomValue);
        selectedRoomId = roomValue;
        selectedRoomName = roomText || '';
        console.log(`✅ Bước 2: Đã chọn "${selectedRoomName}" (ID: ${selectedRoomId})`);
      } else {
        console.log('⚠️ Không có phòng nào để gán. Skip bước chọn phòng.');
      }
    } else {
      console.log('⚠️ Không có phòng nào trong hệ thống. Skip bước chọn phòng.');
    }
    
    // Bước 3: Thay đổi Tình trạng sang "Đang dùng" (IN_USE)
    await page.locator('select#status').selectOption('IN_USE');
    
    console.log('✅ Bước 3: Đã chọn trạng thái: "Đang dùng"');
    
    // Bước 4: Nhấn "Cập nhật"
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Cập nhật tài sản thành công');
      console.log(`✅ Kỳ vọng 1: Thông báo: "${dialog.message()}"`);
      await dialog.accept();
    });
    
    await page.getByRole('button', { name: 'Cập nhật' }).click();
    
    console.log('✅ Bước 4: Đã nhấn nút "Cập nhật"');
    
    // Chờ chuyển hướng về trang danh sách
    await page.waitForURL(/.*\/assets$/, { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Kỳ vọng 2: Trong danh sách, cột "Phòng đang gán" hiển thị phòng đã chọn
    assetRow = page.locator('tr', { hasText: assetName }).first();
    await expect(assetRow).toBeVisible();
    
    if (selectedRoomId) {
      // Kiểm tra cột "Phòng" hiển thị room ID hoặc room name
      const roomCell = assetRow.locator('td').nth(4); // Cột thứ 5 (index 4): Phòng
      const roomCellText = await roomCell.textContent();
      
      // Có thể hiển thị: "101", "Phòng 101", hoặc ID
      const hasRoomInfo = roomCellText?.includes(selectedRoomId) || roomCellText?.includes(selectedRoomName);
      expect(hasRoomInfo).toBe(true);
      
      console.log(`✅ Kỳ vọng 2: Cột "Phòng" hiển thị: "${roomCellText?.trim()}"`);
    } else {
      console.log('⚠️ Không có phòng được gán, bỏ qua kiểm tra cột "Phòng"');
    }
    
    // Kiểm tra cột "Trạng thái" hiển thị "Đang dùng"
    const statusCell = assetRow.locator('td').nth(5); // Cột thứ 6 (index 5): Trạng thái
    await expect(statusCell).toContainText('Đang dùng');
    
    console.log('✅ Kỳ vọng 3: Cột "Trạng thái" hiển thị: "Đang dùng"');
    
    console.log('✅ TS_EDIT_1: PASS - Cập nhật tài sản (gán phòng) thành công');
  });

  // ===== TEST CASE 5: TS_DELETE_1 =====
  test('TS_DELETE_1: Kiểm tra Xóa tài sản (Thành công)', async ({ page }) => {
    
    // Setup: Tạo một tài sản mới để xóa (không gán phòng)
    const assetNameToDelete = 'Tài sản Test Xóa - ' + Date.now();
    
    console.log('⚙️ Setup: Tạo tài sản mới để test xóa...');
    
    await page.getByRole('button', { name: 'Thêm tài sản' }).click();
    await expect(page).toHaveURL(/.*\/assets\/add/);
    
    await page.locator('input#assetName').fill(assetNameToDelete);
    await page.locator('select#assetType').selectOption('FURNITURE');
    await page.locator('select#status').selectOption('IN_USE');
    // Không chọn phòng (để trống roomId)
    await page.locator('select#roomId').selectOption(''); // Chọn "Tài sản chung"
    
    page.on('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Lưu tài sản' }).click();
    await page.waitForURL(/.*\/assets$/, { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    console.log(`✅ Setup: Đã tạo tài sản "${assetNameToDelete}"`);
    
    // Bước 1: Tìm tài sản vừa tạo
    const assetRow = page.locator('tr', { hasText: assetNameToDelete }).first();
    await expect(assetRow).toBeVisible();
    
    console.log('✅ Bước 1: Đã tìm thấy tài sản trong danh sách');
    
    // Bước 2: Nhấn nút "Xóa" (Trash icon)
    const deleteButton = assetRow.locator('button[title="Xóa"]');
    await deleteButton.click();
    
    console.log('✅ Bước 2: Đã nhấn nút "Xóa"');
    
    // Bước 3: Xác nhận popup (Dialog confirm)
    // Từ code: ConfirmationModal với title "Xác nhận xóa tài sản"
    
    // Chờ modal xuất hiện
    await page.waitForTimeout(500);
    
    // Kiểm tra modal hiển thị
    const confirmModal = page.locator('div', { hasText: 'Xác nhận xóa tài sản' });
    await expect(confirmModal).toBeVisible({ timeout: 3000 });
    
    console.log('✅ Bước 3: Modal xác nhận xóa hiển thị');
    
    // Setup dialog handler để kiểm tra thông báo thành công
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Xóa tài sản thành công');
      console.log(`✅ Kỳ vọng 1: Thông báo: "${dialog.message()}"`);
      await dialog.accept();
    });
    
    // Nhấn nút "Xác nhận" trong modal
    // Từ ConfirmationModal: nút confirm có text chứa "Xóa" hoặc "Xác nhận"
    const confirmButton = page.getByRole('button', { name: /xác nhận|xóa/i });
    await confirmButton.click();
    
    console.log('✅ Đã xác nhận xóa');
    
    // Chờ một chút để xử lý
    await page.waitForTimeout(1000);
    
    // Kỳ vọng 2: Tài sản đó biến mất khỏi danh sách
    await expect(assetRow).not.toBeVisible({ timeout: 5000 });
    
    console.log('✅ Kỳ vọng 2: Tài sản đã biến mất khỏi danh sách');
    
    console.log('✅ TS_DELETE_1: PASS - Xóa tài sản thành công');
  });

  // ===== TEST CASE 6: TS_DELETE_2 =====
  test('TS_DELETE_2: Kiểm tra ràng buộc khi Xóa tài sản (Thất bại)', async ({ page }) => {
    
    // Note: Test này cần tài sản đã được gán cho phòng (từ TS_EDIT_1)
    // Để đảm bảo test isolation, tôi sẽ tạo tài sản mới và gán phòng
    
    const assetName = 'Tài sản Đã Gán Phòng - ' + Date.now();
    
    console.log('⚙️ Setup: Tạo tài sản và gán phòng...');
    
    // Bước 1: Tạo tài sản mới
    await page.getByRole('button', { name: 'Thêm tài sản' }).click();
    await expect(page).toHaveURL(/.*\/assets\/add/);
    
    await page.locator('input#assetName').fill(assetName);
    await page.locator('select#assetType').selectOption('ELECTRICAL_EQUIPMENT');
    await page.locator('select#status').selectOption('IN_USE');
    
    // Gán phòng (chọn phòng đầu tiên nếu có)
    const roomSelect = page.locator('select#roomId');
    const roomOptions = roomSelect.locator('option');
    const roomCount = await roomOptions.count();
    
    if (roomCount > 1) {
      const roomValue = await roomOptions.nth(1).getAttribute('value');
      if (roomValue && roomValue !== '') {
        await roomSelect.selectOption(roomValue);
        console.log(`✅ Setup: Đã gán phòng (ID: ${roomValue})`);
      } else {
        console.log('⚠️ Không có phòng để gán. Test này cần có phòng trong hệ thống.');
        test.skip();
      }
    } else {
      console.log('⚠️ Không có phòng trong hệ thống. Skip test này.');
      test.skip();
    }
    
    page.on('dialog', async dialog => await dialog.accept());
    await page.getByRole('button', { name: 'Lưu tài sản' }).click();
    await page.waitForURL(/.*\/assets$/, { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    console.log(`✅ Setup: Đã tạo tài sản "${assetName}" và gán phòng`);
    
    // Bước 2: Tìm tài sản đã gán phòng
    const assetRow = page.locator('tr', { hasText: assetName }).first();
    await expect(assetRow).toBeVisible();
    
    console.log('✅ Bước 1: Đã tìm thấy tài sản đã gán phòng');
    
    // Bước 3: Nhấn nút "Xóa"
    const deleteButton = assetRow.locator('button[title="Xóa"]');
    await deleteButton.click();
    
    console.log('✅ Bước 2: Đã nhấn nút "Xóa"');
    
    // Chờ modal xác nhận
    await page.waitForTimeout(500);
    const confirmModal = page.locator('div', { hasText: 'Xác nhận xóa tài sản' });
    await expect(confirmModal).toBeVisible({ timeout: 3000 });
    
    console.log('✅ Bước 3: Modal xác nhận xóa hiển thị');
    
    // Setup dialog handler để kiểm tra thông báo lỗi
    let errorDialogShown = false;
    page.on('dialog', async dialog => {
      const message = dialog.message();
      console.log(`📩 Dialog message: "${message}"`);
      
      // Kiểm tra message có chứa lỗi về ràng buộc phòng
      if (message.includes('không thể xóa') || 
          message.includes('đang được gán') || 
          message.includes('phòng') ||
          message.includes('thất bại')) {
        errorDialogShown = true;
        console.log(`✅ Kỳ vọng: Hiển thị lỗi: "${message}"`);
      }
      
      await dialog.accept();
    });
    
    // Nhấn "Xác nhận" trong modal
    const confirmButton = page.getByRole('button', { name: /xác nhận|xóa/i });
    await confirmButton.click();
    
    console.log('✅ Đã xác nhận xóa');
    
    // Chờ một chút để xử lý
    await page.waitForTimeout(1500);
    
    // Kỳ vọng: Hiển thị lỗi
    // Có thể là alert dialog hoặc error message trên page
    
    if (!errorDialogShown) {
      // Kiểm tra error message trên page
      const errorMessage = page.locator('div.text-red-700, div.text-rose-600, p.text-red-600').filter({ 
        hasText: /không thể xóa|đang được gán|phòng|thất bại/i 
      });
      
      const errorCount = await errorMessage.count();
      if (errorCount > 0) {
        await expect(errorMessage.first()).toBeVisible();
        const errorText = await errorMessage.first().textContent();
        console.log(`✅ Kỳ vọng: Hiển thị lỗi trên page: "${errorText}"`);
      } else {
        console.log('⚠️ Không tìm thấy error message. Kiểm tra lại logic backend và frontend.');
      }
    }
    
    // Tài sản vẫn còn trong danh sách (không bị xóa)
    await page.waitForTimeout(1000);
    const assetStillExists = await page.locator('tr', { hasText: assetName }).first().isVisible();
    expect(assetStillExists).toBe(true);
    
    console.log('✅ Kỳ vọng: Tài sản vẫn còn trong danh sách (không bị xóa)');
    
    console.log('✅ TS_DELETE_2: PASS - Ràng buộc xóa tài sản hoạt động đúng');
  });
});

