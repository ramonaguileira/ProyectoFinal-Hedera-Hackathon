const { Client, AccountId, PrivateKey } = require('@hashgraph/sdk');
const config = require('./env');
const logger = require('../utils/logger');

let client;

function initHederaClient() {
  const operatorId = AccountId.fromString(config.hedera.operatorId);
  // The operator key in the .env is an ECDSA key (secp256k1), so parse accordingly.
  const operatorKey = PrivateKey.fromStringECDSA(config.hedera.operatorKey);

  client = config.hedera.network === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

  client.setOperator(operatorId, operatorKey);
  logger.info(`Hedera client initialized on ${config.hedera.network}`);
  return client;
}

function getClient() {
  if (!client) initHederaClient();
  return client;
}

module.exports = { initHederaClient, getClient };
