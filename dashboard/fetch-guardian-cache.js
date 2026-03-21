#!/usr/bin/env node
// Pre-fetch Guardian API data into a local JSON cache.
// Bypasses CORS by running server-side via Node.js.
// Usage: node fetch-guardian-cache.js

const GUARDIAN_URL = 'https://guardianservice.app/api/v1';
const POLICY_ID = '69bc4638e755119d0774dd03';

const BLOCKS = {
  VVB_DELIVERY:     '3a5afd50-d4a5-49ca-866b-75477790ae4c',
  VVB_IMPACT_CALC:  'a77f0551-9cce-41c9-889d-c7b1110c059e',
  TOKEN_HISTORY:    'cd9ed4c2-ff79-474c-bd7c-6a9c525c6035',
  REGISTRY_SUPPLIER:'d6b1e092-59c1-48af-8671-1a5dfdeaaddb',
};

// Accounts to try — VVB has delivery/impact access, OWNER has token history
const ACCOUNTS = [
  { role: 'VVB',   email: 'eggologic-vvb@outlook.com' },
  { role: 'OWNER', email: 'r.aguileira88@gmail.com' },
];

const fs = require('fs');
const path = require('path');

async function login(email) {
  console.log(`  Logging in as ${email}...`);
  const res = await fetch(`${GUARDIAN_URL}/accounts/loginByEmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'test' }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status}`);
  const data = await res.json();
  const refreshToken = data.login?.refreshToken || data.refreshToken;
  if (!refreshToken) throw new Error(`No refreshToken for ${email}`);

  // Get access token
  const res2 = await fetch(`${GUARDIAN_URL}/accounts/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res2.ok) throw new Error(`Access token failed for ${email}: ${res2.status}`);
  const data2 = await res2.json();
  console.log(`  Got access token for ${email}`);
  return data2.accessToken;
}

async function fetchBlock(token, blockId, blockName) {
  console.log(`  Fetching block: ${blockName} (${blockId})...`);
  try {
    const res = await fetch(`${GUARDIAN_URL}/policies/${POLICY_ID}/blocks/${blockId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      console.log(`  WARNING: Block ${blockName} returned ${res.status}`);
      return null;
    }
    const data = await res.json();
    console.log(`  OK: ${blockName}`);
    return data;
  } catch (e) {
    console.log(`  ERROR fetching ${blockName}: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('=== Guardian Data Pre-Fetch ===\n');

  const cache = {
    fetchedAt: new Date().toISOString(),
    blocks: {},
  };

  // Try VVB first (has access to delivery + impact calc blocks)
  try {
    const vvbToken = await login(ACCOUNTS[0].email);

    const [delivery, impactCalc] = await Promise.all([
      fetchBlock(vvbToken, BLOCKS.VVB_DELIVERY, 'VVB_DELIVERY'),
      fetchBlock(vvbToken, BLOCKS.VVB_IMPACT_CALC, 'VVB_IMPACT_CALC'),
    ]);

    if (delivery) cache.blocks.VVB_DELIVERY = delivery;
    if (impactCalc) cache.blocks.VVB_IMPACT_CALC = impactCalc;
  } catch (e) {
    console.log(`VVB login/fetch error: ${e.message}`);
  }

  // Try OWNER for token history + supplier
  try {
    const ownerToken = await login(ACCOUNTS[1].email);

    const [tokenHistory, supplier] = await Promise.all([
      fetchBlock(ownerToken, BLOCKS.TOKEN_HISTORY, 'TOKEN_HISTORY'),
      fetchBlock(ownerToken, BLOCKS.REGISTRY_SUPPLIER, 'REGISTRY_SUPPLIER'),
    ]);

    if (tokenHistory) cache.blocks.TOKEN_HISTORY = tokenHistory;
    if (supplier) cache.blocks.REGISTRY_SUPPLIER = supplier;
  } catch (e) {
    console.log(`OWNER login/fetch error: ${e.message}`);
  }

  // Write cache
  const outPath = path.join(__dirname, 'data', 'guardian-cache.json');
  fs.writeFileSync(outPath, JSON.stringify(cache, null, 2));
  console.log(`\nCache written to ${outPath}`);
  console.log(`Blocks cached: ${Object.keys(cache.blocks).join(', ') || 'NONE'}`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
