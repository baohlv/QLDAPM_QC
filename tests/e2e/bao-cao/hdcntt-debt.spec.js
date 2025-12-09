import { test, expect } from '@playwright/test';

/**
 * Test Suite: Công Nợ (HDCNTT-DEBT)
 * Mô tả: Kiểm thử chức năng xem công nợ qua trang Hóa đơn và hiển thị trên dashboard
 * 
 * Lưu ý:
 * - Sử dụng trang "Quản lý Thanh toán" (/billing) với bộ lọc trạng thái
 * - Không có trang riêng cho Công nợ
 */
test.describe('Bộ test case Công Nợ (HDCNTT-DEBT)', () => {

    // ===== NHÓM 1: Các test case diễn ra trên màn hình Hóa đơn (xem Công nợ) =====
    test.describe('Màn hình Hóa đơn - Xem Công nợ', () => {

        test.beforeEach(async ({ page }) => {
            // Step 1: Đăng nhập với tài khoản Chủ trọ
            await page.goto('/login');
            await page.fill('input[id="username"]', process.env.ADMIN_EMAIL);
            await page.fill('input[id="password"]', process.env.ADMIN_PASSWORD);
            await page.click('button[type="submit"]');

            // Chờ đăng nhập thành công và chuyển hướng
            await page.waitForURL('**/dashboard', { timeout: 10000 });

            // Step 2: Điều hướng đến trang "Quản lý Thanh toán"
            await page.getByRole('link', { name: 'Quản lý Thanh toán' }).click();

            // Step 3: Đảm bảo đã vào đúng trang Hóa đơn
            await expect(page.getByRole('heading', { name: 'Hóa đơn điện nước' })).toBeVisible({ timeout: 10000 });
        });

        test('HDCNTT_DEBT_1: Kiểm tra hiển thị danh sách công nợ (chỉ HĐ chưa thanh toán)', async ({ page }) => {
            // Step 1: Chọn bộ lọc "Chưa thanh toán"
            const statusFilter = page.locator('select').filter({ hasText: /Tất cả trạng thái/ });
            await page.waitForTimeout(1000);
            await statusFilter.selectOption({ value: 'UNPAID' });

            // Chờ dữ liệu load
            await page.waitForTimeout(1000);

            // Kỳ vọng 1: Danh sách hiển thị CHỈ các hóa đơn có trạng thái "Chưa thanh toán"
            const unpaidRows = page.locator('tbody tr').filter({ hasText: /Chưa thanh toán|UNPAID/i });
            await page.waitForTimeout(1000);
            console.log("Lọc hóa đơn chưa thanh toán")

            // Kiểm tra có ít nhất 1 hóa đơn chưa thanh toán hiển thị
            const unpaidCount = await unpaidRows.count();

            await page.waitForTimeout(1000);
            if (unpaidCount > 0) {
                await expect(unpaidRows.first()).toBeVisible();
                console.log(`✅ Có ${unpaidCount} hóa đơn chưa thanh toán được hiển thị`);
            } else {
                console.log('ℹ️ Không có hóa đơn chưa thanh toán trong hệ thống');
            }

            // Kỳ vọng 2: Các hóa đơn "Đã thanh toán" KHÔNG xuất hiện trong danh sách này
            const paidRows = page.locator('tbody tr').filter({ hasText: /Đã thanh toán/i });
            await expect(paidRows).toHaveCount(0);
            await page.waitForTimeout(1000);
            console.log('✅ HDCNTT_DEBT_1: Chỉ hiển thị hóa đơn chưa thanh toán');
        });

        // test('HDCNTT_DEBT_2: Kiểm tra logic phân loại "Quá hạn"', async ({ page }) => {
        //     // Step 1: Chọn bộ lọc "Quá hạn"
        //     const statusFilter = page.locator('select').filter({ hasText: /Tất cả trạng thái/ });
        //     await statusFilter.selectOption({ value: 'OVERDUE' });

        //     // Chờ dữ liệu load
        //     await page.waitForTimeout(1000);

        //     // Tìm dòng có trạng thái "Quá hạn" hoặc "OVERDUE"
        //     const overdueRow = page.locator('tbody tr').filter({ hasText: /Quá hạn|OVERDUE/i }).first();

        //     // Kiểm tra xem có hóa đơn quá hạn không
        //     const overdueCount = await page.locator('tbody tr').filter({ hasText: /Quá hạn|OVERDUE/i }).count();

        //     if (overdueCount > 0) {
        //         // Kỳ vọng 1: Hóa đơn quá hạn được hiển thị
        //         await expect(overdueRow).toBeVisible();
        //         console.log('✅ Hóa đơn quá hạn được hiển thị');

        //         // Kỳ vọng 2: Cột "Số ngày quá hạn" hiển thị giá trị (>= 1)
        //         // Thử nhiều cách để tìm cột số ngày quá hạn
        //         const overdueDaysCell = overdueRow.locator('[data-testid="overdue-days"]')
        //             .or(overdueRow.locator('td').filter({ hasText: /^\d+$/ }).last());

        //         const overdueDaysText = await overdueDaysCell.textContent().catch(() => null);

        //         if (overdueDaysText) {
        //             const overdueDays = parseInt(overdueDaysText.trim());
        //             expect(overdueDays).toBeGreaterThanOrEqual(1);
        //             console.log(`✅ Số ngày quá hạn: ${overdueDays}`);
        //         } else {
        //             console.log('ℹ️ Không tìm thấy cột số ngày quá hạn (có thể chưa implement)');
        //         }

        //         // Kỳ vọng 3: Kiểm tra trạng thái "Quá hạn" (có thể bôi đỏ)
        //         // Kiểm tra badge hoặc text có màu đỏ
        //         const statusBadge = overdueRow.locator('[class*="red"], [class*="danger"], .text-red-600, .bg-red-100')
        //             .filter({ hasText: /Quá hạn|OVERDUE/i });

        //         if (await statusBadge.isVisible().catch(() => false)) {
        //             console.log('✅ Trạng thái "Quá hạn" được highlight (màu đỏ)');
        //         }

        //     } else {
        //         console.log('ℹ️ Không có hóa đơn quá hạn trong hệ thống (test case bỏ qua)');
        //     }

        //     console.log('✅ HDCNTT_DEBT_2: Logic phân loại "Quá hạn" hoạt động');
        // });

    //     test('HDCNTT_DEBT_3: Kiểm tra bộ lọc theo tháng', async ({ page }) => {
    //         // Lấy tháng trước (ví dụ: 2025-10 nếu hiện tại là 2025-11)
    //         const currentDate = new Date();
    //         const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    //         const monthValue = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    //         // Step 1: Tìm và điền vào bộ lọc tháng (input type="month")
    //         const monthFilter = page.locator('input[type="month"]');
    //         await expect(monthFilter).toBeVisible();
    //         await monthFilter.fill(monthValue);

    //         // Chờ dữ liệu load (API call tự động trigger khi thay đổi filter)
    //         await page.waitForTimeout(1000);

    //         // Kỳ vọng: Tất cả các dòng đều thuộc tháng đã chọn
    //         const rows = page.locator('tbody tr');
    //         const rowCount = await rows.count();

    //         if (rowCount > 0) {
    //             console.log(`✅ Có ${rowCount} hóa đơn thuộc tháng đã chọn`);

    //             // Kiểm tra một vài dòng đầu tiên có chứa tháng đúng không
    //             for (let i = 0; i < Math.min(3, rowCount); i++) {
    //                 const row = rows.nth(i);
    //                 const rowText = await row.textContent();

    //                 // Kiểm tra text có chứa tháng/năm tương ứng
    //                 const monthYearPattern = new RegExp(`${String(lastMonth.getMonth() + 1).padStart(2, '0')}/${lastMonth.getFullYear()}`);

    //                 if (monthYearPattern.test(rowText)) {
    //                     console.log(`✅ Dòng ${i + 1}: Đúng tháng đã lọc`);
    //                 }
    //             }
    //         } else {
    //             console.log('ℹ️ Không có hóa đơn nào trong tháng đã chọn');
    //         }

    //         console.log('✅ HDCNTT_DEBT_3: Bộ lọc theo tháng hoạt động');
    //     });

    //     test('HDCNTT_DEBT_4: Kiểm tra tìm kiếm theo mã hóa đơn', async ({ page }) => {
    //         // Step 1: Chọn bộ lọc "Chưa thanh toán" để có danh sách công nợ
    //         const statusFilter = page.locator('select').filter({ hasText: /Tất cả trạng thái/ });
    //         await statusFilter.selectOption({ value: 'UNPAID' });
    //         await page.waitForTimeout(1000);

    //         // Step 2: Lấy mã hóa đơn đầu tiên để test tìm kiếm
    //         const firstRow = page.locator('tbody tr').first();
    //         const firstRowVisible = await firstRow.isVisible().catch(() => false);

    //         if (firstRowVisible) {
    //             // Lấy mã hóa đơn từ cột đầu tiên
    //             const billCode = await firstRow.locator('td').first().textContent();
    //             console.log(`ℹ️ Mã hóa đơn để test: ${billCode?.trim()}`);

    //             // Step 3: Nhập vào ô tìm kiếm
    //             const searchInput = page.locator('input[placeholder*="Tìm theo mã hóa đơn"]')
    //                 .or(page.locator('input[type="text"]').first());

    //             await searchInput.fill(billCode?.trim() || '');
    //             await page.waitForTimeout(500);

    //             // Kỳ vọng: Chỉ hiển thị hóa đơn có mã chứa từ khóa tìm kiếm
    //             const visibleRows = page.locator('tbody tr');
    //             const rowCount = await visibleRows.count();

    //             if (rowCount > 0) {
    //                 console.log(`✅ Tìm thấy ${rowCount} hóa đơn khớp với từ khóa`);

    //                 // Verify tất cả các dòng đều chứa mã hóa đơn tìm kiếm
    //                 for (let i = 0; i < rowCount; i++) {
    //                     const row = visibleRows.nth(i);
    //                     const rowText = await row.textContent();

    //                     if (rowText && rowText.includes(billCode?.trim() || '')) {
    //                         console.log(`✅ Dòng ${i + 1}: Chứa mã hóa đơn đúng`);
    //                     }
    //                 }
    //             } else {
    //                 console.log('ℹ️ Không tìm thấy kết quả');
    //             }
    //         } else {
    //             console.log('ℹ️ Không có hóa đơn để test tìm kiếm');
    //         }

    //         console.log('✅ HDCNTT_DEBT_4: Tìm kiếm theo mã hóa đơn hoạt động');
    //     });
    // });

    // // ===== TEST RIÊNG: Kiểm tra Dashboard (không dùng beforeEach ở trên) =====
    // test('HDCNTT_DEBT_5: Kiểm tra hiển thị tổng nợ trên dashboard', async ({ page }) => {
    //     // Step 1: Đăng nhập
    //     await page.goto('/login');
    //     await page.fill('input[id="username"]', process.env.ADMIN_EMAIL);
    //     await page.fill('input[id="password"]', process.env.ADMIN_PASSWORD);
    //     await page.click('button[type="submit"]');

    //     // Chờ đăng nhập thành công
    //     await page.waitForURL('**/dashboard', { timeout: 10000 });

    //     // Step 2: Đảm bảo đang ở trang Dashboard
    //     await page.goto('/dashboard');

    //     // Kiểm tra tiêu đề Dashboard
    //     await expect(page.getByRole('heading', { name: /Chào mừng/i })).toBeVisible({ timeout: 10000 });

    //     // Kỳ vọng: Widget "Tổng công nợ" hiển thị trên dashboard
    //     // Cách 1: Tìm theo data-testid
    //     let debtWidget = page.getByTestId('total-debt-widget')
    //         .or(page.getByTestId('debt-widget'))
    //         .or(page.getByTestId('cong-no-widget'));

    //     // Cách 2: Nếu không có testid, tìm theo text "Công nợ" hoặc "Tổng công nợ"
    //     if (!await debtWidget.isVisible().catch(() => false)) {
    //         debtWidget = page.locator('div').filter({ hasText: /Tổng công nợ|Công nợ/i }).first();
    //     }

    //     // Cách 3: Tìm theo cấu trúc (StatCard component từ dashboard/page.tsx)
    //     if (!await debtWidget.isVisible().catch(() => false)) {
    //         // Tìm card có icon Banknote và text "Công nợ"
    //         const statCards = page.locator('.bg-white.p-6.rounded-lg.shadow-md, [class*="stat-card"], [class*="card"]');
    //         const cardCount = await statCards.count();

    //         for (let i = 0; i < cardCount; i++) {
    //             const card = statCards.nth(i);
    //             const cardText = await card.textContent();

    //             if (cardText && /công nợ|debt|nợ/i.test(cardText)) {
    //                 debtWidget = card;
    //                 break;
    //             }
    //         }
    //     }

    //     // Kiểm tra widget hiển thị
    //     if (await debtWidget.isVisible().catch(() => false)) {
    //         await expect(debtWidget).toBeVisible();
    //         console.log('✅ Widget "Tổng công nợ" được hiển thị trên dashboard');

    //         // Lấy giá trị tổng nợ từ widget
    //         const widgetText = await debtWidget.textContent();

    //         // Tìm số tiền trong text (format: 4.500.000đ hoặc 4,500,000đ)
    //         const moneyPattern = /[\d,.]+\s*đ/;
    //         const moneyMatch = widgetText?.match(moneyPattern);

    //         if (moneyMatch) {
    //             const totalDebt = moneyMatch[0];
    //             console.log(`✅ Tổng công nợ hiển thị: ${totalDebt}`);

    //             // Giả định: Dữ liệu test có 2 HĐ nợ: P.101 (2.000.000đ) + P.102 (2.500.000đ) = 4.500.000đ
    //             // Kiểm tra giá trị có đúng không
    //             const expectedDebt = '4.500.000đ';
    //             const normalizedActual = totalDebt.replace(/[,.\s]/g, '');
    //             const normalizedExpected = expectedDebt.replace(/[,.\s]/g, '');

    //             if (normalizedActual === normalizedExpected) {
    //                 console.log(`✅ Tổng công nợ chính xác: ${expectedDebt}`);
    //             } else {
    //                 console.log(`ℹ️ Tổng công nợ: ${totalDebt} (dữ liệu test khác với giả định)`);
    //             }

    //             // Kiểm tra số tiền > 0
    //             const debtValue = parseInt(totalDebt.replace(/[^\d]/g, ''));
    //             expect(debtValue).toBeGreaterThan(0);

    //         } else {
    //             console.log('⚠️ Không tìm thấy giá trị tiền trong widget');
    //         }

    //     } else {
    //         console.log('⚠️ Không tìm thấy widget "Tổng công nợ" trên dashboard (có thể chưa implement)');

    //         // Hiển thị các widget hiện có để debug
    //         const allCards = page.locator('.bg-white.p-6.rounded-lg.shadow-md, [class*="stat-card"]');
    //         const cardCount = await allCards.count();
    //         console.log(`ℹ️ Số widget trên dashboard: ${cardCount}`);

    //         for (let i = 0; i < cardCount; i++) {
    //             const card = allCards.nth(i);
    //             const title = await card.locator('p').first().textContent();
    //             console.log(`  - Widget ${i + 1}: ${title}`);
    //         }
    //     }

    //     console.log('✅ HDCNTT_DEBT_5: Kiểm tra widget tổng nợ trên dashboard hoàn tất');
    });
});

