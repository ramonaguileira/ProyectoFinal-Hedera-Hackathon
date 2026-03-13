const { getNewDeliveries } = require('../services/sheets.service');
const { submitEntrega } = require('../services/guardian.service');
const { calculateEggocoins, calculateNetWeight } = require('../services/points.service');
const { validateEntrega } = require('../utils/validators');
const { mintEggocoins, publishAuditLog } = require('../services/hedera.service');
const config = require('../config/env');
const logger = require('../utils/logger');

let lastProcessedCount = 0;
const processedIds = new Set(); // Simple in-memory de-duplicator

async function pollDeliveries() {
  if (process.env.DEMO_MODE === 'true') {
    logger.info('[DEMO_MODE] Salteando el polling a Google Sheets y Guardian.');
    return;
  }

  try {
    const newDeliveries = await getNewDeliveries(lastProcessedCount);
    if (!newDeliveries || newDeliveries.length === 0) return;
    logger.info(`Found ${newDeliveries.length} new deliveries`);

    for (const entrega of newDeliveries) {
      // 1. Check for duplicates using unique ID
      if (entrega.external_id && processedIds.has(entrega.external_id)) {
        logger.info(`Skipping already processed delivery: ${entrega.external_id}`);
        continue;
      }

      const { valid, errors } = validateEntrega(entrega);
      if (!valid) {
        // Only log if it's not a completely empty row (to reduce noise)
        if (entrega.supplier_id || entrega.eggo_entrega_supplier_ref) {
          logger.warn(`Skipping invalid entrega row ${entrega._rowNumber}: ${errors.join(', ')}`);
        }
        continue;
      }

      // Calculate reward using carbon-based formula
      const reward = calculateEggocoins(entrega.eggo_entrega_kg_neto);

      // Submit to Guardian
      await submitEntrega(entrega);

      // Mint EGGOCOINS via HTS
      await mintEggocoins(reward.eggo_reward_points);

      // Audit log to HCS
      await publishAuditLog(config.hedera.topics.deliveries, {
        event_type: 'ENTREGA_RECEIVED',
        supplier_ref: entrega.eggo_entrega_supplier_ref,
        date: entrega.eggo_entrega_date,
        kg_neto: entrega.eggo_entrega_kg_neto,
        waste_type: entrega.eggo_entrega_waste_type,
        methane_avoided: reward.eggo_reward_methane_avoided,
        compost_carbon: reward.eggo_reward_compost_carbon,
        eggocoins_minted: reward.eggo_reward_points,
        period: entrega.eggo_entrega_period,
      });

      if (entrega.external_id) {
        processedIds.add(entrega.external_id);
      }
      lastProcessedCount++;
    }
  } catch (error) {
    logger.error(`Poll error: ${error.message}`);
  }
}

module.exports = { pollDeliveries };
