<p align="center">
  <img src="docs/images/eggologic-logo.svg" alt="Eggologic Logo" width="120"/>
</p>

<h1 align="center">EGGOLOGIC</h1>

<p align="center">
  <strong>Tokenized Circular Economy on Hedera Guardian — From Restaurant Waste to Verified Impact</strong>
</p>

<p align="center">
  <a href="#demo">Demo</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#guardian-policy">Guardian Policy</a> ·
  <a href="#hedera-integration">Hedera Integration</a> ·
  <a href="#tokens">Tokens</a> ·
  <a href="#setup">Setup</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Track-Sustainability-4ADE80?style=flat-square" alt="Sustainability"/>
  <img src="https://img.shields.io/badge/Bounty-Hiero-38BDF8?style=flat-square" alt="Hiero"/>
  <img src="https://img.shields.io/badge/Network-Testnet-8B5CF6?style=flat-square" alt="Testnet"/>
  <img src="https://img.shields.io/badge/Cost-$0.20/month-FBBF24?style=flat-square" alt="Cost"/>
  <img src="https://img.shields.io/badge/Status-Running_in_Uruguay-4ADE80?style=flat-square" alt="Running"/>
</p>

---

## What is Eggologic?

Eggologic is a **real, operating circular economy hub** in Maldonado, Uruguay that transforms restaurant organic waste into protein (via Black Soldier Fly larvae), eggs, compost, and regenerative chicken meat — while generating **verified environmental impact credits on Hedera**.

We built a full-stack blockchain verification layer using **Hedera Guardian**, **HTS**, and **HCS** that:

1. **Rewards suppliers** with **EGGOCOINS** (HTS fungible tokens) for every validated kilogram of clean organic waste delivered
2. **Tracks the full cycle** from waste reception through BSF processing, production output, and impact calculation using a **custom Guardian MRV policy** with **Verifiable Credentials**
3. **Issues CIN NFTs** (Circular Impact NFTs) — verified proof of environmental impact, minted only after independent **VVB (Verification Body) approval**
4. **Records everything** on immutable **HCS audit topics** — any auditor can verify the entire chain of evidence

<p align="center">
  <img src="docs/images/flow-diagram.png" alt="Eggologic Flow" width="700"/>
</p>

> **This is not a simulation.** Every data point maps to a physical operation running today in Uruguay. Restaurants deliver waste weekly, operators process it, and the blockchain layer records it all.

---

<a id="track"></a>

## Hackathon Track & Bounty

| | Details |
|---|---|
| **Main Track** | **Sustainability** — Guardian-powered MRV for circular economy |
| **Bounty** | **Hiero** — Native use of HTS + HCS via Hiero JavaScript SDK |
| **Hackathon** | Hedera Hello Future: Apex 2026 |

### Why This Matters

- **First-ever** waste-to-BSF-to-eggs circular economy verified on Hedera Guardian
- **Real operation** running in Maldonado, Uruguay — not a whiteboard concept
- **Custom Guardian policy** (EWD-RB v0.3) with **9 schemas and 4 roles** including independent VVB verification
- **$0.20/month** total blockchain cost at current scale — proving sustainability is affordable
- **Aligned with Uruguay's Ley 19.829** (Integrated Waste Management) and **DINAMA** environmental regulations
- **Phase 2 roadmap** includes CDM AMS-III.F integration for internationally recognized carbon credits

---

<a id="demo"></a>

## Demo

