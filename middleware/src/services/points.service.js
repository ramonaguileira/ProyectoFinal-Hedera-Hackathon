const { getQualityGrade, getQualityFactor, getAllianceFactor } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * Calculate EGGOCOINS for a delivery
 * Formula: kg_netos × factor_calidad × factor_alianza
 */
function calculateEggocoins(deliveryData, deliveriesThisMonth = 0) {
  const kgNetos = deliveryData.kg_brutos * (1 - deliveryData.pct_impropios / 100);
  const grade = getQualityGrade(deliveryData.pct_impropios);
  const factorCalidad = getQualityFactor(grade);
  const factorAlianza = typeof deliveryData.factor_alianza === 'number'
    ? deliveryData.factor_alianza
    : getAllianceFactor(deliveriesThisMonth);
  const eggocoins = kgNetos * factorCalidad * factorAlianza;
  const result = {
    kg_netos: Math.round(kgNetos * 100) / 100,
    quality_grade: grade,
    factor_calidad: factorCalidad,
    factor_alianza: factorAlianza,
    eggocoins: Math.round(eggocoins * 100) / 100,
  };
  logger.info(`Points: ${result.kg_netos} kg × ${factorCalidad} × ${factorAlianza} = ${result.eggocoins} EGGOCOINS`);
  return result;
}

/**
 * Calculate adjusted kg for carbon credit accumulation
 * Formula: kg_ingreso × conservative_factor (0.70)
 */
function calculateAdjustedKg(kgIngreso, conservativeFactor = 0.70) {
  return Math.round(kgIngreso * conservativeFactor * 100) / 100;
}

module.exports = { calculateEggocoins, calculateAdjustedKg, getQualityGrade, getAllianceFactor };
