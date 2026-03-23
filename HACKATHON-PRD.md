# Eggologic — Hackathon PRD

> **Hackathon:** Hedera Hello Future: Apex 2026
> **Track:** Sustainability — Guardian-powered MRV for climate and circular economy
> **Bounty:** Hiero — Native use of HTS + HCS via Guardian MGS
> **Team:** Ramon Aguileira (Founder & Developer), Santiago (Technical Advisor)
> **Status:** Live operation + deployed dashboard

---

## 1. Problem Statement

Every year, [**1.3 billion tonnes**](https://www.fao.org/platform-food-loss-waste/en/) of food are wasted globally (FAO, 2023). Latin America generates ~160 million tonnes annually. In Uruguay, most restaurant organic waste ends up in landfills, where anaerobic decomposition produces **methane** — a greenhouse gas [**80× more potent**](https://www.ipcc.ch/report/ar6/wg1/) than CO₂ over 20 years (IPCC AR6, 2021).

The voluntary carbon market reached [**$2 billion in 2023**](https://www.ecosystemmarketplace.com/publications/state-of-the-voluntary-carbon-market-2024/) (Ecosystem Marketplace), but **small-scale operators are excluded** because traditional MRV (Monitoring, Reporting, Verification) audits cost **$10,000+ per verification cycle**. No transparent, affordable, auditable system exists to verify that organic waste was actually diverted from landfills and converted into productive outputs.

**Target Users**:
- **Primary:** Restaurants in tourist zones (Maldonado, Punta del Este, Uruguay) generating 50–150 kg organic waste/week
- **Secondary:** ESG-conscious companies seeking verified, auditable micro-scale carbon credits
- **Tertiary:** Regenerative food consumers wanting traceable, BSF-fed eggs and certified compost

**Current Solutions**: Municipal waste collection (no separation, no verification), paper-based audit trails, manual spreadsheets. Traditional carbon credit registries (Verra, Gold Standard) are inaccessible to operations under 1,000 tCO₂e/year.

**Why Web3?**: Immutable verification of waste diversion cannot be replicated with Web2 at the same trust level. Tokenized incentives (EGGOCOIN) create an economic loop that aligns restaurant behavior with environmental outcomes. On-chain carbon credits (CIN NFTs) are publicly auditable without relying on a centralized registry. The Trust Chain from restaurant delivery to carbon credit is tamper-proof on Hedera.

---

## 2. Solution Overview

**Eggologic** is a running circular economy hub in El Tesoro, Maldonado, Uruguay that transforms restaurant organic waste into Black Soldier Fly (BSF) larvae protein, which feeds laying hens producing eggs, while the remaining organic matter becomes compost. Every step — from waste reception to carbon credit issuance — is verified on **Hedera** using a custom **Guardian policy (EWD-RB v0.3)**.

The system creates a closed-loop incentive: restaurants deliver organic waste → earn EGGOCOIN tokens → redeem tokens for eggs, compost, and products from the same circular chain. When accumulated waste diversion reaches 1,000 kg adjusted, a **Circular Impact NFT (CIN)** is minted — representing 1 tCO₂e avoided — verified by an independent VVB (Validation & Verification Body) through Guardian's policy engine.

**Hackathon Track Alignment**: Sustainability track — this is a Guardian-powered MRV system for verified waste diversion and carbon avoidance. Hiero bounty — native use of HTS (fungible + NFT tokens) + HCS (policy topics, trust chain) via Guardian MGS, with zero smart contracts needed.

### Key Features (MVP) — Delivered

1. **Waste Delivery Submission + EGGOCOIN Minting** — Project_Proponent submits delivery via dashboard form → Guardian creates VC → VVB approves → HTS mint triggers automatically. This is the core value loop.
2. **Impact Calculation + CIN NFT Minting** — OWNER submits accumulated impact → VVB cross-references deliveries → approves → CIN NFT minted on HTS. This is the carbon credit output.
3. **4-Screen Dashboard** — Real-time metrics from Guardian API + Hedera Mirror Node: dashboard (hero metrics + delivery form), impact report (CO₂ charts, milestones), wallet (balances, tx history, CIN gallery), marketplace (redeem catalog).
4. **Offline Resilience** — Guardian cache fallback + hardcoded metrics + Mirror Node (always public). Read-only mode when Guardian is unreachable.
5. **CORS Proxy** — Cloudflare Worker enabling browser-to-Guardian API calls without middleware.

### Non-Goals (v1)

- Smart contract development (Guardian policy engine handles all logic)
- Mainnet deployment (testnet proof of concept for hackathon)
- Self-custody wallets for restaurants (Eggologic custodies $EGGO in Phase 1–2; self-custody planned for Phase 3)
- Automated VVB approval (manual review preserves credibility)
- IoT sensor integration (manual data entry for Phase 1)
- Token trading / DEX integration (not relevant at this stage)
- Multi-hub architecture (single hub for Phase 1)

---

## 3. Hedera Integration Architecture

### Network Services Used

| Service | Purpose | Why This Service? |
|---------|---------|-------------------|
| **HTS (Fungible)** | EGGOCOIN ($EGGO) — supplier incentive token (`0.0.8287358`) | Native HTS token with infinite supply, minted by Guardian policy. $0.001/mint. Built-in compliance keys (freeze, clawback, KYC) for future regulatory needs. |
| **HTS (NFT)** | CIN — Circular Impact NFT (`0.0.8287362`) | Non-fungible token representing 1 tCO₂e avoided. Each serial links to specific delivery VCs through Trust Chain. $0.02/mint. |
| **HCS** | Policy messaging + trust chain (Topics: `0.0.8291451`, `0.0.8294148`, `0.0.8294149`) | Ordered, timestamped consensus provides immutable audit trail for all VCs, approvals, and mints. $0.0008/message. |
| **Guardian MGS** | MRV policy engine — VC issuance, approval workflows, token minting triggers | Managed service eliminates infrastructure. 8 schemas, 5 roles, VVB manual approval. Policy IS the smart contract. |
| **Mirror Node** | Public data queries — balances, transactions, NFTs, token info, mint events | 7+ REST endpoints used. Free, public, CORS-enabled. Powers all dashboard read operations without auth. |

### Ecosystem Integrations

| Partner/Platform | Integration Type | Value Added |
|-----------------|------------------|-------------|
| **HashScan** | Deep links for token verification | Public audit trail — judges and users can verify every mint on HashScan |
| **Cloudflare Workers** | CORS proxy for Guardian API | Enables zero-middleware architecture — browser talks directly to Guardian |
| **GitHub Pages** | Dashboard hosting + CI/CD | Free deployment, automatic via GitHub Actions on push to main |

### Architecture Diagram

```
  Restaurants (waste delivery)    VVB (approve/reject)     Public (view metrics)
         │                              │                          │
         ▼                              ▼                          ▼
    ┌──────────────────────────────────────────────────────────────────┐
    │                    Dashboard (GitHub Pages)                      │
    │              Vanilla HTML/JS + Tailwind CSS (CDN)               │
    │                                                                  │
    │   index.html        impact.html      wallet.html   marketplace   │
    │   ├─ Hero metrics   ├─ CO₂ chart     ├─ Balance    ├─ Redeem     │
    │   ├─ Delivery form  ├─ Score %       ├─ Tx history │  catalog    │
    │   └─ Activity feed  └─ Milestones    └─ CIN NFTs   └─ Stats     │
    └────┬────────────────────────┬────────────────────────────────────┘
         │                        │
    CORS Proxy                 Hedera Mirror Node
    (Cloudflare Worker)        (Public REST API — no auth)
         │                        │
    Guardian API               /api/v1/tokens/{id}/balances
    (MGS v1.5.1)               /api/v1/transactions
    JWT auth                   /api/v1/tokens/{id}/nfts
         │                        │
    ┌────▼────────────────────────▼────┐
    │        Hedera Testnet            │
    │                                  │
    │  Policy: EWD-RB v0.3            │
    │  Topic:  0.0.8291451            │
    │  8 Schemas · 5 Roles            │
    │                                  │
    │  EGGOCOIN  0.0.8287358 (HTS)    │
    │  CIN NFT   0.0.8287362 (HTS)    │
    │  3 HCS Topics (audit trail)     │
    └──────────────────────────────────┘
```

**Key Design Decision: No Middleware**
The dashboard connects directly to two APIs — Guardian MGS (JWT auth, via CORS proxy) and Hedera Mirror Node (public, no auth). Guardian's policy engine handles all business logic: VC creation, approval workflows, token minting, and trust chain. The dashboard is a pure presentation layer with one write operation (submit delivery form). No backend, no database, no servers.

---

## 4. Hedera Network Impact

### Account Creation

> **Custody model (Phase 1–2):** Eggologic custodies EGGOCOIN balances on behalf of restaurant partners. Restaurants interact through the dashboard and redeem $EGGO for physical products — they do not need their own Hedera wallet. Self-custody wallets (e.g., HashPack) are planned for Phase 3.

**Phase 1–2 account growth** comes from operational roles (new operators, VVBs, hub admins), not individual restaurant wallets:
- **Current:** 5 accounts (OWNER, Registry, Project_Proponent, Operator, VVB)
- **Phase 2 (10 restaurants, custodial):** +5–8 new accounts (additional operators, VVBs, hub roles)
- **Phase 3 (50+ restaurants, self-custody):** 200+ accounts (each restaurant gets own wallet + multi-hub operators + independent VVBs)

### Active Accounts

Each waste delivery triggers activity across 2–3 operational accounts (Project_Proponent submits, VVB approves, OWNER monitors). Restaurant partners interact via dashboard (no wallet needed in Phase 1–2):
- **Current MAA:** 3–5 accounts
- **Phase 2:** 8–12 monthly active accounts (operational roles; restaurants use dashboard without wallet)
- **Phase 3:** 100–200+ monthly active accounts (suppliers with self-custody wallets)

### Transactions Per Second (TPS)

Each delivery generates: 1 VC submission (HCS) + 1 VVB approval (HCS) + 1 token mint (HTS) = ~3 transactions. Transaction volume scales with deliveries, independent of the custody model.

| Scale | Deliveries/month | Transactions/month | Sustained TPS |
|-------|-------------------|-------------------|---------------|
| Phase 1 (current) | ~24 | ~148 | ~0.001 |
| Phase 2 (10 restaurants, custodial) | ~240 | ~1,000 | ~0.001 |
| Phase 3 (50+ restaurants, self-custody) | ~2,400 | ~10,000+ | ~0.01 |
| Phase 4 (regional network) | ~24,000 | ~100,000+ | ~0.04 |

### Audience Exposure

Eggologic brings Hedera into **three sectors with no current Web3 presence**:

1. **Organic waste management** — Latin America generates ~160M tonnes/year (FAO). Zero blockchain MRV exists.
2. **Regenerative agriculture** — Global market projected at [$36.6B by 2032](https://www.precedenceresearch.com/regenerative-agriculture-market) (Precedence Research). No on-chain traceability for BSF bioconversion.
3. **Small-scale carbon credits** — VCM at [$2B in 2023](https://www.ecosystemmarketplace.com/publications/state-of-the-voluntary-carbon-market-2024/). Small operators excluded due to audit costs. Guardian + Hedera reduces verification cost from $10,000+ to **$0.20/month**.

---

## 5. Innovation & Differentiation

### Ecosystem Gap

No project on Hedera (or any blockchain) verifies **waste-to-BSF circular economy operations** using Guardian's MRV framework. Existing Guardian policies focus on renewable energy, forestry, and industrial emissions. Eggologic is the first to:
- Digitize a waste diversion methodology as a Guardian policy
- Use HTS to create a dual-token model (supplier incentive + carbon credit) for circular economy
- Apply CDM AMS-III.F to small-scale BSF bioconversion

### Cross-Chain Comparison

| Platform | Similar Projects | Eggologic Difference |
|----------|-----------------|---------------------|
| Ethereum | Toucan Protocol (carbon bridge), KlimaDAO (carbon DeFi) | These tokenize *existing* credits from registries. Eggologic **creates credits from scratch** via verified physical operations. |
| Polygon | Plastiks (plastic credits), dMRV pilots | Focused on plastic waste or large-scale monitoring. No BSF bioconversion, no integrated incentive token. |
| Hedera | None found for waste-to-value circular economy | First mover. Guardian integration is native, not retrofitted. |

### Novel Hedera Usage

1. **Guardian policy as smart contract** — The EWD-RB policy handles all business logic (approval workflows, conditional token minting, trust chain). Zero Solidity needed. This demonstrates Guardian's power as a no-code smart contract platform for MRV.
2. **Zero-middleware architecture** — Static HTML/JS dashboard talks directly to Guardian API + Mirror Node. No backend servers. This is unusual and demonstrates Hedera's ecosystem maturity.
3. **Dual-token flywheel** — EGGOCOIN (incentive) and CIN NFT (carbon credit) create a self-reinforcing loop: more waste delivered → more $EGGO earned → more waste diverted → more CIN minted → more carbon credits verified.

---

## 6. Feasibility & Business Model

### Technical Feasibility

- **Hedera Services Required:** HTS (fungible + NFT), HCS (3 topics), Mirror Node API, Guardian MGS
- **Team Capabilities:** Full-stack developer (JS, HTML/CSS, Hedera SDK), BSF bioconversion operator, Guardian policy design
- **Technical Risks:**
  1. Guardian API CORS issues → Mitigated with Cloudflare Worker proxy + offline cache
  2. Policy republish breaks block UUIDs → Mitigated by documenting as tech debt + config update procedure
  3. Testnet data loss → Mitigated with guardian-cache.json + GitHub Pages static deployment
- **Mitigation:** Offline mode, cached data, pre-recorded demo backup, documented fallback procedures

### Business Model (Lean Canvas)

| Element | Description |
|---------|-------------|
| **Problem** | 1) Restaurant waste → landfill → methane; 2) No affordable MRV for small operators; 3) No incentive for restaurants to separate waste |
| **Solution** | 1) BSF hub diverts waste (aerobic, near-zero methane); 2) Guardian policy digitizes CDM AMS-III.F at $0.20/mo; 3) EGGOCOIN rewards restaurants for clean deliveries |
| **Key Metrics** | kg waste diverted/week, EGGOCOIN minted/month, CIN NFTs issued, contamination rate, restaurant retention |
| **Unique Value Prop** | Every kg of waste diverted is verified on Hedera — from restaurant to carbon credit — for $0.20/month |
| **Unfair Advantage** | Running operation today (300-600 kg/week), first-mover on Guardian for circular economy, $0.20/mo blockchain cost |
| **Channels** | Direct restaurant outreach, public dashboard (GitHub Pages), restaurant association partnerships |
| **Customer Segments** | Restaurants (waste generators), ESG companies (carbon credit buyers), regenerative food consumers |
| **Cost Structure** | Feed/bedding ($50/mo), blockchain ($0.20/mo), hosting ($0), Guardian ($0 free tier). Break-even Phase 2: 6-12 months. |
| **Revenue Streams** | Egg sales ($60-90/mo → $2,400/mo Phase 2), compost ($90-140/mo → $1,000/mo), BSF larvae, chicken meat, CIN NFTs ($300-450/mo Phase 2) |

