## PROMPT

```
Read guardian/DASHBOARD-HANDOFF-V12.md first.

Then read files ON DEMAND as needed (don't read everything upfront — saves context):
- dashboard/js/api.js — if touching Guardian POST/auth, block data pagination
- dashboard/js/dashboard.js — if touching delivery form, workflow orchestrator, stepper, count-up, hero metrics
- dashboard/js/config.js — if touching block IDs, proxy URL, config
- dashboard/js/hedera.js — if touching Hedera API calls, tx fetch, pagination, mint events
- dashboard/js/wallet.js — if touching wallet/CIT data, tx pagination, tx display
- dashboard/js/ui.js — if touching login/toast/loading
- dashboard/js/impact.js — if touching impact page data, aggregate score, colored bars, category filter, fetchImpactData
- dashboard/js/marketplace.js — if touching marketplace stats
- dashboard/css/custom.css — if adding CSS animations, carousel
- dashboard/index.html — if touching delivery form HTML, hero, footer, carousel
- dashboard/wallet.html — if touching wallet/CIT layout, footer
- dashboard/marketplace.html — if touching marketplace layout, footer, contact mailto
- dashboard/impact.html — if touching impact page, filter dropdown, footer
- proxy/src/index.js — if touching CORS proxy
- scripts/submit-failed-delivery.js — if touching failed delivery test script

CONTEXT:
- Eggologic circular economy platform on Hedera for Apex Hackathon (deadline March 22, 2026)
- Dashboard DEPLOYED at https://ramonaguileira.github.io/EggoLogic-Hedera-Hackathon/
- CORS proxy LIVE at https://eggologic-proxy.sargas.workers.dev
- Architecture: static HTML + JS fetch + Tailwind CDN, no build tools
- GitHub Pages deploys on push to main (~20s)
- Guardian login now works with REAL tokens (no more offline fallback)
- Auto-workflow: PP submit → VVB auto-approve → EGGOCOIN mint (all automated)
- Token display uses "$EGGO" not "EGO"
- Password for all demo accounts: "test"
- CDM AMS-III.F methodology: kg_ajustados = (kg_bruto - kg_impropios) × 0.70
- EGGOCOIN supply: ~1,230 (after V12 mints)
- CIT Token: 0.0.8287362 (NFT), 4 minted, 1 valid (serial #4)
- Hero metrics pull LIVE from Hedera Mirror Node (not Guardian blocks)
- Wallet tx history is paginated: 5/page with ◀▶ nav buttons
- Wallet tx now fetches with pagination (100/page, follows links.next)
- Tx direction: OWNER shows minus/sent, others show plus/received
- Delivery form ONLY visible to Project_Proponent role
- CTA card has right-scrolling carousel with platform benefits
- ENT numbering uses EGGOCOIN-filtered TOKENMINT events from Mirror Node (not all tokens)
- Impact page uses fetchImpactData() — authenticates as VVB behind the scenes so ALL users see live data
- Impact aggregate score uses CDM category inference (Cat A/B = approved, Cat C = rejected)
- Impact bars re-numbered sequentially after sort (fixes duplicate ENT-011 labels)
- Impact category filter dropdown: All / Cat A / Cat B / Cat C
- Guardian block data uses ?pageSize=50 (default was 10, capping visible deliveries)
- VVB queue has 15 documents (confirmed after Cat C rejection test)
- Marketplace: Contact Us → mailto, stats: 3 restaurants, 724kg composted
- V12 changes committed in 711e8e9, pushed to main

WHAT WAS DONE (V12 session):
- ENT counter filtered to EGGOCOIN-only mints (hedera.js)
- Guardian API pagination: pageSize=50 (api.js)
- Aggregate score fix: CDM category inference + direct DOM update (impact.js)
- fetchImpactData(): VVB auth behind the scenes for all users (impact.js)
- ENT ordering: sorted + sequential re-numbering (impact.js)
- Category filter dropdown: All/A/B/C with click-away close (impact.html + impact.js)
- Cat C rejection test: 187kg delivery submitted + rejected, red bar in graph
- Failed delivery script updated to 187kg base

HACKATHON SPRINT PRIORITIES:
1. Visual QA on live site — aggregate score, graph (15 bars), filter, red Cat C bar
2. Mobile QA — impact responsive, filter dropdown, graph on small screens
3. Remaining marketplace images (2 more cards)
4. README for judges — architecture diagram, tech stack, demo walkthrough, CDM methodology
5. Demo video / walkthrough script (2-3 min)
6. Landing hero polish — tagline for 30-second judge evaluation
7. Error states polish — "Connecting to Guardian..." instead of silent fallback
8. Print-ready impact report — verify window.print() produces clean PDF
9. Accessibility pass — alt text, aria-labels on interactive elements

TASK:
[describe what you want to work on]

Key constraints:
- No build tools — static HTML + JS fetch + Tailwind CDN
- Auto-deploys on push to main via GitHub Actions
- Local server: cd dashboard && npx http-server . -p 8080 -c-1 --cors
- Proxy redeploy: cd proxy && wrangler deploy
- Windows 10, no python, use node for scripting
- READ FILES ON DEMAND to save context window
```

