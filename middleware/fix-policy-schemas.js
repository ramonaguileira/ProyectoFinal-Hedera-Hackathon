/**
 * Fix policy schema UUID references
 * Connects to Guardian API, reads current schemas, reads policy JSON,
 * replaces old UUIDs with new ones, and updates the policy.
 */

const GUARDIAN_URL = 'http://192.168.1.3:3000';
const USERNAME = 'StandardRegistry';
const PASSWORD = 'test';
const POLICY_ID = '69b226d6957aba749bf2acb0';

async function main() {
  // Step 1: Authenticate
  console.log('=== Step 1: Authenticating ===');
  const loginRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
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
  console.log('Authenticated OK');

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Step 2: Get all schemas for this policy
  console.log('\n=== Step 2: Fetching schemas ===');
  const schemasRes = await fetch(`${GUARDIAN_URL}/api/v1/schemas?policyId=${POLICY_ID}&pageSize=100`, { headers });
  if (!schemasRes.ok) throw new Error(`Schemas fetch failed: ${schemasRes.status}`);
  const schemas = await schemasRes.json();

  console.log(`Found ${schemas.length} schemas:`);
  const schemaMap = {};
  for (const s of schemas) {
    const name = s.name || 'unnamed';
    const uuid = s.uuid || s.iri?.replace('#', '') || 'no-uuid';
    const iri = s.iri || 'no-iri';
    const status = s.status || 'unknown';
    console.log(`  ${name} | uuid: ${uuid} | iri: ${iri} | status: ${status}`);

    // Build map: schema name -> newest UUID+version
    if (!schemaMap[name] || s.status === 'PUBLISHED') {
      schemaMap[name] = { uuid, iri, version: s.version || '1.0.0' };
    }
  }

  // Step 3: Get policy JSON
  console.log('\n=== Step 3: Fetching policy JSON ===');
  const policyRes = await fetch(`${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}`, { headers });
  if (!policyRes.ok) throw new Error(`Policy fetch failed: ${policyRes.status}`);
  const policy = await policyRes.json();

  let policyJson = JSON.stringify(policy, null, 2);

  // Step 4: Find all schema references in the policy (UUID pattern)
  console.log('\n=== Step 4: Finding schema references ===');
  const uuidPattern = /#([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})&(\d+\.\d+\.\d+)/gi;
  const matches = [...policyJson.matchAll(uuidPattern)];
  const uniqueRefs = [...new Set(matches.map(m => m[0]))];
  console.log(`Found ${uniqueRefs.length} unique schema references in policy:`);
  uniqueRefs.forEach(ref => console.log(`  ${ref}`));

  // Step 5: Build replacement map
  console.log('\n=== Step 5: Building replacement map ===');

  // Get all schemas indexed by their old UUID (from within the policy)
  // We need to match old UUIDs to schema names, then replace with new UUIDs
  // The schemas API should give us both the UUID and the name

  // First, let's see which UUIDs in the policy DON'T exist in our schema list
  const currentUuids = new Set(schemas.map(s => s.uuid));
  const oldUuids = [...new Set(matches.map(m => m[1]))];

  const missingUuids = oldUuids.filter(u => !currentUuids.has(u));
  const existingUuids = oldUuids.filter(u => currentUuids.has(u));

  console.log(`\nExisting UUIDs (OK): ${existingUuids.length}`);
  existingUuids.forEach(u => {
    const schema = schemas.find(s => s.uuid === u);
    console.log(`  ${u} -> ${schema?.name || 'unknown'}`);
  });

  console.log(`\nMissing UUIDs (NEED FIX): ${missingUuids.length}`);
  missingUuids.forEach(u => console.log(`  ${u}`));

  if (missingUuids.length === 0) {
    console.log('\nNo missing UUIDs! Policy should be valid.');
    return;
  }

  // Step 6: Try to match missing UUIDs by looking at block context
  // For each missing UUID, we need to figure out which schema name it corresponds to
  // We'll extract the block info around each missing reference
  console.log('\n=== Step 6: Analyzing blocks with missing schemas ===');

  // Get the config/children blocks from the policy
  const policyConfig = policy.config || policy;

  // Flatten all blocks to find which ones reference missing schemas
  function findBlocksWithSchema(obj, path = '') {
    const results = [];
    if (!obj) return results;

    if (typeof obj === 'object') {
      // Check if this object has a schema reference
      const schemaStr = JSON.stringify(obj);
      for (const uuid of missingUuids) {
        if (schemaStr.includes(uuid)) {
          if (obj.tag || obj.blockType) {
            results.push({
              tag: obj.tag || 'no-tag',
              blockType: obj.blockType || 'unknown',
              path,
              schemaRef: uuid,
            });
          }
        }
      }

      // Recurse
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'object' && val !== null) {
          if (Array.isArray(val)) {
            val.forEach((item, i) => {
              results.push(...findBlocksWithSchema(item, `${path}.${key}[${i}]`));
            });
          } else {
            results.push(...findBlocksWithSchema(val, `${path}.${key}`));
          }
        }
      }
    }
    return results;
  }

  const blocksWithMissing = findBlocksWithSchema(policyConfig);

  // Deduplicate
  const seen = new Set();
  const uniqueBlocks = blocksWithMissing.filter(b => {
    const key = `${b.tag}|${b.schemaRef}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\nBlocks referencing missing schemas:`);
  uniqueBlocks.forEach(b => {
    console.log(`  Block: ${b.tag} (${b.blockType}) -> missing UUID: ${b.schemaRef}`);
  });

  // Step 7: Try automatic name-based matching
  // Extract schema name hints from block tags and try to match
  console.log('\n=== Step 7: Attempting auto-fix ===');

  // Create a map of name -> new schema IRI for all published schemas (deduplicated by name)
  const nameToNewIri = {};
  for (const s of schemas) {
    if (s.status === 'PUBLISHED' && s.name) {
      // Prefer the first one found (or could prefer newest)
      if (!nameToNewIri[s.name]) {
        nameToNewIri[s.name] = `#${s.uuid}&${s.version || '1.0.0'}`;
        console.log(`  Available: ${s.name} -> #${s.uuid}&${s.version || '1.0.0'}`);
      }
    }
  }

  // Now, for each missing UUID, search the original policy export file or
  // try to find it by examining the schema property in the block
  // Since we can't easily determine the name from UUID alone, let's try
  // using the API to get the schema by its old IRI

  console.log('\n--- Attempting to resolve by querying all schemas (including system) ---');
  const allSchemasRes = await fetch(`${GUARDIAN_URL}/api/v1/schemas?pageSize=200`, { headers });
  const allSchemas = await allSchemasRes.json();

  // Also try getting schemas by topic
  console.log(`Total schemas in system: ${allSchemas.length}`);

  // Build final replacement map
  const replacements = {};

  for (const oldUuid of missingUuids) {
    // Try to find a schema with the same name in the current system
    // We need to figure out the name of the old schema
    // Check if any schema in allSchemas has this UUID (maybe from system schemas)
    const found = allSchemas.find(s => s.uuid === oldUuid);
    if (found) {
      console.log(`  Found ${oldUuid} -> ${found.name} (was in system schemas)`);
      const newSchema = schemas.find(s => s.name === found.name && s.status === 'PUBLISHED');
      if (newSchema) {
        replacements[oldUuid] = newSchema.uuid;
        console.log(`    Replacing with: ${newSchema.uuid}`);
      }
    }
  }

  // If we still have unresolved, print them
  const unresolved = missingUuids.filter(u => !replacements[u]);
  if (unresolved.length > 0) {
    console.log(`\n  UNRESOLVED UUIDs (${unresolved.length}):`);
    unresolved.forEach(u => console.log(`    ${u}`));

    // Last resort: dump all unique schema names available
    console.log('\n  Available schema names for manual matching:');
    const names = [...new Set(schemas.map(s => s.name))].sort();
    names.forEach(n => {
      const s = schemas.find(x => x.name === n && x.status === 'PUBLISHED');
      if (s) console.log(`    ${n} -> ${s.uuid}`);
    });
  }

  // Step 8: Apply replacements
  if (Object.keys(replacements).length > 0) {
    console.log('\n=== Step 8: Applying replacements ===');
    let fixedJson = policyJson;
    for (const [oldUuid, newUuid] of Object.entries(replacements)) {
      const regex = new RegExp(oldUuid, 'g');
      const count = (fixedJson.match(regex) || []).length;
      fixedJson = fixedJson.replace(regex, newUuid);
      console.log(`  Replaced ${oldUuid} -> ${newUuid} (${count} occurrences)`);
    }

    // Step 9: PUT the fixed policy back
    console.log('\n=== Step 9: Updating policy ===');
    const fixedPolicy = JSON.parse(fixedJson);

    const updateRes = await fetch(`${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(fixedPolicy),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error(`Policy update failed: ${updateRes.status} - ${errText}`);
    } else {
      console.log('Policy updated successfully!');

      // Verify
      const verifyRes = await fetch(`${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}`, { headers });
      const verified = await verifyRes.json();
      console.log(`Policy status: ${verified.status}`);
    }
  } else {
    console.log('\nNo automatic replacements possible. Manual intervention needed.');
    console.log('Export the policy JSON from the UI and share it so I can analyze the UUIDs.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
