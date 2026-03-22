# Dashboard Build — Handoff V14

## Status: V14 — Dark mode toggle

**Date:** 2026-03-22
**Deadline:** 2026-03-22 (Hedera Apex Hackathon)
**Previous handoffs:** V13 (Privy/footer/marketplace), V12 (impact overhaul/ENT counter/Cat C rejection), V11 (form access/carousel/tx fixes/impact colors/marketplace), V10 (footer/SVG/testnet metrics/tx pagination), V9 (count-up/footer logos/pulse glow), V8 (CORS proxy/auto-workflow), V7 (CIT card/delivery form), V6 (polish/wallet redesign), V5 (HashScan/login gate/NFT), V4 (mobile/deploy), V3 (CORS fix), V2 (scaffold), V1 (brainstorm)

---

## WHAT WAS ACCOMPLISHED THIS SESSION

### Dark Mode Toggle (CSS custom properties + Tailwind config + theme.js)

Added full dark/light theme switching across all 4 pages using Material Design 3 dark palette.

**Architecture:**
- All 47 color tokens converted from hardcoded hex to CSS custom properties (`--c-*`)
- `:root` defines light values, `html.dark` defines dark values (in `custom.css`)
- Tailwind config updated to reference CSS vars with `rgb(var(--c-X) / <alpha-value>)` — opacity modifiers like `bg-primary/90` still work
- Theme preference persisted via `localStorage` key `eggologic-theme`
- Respects `prefers-color-scheme` system setting on first visit
- No flash of wrong theme — `theme.js` loads synchronously in `<head>` before Tailwind

**UI changes:**
- Moon/sun toggle button in nav bar (all 4 pages)
- Toggle also in mobile hamburger menu
- Hero/wallet dark sections stay dark in both modes (hardcoded `#10381E`)
- Content cards switched from `bg-white` to `bg-surface-container-lowest` (auto-adapts)
- CTA buttons switched to `bg-primary text-on-primary` (adapts contrast per theme)
- CSS overrides for Tailwind defaults (`stone-*` borders, backgrounds, text)
- Premium cards, form inputs, login modal, skeletons, footer logos all adapt
- Print styles hide toggle button

---

## FILE CHANGES (this session)

| File | Change |
|------|--------|
| `dashboard/js/theme.js` | **NEW** — IIFE: applies saved/system theme before paint, `toggleTheme()` global, icon swap |
| `dashboard/css/custom.css` | Added CSS custom properties (light + dark), dark mode overrides for stone-*, forms, premium-card, skeletons, footer logos, ring-white, login modal |
| `dashboard/index.html` | Tailwind config → CSS vars, theme.js script, toggle button in nav, `bg-white` → `bg-surface-container-lowest` on cards, submit button → `bg-primary text-on-primary` |
| `dashboard/wallet.html` | Same Tailwind/theme/toggle changes, wallet card removed `!bg-primary/90`, HashScan button → `bg-primary text-on-primary` |
| `dashboard/marketplace.html` | Same Tailwind/theme/toggle changes, restaurant card → `bg-surface-container-lowest`, CTA buttons → `text-on-primary`, FAB → `text-on-primary` |
| `dashboard/impact.html` | Same Tailwind/theme/toggle changes, all 5 content cards → `bg-surface-container-lowest`, filter dropdown adapts, Cat A dot → `bg-primary` |
| `dashboard/js/ui.js` | Login modal → `bg-surface-container-lowest`, login button → `bg-primary text-on-primary`, mobile menu gets theme toggle |
| `dashboard/js/wallet.js` | Holder cards → `bg-surface-container-lowest` |

---

## CURRENT STATE

| Component | Status |
|-----------|--------|
| Dark Mode Toggle | WORKING — all 4 pages + mobile menu |
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
1. **Landing hero polish** — tagline for 30-second judge evaluation
2. **Error states polish** — "Connecting to Guardian..." instead of silent fallback
3. **Print-ready impact report** — verify `window.print()` produces clean PDF
4. **Accessibility pass** — alt text, aria-labels on interactive elements

### Nice-to-have (if time):
- README for judges — architecture diagram, tech stack, demo walkthrough
- Demo video / walkthrough script (2-3 min)
- Mobile QA — test dark mode + Privy on mobile
- Fix nested `<nav>` in impact.html
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

See `guardian/RESUME-DASHBOARD-V14.md`

---

## REFERENCED FILES

| File | Purpose |
|------|---------|
| `guardian/DASHBOARD-HANDOFF-V13.md` | Previous session (Privy/footer/marketplace) |
| `guardian/DASHBOARD-HANDOFF-V12.md` | Impact overhaul/ENT counter/Cat C rejection |
| `docs/superpowers/specs/2026-03-21-privy-images-footer-design.md` | Design spec for V13 |
| `docs/superpowers/plans/2026-03-21-privy-images-footer.md` | Implementation plan for V13 |
| `scripts/submit-failed-delivery.js` | Submit + reject Cat C delivery (187kg) |
| `docs/carbon-methodology.md` | CDM AMS-III.F methodology |
