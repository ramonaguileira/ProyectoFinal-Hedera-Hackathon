const express = require('express');
const router = express.Router();
const {
  getGuardianStatus,
  getPolicyInfo,
  getPolicySchemas,
  getPolicyTokens,
  getProfile,
  loadLocalSchemas,
} = require('../services/guardian.service');

// GET /api/guardian/status — system status + connectivity
router.get('/status', async (req, res) => {
  const status = await getGuardianStatus();
  res.json(status);
});

// GET /api/guardian/profile — operator profile
router.get('/profile', async (req, res) => {
  const profile = await getProfile();
  res.json(profile);
});

// GET /api/guardian/policy — policy definition with blocks, tokens, roles
router.get('/policy', async (req, res) => {
  const policy = await getPolicyInfo();
  res.json(policy);
});

// GET /api/guardian/schemas — all schemas with field details
router.get('/schemas', async (req, res) => {
  const schemas = await getPolicySchemas();
  res.json(schemas);
});

// GET /api/guardian/schemas/:name — single schema detail
router.get('/schemas/:name', (req, res) => {
  const schemas = loadLocalSchemas();
  const schema = schemas.find(s =>
    s.name.toLowerCase().includes(req.params.name.toLowerCase()) ||
    s.file.toLowerCase().includes(req.params.name.toLowerCase())
  );
  if (!schema) return res.status(404).json({ error: 'Schema not found' });
  res.json(schema);
});

// GET /api/guardian/tokens — token definitions with Hedera IDs
router.get('/tokens', async (req, res) => {
  const tokens = await getPolicyTokens();
  res.json(tokens);
});

module.exports = router;
