const GUARDIAN_URL = 'http://192.168.1.3:3000';
const USERNAME = 'StandardRegistry';
const PASSWORD = 'test';
const POLICY_ID = '69b226d6957aba749bf2acb0';

async function main() {
  // Auth
  const loginRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  const { refreshToken } = await loginRes.json();
  const tokenRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const { accessToken } = await tokenRes.json();
  const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  // Try validation endpoint
  console.log('=== Trying policy validation ===');
  const valRes = await fetch(`${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}/validate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  console.log(`Validation status: ${valRes.status}`);
  const valData = await valRes.json();

  if (valData.errors) {
    console.log(`\nErrors (${valData.errors.length}):`);
    valData.errors.forEach((e, i) => console.log(`  ${i+1}. ${JSON.stringify(e)}`));
  }
  if (valData.blocks) {
    const errorBlocks = valData.blocks.filter(b => b.errors && b.errors.length > 0);
    console.log(`\nBlocks with errors: ${errorBlocks.length}`);
    errorBlocks.forEach(b => {
      console.log(`\n  Block: ${b.tag || b.id} (${b.blockType})`);
      b.errors.forEach(e => console.log(`    ERROR: ${e}`));
    });
  }

  // Also dump raw response
  console.log('\n=== Raw validation response (first 5000 chars) ===');
  const raw = JSON.stringify(valData, null, 2);
  console.log(raw.substring(0, 5000));
  if (raw.length > 5000) console.log(`\n... (${raw.length} total chars)`);

  // Also get policy and save JSON
  console.log('\n=== Saving policy JSON to file ===');
  const policyRes = await fetch(`${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}`, { headers });
  const policy = await policyRes.json();
  const fs = require('fs');
  fs.writeFileSync('policy-export.json', JSON.stringify(policy, null, 2));
  console.log('Saved to policy-export.json');
}

main().catch(err => console.error(err.message));
