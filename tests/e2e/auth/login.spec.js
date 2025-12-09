// qc/tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

/**
 * Test Suite: Authentication (Đăng nhập & Đăng xuất)
 * Màn hình: Trang Đăng Nhập (/login) và Dashboard
 * 
 * Mô tả: Bộ test case kiểm thử chức năng đăng nhập và đăng xuất của hệ thống
 */
test.describe('Authentication Feature', () => {

  // Truy cập trang Login trước mỗi test case (trừ TC6 cần xử lý riêng)
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Đợi trang load hoàn toàn
    await page.waitForLoadState('networkidle');
  });

  /**
   * TEST CASE 1: AUTH_LOGIN_1
   * Kiểm tra giao diện form Đăng nhập
   * 
   * Bước thực hiện:
   * - Truy cập trang đăng nhập
   * 
   * Kỳ vọng:
   * - Hiển thị đầy đủ các thành phần: input Email/Username, Mật khẩu, nút "Đăng nhập", link "Đăng ký"
   * - Con trỏ chuột tự động focus vào ô Username
   */
  test('AUTH_LOGIN_1: Kiểm tra giao diện form Đăng nhập', async ({ page }) => {
    // Kiểm tra heading "Đăng nhập" hiển thị
    const heading = page.locator('h1:has-text("Đăng nhập")');
    await expect(heading).toBeVisible();

    // Kiểm tra input Username/Email tồn tại và hiển thị
    const usernameInput = page.locator('input[id="username"]');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toHaveAttribute('placeholder', /đăng nhập/i);

    // Kiểm tra input Mật khẩu tồn tại và hiển thị
    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Kiểm tra nút "Đăng Nhập" hiển thị
    const loginButton = page.locator('button[type="submit"]:has-text("Đăng Nhập")');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();

    // Kiểm tra link "Đăng ký" hiển thị
    const registerLink = page.locator('a[href="/register"]:has-text("Đăng ký")');
    await expect(registerLink).toBeVisible();


    console.log('✅ TC1 PASSED: Giao diện form đăng nhập hiển thị đầy đủ và đúng');
  });

  /**
   * TEST CASE 2: AUTH_LOGIN_2
   * Kiểm tra Validation - Bỏ trống trường bắt buộc
   * 
   * Bước thực hiện:
   * - Để trống Email & Mật khẩu
   * - Nhấn nút "Đăng nhập"
   * 
   * Kỳ vọng:
   * - Không gửi request đến server
   * - Hiển thị lỗi validation: "Tài khoản và mật khẩu không được để trống"
   */
  test('AUTH_LOGIN_2: Kiểm tra Validation - Bỏ trống trường bắt buộc', async ({ page }) => {
      // 1. Nhấn submit mà không điền gì cả
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // 2. Định vị ô input Username (thay selector cho đúng với code của bạn)
      const usernameInput = page.locator('input[name="username"]'); // hoặc #username

      // 3. Lấy message lỗi từ trình duyệt (Native Validation Message)
      const validationMessage = await usernameInput.evaluate((element) => {
          return element.validationMessage;
      });

      // 4. Kiểm tra xem có lỗi không
      expect(validationMessage).not.toBe('');

      // Nếu muốn check kỹ nội dung (ví dụ trình duyệt tiếng Anh):
      expect(validationMessage).toBe('Please fill out this field.');

      console.log('✅ Validation message detected:', validationMessage);
  });

  /**
   * TEST CASE 3: AUTH_LOGIN_3
   * Kiểm tra Đăng nhập thất bại - Sai mật khẩu
   * 
   * Bước thực hiện:
   * - Nhập Email/Username đúng
   * - Nhập Mật khẩu sai
   * - Nhấn "Đăng nhập"
   * 
   * Kỳ vọng:
   * - Báo lỗi "Tên đăng nhập hoặc mật khẩu không chính xác"
   * - Trường mật khẩu bị xóa trắng (optional - tùy implementation)
   */
  test('AUTH_LOGIN_3: Kiểm tra Đăng nhập thất bại - Sai mật khẩu', async ({ page }) => {
    // Nhập username đúng (lấy từ env)
    const correctUsername = process.env.ADMIN_EMAIL || 'admin@example.com';
    const wrongPassword = 'wrong_password_12345';

    await page.fill('input[id="username"]', correctUsername);
    await page.fill('input[id="password"]', wrongPassword);

    // Click nút đăng nhập
    await page.click('button[type="submit"]');

    // Đợi response từ server
    await page.waitForTimeout(2000);

    // Kiểm tra thông báo lỗi
    const errorMessage = page.locator('p[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    await expect(errorMessage).toHaveText('Tên đăng nhập hoặc mật khẩu không chính xác.');

    // Verify vẫn ở trang login
    expect(page.url()).toContain('/login');


    console.log('✅ TC3 PASSED: Đăng nhập với sai mật khẩu bị reject đúng');
  });

  /**
   * TEST CASE 4: AUTH_LOGIN_4
   * Kiểm tra Đăng nhập thất bại - Tài khoản không tồn tại
   * 
   * Bước thực hiện:
   * - Nhập Email/Username chưa đăng ký
   * - Nhập Mật khẩu bất kỳ
   * - Nhấn "Đăng nhập"
   * 
   * Kỳ vọng:
   * - Báo lỗi "Tài khoản không tồn tại" hoặc "Tên đăng nhập hoặc mật khẩu không chính xác"
   */
  test('AUTH_LOGIN_4: Kiểm tra Đăng nhập thất bại - Tài khoản không tồn tại', async ({ page }) => {
    // Tạo email/username ngẫu nhiên chắc chắn không tồn tại
    const randomUsername = `nonexistent_user_${Date.now()}@test.com`;
    const randomPassword = 'any_password_123';

    await page.fill('input[id="username"]', randomUsername);
    await page.fill('input[id="password"]', randomPassword);

    // Click đăng nhập
    await page.click('button[type="submit"]');

    // Đợi response
    await page.waitForTimeout(2000);

    // Kiểm tra thông báo lỗi xuất hiện
    const errorMessage = page.locator('p[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    await expect(errorMessage).toHaveText('Tên đăng nhập hoặc mật khẩu không chính xác.');

    // Verify vẫn ở trang login
    expect(page.url()).toContain('/login');

    console.log('✅ TC4 PASSED: Đăng nhập với tài khoản không tồn tại bị reject đúng');
  });

  /**
   * TEST CASE 5: AUTH_LOGIN_5
   * Kiểm tra Đăng nhập thành công (Happy Path) & Lưu JWT/Session
   * 
   * Bước thực hiện:
   * - Nhập Email & Mật khẩu đúng
   * - Nhấn "Đăng nhập"
   * 
   * Kỳ vọng:
   * - Thông báo thành công (nếu có)
   * - Chuyển hướng sang Dashboard (/dashboard)
   * - Kiểm tra Cookie có chứa Session Token (NextAuth sử dụng cookie)
   */
  test('AUTH_LOGIN_5: Kiểm tra Đăng nhập thành công & Lưu JWT/Session', async ({ page, context }) => {
    // Lấy thông tin đăng nhập từ environment
    const username = process.env.ADMIN_EMAIL || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'password';

    console.log(`Attempting login with username: ${username}`);

    // Điền thông tin đăng nhập
    await page.fill('input[id="username"]', username);
    await page.fill('input[id="password"]', password);

    // Click nút đăng nhập
    await page.click('button[type="submit"]');

    // Đợi chuyển hướng sang dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Verify URL hiện tại là dashboard
    expect(page.url()).toContain('/dashboard');
    console.log('✅ Redirected to dashboard successfully');

    // Kiểm tra heading hoặc nội dung của dashboard
    const dashboardContent = page.locator('h1, h2').first();
    await expect(dashboardContent).toBeVisible({ timeout: 5000 });

    // Kiểm tra Session Token trong Cookie
    // NextAuth sử dụng cookie name: "__Secure-next-auth.session-token" (production)
    // hoặc "next-auth.session-token" (development)
    const cookies = await context.cookies();
    console.log('All cookies:', cookies.map(c => c.name));

    // Tìm session token cookie
    const sessionCookie = cookies.find(cookie => 
      cookie.name.includes('next-auth.session-token') || 
      cookie.name === '__Secure-next-auth.session-token'
    );

    // Verify session cookie tồn tại và có giá trị
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie?.value).toBeTruthy();
    console.log('✅ Session token found in cookies:', sessionCookie?.name);

    // Alternative: Kiểm tra localStorage nếu app lưu thêm thông tin
    const hasLocalStorageToken = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.some(key => key.includes('token') || key.includes('auth'));
    });
    console.log('Has token in localStorage:', hasLocalStorageToken);

    console.log('✅ TC5 PASSED: Đăng nhập thành công và session được lưu đúng');
  });

  /**
   * TEST CASE 6: AUTH_LOGIN_6
   * Kiểm tra Đăng xuất
   * 
   * Bước thực hiện:
   * - Đăng nhập thành công trước
   * - Nhấn Avatar/Menu user
   * - Chọn "Đăng xuất"
   * 
   * Kỳ vọng:
   * - Chuyển về trang Login (/login)
   * - Session Token trong Cookie bị xóa
   * - Nhấn nút Back của trình duyệt không quay lại được Dashboard
   */
  test('AUTH_LOGIN_6: Kiểm tra Đăng xuất', async ({ page, context }) => {
    // ===== STEP 1: Thực hiện đăng nhập trước =====
    const username = process.env.ADMIN_EMAIL || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'password';

    await page.fill('input[id="username"]', username);
    await page.fill('input[id="password"]', password);
    await page.click('button[type="submit"]');

    // Đợi chuyển sang dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
    console.log('✅ Step 1: Logged in successfully');

    // Verify session cookie tồn tại
    let cookies = await context.cookies();
    const sessionCookieBefore = cookies.find(c => c.name.includes('next-auth.session-token'));
    expect(sessionCookieBefore).toBeTruthy();
    console.log('✅ Session cookie exists before logout');

    // ===== STEP 2: Thực hiện đăng xuất =====

    // Click vào Avatar để mở dropdown menu
    // Dựa vào layout.tsx, avatar là div với text chữ cái đầu username
    const avatar = page.locator('div.cursor-pointer').filter({ hasText: username.charAt(0).toUpperCase() });
    await avatar.click();

    // Đợi dropdown menu xuất hiện
    await page.waitForTimeout(500);

    // Click vào nút "Đăng xuất" trong dropdown
    const logoutButton = page.locator('button:has-text("Đăng xuất")');
    await expect(logoutButton).toBeVisible({ timeout: 3000 });
    await logoutButton.click();

    // Đợi chuyển hướng về trang login
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
    console.log('✅ Step 2: Redirected to login page after logout');

    // ===== STEP 3: Kiểm tra Session Token đã bị xóa =====
    cookies = await context.cookies();
    const sessionCookieAfter = cookies.find(c => c.name.includes('next-auth.session-token'));

    // Session cookie không còn tồn tại hoặc đã bị xóa giá trị
    expect(sessionCookieAfter).toBeFalsy();
    console.log('✅ Step 3: Session token removed from cookies');

    // ===== STEP 4: Kiểm tra không thể quay lại Dashboard bằng nút Back =====

    // Thử nhấn nút Back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Verify vẫn ở trang login hoặc bị redirect về login
    // (Middleware hoặc auth guard sẽ redirect)
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
    console.log('✅ Step 4: Cannot go back to dashboard after logout');

    // Alternative: Thử truy cập trực tiếp dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Phải bị redirect về login
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
    console.log('✅ Step 5: Direct access to dashboard redirects to login');

    console.log('✅ TC6 PASSED: Đăng xuất hoạt động đúng và bảo mật');
  });

});

