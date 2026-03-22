# Resume — Dashboard V13

Read guardian/DASHBOARD-HANDOFF-V13.md first.

Then read files ON DEMAND as needed (don't read everything upfront — saves context):
- dashboard/js/api.js — if touching Guardian POST/auth, block data pagination
- dashboard/js/dashboard.js — if touching delivery form, workflow orchestrator, stepper, count-up, hero metrics
- dashboard/js/config.js — if touching block IDs, proxy URL, config, Privy keys
- dashboard/js/hedera.js — if touching Hedera API calls, tx fetch, pagination, mint events
- dashboard/js/wallet.js — if touching wallet/CIT data, tx pagination, tx display
- dashboard/js/ui.js — if touching login/toast/loading, Privy login form, updateAuthUI
- dashboard/js/privy.js — if touching Privy SDK init, email OTP flow, session management
- dashboard/js/impact.js — if touching impact page data, aggregate score, colored bars, category filter, fetchImpactData
- dashboard/js/marketplace.js — if touching marketplace stats
- dashboard/css/custom.css — if adding CSS animations, carousel
- dashboard/index.html — if touching delivery form HTML, hero, footer, carousel
- dashboard/wallet.html — if touching wallet/CIT layout, footer
- dashboard/marketplace.html — if touching marketplace layout, footer, card images, contact mailto
- dashboard/impact.html — if touching impact page, filter dropdown, footer, Hedera image
- proxy/src/index.js — if touching CORS proxy
- scripts/submit-failed-delivery.js — if touching failed delivery test script

CONTEXT:
- Eggologic circular economy platform on Hedera for Apex Hackathon (deadline March 22, 2026)
- Dashboard DEPLOYED at https://c4p5.github.io/EggoLogic-Hedera-Hackathon/
- CORS proxy LIVE at https://eggologic-proxy.sargas.workers.dev
- Architecture: static HTML + JS fetch + Tailwind CDN, no build tools
- GitHub Pages deploys on push to main (~20s)
- Guardian login works with REAL tokens (no more offline fallback)
- Privy Web2 login WORKING — email OTP flow via @privy-io/js-sdk-core on esm.sh CDN
- Privy loaded as ES module (<script type="module" src="js/privy.js">)
- Privy section hidden until SDK loads; graceful fallback if SDK fails
- Guardian login takes precedence over Privy in updateAuthUI()
- Auto-workflow: PP submit → VVB auto-approve → EGGOCOIN mint (all automated)
- Token display uses "$EGGO" not "EGO"
- Password for all demo accounts: "test"
- CDM AMS-III.F methodology: kg_ajustados = (kg_bruto - kg_impropios) × 0.70
- EGGOCOIN supply: ~1,230 (after V12 mints)
- CIT Token: 0.0.8287362 (NFT), 4 minted, 1 valid (serial #4)
- Hero metrics pull LIVE from Hedera Mirror Node (not Guardian blocks)
- Wallet tx history is paginated: 5/page with nav buttons
- Wallet tx fetches with pagination (100/page, follows links.next)
- Tx direction: OWNER shows minus/sent, others show plus/received
- Delivery form ONLY visible to Project_Proponent role
- CTA card has right-scrolling carousel with platform benefits
- ENT numbering uses EGGOCOIN-filtered TOKENMINT events from Mirror Node
- Impact page uses fetchImpactData() — authenticates as VVB behind the scenes
- Impact aggregate score uses CDM category inference (Cat A/B = approved, Cat C = rejected)
- Impact bars re-numbered sequentially after sort
- Impact category filter dropdown: All / Cat A / Cat B / Cat C
- Guardian block data uses ?pageSize=50
- VVB queue has 15 documents
- Marketplace: Contact Us → mailto, stats: 3 restaurants, 724kg composted
- Marketplace images: Dine Out (jpg), Eggs (jpg), Certification (png object-contain), Compost/Bins (icon-only)
- Explore Venues → https://www.instagram.com/naturalypopular
- Footer links: About Us → eggologic.org, Partners → Instagram, Contact → Instagram, Legal → easter eggs
- Impact map card: right half shows hedera.webp (HBAR coins image)
- V13 changes committed in 11b772f (Privy/footer/marketplace) + e56b777 + 05a58a9

WHAT WAS DONE (V13 session):
- Privy Web2 login: email OTP flow via esm.sh CDN (privy.js + ui.js + config.js)
- Login modal: Guardian form + "or continue with email" + Privy OTP form
- Nav: purple mail icon + email when Privy-authenticated
- Marketplace card images: Dine Out, Eggs, Certification (3 of 5)
- Certification card: object-contain + padding (PNG doesn't stretch)
- Explore Venues: button → <a> linking to Instagram
- Footer links: 6 external links across 4 pages (Company + Legal columns)
- Impact Hedera image: replaced gradient placeholder with hedera.webp

HACKATHON SPRINT PRIORITIES:
1. README for judges — architecture diagram, tech stack, demo walkthrough, CDM methodology
2. Demo video / walkthrough script (2-3 min)
3. Landing hero polish — tagline for 30-second judge evaluation
4. Error states polish — "Connecting to Guardian..." instead of silent fallback
5. Print-ready impact report — verify window.print() produces clean PDF
6. Accessibility pass — alt text, aria-labels on interactive elements

TASK:
[describe what you want to work on]

Key constraints:
- No build tools — static HTML + JS fetch + Tailwind CDN
- Auto-deploys on push to main via GitHub Actions
- Local server: cd dashboard && npx http-server . -p 8080 -c-1 --cors
- Proxy redeploy: cd proxy && wrangler deploy
- Windows 10, no python, use node for scripting
- READ FILES ON DEMAND to save context window
