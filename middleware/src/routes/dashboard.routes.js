const express = require('express');
const router = express.Router();
const { DEMO_DELIVERIES } = require('../data/demo-data');
const { getDeliveryRows } = require('../services/sheets.service');
const config = require('../config/env');

const normalizeDeliveryRow = (row) => ({
  id: row.delivery_id || (row._rowNumber ? `${row._rowNumber}` : null),
  date: row.fecha || row.date || null,
  provider: row.supplier_id || row.proveedor || null,
  kg_brutos: Number(row.kg_brutos) || 0,
  pct_impropios: Number(row.pct_impropios) || 0,
  kg_netos: Number(row.kg_netos) || 0,
  grade: row.quality_grade || row.grade || null,
  coins: Number(row.puntos_generados) || Number(row.coins) || 0,
  hcs_tx: row.hcs_tx || null,
  hts_mint_tx: row.hts_mint_tx || null,
});

async function getCurrentDeliveries() {
  try {
    const rows = await getDeliveryRows();
    if (rows && rows.length > 0) {
      return rows.map(normalizeDeliveryRow);
    }
  } catch (err) {
    // Intentionally swallow; fallback to demo deliveries
  }
  return DEMO_DELIVERIES;
}

router.get('/stats', async (req, res) => {
  const deliveries = await getCurrentDeliveries();

  const total_deliveries = deliveries.length;
  const kg_brutos_total = deliveries.reduce((sum, d) => sum + (d.kg_brutos || 0), 0);
  const kg_net_total = deliveries.reduce((sum, d) => sum + (d.kg_netos || 0), 0);
  const eggocoins_total = deliveries.reduce((sum, d) => sum + (d.coins || 0), 0);

  const conservativeFactor = config.carbon.conservativeFactor || 0.7;
  const carbon_threshold = config.carbon.thresholdKg || 1000;
  const carbon_progress = Math.round(kg_brutos_total * conservativeFactor * 100) / 100;

  const nfts_minted = Math.floor(carbon_progress / carbon_threshold);
  const current_progress = carbon_progress % carbon_threshold;

  res.json({
    total_deliveries,
    kg_net_total: Math.round(kg_net_total * 100) / 100,
    eggocoins_total: Math.round(eggocoins_total * 100) / 100,
    carbon_progress: current_progress,
    carbon_total_accumulated: carbon_progress,
    carbon_threshold,
    nfts_minted
  });
});

router.get('/deliveries/recent', async (req, res) => {
  const deliveries = await getCurrentDeliveries();
  res.json({ deliveries });
});

module.exports = router;
