import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Test directory
    testDir: './tests',

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI
    workers: process.env.CI ? 2 : undefined,

    // Reporter to use
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results.json' }],
        ['junit', { outputFile: 'test-results.xml' }],
        ['allure-playwright', {
            detail: true,
            outputFolder: 'allure-results',
            suiteTitle: false
        }]
    ],

    // Shared settings for all the projects below
    use: {
        // Base URL: Đây là địa chỉ trang web đã deploy của bạn.
        // Hãy đảm bảo biến FRONTEND_URL trong file .env là chính xác.
        // Nếu không có file .env, nó sẽ fallback về localhost.
        baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',

        // Global test timeout
        actionTimeout: parseInt(process.env.TEST_TIMEOUT) || 30000,

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Record video on failure
        video: 'retain-on-failure',

        // Take screenshot on failure
        screenshot: 'only-on-failure',

        // Viewport size
        viewport: {
            width: 1628,
            height: 360
        },

        // Ignore HTTPS errors (Rất quan trọng nếu trang deploy của bạn dùng self-signed cert hoặc http)
        ignoreHTTPSErrors: true,

        // Extra HTTP headers
        extraHTTPHeaders: {
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
        }
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: {
                    width: 1628,
                    height: 560
                },
                launchOptions: {
                    args: [
                        '--window-position=0,0'
                    ]
                },
            },
        },

        // Setup project for authentication
        {
            name: 'setup',
            testMatch: /.*\.setup\.js/,
        },

        // API testing project
        {
            name: 'api',
            testMatch: /.*\.api\.spec\.js/,
            use: {
                // Đảm bảo BACKEND_URL trỏ tới API server thực tế của bạn
                baseURL: process.env.BACKEND_URL || 'http://localhost:8080',
            },
        },
    ],

    // Global setup and teardown
    // Lưu ý: Đảm bảo các file này không cố gắng reset database cục bộ nếu bạn đang test trên môi trường live/production
    globalSetup: require.resolve('./tests/config/global-setup.js'),
    globalTeardown: require.resolve('./tests/config/global-teardown.js'),

    // --- ĐÃ XÓA KHỐI webServer ---
    // Việc này ngăn Playwright cố gắng khởi động Docker container.
    // Playwright sẽ chạy thẳng vào test dựa trên baseURL đã cấu hình ở trên.

    // Test match patterns
    testMatch: [
        '**/tests/**/*.spec.js',
        '**/tests/**/*.test.js'
    ],

    // Test ignore patterns
    testIgnore: [
        '**/node_modules/**',
        '**/build/**',
        '**/dist/**'
    ],

    // Expect options
    expect: {
        timeout: 10000,
        toHaveScreenshot: {
            threshold: 0.2,
            mode: 'pixel'
        },
        toMatchSnapshot: {
            threshold: 0.2
        },
    },

    // Output directory for test artifacts
    outputDir: 'test-results/',

    // Maximum time one test can run for
    timeout: 60 * 1000, // 1 minute

    // Global test setup
    globalTimeout: 10 * 60 * 1000, // 10 minutes
});