> **Full Lean Canvas:** See [docs/lean-canvas.md](docs/lean-canvas.md)

### Why Web3 is Required

1. **Immutable verification** — Each waste delivery VC is anchored on HCS. VVB approval is recorded on-chain. Token mint transactions are publicly auditable. No centralized database can provide this trust level.
2. **Tokenized incentives** — EGGOCOIN creates an economic loop (waste → token → eggs) that couldn't exist on Web2 without building custom loyalty infrastructure.
3. **Carbon credit provenance** — CIN NFTs link back to specific delivery VCs through Guardian's Trust Chain. Every carbon credit is auditable from restaurant to offset — impossible with spreadsheets.
4. **Decentralized verification** — VVB role can be assigned to any independent validator. No single entity controls the verification process.

---

## 7. Execution Plan

### MVP Scope (Hackathon) — Delivered ✅

| Feature | Priority | Status | Hedera Service |
|---------|----------|--------|----------------|
| Guardian policy (EWD-RB v0.3) with 8 schemas, 5 roles | P0 | ✅ Published | HCS (topics), Guardian MGS |
| EGGOCOIN token creation + mint on VVB approval | P0 | ✅ Live | HTS (fungible) |
| CIN NFT creation + mint on impact approval | P0 | ✅ Live | HTS (NFT) |
| Dashboard: delivery form + hero metrics | P0 | ✅ Deployed | Guardian API + Mirror Node |
| Dashboard: impact report (CO₂ chart, milestones) | P0 | ✅ Deployed | Guardian API + Mirror Node |
| Dashboard: wallet (balance, tx history, CIN gallery) | P0 | ✅ Deployed | Mirror Node |
| Dashboard: marketplace (redeem catalog) | P1 | ✅ Deployed | Mirror Node |
| Offline resilience (cache fallback) | P1 | ✅ Working | Guardian cache + Mirror Node |
| CORS proxy (Cloudflare Worker) | P1 | ✅ Deployed | Cloudflare Workers |
| CI/CD (GitHub Actions → GitHub Pages) | P1 | ✅ Active | GitHub |

