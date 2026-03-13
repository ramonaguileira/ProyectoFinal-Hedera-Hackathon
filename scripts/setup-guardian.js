#!/usr/bin/env node
/**
 * setup-guardian.js — Automated Guardian setup after fresh Docker install
 *
 * Prerequisites:
 *   1. docker compose -f docker-compose-quickstart.yml down -v
 *   2. docker compose -f docker-compose-quickstart.yml up -d
 *   3. Wait ~3-5 min for Guardian to fully start
 *
 * Usage:
 *   node scripts/setup-guardian.js
 *
 * What it does:
 *   Step 1: Wait for Guardian API to be ready
 *   Step 2: Register StandardRegistry + set Hedera credentials
 *   Step 3: Import CDM AMS-III.F policy from IPFS or file
 *   Step 4: Create 5 Eggologic custom schemas
 *   Step 5: Print new POLICY_ID for .env
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ─── Configuration ──────────────────────────────────────────────────────────
const GUARDIAN_URL = process.env.GUARDIAN_URL || 'http://192.168.1.3:3000';
const SR_USERNAME = process.env.GUARDIAN_USERNAME || 'StandardRegistry';
const SR_PASSWORD = process.env.GUARDIAN_PASSWORD || 'test';

// Hedera credentials for the Standard Registry (separate from middleware operator)
const HEDERA_OPERATOR_ID = process.env.GUARDIAN_HEDERA_OPERATOR_ID || '0.0.7898549';
const HEDERA_OPERATOR_KEY = process.env.GUARDIAN_HEDERA_OPERATOR_KEY || '302e020100300506032b657004220420444bcd0b04c3fd20ce284563ea4c9294481cdc373f0cdd43c3c66356e7794f61';
const INITIALIZATION_TOPIC = process.env.GUARDIAN_INITIALIZATION_TOPIC || '0.0.1960';

// CDM AMS-III.F IPFS message ID (from Guardian Methodology Library)
// If this doesn't work, we'll fall back to file import
const CDM_IPFS_MESSAGE_ID = '1706860945.647643805'; // Update if needed

const SCHEMAS_DIR = path.join(__dirname, '..', 'guardian', 'schemas');

// ─── Helpers ────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForGuardian(maxRetries = 60) {
  console.log(`\n=== Step 1: Waiting for Guardian at ${GUARDIAN_URL} ===`);
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(`${GUARDIAN_URL}/api/v1/accounts/session`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok || res.status === 401) {
        console.log(`  Guardian is ready (attempt ${i})`);
        return true;
      }
    } catch {
      // not ready yet
    }
    if (i % 10 === 0) console.log(`  Still waiting... (attempt ${i}/${maxRetries})`);
    await sleep(5000);
  }
  throw new Error('Guardian did not become ready in time');
}

async function authenticate() {
  const loginRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: SR_USERNAME, password: SR_PASSWORD }),
  });
  if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
  const { refreshToken } = await loginRes.json();

  const tokenRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!tokenRes.ok) throw new Error(`Access token failed: ${tokenRes.status}`);
  const { accessToken } = await tokenRes.json();
  return accessToken;
}

function authHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// ─── Step 2: Register Standard Registry ─────────────────────────────────────
async function setupStandardRegistry() {
  console.log('\n=== Step 2: Setting up Standard Registry ===');

  // 2a. Check if SR already exists
  try {
    const token = await authenticate();
    console.log('  StandardRegistry already exists and can log in.');
    return token;
  } catch {
    console.log('  StandardRegistry not yet registered, creating...');
  }

  // 2b. Register the SR account
  const regRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: SR_USERNAME,
      password: SR_PASSWORD,
      password_confirmation: SR_PASSWORD,
      role: 'STANDARD_REGISTRY',
    }),
  });

  if (!regRes.ok) {
    const errText = await regRes.text();
    // If already registered, that's fine
    if (errText.includes('already') || regRes.status === 409) {
      console.log('  SR already registered.');
    } else {
      throw new Error(`Registration failed: ${regRes.status} - ${errText.substring(0, 300)}`);
    }
  } else {
    console.log('  Registered StandardRegistry account');
  }

  // 2c. Authenticate
  const token = await authenticate();
  console.log('  Authenticated OK');

  // 2d. Set Hedera credentials on the SR profile
  console.log('  Setting Hedera credentials...');

  // First get current profile
  const profileRes = await fetch(`${GUARDIAN_URL}/api/v1/profiles/${SR_USERNAME}`, {
    headers: authHeaders(token),
  });

  if (profileRes.ok) {
    const profile = await profileRes.json();
    if (profile.confirmed || profile.hederaAccountId) {
      console.log(`  Profile already configured: ${profile.hederaAccountId}`);
      return token;
    }
  }

  // Set the profile with Hedera creds
  const updateRes = await fetch(`${GUARDIAN_URL}/api/v1/profiles/${SR_USERNAME}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      hederaAccountId: HEDERA_OPERATOR_ID,
      hederaAccountKey: HEDERA_OPERATOR_KEY,
      vcDocument: {
        geography: 'Uruguay',
        law: 'CDM',
        tags: 'eggologic,carbon-credits,bsf',
        ISIC: '3811', // Waste treatment
        type: 'StandardRegistry',
      },
      topicId: INITIALIZATION_TOPIC,
    }),
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.warn(`  Profile update response: ${updateRes.status} - ${errText.substring(0, 300)}`);
    console.log('  NOTE: Profile setup may take several minutes. The Hedera DID creation is async.');
    console.log('  Check Guardian UI at: ' + GUARDIAN_URL);
  } else {
    console.log('  Hedera credentials submitted. DID creation in progress...');
  }

  // Wait for profile to be ready (DID creation takes time)
  console.log('  Waiting for profile initialization (this can take 2-5 minutes)...');
  for (let i = 0; i < 60; i++) {
    await sleep(10000);
    try {
      const checkRes = await fetch(`${GUARDIAN_URL}/api/v1/profiles/${SR_USERNAME}`, {
        headers: authHeaders(token),
      });
      if (checkRes.ok) {
        const p = await checkRes.json();
        if (p.confirmed) {
          console.log(`  Profile confirmed! DID: ${p.did}`);
          return token;
        }
        if (i % 6 === 0) console.log(`  Still initializing... (${Math.floor(i * 10 / 60)}min)`);
      }
    } catch { /* retry */ }
  }

  console.log('  WARNING: Profile not confirmed after 10 min. Check Guardian UI manually.');
  return token;
}

