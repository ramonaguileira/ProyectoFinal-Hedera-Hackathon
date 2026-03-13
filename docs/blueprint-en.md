# Hedera Guardian implementation blueprint for Eggologic

**Eggologic can tokenize its entire waste-to-egg circular economy on Hedera for roughly $0.20/month in transaction costs, using Guardian's policy engine for MRV verification and HTS for both supplier incentive tokens and environmental credits.** The architecture bridges the current Google Sheets MVP to on-chain verification through a Node.js middleware layer that polls Sheets data and submits it to Guardian's REST API. Guardian's existing CDM AMS-III.F composting methodology provides a ready-made template for carbon credit quantification. No production deployment of an organic-waste-to-BSF-to-eggs cycle exists on Guardian yet, making Eggologic a novel circular economy use case — but the patterns from DOVU (agricultural carbon credits) and TYMLEZ (IoT-to-Guardian MRV) directly apply.

---

## Guardian policy architecture maps directly to Eggologic's data model

Guardian policies are built from **configurable blocks** arranged in a tree structure. Each block has a `blockType`, a unique `tag`, `permissions`, and a `defaultActive` flag. Documents (Verifiable Credentials) flow through blocks, getting validated, calculated upon, approved, and eventually triggering token mints. The three core roles for Eggologic are **Standard Registry** (Eggologic admin), **Operator** (field staff entering data), and **Verifier** (quality auditor or automated check).

The recommended Eggologic policy workflow uses these block types in sequence:

```
PolicyRolesBlock (roles: "Supplier", "Operator", "Verifier", "Registry")
├── InterfaceStepBlock [Supplier Registration]
│   ├── requestVcDocumentBlock (schema: SupplierRegistration)
│   ├── sendToGuardianBlock (dataType: "approve")
│   └── [Registry approves] → sendToGuardianBlock (dataType: "vc-documents")
│
├── InterfaceStepBlock [Delivery MRV Flow]
│   ├── requestVcDocumentBlock (schema: EntregaSchema)
│   ├── documentValidatorBlock (validate delivery data)
│   ├── sendToGuardianBlock (dataType: "approve")
│   ├── [Verifier approval via InterfaceActionBlock]
│   ├── calculateContainerBlock
│   │     └── calculateMathAddOnBlock (kg_netos, quality factor, points)
│   ├── sendToGuardianBlock (dataType: "hedera") → publish to HCS topic
│   └── mintDocumentBlock (token: PUNTOS fungible token)
│
├── InterfaceStepBlock [Batch Processing]
│   ├── requestVcDocumentBlock (schema: BatchSchema)
│   ├── aggregateDocumentBlock (link deliveries → batch)
│   ├── setRelationshipsBlock (link batch → deliveries)
│   ├── calculateContainerBlock (conversion_ratio, compost output)
│   └── sendToGuardianBlock (dataType: "hedera")
│
├── InterfaceStepBlock [Production Recording]
│   ├── requestVcDocumentBlock (schema: ProduccionSchema)
│   ├── setRelationshipsBlock (link production → batch)
│   └── sendToGuardianBlock
│
├── InterfaceStepBlock [Environmental Credit Issuance]
│   ├── aggregateDocumentBlock (aggregate batch MRV data)
│   ├── calculateContainerBlock (CO2e avoided from composting)
│   ├── [Verifier approval]
│   └── mintDocumentBlock (token: ECOCRDT NFT)
│
└── reportBlock (full trustchain audit trail)
```

**Key block decisions for Eggologic:**

- Use **`requestVcDocumentBlock`** (not `externalDataBlock`) for the middleware pipeline. It accepts plain JSON and Guardian wraps it into a signed VC automatically. The `externalDataBlock` requires pre-signed VCs and is better suited for IoT sensors later.
- The **`calculateContainerBlock`** with **`calculateMathAddOnBlock`** handles the PUNTOS formula on-chain: `kg_netos × factor_calidad × factor_alianza`. Configure the math addon to reference VC field names directly.
- The **`switchBlock`** enables conditional routing — for example, routing deliveries with `pct_impropios > 20%` to a rejection flow versus auto-approval for clean deliveries.
- The **`aggregateDocumentBlock`** is critical for linking individual deliveries into weekly batches, enabling batch-level carbon credit calculations.

