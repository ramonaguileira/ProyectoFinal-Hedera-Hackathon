# Dashboard Build — Handoff V13

## Status: V13 — Privy Web2 login, marketplace images, footer links, impact Hedera image

**Date:** 2026-03-21
**Deadline:** 2026-03-22 (Hedera Apex Hackathon)
**Previous handoffs:** V12 (impact overhaul/ENT counter/Cat C rejection), V11 (form access/carousel/tx fixes/impact colors/marketplace), V10 (footer/SVG/testnet metrics/tx pagination), V9 (count-up/footer logos/pulse glow), V8 (CORS proxy/auto-workflow), V7 (CIT card/delivery form), V6 (polish/wallet redesign), V5 (HashScan/login gate/NFT), V4 (mobile/deploy), V3 (CORS fix), V2 (scaffold), V1 (brainstorm)

---

## WHAT WAS ACCOMPLISHED THIS SESSION

### 1. Privy Web2 Login — Email OTP Flow (privy.js + ui.js + config.js)

Added Privy alongside Guardian login for Web2 onboarding. Uses headless `@privy-io/js-sdk-core` via esm.sh CDN as ES module — no build tools needed.

- **Login flow:** Enter email → Send Code → Enter OTP → Verify → signed in as "Web2 User"
- **Login modal:** Guardian login form on top, "or continue with email" divider, then Privy email + OTP form below
- **Nav indicator:** Purple mail icon + email + logout button when Privy-authenticated
- **Guardian precedence:** Guardian auth checked first in `updateAuthUI()`, then Privy, then logged-out state
- **Graceful fallback:** Privy section hidden until SDK loads; if placeholder keys or SDK fails, only Guardian login shows
- **Config:** Real Privy App ID and Client ID set in `config.js`

### 2. Marketplace Card Images (marketplace.html)

Replaced Material Symbol icons with real images on 3 of 5 cards:

- **Dine Out** — `img/Dine out.jpg` as full-bleed background with overlay text
- **EGGOLOGIC Eggs** — `img/Eggs.jpg` with light overlay gradient
- **Zero-Waste Certification** — `img/Zero_Waste.png` with `object-contain` + padding (PNG, not stretched)
- Compost & Bins cards stay icon-only

### 3. Explore Venues Link (marketplace.html)

Converted "Explore Venues" `<button onclick="UI.showToast('Coming soon')">` to `<a href="https://www.instagram.com/naturalypopular" target="_blank">` on the Dine Out card.

### 4. Footer Links — All 4 Pages (index, wallet, marketplace, impact)

Replaced all `href="#"` placeholder links:

| Column | Link | URL |
|--------|------|-----|
| Company | About Us | https://eggologic.org |
| Company | Partners | https://www.instagram.com/naturalypopular |
| Company | Contact | https://www.instagram.com/egg_o_logic |
| Legal | Privacy | YouTube (easter egg) |
| Legal | Terms | YouTube (easter egg) |
| Legal | Security | YouTube (easter egg) |

All external links use `target="_blank" rel="noopener noreferrer"`. Platform column (Dashboard, Impact Report, Marketplace) untouched — internal navigation.

### 5. Impact Page — Hedera Image (impact.html)

Replaced the dark gradient placeholder + globe icon in the "Regenerative Impact Map" card's right half with `img/hedera.webp` (HBAR coins on green background, matches Eggologic palette). Uses `object-cover` for clean edge-to-edge fill.

---

## FILE CHANGES (this session)

| File | Change |
|------|--------|
| `dashboard/js/config.js` | Added `PRIVY_APP_ID` and `PRIVY_CLIENT_ID` (real keys) |
| `dashboard/js/privy.js` | **NEW** — ES module, Privy SDK init, email OTP flow (sendCode/verifyCode), session management, global `window.Privy` |
| `dashboard/js/ui.js` | Login modal: added Privy email+OTP form below Guardian. `updateAuthUI()`: added Privy state check (purple indicator) |
| `dashboard/index.html` | Added `<script type="module" src="js/privy.js">`, footer links |
| `dashboard/wallet.html` | Added privy module script, footer links |
| `dashboard/marketplace.html` | Added privy module script, footer links, card images (Dine Out/Eggs/Certification), Explore Venues `<a>` link |
| `dashboard/impact.html` | Added privy module script, footer links, Hedera image in impact map card |
| `dashboard/img/hedera.webp` | **NEW** — HBAR coins image for impact page |

---

## CURRENT STATE

