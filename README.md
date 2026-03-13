<p align="center">
  <img src="docs/images/eggologic-banner.png" alt="Eggologic" width="600"/>
</p>

<h1 align="center">🥚 Eggologic — Tokenizing the Circular Economy</h1>

<p align="center">
  <strong>Organic Waste → Black Soldier Fly Larvae → Eggs → Compost → Verified Carbon Credits</strong>
</p>

<p align="center">
  <a href="#track">🌱 Hedera Apex Hackathon 2026 — Sustainability Track</a> ·
  <a href="#demo">🎬 Demo Video</a> ·
  <a href="#architecture">🏗️ Architecture</a> ·
  <a href="#quickstart">🚀 Quick Start</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Hedera-Testnet-blueviolet" alt="Hedera Testnet"/>
  <img src="https://img.shields.io/badge/Guardian-MRV%20Policy-green" alt="Guardian MRV"/>
  <img src="https://img.shields.io/badge/HTS-EGGOCOINS%20%2B%20CARBONCOIN-orange" alt="HTS Tokens"/>
  <img src="https://img.shields.io/badge/Cost-$0.20%2Fmonth-brightgreen" alt="Cost"/>
  <img src="https://img.shields.io/badge/Location-Uruguay%20🇺🇾-blue" alt="Uruguay"/>
</p>

---

## The Problem

Every year, **1.3 billion tonnes** of food are wasted globally. In Latin America, most organic waste from restaurants ends up in landfills, producing methane — a greenhouse gas **80× more potent** than CO₂ over 20 years. Restaurants lack incentives to separate their waste properly, and no transparent system exists to verify that organic waste was actually diverted from landfills and converted into productive outputs.

## The Solution

**Eggologic** is an operating circular economy hub in Uruguay that transforms restaurant organic waste into Black Soldier Fly (BSF) larvae protein, which feeds laying hens that produce eggs, while the remaining organic matter becomes compost. This is a **real, running operation** — not a concept.

We built a blockchain verification layer on **Hedera** that:

1. **Rewards suppliers** with **EGGOCOINS** (HTS fungible tokens) for every kilogram of clean organic waste delivered — incentivizing quality and frequency
2. **Tracks the full cycle** from waste reception through BSF processing, egg production, and compost output using **Guardian MRV policies** and **Verifiable Credentials**
3. **Issues CARBONCOIN NFTs** (1 NFT = 1 tCO₂e avoided) when accumulated verified waste reaches the CDM AMS-III.F methodology threshold, creating **auditable carbon credits**
4. **Records everything** on immutable **HCS audit topics** — any auditor can verify the entire chain of evidence for pennies

<p align="center">
  <img src="docs/images/flow-diagram.png" alt="Eggologic Flow" width="700"/>
</p>

---

<a id="track"></a>
## 🏆 Hackathon Track & Bounty

| | Details |
|---|---|
| **Main Track** | 🌱 **Sustainability** — Guardian-powered MRV for climate and circular economy |
| **Bounty** | ⚡ **Hiero** — Native use of HTS + HCS via Hiero SDKs |
| **Hackathon** | Hedera Hello Future: Apex 2026 |

### Why This Matters

- **First-ever** waste-to-BSF-to-eggs circular economy tokenized on Hedera Guardian
- **Real operation** running in Melo, Uruguay — not a whiteboard concept
- **$0.20/month** total blockchain cost at current scale (24 deliveries, 4 batch closures, ~2 NFT mints)
- **CDM AMS-III.F** — internationally recognized composting methodology, not a custom formula
- **70% conservative factor** on carbon credits — deliberately under-counting for credibility

---

<a id="demo"></a>
## 🎬 Demo

