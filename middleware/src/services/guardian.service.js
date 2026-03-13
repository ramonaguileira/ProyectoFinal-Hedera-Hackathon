const config = require('../config/env');
const logger = require('../utils/logger');

const GUARDIAN_ENABLED = config.guardian && config.guardian.policyId && config.guardian.username && config.guardian.password;
const GUARDIAN_URL = config.guardian?.url || 'http://localhost:3000';
let accessToken = null;
let refreshToken = null;

async function guardianLogin() {
  if (!GUARDIAN_ENABLED) {
    logger.info("Guardian integration disabled in demo mode");
    return null;
  }
  try {
    const res = await fetch(`${GUARDIAN_URL}/api/v1/accounts/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: config.guardian.username, password: config.guardian.password }),
    });
    if (!res.ok) throw new Error(`Guardian login failed: ${res.status}`);
    const data = await res.json();
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
    logger.info('Guardian: authenticated successfully');
    return accessToken;
  } catch (err) {
    logger.error(`Guardian login error: ${err.message}`);
    return null;
  }
}

async function getToken() {
  if (!accessToken) return guardianLogin();
  return accessToken;
}

async function submitDelivery(deliveryData) {
  if (!GUARDIAN_ENABLED) return { status: 'DISABLED' };

  const token = await getToken();
  if (!token) return { status: 'AUTH_FAILED' };

  try {
    const res = await fetch(
      `${GUARDIAN_URL}/api/v1/policies/${config.guardian.policyId}/tag/submit_entrega_mrv`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: {
            delivery_id: deliveryData.delivery_id,
            supplier_id: deliveryData.supplier_id,
            kg_brutos: deliveryData.kg_brutos,
            pct_impropios: deliveryData.pct_impropios,
            kg_netos: deliveryData.kg_netos,
            fecha: deliveryData.fecha,
            destino: deliveryData.destino,
            quality_grade: deliveryData.quality_grade,
            factor_calidad: deliveryData.factor_calidad,
            factor_alianza: deliveryData.factor_alianza,
          },
          ref: null,
        }),
      }
    );
    if (!res.ok) throw new Error(`Guardian submission failed: ${res.status}`);
    logger.info(`Guardian: delivery ${deliveryData.delivery_id} submitted`);
    return res.json();
  } catch (err) {
    logger.error(`Guardian submission error: ${err.message}`);
    return { status: 'ERROR', message: err.message };
  }
}

module.exports = { guardianLogin, submitDelivery };