### Team Roles

| Member | Role | Key Responsibilities |
|--------|------|---------------------|
| Ramon Aguileira | Founder & Developer | BSF hub operations, Guardian policy design, dashboard development, blockchain integration |
| Santiago | Technical Advisor | Architecture review, methodology validation |

### Design Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| Token standard | HTS native vs ERC-20 via smart contract | **HTS native** | Lower cost ($0.001 vs $0.05+), built-in compliance keys, no Solidity needed |
| Business logic | Smart contract vs Guardian policy | **Guardian policy** | No-code MRV engine, built-in VC issuance, role-based approval, audit trail |
| Frontend framework | React/Vue vs Vanilla JS | **Vanilla JS** | Zero dependencies, no build step, instant GitHub Pages deploy, simpler maintenance |
| Backend | Express/Node server vs No middleware | **No middleware** | Static frontend talks directly to Guardian + Mirror Node. Zero server cost. |
| Carbon methodology | Custom formula vs CDM adaptation | **CDM AMS-III.F adaptation** | International credibility. Conservative 0.70 factor deliberately under-counts. |
| VVB approval | Automated vs Manual | **Manual** | Maintains credibility. Automated approval undermines the verification model. |
| Hosting | Vercel/AWS vs GitHub Pages | **GitHub Pages** | Free, automatic CI/CD, no config, sufficient for static dashboard |

