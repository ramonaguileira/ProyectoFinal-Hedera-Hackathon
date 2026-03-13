#!/usr/bin/env node
/**
 * Eggologic Demo Flow (CommonJS version)
 * Executes the complete pipeline with sample data for hackathon presentation.
 * Run: node scripts/demo-flow.js
 */
require('dotenv').config();
const {
  Client,
  AccountId,
  PrivateKey,
  TokenMintTransaction,
  TopicMessageSubmitTransaction,
} = require('@hashgraph/sdk');

// 0. Client Setup
const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const EGGOCOINS_ID = process.env.EGGOCOINS_TOKEN_ID;
const CARBONCOIN_ID = process.env.CARBONCOIN_TOKEN_ID;
const TOPIC_ID = process.env.HCS_TOPIC_DELIVERIES;

// Optional: Supplier Integration
const SUPPLIER_ACCOUNT_ID = process.env.SUPPLIER_ACCOUNT_ID;
const SUPPLIER_EVM = process.env.SUPPLIER_EVM_ADDRESS;
const SUPPLIER_MODE = process.env.SUPPLIER_MODE || 'custodial';
const SUPPLIER_KEY = process.env.SUPPLIER_PRIVATE_KEY;

// 1. Simulator Data
const DEMO_DELIVERIES = [
  { delivery_id: 'E-001', supplier_name: 'Restaurante La Esquina', kg_brutos: 80, pct_impropios: 5, alliance_factor: 1.1 },
  { delivery_id: 'E-002', supplier_name: 'Parrilla Don José', kg_brutos: 60, pct_impropios: 12, alliance_factor: 1.0 },
  { delivery_id: 'E-003', supplier_name: 'Cafetería Central', kg_brutos: 45, pct_impropios: 25, alliance_factor: 1.0 },
  { delivery_id: 'E-004', supplier_name: 'Hotel Playa', kg_brutos: 120, pct_impropios: 3, alliance_factor: 1.2 },
  { delivery_id: 'E-005', supplier_name: 'Comedor Escolar', kg_brutos: 55, pct_impropios: 8, alliance_factor: 1.1 },
];

function getQualityFactor(pct) {
  if (pct <= 5) return { grade: 'A', factor: 1.2 };
  if (pct <= 15) return { grade: 'B', factor: 1.0 };
  if (pct <= 30) return { grade: 'C', factor: 0.8 };
  return { grade: 'D', factor: 0.5 };
}

// 2. Hedera Functions
async function mintTokens(tokenId, amount, memo) {
  const transaction = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(Math.round(amount * 100)) // 2 decimals
    .setTransactionMemo(memo)
    .execute(client);
  await transaction.getReceipt(client);
  return transaction.transactionId.toString();
}

async function mintNft(tokenId, memo) {
  const transaction = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .addMetadata(Buffer.from(memo))
    .execute(client);
  await transaction.getReceipt(client);
  return transaction.transactionId.toString();
}

async function submitHcsMessage(topicId, message) {
  const transaction = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(message))
    .execute(client);
  await transaction.getReceipt(client);
  return transaction.transactionId.toString();
}

async function associateTokenWithSupplier(tokenId) {
  if (!SUPPLIER_ACCOUNT_ID || SUPPLIER_MODE !== 'custodial') return;
  if (!SUPPLIER_KEY) throw new Error("SUPPLIER_PRIVATE_KEY is missing for custodial mode!");

  const { TokenAssociateTransaction } = require('@hashgraph/sdk');
  const supplierKey = PrivateKey.fromStringECDSA(SUPPLIER_KEY);

  try {
    const tx = await new TokenAssociateTransaction()
      .setAccountId(SUPPLIER_ACCOUNT_ID)
      .setTokenIds([tokenId])
      .freezeWith(client)
      .sign(supplierKey);
    const result = await tx.execute(client);
    await result.getReceipt(client);
  } catch (err) {
    if (!err.message.includes("TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT")) {
      console.warn(`[!] Skipping association: ${err.message}`);
    }
  }
}

async function transferTokens(tokenId, amount) {
  if (!SUPPLIER_ACCOUNT_ID) return null;
  const { TransferTransaction } = require('@hashgraph/sdk');
  const transaction = await new TransferTransaction()
    .addTokenTransfer(tokenId, operatorId, -Math.round(amount * 100))
    .addTokenTransfer(tokenId, SUPPLIER_ACCOUNT_ID, Math.round(amount * 100))
    .execute(client);
  await transaction.getReceipt(client);
  return transaction.transactionId.toString();
}

async function transferNft(tokenId, serialNum) {
  if (!SUPPLIER_ACCOUNT_ID) return null;
  const { TransferTransaction } = require('@hashgraph/sdk');
  const transaction = await new TransferTransaction()
    .addNftTransfer(tokenId, serialNum, operatorId, SUPPLIER_ACCOUNT_ID)
    .execute(client);
  await transaction.getReceipt(client);
  return transaction.transactionId.toString();
}

