import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testConnection(url, label) {
    process.stderr.write(`Testing ${label}...\n`);
    const client = new Client({ 
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        process.stderr.write(`✅ ${label} connection successful!\n`);
        await client.end();
        process.exit(0);
    } catch (err) {
        process.stderr.write(`❌ ${label} connection failed: ${err.message}\n`);
        process.exit(1);
    }
}

testConnection(process.env.DATABASE_URL, 'DATABASE_URL (Pooled)');
