import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
// import { DatabaseHelper } from '../utils/database.helper.js'; // Tắt DB Helper vì đang test trên Web đã deploy
// import { ApiHelper } from '../utils/api.helper.js';

// Load test environment variables
dotenv.config({ path: '.env' });

async function globalSetup() {
    console.log('🚀 Starting global test setup...');

    try {
        // 1. Wait for services to be ready
        await waitForServices();

        // 2. Setup test database (BỎ QUA KHI TEST TRÊN DEPLOYED ENV)
        // await setupTestDatabase();

        // 3. Create authentication state
        // await setupAuthentication();

        // 4. Seed test data (Có thể bật lại nếu dùng API để seed data, nhưng cẩn thận với môi trường thật)
        // await seedTestData();

        console.log('✅ Global setup completed successfully');
    } catch (error) {
        console.error('❌ Global setup failed:', error);
        throw error;
    }
}

async function waitForServices() {
    console.log('⏳ Waiting for services to be ready...');

    // Kiểm tra xem URL có tồn tại không trước khi check
    if (!process.env.FRONTEND_URL) {
        console.warn('⚠️ FRONTEND_URL not defined, skipping health check.');
        return;
    }

    const services = [
        { name: 'Frontend', url: process.env.FRONTEND_URL },
        // Backend check: Tuỳ chọn, nếu frontend chạy thì thường backend cũng đã chạy
        { name: 'Backend', url: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/actuator/health` : null },
    ];

    for (const service of services) {
        if (service.url) {
            await waitForService(service.name, service.url);
        }
    }
}

async function waitForService(name, url, maxRetries = 10, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Thêm catch lỗi certificate nếu server dùng self-signed https
            const response = await fetch(url, { method: 'HEAD' }).catch(() => null) || await fetch(url).catch(() => null);
            
            if (response && (response.ok || response.status < 500)) {
                console.log(`✅ ${name} is accessible`);
                return;
            }
        } catch (error) {
            // Service not ready yet
        }

        console.log(`⏳ Waiting for ${name} at ${url}... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    console.warn(`⚠️ Could not connect to ${name} after retries. Tests will proceed but might fail.`);
}

// Hàm này bị comment vì không connect trực tiếp DB môi trường deploy
// async function setupTestDatabase() {
//     console.log('🗄️ Setting up test database...');
//     try {
//         const dbHelper = new DatabaseHelper();
//         await dbHelper.connect();
//         await dbHelper.cleanTestData();
//         await dbHelper.createTestUsers();
//         await dbHelper.disconnect();
//         console.log('✅ Test database setup completed');
//     } catch (error) {
//         console.error('❌ Database setup failed:', error);
//         throw error;
//     }
// }

// async function setupAuthentication() {
//     console.log('🔐 Setting up authentication states...');

//     try {
//         const browser = await chromium.launch();
//         const context = await browser.newContext({ ignoreHTTPSErrors: true }); // Bỏ qua lỗi SSL nếu có
//         const page = await context.newPage();

//         // Login as admin
//         if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
//              await loginAndSaveState(page, 'admin', {
//                 email: process.env.ADMIN_EMAIL,
//                 password: process.env.ADMIN_PASSWORD
//             });
//         } else {
//             console.warn('⚠️ Skipping Admin auth setup: Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
//         }

//         await browser.close();
//         console.log('✅ Authentication states created');
//     } catch (error) {
//         console.error('❌ Authentication setup failed:', error);
//         throw error;
//     }
// }

async function loginAndSaveState(page, userType, credentials) {
    try {
        console.log(`Doing login for ${userType}...`);
        // Navigate to login page
        await page.goto(`${process.env.FRONTEND_URL}/login`);

        // Fill login form
        // Cần đảm bảo selector này đúng với website của bạn
        await page.fill('input[name="username"], input[id="username"]', credentials.email);
        await page.fill('input[name="password"], input[id="password"]', credentials.password);
        
        // Click submit và chờ điều hướng
        await Promise.all([
            page.waitForURL('**/*'), // Chờ URL thay đổi
            page.click('button[type="submit"]')
        ]);

        // Save authentication state
        await page.context().storageState({
            path: `tests/auth/${userType}.json`
        });

        console.log(`✅ ${userType} authentication state saved`);
    } catch (error) {
        console.error(`❌ Failed to create ${userType} auth state:`, error);
        // Không throw error để quy trình setup vẫn tiếp tục, 
        // test nào cần auth sẽ tự fail sau.
    }
}

export default globalSetup;