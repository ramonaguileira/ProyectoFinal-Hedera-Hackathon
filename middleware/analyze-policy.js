const fs = require('fs');
const p = JSON.parse(fs.readFileSync('policy-export.json', 'utf8'));
const json = JSON.stringify(p);

// Find all schema refs
const refs = [...json.matchAll(/#([0-9a-f-]+)&/gi)].map(m => m[1]);
const unique = [...new Set(refs)];
console.log('Schema UUIDs referenced in policy:', unique.length);
unique.forEach(u => console.log('  ', u));

// Walk all blocks looking for problems
function walkBlocks(obj, path) {
  if (!obj) return;
  path = path || 'root';

  if (obj.blockType) {
    // Check schema field
    if ('schema' in obj) {
      if (!obj.schema || obj.schema === '') {
        console.log('EMPTY schema:', path, '|', obj.tag || '', '|', obj.blockType);
      }
    }
    // Check schemaIRI field
    if ('schemaIRI' in obj) {
      if (!obj.schemaIRI || obj.schemaIRI === '') {
        console.log('EMPTY schemaIRI:', path, '|', obj.tag || '', '|', obj.blockType);
      }
    }
    // Check for any property containing "does not exist" pattern
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string' && val.includes('does not exist')) {
        console.log('ERROR in', key + ':', path, '|', obj.tag, '->', val);
      }
    }
  }

  if (obj.children && Array.isArray(obj.children)) {
    obj.children.forEach((c, i) => walkBlocks(c, path + '/' + (c.tag || c.blockType || i)));
  }
}

walkBlocks(p.config);

// Count all blocks
function countBlocks(obj) {
  let n = obj && obj.blockType ? 1 : 0;
  if (obj && obj.children) obj.children.forEach(c => { n += countBlocks(c); });
  return n;
}
console.log('\nTotal blocks:', countBlocks(p.config));

// Look for token references
const tokenRefs = json.match(/tokenId['":\s]+([^"',}\s]+)/gi);
if (tokenRefs) {
  console.log('\nToken references:');
  [...new Set(tokenRefs)].forEach(t => console.log('  ', t));
}

// Check if there are any "errors" or "isValid" fields
if (p.errors) console.log('\nPolicy errors:', JSON.stringify(p.errors));
if ('isValid' in p) console.log('isValid:', p.isValid);

// Look for all unique blockTypes
const blockTypes = new Set();
function collectTypes(obj) {
  if (!obj) return;
  if (obj.blockType) blockTypes.add(obj.blockType);
  if (obj.children) obj.children.forEach(collectTypes);
}
collectTypes(p.config);
console.log('\nBlock types used:', [...blockTypes].join(', '));
