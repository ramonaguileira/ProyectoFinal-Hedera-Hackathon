# EGGOLOGIC — ROADMAP

> From a working circular economy hub in Uruguay to a decentralized global network for verified waste-to-value impact.

---

<p align="center">
  <strong>Phase 1</strong> · Prove ✅ →
  <strong>Phase 2</strong> · Scale →
  <strong>Phase 3</strong> · Network →
  <strong>Phase 4</strong> · Ecosystem
</p>

---

## Phase 1 — Prove the Model (Q1 2026) `CURRENT`

> **Goal:** Demonstrate that a real circular economy operation can be verified end-to-end on Hedera Guardian.

### Completed

- [x] Physical circular economy hub operating in El Tesoro, Maldonado, Uruguay
- [x] Processing 300–600 kg of organic waste per week from partner restaurants
- [x] BSF larvae bioconversion → protein feed → laying hens → eggs + compost
- [x] First restaurant partner onboarded with real waste deliveries
- [x] Custom Guardian policy **EWD-RB v0.3** published on Guardian MGS (v1.5.1)
- [x] **8 schemas** covering the full operational cycle:
  - `Supplier Registration` · `Waste Delivery` · `Waste Batch` · `Production Output`
  - `Impact Calculation` · `VVB Assessment Record` · `External Validation Record` · `Issuance Record`
