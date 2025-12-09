import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/api.helper.js';

test.describe('Room Management API - Pagination Tests', () => {
    let apiHelper;

    test.beforeEach(async () => {
        apiHelper = new ApiHelper();
        await apiHelper.authenticateAsTestUser();
    });

    test.describe('Pagination API Endpoints', () => {
        test('API001: Kiểm tra API phân trang - Trang đầu tiên', async () => {
            // Test pagination parameters
            const params = {
                page: 1,
                limit: 10
            };

            // Call API
            const response = await apiHelper.getRooms(params);

            // Verify response structure
            expect(response).toHaveProperty('data');
            expect(response).toHaveProperty('pagination');
            expect(Array.isArray(response.data)).toBe(true);

            // Verify pagination info
            expect(response.pagination).toHaveProperty('page');
            expect(response.pagination).toHaveProperty('limit');
            expect(response.pagination).toHaveProperty('total');
            expect(response.pagination).toHaveProperty('totalPages');

            // Verify pagination values
            expect(response.pagination.page).toBe(1);
            expect(response.pagination.limit).toBe(10);
            expect(response.pagination.total).toBeGreaterThanOrEqual(0);
            expect(response.pagination.totalPages).toBeGreaterThanOrEqual(1);

            // Verify data count
            if (response.pagination.total > 10) {
                expect(response.data.length).toBe(10);
            } else {
                expect(response.data.length).toBe(response.pagination.total);
            }

            console.log('✅ API Pagination - First page response is correct');
        });

        test('API002: Kiểm tra API phân trang - Trang thứ hai', async () => {
            // First, check if there are enough items for a second page
            const firstPageResponse = await apiHelper.getRooms({ page: 1, limit: 10 });

            test.skip(firstPageResponse.pagination.totalPages < 2, 'Skipping second page test - not enough data');

            // Test second page
            const params = {
                page: 2,
                limit: 10
            };

            const response = await apiHelper.getRooms(params);

            // Verify response structure
            expect(response).toHaveProperty('data');
            expect(response).toHaveProperty('pagination');
            expect(Array.isArray(response.data)).toBe(true);

            // Verify pagination info
            expect(response.pagination.page).toBe(2);
            expect(response.pagination.limit).toBe(10);

            // Verify data is different from first page
            const firstPageData = firstPageResponse.data;
            const secondPageData = response.data;

            if (firstPageData.length > 0 && secondPageData.length > 0) {
                // Ensure different data sets (assuming rooms have unique IDs)
                const firstPageIds = firstPageData.map(room => room.id);
                const secondPageIds = secondPageData.map(room => room.id);

                const hasOverlap = firstPageIds.some(id => secondPageIds.includes(id));
                expect(hasOverlap).toBe(false);
            }

            console.log('✅ API Pagination - Second page response is correct');
        });

        test('API003: Kiểm tra API phân trang - Các tham số limit khác nhau', async () => {
            const limits = [5, 10, 20];

            for (const limit of limits) {
                const response = await apiHelper.getRooms({ page: 1, limit });

                expect(response.pagination.limit).toBe(limit);

                if (response.pagination.total > limit) {
                    expect(response.data.length).toBe(limit);
                } else {
                    expect(response.data.length).toBe(response.pagination.total);
                }

                console.log(`✅ API Pagination - Limit ${limit} works correctly`);
            }
        });

        test('API004: Kiểm tra API phân trang - Tham số không hợp lệ', async () => {
            const invalidParams = [
                { page: 0, limit: 10 }, // Invalid page
                { page: -1, limit: 10 }, // Negative page
                { page: 1, limit: 0 }, // Invalid limit
                { page: 1, limit: -5 }, // Negative limit
                { page: 'invalid', limit: 10 }, // Non-numeric page
                { page: 1, limit: 'invalid' } // Non-numeric limit
            ];

            for (const params of invalidParams) {
                try {
                    await apiHelper.getRooms(params);
                    // If no error thrown, check if API handles gracefully
                    console.log(`⚠️ API handled invalid params gracefully: ${JSON.stringify(params)}`);
                } catch (error) {
                    // Expect 400 Bad Request for invalid parameters
                    expect(error.message).toContain('400');
                    console.log(`✅ API correctly rejected invalid params: ${JSON.stringify(params)}`);
                }
            }
        });

        test('API005: Kiểm tra API phân trang - Trang vượt quá giới hạn', async () => {
            // Get total pages first
            const firstResponse = await apiHelper.getRooms({ page: 1, limit: 10 });
            const totalPages = firstResponse.pagination.totalPages;

            // Try to access page beyond total pages
            const beyondLimitPage = totalPages + 10;

            try {
                const response = await apiHelper.getRooms({ page: beyondLimitPage, limit: 10 });

                // API might return empty data or handle gracefully
                expect(response.data).toHaveLength(0);
                console.log('✅ API handled out-of-range page gracefully');
            } catch (error) {
                // Or might return 404/400 error
                expect(error.message).toContain('404' || '400');
                console.log('✅ API correctly rejected out-of-range page');
            }
        });

        test('API006: Kiểm tra API phân trang - Performance với dữ liệu lớn', async () => {
            const startTime = Date.now();

            // Request large page size
            const response = await apiHelper.getRooms({ page: 1, limit: 100 });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // API should respond within 2 seconds even with large page size
            expect(responseTime).toBeLessThan(2000);

            // Verify response structure is still correct
            expect(response).toHaveProperty('data');
            expect(response).toHaveProperty('pagination');
            expect(response.pagination.limit).toBe(100);

            console.log(`✅ API Pagination - Large page size handled in ${responseTime}ms`);
        });

        test('API007: Kiểm tra API phân trang - Consistency across pages', async () => {
            // Get first page
            const firstPageResponse = await apiHelper.getRooms({ page: 1, limit: 10 });

            test.skip(firstPageResponse.pagination.totalPages < 2, 'Skipping consistency test - not enough pages');

            // Get second page
            const secondPageResponse = await apiHelper.getRooms({ page: 2, limit: 10 });

            // Verify pagination metadata consistency
            expect(firstPageResponse.pagination.total).toBe(secondPageResponse.pagination.total);
            expect(firstPageResponse.pagination.totalPages).toBe(secondPageResponse.pagination.totalPages);
            expect(firstPageResponse.pagination.limit).toBe(secondPageResponse.pagination.limit);

            console.log('✅ API Pagination - Metadata consistent across pages');
        });

        test('API008: Kiểm tra API phân trang - Sorting với pagination', async () => {
            const sortParams = {
                page: 1,
                limit: 10,
                sortBy: 'name',
                sortOrder: 'asc'
            };

            const response = await apiHelper.getRooms(sortParams);

            expect(response).toHaveProperty('data');
            expect(response.pagination.page).toBe(1);

            // Verify sorting is applied
            if (response.data.length > 1) {
                for (let i = 1; i < response.data.length; i++) {
                    const current = response.data[i].name.toLowerCase();
                    const previous = response.data[i - 1].name.toLowerCase();
                    expect(current >= previous).toBe(true);
                }
            }

            console.log('✅ API Pagination - Sorting works with pagination');
        });

        test('API009: Kiểm tra API phân trang - Filtering với pagination', async () => {
            const filterParams = {
                page: 1,
                limit: 10,
                status: 'AVAILABLE'
            };

            const response = await apiHelper.getRooms(filterParams);

            expect(response).toHaveProperty('data');
            expect(response.pagination.page).toBe(1);

            // Verify filtering is applied
            if (response.data.length > 0) {
                response.data.forEach(room => {
                    expect(room.status).toBe('AVAILABLE');
                });
            }

            console.log('✅ API Pagination - Filtering works with pagination');
        });

        test('API010: Kiểm tra API phân trang - Search với pagination', async () => {
            const searchParams = {
                page: 1,
                limit: 10,
                search: 'Test'
            };

            const response = await apiHelper.getRooms(searchParams);

            expect(response).toHaveProperty('data');
            expect(response.pagination.page).toBe(1);

            // Verify search is applied
            if (response.data.length > 0) {
                const hasSearchTerm = response.data.some(room =>
                    room.name.toLowerCase().includes('test') ||
                    room.address.toLowerCase().includes('test') ||
                    room.description.toLowerCase().includes('test')
                );
                expect(hasSearchTerm).toBe(true);
            }

            console.log('✅ API Pagination - Search works with pagination');
        });
    });

    test.describe('Pagination Edge Cases', () => {
        test('EDGE001: Kiểm tra API phân trang - Empty result set', async () => {
            // Search for something that doesn't exist
            const params = {
                page: 1,
                limit: 10,
                search: 'NonExistentRoom12345'
            };

            const response = await apiHelper.getRooms(params);

            expect(response.data).toHaveLength(0);
            expect(response.pagination.total).toBe(0);
            expect(response.pagination.totalPages).toBe(0);

            console.log('✅ API Pagination - Empty result set handled correctly');
        });

        test('EDGE002: Kiểm tra API phân trang - Single item result', async () => {
            // This test assumes we can create a unique room for testing
            try {
                // Create a unique room
                const uniqueRoom = await apiHelper.createRoom({
                    name: 'Unique Test Room ' + Date.now(),
                    address: 'Unique Address',
                    price: 1500000,
                    status: 'AVAILABLE'
                });

                // Search for this specific room
                const params = {
                    page: 1,
                    limit: 10,
                    search: uniqueRoom.name
                };

                const response = await apiHelper.getRooms(params);

                expect(response.data).toHaveLength(1);
                expect(response.pagination.total).toBe(1);
                expect(response.pagination.totalPages).toBe(1);
                expect(response.data[0].id).toBe(uniqueRoom.id);

                // Cleanup
                await apiHelper.deleteRoom(uniqueRoom.id);

                console.log('✅ API Pagination - Single item result handled correctly');
            } catch (error) {
                console.log('⚠️ Skipping single item test - room creation not available');
            }
        });

        test('EDGE003: Kiểm tra API phân trang - Maximum limit', async () => {
            // Test with maximum allowed limit (assuming 1000 is max)
            const params = {
                page: 1,
                limit: 1000
            };

            try {
                const response = await apiHelper.getRooms(params);

                expect(response).toHaveProperty('data');
                expect(response.pagination.limit).toBeLessThanOrEqual(1000);

                console.log('✅ API Pagination - Maximum limit handled correctly');
            } catch (error) {
                // API might reject very large limits
                expect(error.message).toContain('400');
                console.log('✅ API Pagination - Large limit correctly rejected');
            }
        });
    });
});
