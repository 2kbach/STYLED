# STYLED

**Hair color formulation & tracking app** for professional stylists.

## What We're Building
A web app (eventually iOS/iPadOS) that helps hairstylists track color formulations across client visits. Every service session is recorded as an immutable event — like git for hair color. No more formula drift, no more guessing what was used last time.

## Why
Stylists currently track formulas on paper cards or in their heads. This leads to inconsistency, lost formulas, and difficulty replicating results. STYLED digitizes this with append-only versioning, weight-based precision, and a salon-floor-friendly UI.

## Key Features (MVP)
- Google Sign-in (restricted to allowed users for now)
- Client management (name, phone, notes)
- Service session tracking with append-only history
- Formula entry with weight-based components (grams), developer selection, ratios
- Thumb-zone optimized UI (56px touch targets, bottom nav, high-contrast)
- Photo documentation (planned)
- Offline-first capability (planned)

## Tech Stack
- **Frontend:** Next.js 16 + Tailwind CSS
- **Auth:** NextAuth v5 with Google provider, ALLOWED_USERS env var whitelist
- **Database:** Turso (cloud SQLite) + Prisma 7 ORM
- **Hosting:** Vercel at styled.megandkev.co
- **Repo:** github.com/2kbach/STYLED

## Version
v0.5.16

## Users
- Megan (meg.homsey@gmail.com) — primary user, hairstylist
- Kevin (2KBach@gmail.com) — testing/admin
- Eventually: other stylists (multi-tenant)

## Changelog
- **2026-03-29 17:30** ✅ Project initialized — Next.js, Turso DB, Prisma schema, core UI, deployed to Vercel
- **2026-03-29 18:15** ✅ Google Sign-in working on styled.megandkev.co — v0.1.1
- **2026-03-29 18:30** ✅ Auth fully working after fixing all Vercel env var newlines — v0.1.2
- **2026-03-29 19:00** ✅ Photo capture & gallery working — 3-angle protocol, Vercel Blob storage — v0.2.0
- **2026-03-29 19:30** ✅ Schema restructured — developer/ratio/processing per formula, oz/g/tube units, Crazy Liana Grey seeded — v0.3.0
- **2026-03-29 20:00** ✅ Session editing, repeat into edit mode, date picker, delete with confirm, cancel on new client — v0.3.4
- **2026-03-29 20:30** ✅ Search — live search across clients, products, formulas, notes — v0.3.5
- **2026-03-29 21:00** ✅ Photos moved to bottom, auto-open after new session creation, accent color to black — v0.3.7
- **2026-03-30 18:00** ✅ Boulevard scraper built + import API — v0.4.0
- **2026-03-30 18:30** ✅ SSH to always-on Mac working (`ssh styled-mac`) — v0.4.5
- **2026-03-30 19:00** ✅ Scraper improvements: domcontentloaded, retries, scroll History tab, correct table selectors, staff filter, incremental save — v0.4.6–v0.4.11
- **2026-03-30 20:00** ✅ Batch scraping: SKIP_CLIENTS offset, push per client, batch runner script — v0.5.0
- **2026-03-30 20:30** ✅ First 50 clients scraped and imported to production (438 appointments, 368 orders in batch 1) — v0.5.0
- **2026-03-31 00:00** ✅ Pagination added — scraper now clicks through MUI TablePagination to get all 156 clients (was limited to 50) — v0.5.1
- **2026-03-31 00:30** ✅ React fiber UUID extraction — pull client UUIDs directly from React component `props.key` instead of searching each name individually (~10 min savings) — v0.5.2
- **2026-03-31 00:30** ✅ All 156 clients scraped — 2,733 sessions, 3,812 formulas in production — v0.5.2
- **2026-03-31** ✅ Client schema: added `email` + `blvdId` fields, backfill-contacts script populated all 156 clients with first/last name, phone, email — v0.5.2
- **2026-03-31** ✅ Client profile redesigned: compact session rows with service icons (Scissors, FlaskConical, FileStack, Wand2), stylist name right-aligned ("Me" for Meg in accent) — v0.5.7
- **2026-03-31** ✅ Client list ordered by most recent session — v0.5.8
- **2026-03-31** ✅ Gratuity captured: scraper clicks into each order detail page for Meg's appointments; DB backfill calculated grat = total − service sum for 1,676 sessions — v0.5.10–v0.5.12
- **2026-03-31** ✅ Session page: payment summary card shows order total + gratuity prominently — v0.5.12
- **2026-03-31** ✅ Client profile stats: sessions count, avg revisit weeks, client since, service breakdown with counts — v0.5.13
- **2026-03-31** ✅ Client since formatted as "Mar '26" style, matched to same large bold size as Sessions and Avg wks stats — v0.5.15
- **2026-03-31** ✅ Nightly cron set on second Mac (2 AM, DAYS_BACK=14) for incremental daily scrapes
- **2026-03-31** ✅ backfill-order-details.js: per-stylist service capture — scrapes each order detail page at human-like pace (30–40/hr), saves `StylistDetail: Service=Stylist | ...` and `OrderUUID: uuid` to session notes — v0.5.16 scraper feature
- **2026-03-31** ✅ 50-order test backfill completed successfully on second Mac — 47/50 updated (3 not found in BLVD), multi-stylist orders (e.g. Highlights=Lien Scherr, Blow Dry=Carla Avedisian) captured correctly
- **2026-03-31** ✅ Test Mode built and deployed — avatar menu toggle, amber TEST badge, isolated TestClient/TestServiceSession/TestFormula tables in Turso, 10 seeded fake clients with realistic sessions/formulas, read-only UI (no Edit/Repeat/Add Photos) — v0.5.16

