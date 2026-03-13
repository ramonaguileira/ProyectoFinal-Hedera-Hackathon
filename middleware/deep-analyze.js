const fs = require('fs');
const p = JSON.parse(fs.readFileSync('policy-export.json', 'utf8'));

// Collect ALL blocks with their full properties
const issues = [];

function walkBlocks(obj, path) {
  if (!obj) return;
  path = path || 'root';

  if (obj.blockType) {
    const blockInfo = {
      path,
      tag: obj.tag || '',
      blockType: obj.blockType,
      issues: [],
    };

    // Check schema
    if ('schema' in obj && (!obj.schema || obj.schema === '')) {
      blockInfo.issues.push('schema is empty');
    }

    // Check tokenId
    if ('tokenId' in obj && obj.tokenId) {
      if (!obj.tokenId.match(/^\d+\.\d+\.\d+$/)) {
        blockInfo.issues.push(`tokenId is not Hedera format: "${obj.tokenId}"`);
      }
    }

    // Check for any empty required fields
    const requiredish = ['inputSchema', 'outputSchema', 'presetSchema', 'schemaIRI'];
    for (const field of requiredish) {
      if (field in obj && (!obj[field] || obj[field] === '')) {
        blockInfo.issues.push(`${field} is empty`);
      }
    }

    // Check uiMetaData for schema references
    if (obj.uiMetaData && obj.uiMetaData.fields) {
      // fields exist, check them
    }

    if (blockInfo.issues.length > 0) {
      issues.push(blockInfo);
    }
  }

  if (obj.children && Array.isArray(obj.children)) {
    obj.children.forEach((c, i) => walkBlocks(c, path + ' > ' + (c.tag || c.blockType || i)));
  }
}

walkBlocks(p.config);

if (issues.length > 0) {
  console.log(`Found ${issues.length} blocks with issues:\n`);
  issues.forEach((b, i) => {
    console.log(`${i + 1}. [${b.blockType}] tag="${b.tag}"`);
    b.issues.forEach(issue => console.log(`   -> ${issue}`));
  });
} else {
  console.log('No obvious issues found in block properties.');
}

// Check tokens section
console.log('\n=== Tokens in policy ===');
if (p.tokens) {
  p.tokens.forEach(t => {
    console.log(`  Name: ${t.tokenName || t.name || 'unknown'}`);
    console.log(`  ID: ${t.tokenId || 'none'}`);
    console.log(`  databaseId: ${t.databaseId || t._id || 'none'}`);
    console.log(`  Type: ${t.tokenType || 'unknown'}`);
    console.log('');
  });
}

// Check all blocks that reference tokens
console.log('=== Blocks referencing tokens ===');
function findTokenBlocks(obj, path) {
  if (!obj) return;
  path = path || 'root';
  if (obj.blockType && obj.tokenId) {
    console.log(`  [${obj.blockType}] tag="${obj.tag}" tokenId="${obj.tokenId}"`);
  }
  if (obj.children) obj.children.forEach((c, i) => findTokenBlocks(c, path + '/' + i));
}
findTokenBlocks(p.config);

// Also check policy-level fields
console.log('\n=== Policy top-level fields ===');
console.log('status:', p.status);
console.log('name:', p.name);
console.log('policyTag:', p.policyTag);
console.log('topicId:', p.topicId);

// Check groups and roles
if (p.policyGroups) {
  console.log('\nGroups:', JSON.stringify(p.policyGroups));
}
if (p.policyRoles) {
  console.log('Roles:', JSON.stringify(p.policyRoles));
}
if (p.policyTokens) {
  console.log('Policy tokens:', JSON.stringify(p.policyTokens));
}