// 3. Execution Pipeline
async function main() {
  console.log('\n🥚 Eggologic — Live Demo Flow (Hedera Testnet)');
  console.log('============================================\n');

  let totalEggocoins = 0;
  let carbonAccumulator = 0;
  const carbonThreshold = 1000;
  const conservativeFactor = 0.70;

  for (const d of DEMO_DELIVERIES) {
    const kgNetos = d.kg_brutos * (1 - d.pct_impropios / 100);
    const { grade, factor: qualityFactor } = getQualityFactor(d.pct_impropios);
    const eggocoins = Math.round(kgNetos * qualityFactor * d.alliance_factor * 100) / 100;
    const adjustedKg = Math.round(d.kg_brutos * conservativeFactor * 100) / 100;

    totalEggocoins += eggocoins;
    carbonAccumulator += adjustedKg;

    console.log(`📦 ENTREGA ${d.delivery_id}: ${d.supplier_name}`);
    console.log(`   ⚖️  ${d.kg_brutos}kg brutos -> ${kgNetos.toFixed(2)}kg netos (${d.pct_impropios}% impropios)`);
    console.log(`   🏆 Grado ${grade} (x${qualityFactor}) | Alianza: x${d.alliance_factor} -> ✨ ${eggocoins} EGGOCOINS`);

    // HTS Mint
    const mintTxId = await mintTokens(EGGOCOINS_ID, eggocoins, `Mint ${eggocoins} to ${d.supplier_name}`);
    console.log(`   ✅ HTS Mint (Treasury): ${mintTxId}`);

    if (SUPPLIER_ACCOUNT_ID) {
      await associateTokenWithSupplier(EGGOCOINS_ID);
      const supplierShare = Math.round(eggocoins * 0.70 * 100) / 100;
      const treasuryShare = Math.round((eggocoins - supplierShare) * 100) / 100;
      const transferTx = await transferTokens(EGGOCOINS_ID, supplierShare);
      console.log(`   💸 Transfer ${supplierShare} EGGOCOINS (70%) to ${SUPPLIER_ACCOUNT_ID}: ${transferTx}`);
      console.log(`   🏦 Retained ${treasuryShare} EGGOCOINS (30%) in Treasury`);
    }

    // HCS Message
    const hcsMsg = {
      event: 'DELIVERY_VERIFIED',
      data: { ...d, kg_netos: kgNetos, eggocoins, quality_grade: grade, timestamp: new Date().toISOString() }
    };
    const hcsTxId = await submitHcsMessage(TOPIC_ID, hcsMsg);
    console.log(`   📝 HCS Log: ${hcsTxId}`);

    console.log(`   🌱 Carbon Accumulator: ${carbonAccumulator.toFixed(2)} / ${carbonThreshold} kg\n`);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log(`🏁 RESUMEN FINAL`);
  console.log(`Total EGGOCOINS: ${totalEggocoins.toFixed(2)}`);
  console.log(`Acumulador Carbono: ${carbonAccumulator.toFixed(2)} kg`);

  if (carbonAccumulator >= carbonThreshold) {
    console.log(`🌍 Límite alcanzado! Minteando CARBONCOIN NFT...`);
    // Note: To properly get the Serial Number, we execute and query receipt.
    const mintTx = await new TokenMintTransaction()
      .setTokenId(CARBONCOIN_ID)
      .addMetadata(Buffer.from(`Carbon credit for ${carbonAccumulator}kg waste`))
      .execute(client);
    const receipt = await mintTx.getReceipt(client);
    const serial = receipt.serials[0].toNumber();
    console.log(`✅ NFT Minted! TokenID: ${CARBONCOIN_ID} | Serial: ${serial}`);
    console.log(`🏦 NFT depositado en la cuenta Treasury (no se transfiere al proveedor).`);

  } else {
    console.log(`📊 Faltan ${(carbonThreshold - carbonAccumulator).toFixed(2)} kg para el próximo CARBONCOIN`);
  }

  console.log('\n🔗 VERIFICAR EN HASHSCAN:');
  console.log(`- Base Tokens: https://hashscan.io/testnet/token/${EGGOCOINS_ID}`);
  console.log(`- Base Carbon: https://hashscan.io/testnet/token/${CARBONCOIN_ID}`);
  console.log(`- Audit Trail:  https://hashscan.io/testnet/topic/${TOPIC_ID}`);

  if (SUPPLIER_ACCOUNT_ID) {
    console.log(`\n💳 BILLETERA DEL PROVEEDOR (${SUPPLIER_MODE}):`);
    console.log(`- Account ID:  ${SUPPLIER_ACCOUNT_ID}`);
    if (SUPPLIER_EVM) console.log(`- EVM Address: ${SUPPLIER_EVM}`);
    console.log(`- Ver Balance: https://hashscan.io/testnet/account/${SUPPLIER_ACCOUNT_ID}`);
  }
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(error => {
  console.error('\n❌ ERROR:', error.message);
  process.exit(1);
});
