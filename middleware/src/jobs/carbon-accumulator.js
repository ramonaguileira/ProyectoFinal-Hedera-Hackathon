const config = require('../config/env');
const logger = require('../utils/logger');
let accumulatedKgAdjusted = 0;

async function checkCarbonThreshold() {
  if (accumulatedKgAdjusted >= config.carbon.thresholdKg) {
    logger.info(`CARBONCOIN threshold reached: ${accumulatedKgAdjusted} kg`);
    accumulatedKgAdjusted -= config.carbon.thresholdKg;
  }
}

function addToAccumulator(kgIngreso) {
  const kgAdjusted = kgIngreso * config.carbon.conservativeFactor;
  accumulatedKgAdjusted += kgAdjusted;
  logger.info(`Carbon accumulator: ${accumulatedKgAdjusted.toFixed(1)}/${config.carbon.thresholdKg} kg`);
}

module.exports = { checkCarbonThreshold, addToAccumulator };
