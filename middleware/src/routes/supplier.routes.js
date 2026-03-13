const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ suppliers: [] }));
router.get('/:id/balance', (req, res) => res.json({ supplier_id: req.params.id, eggocoins_balance: 0 }));
module.exports = router;
