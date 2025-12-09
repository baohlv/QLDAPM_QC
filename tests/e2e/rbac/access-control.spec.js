import { test, expect, request } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import dotenv from 'dotenv';

dotenv.config({ path: 'env.test' });

/**
 * Test Suite: Role-Based Access Control (RBAC) & Security
 * 
 * Mục tiêu: Đảm bảo người dùng chỉ truy cập được đúng tài nguyên và chức năng được cấp phép.
 * 
 * Roles trong hệ thống:
 * - LANDLORD: Chủ trọ (có quyền quản trị đầy đủ)
 * - RENTER: Người thuê (có quyền hạn chế)
 */

// =============================================================================
// GROUP 1: LANDLORD (ADMIN) ACCESS - Kiểm tra quyền của Chủ trọ
// =============================================================================
test.describe('RBAC - Landlord (Admin) Access', () => {
    // let landlordPage;

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[id="username"]', process.env.ADMIN_EMAIL || '');
        await page.fill('input[id="password"]', process.env.ADMIN_PASSWORD || '');
        await page.click('button[type="submit"]');

        // Chờ đăng nhập thành công và chuyển hướng
        // await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('RBAC_UI_1: Kiểm tra giao diện Dashboard cho quyền Landlord (Admin)', async ({ page }) => {
        // Pre-condition: Đã đăng nhập bằng tài khoản Landlord
        await page.waitForURL('**/dashboard');

        // Verify URL
        expect(page.url()).toContain('/dashboard');

        // Verify Dashboard title
        const pageTitle = await page.locator('h1').first().textContent();
        expect(pageTitle).toContain('Tổng quan');

        // Verify sidebar menu items are visible for Landlord
        const sidebar = page.locator('aside');
        await expect(sidebar).toBeVisible();

        // Verify all menu items exist for Landlord
        const menuItems = [
            'Tổng quan',
            'Quản lý Căn Hộ',
            'Hóa đơn',
            'Thông báo',
            'Tài Sản'
        ];

        for (const item of menuItems) {
            const menuItem = page.locator(`aside >> text="${item}"`);
            await expect(menuItem).toBeVisible();
        }

        console.log('✅ RBAC_UI_1: Landlord dashboard hiển thị đầy đủ menu');
    });

    test('RBAC_UI_3: Landlord có thể truy cập tất cả các chức năng quản trị', async ({ page }) => {
        // Verify Landlord can access all protected routes
        await page.waitForURL('**/dashboard');
        const protectedRoutes = [
            '/dashboard',
            '/room',
            '/billing',
            '/notifications',
            '/assets'
        ];

        for (const route of protectedRoutes) {
            await page.goto(route);

            // Should not redirect to login
            expect(page.url()).toContain(route);

            // Should not show 403 or 404 error
            const errorText = await page.locator('body').textContent();
            expect(errorText).not.toContain('403');
            expect(errorText).not.toContain('Forbidden');

            console.log(`✅ Landlord accessed: ${route}`);
        }
    });

    test('RBAC_DATA_2: Landlord có thể xem tất cả dữ liệu phòng', async ({ page }) => {
        // Navigate to room management
        await page.goto('/room');
        await page.waitForLoadState('networkidle');

        // Check if rooms are displayed
        const roomsSection = page.locator('main');
        await expect(roomsSection).toBeVisible();

        // Verify page contains room data (not an empty state)
        const bodyContent = await page.locator('body').textContent();

        // Should see room management interface
        expect(bodyContent).not.toContain('Access Denied');
        expect(bodyContent).not.toContain('Không có quyền truy cập');

        console.log('✅ RBAC_DATA_2: Landlord có thể xem danh sách phòng');
    });
});

// =============================================================================
// GROUP 2: RENTER (TENANT) ACCESS - Kiểm tra hạn chế quyền của Người thuê
// =============================================================================
test.describe('RBAC - Renter (Tenant) Access Restrictions', () => {
    // Note: Trong test này, chúng ta cần tạo tài khoản RENTER riêng
    // hoặc sử dụng TEST_USER_EMAIL nếu đó là RENTER
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[id="username"]', process.env.TEST_USER_EMAIL || '');
        await page.fill('input[id="password"]', process.env.TEST_USER_PASSWORD || '');
        await page.click('button[type="submit"]');

        // Chờ đăng nhập thành công và chuyển hướng
        // await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('RBAC_UI_2: Kiểm tra giao diện Dashboard cho quyền Renter (Tenant)', async ({ page }) => {
        // Note: Skip test này vì cần có tài khoản RENTER trong database
        // TODO: Thêm RENTER_EMAIL và RENTER_PASSWORD vào .env.test
        await page.waitForURL('**/dashboard');


        // Verify dashboard shows different title for Renter
        const pageTitle = await page.locator('h1').first().textContent();
        expect(pageTitle).toContain('Căn hộ của tôi');

        // Verify menu items are same (based on current implementation)
        // Note: Trong code hiện tại, menu items giống nhau cho cả LANDLORD và RENTER
        // Chỉ có label của dashboard item thay đổi

        console.log('✅ RBAC_UI_2: Renter dashboard hiển thị label phù hợp');
    });

    // test('RBAC_DATA_1: Kiểm tra cô lập dữ liệu (Data Isolation)', async ({ page }) => {
    //     // Note: Test này cần setup database với nhiều landlord/renter
    //     // để kiểm tra data isolation giữa các tenant

    //     await page.waitForURL('**/dashboard');;

    //     // Navigate to billing page
    //     await page.goto('/billing');
    //     await page.waitForLoadState('networkidle');

    //     // Verify only sees their own data
    //     // TODO: Implement logic to verify data isolation
    //     // - Get current user ID from session
    //     // - Verify all displayed bills belong to this user
    //     // - Verify no data from other users is visible

    //     console.log('✅ RBAC_DATA_1: Data isolation verified');
    // });
});

