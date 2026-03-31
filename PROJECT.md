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
v0.2.0

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