> **[Watch the Demo Video](https://youtu.be/PLACEHOLDER)** (required for submission — max 5 min)

The demo shows the complete working pipeline:

1. A restaurant registers as a supplier **directly from the Dashboard** (register page) or is onboarded by an admin (admin-proponent page)
2. The Registry (Guardian role) approves the supplier registration
3. Organic waste is delivered — the operator **submits the delivery directly from the Dashboard** (index.html), entering weight, contamination %, waste type, and evidence URL — the form calculates net weight and estimated EGGOCOINS in real time
4. The Dashboard **posts the delivery as a Verifiable Credential directly to Guardian** via authenticated API calls (`api.js → submitDelivery()`)
5. Guardian's policy engine **auto-mints EGGOCOINS on HTS** — the supplier sees their updated balance via Hedera Mirror Node queries
6. An **HCS audit message** is published to the immutable delivery topic
7. Impact accumulates toward **CIN NFT** issuance upon VVB verification

> **Live Dashboard:** [https://c4p5.github.io/EggoLogic-Hedera-Hackathon/](https://c4p5.github.io/EggoLogic-Hedera-Hackathon/)

---

<a id="architecture"></a>

## Architecture

```
  Physical Layer                     Frontend (Semi-Static Dashboard)
  ─────────────                      ────────────────────────────────
  Restaurants                        ┌──────────────────────────────┐
  → Organic waste                    │  Dashboard (GitHub Pages)     │
  → BSF Processing                   │  Vanilla JS + Tailwind CSS    │
  → Eggs + Compost + Meat            │  No React · No Vite · No Build│
                                     │                                │
                                     │  7 HTML Pages:                 │
                                     │  ├─ index.html (main + form)   │
                                     │  ├─ marketplace.html            │
                                     │  ├─ wallet.html                 │
                                     │  ├─ impact.html                 │
                                     │  ├─ register.html               │
                                     │  ├─ admin-proponent.html        │
                                     │  └─ restaurant-view.html        │
                                     │                                │
                                     │  5 JS Modules:                 │
                                     │  ├─ api.js (Guardian auth+API)  │
                                     │  ├─ hedera.js (Mirror Node)     │
                                     │  ├─ config.js (endpoints+IDs)   │
                                     │  ├─ ui.js (login, toast, nav)   │
                                     │  └─ [page].js (page logic)      │
                                     └─────┬──────────────┬───────────┘
                                           │              │
                           ┌───────────────▼──┐    ┌──────▼─────────────┐
                           │ Guardian API (MGS) │    │ Hedera Mirror Node  │
                           │ Policy: EWD-RB v0.3│    │ (Public, No Auth)   │
                           │                    │    │                     │
                           │ Auth: email/pass    │    │ Token balances      │
                           │ Submit deliveries   │    │ TX history          │
                           │ Read block data     │    │ NFT holdings        │
                           │                    │    │ Supply info          │
                           │ 9 Schemas:         │    └─────────────────────┘
                           │ ├─ Supplier Reg.   │
                           │ ├─ Waste Delivery   │
                           │ ├─ EGGO Reward      │
                           │ ├─ Waste Batch      │
                           │ ├─ BSF Processing   │
                           │ ├─ Production Output│
                           │ ├─ Impact Calc      │
                           │ ├─ Points Record    │
                           │ └─ Carbon Credit    │
                           │                    │
                           │ 4 Roles:           │
                           │ Registry · PP      │
                           │ Operator · VVB     │
                           └────────┬───────────┘
                                    │
                             ┌──────▼──────────┐
                             │  Hedera Testnet   │
                             │                   │
                             │  HTS:             │
                             │  ├─ EGGOCOINS     │
                             │  └─ CIN NFT       │
                             │                   │
                             │  HCS:             │
                             │  └─ 3 Audit Topics│
                             │                   │
                             │  IPFS:            │
                             │  └─ VC + NFT meta │
                             └───────────────────┘

  Background Services (Optional)
  ──────────────────────────────
  ┌──────────────────────────────┐
  │  Node.js Backend (Port 4000)  │
  │  Express + Hiero SDK          │
  │                                │
  │  Supplier Custody:             │
  │  ├─ /api/suppliers/register    │
  │  ├─ /api/suppliers/approve     │
  │  └─ /api/suppliers/dashboard   │
  │                                │
  │  Cron Jobs:                    │
  │  ├─ poll-deliveries (5 min)    │
  │  ├─ sync-suppliers (10 min)    │
  │  └─ carbon-accumulator (1 hr)  │
  │                                │
  │  Services:                     │
  │  ├─ hedera.service (HTS+HCS)   │
  │  ├─ custody.service (wallets)   │
  │  ├─ sheets.service (legacy)     │
  │  ├─ ai.service (Gemini)         │
  │  └─ telegram.service            │
  └──────────────────────────────┘
```

### Data Flow — Primary Pipeline (Dashboard → Guardian)

```
Restaurant delivers waste
        ↓
Operator opens Dashboard (index.html) → logs in via Guardian email/password
        ↓
Fills delivery form: waste type, gross kg, contamination kg, evidence URL
        ↓
Real-time preview: net kg, quality grade, estimated EGGOCOINS
        ↓
api.js → submitDelivery() → POST to Guardian /policies/{id}/blocks/{PP_DELIVERY_FORM}
        ↓
Guardian Policy → Creates Verifiable Credential → Auto-mints EGGOCOINS via mintDocumentBlock
        ↓
hedera.js (Mirror Node) → Dashboard refreshes balance, TX history, impact metrics
```

### Data Flow — Background Pipeline (Node.js Backend)

```
Backend cron jobs (optional, for advanced operations):
        ↓
poll-deliveries.js (every 5 min) → polls Google Sheets for legacy entries
        ↓
hedera.service.js → transferEggocoins(supplier, 30%) for walletless suppliers
        ↓
custody.service.js → addBalance() (custodial wallet accounting)
        ↓
hedera.service.js → publishAuditLog(HCS_TOPIC_DELIVERIES)
```

### Why a Semi-Static Dashboard?

We intentionally built the Dashboard as **static HTML pages with embedded JavaScript** because:
- **Direct Guardian connection** — the browser authenticates and submits VCs directly, no middleware bottleneck
- **Zero build step** — no React, no Vite, no Webpack — just HTML/JS/CSS deployed to GitHub Pages
- **Offline-friendly** — pages load instantly with cached Guardian data (`guardian-cache.json`) as fallback
- **Dynamic where it matters** — JavaScript modules (`api.js`, `hedera.js`, `dashboard.js`) handle authentication, form submission, and real-time data queries
- **Re-authentication on revisit** — static content loads fast, auth state refreshes from localStorage
- **Guardian is the source of truth** — VCs and HCS logs are the immutable record, the dashboard is just the window

---

<a id="hedera-integration"></a>

## Hedera Integration (Hiero SDK)

We use **four Hedera services** via the **Hiero JavaScript SDK** (`@hashgraph/sdk`):

### HTS — Hedera Token Service

| Token | Type | Purpose | Mint Trigger |
|---|---|---|---|
| **EGGOCOINS** | Fungible (HTS) | Supplier incentive rewards | Auto-minted by Guardian on valid delivery VC |
| **CIN** | Non-Fungible (HTS) | Verified environmental impact credits | Minted after VVB approval + carbon threshold |

**SDK Usage (`hedera.service.js`):**
- `TokenMintTransaction` — Mint EGGOCOINS to treasury
- `TransferTransaction` — Transfer 30% to supplier wallet
- `AccountBalanceQuery` — Query on-chain balances

### HCS — Hedera Consensus Service

| Topic | Purpose | Message Format |
|---|---|---|
| **Deliveries** | Immutable log of every waste delivery | `{delivery_id, supplier_id, kg, eggocoins, timestamp}` |
| **Batches** | BSF batch processing records | `{batch_id, kg_input, conversion_ratio}` |
| **Production** | Egg/compost production output | `{batch_id, eggs, compost_kg}` |

**SDK Usage:**
- `TopicMessageSubmitTransaction` — Publish audit events (JSON stringified)

### Guardian — MRV Policy Engine (Direct from Dashboard)

The Dashboard authenticates and interacts with Guardian **directly from the browser** via `dashboard/js/api.js`:

| Function | API Endpoint | Purpose |
|---|---|---|
| `login()` | `POST /accounts/loginByEmail` | Guardian email/password auth → refresh token |
| `_getAccessToken()` | `POST /accounts/access-token` | Exchange refresh → access token (28-min TTL) |
| `submitDelivery()` | `POST /policies/{id}/blocks/{PP_DELIVERY_FORM}` | Submit waste delivery as VC |
| `getBlockData()` | `GET /policies/{id}/blocks/{blockId}` | Read policy block data (deliveries, metrics) |
| `get()` / `post()` | Authenticated wrapper | Auto-refresh token, retry on 401 |

**Offline Fallback:** If Guardian API is unreachable (CORS, network), the Dashboard falls back to `data/guardian-cache.json` — pre-fetched policy data that allows read-only browsing.

**Backend Guardian usage** (`middleware/src/services/guardian.service.js`) handles additional operations:

| Function | API Endpoint | Purpose |
|---|---|---|
| `guardianLogin()` | `POST /accounts/loginByEmail` | Backend auth for cron jobs |
| `submitDelivery()` | `POST /policies/{id}/tag/{block}/blocks` | Submit legacy Sheet entries as VCs |
| `getSuppliers()` | `POST /policies/{id}/search-documents` | Fetch Proveedor VCs for sync |

### Mirror Node — Dashboard's Direct Data Source

The Dashboard queries Hedera Mirror Node **directly from the browser** (no backend needed) via `dashboard/js/hedera.js`:

| Function | Endpoint | Purpose |
|---|---|---|
| `getEggocoinBalance()` | `GET /api/v1/tokens/{id}/balances?account.id={id}` | User's EGGOCOINS balance |
| `getEggocoinSupply()` | `GET /api/v1/tokens/{id}` | Total supply, name, symbol, decimals |
| `getTransactions()` | `GET /api/v1/transactions?account.id={id}&type=CRYPTOTRANSFER` | Recent token transfers |
| `getNFTs()` | `GET /api/v1/tokens/{nft_id}/nfts?account.id={id}` | CIN NFT holdings |
| `getAllBalances()` | `GET /api/v1/tokens/{id}/balances` | All EGGOCOINS holders |
| `getMintEvents()` | `GET /api/v1/transactions?account.id={treasury}` | Treasury mint events |

---

<a id="guardian-policy"></a>

## Guardian Policy: EWD-RB v0.3

We built a **custom Guardian policy** specifically designed for circular economy MRV. The policy has **9 schemas** covering the full operational cycle with independent verification:

| Step | Schema | Purpose | Guardian Block |
|---|---|---|---|
| 1 | **Supplier Registration** | Onboard partner restaurants | `requestVcDocumentBlock` |
| 2 | **Waste Delivery** | Record weight + contamination % (core MRV) | `requestVcDocumentBlock` → `mintDocumentBlock` (EGGOCOINS) |
| 3 | **EGGO Reward Record** | Log token calculation and distribution | `requestVcDocumentBlock` |
| 4 | **Waste Batch** | Track BSF processing batches | `requestVcDocumentBlock` |
| 5 | **BSF Processing** | Black Soldier Fly bioconversion record | `requestVcDocumentBlock` |
| 6 | **Production Output** | Log eggs, compost, larvae yield | `requestVcDocumentBlock` |
| 7 | **Impact Calculation** | Compute environmental benefit (tCO2e) | `requestVcDocumentBlock` → `mintDocumentBlock` (CIN) |
| 8 | **Points Record** | Detailed calculation audit trail | `requestVcDocumentBlock` |
| 9 | **Carbon Credit** | Environmental credit issuance record | `requestVcDocumentBlock` |

### 4 Roles

| Role | Hedera Account | Responsibility |
|---|---|---|
| **Registry** | `0.0.8292724` | Approves suppliers, oversees policy execution |
| **Project Proponent** | `0.0.8294621` | Restaurants submitting waste — the beneficiaries |
| **Operator** | `0.0.8294659` | Processes BSF batches, logs deliveries and production output |
| **VVB** | `0.0.8294709` | Independent Verification Body — reviews impact claims before CIN mint |

### Why a Custom Policy?

1. **Unique requirements** — BSF bioconversion + multi-output production + supplier incentives — no existing methodology covers this
2. **Deep learning** — Building from scratch taught us Guardian's policy engine thoroughly
3. **Phase 2** will integrate **CDM AMS-III.F** (composting methodology) on top of this working custom policy, enabling internationally recognized carbon credits

All schema definitions are in [`/guardian/schemas/`](./guardian/schemas/).

---

<a id="tokens"></a>

## Token Economics

### EGGOCOINS — Supplier Incentive Token

```
Type:           Fungible (HTS)
Symbol:         EGGO
Decimals:       2
Supply:         Infinite (mint-on-delivery)
Token ID:       0.0.8287358
Treasury:       0.0.7166777
Cost per Mint:  ~$0.001
```

**Reward Formula (implemented in `middleware/src/services/points.service.js`):**
```
EGGOCOINS = kg_netos x factor_calidad x factor_alianza

where:
  kg_netos       = kg_brutos x (1 - pct_impropios / 100)
  factor_calidad = 1.2 (<=5% contaminants, Grade A)
                 | 1.0 (5-15%, Grade B)
                 | 0.8 (15-30%, Grade C)
                 | 0.5 (>30%, Grade D)
  factor_alianza = 1.1 (>=4 deliveries/month — loyal supplier bonus)
                 | 1.0 (otherwise)
```

**Distribution:** 30% transferred to supplier wallet, 70% retained in treasury for ecosystem operations (marketplace redemptions, BSF processing costs, future DAO treasury).

**Example:** 80 kg brutos, 5% impropios, loyal supplier:
`76 x 1.2 x 1.1 = 100.32 EGGOCOINS` (30.10 to supplier, 70.22 to treasury)

### CIN — Circular Impact NFT

```
Type:           Non-Fungible Unique (HTS)
Full Name:      Circular Impact NFT
Token ID:       0.0.8287362
Metadata:       HIP-412 v2.0.0 -> IPFS
Cost per Mint:  ~$0.02
```

Each CIN NFT represents **verified environmental impact** — waste diverted from landfills, methane emissions avoided, regenerative production enabled. CIN NFTs are minted **only after VVB approval** of the Impact Calculation schema.

**Carbon calculation (conservative):**
```
kg_adjusted = kg_brutos x 0.70 (conservative factor)
Threshold:  1000 kg adjusted -> triggers CIN mint eligibility
```

Companies with a triple-bottom-line vision can hold CIN NFTs as **auditable, on-chain proof** of their support for the circular economy.

---

## The Circular Economy Cycle

```
Restaurant waste (300-600 kg/week from partner restaurants)
    |
    v
BSF Larvae Processing (12-18 days, 15-25% conversion ratio)
    |
    +-- Larvae -> Protein feed for laying hens (70% of waste input)
    |   +-- 1,200+ eggs per week (Phase 2 target)
    |   +-- Regenerative chicken meat ($20/kg local market)
    |
    +-- Compost -> Local agriculture (30% of waste input)
        +-- ~200-300 kg/week premium organic compost
```

Every kilogram processed:
- Generates an **EGGOCOINS reward** for the supplying restaurant
- Creates an immutable **Verifiable Credential** in Guardian
- Is logged as an **HCS audit record** on Hedera
- Accumulates toward **CIN NFT** issuance

---

## Feature Completeness

| Feature | Schema | Dashboard | Guardian | Backend | HCS | HTS | Status |
|---------|--------|-----------|----------|---------|-----|-----|--------|
| Supplier Registration | Done | Done (register + admin) | Done | Done (custody) | — | — | **95%** |
| Waste Delivery (MRV) | Done | **Done (direct submit)** | Done | Legacy poll | Done | Done (mint) | **95%** |
| EGGOCOINS Calculation | Done | Done (live preview) | Done | Done | Done | Done | **100%** |
| EGGOCOINS Transfer | Done | Done (balance via Mirror) | N/A | Done | N/A | Done | **90%** |
| Wallet + TX History | N/A | Done (Mirror Node) | N/A | N/A | N/A | Done (query) | **90%** |
| Impact Metrics | N/A | Done (CO2, chart) | Done | N/A | N/A | N/A | **85%** |
| Marketplace UI | N/A | Done (catalog + stats) | N/A | N/A | N/A | N/A | **60%** |
| Batch Processing | Done | Planned | Planned | Planned | Planned | N/A | **10%** |
| Production Recording | Done | Planned | Planned | Planned | Planned | N/A | **5%** |
| Carbon Accumulation | Done | Progress bar | Planned | In Progress | Planned | Planned | **20%** |
| CIN NFT Minting | Done | Done (NFT viewer) | Planned | Planned | Planned | Config only | **15%** |
| VVB Verification | Done | Planned | Account ready | Planned | Planned | N/A | **5%** |
| HCS Audit Trail | N/A | Planned (viewer) | Done (auto) | Done | Done | N/A | **80%** |

> **Core pipeline (Dashboard → Guardian VC → EGGOCOINS auto-mint → Mirror Node query) is fully operational — no middleware required for the primary flow.**

---

<a id="setup"></a>

## Setup & Run

### Prerequisites

- Node.js >= 18
- Hedera Testnet account (get one at [portal.hedera.com](https://portal.hedera.com))
- Guardian Managed Service instance (or local Guardian)
- Google Cloud service account with Sheets API enabled *(only for backend cron jobs)*

### Quick Start — Dashboard Only (No Backend Needed)

The dashboard connects **directly to Guardian and Hedera Mirror Node** — no middleware required for core operations:

```bash
# 1. Clone the repository
git clone https://github.com/c4p5/EggoLogic-Hedera-Hackathon.git
cd EggoLogic-Hedera-Hackathon

# 2. Open the dashboard directly in your browser
# Option A: Open dashboard/index.html locally
# Option B: Visit https://c4p5.github.io/EggoLogic-Hedera-Hackathon/

# 3. Log in with a demo account (see dashboard/js/config.js for credentials)
# 4. Submit a delivery, view wallet, check impact — all via Guardian + Mirror Node
```

### Full Setup — Dashboard + Backend Services

For supplier custody, legacy Sheet polling, HTS transfers, and Telegram integration:

```bash
# 1. Clone and install
git clone https://github.com/c4p5/EggoLogic-Hedera-Hackathon.git
cd EggoLogic-Hedera-Hackathon
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Hedera credentials, Guardian URL, and Google Sheets config

# 3. Start the backend (port 4000)
npm run middleware:dev

# 4. Open the dashboard
# dashboard/index.html or https://c4p5.github.io/EggoLogic-Hedera-Hackathon/
```

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `HEDERA_OPERATOR_ID` | Your Hedera testnet account ID | Yes |
| `HEDERA_OPERATOR_KEY` | Your Hedera private key (ED25519) | Yes |
| `EGGOCOINS_TOKEN_ID` | HTS fungible token ID | Yes |
| `CARBONCOIN_TOKEN_ID` | HTS NFT token ID | Yes |
| `HCS_TOPIC_DELIVERIES` | HCS topic for delivery audits | Yes |
| `HCS_TOPIC_BATCHES` | HCS topic for batch audits | Yes |
| `HCS_TOPIC_PRODUCTION` | HCS topic for production audits | Yes |
| `GUARDIAN_URL` | Guardian API base URL | Yes |
| `GUARDIAN_POLICY_ID` | Published policy ID | Yes |
| `GUARDIAN_USERNAME` | Guardian operator email | Yes |
| `GUARDIAN_PASSWORD` | Guardian operator password | Yes |
| `GOOGLE_SPREADSHEET_ID` | Google Sheets ID for deliveries | Yes |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google SA email | Yes |
| `GOOGLE_PRIVATE_KEY` | Google SA private key | Yes |
| `DEMO_MODE` | `true` for offline demo data | No |
| `POLLING_INTERVAL_MINUTES` | Delivery poll frequency (default: 5) | No |
| `CARBON_THRESHOLD_KG` | Kg threshold for CIN eligibility (default: 1000) | No |

### Project Structure

```
/
├── dashboard/              # Semi-static frontend (vanilla JS + Tailwind, GitHub Pages)
│   ├── index.html          # Main dashboard + delivery form (direct Guardian submit)
│   ├── marketplace.html    # EGGOCOINS redemption catalog
│   ├── wallet.html         # Token balance + TX history (Hedera Mirror Node)
│   ├── impact.html         # Environmental metrics (Guardian block data)
│   ├── register.html       # Restaurant onboarding form
│   ├── admin-proponent.html # Admin approval panel
│   ├── restaurant-view.html # Supplier custodial view
│   ├── js/
│   │   ├── config.js       # Guardian URL, Policy ID, Token IDs, demo accounts
│   │   ├── api.js          # Guardian auth (login/refresh) + API wrapper
│   │   ├── hedera.js       # Mirror Node queries (balances, TXs, NFTs)
│   │   ├── ui.js           # Shared: login modal, toast, nav, skeletons
│   │   ├── dashboard.js    # Index page: metrics, delivery form, wallet widget
│   │   ├── wallet.js       # Wallet page: holders, history, CIT log
│   │   ├── impact.js       # Impact page: CO2, waste chart, milestones
│   │   ├── marketplace.js  # Marketplace page: catalog, supply stats
│   │   └── suppliers.js    # Supplier pages: register, admin, restaurant-view
│   ├── css/custom.css      # Glass morphism + animations
│   └── data/guardian-cache.json  # Offline fallback cache
│
├── middleware/              # Node.js backend services (Express, port 4000)
│   └── src/
│       ├── index.js         # Server + cron job setup
│       ├── config/          # env.js, hedera.js (SDK client)
│       ├── routes/          # supplier, dashboard, guardian, webhook
│       ├── services/        # hedera, custody, sheets, points, ai, telegram
│       ├── jobs/            # poll-deliveries, sync-suppliers, carbon-accumulator
│       ├── data/            # demo-data.js, suppliers_store.json
│       └── utils/           # logger, validators, date.utils
│
├── guardian/               # Guardian policy definitions
│   └── schemas/            # 9 JSON Schema files for VCs
│
├── contracts/              # (Empty — we use HTS natively, not smart contracts)
├── docs/                   # Architecture, blueprints, carbon methodology, token economics
├── pitch/                  # Demo script, recording notes
└── .github/workflows/      # GitHub Pages deployment (dashboard/)
```

---

## Cost Analysis

| Operation | Monthly Volume | Cost |
|---|---|---|
| EGGOCOINS mints | ~100 deliveries | $0.10 |
| CIN NFT mints | ~2 | $0.04 |
| HCS audit messages | ~100 | $0.08 |
| Guardian VCs | ~100 | included (MGS) |
| **Total** | | **~$0.20/month** |

At **10x volume** (1,000 deliveries/month): still under **$3/month**. Hedera's fixed USD-denominated fees make blockchain verification accessible to small-scale sustainability projects in developing countries.

---

## Regulatory Alignment (Uruguay)

| Regulation | Relevance | Status |
|---|---|---|
| **Ley 19.829** (2019) — Integrated Waste Management | Core: circular economy, extended producer responsibility | Aligned |
| **Ley 17.849** (2004) — Solid Waste Management | Waste collection and processing permits | In progress (DINAMA registration) |
| **Decreto 182/013** — Waste Management Regulation | Operational permits, transport manifests | Partial (transport fields planned) |

> CIN NFTs are labeled as **Circular Impact Certificates**, not "Carbon Credits" — pending CDM AMS-III.F integration in Phase 2 for internationally recognized credit status.

---

<a id="roadmap"></a>

## Roadmap

| Phase | Timeline | Status | Key Milestones |
|---|---|---|---|
| **1. Prove** | Q1 2026 | **Current** | Real operations, custom Guardian policy, 9 schemas, 4 roles, EGGOCOINS + CIN on testnet, working pipeline |
| **2. Scale** | Q3-Q4 2026 | Next | CDM AMS-III.F integration, IoT sensors (weight + temperature), mainnet migration, 10+ restaurants, 1,200 eggs/week |
| **3. Network** | 2027 | Planned | Hub-in-a-Box replication kit, LatAm expansion, CIN marketplace, third-party API |
| **4. Ecosystem** | 2028+ | Vision | Decentralized verification network, tokenized production (EGGTOKEN), DAO governance |

---

## On-Chain References (Testnet)

| Resource | ID | Link |
|---|---|---|
| **Treasury Account** | `0.0.7166777` | [HashScan](https://hashscan.io/testnet/account/0.0.7166777) |
| **EGGOCOINS Token** | `0.0.8287358` | [HashScan](https://hashscan.io/testnet/token/0.0.8287358) |
| **CIN NFT Token** | `0.0.8287362` | [HashScan](https://hashscan.io/testnet/token/0.0.8287362) |
| **Registry Account** | `0.0.8292724` | [HashScan](https://hashscan.io/testnet/account/0.0.8292724) |
| **Operator Account** | `0.0.8294659` | [HashScan](https://hashscan.io/testnet/account/0.0.8294659) |
| **VVB Account** | `0.0.8294709` | [HashScan](https://hashscan.io/testnet/account/0.0.8294709) |
| **Guardian Policy** | EWD-RB v0.3 | `69bc4638e755119d0774dd03` (MGS) |

---

## Built With

| Technology | Purpose | Where Used |
|---|---|---|
| **[Hiero JavaScript SDK](https://www.npmjs.com/package/@hashgraph/sdk)** (`@hashgraph/sdk`) | HTS minting/transfers, HCS publishing, balance queries | `middleware/src/services/hedera.service.js`, `middleware/src/config/hedera.js` |
| **[Hedera Guardian](https://github.com/hashgraph/guardian)** (Managed Service) | MRV policy engine, Verifiable Credentials, automated token minting | `middleware/src/services/guardian.service.js` |
| **[Hedera Token Service (HTS)](https://hedera.com/token-service)** | EGGOCOINS (fungible) + CIN NFT (non-fungible) | Policy `mintDocumentBlock`, `hedera.service.js` |
| **[Hedera Consensus Service (HCS)](https://hedera.com/consensus-service)** | Immutable audit trail (3 topics) | `hedera.service.js → publishAuditLog()` |
| **[Hedera Mirror Node](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)** | Token balances, TX history for dashboard | `dashboard/js/hedera.js` |
| **Node.js + Express** | Background services: supplier custody, cron jobs, HTS transfers | `middleware/src/` |
| **Vanilla JS + Tailwind CSS** | Semi-static dashboard — direct Guardian + Mirror Node integration, no framework | `dashboard/` |
| **Google Sheets API** | Legacy data entry fallback (polled by backend cron) | `middleware/src/services/sheets.service.js` |
| **Google Gemini API** | AI extraction of delivery data from text/images | `middleware/src/services/ai.service.js` |
| **GitHub Pages** | Dashboard deployment | `.github/workflows/deploy-pages.yml` |

---

## Team

| Name | Role |
|---|---|
| **Ramon Aguileira** | Founder & Developer — Operations in Uruguay |
| **Santiago** | Guardian & Hedera Implementation |

---

## License

This project is licensed under the MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  <strong>Real waste. Real larvae. Real eggs. Real impact. All verified on-chain.</strong>
</p>
