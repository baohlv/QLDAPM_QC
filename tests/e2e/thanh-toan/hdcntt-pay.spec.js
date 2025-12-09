import { test, expect } from '@playwright/test';

/**
 * Test Suite: Mô Phỏng Thanh Toán (HDCNTT-PAY)
 * Mô tả: Kiểm thử chức năng thanh toán hóa đơn và lịch sử giao dịch
 * 
 * Lưu ý:
 * - Test case PAY_2, PAY_3, PAY_4 sử dụng page.route() để mock callback từ cổng thanh toán
 * - Test case PAY_1 và PAY_5 là test UI thông thường
 */

/**
 * ================================================================================
 * CONFIGURATION & CONSTANTS
 * ================================================================================
 */

// ID của một hóa đơn "Chưa thanh toán" để test
// Bạn cần thay đổi giá trị này để phù hợp với database test của bạn
const UNPAID_INVOICE_ID = process.env.TEST_UNPAID_INVOICE_ID || '3';

// Base URLs từ environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

/**
 * ================================================================================
 * HELPER FUNCTIONS
 * ================================================================================
 */

/**
 * Đăng nhập với vai trò Người thuê
 * @param {import('@playwright/test').Page} page
 */
async function loginAsTenant(page) {
    await page.goto('/login');

    // Sử dụng credentials từ environment variables
    await page.fill('input[id="username"]', process.env.TENANT_EMAIL || 'tenant@example.com');
    await page.fill('input[id="password"]', process.env.TENANT_PASSWORD || 'password123');
    await page.click('button[type="submit"]');

    // Chờ đăng nhập thành công
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Đăng nhập với vai trò Chủ trọ
 * @param {import('@playwright/test').Page} page
 */
async function loginAsLandlord(page) {
    await page.goto('/login');

    await page.fill('input[id="username"]', process.env.ADMIN_EMAIL);
    await page.fill('input[id="password"]', process.env.ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Chờ đăng nhập thành công
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * ================================================================================
 * TEST SUITE
 * ================================================================================
 */

test.describe('Bộ test case Mô Phỏng Thanh Toán (HDCNTT-PAY)', () => {

    /**
     * --------------------------------------------------------------------------------
     * Nhóm 1: Giao diện và Lịch sử (UI Tests)
     * --------------------------------------------------------------------------------
     */
    test.describe('Giao diện và Lịch sử (UI Tests)', () => {

        test('HDCNTT_PAY_1: Kiểm tra giao diện thanh toán online', async ({ page }) => {
            console.log('🧪 HDCNTT_PAY_1: Bắt đầu kiểm tra giao diện thanh toán online');

            // Step 1: Đăng nhập với vai trò Người thuê hoặc Chủ trọ
            await loginAsLandlord(page);
            console.log('✅ Đã đăng nhập thành công');

            // Step 2: Điều hướng đến trang chi tiết hóa đơn "Chưa thanh toán"
            await page.goto(`/billing/detail/${UNPAID_INVOICE_ID}`);

            // Đợi trang load xong
       // await page.waitForLoadState('networkidle');\
            // await page.waitForTimeout(1000);
            console.log(`✅ Đã mở trang chi tiết hóa đơn ID: ${UNPAID_INVOICE_ID}`);

            // Kỳ vọng 1: Nút "Thanh toán" được hiển thị
            const payButton = page.getByRole('button', { name: 'Thanh toán' });
            await expect(payButton).toBeVisible();
            await page.waitForTimeout(1000);
            console.log('✅ Kỳ vọng 1: Nút "Thanh toán" được hiển thị');
            
            // Kỳ vọng 2: Hiển thị phần thông tin thanh toán
            // Kiểm tra section thanh toán (theo code: bg-emerald-50 border-2 border-dashed)
            const paymentSection = page.locator('.bg-emerald-50.border-dashed');
            await expect(paymentSection).toBeVisible();

            // Kiểm tra heading "Thanh toán hóa đơn"
            await expect(page.getByText('Thanh toán hóa đơn')).toBeVisible();
            await page.waitForTimeout(1000);
            console.log('✅ Kỳ vọng 2: Hiển thị phần thông tin thanh toán');

            console.log('🎉 HDCNTT_PAY_1: PASSED - Giao diện thanh toán hiển thị đầy đủ');
        });

    // //     test('HDCNTT_PAY_5: Kiểm tra hiển thị lịch sử giao dịch', async ({ page }) => {
    // //         console.log('🧪 HDCNTT_PAY_5: Bắt đầu kiểm tra lịch sử giao dịch');

    // //         // Lưu ý: Hiện tại frontend chưa có trang "Lịch sử giao dịch" riêng biệt
    // //         // Tuy nhiên, ta có thể kiểm tra thông tin giao dịch trên trang chi tiết hóa đơn
    // //         // Hoặc có thể test trên trang danh sách hóa đơn

    // //         // Step 1: Đăng nhập
    // //         await loginAsLandlord(page);
    // //         console.log('✅ Đã đăng nhập thành công');

    // //         // Step 2: Điều hướng đến trang danh sách hóa đơn (tạm thời thay thế cho lịch sử giao dịch)
    // //         await page.goto('/billing');
    // //    // await page.waitForLoadState('networkidle');
    // //         console.log('✅ Đã mở trang danh sách hóa đơn');

    // //         // Kỳ vọng: Hiển thị tiêu đề trang
    // //         await expect(page.getByRole('heading', { name: 'Hóa đơn điện nước' })).toBeVisible();
    // //         console.log('✅ Tiêu đề trang được hiển thị');

    // //         // Kỳ vọng: Kiểm tra bảng hiển thị hóa đơn
    // //         const table = page.locator('table');
    // //         const tableExists = await table.count() > 0;

    // //         if (tableExists) {
    // //             console.log('✅ Bảng danh sách hóa đơn được hiển thị');

    // //             // Kiểm tra các cột trong bảng (dựa trên component Billings_Table)
    // //             // Mã hóa đơn, Phòng, Kỳ thanh toán, Tổng tiền, Trạng thái
    // //             const headerRow = table.locator('thead tr').first();

    // //             // Kiểm tra sự tồn tại của các header
    // //             const hasHeaders = await headerRow.locator('th').count() > 0;
    // //             expect(hasHeaders).toBe(true);
    // //             console.log('✅ Các cột header được hiển thị');

    // //             // Kiểm tra sự tồn tại của các trạng thái
    // //             const statusBadges = page.locator('text=/Đã thanh toán|Chưa thanh toán|Quá hạn|Đã hủy/');
    // //             const hasStatus = await statusBadges.count() > 0;

    // //             if (hasStatus) {
    // //                 console.log('✅ Trạng thái giao dịch được hiển thị');
    // //             } else {
    // //                 console.log('⚠️ Chưa có dữ liệu giao dịch trong bảng');
    // //             }
    // //         } else {
    // //             console.log('⚠️ Không tìm thấy bảng, có thể chưa có dữ liệu');
    // //             // Kiểm tra thông báo "Không tìm thấy hóa đơn nào"
    // //             await expect(page.getByText('Không tìm thấy hóa đơn nào')).toBeVisible();
    // //         }

    // //         console.log('🎉 HDCNTT_PAY_5: PASSED - Lịch sử giao dịch hiển thị đúng');
    // //     });
    });

    /**
     * --------------------------------------------------------------------------------
     * Nhóm 2: Luồng mô phỏng Callback (Mock Tests)
     * --------------------------------------------------------------------------------
     */
    // test.describe('Luồng mô phỏng Callback (Mock Tests)', () => {

    //     test.beforeEach(async ({ page }) => {
    //         // Đăng nhập với vai trò Chủ trọ (hoặc Người thuê tùy thuộc vào quyền)
    //         await loginAsLandlord(page);

    //         // Điều hướng đến trang hóa đơn chi tiết
    //         await page.goto(`/billing/detail/${UNPAID_INVOICE_ID}`);
    //    // await page.waitForLoadState('networkidle');

    //         // Verify nút Thanh toán hiển thị
    //         await expect(page.getByRole('button', { name: 'Thanh toán' })).toBeVisible();

    //         console.log(`✅ beforeEach: Đã điều hướng đến hóa đơn ID ${UNPAID_INVOICE_ID}`);
    //     });

    //     test('HDCNTT_PAY_2: Kiểm tra luồng thanh toán thành công (Happy Path)', async ({ page }) => {
    //         console.log('🧪 HDCNTT_PAY_2: Bắt đầu kiểm tra luồng thanh toán thành công');

    //         // Step 1: Mock API callback VNPay với trạng thái thành công
    //         // Khi VNPay redirect về, URL sẽ có dạng: /billing/detail/[id]?vnp_ResponseCode=00&vnp_TxnRef=...
    //         await page.route('**/v1/landlord/dashboard/create-qr-vnpay**', async (route) => {
    //             console.log('🔧 Mock: Giả lập API tạo QR code');
    //             await route.fulfill({
    //                 status: 200,
    //                 contentType: 'application/json',
    //                 body: JSON.stringify({
    //                     qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    //                     paymentUrl: `${FRONTEND_URL}/billing/detail/${UNPAID_INVOICE_ID}?vnp_ResponseCode=00&vnp_TxnRef=BILL${UNPAID_INVOICE_ID}`
    //                 }),
    //             });
    //         });

    //         // Step 2: Nhấn nút "Thanh toán"
    //         const payButton = page.getByRole('button', { name: 'Thanh toán' });
    //         await payButton.click();
    //         console.log('✅ Đã nhấn nút "Thanh toán"');

    //         // Step 3: Đợi modal QR code hiển thị
    //         await page.waitForTimeout(1000);

    //         // Kiểm tra modal hiển thị
    //         const qrModal = page.locator('.fixed.inset-0.z-50');
    //         await expect(qrModal).toBeVisible();
    //         console.log('✅ Modal QR code hiển thị');

    //         // Kiểm tra heading modal
    //         await expect(page.getByRole('heading', { name: 'Quét mã QR để thanh toán' })).toBeVisible();

    //         // Step 4: Lấy link thanh toán và điều hướng đến (giả lập callback thành công)
    //         const paymentLink = page.locator('a:has-text("Thanh toán ngay")');
    //         await expect(paymentLink).toBeVisible();

    //         // Click vào link thanh toán (sẽ redirect với vnp_ResponseCode=00)
    //         await paymentLink.click();
    //         console.log('✅ Đã click "Thanh toán ngay"');

    //         // Step 5: Đợi alert hiển thị thông báo thành công
    //         page.once('dialog', async (dialog) => {
    //             console.log(`📢 Alert message: ${dialog.message()}`);
    //             expect(dialog.message()).toContain('Thanh toán thành công');
    //             await dialog.accept();
    //         });

    //         // Đợi một chút để alert xuất hiện
    //         await page.waitForTimeout(2000);

    //         console.log('✅ Kỳ vọng 1: Hiển thị thông báo "Thanh toán thành công"');

    //         // Kỳ vọng 2: Trạng thái hóa đơn chuyển thành "Đã thanh toán"
    //         // (Lưu ý: Trong mock test, frontend sẽ không thực sự cập nhật database,
    //         // nhưng UI nên phản ánh trạng thái mới sau khi reload)

    //         // Kỳ vọng 3: Nút "Thanh toán" bị ẩn hoặc disabled
    //         // await expect(page.getByRole('button', { name: 'Thanh toán' })).toBeHidden();
    //         // console.log('✅ Kỳ vọng 3: Nút "Thanh toán" đã bị ẩn');

    //         console.log('🎉 HDCNTT_PAY_2: PASSED - Thanh toán thành công');
    //     });

        // test('HDCNTT_PAY_3: Kiểm tra luồng thanh toán khi người dùng hủy', async ({ page }) => {
        //     console.log('🧪 HDCNTT_PAY_3: Bắt đầu kiểm tra luồng thanh toán bị hủy');

        //     // Step 1: Mock API callback với trạng thái "Cancelled"
        //     await page.route('**/v1/landlord/dashboard/create-qr-vnpay**', async (route) => {
        //         console.log('🔧 Mock: Giả lập API tạo QR code');
        //         await route.fulfill({
        //             status: 200,
        //             contentType: 'application/json',
        //             body: JSON.stringify({
        //                 qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        //                 paymentUrl: `${FRONTEND_URL}/billing/detail/${UNPAID_INVOICE_ID}?vnp_ResponseCode=24&vnp_TxnRef=BILL${UNPAID_INVOICE_ID}`
        //             }),
        //         });
        //     });

        //     // Step 2: Nhấn nút "Thanh toán"
        //     await page.getByRole('button', { name: 'Thanh toán' }).click();
        //     console.log('✅ Đã nhấn nút "Thanh toán"');

        //     // Step 3: Đợi modal hiển thị
        //     await page.waitForTimeout(1000);
        //     const qrModal = page.locator('.fixed.inset-0.z-50');
        //     await expect(qrModal).toBeVisible();

        //     // Step 4: Click vào link thanh toán (giả lập người dùng hủy với vnp_ResponseCode=24)
        //     const paymentLink = page.locator('a:has-text("Thanh toán ngay")');
        //     await paymentLink.click();
        //     console.log('✅ Đã click "Thanh toán ngay" (giả lập hủy giao dịch)');

        //     // Step 5: Đợi alert hiển thị thông báo hủy
        //     page.once('dialog', async (dialog) => {
        //         console.log(`📢 Alert message: ${dialog.message()}`);
        //         expect(dialog.message()).toContain('Thanh toán thất bại');
        //         await dialog.accept();
        //     });

        //     await page.waitForTimeout(2000);
        //     console.log('✅ Kỳ vọng 1: Hiển thị thông báo "Giao dịch đã bị hủy" hoặc "Thanh toán thất bại"');

        //     // Kỳ vọng 2: Trạng thái hóa đơn vẫn là "Chưa thanh toán"
        //     // (UI không thay đổi, vẫn hiển thị nút Thanh toán)

        //     console.log('🎉 HDCNTT_PAY_3: PASSED - Luồng hủy thanh toán hoạt động đúng');
        // });

        // test('HDCNTT_PAY_4: Kiểm tra luồng thanh toán thất bại', async ({ page }) => {
        //     console.log('🧪 HDCNTT_PAY_4: Bắt đầu kiểm tra luồng thanh toán thất bại');

        //     // Step 1: Mock API callback với trạng thái "Failed"
        //     // VNPay response code khác 00 (ví dụ: 07 - Trừ tiền thành công nhưng giao dịch nghi ngờ)
        //     await page.route('**/v1/landlord/dashboard/create-qr-vnpay**', async (route) => {
        //         console.log('🔧 Mock: Giả lập API tạo QR code');
        //         await route.fulfill({
        //             status: 200,
        //             contentType: 'application/json',
        //             body: JSON.stringify({
        //                 qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        //                 paymentUrl: `${FRONTEND_URL}/billing/detail/${UNPAID_INVOICE_ID}?vnp_ResponseCode=07&vnp_TxnRef=BILL${UNPAID_INVOICE_ID}`
        //             }),
        //         });
        //     });

        //     // Step 2: Nhấn nút "Thanh toán"
        //     await page.getByRole('button', { name: 'Thanh toán' }).click();
        //     console.log('✅ Đã nhấn nút "Thanh toán"');

        //     // Step 3: Đợi modal hiển thị
        //     await page.waitForTimeout(1000);
        //     const qrModal = page.locator('.fixed.inset-0.z-50');
        //     await expect(qrModal).toBeVisible();

        //     // Step 4: Click vào link thanh toán (giả lập giao dịch thất bại)
        //     const paymentLink = page.locator('a:has-text("Thanh toán ngay")');
        //     await paymentLink.click();
        //     console.log('✅ Đã click "Thanh toán ngay" (giả lập giao dịch thất bại)');

        //     // Step 5: Đợi alert hiển thị thông báo thất bại
        //     page.once('dialog', async (dialog) => {
        //         console.log(`📢 Alert message: ${dialog.message()}`);
        //         expect(dialog.message()).toContain('Thanh toán thất bại');
        //         await dialog.accept();
        //     });

        //     await page.waitForTimeout(2000);
        //     console.log('✅ Kỳ vọng 1: Hiển thị thông báo "Thanh toán thất bại"');

        //     // Kỳ vọng 2: Trạng thái hóa đơn vẫn là "Chưa thanh toán"
        //     // (UI không thay đổi, vẫn hiển thị nút Thanh toán)

        //     console.log('🎉 HDCNTT_PAY_4: PASSED - Luồng thanh toán thất bại hoạt động đúng');
        // });
    // });
});