---

## Six Guardian schemas cover the complete Eggologic data model

Guardian schemas follow **JSON-LD + JSON Schema** format and define the content of Verifiable Credentials. Each schema has an entity type: **VC** (standard credential), **MRV** (measurement data triggering calculations), or **None** (sub-schema for embedding). Available field types include String, Number, Integer, Boolean, Date, Enum, GeoJSON, URI, Image, Account (Hedera account ref), and Auto-Calculate.

### Schema 1: EntregaSchema (MRV type)

This is the core delivery schema, mapping directly to the ENTREGAS table:

```json
{
  "$id": "#eggologic-entrega-v1",
  "title": "Entrega de Residuos Orgánicos",
  "description": "Organic waste delivery record from supplier",
  "type": "object",
  "properties": {
    "@context": { "type": "array" },
    "type": { "type": "string" },
    "delivery_id": {
      "title": "Delivery ID",
      "type": "string",
      "$comment": "{\"term\":\"delivery_id\",\"@id\":\"https://schema.org/identifier\"}"
    },
    "supplier_id": {
      "title": "Supplier ID",
      "type": "string",
      "$comment": "{\"term\":\"supplier_id\",\"@id\":\"https://schema.org/identifier\"}"
    },
    "kg_brutos": {
      "title": "Gross Weight (kg)",
      "type": "number",
      "$comment": "{\"term\":\"kg_brutos\",\"@id\":\"https://schema.org/weight\"}"
    },
    "pct_impropios": {
      "title": "Contaminant Percentage (%)",
      "type": "number"
    },
    "kg_netos": {
      "title": "Net Weight (kg)",
      "type": "number",
      "$comment": "{\"term\":\"kg_netos\",\"@id\":\"https://schema.org/weight\"}"
    },
    "fecha": {
      "title": "Delivery Date",
      "type": "string",
      "format": "date"
    },
    "quality_grade": {
      "title": "Quality Grade",
      "type": "string",
      "enum": ["A", "B", "C", "D"]
    },
    "factor_calidad": {
      "title": "Quality Factor",
      "type": "number"
    },
    "factor_alianza": {
      "title": "Alliance Factor",
      "type": "number"
    }
  },
  "required": ["delivery_id", "supplier_id", "kg_brutos", "fecha"]
}
```

### Schema 2–6 summary

| Schema | Entity Type | Key Fields | Maps To |
|---|---|---|---|
| **SupplierRegistrationSchema** | VC | supplier_id, name, contact, alliance_tier, hedera_account_id, location | PROVEEDORES |
| **EntregaSchema** | MRV | delivery_id, supplier_id, kg_brutos, pct_impropios, kg_netos, fecha, quality_grade, factor_calidad, factor_alianza | ENTREGAS |
| **BatchSchema** | VC | batch_id, delivery_ids (array), waste_input_kg, larvae_output_kg, compost_output_kg, conversion_ratio, start_date, end_date | BATCHES |
| **ProduccionSchema** | MRV | production_id, batch_id, eggs_count, larvae_kg, compost_kg, date | PRODUCCIÓN |
| **SupplierPointsSchema** | VC | supplier_id, delivery_id, puntos_earned, formula_inputs, period | Token mint reference |
| **CarbonCreditSchema** | VC | credit_id, methodology, batch_ids, emission_reductions_tCO2e, vintage_year, verification_status, verifier_did | NFT mint reference |

When a `requestVcDocumentBlock` collects data using any schema, Guardian automatically wraps it in a VC with DID-based issuer, issuance date, cryptographic proof, and `credentialSubject` containing the submitted fields. The VP (Verifiable Presentation) aggregating these VCs is uploaded to IPFS, with the CID recorded in an HCS topic message — creating the **trustchain**.