## Case Study

**2026-03-29** — Started STYLED as a web app (Next.js on Vercel) based on a comprehensive technical brief covering hair color chemistry, formula versioning, and salon-floor ergonomics. Chose web-first over native iOS to iterate faster, with plans to wrap in a native app later.

The brief emphasized "thumb zone" ergonomics (critical buttons in bottom third of screen, 56-60pt touch targets for gloved hands) and high-contrast readability under salon lighting. Built the initial UI around these constraints from day one rather than retrofitting.

Database schema uses an append-only pattern for service sessions — each visit creates a new immutable record with its formulas and components. This mirrors the brief's "git-style version control" requirement for formula tracking.

Chose Turso (cloud SQLite) over Postgres for simplicity and edge performance. Prisma 7 as the ORM, which required adapting to its new configuration style (datasource URL in prisma.config.ts, not schema.prisma).

**2026-03-29** — Hit a frustrating auth bug. Google kept returning "invalid_client" for every OAuth client we tried (even across different GCP projects). Turned out `echo` adds a trailing newline (`\n`) when piping values into `vercel env add`, so every Client ID had `%0A` appended. Invisible in dashboards, only visible in the Google redirect URL. Fix: use `printf` instead of `echo` for env vars. Lesson learned for all future Vercel env var setup.

Also discovered NextAuth v5 beta has a known incompatibility with Next.js 16 — the `signIn()` server action throws `UnknownAction`. Workaround: POST a form with CSRF token to the route handler instead.

**2026-03-30** — Built a Boulevard scraper (Playwright headless browser) to pull Megan's client data, appointment history, and order details from `dashboard.boulevard.io`. The salon won't give her API access or data export permissions, so we're scraping the dashboard directly.

Biggest challenge was reverse-engineering Boulevard's MUI/React UI for the filter flow — the "Provider" filter has a nested dropdown with search box and checkboxes, all behind MUI backdrop overlays. Had to inspect the live DOM via Chrome browser tools to get the exact selectors (`li[role="menuitem"]`, search input, Escape to close dropdown before Apply). Also discovered that closing the client profile panel resets the filter, so we collect all names from the table first, then search each one individually to get their UUID.

The scraper runs on the always-on Mac at home. Setting up SSH between the two Macs was its own adventure — the `/32` netmask from a bad static IP config blocked all local traffic (looked like an Eero issue), and the original SSH key had a passphrase preventing automated connections. Created a dedicated `id_ed25519_styled` key without passphrase, and also had to override macOS PAM requiring two-factor auth for SSH.

**2026-03-30** — Ran the first batch scrape: 50 clients imported successfully across 5 batches of 10. Each batch spawns a fresh browser to avoid memory issues. Discovered Boulevard's History tab caps at 100 appointments per client — 15 of Meg's clients hit that ceiling. For now we accept the cap; the older appointment data is less critical since formula tracking is forward-looking.

**2026-03-31** — Hit a wall at 50 clients. Also discovered that Boulevard embeds client UUIDs in React fiber as `props.key` — walking `__reactFiber$` up ~14 levels cuts UUID resolution from 10 minutes to 30 seconds.

