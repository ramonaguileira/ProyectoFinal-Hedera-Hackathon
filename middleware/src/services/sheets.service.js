const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const config = require('../config/env');
const { getWeekNumber } = require('../utils/date.utils');
const logger = require('../utils/logger');

const GOOGLE_ENABLED = config.google && config.google.spreadsheetId && config.google.serviceAccountEmail && config.google.privateKey;

async function getDoc(readOnly = true) {
  if (!GOOGLE_ENABLED) {
    logger.info("Google Sheets polling disabled in demo mode");
    return null;
  }

  try {
    const auth = new JWT({
      email: config.google.serviceAccountEmail,
      key: config.google.privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ],
    });
    const doc = new GoogleSpreadsheet(config.google.spreadsheetId, auth);
    await doc.loadInfo();
    return doc;
  } catch (err) {
    logger.error(`Google Sheets connection error: ${err.message}`);
    return null;
  }
}

function mapRowToEntrega(row) {
  const kgBruto = parseFloat(row.get('kg_brutos') || row.get('Peso Bruto (kg)') || row.get('kg_bruto') || '0') || 0;
  const kgNeto = parseFloat(row.get('kg_netos') || row.get('Peso Neto (kg)') || row.get('kg_neto') || '0') || 0;
  const tara = parseFloat(row.get('Tara (kg)') || '0') || 0;
  const pctImpropios = parseFloat(row.get('pct_impropios') || '0') || 0;

  return {
    supplier_id: row.get('supplier_id') || row.get('Proveedor') || row.get('proveedor_id'),
    Fecha: row.get('Fecha') || row.get('fecha'),
    kg_brutos: kgBruto,
    pct_impropios: pctImpropios,
    destination: row.get('destination') || 'Plant',
    kg_netos: kgNeto || (kgBruto - tara),
    Eggocoin: parseFloat(row.get('Eggocoin') || '0'),
    kg_ajustados_cert: parseFloat(row.get('kg_ajustados_cert') || '0'),
    Foto: row.get('Foto') || row.get('foto'),

    eggo_entrega_date: row.get('Fecha') || row.get('fecha'),
    eggo_entrega_supplier_ref: row.get('supplier_id') || row.get('Proveedor'),
    eggo_entrega_kg_bruto: kgBruto,
    eggo_entrega_kg_neto: kgNeto || (kgBruto - tara),
    eggo_entrega_waste_type: mapWasteType(row.get('Tipo de Residuo') || row.get('tipo_residuo') || 'organico'),
    eggo_entrega_period: row.get('Semana') || row.get('periodo') || '',
    external_id: row.get('external_id') || row.get('ID') || '',
    _rowNumber: row.rowNumber,
  };
}

function mapWasteType(raw) {
  const map = {
    'organico': 'Food Waste',
    'orgánico': 'Food Waste',
    'food waste': 'Food Waste',
    'trampa_grasa': 'Grease Trap',
    'grease trap': 'Grease Trap',
    'mixto': 'Mixed Organic',
    'mixed organic': 'Mixed Organic',
    'poda': 'Garden Waste',
    'garden waste': 'Garden Waste',
  };
  return map[(raw || '').toLowerCase().trim()] || 'Food Waste';
}

async function getDeliveryRows() {
  const document = await getDoc();
  if (!document) return [];

  const sheet = document.sheetsByTitle['Entregas'] || document.sheetsByTitle['ENTREGAS'];
  if (!sheet) return [];
  const rows = await sheet.getRows();
  return rows.map(mapRowToEntrega);
}

async function addDeliveryRow(data) {
  const document = await getDoc(false);
  if (!document) return null;

  const sheet = document.sheetsByTitle['Entregas'] || document.sheetsByTitle['ENTREGAS'];
  if (!sheet) return null;

  try {
    const row = await sheet.addRow({
      Fecha: data.Fecha || new Date().toLocaleDateString('es-ES'),
      supplier_id: data.supplier_id,
      kg_brutos: data.kg_brutos,
      pct_impropios: data.pct_impropios || 0,
      destination: data.destination || 'Plant',
      kg_netos: data.kg_netos || data.kg_brutos,
      Foto: data.Foto || '',
      Semana: data.Semana || `W${getWeekNumber(new Date())}`,
      'Tipo de Residuo': data.waste_type || 'organico',
      external_id: data.external_id || `${data.supplier_id || 'unkn'}_${new Date().getTime()}`
    });
    return row;
  } catch (err) {
    logger.error(`Error adding row: ${err.message}`);
    throw err;
  }
}

async function getNewDeliveries(offset = 0) {
  const rows = await getDeliveryRows();
  return rows.slice(offset);
}

async function getDeliveryRowCount() {
  const rows = await getDeliveryRows();
  return rows.length;
}

module.exports = {
  getDeliveryRows,
  addDeliveryRow,
  getDeliveryRowCount,
  getNewDeliveries
};