---

## Guardian REST API connects the middleware to on-chain verification

Guardian exposes a full REST API at `http://<guardian-host>:3000/api/v1/` with Swagger docs at `/api-docs/v1/`. Authentication is **JWT-based** — all calls except login require an `Authorization: Bearer <token>` header.

### Authentication flow

```javascript
// 1. Login to get JWT tokens
const loginRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'eggologic_operator',
    password: 'secure_password'
  })
});
const { accessToken, refreshToken } = await loginRes.json();

// 2. Refresh when expired
const refreshRes = await fetch(`${GUARDIAN_URL}/api/v1/accounts/access-token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
```

### Core API endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/accounts/login` | POST | Authenticate, get JWT |
| `/api/v1/policies` | GET/POST | List or create policies |
| `/api/v1/policies/{policyId}/publish` | PUT | Publish policy to Hedera |
| `/api/v1/policies/{policyId}/blocks/{blockId}` | GET/POST | Read block data or submit data to a block |
| `/api/v1/policies/{policyId}/tag/{tag}` | POST | **Submit data by block tag** (more stable than block UUID) |
| `/api/v1/policies/{policyId}/dry-run` | PUT | Enable dry-run testing mode |
| `/api/v1/policies/{policyId}/dry-run/user` | POST | Create virtual test user |
| `/api/v1/schemas` | GET/POST | List or create schemas |
| `/api/v1/schemas/{schemaId}/publish` | PUT | Publish schema |
| `/api/v1/tokens` | GET/POST | List or create tokens |
| `/api/v1/policies/import/file` | POST | Import policy from .policy file |

### Submitting MRV data programmatically

The critical integration point — submitting a delivery from the middleware to Guardian:

```javascript
// Submit delivery MRV data to Guardian via block tag (preferred over block UUID)
async function submitDeliveryToGuardian(accessToken, deliveryData) {
  const response = await fetch(
    `${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}/tag/submit_entrega_mrv`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        document: {
          delivery_id: deliveryData.delivery_id,
          supplier_id: deliveryData.supplier_id,
          kg_brutos: deliveryData.kg_brutos,
          pct_impropios: deliveryData.pct_impropios,
          kg_netos: deliveryData.kg_netos,
          fecha: deliveryData.fecha,
          quality_grade: deliveryData.quality_grade,
          factor_calidad: deliveryData.factor_calidad,
          factor_alianza: deliveryData.factor_alianza
        },
        ref: null
      })
    }
  );
  return response.json();
}
```

**Using block tags** (`/tag/submit_entrega_mrv`) instead of block UUIDs is the recommended pattern — tags are stable across policy versions while block IDs change on republish.

### Approval flow from the API

```javascript
// Verifier fetches pending approvals
const pending = await fetch(
  `${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}/tag/approval_list`,
  { headers: { 'Authorization': `Bearer ${verifierToken}` } }
);

// Verifier approves a specific delivery
await fetch(
  `${GUARDIAN_URL}/api/v1/policies/${POLICY_ID}/tag/approve_delivery`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${verifierToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      document: { /* original VC */ },
      option: { status: 'approved' }
    })
  }
);
```

---

## HTS token design for PUNTOS and environmental credits

### Fungible token: PUNTOS (supplier incentive points)

