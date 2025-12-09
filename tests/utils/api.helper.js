import { request } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: 'env.test' });

export class ApiHelper {
    constructor() {
        this.baseURL = process.env.API_BASE_URL || 'http://localhost:8080/api';
        this.timeout = parseInt(process.env.MAX_API_RESPONSE_TIME) || 10000;
        this.authToken = null;
    }

    async createApiContext() {
        return await request.newContext({
            baseURL: this.baseURL,
            timeout: this.timeout,
            extraHTTPHeaders: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
            }
        });
    }

    async authenticate(email, password) {
        try {
            const apiContext = await this.createApiContext();

            const response = await apiContext.post('/auth/login', {
                data: {
                    email,
                    password
                }
            });

            if (response.ok()) {
                const data = await response.json();
                this.authToken = data.accessToken;
                console.log('✅ API authentication successful');
                return data;
            } else {
                throw new Error(`Authentication failed: ${response.status()}`);
            }
        } catch (error) {
            console.error('❌ API authentication failed:', error);
            throw error;
        }
    }

    async authenticateAsTestUser() {
        return await this.authenticate(
            process.env.TEST_USER_EMAIL,
            process.env.TEST_USER_PASSWORD
        );
    }

    async authenticateAsAdmin() {
        return await this.authenticate(
            process.env.ADMIN_EMAIL,
            process.env.ADMIN_PASSWORD
        );
    }

    // Apartment API methods
    // async createApartment(apartmentData) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.post('/apartments', {
    //             data: apartmentData
    //         });

    //         if (response.ok()) {
    //             const data = await response.json();
    //             console.log(`✅ Apartment created: ${data.name}`);
    //             return data;
    //         } else {
    //             const error = await response.text();
    //             throw new Error(`Failed to create apartment: ${response.status()} - ${error}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to create apartment:', error);
    //         throw error;
    //     }
    // }

    // async getApartments(params = {}) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const queryString = new URLSearchParams(params).toString();
    //         const url = queryString ? `/apartments?${queryString}` : '/apartments';

    //         const response = await apiContext.get(url);

    //         if (response.ok()) {
    //             return await response.json();
    //         } else {
    //             throw new Error(`Failed to get apartments: ${response.status()}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to get apartments:', error);
    //         throw error;
    //     }
    // }

    // async getApartmentById(id) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.get(`/apartments/${id}`);

    //         if (response.ok()) {
    //             return await response.json();
    //         } else {
    //             throw new Error(`Failed to get apartment: ${response.status()}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to get apartment:', error);
    //         throw error;
    //     }
    // }

    // async updateApartment(id, apartmentData) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.put(`/apartments/${id}`, {
    //             data: apartmentData
    //         });

    //         if (response.ok()) {
    //             const data = await response.json();
    //             console.log(`✅ Apartment updated: ${data.name}`);
    //             return data;
    //         } else {
    //             const error = await response.text();
    //             throw new Error(`Failed to update apartment: ${response.status()} - ${error}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to update apartment:', error);
    //         throw error;
    //     }
    // }

    // async deleteApartment(id) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.delete(`/apartments/${id}`);

    //         if (response.ok()) {
    //             console.log(`✅ Apartment deleted: ${id}`);
    //             return true;
    //         } else {
    //             throw new Error(`Failed to delete apartment: ${response.status()}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to delete apartment:', error);
    //         throw error;
    //     }
    // }

    // // User API methods
    // async getCurrentUser() {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.get('/users/me');

    //         if (response.ok()) {
    //             return await response.json();
    //         } else {
    //             throw new Error(`Failed to get current user: ${response.status()}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to get current user:', error);
    //         throw error;
    //     }
    // }

    // async createUser(userData) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.post('/users', {
    //             data: userData
    //         });

    //         if (response.ok()) {
    //             const data = await response.json();
    //             console.log(`✅ User created: ${data.email}`);
    //             return data;
    //         } else {
    //             const error = await response.text();
    //             throw new Error(`Failed to create user: ${response.status()} - ${error}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to create user:', error);
    //         throw error;
    //     }
    // }

    // // Booking API methods
    // async createBooking(bookingData) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.post('/bookings', {
    //             data: bookingData
    //         });

    //         if (response.ok()) {
    //             const data = await response.json();
    //             console.log(`✅ Booking created: ${data.id}`);
    //             return data;
    //         } else {
    //             const error = await response.text();
    //             throw new Error(`Failed to create booking: ${response.status()} - ${error}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to create booking:', error);
    //         throw error;
    //     }
    // }

    // async getBookings(params = {}) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const queryString = new URLSearchParams(params).toString();
    //         const url = queryString ? `/bookings?${queryString}` : '/bookings';

    //         const response = await apiContext.get(url);

    //         if (response.ok()) {
    //             return await response.json();
    //         } else {
    //             throw new Error(`Failed to get bookings: ${response.status()}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to get bookings:', error);
    //         throw error;
    //     }
    // }

    // // Utility methods
    // async healthCheck() {
    //     try {
    //         const apiContext = await request.newContext({
    //             baseURL: process.env.BACKEND_URL || 'http://localhost:8080'
    //         });

    //         const response = await apiContext.get('/actuator/health');

    //         if (response.ok()) {
    //             const data = await response.json();
    //             console.log('✅ API health check passed');
    //             return data;
    //         } else {
    //             throw new Error(`Health check failed: ${response.status()}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ API health check failed:', error);
    //         throw error;
    //     }
    // }

    // async waitForApi(maxRetries = 30, delay = 2000) {
    //     for (let i = 0; i < maxRetries; i++) {
    //         try {
    //             await this.healthCheck();
    //             console.log('✅ API is ready');
    //             return;
    //         } catch (error) {
    //             console.log(`⏳ Waiting for API... (${i + 1}/${maxRetries})`);
    //             await new Promise(resolve => setTimeout(resolve, delay));
    //         }
    //     }

    //     throw new Error('❌ API failed to become ready');
    // }

    // // Room Management API methods
    // async getRooms(params = {}) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const queryString = new URLSearchParams(params).toString();
    //         const url = queryString ? `/rooms?${queryString}` : '/rooms';

    //         const response = await apiContext.get(url);

    //         if (response.ok()) {
    //             return await response.json();
    //         } else {
    //             throw new Error(`Failed to get rooms: ${response.status()}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to get rooms:', error);
    //         throw error;
    //     }
    // }

    // async getRoomById(id) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.get(`/rooms/${id}`);

    //         if (response.ok()) {
    //             return await response.json();
    //         } else {
    //             throw new Error(`Failed to get room: ${response.status()}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to get room:', error);
    //         throw error;
    //     }
    // }

    // async createRoom(roomData) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.post('/rooms', {
    //             data: roomData
    //         });

    //         if (response.ok()) {
    //             const data = await response.json();
    //             console.log(`✅ Room created: ${data.name || data.id}`);
    //             return data;
    //         } else {
    //             const error = await response.text();
    //             throw new Error(`Failed to create room: ${response.status()} - ${error}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to create room:', error);
    //         throw error;
    //     }
    // }

    // async updateRoom(id, roomData) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.put(`/rooms/${id}`, {
    //             data: roomData
    //         });

    //         if (response.ok()) {
    //             const data = await response.json();
    //             console.log(`✅ Room updated: ${data.name || data.id}`);
    //             return data;
    //         } else {
    //             const error = await response.text();
    //             throw new Error(`Failed to update room: ${response.status()} - ${error}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to update room:', error);
    //         throw error;
    //     }
    // }

    // async deleteRoom(id) {
    //     try {
    //         const apiContext = await this.createApiContext();

    //         const response = await apiContext.delete(`/rooms/${id}`);

    //         if (response.ok()) {
    //             console.log(`✅ Room deleted: ${id}`);
    //             return true;
    //         } else {
    //             throw new Error(`Failed to delete room: ${response.status()}`);
    //         }
    //     } catch (error) {
    //         console.error('❌ Failed to delete room:', error);
    //         throw error;
    //     }
    // }

    // // Test data cleanup
    // async cleanupTestData() {
    //     try {
    //         // Delete test apartments
    //         const apartments = await this.getApartments();
    //         const testApartments = apartments.filter(apt =>
    //             apt.name.includes('Test') || apt.name.includes('Automation')
    //         );

    //         for (const apartment of testApartments) {
    //             await this.deleteApartment(apartment.id);
    //         }

    //         // Delete test rooms
    //         try {
    //             const rooms = await this.getRooms();
    //             const testRooms = rooms.data ? rooms.data.filter(room =>
    //                 room.name.includes('Test') || room.name.includes('Automation')
    //             ) : rooms.filter(room =>
    //                 room.name.includes('Test') || room.name.includes('Automation')
    //             );

    //             for (const room of testRooms) {
    //                 await this.deleteRoom(room.id);
    //             }
    //         } catch (error) {
    //             console.log('⚠️ Room cleanup skipped - endpoint might not exist');
    //         }

    //         console.log('✅ API test data cleaned up');
    //     } catch (error) {
    //         console.error('❌ Failed to cleanup test data:', error);
    //     }
    // }

    // // Performance testing helpers
    // async measureApiPerformance(method, endpoint, data = null) {
    //     const startTime = Date.now();

    //     try {
    //         const apiContext = await this.createApiContext();
    //         let response;

    //         switch (method.toUpperCase()) {
    //             case 'GET':
    //                 response = await apiContext.get(endpoint);
    //                 break;
    //             case 'POST':
    //                 response = await apiContext.post(endpoint, { data });
    //                 break;
    //             case 'PUT':
    //                 response = await apiContext.put(endpoint, { data });
    //                 break;
    //             case 'DELETE':
    //                 response = await apiContext.delete(endpoint);
    //                 break;
    //             default:
    //                 throw new Error(`Unsupported method: ${method}`);
    //         }

    //         const endTime = Date.now();
    //         const duration = endTime - startTime;

    //         return {
    //             success: response.ok(),
    //             status: response.status(),
    //             duration,
    //             data: response.ok() ? await response.json() : null
    //         };
    //     } catch (error) {
    //         const endTime = Date.now();
    //         const duration = endTime - startTime;

    //         return {
    //             success: false,
    //             error: error.message,
    //             duration
    //         };
    //     }
    // }
}