### Post-Hackathon Roadmap

- **Phase 2 (Q3–Q4 2026):** CDM AMS-III.F formal integration, IoT sensors (digital scales, temperature probes), mainnet migration, 10+ restaurant partners, EGGOCOIN redemption system
- **Phase 3 (2027):** Hub-in-a-Box replication kit, multi-hub architecture, regional LatAm expansion, CIN marketplace, third-party API
- **Phase 4 (2028+):** Open protocol specification, decentralized VVB network with staking, DAO governance, carbon credit interoperability (Verra/Gold Standard bridges)

> **Full Roadmap:** See [docs/ROADMAP.md](docs/ROADMAP.md)

---

## 8. Validation Strategy

### Current Validation Evidence

| Type | Evidence | Status |
|------|----------|--------|
| **Physical operation** | BSF hub in El Tesoro processes 300–600 kg/week | ✅ Running |
| **Restaurant partnership** | 1 active partner delivering 3–5 times/week, consistently Cat A (≤5% contamination) | ✅ Active |
| **On-chain tokens** | EGGOCOIN mints and CIN NFTs verifiable on HashScan | ✅ Minted |
| **Live dashboard** | 4 screens deployed at ramonaguileira.github.io/EggoLogic-Hedera-Hackathon | ✅ Live |
| **Guardian policy** | 8 schemas published, 5 roles registered, VCs created | ✅ Published |

