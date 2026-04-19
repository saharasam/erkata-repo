
const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting to connect to:', process.env.DATABASE_URL.split('@')[1]);
    await client.connect();
    console.log('Successfully connected to the database!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error details:', err);
  }
}

testConnection();