Added proper `email` and `blvdId` fields to the Client schema (was cramming everything into notes). Wrote a focused backfill-contacts.js script that only hits the Overview tab for contact data — much faster than re-scraping full history.

Discovered gratuity can be calculated from existing data: `total − sum(service prices)`. No scraping needed. Backfilled 1,676 sessions in seconds. Session pages now show a payment card with total + gratuity. Client profiles show stats (session count, avg revisit, client since, service breakdown).

**2026-03-31** — Hit a wall at 50 clients. The table uses MUI virtual scrolling and only renders ~50 rows. Used Claude Chrome (browser automation MCP) to visually inspect the live Boulevard page and found standard MUI TablePagination at the bottom: "Rows per page: 50 | 1-50 of 156 | < >". Updated the scraper to click through all 4 pages.

Then discovered 154 unique names instead of 156 — two clients (Taryn Shipley, Montana Marks) appeared twice across pages. One "Montana Marks" had a phone number and the other didn't, suggesting duplicate Boulevard accounts. Rather than auto-merging, decided to keep both and build a future "Review Duplicates" page where Meg can choose to merge or keep separate.

Biggest optimization: found that Boulevard embeds client UUIDs in React's internal fiber tree as `props.key` on each table row component. Not visible in the DOM, but accessible via Playwright's `page.evaluate()` by walking `__reactFiber$` → `fiber.return` chain up ~14 levels. This eliminates the need to search each client name individually to get their UUID — cuts the name-to-URL resolution from ~10 minutes (154 individual searches) down to ~30 seconds (just scroll + read fiber).

**2026-03-31** — Built `backfill-order-details.js` to capture per-stylist service assignments. Discovered that multi-stylist orders are common (e.g. Carol did Highlights while Carla did the Blow Dry on the same ticket). The top-level Boulevard appointment record only shows the primary stylist — to get per-service stylist data you have to click into the order detail page at `/sales/order/{uuid}`. The UUID is not the order number — it's a different identifier embedded in the URL.

Biggest parsing challenge: the Boulevard order detail page renders each line item as a `<tr>` with the text "Mens Haircut with\nMeg Auerbach" — the `with` and stylist name split onto separate lines in the DOM but get joined when reading `row.innerText` with a space normalization. Final parser uses `rows.forEach(row => text.replace(/\s+/g, " ").trim())` and matches `/^(.+?) with (.+?)\s+\$(.+)/` for services and `/^Gratuity.*for (.+?)\s+\$(.+)/` for gratuity tips.

Anti-bot: ran a 50-order test at 30/hr on the always-on Mac using a persistent logged-in browser session (not fresh login each run). At this rate and IP profile, detection risk is very low. Skips already-processed sessions via `StylistDetail:` marker in notes.

Also built Test Mode this session — a fully isolated demo environment for portfolio screenshots. Uses three separate Turso tables (TestClient, TestServiceSession, TestFormula) seeded with 10 realistic fake clients and 40 sessions. A cookie-based toggle (`test_mode=1`) switches the entire dashboard to read from test data. The UI shows a small amber TEST badge and hides all write actions (no Edit, Repeat, Add Photos). The avatar menu is the toggle point — tap your profile photo → "Enter test mode" / "Exit test mode".

## Feature Parking Lot
- **2026-03-29** — Before/after photo comparison sliders *(from brief)*
- **2026-03-29** — 3-angle capture protocol (front, crown, nape) *(from brief)*
- **2026-03-29** — Formula rebalancing calculator (auto-adjust when quantities change) *(from brief)*
- **2026-03-29** — Dynamic scaling for multi-shade formulas by percentage *(from brief)*
- **2026-03-29** — Offline-first with background sync *(from brief)*
- **2026-03-29** — Developer auto-validation based on level shifts *(from brief)*
- **2026-03-29** — Predictive formula adjustments from seasonal patterns *(from brief)*
- **2026-03-29** — Inventory integration with auto-reorder *(from brief)*
- **2026-03-29** — Search/filter across all sessions and formulas *(Claude)*
- **2026-03-29** — Duplicate previous session as starting point for new visit *(Claude)*
- **2026-03-31** — Duplicate client review page: detect potential duplicates (same name/phone/email) from Boulevard import, let user view both side-by-side and choose to merge or keep separate *(Kevin/Claude)*