```javascript
import {
  Client, PrivateKey, AccountId, Hbar,
  TokenCreateTransaction, TokenType, TokenSupplyType,
  TokenMintTransaction, TokenAssociateTransaction, TransferTransaction
} from "@hashgraph/sdk";

// === CREATE PUNTOS TOKEN (one-time, costs $1.00) ===
const tokenCreateTx = await new TokenCreateTransaction()
  .setTokenName("Eggologic Puntos")
  .setTokenSymbol("PUNTOS")
  .setTokenType(TokenType.FungibleCommon)
  .setDecimals(2)                            // supports fractional points (152.75)
  .setInitialSupply(0)                       // mint on demand per delivery
  .setTreasuryAccountId(treasuryAccountId)
  .setSupplyType(TokenSupplyType.Infinite)   // no cap on total points
  .setAdminKey(adminKey.publicKey)
  .setSupplyKey(supplyKey.publicKey)          // REQUIRED for minting
  .setTokenMemo("Eggologic supplier incentive points")
  .freezeWith(client);

const signed = await (await tokenCreateTx.sign(treasuryKey)).sign(adminKey);
const receipt = await (await signed.execute(client)).getReceipt(client);
const puntosTokenId = receipt.tokenId; // e.g., 0.0.456789
```

**Design rationale:** **Infinite supply** because points are minted continuously per delivery. **Two decimals** because the formula `kg_netos × factor_calidad × factor_alianza` can produce fractional results (e.g., 138.16 × 0.95 × 1.2 = 157.40). Initial supply of zero avoids pre-allocation — tokens exist only when earned.

### Minting PUNTOS per delivery

```javascript
async function mintPuntos(tokenId, kgNetos, factorCalidad, factorAlianza) {
  const puntos = kgNetos * factorCalidad * factorAlianza;
  const amountLowestDenom = Math.round(puntos * 100); // 2 decimals → multiply by 100

  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(amountLowestDenom)
    .freezeWith(client);

  const signed = await mintTx.sign(supplyKey);
  const response = await signed.execute(client);
  const receipt = await response.getReceipt(client);
  return { puntos, status: receipt.status.toString(), txId: response.transactionId.toString() };
}

// Example: 138.16 kg × 0.95 quality × 1.2 alliance = 157.40 PUNTOS
await mintPuntos(puntosTokenId, 138.16, 0.95, 1.2);
```

### Token association and transfer to suppliers

```javascript
// Each supplier must associate once (costs $0.05)
const associateTx = await new TokenAssociateTransaction()
  .setAccountId(supplierAccountId)
  .setTokenIds([puntosTokenId])
  .freezeWith(client)
  .sign(supplierKey);
await associateTx.execute(client);

// Transfer minted PUNTOS from treasury to supplier
const transferTx = await new TransferTransaction()
  .addTokenTransfer(puntosTokenId, treasuryAccountId, -amountLowestDenom)
  .addTokenTransfer(puntosTokenId, supplierAccountId, amountLowestDenom)
  .freezeWith(client)
  .sign(treasuryKey);
await transferTx.execute(client);
```

### NFT environmental credits: ECOCRDT

For carbon/environmental credits, each verified batch cycle mints an NFT with immutable metadata linking to the full MRV trustchain:

```javascript
// Create NFT collection (one-time, $1.00)
const nftCreateTx = await new TokenCreateTransaction()
  .setTokenName("Eggologic Environmental Credits")
  .setTokenSymbol("ECOCRDT")
  .setTokenType(TokenType.NonFungibleUnique)
  .setDecimals(0)                         // must be 0 for NFTs
  .setInitialSupply(0)                    // must be 0 for NFTs
  .setSupplyType(TokenSupplyType.Infinite)
  .setTreasuryAccountId(treasuryAccountId)
  .setAdminKey(adminKey.publicKey)
  .setSupplyKey(supplyKey.publicKey)
  .freezeWith(client);

// Mint NFT with IPFS metadata CID (100 bytes max in metadata field)
const creditMetadata = {
  name: "Eggologic Carbon Credit #001",
  description: "Verified offset from BSF composting batch B-2026-W09",
  format: "HIP412@2.0.0",
  properties: {
    methodology: "CDM_AMS-III.F_adapted",
    batch_id: "B-2026-W09",
    co2e_tonnes: 1.5,
    mrv_data_cid: "ipfs://QmMRVDataCID",
    verifier_did: "did:hedera:testnet:...",
    vintage_year: 2026
  }
};
// Upload creditMetadata JSON to IPFS → get CID
const metadataCID = "ipfs://bafkrei..."; // 100 bytes max

const mintNftTx = await new TokenMintTransaction()
  .setTokenId(creditTokenId)
  .addMetadata(Buffer.from(metadataCID))
  .freezeWith(client);
```