// =============================================================================
// GROUP 3: SECURITY CHECKS - Guest Access (Unauthenticated)
// =============================================================================
test.describe('RBAC - Security Checks (Guest & Unauthorized Access)', () => {

    test('RBAC_SEC_2: Kiểm tra bảo mật Guest (Chưa đăng nhập)', async ({ page, context }) => {
        // Clear all cookies to simulate guest user
        await context.clearCookies();

        // List of protected routes that should redirect to login
        const protectedRoutes = [
            '/dashboard',
            '/room',
            '/billing',
            '/notifications',
            '/assets',
        ];

        for (const route of protectedRoutes) {
            console.log(`🧪 Testing guest access to: ${route}`);

            // Try to access protected route
            await page.goto(route);

            // Wait for navigation to complete
            await page.waitForLoadState('networkidle');

            // Should redirect to login page
            await expect(page).toHaveURL(/.*login/);

            console.log(`✅ Guest redirected from ${route} to /login`);
        }
    });

    test('RBAC_SEC_3: Kiểm tra redirect sau khi đăng nhập thành công', async ({ page, context }) => {
        // Clear cookies
        await context.clearCookies();

        // Try to access protected page
        await page.goto('/dashboard');

        // Should be on login page now
        await expect(page).toHaveURL(/.*login/);

        // Login
        await page.goto('/login');
        await page.fill('input[id="username"]', process.env.TEST_USER_EMAIL || '');
        await page.fill('input[id="password"]', process.env.TEST_USER_PASSWORD || '');
        await page.click('button[type="submit"]');


        // Should redirect to dashboard after successful login
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/dashboard');

        console.log('✅ RBAC_SEC_3: Login redirect works correctly');
    });

    test('RBAC_SEC_4: Kiểm tra người dùng đã đăng nhập không thể truy cập trang login', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[id="username"]', process.env.TEST_USER_EMAIL || '');
        await page.fill('input[id="password"]', process.env.TEST_USER_PASSWORD || '');
        await page.click('button[type="submit"]');

        await page.waitForLoadState('networkidle');
        // Verify on dashboard
        expect(page.url()).toContain('/dashboard');

        // Try to go back to login page
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Should redirect back to dashboard (based on middleware logic)
        await expect(page).toHaveURL(/.*dashboard/);

        console.log('✅ RBAC_SEC_4: Authenticated user redirected from /login to /dashboard');
    });
});

// =============================================================================
// GROUP 5: SESSION MANAGEMENT - Kiểm tra quản lý phiên
// =============================================================================
test.describe('RBAC - Session Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[id="username"]', process.env.TEST_USER_EMAIL || '');
        await page.fill('input[id="password"]', process.env.TEST_USER_PASSWORD || '');
        await page.click('button[type="submit"]');

        // Chờ đăng nhập thành công và chuyển hướng
        await page.waitForLoadState('networkidle');
    });

    test('RBAC_SESSION_1: Kiểm tra session persistence sau khi refresh', async ({ page }) => {
        // Login
        // const loginPage = new LoginPage(page);
        // await loginPage.goto();
        // await loginPage.loginAsAdmin();
        // await loginPage.waitForLoginSuccess();

        // Verify logged in
        expect(page.url()).toContain('/dashboard');

        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Should still be logged in (not redirected to login)
        expect(page.url()).toContain('/dashboard');

        console.log('✅ RBAC_SESSION_1: Session persists after page refresh');
    });

    test('RBAC_SESSION_2: Kiểm tra logout functionality', async ({ page }) => {
        // Login
        // const loginPage = new LoginPage(page);
        // await loginPage.goto();
        // await loginPage.loginAsAdmin();
        // await loginPage.waitForLoginSuccess();

        // Click user avatar to open dropdown
        await page.click('div.cursor-pointer.rounded-full');

        // Wait for dropdown menu
        await page.waitForSelector('button:has-text("Đăng xuất")');

        // Click logout
        await page.click('button:has-text("Đăng xuất")');

        // Wait for redirect to login
        await page.waitForURL('**/login', { timeout: 10000 });

        // Verify redirected to login page
        expect(page.url()).toContain('/login');

        // Try to access protected route
        await page.goto('/dashboard');

        // Should redirect back to login
        await expect(page).toHaveURL(/.*login/);

        console.log('✅ RBAC_SESSION_2: Logout works correctly');
    });

});
