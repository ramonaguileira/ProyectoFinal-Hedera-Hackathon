/**
 * Fix CER token: add CER token to policy, then replace the old UUID
 * in the 3 CDM blocks (mintToken, pp_associate_token, pp_grant_kyc_token)
 */

const GUARDIAN_URL = 'http://192.168.1.3:3000';
const USERNAME = 'StandardRegistry';
const PASSWORD = 'test';
const POLICY_ID = '69b226d6957aba749bf2acb0';
const OLD_TOKEN_UUID = 'c79e0fb4-2f1e-4a0a-95e2-880725bc6fca';

async function main() {
  // Auth
  console.log('=== Authenticating ===');
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
  console.log('OK');

  // Step 1: Get current policy
  console.log('\n=== Fetching policy ===');
  const policyRes = await fetch(`${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}`, { headers });
  const policy = await policyRes.json();
  console.log('Policy:', policy.name, '| Status:', policy.status);
  console.log('Current policyTokens:', JSON.stringify(policy.policyTokens, null, 2));

  // Step 2: Add CER token to policyTokens if not already there
  const existingCer = (policy.policyTokens || []).find(t =>
    t.tokenName === 'CER' || t.tokenSymbol === 'CER'
  );

  let cerTokenTag;
  if (existingCer) {
    console.log('\nCER token already exists in policy:', JSON.stringify(existingCer));
    cerTokenTag = existingCer.templateTokenTag;
  } else {
    console.log('\n=== Adding CER token to policy ===');
    cerTokenTag = 'cer_token';
    const cerToken = {
      templateTokenTag: cerTokenTag,
      tokenName: 'CER',
      tokenSymbol: 'CER',
      tokenType: 'non-fungible',
      decimals: '0',
      initialSupply: '0',
      changeSupply: true,
      enableAdmin: true,
      enableFreeze: false,
      enableKYC: false,
      enableWipe: true,
      draftToken: true,
    };

    if (!policy.policyTokens) policy.policyTokens = [];
    policy.policyTokens.push(cerToken);
    console.log('Added CER token config');
  }

  // Step 3: Fix the 3 blocks that reference the old UUID
  console.log('\n=== Fixing blocks with old token UUID ===');
  let fixCount = 0;

  function fixBlocks(obj) {
    if (!obj) return;
    if (obj.tokenId === OLD_TOKEN_UUID) {
      console.log(`  Fixed: [${obj.blockType}] tag="${obj.tag}" tokenId: ${OLD_TOKEN_UUID} -> ${cerTokenTag}`);
      obj.tokenId = cerTokenTag;
      fixCount++;
    }
    if (obj.children && Array.isArray(obj.children)) {
      obj.children.forEach(fixBlocks);
    }
  }

  fixBlocks(policy.config);
  console.log(`Fixed ${fixCount} blocks`);

  // Step 4: PUT the updated policy
  console.log('\n=== Updating policy ===');
  const updateRes = await fetch(`${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(policy),
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.error(`Update failed: ${updateRes.status} - ${errText.substring(0, 500)}`);
    return;
  }

  const updated = await updateRes.json();
  console.log('Policy updated! Status:', updated.status);
  console.log('policyTokens:', JSON.stringify(updated.policyTokens, null, 2));

  // Step 5: Verify - check blocks again
  console.log('\n=== Verifying ===');
  let remaining = 0;
  function checkBlocks(obj) {
    if (!obj) return;
    if (obj.tokenId === OLD_TOKEN_UUID) {
      console.log(`  STILL BAD: [${obj.blockType}] tag="${obj.tag}"`);
      remaining++;
    }
    if (obj.children) obj.children.forEach(checkBlocks);
  }
  checkBlocks(updated.config);

  if (remaining === 0) {
    console.log('All token references fixed!');
  } else {
    console.log(`Still ${remaining} blocks with old UUID`);
  }

  // Check token blocks
  console.log('\n=== Current token references ===');
  function showTokenBlocks(obj) {
    if (!obj) return;
    if (obj.tokenId) {
      console.log(`  [${obj.blockType}] tag="${obj.tag}" tokenId="${obj.tokenId}"`);
    }
    if (obj.children) obj.children.forEach(showTokenBlocks);
  }
  showTokenBlocks(updated.config);
}

main().catch(err => console.error('Fatal:', err.message));
