/**
 * backfill-order-details.js
 *
 * Visits each Boulevard order page and captures:
 *   - Which stylist performed each service
 *   - Per-stylist gratuity
 *   - Order UUID (for future direct linking)
 *
 * Runs at a human-like pace (~30–50 orders/hour) to avoid detection.
 * Safe to stop and re-run — already-updated sessions are skipped.
 *
 * Usage:
 *   ORDERS_PER_HOUR=40 node scraper/backfill-order-details.js
 *
 * Parsing approach validated via Chrome MCP on 3 real orders (2026-03-31):
 *   - Boulevard renders order line items as <TR> elements
 *   - Service rows: "Service Name with Stylist Name  $X.XX"
 *   - Gratuity rows: "Gratuity (X%) for Stylist Name  $X.XX"
 *   - Total row: "Total  $X.XX"
 *   - DOM splits "with"/"for" + stylist name onto separate lines in innerText,
 *     so we join lines ending with " with" or matching /Gratuity.*for$/
 */

import { createClient } from "@libsql/client";
import { chromium } from "playwright";
import { readFileSync, existsSync } from "fs";

if (existsSync(".env")) {
  readFileSync(".env", "utf-8").split("\n").filter(l => l && !l.startsWith("#")).forEach(l => {
    const [k, ...v] = l.split("="); process.env[k.trim()] = v.join("=").trim();
  });
}

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const ORDERS_PER_HOUR = parseInt(process.env.ORDERS_PER_HOUR || "40");
const BLVD_EMAIL = process.env.BLVD_EMAIL;
const BLVD_PASSWORD = process.env.BLVD_PASSWORD;

// Min/max delay between orders in ms (randomized for human feel)
const BASE_DELAY_MS = Math.round((3600 * 1000) / ORDERS_PER_HOUR);
const MIN_DELAY = Math.round(BASE_DELAY_MS * 0.7);
const MAX_DELAY = Math.round(BASE_DELAY_MS * 1.3);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function randomDelay() {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

/**
 * Parse order detail page using TR-based approach.
 * Validated on real Boulevard orders 2026-03-31.
 */
async function parseOrderPage(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr"));
    const services = [];
    const gratuities = [];

    rows.forEach(row => {
      const text = row.innerText?.replace(/\s+/g, " ").trim();
      if (!text || !text.match(/\$[\d,.]+/)) return;

      const svcMatch = text.match(/^(.+?) with (.+?)\s+\$([\d,.]+)/);
      if (svcMatch && !text.startsWith("Gratuity")) {
        services.push({
          service: svcMatch[1].trim(),
          stylist: svcMatch[2].trim(),
          price: parseFloat(svcMatch[3].replace(/,/g, "")),
        });
        return;
      }
      const gratMatch = text.match(/^Gratuity[^f]*for (.+?)\s+\$([\d,.]+)/);
      if (gratMatch) {
        gratuities.push({
          stylist: gratMatch[1].trim(),
          amount: parseFloat(gratMatch[2].replace(/,/g, "")),
        });
      }
    });

    // Total
    const allLeafs = Array.from(document.querySelectorAll("*")).filter(e => e.children.length === 0);
    const totalEl = allLeafs.find(e => e.textContent.trim() === "Total");
    const totalRow = totalEl?.closest("tr") || totalEl?.parentElement;
    const totalText = totalRow?.innerText?.replace(/\s+/g, " ").trim();
    const totalMatch = totalText?.match(/Total\s+\$([\d,.]+)/);
    const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null;

    const uuid = window.location.pathname.split("/").pop();

    return { uuid, services, gratuities, total };
  });
}

