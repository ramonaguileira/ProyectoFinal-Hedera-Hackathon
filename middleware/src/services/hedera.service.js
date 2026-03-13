const { TokenMintTransaction, TokenAssociateTransaction, TransferTransaction, TopicMessageSubmitTransaction, TokenId, AccountId } = require('@hashgraph/sdk');
const { getClient: getHederaClient } = require('../config/hedera');
const config = require('../config/env');
const logger = require('../utils/logger');

async function mintEggocoins(amount) {
  const client = getHederaClient();
  const amountLowestDenom = Math.round(amount * 100); // 2 decimals
  const tx = await new TokenMintTransaction()
    .setTokenId(TokenId.fromString(config.hedera.eggocoinsTokenId))
    .setAmount(amountLowestDenom)
    .execute(client);
  const receipt = await tx.getReceipt(client);
  logger.info(`HTS: Minted ${amount} EGGOCOINS (status: ${receipt.status})`);
  return { amount, status: receipt.status.toString(), txId: tx.transactionId.toString() };
}

async function transferEggocoins(supplierAccountId, amount) {
  const client = getHederaClient();
  const amountLowestDenom = Math.round(amount * 100);
  const tokenId = TokenId.fromString(config.hedera.eggocoinsTokenId);
  const treasuryId = AccountId.fromString(config.hedera.treasuryAccountId);
  const supplierId = AccountId.fromString(supplierAccountId);

  const tx = await new TransferTransaction()
    .addTokenTransfer(tokenId, treasuryId, -amountLowestDenom)
    .addTokenTransfer(tokenId, supplierId, amountLowestDenom)
    .execute(client);
  const receipt = await tx.getReceipt(client);
  logger.info(`HTS: Transferred ${amount} EGGOCOINS to ${supplierAccountId}`);
  return { status: receipt.status.toString(), txId: tx.transactionId.toString() };
}

async function publishHcsMessage(topicId, message) {
  const client = getHederaClient();
  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify({ v: '1.0', ts: new Date().toISOString(), ...message }))
    .execute(client);
  const receipt = await tx.getReceipt(client);
  logger.info(`HCS: Message published to ${topicId} (seq: ${receipt.topicSequenceNumber})`);
  return { sequenceNumber: receipt.topicSequenceNumber.toString(), txId: tx.transactionId.toString() };
}

async function publishAuditLog(topicId, message) {
  return publishHcsMessage(topicId, message);
}

async function mintCarboncoinNft(metadataCid) {
  const client = getHederaClient();
  const tx = await new TokenMintTransaction()
    .setTokenId(TokenId.fromString(config.hedera.carboncoinTokenId))
    .addMetadata(Buffer.from(metadataCid))
    .execute(client);
  const receipt = await tx.getReceipt(client);
  logger.info(`HTS: Minted CARBONCOIN NFT #${receipt.serials[0]} (CID: ${metadataCid})`);
  return { serial: receipt.serials[0].toString(), status: receipt.status.toString(), txId: tx.transactionId.toString() };
}

module.exports = {
  mintEggocoins,
  transferEggocoins,
  publishHcsMessage,
  publishAuditLog,
  mintCarboncoinNft
};
