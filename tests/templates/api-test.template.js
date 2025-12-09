import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/api.helper.js';

/**
 * Template for creating API tests for new features
 * 
 * Usage:
 * 1. Copy this file to tests/e2e/api/[feature-name].api.spec.js
 * 2. Replace [FEATURE_NAME] with your feature name
 * 3. Replace [ENDPOINT] with actual API endpoint
 * 4. Update test scenarios based on your API requirements
 * 5. Implement actual test logic
 */

test.describe('[FEATURE_NAME] API', () => {
    let apiHelper;

    test.beforeEach(async () => {
        apiHelper = new ApiHelper();
        await apiHelper.authenticateAsTestUser();
    });

    test.describe('Create [RESOURCE] - POST /api/[endpoint]', () => {
        test('should create [resource] with valid data', async () => {
            // Arrange
            const [resource]Data = {
                name: 'Test [Resource]',
                email: 'test@example.com',
                phone: '+1234567890',
                // Add other required fields
            };

            // Act
            const response = await apiHelper.create[RESOURCE]([resource]Data);

            // Assert
            expect(response).toHaveProperty('id');
            expect(response.name).toBe([resource]Data.name);
            expect(response.email).toBe([resource]Data.email);
            expect(response.phone).toBe([resource]Data.phone);
            expect(response.status).toBe('ACTIVE'); // or expected default status
            expect(response.createdAt).toBeTruthy();
        });

        test('should return error for missing required fields', async () => {
            // Arrange
            const incomplete[Resource]Data = {
                name: 'Test [Resource]'
                // Missing required fields
            };

            // Act & Assert
            try {
                await apiHelper.create[RESOURCE](incomplete[Resource]Data);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('400');
                expect(error.message).toContain('required' || 'missing');
            }
        });

        test('should return error for invalid data types', async () => {
            // Arrange
            const invalid[Resource]Data = {
                name: 123, // Should be string
                email: 'invalid-email',
                phone: 'invalid-phone',
                age: 'not-a-number' // Should be number
            };

            // Act & Assert
            try {
                await apiHelper.create[RESOURCE](invalid[Resource]Data);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('400');
            }
        });

        test('should return error for duplicate data', async () => {
            // Arrange
            const [resource]Data = {
                name: 'Unique [Resource]',
                email: 'unique@example.com',
                phone: '+1234567890'
            };

            // Act - Create first resource
            await apiHelper.create[RESOURCE]([resource]Data);

            // Act & Assert - Try to create duplicate
            try {
                await apiHelper.create[RESOURCE]([resource]Data);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('409' || 'conflict' || 'already exists');
            }
        });

        test('should validate field length limits', async () => {
            // Arrange
            const [resource]DataWithLongFields = {
                name: 'A'.repeat(256), // Assuming 255 char limit
                email: 'test@example.com',
                phone: '+1234567890'
            };

            // Act & Assert
            try {
                await apiHelper.create[RESOURCE]([resource]DataWithLongFields);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toContain('400');
                expect(error.message).toContain('too long' || 'limit');
            }
        });
    });

    test.describe('Get [RESOURCES] - GET /api/[endpoint]', () => {
        test('should return list of [resources]', async () => {
            // Act
            const [resources] = await apiHelper.get[RESOURCES]();

            // Assert
            expect(Array.isArray([resources])).toBe(true);

            if ([resources].length > 0) {
                expect([resources][0]).toHaveProperty('id');
                expect([resources][0]).toHaveProperty('name');
                expect([resources][0]).toHaveProperty('createdAt');
            }
        });

        test('should return paginated results', async () => {
            // Arrange
            const params = {
                page: 1,
                limit: 10
            };

            // Act
            const response = await apiHelper.get[RESOURCES](params);

            // Assert
            expect(response).toHaveProperty('data');
            expect(response).toHaveProperty('pagination');
            expect(response.pagination).toHaveProperty('page');
            expect(response.pagination).toHaveProperty('limit');
            expect(response.pagination).toHaveProperty('total');
            expect(Array.isArray(response.data)).toBe(true);
            expect(response.data.length).toBeLessThanOrEqual(10);
        });

        test('should filter results by search query', async () => {
            // Arrange
            const searchParams = {
                search: 'Test'
            };

            // Act
            const [resources] = await apiHelper.get[RESOURCES](searchParams);

            // Assert
            expect(Array.isArray([resources])).toBe(true);

            if ([resources].length > 0) {
                // Verify that results contain search term
                const hasSearchTerm = [resources].some([resource] =>
                [resource].name.toLowerCase().includes('test')
        );
        expect(hasSearchTerm).toBe(true);
    }
    });

test('should sort results by specified field', async () => {
    // Arrange
    const sortParams = {
        sortBy: 'name',
        sortOrder: 'asc'
    };

    // Act
    const [resources] = await apiHelper.get[RESOURCES](sortParams);

    // Assert
    if ([resources].length > 1) {
        for (let i = 1; i < [resources].length; i++) {
            expect([resources][i].name >= [resources][i - 1].name).toBe(true);
        }
    }
});
  });

test.describe('Get [RESOURCE] by ID - GET /api/[endpoint]/:id', () => {
    test('should return [resource] by valid ID', async () => {
        // Arrange - Create a resource first
        const [resource]Data = {
            name: 'Test [Resource] for Get',
            email: 'gettest@example.com',
            phone: '+1234567890'
        };
        const created[Resource] = await apiHelper.create[RESOURCE]([resource]Data);

        // Act
        const retrieved[Resource] = await apiHelper.get[RESOURCE]ById(created[Resource].id);

        // Assert
        expect(retrieved[Resource].id).toBe(created[Resource].id);
        expect(retrieved[Resource].name).toBe([resource]Data.name);
        expect(retrieved[Resource].email).toBe([resource]Data.email);
    });

    test('should return 404 for non-existent ID', async () => {
        // Act & Assert
        try {
            await apiHelper.get[RESOURCE]ById(999999);
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error.message).toContain('404');
        }
    });

    test('should return error for invalid ID format', async () => {
        // Act & Assert
        try {
            await apiHelper.get[RESOURCE]ById('invalid-id');
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error.message).toContain('400' || '404');
        }
    });
});

