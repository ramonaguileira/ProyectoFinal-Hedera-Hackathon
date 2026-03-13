const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

const config = {
  hedera: {
    network: process.env.HEDERA_NETWORK || 'testnet',
    operatorId: process.env.HEDERA_OPERATOR_ID,
    operatorKey: process.env.HEDERA_OPERATOR_KEY,
    eggocoinsTokenId: process.env.EGGOCOINS_TOKEN_ID,
    carboncoinTokenId: process.env.CARBONCOIN_TOKEN_ID,
    treasuryAccountId: process.env.TREASURY_ACCOUNT_ID,
    topics: {
      deliveries: process.env.HCS_TOPIC_DELIVERIES,
      batches: process.env.HCS_TOPIC_BATCHES,
      production: process.env.HCS_TOPIC_PRODUCTION,
    },
  },
  guardian: {
    url: process.env.GUARDIAN_URL || 'http://localhost:3000',
    policyId: process.env.GUARDIAN_POLICY_ID,
    username: process.env.GUARDIAN_USERNAME,
    password: process.env.GUARDIAN_PASSWORD,
  },
  google: {
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  carbon: {
    thresholdKg: parseInt(process.env.CARBON_THRESHOLD_KG || '1000'),
    conservativeFactor: parseFloat(process.env.CONSERVATIVE_FACTOR || '0.70'),
  },
};

module.exports = config;
