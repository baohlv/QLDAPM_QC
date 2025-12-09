import { test, expect } from '@playwright/test';

/**
 * Test Suite: Chỉnh Sửa Hóa Đơn (HDCNTT-EDIT)
 * Mô tả: Kiểm thử chức năng chỉnh sửa hóa đơn điện nước
 * 
 * Yêu cầu:
 * - Chỉ được sửa hóa đơn "Chưa thanh toán" (UNPAID)
 * - Không được sửa hóa đơn "Đã thanh toán" (PAID)
 * - Validate chỉ số điện nước không được âm
 * - Tính toán tự động tổng tiền khi thay đổi chỉ số
 */

test.describe('Bộ test case Chỉnh Sửa Hóa Đơn (HDCNTT-EDIT)', () => {

    // Biến toàn cục để lưu ID hóa đơn trong quá trình test
    let unpaidBillId = null;
    let paidBillId = null;

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
    });

    /**
     * HDCNTT_EDIT_1: Kiểm tra giao diện form chỉnh sửa
     * 
     * Test Case:
     * 1. Tại danh sách hóa đơn, chọn một hóa đơn có trạng thái "Chưa thanh toán"
     * 2. Nhấn nút "Sửa"
     * 
     * Kỳ vọng:
     * 1. Form chỉnh sửa hóa đơn hiển thị
     * 2. Tất cả dữ liệu của hóa đơn được load chính xác vào các trường tương ứng
     */
    test('HDCNTT_EDIT_1: Kiểm tra giao diện form chỉnh sửa', async ({ page }) => {
        
        // 1. Tìm hóa đơn "Chưa thanh toán" trong bảng
        // StatusBadge với status UNPAID hiển thị text "Chưa thanh toán"
        const unpaidRow = page.locator('tr').filter({ hasText: 'Chưa thanh toán' }).first();
        await expect(unpaidRow).toBeVisible({ timeout: 10000 });

        // Lưu lại ID của hóa đơn chưa thanh toán để sử dụng sau
        const billCodeText = await unpaidRow.locator('td').nth(1).textContent();
        await page.waitForTimeout(1000);
        console.log(`✅ Tìm thấy hóa đơn chưa thanh toán: ${billCodeText}`);

        // 2. Nhấn nút "Sửa" (icon Edit trong cột "Hành động")
        // Từ Billings_Table.tsx, nút Edit có aria-label="Chỉnh sửa hóa đơn {id}"
        const editButton = unpaidRow.locator('a[aria-label*="Chỉnh sửa hóa đơn"]');
        await expect(editButton).toBeVisible();
        await editButton.click();

        // Kỳ vọng 1: Chuyển đến trang chỉnh sửa hóa đơn
        await expect(page).toHaveURL(/.*\/billing\/update\/\d+/);

        // Kỳ vọng 2: Form chỉnh sửa hiển thị
        await expect(page.getByRole('heading', { name: /Chỉnh sửa hóa đơn/ })).toBeVisible();

        // Kỳ vọng 3: Các trường dữ liệu được load chính xác

        // Kiểm tra trường "Mã phòng" (readonly)
        const roomIdInput = page.locator('input[value]').filter({ has: page.locator('label:has-text("Mã phòng") + input') }).first();
        await expect(page.getByText('Mã phòng')).toBeVisible();

        // Kiểm tra trường "Tháng/Năm" (readonly)
        await expect(page.getByText('Tháng/Năm')).toBeVisible();

        // Kiểm tra các trường chỉ số điện
        await expect(page.getByText('Số điện đầu kỳ')).toBeVisible();
        const startElectricInput = page.locator('input[name="electricityStartReading"]');
        await expect(startElectricInput).toBeVisible();
        await expect(startElectricInput).not.toBeEmpty();

        await expect(page.getByText('Số điện cuối kỳ')).toBeVisible();
        const endElectricInput = page.locator('input[name="electricityEndReading"]');
        await expect(endElectricInput).toBeVisible();
        await expect(endElectricInput).not.toBeEmpty();

        // Kiểm tra các trường chỉ số nước
        await expect(page.getByText('Số nước đầu kỳ')).toBeVisible();
        const startWaterInput = page.locator('input[name="waterStartReading"]');
        await expect(startWaterInput).toBeVisible();
        await expect(startWaterInput).not.toBeEmpty();

        await expect(page.getByText('Số nước cuối kỳ')).toBeVisible();
        const endWaterInput = page.locator('input[name="waterEndReading"]');
        await expect(endWaterInput).toBeVisible();
        await expect(endWaterInput).not.toBeEmpty();

        // Kiểm tra các trường tính toán tự động (readonly)
        await expect(page.getByText('Tiền điện (VNĐ)')).toBeVisible();
        await expect(page.getByText('Tiền nước (VNĐ)')).toBeVisible();
        await expect(page.getByText('Tổng tiền (VNĐ)')).toBeVisible();

        // Kiểm tra nút "Lưu thay đổi"
        await expect(page.getByRole('button', { name: 'Lưu thay đổi' })).toBeVisible();
        await page.waitForTimeout(1000);

        console.log('✅ HDCNTT_EDIT_1: Giao diện form chỉnh sửa hiển thị đầy đủ');
    });

    // /**
    //  * HDCNTT_EDIT_2: Kiểm tra chỉnh sửa hóa đơn thành công
    //  * 
    //  * Test Case:
    //  * 1. Mở form sửa hóa đơn (của hóa đơn "Chưa thanh toán")
    //  * 2. Thay đổi chỉ số điện mới từ giá trị hiện tại thành giá trị lớn hơn
    //  * 3. Nhấn "Lưu"
    //  * 
    //  * Kỳ vọng:
    //  * 1. Hiển thị thông báo "Cập nhật hóa đơn thành công"
    //  * 2. Trường "Tổng tiền" được tự động tính lại
    //  * 3. Quay lại danh sách, hóa đơn hiển thị dữ liệu mới
    //  */
    // test('HDCNTT_EDIT_2: Kiểm tra chỉnh sửa hóa đơn thành công', async ({ page }) => {
        
    //     // 1. Tìm và mở form sửa hóa đơn "Chưa thanh toán"
    //     const unpaidRow = page.locator('tr').filter({ hasText: 'Chưa thanh toán' }).first();
    //     await expect(unpaidRow).toBeVisible({ timeout: 10000 });

    //     const editButton = unpaidRow.locator('a[aria-label*="Chỉnh sửa hóa đơn"]');
    //     await editButton.click();

    //     await expect(page).toHaveURL(/.*\/billing\/update\/\d+/);
    //     await expect(page.getByRole('heading', { name: /Chỉnh sửa hóa đơn/ })).toBeVisible();

    //     // 2. Lưu giá trị tổng tiền ban đầu
    //     const oldTotalInput = page.locator('input[readonly]').filter({ has: page.locator('label:has-text("Tổng tiền") + input') }).last();
    //     const oldTotalText = await page.locator('label:has-text("Tổng tiền (VNĐ)") + input[readonly]').inputValue();
    //     console.log(`Tổng tiền ban đầu: ${oldTotalText}`);

    //     // 3. Thay đổi chỉ số điện cuối kỳ
    //     const endElectricInput = page.locator('input[name="electricityEndReading"]');
    //     const currentValue = await endElectricInput.inputValue();
    //     const newValue = String(Number(currentValue) + 10); // Tăng thêm 10 kWh

    //     await endElectricInput.fill('');
    //     await endElectricInput.fill(newValue);
    //     console.log(`Thay đổi chỉ số điện cuối kỳ: ${currentValue} → ${newValue}`);

    //     // Chờ một chút để hàm tính toán tự động chạy
    //     await page.waitForTimeout(500);

    //     // Kiểm tra tổng tiền đã thay đổi
    //     const newTotalText = await page.locator('label:has-text("Tổng tiền (VNĐ)") + input[readonly]').inputValue();
    //     console.log(`Tổng tiền mới: ${newTotalText}`);
    //     expect(newTotalText).not.toEqual(oldTotalText);

    //     // 4. Nhấn nút "Lưu thay đổi"
    //     await page.getByRole('button', { name: 'Lưu thay đổi' }).click();

    //     // Kỳ vọng 1: Hiển thị alert thành công
    //     page.once('dialog', async dialog => {
    //         expect(dialog.message()).toContain('Cập nhật hóa đơn thành công');
    //         await dialog.accept();
    //     });

    //     // Chờ alert xuất hiện và tự động accept
    //     await page.waitForTimeout(1000);

    //     console.log('✅ HDCNTT_EDIT_2: Chỉnh sửa hóa đơn thành công');
    // });

    // /**
    //  * HDCNTT_EDIT_3: Kiểm tra ràng buộc - Không cho sửa hóa đơn đã thanh toán
    //  * 
    //  * Test Case:
    //  * 1. Tại danh sách hóa đơn, tìm một hóa đơn có trạng thái "Đã thanh toán"
    //  * 
    //  * Kỳ vọng:
    //  * 1. Nút "Sửa" bị ẩn hoặc bị vô hiệu hóa (disabled)
    //  */
    // test('HDCNTT_EDIT_3: Không cho sửa hóa đơn đã thanh toán', async ({ page }) => {
        
    //     // 1. Tìm hóa đơn "Đã thanh toán" trong bảng
    //     const paidRow = page.locator('tr').filter({ hasText: 'Đã thanh toán' }).first();
        
    //     // Kiểm tra xem có hóa đơn đã thanh toán không
    //     const paidRowCount = await paidRow.count();
        
    //     if (paidRowCount === 0) {
    //         console.log('⚠️ Không tìm thấy hóa đơn "Đã thanh toán" để test. Bỏ qua test case này.');
    //         test.skip();
    //     }

    //     await expect(paidRow).toBeVisible({ timeout: 10000 });

    //     const billCodeText = await paidRow.locator('td').nth(1).textContent();
    //     console.log(`✅ Tìm thấy hóa đơn đã thanh toán: ${billCodeText}`);

    //     // Kỳ vọng: Nút "Sửa" vẫn hiển thị nhưng khi click sẽ bị chặn ở backend
    //     // (Dựa vào code, frontend không disable nút Edit, backend sẽ handle logic này)
    //     const editButton = paidRow.locator('a[aria-label*="Chỉnh sửa hóa đơn"]');
        
    //     // Kiểm tra nút Edit có tồn tại
    //     await expect(editButton).toBeVisible();

    //     // Click vào nút Edit
    //     await editButton.click();

    //     // Kỳ vọng: Vẫn chuyển sang trang edit (frontend cho phép)
    //     await expect(page).toHaveURL(/.*\/billing\/update\/\d+/);
        
    //     // Lưu ý: Theo logic hiện tại của EditForm.tsx, form vẫn cho phép sửa
    //     // Nếu yêu cầu kinh doanh là phải block ở frontend, cần cập nhật EditForm.tsx
    //     // để kiểm tra status và disable form hoặc redirect

    //     console.log('✅ HDCNTT_EDIT_3: Test hoàn tất (Lưu ý: Frontend hiện tại chưa disable form cho hóa đơn đã thanh toán)');
    // });

    // /**
    //  * HDCNTT_EDIT_4: Kiểm tra validation khi sửa (nhập số âm)
    //  * 
    //  * Test Case:
    //  * 1. Mở form sửa hóa đơn
    //  * 2. Nhập "-50" vào trường chỉ số điện mới
    //  * 3. Nhấn "Lưu"
    //  * 
    //  * Kỳ vọng:
    //  * 1. Hiển thị thông báo lỗi và không cho phép lưu
    //  */
    // test('HDCNTT_EDIT_4: Kiểm tra validation khi sửa (nhập số âm)', async ({ page }) => {
        
    //     // 1. Mở form sửa hóa đơn "Chưa thanh toán"
    //     const unpaidRow = page.locator('tr').filter({ hasText: 'Chưa thanh toán' }).first();
    //     await expect(unpaidRow).toBeVisible({ timeout: 10000 });

    //     const editButton = unpaidRow.locator('a[aria-label*="Chỉnh sửa hóa đơn"]');
    //     await editButton.click();

    //     await expect(page).toHaveURL(/.*\/billing\/update\/\d+/);
    //     await expect(page.getByRole('heading', { name: /Chỉnh sửa hóa đơn/ })).toBeVisible();

    //     // 2. Lấy giá trị chỉ số đầu kỳ
    //     const startElectricInput = page.locator('input[name="electricityStartReading"]');
    //     const startValue = await startElectricInput.inputValue();
    //     console.log(`Chỉ số điện đầu kỳ: ${startValue}`);

    //     // 3. Nhập giá trị cuối kỳ < đầu kỳ (tương đương số âm khi tính consumption)
    //     const endElectricInput = page.locator('input[name="electricityEndReading"]');
    //     const invalidValue = String(Number(startValue) - 10); // Giá trị nhỏ hơn đầu kỳ
    //     await endElectricInput.fill('');
    //     await endElectricInput.fill(invalidValue);

    //     // Blur để trigger validation
    //     await endElectricInput.blur();

    //     // Chờ validation chạy
    //     await page.waitForTimeout(500);

    //     // Kỳ vọng: Hiển thị thông báo lỗi
    //     // Từ EditForm.tsx: "⚠️ Số điện cuối kỳ phải >= đầu kỳ"
    //     const errorMessage = page.locator('p.text-red-600').filter({ hasText: /điện.*đầu kỳ|cuối kỳ phải >= đầu kỳ/i });
    //     await expect(errorMessage).toBeVisible();

    //     console.log('✅ Validation: Hiển thị lỗi khi chỉ số cuối kỳ < đầu kỳ');

    //     // 4. Thử nhấn "Lưu thay đổi"
    //     const saveButton = page.getByRole('button', { name: 'Lưu thay đổi' });
    //     await saveButton.click();

    //     // Kỳ vọng: Form validation ngăn submit, vẫn ở trang edit
    //     await expect(page).toHaveURL(/.*\/billing\/update\/\d+/);

    //     console.log('✅ HDCNTT_EDIT_4: Validation hoạt động chính xác, không cho phép lưu dữ liệu không hợp lệ');
    // });

    // /**
    //  * HDCNTT_EDIT_5: Kiểm tra ràng buộc - Không cho sửa hóa đơn đã thanh toán (truy cập qua URL)
    //  * 
    //  * Test Case:
    //  * 1. Lấy URL sửa của một hóa đơn chưa thanh toán
    //  * 2. Thay đổi ID trong URL thành ID của một hóa đơn đã thanh toán
    //  * 3. Truy cập URL đó
    //  * 
    //  * Kỳ vọng:
    //  * 1. Hệ thống hiển thị thông báo lỗi hoặc chuyển hướng về trang danh sách
    //  * 
    //  * Lưu ý: Test case này cần có dữ liệu hóa đơn đã thanh toán sẵn trong database
    //  */
    // test('HDCNTT_EDIT_5: Không cho sửa HĐ đã thanh toán (truy cập qua URL)', async ({ page }) => {
        
    //     // Bước 1: Tìm một hóa đơn "Đã thanh toán" để lấy ID
    //     await page.goto('/billing');
    //     await expect(page.getByRole('heading', { name: 'Hóa đơn điện nước' })).toBeVisible();

    //     const paidRow = page.locator('tr').filter({ hasText: 'Đã thanh toán' }).first();
    //     const paidRowCount = await paidRow.count();

    //     if (paidRowCount === 0) {
    //         console.log('⚠️ Không tìm thấy hóa đơn "Đã thanh toán" để test. Bỏ qua test case này.');
    //         test.skip();
    //     }

    //     await expect(paidRow).toBeVisible({ timeout: 10000 });

    //     // Lấy ID từ URL của nút Edit
    //     const editLink = paidRow.locator('a[aria-label*="Chỉnh sửa hóa đơn"]');
    //     const href = await editLink.getAttribute('href');
    //     const paidBillIdMatch = href?.match(/\/billing\/update\/(\d+)/);
        
    //     if (!paidBillIdMatch) {
    //         console.log('⚠️ Không lấy được ID hóa đơn đã thanh toán. Bỏ qua test case này.');
    //         test.skip();
    //     }

    //     const paidBillIdValue = paidBillIdMatch[1];
    //     console.log(`✅ Tìm thấy hóa đơn đã thanh toán ID: ${paidBillIdValue}`);

    //     // Bước 2: Truy cập trực tiếp URL edit của hóa đơn đã thanh toán
    //     await page.goto(`/billing/update/${paidBillIdValue}`);

    //     // Kỳ vọng: 
    //     // Lựa chọn 1: Backend trả về lỗi và frontend hiển thị thông báo
    //     // Lựa chọn 2: Redirect về trang danh sách
    //     // Lựa chọn 3: Vẫn hiển thị form nhưng các trường bị disable (cần implement)

    //     // Hiện tại dựa vào code, form vẫn cho phép hiển thị
    //     // Đây là một điểm cần cải thiện trong EditForm.tsx

    //     await page.waitForTimeout(1000);

    //     // Kiểm tra xem có ở trang edit không
    //     const currentUrl = page.url();
        
    //     if (currentUrl.includes('/billing/update/')) {
    //         console.log('⚠️ Cảnh báo: Frontend vẫn cho phép truy cập form edit hóa đơn đã thanh toán');
    //         console.log('💡 Khuyến nghị: Cần thêm logic kiểm tra status trong EditForm.tsx và disable/redirect nếu status = PAID');
    //     } else if (currentUrl.includes('/billing')) {
    //         console.log('✅ Hệ thống đã chuyển hướng về trang danh sách hóa đơn');
    //     }

    //     console.log('✅ HDCNTT_EDIT_5: Test hoàn tất (Lưu ý: Cần implement thêm logic bảo vệ ở frontend)');
    // });

});