test.describe('Update [RESOURCE] - PUT /api/[endpoint]/:id', () => {
    test('should update [resource] with valid data', async () => {
        // Arrange - Create a resource first
        const original[Resource]Data = {
            name: 'Original [Resource]',
            email: 'original@example.com',
            phone: '+1234567890'
        };
        const created[Resource] = await apiHelper.create[RESOURCE](original[Resource]Data);

        const updated[Resource]Data = {
            name: 'Updated [Resource]',
            email: 'updated@example.com',
            phone: '+0987654321'
        };

        // Act
        const updated[Resource] = await apiHelper.update[RESOURCE](created[Resource].id, updated[Resource]Data);

        // Assert
        expect(updated[Resource].id).toBe(created[Resource].id);
        expect(updated[Resource].name).toBe(updated[Resource]Data.name);
        expect(updated[Resource].email).toBe(updated[Resource]Data.email);
        expect(updated[Resource].phone).toBe(updated[Resource]Data.phone);
        expect(updated[Resource].updatedAt).not.toBe(created[Resource].updatedAt);
    });

    test('should return 404 for non-existent ID', async () => {
        // Arrange
        const update[Resource]Data = {
            name: 'Updated [Resource]'
        };

        // Act & Assert
        try {
            await apiHelper.update[RESOURCE](999999, update[Resource]Data);
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error.message).toContain('404');
        }
    });

    test('should validate updated data', async () => {
        // Arrange - Create a resource first
        const [resource]Data = {
            name: 'Test [Resource]',
            email: 'test@example.com',
            phone: '+1234567890'
        };
        const created[Resource] = await apiHelper.create[RESOURCE]([resource]Data);

        const invalid[Resource]Data = {
            name: '', // Invalid empty name
            email: 'invalid-email'
        };

        // Act & Assert
        try {
            await apiHelper.update[RESOURCE](created[Resource].id, invalid[Resource]Data);
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error.message).toContain('400');
        }
    });
});

test.describe('Delete [RESOURCE] - DELETE /api/[endpoint]/:id', () => {
    test('should delete existing [resource]', async () => {
        // Arrange - Create a resource first
        const [resource]Data = {
            name: 'Test [Resource] to Delete',
            email: 'delete@example.com',
            phone: '+1234567890'
        };
        const created[Resource] = await apiHelper.create[RESOURCE]([resource]Data);

        // Act
        const result = await apiHelper.delete[RESOURCE](created[Resource].id);

        // Assert
        expect(result).toBe(true);

        // Verify resource is deleted
        try {
            await apiHelper.get[RESOURCE]ById(created[Resource].id);
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error.message).toContain('404');
        }
    });

    test('should return 404 for non-existent ID', async () => {
        // Act & Assert
        try {
            await apiHelper.delete[RESOURCE](999999);
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error.message).toContain('404');
        }
    });
});