### Feedback Sources

- Restaurant partner (operational feedback on waste separation, delivery logistics, EGGOCOIN incentive effectiveness)
- Hedera hackathon judges and community (technical feedback on Guardian integration, architecture)
- Local sustainability organizations in Maldonado (market demand for verified compost, BSF larvae)

### Validation Milestones

| Milestone | Target | Timeline |
|-----------|--------|----------|
| First restaurant partner delivering waste | 1 partner, 3-5 deliveries/week | ✅ Achieved (Phase 1) |
| Dashboard used by non-team member | Restaurant partner views impact report | Phase 2 (Q3 2026) |
| 10 restaurant partners onboarded | 10 active suppliers generating EGGOCOIN | Phase 2 (Q4 2026) |
| First CIN NFT sold to ESG buyer | Revenue from carbon credit | Phase 2/3 (2027) |
| External VVB onboarded | Independent validator (not team) | Phase 2 (Q4 2026) |

### Market Feedback Cycles

1. **Cycle 1 (current):** Restaurant partner provides operational feedback on delivery logistics and waste separation quality. Contamination rate tracking validates the category system.
2. **Cycle 2 (Phase 2):** Dashboard usage analytics from 10+ restaurant partners. EGGOCOIN redemption rates measure incentive effectiveness.
3. **Cycle 3 (Phase 2/3):** ESG buyer feedback on CIN NFT value proposition. Market price discovery for micro-scale carbon credits.

