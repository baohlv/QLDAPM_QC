// import { DatabaseHelper } from '../utils/database.helper.js'; // Tắt DB Helper
import fs from 'fs';
import path from 'path';

async function globalTeardown() {
    console.log('🧹 Starting global test teardown...');

    try {
        // 1. Clean test data from database (BỎ QUA VÌ KHÔNG ĐƯỢC XOÁ DB MÔI TRƯỜNG DEPLOY)
        // await cleanTestDatabase();

        // 2. Clean up authentication files
        await cleanAuthFiles();

        // 3. Clean up test artifacts (optional)
        await cleanTestArtifacts();

        console.log('✅ Global teardown completed successfully');
    } catch (error) {
        console.error('❌ Global teardown failed:', error);
    }
}

// async function cleanTestDatabase() {
//     console.log('🗄️ Cleaning test database...');
//     try {
//         const dbHelper = new DatabaseHelper();
//         await dbHelper.connect();
//         await dbHelper.cleanTestData();
//         await dbHelper.disconnect();
//         console.log('✅ Test database cleaned');
//     } catch (error) {
//         console.error('❌ Database cleanup failed:', error);
//     }
// }

async function cleanAuthFiles() {
    console.log('🔐 Cleaning authentication files...');

    try {
        const authDir = 'tests/auth';

        if (fs.existsSync(authDir)) {
            const files = fs.readdirSync(authDir);

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(authDir, file);
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Removed ${filePath}`);
                }
            }
        }

        console.log('✅ Authentication files cleaned');
    } catch (error) {
        console.error('❌ Auth files cleanup failed:', error);
    }
}

async function cleanTestArtifacts() {
    console.log('📁 Cleaning test artifacts...');

    try {
        const artifactDirs = [
            'test-results',
            'playwright-report',
            'allure-results'
        ];

        for (const dir of artifactDirs) {
            if (fs.existsSync(dir)) {
                // Only clean if explicitly requested
                if (process.env.CLEAN_ARTIFACTS === 'true') {
                    fs.rmSync(dir, { recursive: true, force: true });
                    console.log(`🗑️ Removed ${dir}`);
                }
            }
        }

        console.log('✅ Test artifacts handled');
    } catch (error) {
        console.error('❌ Artifacts cleanup failed:', error);
    }
}

export default globalTeardown;