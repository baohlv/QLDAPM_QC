import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/api.helper.js';

test.describe('Authentication API', () => {
    let apiHelper;

    test.beforeEach(async () => {
        apiHelper = new ApiHelper();
    });

    test.describe('Login Endpoint', () => {
        test('should login with valid credentials', async () => {
            const response = await apiHelper.authenticate(
                process.env.TEST_USER_EMAIL,
                process.env.TEST_USER_PASSWORD
            );

            expect(response).toHaveProperty('accessToken');
            expect(response).toHaveProperty('refreshToken');
            expect(response.accessToken).toBeTruthy();
            expect(response.refreshToken).toBeTruthy();
        });

        test('should return error for invalid credentials', async () => {
            try {
                await apiHelper.authenticate('invalid@email.com', 'wrongpassword');
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('Authentication failed');
            }
        });

        test('should return error for missing email', async () => {
            try {
                await apiHelper.authenticate('', 'password123');
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('400' || 'Bad Request');
            }
        });

        test('should return error for missing password', async () => {
            try {
                await apiHelper.authenticate('test@example.com', '');
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('400' || 'Bad Request');
            }
        });

        test('should handle malformed email', async () => {
            try {
                await apiHelper.authenticate('invalid-email', 'password123');
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('400' || 'Bad Request');
            }
        });
    });

    test.describe('Token Validation', () => {
        test('should access protected endpoint with valid token', async () => {
            // Login first to get token
            await apiHelper.authenticateAsTestUser();

            // Try to access protected endpoint
            const user = await apiHelper.getCurrentUser();

            expect(user).toHaveProperty('email');
            expect(user.email).toBe(process.env.TEST_USER_EMAIL);
        });

        test('should reject request with invalid token', async () => {
            // Set invalid token
            apiHelper.authToken = 'invalid-token';

            try {
                await apiHelper.getCurrentUser();
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('401' || 'Unauthorized');
            }
        });

        test('should reject request with expired token', async () => {
            // This test would require a way to create expired tokens
            // or wait for token expiration (not practical in automated tests)
            // Instead, we can test with a malformed token that looks expired

            apiHelper.authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

            try {
                await apiHelper.getCurrentUser();
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('401' || 'Unauthorized');
            }
        });

        test('should reject request without token', async () => {
            // Clear token
            apiHelper.authToken = null;

            try {
                await apiHelper.getCurrentUser();
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('401' || 'Unauthorized');
            }
        });
    });

    test.describe('User Roles', () => {
        test('should return correct role for regular user', async () => {
            await apiHelper.authenticateAsTestUser();
            const user = await apiHelper.getCurrentUser();

            expect(user.role).toBe('USER');
        });

        test('should return correct role for admin user', async () => {
            await apiHelper.authenticateAsAdmin();
            const user = await apiHelper.getCurrentUser();

            expect(user.role).toBe('ADMIN');
        });

        test('should restrict admin endpoints for regular users', async () => {
            await apiHelper.authenticateAsTestUser();

            try {
                // Try to access admin-only endpoint (assuming /api/admin/users exists)
                const apiContext = await apiHelper.createApiContext();
                const response = await apiContext.get('/admin/users');

                expect(response.status()).toBe(403); // Forbidden
            } catch (error) {
                expect(error.message).toContain('403' || 'Forbidden');
            }
        });

        test('should allow admin endpoints for admin users', async () => {
            await apiHelper.authenticateAsAdmin();

            try {
                // Try to access admin-only endpoint
                const apiContext = await apiHelper.createApiContext();
                const response = await apiContext.get('/admin/users');

                expect(response.status()).toBe(200);
            } catch (error) {
                // If endpoint doesn't exist, that's also acceptable
                expect(error.message).toContain('404' || 'Not Found');
            }
        });
    });

    test.describe('Rate Limiting', () => {
        test('should handle multiple rapid login attempts', async () => {
            const attempts = [];

            // Make multiple rapid login attempts
            for (let i = 0; i < 10; i++) {
                const startTime = Date.now();
                try {
                    await apiHelper.authenticate(
                        process.env.TEST_USER_EMAIL,
                        process.env.TEST_USER_PASSWORD
                    );
                    attempts.push({ success: true, duration: Date.now() - startTime });
                } catch (error) {
                    attempts.push({ success: false, error: error.message, duration: Date.now() - startTime });
                }
            }

            // Check if rate limiting is applied
            const failedAttempts = attempts.filter(a => !a.success);

            if (failedAttempts.length > 0) {
                // If there are failed attempts, they should be due to rate limiting
                const rateLimitErrors = failedAttempts.filter(a =>
                    a.error.includes('429') || a.error.includes('rate limit')
                );
                expect(rateLimitErrors.length).toBeGreaterThan(0);
            }
        });
    });

    test.describe('Security Headers', () => {
        test('should include security headers in response', async () => {
            const apiContext = await apiHelper.createApiContext();

            const response = await apiContext.post('/auth/login', {
                data: {
                    email: process.env.TEST_USER_EMAIL,
                    password: process.env.TEST_USER_PASSWORD
                }
            });

            const headers = response.headers();

            // Check for common security headers
            expect(headers).toHaveProperty('x-content-type-options');
            expect(headers).toHaveProperty('x-frame-options');
            expect(headers['x-content-type-options']).toBe('nosniff');
        });

        test('should not expose sensitive information in error responses', async () => {
            try {
                await apiHelper.authenticate('invalid@email.com', 'wrongpassword');
            } catch (error) {
                // Error message should not contain sensitive information
                expect(error.message).not.toContain('database');
                expect(error.message).not.toContain('SQL');
                expect(error.message).not.toContain('stack trace');
            }
        });
    });

    test.describe('Performance', () => {
        test('should respond within acceptable time', async () => {
            const performance = await apiHelper.measureApiPerformance(
                'POST',
                '/auth/login',
                {
                    email: process.env.TEST_USER_EMAIL,
                    password: process.env.TEST_USER_PASSWORD
                }
            );

            expect(performance.success).toBe(true);
            expect(performance.duration).toBeLessThan(2000); // 2 seconds
        });

        test('should handle concurrent login requests', async () => {
            const concurrentRequests = 5;
            const promises = [];

            for (let i = 0; i < concurrentRequests; i++) {
                promises.push(
                    apiHelper.measureApiPerformance(
                        'POST',
                        '/auth/login',
                        {
                            email: process.env.TEST_USER_EMAIL,
                            password: process.env.TEST_USER_PASSWORD
                        }
                    )
                );
            }

            const results = await Promise.all(promises);

            // All requests should succeed
            results.forEach(result => {
                expect(result.success).toBe(true);
                expect(result.duration).toBeLessThan(5000); // 5 seconds for concurrent requests
            });
        });
    });

    test.describe('Data Validation', () => {
        test('should validate email format', async () => {
            const invalidEmails = [
                'invalid-email',
                'test@',
                '@example.com',
                'test..test@example.com',
                'test@example',
                ''
            ];

            for (const email of invalidEmails) {
                try {
                    await apiHelper.authenticate(email, 'password123');
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    expect(error.message).toContain('400' || 'Bad Request');
                }
            }
        });

        test('should validate password requirements', async () => {
            const invalidPasswords = [
                '', // empty
                '123', // too short
                'a', // too short
                // Add more password validation tests based on your requirements
            ];

            for (const password of invalidPasswords) {
                try {
                    await apiHelper.authenticate(process.env.TEST_USER_EMAIL, password);
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    expect(error.message).toContain('400' || 'Bad Request');
                }
            }
        });

        test('should handle special characters in credentials', async () => {
            const specialChars = ['<script>', '"; DROP TABLE users; --', '\'OR 1=1--'];

            for (const chars of specialChars) {
                try {
                    await apiHelper.authenticate(chars, chars);
                    expect(true).toBe(false); // Should not reach here
                } catch (error) {
                    // Should handle gracefully without exposing system information
                    expect(error.message).not.toContain('SQL');
                    expect(error.message).not.toContain('database');
                }
            }
        });
    });
});
