import { test, expect } from '@playwright/test';

/**
 * Test Suite: Xóa Hóa Đơn (HDCNTT-DELETE)
 * Mô tả: Kiểm thử chức năng xóa hóa đơn điện nước
 */

/**
 * Helper function để lấy dòng hóa đơn theo trạng thái
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} statusText - Văn bản trạng thái (VD: "Chưa thanh toán", "Đã thanh toán")
 * @returns {import('@playwright/test').Locator} - Locator của dòng hóa đơn
 */
const getInvoiceRowByStatus = (page, statusText) => {
  // Tìm tất cả các hàng trong tbody chứa badge trạng thái với text tương ứng
  return page.locator('tbody tr').filter({ hasText: statusText }).first();
};

/**
 * Helper function để lấy ID hóa đơn từ một dòng
 * @param {import('@playwright/test').Locator} row - Locator của dòng hóa đơn
 * @returns {Promise<string>} - ID hóa đơn
 */
const getInvoiceIdFromRow = async (row) => {
  // Lấy cell chứa mã hóa đơn (cột thứ 2 - index 1)
  const invoiceIdCell = row.locator('td').nth(1);
  const invoiceId = await invoiceIdCell.textContent();
  return invoiceId.trim();
};

test.describe('Bộ test case Xóa Hóa Đơn (HDCNTT-DELETE)', () => {

  test.beforeEach(async ({ page }) => {
    // Step 1: Đăng nhập với tài khoản Chủ trọ
    await page.goto('/login');
    await page.fill('input[id="username"]', process.env.ADMIN_EMAIL);
    await page.fill('input[id="password"]', process.env.ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Chờ đăng nhập thành công và chuyển hướng
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Step 2: Điều hướng đến menu "Hóa đơn điện nước"
    await page.getByRole('link', { name: 'Quản lý Thanh toán' }).click();

    // Đảm bảo đã sang trang danh sách hóa đơn
    await expect(page.getByRole('heading', { name: 'Hóa đơn điện nước' })).toBeVisible();

    // Chờ table load xong
    await page.waitForSelector('table', { timeout: 10000 });
  });

  test('HDCNTT_DELETE_1: Kiểm tra hiển thị popup xác nhận xóa', async ({ page }) => {
    // 1. Tìm hóa đơn "Chưa thanh toán"
    const row = getInvoiceRowByStatus(page, 'Chưa thanh toán');
    await expect(row).toBeVisible({ timeout: 10000 });

    // Lấy ID hóa đơn để verify
    const invoiceId = await getInvoiceIdFromRow(row);
    await page.waitForTimeout(1000);
    console.log(`Đang test xóa hóa đơn: ${invoiceId}`);

    // 2. Nhấn nút "Xóa" (icon Trash2 với aria-label)
    const deleteButton = row.getByRole('button', { name: /Xóa hóa đơn/i });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Kỳ vọng 1: Popup hiển thị với role="dialog"
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Kỳ vọng 2: Nội dung popup chứa câu hỏi xác nhận với ID hóa đơn
    // Message format: "Bạn có chắc chắn muốn xóa hóa đơn #${billToDelete}?"
    await expect(dialog).toContainText('Bạn có chắc chắn muốn xóa hóa đơn');
    await page.waitForTimeout(1000);
    console.log(`✅ Kỳ vọng 1: Popup hiển thị với role="dialog"`);

    // Kỳ vọng 3: Popup có tiêu đề "Cảnh báo"
    await expect(dialog.getByRole('heading', { name: 'Cảnh báo' })).toBeVisible();
    await page.waitForTimeout(1000);
    console.log(`✅ Kỳ vọng 2: Popup có tiêu đề "Cảnh báo"`);
    // Kỳ vọng 4: Hiển thị nút "Hủy"
    const cancelButton = dialog.getByRole('button', { name: 'Hủy' });
    await expect(cancelButton).toBeVisible();
    await expect(cancelButton).toBeEnabled();
    await page.waitForTimeout(1000);
    console.log(`✅ Kỳ vọng 3: Hiển thị nút "Hủy"`);
    // Kỳ vọng 5: Hiển thị nút "Xóa" (có thể là "Xóa" hoặc "Xác nhận")
    const confirmButton = dialog.getByRole('button', { name: 'Xóa' });
    await expect(confirmButton).toBeVisible();
    await expect(confirmButton).toBeEnabled();
    await page.waitForTimeout(1000);
    console.log(`✅ Kỳ vọng 4: Hiển thị nút "Xóa"`);
    console.log('✅ HDCNTT_DELETE_1: Popup xác nhận xóa hiển thị đầy đủ các thành phần');

    // Đóng popup (không thực hiện xóa)
    await cancelButton.click();
    await expect(dialog).not.toBeVisible();
    await page.waitForTimeout(1000);
    console.log(`✅ Kỳ vọng 5: Đóng popup`);
  });

  // test('HDCNTT_DELETE_2: Kiểm tra xóa hóa đơn thành công', async ({ page }) => {
  //   // 1. Tìm hóa đơn "Chưa thanh toán" và lấy mã hóa đơn
  //   const row = getInvoiceRowByStatus(page, 'Chưa thanh toán');
  //   await expect(row).toBeVisible({ timeout: 10000 });

  //   const invoiceId = await getInvoiceIdFromRow(row);
  //   console.log(`Đang xóa hóa đơn: ${invoiceId}`);

  //   // 2. Nhấn nút "Xóa"
  //   const deleteButton = row.getByRole('button', { name: /Xóa hóa đơn/i });
  //   await expect(deleteButton).toBeVisible();
  //   await deleteButton.click();

  //   // 3. Chờ popup hiển thị
  //   const dialog = page.getByRole('dialog');
  //   await expect(dialog).toBeVisible({ timeout: 5000 });

  //   // 4. Nhấn nút "Xóa" để xác nhận
  //   // Setup để bắt alert dialog
  //   page.on('dialog', async (dialog) => {
  //     // Verify message alert
  //     expect(dialog.message()).toBe('Xóa hóa đơn thành công!');
  //     await dialog.accept();
  //   });

  //   const confirmButton = dialog.getByRole('button', { name: 'Xóa' });
  //   await confirmButton.click();

  //   // Kỳ vọng 1: Nút xóa hiển thị trạng thái loading
  //   // (Nếu có, text sẽ đổi thành "Đang xử lý...")
  //   // await expect(confirmButton).toHaveText('Đang xử lý...', { timeout: 2000 });

  //   // Chờ dialog đóng (sau khi xóa thành công)
  //   await expect(dialog).not.toBeVisible({ timeout: 10000 });

  //   // Kỳ vọng 2: Hóa đơn đó biến mất khỏi danh sách
  //   // Chờ một chút để API refresh
  //   await page.waitForTimeout(1000);

  //   // Kiểm tra hóa đơn không còn trong table
  //   const deletedRow = page.locator('tbody tr').filter({ hasText: invoiceId });
  //   await expect(deletedRow).toHaveCount(0, { timeout: 5000 });

  //   console.log(`✅ HDCNTT_DELETE_2: Xóa hóa đơn ${invoiceId} thành công`);
  // });

  // test('HDCNTT_DELETE_3: Kiểm tra ràng buộc - Không cho xóa hóa đơn đã thanh toán', async ({ page }) => {
  //   /**
  //    * LƯU Ý: Test case này kiểm tra ràng buộc nghiệp vụ quan trọng:
  //    * "Không được xóa hóa đơn đã thanh toán"
  //    * 
  //    * Hiện tại, trong code frontend (Billings_Table.tsx), nút xóa KHÔNG bị disable
  //    * cho hóa đơn đã thanh toán. Có 2 khả năng:
  //    * 1. Logic này chưa được implement (BUG)
  //    * 2. Logic được xử lý ở backend (API sẽ trả về lỗi khi cố xóa)
  //    * 
  //    * Test case này sẽ FAIL nếu logic chưa được implement.
  //    * Sau khi fix bug, test case sẽ PASS.
  //    */

  //   // 1. Tìm hóa đơn "Đã thanh toán"
  //   const row = getInvoiceRowByStatus(page, 'Đã thanh toán');

  //   // Kiểm tra xem có hóa đơn "Đã thanh toán" không
  //   const rowCount = await page.locator('tbody tr').filter({ hasText: 'Đã thanh toán' }).count();

  //   if (rowCount === 0) {
  //     console.log('⚠️ Không có hóa đơn "Đã thanh toán" để test. Tạo dữ liệu test hoặc skip test này.');
  //     test.skip();
  //     return;
  //   }

  //   await expect(row).toBeVisible({ timeout: 10000 });

  //   const invoiceId = await getInvoiceIdFromRow(row);
  //   console.log(`Kiểm tra ràng buộc xóa cho hóa đơn đã thanh toán: ${invoiceId}`);

  //   // Kỳ vọng: Nút "Xóa" bị vô hiệu hóa hoặc không tồn tại
  //   const deleteButton = row.getByRole('button', { name: /Xóa hóa đơn/i });

  //   // Kiểm tra 2 trường hợp:
  //   // TH1: Nút xóa bị disabled (frontend validation)
  //   // TH2: Nút xóa bị ẩn hoàn toàn (frontend validation)

  //   const buttonExists = await deleteButton.count() > 0;

  //   if (buttonExists) {
  //     // Nếu nút tồn tại, kiểm tra xem có bị disabled không
  //     const isDisabled = await deleteButton.isDisabled();
      
  //     if (isDisabled) {
  //       console.log('✅ HDCNTT_DELETE_3: Nút xóa bị vô hiệu hóa cho hóa đơn đã thanh toán');
  //     } else {
  //       // Nếu nút KHÔNG bị disabled, có thể logic được xử lý ở backend
  //       console.log('⚠️ Nút xóa vẫn enabled. Kiểm tra xem backend có ngăn chặn không...');
        
  //       // Thử click và kiểm tra response từ backend
  //       await deleteButton.click();
        
  //       const dialog = page.getByRole('dialog');
  //       const dialogAppeared = await dialog.isVisible().catch(() => false);
        
  //       if (dialogAppeared) {
  //         // Nếu popup xuất hiện, thử xác nhận và kiểm tra lỗi
  //         const confirmButton = dialog.getByRole('button', { name: 'Xóa' });
          
  //         // Listen for alert or error message
  //         let alertMessage = '';
  //         page.on('dialog', async (dialog) => {
  //           alertMessage = dialog.message();
  //           await dialog.accept();
  //         });
          
  //         await confirmButton.click();
  //         await page.waitForTimeout(2000);
          
  //         // Kiểm tra xem có thông báo lỗi không
  //         const errorMessage = page.locator('.text-red-700, .text-red-600').first();
  //         const hasError = await errorMessage.isVisible().catch(() => false);
          
  //         if (hasError || alertMessage.includes('thất bại') || alertMessage.includes('lỗi')) {
  //           console.log('✅ HDCNTT_DELETE_3: Backend ngăn chặn xóa hóa đơn đã thanh toán');
  //           // Đây là cách implement hợp lệ (backend validation)
  //         } else {
  //           // Nếu không có lỗi => BUG nghiêm trọng
  //           throw new Error('BUG: Hệ thống cho phép xóa hóa đơn đã thanh toán! Cần fix ngay.');
  //         }
  //       } else {
  //         throw new Error('BUG: Nút xóa không bị disable và không có validation nào!');
  //       }
  //     }
  //   } else {
  //     // Nếu nút không tồn tại (bị ẩn) - đây là cách tốt nhất
  //     await expect(deleteButton).toHaveCount(0);
  //     console.log('✅ HDCNTT_DELETE_3: Nút xóa bị ẩn cho hóa đơn đã thanh toán (tốt nhất)');
  //   }
  // });

  // test('HDCNTT_DELETE_4: Kiểm tra hủy bỏ xóa hóa đơn', async ({ page }) => {
  //   // Test case bổ sung: Đảm bảo khi nhấn "Hủy" thì không xóa

  //   // 1. Tìm hóa đơn "Chưa thanh toán"
  //   const row = getInvoiceRowByStatus(page, 'Chưa thanh toán');
  //   await expect(row).toBeVisible({ timeout: 10000 });

  //   const invoiceId = await getInvoiceIdFromRow(row);
  //   console.log(`Kiểm tra hủy xóa hóa đơn: ${invoiceId}`);

  //   // Đếm số hóa đơn hiện tại
  //   const initialCount = await page.locator('tbody tr').count();

  //   // 2. Nhấn nút "Xóa"
  //   const deleteButton = row.getByRole('button', { name: /Xóa hóa đơn/i });
  //   await deleteButton.click();

  //   // 3. Chờ popup hiển thị
  //   const dialog = page.getByRole('dialog');
  //   await expect(dialog).toBeVisible({ timeout: 5000 });

  //   // 4. Nhấn nút "Hủy"
  //   const cancelButton = dialog.getByRole('button', { name: 'Hủy' });
  //   await cancelButton.click();

  //   // Kỳ vọng 1: Popup đóng
  //   await expect(dialog).not.toBeVisible();

  //   // Kỳ vọng 2: Hóa đơn vẫn còn trong danh sách
  //   const finalCount = await page.locator('tbody tr').count();
  //   expect(finalCount).toBe(initialCount);

  //   // Kỳ vọng 3: Hóa đơn cụ thể vẫn hiển thị
  //   const stillExistingRow = page.locator('tbody tr').filter({ hasText: invoiceId });
  //   await expect(stillExistingRow).toBeVisible();

  //   console.log('✅ HDCNTT_DELETE_4: Hủy xóa hoạt động chính xác, hóa đơn không bị xóa');
  // });

  // test('HDCNTT_DELETE_5: Kiểm tra đóng popup bằng nút X', async ({ page }) => {
  //   // Test case bổ sung: Đóng popup bằng nút X (close button)

  //   // 1. Tìm hóa đơn "Chưa thanh toán"
  //   const row = getInvoiceRowByStatus(page, 'Chưa thanh toán');
  //   await expect(row).toBeVisible({ timeout: 10000 });

  //   const invoiceId = await getInvoiceIdFromRow(row);

  //   // 2. Nhấn nút "Xóa"
  //   const deleteButton = row.getByRole('button', { name: /Xóa hóa đơn/i });
  //   await deleteButton.click();

  //   // 3. Chờ popup hiển thị
  //   const dialog = page.getByRole('dialog');
  //   await expect(dialog).toBeVisible({ timeout: 5000 });

  //   // 4. Nhấn nút X (đóng) - có aria-label="Đóng"
  //   const closeButton = dialog.getByRole('button', { name: 'Đóng' });
  //   await expect(closeButton).toBeVisible();
  //   await closeButton.click();

  //   // Kỳ vọng: Popup đóng
  //   await expect(dialog).not.toBeVisible();

  //   // Kỳ vọng: Hóa đơn vẫn còn
  //   const stillExistingRow = page.locator('tbody tr').filter({ hasText: invoiceId });
  //   await expect(stillExistingRow).toBeVisible();

  //   console.log('✅ HDCNTT_DELETE_5: Đóng popup bằng nút X hoạt động chính xác');
  // });

});

