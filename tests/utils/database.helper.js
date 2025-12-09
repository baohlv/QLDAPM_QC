import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: 'env.test' });

export class DatabaseHelper {
    constructor() {
        this.client = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'localhost_mini_apartment',
            user: process.env.DB_USER || 'postgres',
            password: '123456',
        };
    }

    async connect() {
        try {
            // console.log(this.config);
            this.client = new Client(this.config);
            await this.client.connect();
            console.log('✅ Database connected successfully');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.end();
            this.client = null;
            console.log('✅ Database disconnected');
        }
    }

    async query(sql, params = []) {
        if (!this.client) {
            throw new Error('Database not connected');
        }

        try {
            const result = await this.client.query(sql, params);
            return result;
        } catch (error) {
            console.error('❌ Database query failed:', error);
            throw error;
        }
    }

    async cleanTestData() {
        console.log('🧹 Cleaning test data...');

        try {
    //         // Clean apartments with test names
    //         await this.query(`
    //     DELETE FROM apartments 
    //     WHERE name LIKE '%Test%' 
    //     OR name LIKE '%Automation%'
    //     OR address LIKE '%Test%'
    //   `);

            // Clean test users (keep admin and regular test users)
            await this.query(`
        DELETE FROM users 
        WHERE email LIKE '%test%' 
        AND email NOT IN ($1, $2)
      `, [process.env.TEST_USER_EMAIL, process.env.ADMIN_EMAIL]);

            // Clean other test data tables as needed
            // await this.query(`DELETE FROM bookings WHERE created_at < NOW() - INTERVAL '1 day'`);

            console.log('✅ Test data cleaned');
        } catch (error) {
            console.error('❌ Test data cleanup failed:', error);
            throw error;
        }
    }

    async createTestUsers() {
        console.log('👥 Creating test users...');

        try {
            // Check if test user exists
            const userExists = await this.query(
                'SELECT id FROM users WHERE email = $1',
                [process.env.TEST_USER_EMAIL]
            );

            if (userExists.rows.length === 0) {
                await this.query(`
          INSERT INTO users (id, email, password, role)
          VALUES ('550e8400-e29b-41d4-a716-446655440000', $1, $2, 'USER')
        `, [
                    process.env.TEST_USER_EMAIL,
                    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password: password
                ]);
                console.log('✅ Test user created');
            }

            // Check if admin user exists
            const adminExists = await this.query(
                'SELECT id FROM users WHERE email = $1',
                [process.env.ADMIN_EMAIL]
            );

            if (adminExists.rows.length === 0) {
                await this.query(`
          INSERT INTO users (id, email, password, role)
          VALUES ('550e8400-e29b-41d4-a716-446655440001',$1, $2, 'ADMIN')
        `, [
                    process.env.ADMIN_EMAIL,
                    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password: password
                ]);
                console.log('✅ Admin user created');
            }

        } catch (error) {
            console.error('❌ Test users creation failed:', error);
            throw error;
        }
    }

    async getTestUser(email = process.env.TEST_USER_EMAIL) {
        try {
            const result = await this.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Failed to get test user:', error);
            return null;
        }
    }

    // async createTestApartment(apartmentData) {
    //     try {
    //         const result = await this.query(`
    //     INSERT INTO apartments (name, address, price, status, description, created_at, updated_at)
    //     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    //     RETURNING *
    //   `, [
    //             apartmentData.name,
    //             apartmentData.address,
    //             apartmentData.price,
    //             apartmentData.status || 'AVAILABLE',
    //             apartmentData.description || ''
    //         ]);

    //         return result.rows[0];
    //     } catch (error) {
    //         console.error('❌ Failed to create test apartment:', error);
    //         throw error;
    //     }
    // }

    // async getTestApartments() {
    //     try {
    //         const result = await this.query(`
    //     SELECT * FROM apartments 
    //     WHERE name LIKE '%Test%' 
    //     OR name LIKE '%Automation%'
    //     ORDER BY created_at DESC
    //   `);
    //         return result.rows;
    //     } catch (error) {
    //         console.error('❌ Failed to get test apartments:', error);
    //         return [];
    //     }
    // }

    // async deleteTestApartment(apartmentId) {
    //     try {
    //         await this.query('DELETE FROM apartments WHERE id = $1', [apartmentId]);
    //         console.log(`✅ Test apartment ${apartmentId} deleted`);
    //     } catch (error) {
    //         console.error('❌ Failed to delete test apartment:', error);
    //         throw error;
    //     }
    // }

    async executeTransaction(queries) {
        try {
            await this.query('BEGIN');

            for (const { sql, params } of queries) {
                await this.query(sql, params);
            }

            await this.query('COMMIT');
            console.log('✅ Transaction completed successfully');
        } catch (error) {
            await this.query('ROLLBACK');
            console.error('❌ Transaction failed, rolled back:', error);
            throw error;
        }
    }

    async waitForDatabase(maxRetries = 30, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.connect();
                await this.query('SELECT 1');
                console.log('✅ Database is ready');
                return;
            } catch (error) {
                console.log(`⏳ Waiting for database... (${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new Error('❌ Database failed to become ready');
    }
}