**When Guardian's mintDocumentBlock triggers**, it handles all of this automatically — including uploading the VP to IPFS and recording the CID in the token's memo field. The manual HTS code above is useful for direct minting outside Guardian's policy flow.

---

## HCS topics create an immutable audit trail for pennies

Create **separate HCS topics** for each event stream, enabling targeted querying and clean audit separation:

```javascript
import { TopicCreateTransaction, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

// Create topics ($0.01 each, one-time)
const deliveryTopicId = await createTopic("Eggologic:Deliveries");
const batchTopicId    = await createTopic("Eggologic:BatchClosures");
const productionTopicId = await createTopic("Eggologic:EggProduction");

// Log a delivery event ($0.0008 per message)
await new TopicMessageSubmitTransaction()
  .setTopicId(deliveryTopicId)
  .setMessage(JSON.stringify({
    v: "1.0",
    event_type: "DELIVERY_RECEIVED",
    delivery_id: "ENT-2026-0301-001",
    supplier_id: "SUP-042",
    kg_brutos: 150.5,
    kg_netos: 138.16,
    puntos_minted: 157.40,
    token_mint_tx: "0.0.12345@1709312400.123456789",
    ts: new Date().toISOString()
  }))
  .execute(client);
```

**Best practices for HCS messages:** Keep under **1,024 bytes** to avoid chunking. Use structured JSON with version fields for forward compatibility. Include cross-references (`delivery_id`, `batch_id`, `token_mint_tx`) for traceability. Set a `submitKey` on topics to prevent unauthorized message injection.

Guardian itself publishes VPs to HCS topics as part of its workflow — the `sendToGuardianBlock` with `dataType: "hedera"` handles this. The topics above are for **additional audit granularity** beyond what Guardian provides natively.

---

## Transaction costs are negligible at Eggologic's scale

| Operation | Unit cost | Monthly volume | Monthly cost |
|---|---|---|---|
| HCS messages (deliveries) | $0.0008 | ~24 | $0.019 |
| HCS messages (daily production) | $0.0008 | ~30 | $0.024 |
| HCS messages (batch closures) | $0.0008 | ~4 | $0.003 |
| HCS messages (misc audit) | $0.0008 | ~42 | $0.034 |
| Fungible token mints (PUNTOS) | $0.001 | ~24 | $0.024 |
| Token transfers (to suppliers) | $0.001 | ~24 | $0.024 |
| NFT mints (environmental credits) | $0.02 | ~2–4 | $0.04–0.08 |
| **Total monthly operations** | | | **~$0.17–$0.21** |

One-time setup costs: **~$2.53** (two token creations at $1 each, 3–4 topic creations at $0.01 each, ~10 supplier token associations at $0.05 each). Even at **10× the projected volume**, monthly costs remain under $3. Hedera's fixed USD-denominated fees (independent of HBAR price) make budgeting predictable.

---

## The architecture bridges Google Sheets to Guardian through Node.js middleware

The data flow for Eggologic is:

```
Field Operators → Google Forms → Google Sheets
                                      ↓
                            Node.js Middleware (Express)
                           /          |           \
                    PostgreSQL    Guardian API    Hedera SDK (direct)
                    (sync state,  (MRV submit,   (HCS audit logs,
                     off-chain    verification,   supplementary
                     cache)       token mint)     token operations)
                                      ↓
                              Hedera Network
                         (HTS tokens + HCS topics + IPFS VPs)
```

### Google Sheets integration pattern

