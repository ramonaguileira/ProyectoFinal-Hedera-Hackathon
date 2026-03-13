function validateDelivery(data) {
  const errors = [];
  if (!data.delivery_id) errors.push('delivery_id required');
  if (!data.supplier_id) errors.push('supplier_id required');
  if (!data.kg_brutos || data.kg_brutos <= 0) errors.push('kg_brutos must be > 0');
  if (data.kg_brutos > 200) errors.push('kg_brutos must be <= 200');
  if (data.pct_impropios < 0 || data.pct_impropios > 100) errors.push('pct_impropios must be 0-100');
  return { valid: errors.length === 0, errors };
}

function getQualityGrade(pctImpropios) {
  const pct = Number(pctImpropios ?? 0);
  if (pct <= 5) return 'A';
  if (pct <= 15) return 'B';
  if (pct <= 30) return 'C';
  return 'D';
}

function getQualityFactor(grade) {
  switch (grade) {
    case 'A':
      return 1.2;
    case 'B':
      return 1.0;
    case 'C':
      return 0.8;
    case 'D':
      return 0.5;
    default:
      return 1.0;
  }
}

function getAllianceFactor(deliveriesThisMonth = 0) {
  const count = Number(deliveriesThisMonth ?? 0);
  return count >= 4 ? 1.1 : 1.0;
}

module.exports = { validateDelivery, getQualityGrade, getQualityFactor, getAllianceFactor };