// ─── Step 3: Import CDM AMS-III.F Policy ────────────────────────────────────
async function importPolicy(token) {
  console.log('\n=== Step 3: Importing CDM AMS-III.F policy ===');

  // Check if any policy already exists
  const listRes = await fetch(`${GUARDIAN_URL}/api/v1/policies`, {
    headers: authHeaders(token),
  });
  if (listRes.ok) {
    const policies = await listRes.json();
    const existing = policies.find(p =>
      p.name && p.name.toLowerCase().includes('ams-iii')
    );
    if (existing) {
      console.log(`  Policy already exists: "${existing.name}" (${existing.id})`);
      return existing.id;
    }
  }

  // Try importing from IPFS message
  console.log(`  Importing from IPFS message: ${CDM_IPFS_MESSAGE_ID}`);
  const importRes = await fetch(`${GUARDIAN_URL}/api/v1/policies/import/message`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ messageId: CDM_IPFS_MESSAGE_ID }),
  });

  if (!importRes.ok) {
    const errText = await importRes.text();
    console.warn(`  IPFS import failed: ${importRes.status} - ${errText.substring(0, 300)}`);
    console.log('\n  *** MANUAL STEP REQUIRED ***');
    console.log('  1. Open Guardian UI: ' + GUARDIAN_URL);
    console.log('  2. Go to Policies > Import');
    console.log('  3. Search for "CDM AMS-III.F" in the Methodology Library');
    console.log('  4. Import it');
    console.log('  5. Then re-run this script or manually update GUARDIAN_POLICY_ID in .env');
    return null;
  }

  // The import might return the policy directly or a task ID
  const importData = await importRes.json();
  let policyId;

  if (importData.id) {
    policyId = importData.id;
  } else if (Array.isArray(importData) && importData.length > 0) {
    policyId = importData[0].id;
  } else {
    // Might need to wait for async import
    console.log('  Import submitted, waiting for completion...');
    await sleep(15000);
    const listRes2 = await fetch(`${GUARDIAN_URL}/api/v1/policies`, {
      headers: authHeaders(token),
    });
    const policies2 = await listRes2.json();
    const imported = policies2.find(p =>
      p.name && p.name.toLowerCase().includes('ams-iii')
    );
    if (imported) {
      policyId = imported.id;
    }
  }

  if (policyId) {
    console.log(`  Policy imported! ID: ${policyId}`);
  } else {
    console.log('  Could not determine policy ID. Check Guardian UI.');
  }

  return policyId;
}

