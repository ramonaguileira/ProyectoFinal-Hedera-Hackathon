#!/usr/bin/env node
/**
 * Eggologic Testnet Setup
 * Creates EGGOCOINS token, CARBONCOIN NFT collection, and 3 HCS topics.
 * Run once: node scripts/setup-testnet.js
 */
require('dotenv').config();
const { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenType, TokenSupplyType, TopicCreateTransaction } = require('@hashgraph/sdk');

const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function createFungibleToken() {
  console.log('\n🪙 Creating EGGOCOINS token...');
  const tx = await new TokenCreateTransaction()
    .setTokenName('Eggologic Puntos')
    .setTokenSymbol('EGGOCOINS')
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(0)
    .setTreasuryAccountId(operatorId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setAdminKey(operatorKey.publicKey)
    .setSupplyKey(operatorKey.publicKey)
    .setTokenMemo('Eggologic supplier incentive points')
    .execute(client);
  const receipt = await tx.getReceipt(client);
  console.log(`✅ EGGOCOINS Token ID: ${receipt.tokenId}`);
  return receipt.tokenId;
}

async function createNftCollection() {
  console.log('\n🌍 Creating CARBONCOIN NFT collection...');
  const tx = await new TokenCreateTransaction()
    .setTokenName('Creditos Ambientales Eggologic')
    .setTokenSymbol('CARBONCOIN')
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(operatorId)
    .setSupplyType(TokenSupplyType.Infinite)
    .setAdminKey(operatorKey.publicKey)
    .setSupplyKey(operatorKey.publicKey)
    .setTokenMemo('1 NFT = 1 tCO2e avoided via CDM AMS-III.F composting')
    .execute(client);
  const receipt = await tx.getReceipt(client);
  console.log(`✅ CARBONCOIN Token ID: ${receipt.tokenId}`);
  return receipt.tokenId;
}

async function createTopic(memo) {
  const tx = await new TopicCreateTransaction().setTopicMemo(memo).execute(client);
  const receipt = await tx.getReceipt(client);
  console.log(`✅ Topic "${memo}": ${receipt.topicId}`);
  return receipt.topicId;
}

async function main() {
  if (process.env.EGGOCOINS_TOKEN_ID && process.env.EGGOCOINS_TOKEN_ID.toString() !== '0.0.xxxxx') {
    console.error('\n❌ ERROR: Los tokens ya han sido generados en el archivo .env.');
    console.error('El Token Canónico actual es:', process.env.EGGOCOINS_TOKEN_ID);
    console.error('Si querés volver a ejecutar este script, borralo manualmente del archivo .env.\n');
    process.exit(1);
  }

  console.log('🥚 Eggologic — Hedera Testnet Setup');
  console.log(`   Network: testnet`);
  console.log(`   Operator: ${operatorId}`);

  if (process.argv.includes('--dry-run')) {
    console.log('\n⚠️  DRY RUN MODE — no transactions will be sent');
    console.log('   Would create: EGGOCOINS token, CARBONCOIN NFT, 3 HCS topics');
    return;
  }

  const eggocoinsId = await createFungibleToken();
  const carboncoinId = await createNftCollection();

  console.log('\n📋 Creating HCS topics...');
  const deliveriesTopic = await createTopic('Eggologic:Deliveries');
  const batchesTopic = await createTopic('Eggologic:Batches');
  const productionTopic = await createTopic('Eggologic:Production');

  console.log('\n═══════════════════════════════════════');
  console.log('  Add these to your .env file:');
  console.log('═══════════════════════════════════════');
  console.log(`EGGOCOINS_TOKEN_ID=${eggocoinsId}`);
  console.log(`CARBONCOIN_TOKEN_ID=${carboncoinId}`);
  console.log(`TREASURY_ACCOUNT_ID=${operatorId}`);
  console.log(`HCS_TOPIC_DELIVERIES=${deliveriesTopic}`);
  console.log(`HCS_TOPIC_BATCHES=${batchesTopic}`);
  console.log(`HCS_TOPIC_PRODUCTION=${productionTopic}`);
  console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);
