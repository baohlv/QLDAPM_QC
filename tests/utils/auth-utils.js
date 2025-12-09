/**
 * Authentication Utilities for Multi-User Testing
 * Helper functions for managing authentication across different roles
 */

import { chromium } from '@playwright/test';

/**
 * Generate unique CCCD (Citizen ID) for testing
 * Format: 12 digits
 */
export function generateUniqueCCCD() {
    const timestamp = Date.now().toString();
    // Lấy 12 chữ số cuối
    const cccd = timestamp.slice(-12).padStart(12, '0');
    return cccd;
}

/**
 * Generate Date of Birth in DDMMYYYY format
 * @param {string} dateStr - Optional date string (default: random date from 1980-2000)
 */
export function generateDOB(dateStr = null) {
    if (dateStr) {
        return dateStr;
    }
    
    // Generate random DOB between 1980-2000
    const year = 1980 + Math.floor(Math.random() * 20);
    const month = (1 + Math.floor(Math.random() * 12)).toString().padStart(2, '0');
    const day = (1 + Math.floor(Math.random() * 28)).toString().padStart(2, '0');
    
    return `${day}${month}${year}`; // DDMMYYYY
}

/**
 * Login with specific credentials and return a new page with authentication
 * @param {BrowserContext} context - Playwright browser context
 * @param {string} username - Username to login
 * @param {string} password - Password
 * @returns {Promise<Page>} - Authenticated page
 */
export async function loginAs(context, username, password) {
    const page = await context.newPage();
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[id="username"]', username);
    await page.fill('input[id="password"]', password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for successful redirect
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    return page;
}

/**
 * Login as Admin and save storage state
 * @param {BrowserContext} context - Playwright browser context
 * @returns {Promise<void>}
 */
export async function loginAsAdmin(context) {
    const adminEmail = process.env.ADMIN_EMAIL || 'landlord1';
    const adminPassword = process.env.ADMIN_PASSWORD || 'pass123';
    
    const page = await context.newPage();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[id="username"]', adminEmail);
    await page.fill('input[id="password"]', adminPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    
    return page;
}

/**
 * Create a fresh browser context without any authentication
 * @returns {Promise<BrowserContext>}
 */
export async function createFreshContext() {
    const browser = await chromium.launch({
        headless: process.env.HEADLESS === 'true'
    });
    
    return await browser.newContext({
        viewport: {
            width: parseInt(process.env.VIEWPORT_WIDTH) || 1920,
            height: parseInt(process.env.VIEWPORT_HEIGHT) || 1080
        },
        ignoreHTTPSErrors: true
    });
}

/**
 * Wait for notification/toast message to appear
 * @param {Page} page - Playwright page
 * @param {string} messageText - Expected message text
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForNotification(page, messageText, timeout = 10000) {
    // Các selector phổ biến cho notification
    const selectors = [
        `text="${messageText}"`,
        `[role="alert"]:has-text("${messageText}")`,
        `.notification:has-text("${messageText}")`,
        `.toast:has-text("${messageText}")`,
        `.alert:has-text("${messageText}")`
    ];
    
    for (const selector of selectors) {
        try {
            await page.waitForSelector(selector, { timeout: timeout / selectors.length });
            return true;
        } catch (error) {
            // Try next selector
            continue;
        }
    }
    
    throw new Error(`Notification "${messageText}" not found`);
}

/**
 * Generate random tenant information
 */
export function generateTenantInfo() {
    const timestamp = Date.now();
    
    return {
        cccd: generateUniqueCCCD(),
        dob: generateDOB(),
        fullName: `Tenant Test ${timestamp}`,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `tenant_${timestamp}@test.com`
    };
}

/**
 * Helper to wait for API response
 * @param {Page} page - Playwright page
 * @param {string} urlPattern - URL pattern to match
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForApiResponse(page, urlPattern, timeout = 10000) {
    return await page.waitForResponse(
        response => response.url().includes(urlPattern) && response.status() === 200,
        { timeout }
    );
}

