
const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function runTests() {
  const correctPassword = 'nt8peRN3SB9Grkcz';
  const wrongPassword = 'this-is-wrong';
  const ref = 'mpufgkovosjvrufxkckw';
  const pooler = 'aws-0-eu-west-1.pooler.supabase.com';

  const testCases = [
    { name: 'Auth Test (Correct Password)', url: `postgresql://postgres.${ref}:${correctPassword}@${pooler}:5432/postgres?sslmode=require` },
    { name: 'Auth Test (Wrong Password)', url: `postgresql://postgres.${ref}:${wrongPassword}@${pooler}:5432/postgres?sslmode=require` }
  ];

  for (const item of testCases) {
    console.log(`\n--- Testing: ${item.name} ---`);
    const client = new Client({
      connectionString: item.url,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log(`SUCCESS! Connected.`);
      await client.end();
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }
}

runTests();
