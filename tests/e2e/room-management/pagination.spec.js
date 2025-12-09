import { test, expect } from '@playwright/test';

test.describe('Kiểm tra phân trang - Room Management', () => {
    // console.log('Kiểm tra phân trang - Room Management');
    test.beforeEach(async ({ page }) => {
        console.log('Kiểm tra phân trang - Room Management');
        // // Đăng nhập và điều hướng đến trang Quản lý phòng
        await page.goto('/login');
        console.log('Đã điều hướng đến trang login');

        // Thực hiện đăng nhập
        await page.fill('input[id="username"]', 'landlord1');
        await page.fill('input[id="password"]', 'pass123');
        await page.click('button[type="submit"], button:has-text("Đăng nhập")');
        console.log('Đã đăng nhập');

        // Chờ đăng nhập thành công và chuyển hướng
        await expect(page).toHaveURL('**/dashboard', { timeout: 10000 });
        console.log('Đã chuyển hướng đến trang dashboard');

        // Điều hướng đến trang Quản lý phòng
        await page.goto('/room');
        console.log('Đã điều hướng đến trang Quản lý phòng');

        // Chờ trang tải xong
        await page.waitForSelector('h1:has-text("Căn hộ")', { timeout: 10000 });
        // await page.waitForLoadState('networkidle');
        console.log('Đã chờ trang tải xong');
    });

    test('Kiểm tra phân trang trên màn hình Quản lý phòng', async ({ page }) => {
        // Step 1: Mở trang Quản lý phòng (đã thực hiện trong beforeEach)

        // Verify we're on the correct page
        await expect(page.locator('h1:has-text("Căn hộ")')).toBeVisible();

        // Step 2: Kiểm tra danh sách phòng hiển thị
        const roomRows = page.locator('tbody tr');
        await expect(roomRows.first()).toBeVisible({ timeout: 10000 });

        // Đếm số lượng phòng trên trang đầu tiên
        const roomsCount = await roomRows.count();
        console.log(`Số lượng phòng hiển thị: ${roomsCount}`);

        // Kết quả mong đợi 1: Danh sách hiển thị đúng số lượng phòng (tối đa 9 phòng/trang)
        expect(roomsCount).toBeGreaterThan(0);
        expect(roomsCount).toBeLessThanOrEqual(9); // ITEMS_PER_PAGE = 9

        // Step 3: Kiểm tra các nút phân trang hiển thị
        const paginationContainer = page.locator('.flex.justify-between.items-center.mt-6');
        await expect(paginationContainer).toBeVisible();

        // Kiểm tra nút Previous
        const previousButton = page.locator('button:has-text("← Trước")');
        await expect(previousButton).toBeVisible();

        // Kiểm tra nút Next
        const nextButton = page.locator('button:has-text("Sau →")');
        await expect(nextButton).toBeVisible();

        // Kiểm tra nút trang số 1
        const page1Button = page.locator('nav button:has-text("1")');
        await expect(page1Button).toBeVisible();

        // Verify trang 1 đang active (có class bg-slate-100)
        await expect(page1Button).toHaveClass(/bg-slate-100/);

        // Step 4: Kiểm tra chức năng chuyển trang

        // Kiểm tra nút Previous bị disabled trên trang đầu
        await expect(previousButton).toBeDisabled();

        // Kiểm tra có trang 2 không
        const page2Button = page.locator('nav button:has-text("2")');
        const hasPage2 = await page2Button.isVisible();

        if (hasPage2) {
            console.log('Có trang 2, thực hiện test chuyển trang...');

            // Test chuyển sang trang 2 bằng nút Next
            await nextButton.click();

            // Chờ dữ liệu tải
            // await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000); // Đợi animation nếu có

            // Verify đã chuyển sang trang 2
            await expect(page2Button).toHaveClass(/bg-slate-100/);
            await expect(page1Button).not.toHaveClass(/bg-slate-100/);

            // Kiểm tra số lượng phòng trên trang 2
            const page2RoomsCount = await roomRows.count();
            expect(page2RoomsCount).toBeGreaterThan(0);
            expect(page2RoomsCount).toBeLessThanOrEqual(9);

            // Nút Previous giờ phải được enable
            await expect(previousButton).toBeEnabled();

            console.log(`Trang 2 hiển thị ${page2RoomsCount} phòng`);

            // Test quay lại trang 1 bằng nút Previous
            await previousButton.click();

            // Chờ dữ liệu tải
            // await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Verify đã quay về trang 1
            await expect(page1Button).toHaveClass(/bg-slate-100/);
            await expect(page2Button).not.toHaveClass(/bg-slate-100/);

            // Nút Previous lại bị disabled
            await expect(previousButton).toBeDisabled();

            // Test click trực tiếp vào số trang 2
            await page2Button.click();

            // Chờ dữ liệu tải
            // await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            // Verify đã chuyển sang trang 2
            await expect(page2Button).toHaveClass(/bg-slate-100/);

            console.log('✅ Tất cả chức năng phân trang hoạt động chính xác');

        } else {
            console.log('Chỉ có 1 trang dữ liệu, nút Next bị disabled');

            // Nếu chỉ có 1 trang, nút Next phải bị disabled
            await expect(nextButton).toBeDisabled();
        }

        // Verify tổng số phòng được hiển thị trong header
        const totalRoomsText = page.locator('p.text-slate-500');
        await expect(totalRoomsText).toBeVisible();

        const totalRoomsMatch = await totalRoomsText.textContent();
        console.log(`Thông tin tổng số phòng: ${totalRoomsMatch}`);
    });

    // test('Kiểm tra phân trang với dữ liệu nhiều trang', async ({ page }) => {
    //     // Verify pagination controls exist
    //     const paginationContainer = page.locator('.flex.justify-between.items-center.mt-6');
    //     await expect(paginationContainer).toBeVisible();

    //     // Count total pages by checking page number buttons
    //     const pageButtons = page.locator('nav button').filter({ hasText: /^\d+$/ });
    //     const totalPages = await pageButtons.count();

    //     console.log(`Tổng số trang: ${totalPages}`);

    //     if (totalPages > 1) {
    //         // Test navigation through all pages
    //         for (let i = 1; i <= Math.min(totalPages, 3); i++) {
    //             const pageButton = page.locator(`nav button:has-text("${i}")`);

    //             if (await pageButton.isVisible()) {
    //                 await pageButton.click();
    //                 // await page.waitForLoadState('networkidle');

    //                 // Verify page is active
    //                 await expect(pageButton).toHaveClass(/bg-slate-100/);

    //                 // Verify rooms are displayed
    //                 const roomRows = page.locator('tbody tr');
    //                 const roomsCount = await roomRows.count();
    //                 expect(roomsCount).toBeGreaterThan(0);

    //                 console.log(`Trang ${i}: ${roomsCount} phòng`);
    //             }
    //         }
    //     }
    // });

    // test('Kiểm tra responsive pagination trên mobile', async ({ page }) => {
    //     // Set mobile viewport
    //     await page.setViewportSize({ width: 375, height: 667 });

    //     // Reload page for mobile layout
    //     await page.reload();
    //     await page.waitForSelector('h1:has-text("Căn hộ")', { timeout: 10000 });

    //     // Verify pagination is still visible on mobile
    //     const paginationContainer = page.locator('.flex.justify-between.items-center.mt-6');
    //     await expect(paginationContainer).toBeVisible();

    //     // Test navigation on mobile
    //     const nextButton = page.locator('button:has-text("Sau →")');
    //     const page2Button = page.locator('nav button:has-text("2")');

    //     if (await page2Button.isVisible()) {
    //         await nextButton.click();
    //         // await page.waitForLoadState('networkidle');

    //         // Verify navigation works on mobile
    //         await expect(page2Button).toHaveClass(/bg-slate-100/);

    //         console.log('✅ Pagination hoạt động tốt trên mobile');
    //     }
    // });
});