// ─── Step 4: Create Custom Eggologic Schemas ────────────────────────────────
async function createSchemas(token, policyId) {
  console.log('\n=== Step 4: Creating Eggologic custom schemas ===');

  if (!policyId) {
    console.log('  Skipping — no policy ID available.');
    return;
  }

  const schemaFiles = [
    'supplier-schema.json',
    'entrega-schema.json',
    'bsf-processing-schema.json',
    'product-output-schema.json',
    'eggo-reward-schema.json',
  ];

  // Get existing schemas for this policy
  const existingRes = await fetch(
    `${GUARDIAN_URL}/api/v1/schemas?policyId=${policyId}&pageSize=100`,
    { headers: authHeaders(token) }
  );
  const existingSchemas = existingRes.ok ? await existingRes.json() : [];
  const existingNames = new Set(existingSchemas.map(s => s.name));

  for (const file of schemaFiles) {
    const filePath = path.join(SCHEMAS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP: ${file} (file not found)`);
      continue;
    }

    const schemaJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const schemaName = schemaJson.title || file.replace('.json', '');

    if (existingNames.has(schemaName)) {
      console.log(`  SKIP: "${schemaName}" (already exists)`);
      continue;
    }

    console.log(`  Creating: "${schemaName}" ...`);

    const createRes = await fetch(`${GUARDIAN_URL}/api/v1/schemas/${policyId}`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        name: schemaName,
        description: schemaJson.description || '',
        entity: 'VC',
        status: 'DRAFT',
        document: schemaJson,
        policyId: policyId,
      }),
    });

    if (createRes.ok) {
      const created = await createRes.json();
      console.log(`    OK — uuid: ${created.uuid || created.id}`);
    } else {
      const errText = await createRes.text();
      console.warn(`    FAILED: ${createRes.status} - ${errText.substring(0, 200)}`);
    }
  }

  // List all schemas after creation
  console.log('\n  Current schemas:');
  const finalRes = await fetch(
    `${GUARDIAN_URL}/api/v1/schemas?policyId=${policyId}&pageSize=100`,
    { headers: authHeaders(token) }
  );
  if (finalRes.ok) {
    const final = await finalRes.json();
    for (const s of final) {
      console.log(`    ${s.name} | ${s.status} | uuid: ${s.uuid || 'n/a'}`);
    }
  }
}

// ─── Step 5: Print summary ──────────────────────────────────────────────────
function printSummary(policyId) {
  console.log('\n' + '='.repeat(60));
  console.log('  SETUP COMPLETE');
  console.log('='.repeat(60));

  if (policyId) {
    console.log(`\n  New GUARDIAN_POLICY_ID: ${policyId}`);
    console.log('\n  Update your .env file:');
    console.log(`    GUARDIAN_POLICY_ID=${policyId}`);
  }

  console.log('\n  Next steps:');
  console.log('  1. Open Guardian UI: ' + GUARDIAN_URL);
  console.log('  2. Go to Policies → select CDM AMS-III.F');
  console.log('  3. Verify all schemas appear (5 Eggologic + CDM originals)');
  console.log('  4. Publish the Eggologic schemas (DRAFT → PUBLISHED)');
  console.log('  5. Wire the schemas into policy blocks:');
  console.log('     - submit_entrega_mrv → EntregaSchema');
  console.log('     - eggo_supplier_profile → SupplierProfileSchema');
  console.log('     - eggo_calculate_rewards → EggoRewardSchema');
  console.log('  6. Add EGGOCOINS token (fungible, 2 decimals) to policy');
  console.log('  7. Validate → Dry Run → Publish');
  console.log('  8. Update .env with final EGGOCOINS_TOKEN_ID if it changed');
  console.log('  9. Restart middleware: cd middleware && npm start');
  console.log('='.repeat(60));
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  Eggologic — Guardian Setup Script                  ║');
  console.log('║  Target: ' + GUARDIAN_URL.padEnd(43) + ' ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  await waitForGuardian();
  const token = await setupStandardRegistry();
  const policyId = await importPolicy(token);
  await createSchemas(token, policyId);
  printSummary(policyId);
}

main().catch(err => {
  console.error('\n✗ Fatal error:', err.message);
  process.exit(1);
});