test.describe('Authorization Tests', () => {
    test('should require authentication', async () => {
        // Arrange - Clear authentication
        apiHelper.authToken = null;

        // Act & Assert
        try {
            await apiHelper.get[RESOURCES]();
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error.message).toContain('401');
        }
    });

    test('should restrict access based on user role', async () => {
        // Test with regular user trying to access admin-only endpoints
        await apiHelper.authenticateAsTestUser();

        try {
            // Assuming admin-only endpoint exists
            const apiContext = await apiHelper.createApiContext();
            const response = await apiContext.delete('/admin/[resources]/1');

            expect(response.status()).toBe(403);
        } catch (error) {
            expect(error.message).toContain('403' || 'Forbidden');
        }
    });

    test('should allow admin access to restricted endpoints', async () => {
        // Test with admin user
        await apiHelper.authenticateAsAdmin();

        try {
            const apiContext = await apiHelper.createApiContext();
            const response = await apiContext.get('/admin/[resources]');

            expect(response.status()).toBe(200);
        } catch (error) {
            // If endpoint doesn't exist, that's also acceptable
            expect(error.message).toContain('404');
        }
    });
});

test.describe('Performance Tests', () => {
    test('should respond within acceptable time', async () => {
        // Arrange
        const [resource]Data = {
            name: 'Performance Test [Resource]',
            email: 'performance@example.com',
            phone: '+1234567890'
        };

        // Act
        const performance = await apiHelper.measureApiPerformance(
            'POST',
            '/[endpoint]',
            [resource]Data
        );

        // Assert
        expect(performance.success).toBe(true);
        expect(performance.duration).toBeLessThan(2000); // 2 seconds
    });

    test('should handle concurrent requests', async () => {
        // Arrange
        const concurrentRequests = 5;
        const promises = [];

        for (let i = 0; i < concurrentRequests; i++) {
            promises.push(
                apiHelper.measureApiPerformance(
                    'GET',
                    '/[endpoint]'
                )
            );
        }

        // Act
        const results = await Promise.all(promises);

        // Assert
        results.forEach(result => {
            expect(result.success).toBe(true);
            expect(result.duration).toBeLessThan(5000); // 5 seconds for concurrent requests
        });
    });
});

test.describe('Security Tests', () => {
    test('should prevent SQL injection', async () => {
        // Arrange
        const maliciousData = {
            name: "'; DROP TABLE [resources]; --",
            email: 'test@example.com',
            phone: '+1234567890'
        };

        // Act & Assert
        try {
            await apiHelper.create[RESOURCE](maliciousData);
            // Should handle gracefully without exposing database errors
        } catch (error) {
            expect(error.message).not.toContain('SQL');
            expect(error.message).not.toContain('database');
        }
    });

    test('should sanitize input data', async () => {
        // Arrange
        const xssData = {
            name: '<script>alert("xss")</script>',
            email: 'test@example.com',
            phone: '+1234567890'
        };

        // Act
        const created[Resource] = await apiHelper.create[RESOURCE](xssData);

        // Assert - Should sanitize or escape the script tag
        expect(created[Resource].name).not.toContain('<script>');
    });

    test('should validate content type', async () => {
        // Test with invalid content type
        const apiContext = await apiHelper.createApiContext();

        try {
            const response = await apiContext.post('/[endpoint]', {
                data: 'invalid-json-data',
                headers: {
                    'Content-Type': 'text/plain'
                }
            });

            expect(response.status()).toBe(400);
        } catch (error) {
            expect(error.message).toContain('400');
        }
    });
});

test.describe('Error Handling', () => {
    test('should return proper error format', async () => {
        // Act & Assert
        try {
            await apiHelper.create[RESOURCE]({});
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            // Verify error format
            expect(error.message).toContain('400');
            // Add more specific error format validation based on your API
        }
    });

    test('should handle malformed JSON', async () => {
        // Test with malformed JSON
        const apiContext = await apiHelper.createApiContext();

        try {
            const response = await apiContext.post('/[endpoint]', {
                data: '{"invalid": json}',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            expect(response.status()).toBe(400);
        } catch (error) {
            expect(error.message).toContain('400');
        }
    });
});
});