```javascript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import cron from 'node-cron';

const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);

async function pollDeliveries() {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Entregas'];
  const rows = await sheet.getRows();

  // Get last processed row from PostgreSQL
  const lastProcessed = await db.query(
    'SELECT last_row_count FROM sync_state WHERE sheet = $1', ['Entregas']
  );
  const newRows = rows.slice(lastProcessed.rows[0]?.last_row_count || 0);

  for (const row of newRows) {
    const deliveryData = {
      delivery_id: row.get('delivery_id'),
      supplier_id: row.get('supplier_id'),
      kg_brutos: parseFloat(row.get('kg_brutos')),
      pct_impropios: parseFloat(row.get('pct_impropios')),
      kg_netos: parseFloat(row.get('kg_netos')),
      fecha: row.get('fecha'),
      quality_grade: row.get('quality_grade'),
      factor_calidad: parseFloat(row.get('factor_calidad')),
      factor_alianza: parseFloat(row.get('factor_alianza'))
    };

    // Submit to Guardian
    await submitDeliveryToGuardian(guardianToken, deliveryData);

    // Log to HCS audit topic
    await logAuditEvent(deliveryTopicId, {
      event_type: 'DELIVERY_RECEIVED', ...deliveryData
    });
  }

  // Update sync state
  await db.query(
    'UPDATE sync_state SET last_row_count = $1 WHERE sheet = $2',
    [rows.length, 'Entregas']
  );
}

// Poll every 5 minutes
cron.schedule('*/5 * * * *', pollDeliveries);
```

**Start with polling** (simplest). Migrate to a **Google Apps Script `onFormSubmit` webhook** for near-real-time when needed — the Apps Script trigger sends an HTTP POST to your middleware endpoint whenever a form is submitted.

### Recommended tech stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **React/Next.js** | Hedera provides an official CRA dApp template with HashPack + Blade wallet integration |
| Wallet | **HashPack** or **Blade** | For supplier token viewing and transfers |
| Backend | **Node.js + Express** | Guardian API client, Google Sheets reader, job orchestration |
| Database | **PostgreSQL** | Off-chain sync state, audit cache, supplier profiles |
| Job Queue | **BullMQ (Redis)** | Async processing of Sheets data, retry logic for Guardian submissions |
| Guardian | **Docker self-hosted** or **Managed Guardian Service** (SaaS via guardianservice.app) |
| Hedera SDK | **@hashgraph/sdk** | Direct HCS/HTS operations supplementing Guardian |
| IPFS | **Web3.Storage** or **Filebase** | Managed by Guardian for VP storage |

### Guardian deployment options

Guardian runs as a **Docker-based microservices platform** (API Gateway, Guardian Service, Auth Service, Worker Service, MongoDB, NATS, Redis). Three deployment paths exist:

- **Docker Compose (development):** `git clone https://github.com/hashgraph/guardian && docker compose up -d`. Configure `OPERATOR_ID`, `OPERATOR_KEY`, `HEDERA_NET=testnet` in `.env`.
- **Cloud/Kubernetes (production):** Use TYMLEZ's open-source Terraform modules (`github.com/Tymlez/guardian-terraform`) for AWS/GCP.
- **Managed Guardian Service (fastest start):** SaaS at `guardianservice.app` by Envision Blockchain — handles infrastructure, upgrades, monitoring. Available on Azure Marketplace.

---

## CDM AMS-III.F composting methodology is the primary template to adapt

Guardian's open-source **Methodology Library** (50+ pre-built policies at `github.com/hashgraph/guardian/tree/main/Methodology Library`) includes several directly relevant to Eggologic:

**CDM AMS-III.F: "Avoidance of Methane Emissions Through Composting"** is the most directly applicable methodology. It covers controlled aerobic treatment of organic waste via composting, applies to municipal solid waste and biomass waste from agricultural/agro-industrial activities including manure, uses CDM Tool 04 (emissions from solid waste disposal), Tool 05 (electricity emissions), and Tool 13 (project and leakage emissions from composting), and mints CER credits at 1 CER = 1 tonne CO2e.

