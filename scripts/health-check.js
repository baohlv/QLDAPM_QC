import fetch from 'node-fetch';
import { Client } from 'pg';
import Redis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'env.test' });

const services = {
    frontend: {
        name: 'Frontend (Next.js)',
        url: process.env.FRONTEND_URL || 'http://lonpmcalhost:3000',
        timeout: 10000
    },
    backend: {
        name: 'Backend (Spring Boot)',
        url: `${process.env.BACKEND_URL || 'http://localhost:8080'}/actuator/health`,
        timeout: 10000
    },
    api: {
        name: 'API Endpoint',
        url: `${process.env.API_BASE_URL || 'http://localhost:8080/api'}/health`,
        timeout: 10000
    }
};

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'localhost_mini_apartment',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
};

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || 'foobared',
    connectTimeout: 5000,
    lazyConnect: true
};

async function checkHttpService(service) {
    try {
        console.log(`🔍 Checking ${service.name}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), service.timeout);

        const response = await fetch(service.url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Health-Check-Script'
            }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            console.log(`✅ ${service.name} is healthy (${response.status})`);
            return { status: 'healthy', code: response.status };
        } else {
            console.log(`⚠️  ${service.name} returned ${response.status}`);
            return { status: 'unhealthy', code: response.status };
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log(`⏰ ${service.name} timed out`);
            return { status: 'timeout', error: 'Request timed out' };
        } else {
            console.log(`❌ ${service.name} failed: ${error.message}`);
            return { status: 'error', error: error.message };
        }
    }
}

async function checkDatabase() {
    let client;
    try {
        console.log('🔍 Checking PostgreSQL database...');

        client = new Client(dbConfig);
        await client.connect();

        // Test query
        const result = await client.query('SELECT NOW() as current_time');

        console.log(`✅ PostgreSQL is healthy (${result.rows[0].current_time})`);
        return { status: 'healthy', timestamp: result.rows[0].current_time };
    } catch (error) {
        console.log(`❌ PostgreSQL failed: ${error.message}`);
        return { status: 'error', error: error.message };
    } finally {
        if (client) {
            await client.end();
        }
    }
}

async function checkRedis() {
    let redis;
    try {
        console.log('🔍 Checking Redis...');

        redis = new Redis(redisConfig);

        // Test ping
        const pong = await redis.ping();

        if (pong === 'PONG') {
            console.log('✅ Redis is healthy');
            return { status: 'healthy', response: pong };
        } else {
            console.log(`⚠️  Redis returned unexpected response: ${pong}`);
            return { status: 'unhealthy', response: pong };
        }
    } catch (error) {
        console.log(`❌ Redis failed: ${error.message}`);
        return { status: 'error', error: error.message };
    } finally {
        if (redis) {
            redis.disconnect();
        }
    }
}

async function checkAllServices() {
    console.log('🏥 Starting health check for all services...\n');

    const results = {
        timestamp: new Date().toISOString(),
        services: {}
    };

    // Check HTTP services
    for (const [key, service] of Object.entries(services)) {
        results.services[key] = await checkHttpService(service);
    }

    // Check database
    results.services.database = await checkDatabase();

    // Check Redis
    results.services.redis = await checkRedis();

    // Summary
    console.log('\n📊 Health Check Summary:');
    console.log('========================');

    let healthyCount = 0;
    let totalCount = 0;

    for (const [serviceName, result] of Object.entries(results.services)) {
        totalCount++;
        const status = result.status === 'healthy' ? '✅' : '❌';
        console.log(`${status} ${serviceName}: ${result.status}`);

        if (result.status === 'healthy') {
            healthyCount++;
        }
    }

    console.log(`\n🎯 Overall Status: ${healthyCount}/${totalCount} services healthy`);

    if (healthyCount === totalCount) {
        console.log('🎉 All services are running correctly!');
        process.exit(0);
    } else {
        console.log('⚠️  Some services are not healthy. Check the logs above.');
        process.exit(1);
    }
}

async function waitForServices(maxRetries = 30, delay = 2000) {
    console.log('⏳ Waiting for services to be ready...\n');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔄 Attempt ${attempt}/${maxRetries}`);

        try {
            await checkAllServices();
            return; // All services are healthy
        } catch (error) {
            if (attempt === maxRetries) {
                console.log('\n❌ Services failed to become healthy within the timeout period');
                process.exit(1);
            }

            console.log(`\n⏳ Waiting ${delay / 1000} seconds before retry...\n`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Command line interface
const command = process.argv[2];

switch (command) {
    case 'wait':
        waitForServices();
        break;
    case 'check':
    default:
        checkAllServices();
        break;
}

export { checkAllServices, waitForServices, checkHttpService, checkDatabase, checkRedis };
