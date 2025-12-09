/**
 * Script to create authentication state files for different user roles
 * Run this after setting up test users in database
 * 
 * Usage:
 *   node scripts/create-auth-states.js
 * 
 * This will create:
 *   - tests/auth/admin.json (LANDLORD role)
 *   - tests/auth/renter.json (RENTER role) 
 *   - tests/auth/landlord2.json (Second LANDLORD for data isolation tests)
 */

const { chromium } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: 'env.test' });

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const AUTH_DIR = path.join(__dirname, '..', 'tests', 'auth');

/**
 * Login and save authentication state
 */
async function createAuthState(page, username, password, filename) {
    console.log(`\n🔐 Creating auth state for: ${username}`);

    try {
        // Navigate to login page
        await page.goto(`${FRONTEND_URL}/login`);
        console.log(`  ✓ Navigated to login page`);

        // Wait for form to be visible
        await page.waitForSelector('#username', { timeout: 10000 });

        // Fill login form
        await page.fill('#username', username);
        await page.fill('#password', password);
        console.log(`  ✓ Filled credentials`);

        // Submit form
        await page.click('button[type="submit"]');
        console.log(`  ✓ Clicked login button`);

        // Wait for successful login (redirect to dashboard)
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        console.log(`  ✓ Successfully logged in`);

        // Save authentication state
        const authPath = path.join(AUTH_DIR, filename);
        await page.context().storageState({ path: authPath });
        console.log(`  ✓ Saved auth state to: ${authPath}`);

        return true;
    } catch (error) {
        console.error(`  ✗ Failed to create auth state for ${username}:`, error.message);
        return false;
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting authentication state creation...\n');
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log(`Auth directory: ${AUTH_DIR}\n`);

    // Ensure auth directory exists
    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
        console.log(`✓ Created auth directory: ${AUTH_DIR}\n`);
    }

    // Launch browser
    const browser = await chromium.launch({
        headless: false, // Show browser for debugging
        slowMo: 100 // Slow down actions for visibility
    });

    const results = {
        admin: false,
        renter: false,
        landlord2: false
    };

    try {
        // ===== Create ADMIN (Landlord 1) auth state =====
        if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
            const context1 = await browser.newContext();
            const page1 = await context1.newPage();

            results.admin = await createAuthState(
                page1,
                process.env.ADMIN_EMAIL,
                process.env.ADMIN_PASSWORD,
                'admin.json'
            );

            await context1.close();
        } else {
            console.log('⚠️  Skipping admin auth state: ADMIN_EMAIL or ADMIN_PASSWORD not set');
        }

        // Small delay between authentications
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ===== Create RENTER auth state =====
        if (process.env.RENTER_EMAIL && process.env.RENTER_PASSWORD) {
            const context2 = await browser.newContext();
            const page2 = await context2.newPage();

            results.renter = await createAuthState(
                page2,
                process.env.RENTER_EMAIL,
                process.env.RENTER_PASSWORD,
                'renter.json'
            );

            await context2.close();
        } else {
            console.log('⚠️  Skipping renter auth state: RENTER_EMAIL or RENTER_PASSWORD not set');
        }

        // Small delay between authentications
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ===== Create LANDLORD2 auth state =====
        if (process.env.LANDLORD2_EMAIL && process.env.LANDLORD2_PASSWORD) {
            const context3 = await browser.newContext();
            const page3 = await context3.newPage();

            results.landlord2 = await createAuthState(
                page3,
                process.env.LANDLORD2_EMAIL,
                process.env.LANDLORD2_PASSWORD,
                'landlord2.json'
            );

            await context3.close();
        } else {
            console.log('⚠️  Skipping landlord2 auth state: LANDLORD2_EMAIL or LANDLORD2_PASSWORD not set');
        }

    } catch (error) {
        console.error('\n❌ Unexpected error:', error);
    } finally {
        await browser.close();
    }

    // ===== Summary =====
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary');
    console.log('='.repeat(60));

    const successCount = Object.values(results).filter(r => r).length;
    const totalCount = Object.values(results).length;

    console.log(`Admin (Landlord 1):  ${results.admin ? '✅ Created' : '❌ Failed or Skipped'}`);
    console.log(`Renter (Tenant):     ${results.renter ? '✅ Created' : '❌ Failed or Skipped'}`);
    console.log(`Landlord 2:          ${results.landlord2 ? '✅ Created' : '❌ Failed or Skipped'}`);
    console.log(`\nTotal: ${successCount}/${totalCount} auth states created successfully`);

    if (successCount === totalCount) {
        console.log('\n✨ All authentication states created successfully!');
        console.log('You can now run RBAC tests with:');
        console.log('  npx playwright test tests/e2e/rbac/access-control.spec.js');
    } else if (successCount > 0) {
        console.log('\n⚠️  Some auth states were not created.');
        console.log('Check if:');
        console.log('  1. Users exist in database');
        console.log('  2. Credentials in env.test are correct');
        console.log('  3. Frontend is running on', FRONTEND_URL);
    } else {
        console.log('\n❌ No auth states were created.');
        console.log('Please verify:');
        console.log('  1. Frontend is running');
        console.log('  2. Database is populated with test users');
        console.log('  3. Environment variables are set in env.test');
    }

    console.log('='.repeat(60) + '\n');
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

