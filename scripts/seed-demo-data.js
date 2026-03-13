#!/usr/bin/env node
/**
 * Eggologic — Seed Demo Data
 * Generates real activity on Hedera Testnet for hackathon demonstration.
 * Run: node scripts/seed-demo-data.js
 */
require('dotenv').config();
const {
    Client,
    AccountId,
    PrivateKey,
    TokenMintTransaction,
    TopicMessageSubmitTransaction,
} = require('@hashgraph/sdk');

// 1. Hedera Client Setup
const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const TOKEN_ID = process.env.EGGOCOIN_TOKEN_ID;
const TOPIC_ID = process.env.HCS_TOPIC_DELIVERIES_ID;

// 2. Demo Data Constants
const SUPPLIERS = [
    { id: 'E-001', name: 'Restaurante La Esquina', kg_brutos: 80, pct_impropios: 5, grade: 'A', alliance: true },
    { id: 'E-002', name: 'Parrilla Don José', kg_brutos: 60, pct_impropios: 12, grade: 'B', alliance: true },
    { id: 'E-003', name: 'Cafetería Central', kg_brutos: 45, pct_impropios: 25, grade: 'C', alliance: false },
    { id: 'E-004', name: 'Hotel Playa', kg_brutos: 120, pct_impropios: 3, grade: 'A', alliance: true },
    { id: 'E-005', name: 'Comedor Escolar', kg_brutos: 55, pct_impropios: 8, grade: 'B', alliance: false },
    { id: 'E-006', name: 'Mercado del Puerto', kg_brutos: 90, pct_impropios: 28, grade: 'D', alliance: false },
];

const QUALITY_FACTORS = {
    'A': 1.20,
    'B': 1.10,
    'C': 0.90,
    'D': 0.00
};

const ALLIANCE_FACTOR = 1.10;

// 3. Helper Functions
function calculateMetrics(s) {
    const kg_netos = Math.round(s.kg_brutos * (1 - s.pct_impropios / 100) * 100) / 100;
    const q_factor = QUALITY_FACTORS[s.grade] || 0;
    const a_factor = s.alliance ? ALLIANCE_FACTOR : 1.00;
    const eggocoins = Math.round(kg_netos * q_factor * a_factor * 100) / 100;
    const co2_avoided = Math.round(kg_netos * 0.70 * 100) / 100;

    return { kg_netos, eggocoins, co2_avoided };
}

// 4. Main Execution Logic
async function seedData() {
    console.log('\n🌱 Eggologic — Seeding Demo Data (Hedera Testnet)\n');
    console.log(`Token ID: ${TOKEN_ID}`);
    console.log(`Topic ID: ${TOPIC_ID}\n`);

    for (const s of SUPPLIERS) {
        try {
            const { kg_netos, eggocoins, co2_avoided } = calculateMetrics(s);

            console.log(`📦 ${s.name} (${s.id})`);

            // A) Mint EGGOCOINS
            let mintTxId = 'N/A';
            if (eggocoins > 0) {
                const mintTx = await new TokenMintTransaction()
                    .setTokenId(TOKEN_ID)
                    .setAmount(Math.round(eggocoins * 100))
                    .execute(client);
                const receipt = await mintTx.getReceipt(client);
                mintTxId = mintTx.transactionId.toString();
                console.log(`   🪙 Mint EGGOCOINS txId: ${mintTxId}`);
                console.log(`      Link: https://hashscan.io/testnet/transaction/${mintTxId}`);
            } else {
                console.log(`   🪙 Mint skipped (Grade D)`);
            }

            // B) HCS Message
            const message = {
                schema_version: "1.0",
                event: "DELIVERY_VERIFIED",
                project_id: "EGGOLOGIC-HUB-001",
                delivery_id: s.id,
                supplier: {
                    name: s.name,
                    grade: s.grade
                },
                waste: {
                    kg_brutos: s.kg_brutos,
                    pct_impropios: s.pct_impropios,
                    kg_netos: kg_netos
                },
                treatment: {
                    method: "BSF_bioconversion",
                    destination: "larvae_production"
                },
                carbon: {
                    baseline: "landfill_methane_generation",
                    emission_factor: 0.70,
                    co2e_avoided_kg: co2_avoided
                },
                rewards: {
                    token: "EGGOCOIN",
                    token_id: TOKEN_ID,
                    amount: eggocoins
                },
                timestamp_utc: new Date().toISOString()
            };

            const hcsTx = await new TopicMessageSubmitTransaction()
                .setTopicId(TOPIC_ID)
                .setMessage(JSON.stringify(message))
                .execute(client);
            await hcsTx.getReceipt(client);
            const hcsTxId = hcsTx.transactionId.toString();
            console.log(`   🛰️ HCS message txId: ${hcsTxId}`);
            console.log(`      Link: https://hashscan.io/testnet/transaction/${hcsTxId}`);

            console.log(`   ✅ Delivery processed\n`);

        } catch (error) {
            console.error(`   ❌ Error processing ${s.name}:`, error.message);
        }
    }

    console.log('🏁 Seeding completed.\n');
}

seedData().catch(err => {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
});