---

## 9. Go-To-Market Strategy

### Target Market

- **TAM:** Latin America organic waste management — ~160M tonnes/year (FAO), worth ~$12B in disposal costs
- **SAM:** Uruguay restaurant organic waste — ~50,000 tonnes/year, ~2,000 restaurants in tourist zones
- **Initial Target:** 10–15 restaurants in Maldonado/Punta del Este department (3-month collection radius from El Tesoro hub)

### Distribution Channels

1. **Direct outreach** — Founder visits restaurants, demonstrates EGGOCOIN rewards + eggs-for-waste exchange. Zero cost.
2. **Public dashboard** — Live metrics at GitHub Pages URL serve as trust builder and marketing tool. Restaurants see real impact data.
3. **Restaurant associations** — CCIU (Cámara de Industrias del Uruguay), Cámara de Turismo de Maldonado for network access.
4. **HashScan verification** — On-chain proof of every delivery and mint. Differentiator vs. competitors making unverifiable claims.

### Growth Strategy

- **Phase 2:** 10× restaurants through direct sales in Maldonado. Each new restaurant = new Hedera account + sustained EGGOCOIN minting.
- **Phase 3:** Hub-in-a-Box model — provide Guardian policy template + dashboard + operational manual to new operators in other regions. Each hub replicates the full Hedera integration.
- **Partnership opportunities:** Hedera Grants (ecosystem growth), HBAR Foundation (sustainability focus), Uruguay ANDE (national development agency), local ESG funds.

---

## 10. Pitch Outline

> See [pitch/pitch-script.md](pitch/pitch-script.md) for the full 3-4 minute script.

1. **The Problem (0:00–0:30):** 1.3B tonnes food wasted globally. In Uruguay, restaurant waste → landfill → methane (80× CO₂). No affordable way to verify diversion. Traditional MRV costs $10,000+.
2. **The Solution (0:30–1:15):** Eggologic hub in El Tesoro — waste → BSF larvae → eggs + compost. Every delivery verified on Hedera via Guardian policy. EGGOCOIN rewards restaurants. CIN NFTs = verified carbon credits.
3. **Live Demo (1:15–2:15):** Dashboard walkthrough — submit delivery → VVB approval → EGGOCOIN minted → verify on HashScan → impact report → wallet with CIN NFTs.
4. **Hedera Integration (2:15–2:50):** HTS (2 tokens), HCS (3 topics), Guardian MGS (8 schemas, 5 roles), Mirror Node (7+ endpoints). All for $0.20/month. No smart contracts needed — Guardian IS the smart contract.
5. **Traction (2:50–3:10):** Running operation since 2025. 300–600 kg/week. 1 restaurant partner. Tokens minted on testnet. Dashboard live.
6. **The Opportunity (3:10–3:40):** $2B voluntary carbon market excluding small operators. $36.6B regenerative agriculture market. Hub-in-a-Box replication → 50+ restaurants by 2027.
7. **Close (3:40–4:00):** From waste to protein, eggs, compost, and verified carbon credits — one delivery at a time. On Hedera.

### Key Metrics to Present