| Component | Status |
|-----------|--------|
| CORS Proxy | LIVE at `eggologic-proxy.sargas.workers.dev` |
| Guardian Login | WORKING (real tokens via proxy) |
| Privy Web2 Login | WORKING (email OTP via esm.sh SDK) |
| PP Delivery Submit | WORKING — PP-only access |
| VVB Auto-Approve | WORKING |
| Impact — Aggregate Score | WORKING — all roles + no login |
| Impact — Waste Chart | WORKING — 15 ENTs, sorted, sequential IDs |
| Impact — Category Filter | WORKING — dropdown with A/B/C filtering |
| Impact — Hedera Map Image | DONE — HBAR coins image |
| ENT Counter (index) | FIXED — EGGOCOIN-only mints |
| HashScan Deep Links | DONE on all pages |
| Count-Up Animation | DONE — 1.1s ease-out |
| Hero Metrics | LIVE from Hedera testnet Mirror Node |
| Footer Links | DONE — real URLs across all 4 pages |
| Footer Logo Strip | DONE — centered, consistent SVGs |
| Wallet TX Pagination | DONE — 5/page with nav |
| CTA Carousel | DONE — right-scrolling auto-loop |
| Marketplace Images | DONE — 3 of 5 cards with real photos |
| Marketplace Explore Venues | DONE — links to Instagram |
| Marketplace Stats | WORKING — 3 restaurants, 724 kg |
| Marketplace Contact | DONE — mailto link |
| Cat C Rejection | TESTED — red bar visible in graph |
| EGGOCOIN Supply | ~1,230 total |
| CIT NFTs | 4 minted (serial #4 valid) |

---

## REMAINING WORK — FINAL SPRINT

### Recommended for hackathon submission:
1. **README for judges** — architecture diagram (static HTML → CORS proxy → Guardian → Hedera), tech stack overview, demo walkthrough, CDM methodology explainer
2. **Demo video / walkthrough script** — 2-3 min screen recording
3. **Landing hero polish** — tagline for 30-second judge evaluation
4. **Error states polish** — "Connecting to Guardian..." instead of silent fallback
5. **Print-ready impact report** — verify `window.print()` produces clean PDF
6. **Accessibility pass** — alt text, aria-labels on interactive elements

### Nice-to-have (if time):
- Mobile QA — test Privy login on mobile, marketplace images responsive
- Fix nested `<nav>` in impact.html
- Architecture diagram embedded in README
- Run more delivery submissions for a richer graph

---

## ACCOUNTS (unchanged)

| Role | Email | Hedera Account | EGGOCOIN |
|------|-------|----------------|----------|
| OWNER (SR) | r.aguileira88@gmail.com | 0.0.7166777 | 10 |
| Registry | eggologic-registry@outlook.com | 0.0.8292724 | 0 |
| Project_Proponent | eggologic-proponent@outlook.com | 0.0.8294621 | ~1,220 |
| Operator | eggologic-operator@outlook.com | 0.0.8294659 | 0 |
| VVB | eggologic-vvb@outlook.com | 0.0.8294709 | 0 |

**Password for all:** `test`

---

## KEY BLOCK IDs (unchanged)

| Block | ID | Used For |
|-------|----|----------|
| PP Delivery Form | `b322eaa1-7611-4704-be60-b033db83dadb` | PP submits waste delivery |
| VVB Delivery Source | `3a5afd50-d4a5-49ca-866b-75477790ae4c` | Fetch pending deliveries as VVB |
| VVB Delivery Approve | `337cef47-e484-48bb-9249-a952cb72f203` | Approve/reject delivery as VVB |

---

## HOW TO RUN / DEPLOY

```bash
# Local dev
cd dashboard && npx http-server . -p 8080 -c-1 --cors

# Deploy dashboard (auto on push to main)
git push origin main

# Redeploy proxy (if changed)
cd proxy && wrangler deploy

# Submit a failed delivery for testing
node scripts/submit-failed-delivery.js
```

---

## RESUME PROMPT

See `guardian/RESUME-DASHBOARD-V13.md`

---

## REFERENCED FILES

| File | Purpose |
|------|---------|
| `guardian/DASHBOARD-HANDOFF-V12.md` | Previous session (impact overhaul/ENT counter/Cat C rejection) |
| `docs/superpowers/specs/2026-03-21-privy-images-footer-design.md` | Design spec for this session's work |
| `docs/superpowers/plans/2026-03-21-privy-images-footer.md` | Implementation plan for this session |
| `scripts/submit-failed-delivery.js` | Submit + reject Cat C delivery (187kg) |
| `docs/carbon-methodology.md` | CDM AMS-III.F methodology |