async function main() {
  console.log(`\n🔍 Backfill Order Details — ${ORDERS_PER_HOUR} orders/hr (~${Math.round(BASE_DELAY_MS/1000)}s avg between orders)\n`);

  // Get all sessions with an order number, grouped by client
  const result = await db.execute(`
    SELECT
      s.id as sessionId,
      s.notes,
      c.id as clientId,
      c.name as clientName,
      c.blvdId
    FROM ServiceSession s
    JOIN Client c ON c.id = s.clientId
    WHERE s.notes LIKE '%Order #%'
      AND c.blvdId IS NOT NULL
    ORDER BY s.date DESC
  `);

  const sessions = result.rows;
  console.log(`📋 Found ${sessions.length} sessions with order numbers\n`);

  // Filter to sessions that haven't had per-stylist data captured yet
  // We'll use a marker "StylistDetail:" in notes to track which are done
  const todo = sessions.filter(s => !s.notes?.includes("StylistDetail:"));
  console.log(`⏭  ${sessions.length - todo.length} already processed, ${todo.length} remaining\n`);

  if (todo.length === 0) {
    console.log("✅ All done!");
    return;
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  // Login
  console.log("🔐 Logging in to Boulevard...");
  await page.goto("https://dashboard.boulevard.io/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', BLVD_EMAIL);
  await page.fill('input[type="password"]', BLVD_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard.boulevard.io/**", { timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log("✅ Logged in\n");

  let processed = 0;
  let errors = 0;

  for (const session of todo) {
    const orderMatch = session.notes?.match(/Order #(\d+)/);
    if (!orderMatch) continue;
    const orderNumber = orderMatch[1];

    try {
      // Navigate to client's orders page
      const ordersUrl = `https://dashboard.boulevard.io/sales/orders?clientId=${session.blvdId}`;
      await page.goto(ordersUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500 + Math.random() * 1000);

      // Find and click the matching order row
      const orderRows = await page.locator("tr[ng-click*='onOrderClick']").all();
      let found = false;

      for (const row of orderRows) {
        const text = await row.innerText();
        if (text.includes(`#${orderNumber}`)) {
          await row.click();
          await page.waitForURL("**/sales/order/**", { timeout: 10000 });
          await page.waitForTimeout(2000 + Math.random() * 1000);
          found = true;
          break;
        }
      }

      if (!found) {
        console.log(`  ⚠️  Order #${orderNumber} not found for ${session.clientName}`);
        errors++;
        continue;
      }

      const data = await parseOrderPage(page);

      if (!data.services.length) {
        console.log(`  ⚠️  No services parsed for Order #${orderNumber} (${session.clientName})`);
        errors++;
        continue;
      }

      // Build the stylist detail line to append to notes
      // Format: "StylistDetail: ServiceName=StylistName, ..."
      const detailParts = data.services.map(s => `${s.service}=${s.stylist}`);
      const gratParts = data.gratuities.map(g => `Grat:${g.stylist}=$${g.amount.toFixed(2)}`);
      const detailLine = `StylistDetail: ${[...detailParts, ...gratParts].join(" | ")}`;
      const uuidLine = `OrderUUID: ${data.uuid}`;

      // Append to existing notes
      const updatedNotes = [session.notes?.trim(), uuidLine, detailLine].filter(Boolean).join("\n");

      await db.execute({
        sql: "UPDATE ServiceSession SET notes = ? WHERE id = ?",
        args: [updatedNotes, session.sessionId],
      });

      processed++;
      const eta = Math.round((todo.length - processed) * (BASE_DELAY_MS / 1000) / 60);
      console.log(`  ✅ [${processed}/${todo.length}] Order #${orderNumber} — ${session.clientName}: ${detailParts.join(", ")} (ETA ~${eta}min)`);

    } catch (err) {
      console.log(`  ❌ Error on Order #${orderNumber} (${session.clientName}): ${err.message}`);
      errors++;
    }

    // Human-like delay between orders
    const delay = randomDelay();
    console.log(`  ⏳ Waiting ${Math.round(delay/1000)}s...\n`);
    await sleep(delay);
  }

  await browser.close();
  console.log(`\n🏁 Done! ${processed} updated, ${errors} errors`);
}

main().catch(console.error);