| Metric | Value | Source |
|--------|-------|--------|
| Weekly waste processed | 300–600 kg | Operational data (Waste Delivery VCs) |
| Monthly blockchain cost | $0.20 | Hedera transaction fees |
| Food waste globally | 1.3B tonnes/year | FAO, 2023 |
| Methane potency | 80× CO₂ (20-year GWP) | IPCC AR6, 2021 |
| Voluntary carbon market | $2B (2023) | Ecosystem Marketplace |
| Regenerative ag. market | $36.6B by 2032 | Precedence Research |
| Conservative factor | 0.70 (deliberately under-counting) | CDM AMS-III.F adaptation |
| Hedera accounts created | 5 (growing to 200+ at scale) | Mirror Node |

---

## Parking Lot (Future Ideas)

- **IoT sensors** — Digital scales + temperature probes feeding directly to Guardian (dMRV)
- **Tokenized production chain** — EGGTOKEN (1 = 1 verified egg), COMPOSTTOKEN (1 = 1 kg compost)
- **Decentralized VVB network** — Staking mechanism for independent validators
- **DAO governance** — Token holder voting on methodology parameters
- **Carbon credit bridges** — Verra/Gold Standard interoperability for CIN NFTs
- **QR traceability** — Scan egg carton → see complete chain on Hedera (restaurant → larvae → hen → egg)
- **SaucerSwap liquidity** — EGGOCOIN trading pair for price discovery
- **HashPack wallet connect** — Direct token management for restaurant partners

---

## Predicted Score Assessment

| Section | Predicted Score | Weight | Weighted | Rationale | How to Improve |
|---------|----------------|--------|----------|-----------|----------------|
| **Innovation** | 5/5 | 10% | 3.50 | First waste-to-BSF circular economy on Hedera Guardian. Custom EWD-RB methodology. Zero-middleware architecture. Previously unseen on Hedera or cross-chain. | Document competitive analysis more formally. |
| **Feasibility** | 4/5 | 10% | 2.80 | Real operation, strong financing plan, Lean Canvas, domain expertise. Web3 is genuinely required. | Strengthen Lean Canvas with TAM/SAM sizing and customer interview data. |
| **Execution** | 4/5 | 20% | 5.60 | Working MVP with 4 screens, clean architecture (8 modules, zero deps), extensive docs (25k+ lines), roadmap, design decisions documented. | Add automated tests, document team collaboration process. |
| **Integration** | 4/5 | 15% | 4.20 | HTS (fungible + NFT) + HCS (3 topics) + Mirror Node (7+ endpoints) + Guardian MGS. Creative: policy-as-smart-contract. | Add ecosystem partner integration (HashPack wallet connect, HashScan deep links). |
| **Validation** | 2/5 | 15% | 2.10 | 1 restaurant partner actively delivering waste. Physical operation validated. No documented digital platform feedback cycles. | Get restaurant partner to test dashboard, document feedback. Onboard 2-3 more restaurants. |
| **Success** | 3/5 | 20% | 4.20 | Creates 5 Hedera accounts, generates real txs, exposes Hedera to 3 new sectors. Impact projections documented. Testnet only. | Quantify projected TPS at each phase. Emphasize $0.20/mo cost story as Hedera advantage. |
| **Pitch** | 4/5 | 10% | 2.80 | Excellent README (591 lines), pitch script (ES/EN), demo recording guide. Market data cited. Hedera is core. | Record and polish demo video. Add 1-2 more cited market statistics. |
| **Total** | **26/35** | | **25.20** | | |

**Estimated Final Grade: 72%**

**Key Insight:** Execution + Success = 40% of total score. Current combined: 9.80/14.0. Improving Success from 3→4 (+1.40 weighted) and Execution from 4→5 (+1.40 weighted) would push the grade to **80%**.

---

## Section-to-Criteria Mapping

| PRD Section | Judging Criteria Addressed |
|-------------|---------------------------|
| 1. Problem Statement | Feasibility, Pitch |
| 2. Solution Overview | Innovation, Pitch, Execution |
| 3. Hedera Integration | Integration (primary), Innovation |
| 4. Network Impact | Success (primary) |
| 5. Innovation | Innovation (primary) |
| 6. Feasibility & Business Model | Feasibility (primary) |
| 7. Execution Plan | Execution (primary) |
| 8. Validation Strategy | Validation (primary) |
| 9. Go-To-Market | Execution, Success |
| 10. Pitch Outline | Pitch (primary) |

