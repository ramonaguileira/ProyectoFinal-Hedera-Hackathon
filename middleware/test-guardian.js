const config = require('./src/config/env');
const logger = require('./src/utils/logger');

async function testGuardian() {
  const GUARDIAN_URL = config.guardian?.url || 'http://localhost:3000';
  console.log(`Checking Guardian at: ${GUARDIAN_URL}`);
  try {
    const res = await fetch(`${GUARDIAN_URL}/api/v1/accounts/session`, {
      signal: AbortSignal.timeout(3000),
    });
    console.log(`Status: ${res.status} ${res.statusText}`);
    const data = await res.text();
    console.log(`Response: ${data.substring(0, 100)}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

testGuardian();