The recommended approach is to **import the AMS-III.F `.policy` file**, study its block structure and calculation logic, then create a custom Eggologic policy that extends the composting MRV with BSF larvae conversion tracking, adds the supplier incentive point calculation layer, includes egg production recording as co-benefit documentation, and uses Tool 13's composting emission calculations as the basis for carbon credit quantification.

Other useful reference policies include **Verra VM0044** (biochar/waste biomass management), **MCER01** (circular economy methodology for recycling), **IWCSH** (improved waste collection and handling), and **SSFLWGRP001** (food loss and waste GHG reduction).

---

## Real-world Guardian implementations validate the architecture

**DOVU** (`dovu.earth`) is the most relevant precedent. They built a full-stack ReFi platform for agricultural carbon credits on Hedera using Guardian. Their architecture — external data sources (Typeform, farm data) → middleware ("Nova") → Guardian policy → token minting — directly mirrors what Eggologic needs. DOVU's open-source policy files at `github.com/dovuofficial/guardian-policies` provide concrete implementation examples. They're powering audit infrastructure for a **$1 billion regenerative farming initiative** in the US.

**TYMLEZ** was the first company to launch a Guardian-based project on Hedera Mainnet (July 2022), working with the Queensland Government for verified emissions reporting. Their open-source Terraform modules (`github.com/Tymlez/guardian-terraform`) and Guardian policy files (`github.com/Tymlez/guardian-policies`) are production-grade references. Their architecture pattern — IoT/sensors → data ingestion → validation → Guardian MRV → token mint — maps to Eggologic's eventual IoT integration path.

**EcoGuard** (by The Hashgraph Group + PwC) covers enterprise ESG reporting including circular economy initiatives, product lifecycle tracking, and waste reduction — validating the circular economy use case on Guardian.

---

## Phased implementation roadmap

**Phase 1 (Weeks 1–3): Foundation.** Deploy Guardian on testnet (Docker or MGS SaaS). Design EntregaSchema and SupplierRegistrationSchema in Guardian's visual policy builder. Build the Node.js middleware with Google Sheets polling. Test the full pipeline using Guardian's dry-run API (`PUT /api/v1/policies/{id}/dry-run`), which simulates the entire workflow without touching Hedera.

**Phase 2 (Weeks 4–6): Integration.** Implement the complete pipeline — Sheets → middleware → Guardian → PUNTOS token minting. Add BatchSchema and ProduccionSchema. Build the React dashboard with HashPack wallet integration for suppliers to view their PUNTOS balance. Set up PostgreSQL for sync state and off-chain audit caching.

**Phase 3 (Weeks 7–9): Environmental credits.** Import and adapt the CDM AMS-III.F policy for composting credits. Implement the CarbonCreditSchema and NFT minting flow. Add the verifier approval workflow. Conduct end-to-end testing of the waste-to-credit pipeline.

**Phase 4 (Weeks 10+): Production.** Migrate to mainnet. Implement Apps Script webhooks for near-real-time data flow. Deploy Guardian to cloud via Terraform if self-hosted. Explore IoT sensors (scales, temperature probes) feeding directly into Guardian's `externalDataBlock` for automated dMRV.

## Conclusion

Eggologic's circular economy model maps cleanly onto Guardian's policy architecture, with each stage (delivery → batch → production → credit) becoming a distinct schema and workflow step connected by `setRelationshipsBlock` links. The **critical architectural insight** is that Guardian handles the hard parts — VC creation, cryptographic signing, IPFS storage, HCS provenance chains, and HTS token minting — while the Node.js middleware only needs to transform Google Sheets rows into JSON and POST them to a single REST endpoint. At **$0.20/month in transaction fees**, the blockchain layer adds near-zero marginal cost. The existence of CDM AMS-III.F as a ready-made composting methodology means Eggologic doesn't need to invent its own carbon quantification framework — it adapts a recognized standard, which significantly strengthens the credibility of any environmental credits issued. Starting with Guardian's dry-run mode on testnet means the entire policy can be validated end-to-end before a single transaction touches mainnet.