> **[▶️ Watch the Demo Video](https://youtu.be/PLACEHOLDER)**

The demo shows the complete pipeline:
1. A supplier delivers organic waste → data enters via Google Form (or simulated via script)
2. Middleware picks up the new row and submits it to Guardian
3. Guardian creates a Verifiable Credential, calculates EGGOCOINS, and mints tokens
4. The supplier sees their updated EGGOCOINS balance in the dashboard
5. After accumulating 1,000 kg adjusted waste, a CARBONCOIN NFT is minted

**Demo Mode**: If Google Sheets or Guardian credentials are missing, the middleware can run in "Demo Mode" (bypassing external integrations) to allow testing the dashboard and basic API flows.

---

<a id="architecture"></a>
## 🏗️ Architecture

```
  Suppliers              Field Operators           Auditors / Buyers
     │                        │                          │
     │                   Google Forms                    │
     │                        │                          │
     │                   Google Sheets                   │
     │                        │                          │
     │               ┌────────▼────────┐                 │
     │               │  Node.js        │                 │
     │               │  Middleware      │                 │
     │               │  (Express)      │                 │
     │               └──┬──────┬───┬───┘                 │
     │                  │      │   │                     │
     │          ┌───────▼┐  ┌──▼───▼──┐                  │
     │          │Guardian │  │ Hedera  │                  │
     │          │  API    │  │  SDK    │                  │
     │          │(Policy  │  │(Direct  │                  │
     │          │ Engine) │  │HCS/HTS) │                  │
     │          └───┬─────┘  └────┬────┘                  │
     │              │             │                       │
     │         ┌────▼─────────────▼────┐                  │
     │         │    Hedera Network     │◄─────────────────┘
     │         │  ┌─────────────────┐  │
     │         │  │ HTS: EGGOCOINS  │  │   Fungible token
     │         │  │ HTS: CARBONCOIN │  │   NFT (1 = 1 tCO₂e)
     │         │  │ HCS: Audit Logs │  │   Immutable trail
     │         │  │ IPFS: VPs       │  │   Verifiable Presentations
     │         │  └─────────────────┘  │
     │         └───────────────────────┘
     │                    │
     │            ┌───────▼───────┐
     └────────────┤  React        │
                  │  Dashboard    │
                  │ (Operator UI) │
                  └───────────────┘
```

### Hedera Services Used

| Service | Purpose | Token/Topic |
|---|---|---|
| **HTS** (Fungible) | Supplier incentive rewards | `EGGOCOINS` — 2 decimals, infinite supply, mint-on-delivery |
| **HTS** (NFT) | Verified carbon credits | `CARBONCOIN` — 1 NFT = 1 tCO₂e, HIP-412 metadata on IPFS |
| **HCS** | Immutable audit trail | 3 topics: Deliveries, Batches, Production |
| **Guardian** | MRV policy engine | Verifiable Credentials, calculations, trustchain |

### Token Economics

**EGGOCOINS** are minted per delivery:
```
EGGOCOINS = kg_netos × factor_calidad × factor_alianza

where:
  kg_netos = kg_brutos × (1 - pct_impropios / 100)
  factor_calidad = 1.2 (≤5% contaminants) | 1.0 (5-15%) | 0.8 (15-30%) | 0.5 (>30%)
  factor_alianza = 1.1 (≥4 deliveries/month) | 1.0 (otherwise)
```

**CARBONCOIN** NFTs are minted when:
```
Σ (kg_ingreso × 0.70) ≥ 1,000 kg  →  mint 1 CARBONCOIN (= 1 tCO₂e avoided)
```
The 70% factor conservatively accounts for moisture content, DOC variability, and local landfill correction factors per CDM AMS-III.F methodology.

---

## 📊 Guardian Policy & Schemas

The Guardian policy follows a 5-step pipeline, each with its own schema:

| Step | Schema | Type | Guardian Block |
|---|---|---|---|
| 1. Supplier Registration | `RegistroProveedorSchema` | VC | `requestVcDocumentBlock` |
| 2. Waste Delivery (MRV) | `EntregaSchema` | MRV | `requestVcDocumentBlock` → `calculateMathAddOnBlock` → `mintDocumentBlock` |
| 3. Batch Processing | `LoteBatchSchema` | VC | `aggregateDocumentBlock` → `setRelationshipsBlock` |
| 4. Production Record | `ProduccionSchema` | MRV | `requestVcDocumentBlock` → `setRelationshipsBlock` |
| 5. Carbon Credit | `CreditoAmbientalSchema` | VC | `aggregateDocumentBlock` → `calculateContainerBlock` → `mintDocumentBlock` |

All schemas are available in [`/guardian/schemas/`](./guardian/schemas/) ready to import.

The policy routes deliveries with >20% contaminants to a rejection flow via `switchBlock`, and links deliveries → batches → production → credits using `setRelationshipsBlock` for full traceability.

---

## 💰 Cost Analysis

| Operation | Unit Cost | Monthly Vol. | Monthly Cost |
|---|---|---|---|
| HCS messages (deliveries + production + batches + audit) | $0.0008 | ~100 | $0.08 |
| EGGOCOINS minting | $0.001 | ~24 | $0.024 |
| EGGOCOINS transfers | $0.001 | ~24 | $0.024 |
| CARBONCOIN NFT minting | $0.02 | ~2-4 | $0.04-0.08 |
| **Total** | | | **~$0.17-$0.21** |

Initial setup: **~$2.53** (token creation + topic creation + supplier associations).

Even at **10× current volume**, monthly costs stay under $3. Hedera's fixed USD-denominated fees make this completely predictable.

---

<a id="quickstart"></a>
## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for Guardian)
- A Hedera Testnet account ([portal.hedera.com](https://portal.hedera.com))
- Google Cloud service account with Sheets API access

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/eggologic-hedera.git
cd eggologic-hedera
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Hedera testnet credentials:
#   HEDERA_OPERATOR_ID=0.0.xxxxx
#   HEDERA_OPERATOR_KEY=302e...
#   HEDERA_NETWORK=testnet
#   GUARDIAN_URL=http://localhost:3000
#   GOOGLE_SPREADSHEET_ID=your_sheet_id
#   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_sa@project.iam.gserviceaccount.com
```

### 3. Setup Hedera Testnet Tokens & Topics

```bash
# Creates EGGOCOINS token, CARBONCOIN NFT collection, and 3 HCS topics
node scripts/setup-testnet.js
```

### 4. Start Guardian (Docker)

```bash
cd guardian
docker compose up -d
# Import the Eggologic policy via Guardian UI or API
```

### 5. Run the Middleware

```bash
cd middleware
npm run dev
# Polls Google Sheets every 5 minutes and submits to Guardian
```

### 6. Launch Dashboard

```bash
cd dashboard
npm run dev
# Opens at http://localhost:5173
```

### 7. Run Demo Flow

```bash
# Seeds sample data and executes the complete pipeline
node scripts/demo-flow.js
```

---

## 🧪 Testing

```bash
# Run Guardian dry-run mode (no Hedera transactions)
node scripts/setup-testnet.js --dry-run

# Unit tests
cd middleware && npm test

# Integration test: full pipeline on testnet
node scripts/demo-flow.js --testnet
```

---

## 📁 Project Structure

```
eggologic-hedera/
├── guardian/          # Guardian schemas & policy files
│   ├── schemas/       # 6 JSON schemas ready to import
│   └── policies/      # Exportable .policy file
├── middleware/         # Node.js bridge: Sheets → Guardian → Hedera
│   ├── src/services/  # sheets, guardian, hedera, points services
│   └── src/jobs/      # Cron jobs for polling & processing
├── dashboard/         # React + HashPack wallet UI
├── scripts/           # Setup, seeding, and demo scripts
├── docs/              # Architecture, methodology, token design
└── pitch/             # Video script and presentation materials
```

---

## 🔗 Hedera Testnet References

| Asset | ID | Explorer |
|---|---|---|
| EGGOCOINS Token | `0.0.XXXXXX` | [HashScan](https://hashscan.io/testnet/token/0.0.XXXXXX) |
| CARBONCOIN NFT | `0.0.XXXXXX` | [HashScan](https://hashscan.io/testnet/token/0.0.XXXXXX) |
| Deliveries Topic | `0.0.XXXXXX` | [HashScan](https://hashscan.io/testnet/topic/0.0.XXXXXX) |
| Batches Topic | `0.0.XXXXXX` | [HashScan](https://hashscan.io/testnet/topic/0.0.XXXXXX) |
| Production Topic | `0.0.XXXXXX` | [HashScan](https://hashscan.io/testnet/topic/0.0.XXXXXX) |

---

## 🌍 Real-World Impact

Eggologic currently operates in **Melo, Cerro Largo, Uruguay**, processing **300-600 kg of organic waste per week** from local restaurants. The circular economy cycle produces:

- **BSF larvae** → protein feed for laying hens (70% of waste input)
- **35-45 eggs per week** → sold locally and used as supplier rewards
- **~70 kg compost per week** → returned to local agriculture (30% of waste input)
- **~1 CARBONCOIN every 3-6 weeks** → verified carbon credit (1 tCO₂e avoided)

This is not a simulation. Every data point in this project maps to a physical operation happening today.

---

## 🛠️ Built With

- **[Hedera Token Service (HTS)](https://hedera.com/token-service)** — EGGOCOINS + CARBONCOIN
- **[Hedera Consensus Service (HCS)](https://hedera.com/consensus-service)** — Immutable audit trail
- **[Hedera Guardian](https://github.com/hashgraph/guardian)** — MRV policy engine + Verifiable Credentials
- **[CDM AMS-III.F](https://cdm.unfccc.int/methodologies/DB/GNFWB3Y818MFBDH1SVXBLI8TQGGPK2)** — UN composting methodology
- **[@hashgraph/sdk](https://www.npmjs.com/package/@hashgraph/sdk)** — Hedera JavaScript SDK (Hiero)
- **Node.js + Express** — Middleware ligero en memoria
- **React + Tailwind** — Dashboard Operator View
- **Google Sheets API** — Data source bridge

---

## 👥 Team

| Name | Role | Links |
|---|---|---|
| [Your Name] | Founder & Developer | [GitHub](https://github.com/) · [LinkedIn](https://linkedin.com/) |

---

## 📄 References

- [CDM AMS-III.F Methodology](https://cdm.unfccc.int/methodologies/DB/GNFWB3Y818MFBDH1SVXBLI8TQGGPK2) — Avoidance of methane emissions through composting
- [Guardian Methodology Library](https://github.com/hashgraph/guardian/tree/main/Methodology%20Library) — 50+ pre-built policies
- [DOVU Guardian Policies](https://github.com/dovuofficial/guardian-policies) — Agricultural carbon credit reference
- [HIP-412](https://hips.hedera.com/hip/hip-412) — NFT metadata standard used for CARBONCOIN

---

## 📜 License

This project is licensed under the MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  <strong>🥚 Turning waste into protein, eggs, compost, and verified carbon credits — one delivery at a time.</strong>
</p>