- [x] **5 roles** with independent verification: OWNER, Registry, Project Proponent, Operator, VVB
- [x] **EGGOCOIN** ($EGGO) fungible token on HTS (`0.0.8287358`) — supplier incentive rewards
- [x] **CIN NFT** (Circular Impact NFT) on HTS (`0.0.8287362`) — verified impact credits
- [x] Dashboard (vanilla HTML/JS + Tailwind) connected directly to Guardian API + Hedera Mirror Node
- [x] Zero-middleware architecture — static frontend on GitHub Pages, no servers
- [x] VVB manual approval triggers token minting via Guardian policy engine
- [x] Live dashboard: [ramonaguileira.github.io/EggoLogic-Hedera-Hackathon](https://ramonaguileira.github.io/EggoLogic-Hedera-Hackathon/)
- [x] Hackathon submission: Hedera Hello Future Apex 2026 (Sustainability Track, Hiero Bounty)

### Key Metrics — Phase 1

| Metric | Value |
|---|---|
| Weekly waste processed | 300–600 kg |
| Eggs produced per week | 35–45 |
| Compost output per week | ~70 kg |
| Monthly blockchain cost | ~$0.20 |
| Guardian schemas | 8 |
| Policy roles | 5 (including OWNER + independent VVB) |
| Restaurant partners | 1 (active) |
| Infrastructure cost | $0 (GitHub Pages + Guardian MGS) |

### Hedera Testnet Assets — Phase 1

| Asset | ID | Explorer |
|---|---|---|
| EGGOCOIN Token | `0.0.8287358` | [HashScan](https://hashscan.io/testnet/token/0.0.8287358) |
| CIN NFT | `0.0.8287362` | [HashScan](https://hashscan.io/testnet/token/0.0.8287362) |
| Policy Topic | `0.0.8291451` | [HashScan](https://hashscan.io/testnet/topic/0.0.8291451) |
| Instance Topic | `0.0.8294148` | [HashScan](https://hashscan.io/testnet/topic/0.0.8294148) |

---

## Phase 2 — Scale Operations (Q3–Q4 2026)

> **Goal:** Add internationally recognized methodology, automate data capture, and migrate to mainnet.

### Milestones

- [ ] **CDM AMS-III.F Integration** — Import and adapt the United Nations' composting methodology into Guardian
  - Internationally recognized carbon credit standard
  - Dramatically increases the value and credibility of CIN NFTs
  - Builds on top of the custom EWD-RB policy (not replacing it)
- [ ] **IoT Sensor Integration** — Automated weight capture at the hub
  - Digital scales with Bluetooth/WiFi → direct data feed to Guardian
  - Temperature probes for compost monitoring (55–65°C verification)
  - Eliminates manual data entry errors → strengthens dMRV integrity
- [ ] **Mainnet Migration** — Move from Hedera testnet to mainnet
  - Production-grade Guardian policy deployment
  - Real token economics with actual EGGOCOIN utility
  - CIN NFTs with real-world market value
- [ ] **Dashboard v2** — Enhanced features
  - Real-time EGGOCOIN balance with transaction history (already working)
  - CIN NFT gallery with IPFS metadata viewer
  - Delivery analytics and quality improvement suggestions
  - Multi-language support (Spanish/English/Portuguese)
  - VVB approval interface integrated into dashboard (currently in Guardian UI)
- [ ] **10+ Restaurant Partners** — Expand collection network in Maldonado department
  - Standardized onboarding flow via Guardian (Supplier Registration schema)
  - Dedicated collection routes and scheduling
  - Quality grading system with transparent feedback
- [ ] **Redemption System** — Give EGGOCOIN real utility
  - 100 EGGOCOIN = 1 dozen eggs from Eggologic production
  - Compost credits for partner restaurants' gardens
  - Priority access to premium products
- [ ] **Fix Technical Debt** from hackathon build (see below)

### Target Metrics — Phase 2

| Metric | Target |
|---|---|
| Weekly waste processed | 1,500–2,000 kg |
| Restaurant partners | 10–15 |
| Eggs produced per week | 100–150 |
| CIN NFTs minted | 4–6 per quarter |
| Monthly blockchain cost | ~$1–3 |

---

## Phase 3 — Replicate the Hub Model (2027)

> **Goal:** Enable other organic waste processors to plug into the Eggologic protocol and generate verified impact credits.

### Milestones

- [ ] **Hub-in-a-Box Kit** — Replicable package for new operators
  - Standard operating procedures for BSF bioconversion
  - Pre-configured Guardian policy templates
  - Dashboard white-label for local branding
  - IoT hardware specifications and suppliers list
- [ ] **Multi-Hub Architecture** — Support multiple processing hubs on a single Guardian instance
  - Each hub = separate Operator role with independent verification
  - Cross-hub analytics and leaderboard
  - Shared VVB pool for efficient verification
- [ ] **Regional Expansion — Latin America**
  - Target markets: Brazil, Argentina, Colombia, Mexico
  - Localized compliance with regional waste management regulations
  - Partnerships with municipal waste management programs
- [ ] **CIN Marketplace** — Secondary market for impact credits
  - Companies purchase CIN NFTs to offset environmental footprint
  - Transparent pricing based on verified impact data
  - Corporate ESG reporting integration
- [ ] **API for Third-Party Integrations**
  - Waste management platforms can submit data to Eggologic Guardian policies
  - Carbon offset platforms can verify and list CIN NFTs
  - Municipal dashboards for waste diversion tracking

### Target Metrics — Phase 3

| Metric | Target |
|---|---|
| Operating hubs | 5–10 across LatAm |
| Weekly waste processed (network) | 10,000+ kg |
| Restaurant partners (network) | 100+ |
| CIN NFTs minted | 20–30 per quarter |

---

## Phase 4 — Decentralized Ecosystem (2028+)

> **Goal:** Build an open, decentralized network where any waste-to-value operation worldwide can validate impact on Hedera.

### Vision

- [ ] **Open Protocol** — Publish Eggologic MRV standard as open specification
  - Any BSF farm, composting facility, or biodigester can adopt
  - Standardized schemas for waste diversion verification
  - Governance framework for policy updates
- [ ] **Decentralized Verification** — Community of VVBs
  - Staking mechanism for verifiers
  - Reputation scoring based on verification accuracy
  - Cross-border verification without centralized authority
- [ ] **Tokenized Production Chain** — Extend beyond waste processing
  - Traceability tokens for eggs, compost, and larvae products
  - Consumer-facing verification: scan QR → see the full chain from waste to product
  - Premium pricing justified by verified regenerative production
- [ ] **DAO Governance** — Community-driven protocol decisions
  - Hub operators, suppliers, verifiers, and impact buyers vote on protocol upgrades
  - Treasury management for network development funds
  - Grant program for new hub operators in underserved regions
- [ ] **Carbon Credit Interoperability**
  - Bridge CIN NFTs to compliance carbon markets (Article 6 of Paris Agreement)
  - Integration with Verra, Gold Standard registries via Guardian policy adapters
  - Real-time pricing feeds for environmental credits

---

## Technical Debt & Improvements

> Known issues from the hackathon build to address in Phase 2.

| Issue | Priority | Phase |
|---|---|---|
| Trailing spaces in Guardian policy roles (`"Project_Proponent "`) | High | 2 |
| Policy token template IDs don't match actual tokens (wizard-generated vs. actual) | High | 2 |
| `policyNavigation`, `policyGroups`, `policyTokens` arrays empty in policy config | Medium | 2 |
| Operator role isolated — no RefreshEvents from other roles | Medium | 2 |
| OWNER shares Impact Calculation schema for initial description step | Low | 2 |
| Trust Chain / reportBlock only has generic reportItemBlock | Medium | 3 |
| Dashboard uses block UUIDs instead of tags (breaks on policy republish) | Medium | 2 |
| Marketplace redemption is UI-only (no actual token transfers) | Medium | 2 |
| Guardian cache (`guardian-cache.json`) requires manual regeneration | Low | 2 |

---

## How to Get Involved

We're looking for:

- **Restaurant partners** in Uruguay willing to participate in waste collection
- **BSF operators** interested in replicating the hub model in their region
- **Guardian/Hedera developers** who want to contribute to the policy architecture
- **Impact investors** aligned with circular economy and ReFi principles
- **VVBs** (Verification Bodies) interested in becoming part of our verification network

Contact: [GitHub Issues](https://github.com/ramonaguileira/EggoLogic-Hedera-Hackathon/issues) | [Project Discussions](https://github.com/ramonaguileira/EggoLogic-Hedera-Hackathon/discussions)

---

<p align="center">
  <strong>Every kilogram diverted. Every token minted. Every credit verified. One delivery at a time.</strong>
</p>

