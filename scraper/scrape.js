import { chromium } from "playwright";
import { readFileSync, writeFileSync, existsSync } from "fs";

// Load .env manually (no extra deps)
if (existsSync(".env")) {
  readFileSync(".env", "utf-8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .forEach((l) => {
      const [k, ...v] = l.split("=");
      process.env[k.trim()] = v.join("=").trim();
    });
}

const BLVD_EMAIL = process.env.BLVD_EMAIL;
const BLVD_PASSWORD = process.env.BLVD_PASSWORD;
const BLVD_PROVIDER = process.env.BLVD_PROVIDER || "Meg Auerbach";
const STYLED_API_URL = process.env.STYLED_API_URL || "https://styled.megandkev.co";
const STYLED_SCRAPER_KEY = process.env.STYLED_SCRAPER_KEY;
const DRY_RUN = process.env.DRY_RUN === "true";
const DATA_FILE = "scraped-data.json";

if (!BLVD_EMAIL || !BLVD_PASSWORD) {
  console.error("Missing BLVD_EMAIL or BLVD_PASSWORD in .env");
  process.exit(1);
}

async function main() {
  console.log(`\n🎨 STYLED Boulevard Scraper`);
  console.log(`   Provider: ${BLVD_PROVIDER}`);
  console.log(`   Dry run: ${DRY_RUN}`);
  console.log(`   Target: ${STYLED_API_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log("🔐 Logging in to Boulevard...");
    await login(page);

    // Step 2: Navigate to clients and filter by provider
    console.log(`👥 Filtering clients by provider: ${BLVD_PROVIDER}...`);
    const clientLinks = await getFilteredClients(page);
    console.log(`   Found ${clientLinks.length} clients\n`);

    // Step 3: Scrape each client
    const allData = [];
    for (let i = 0; i < clientLinks.length; i++) {
      const clientUrl = clientLinks[i];
      const clientId = clientUrl.split("/").pop();
      console.log(
        `📋 [${i + 1}/${clientLinks.length}] Scraping client ${clientId}...`
      );

      try {
        const clientData = await scrapeClient(page, clientUrl);
        allData.push(clientData);
        console.log(
          `   ✅ ${clientData.name} — ${clientData.appointments.length} appointments, ${clientData.orders.length} orders`
        );
      } catch (err) {
        console.log(`   ❌ Failed: ${err.message}`);
      }

      // Be polite — don't hammer the server
      await page.waitForTimeout(1000);
    }

    // Step 4: Save data
    writeFileSync(DATA_FILE, JSON.stringify(allData, null, 2));
    console.log(`\n💾 Saved ${allData.length} clients to ${DATA_FILE}`);

    // Step 5: Push to STYLED (unless dry run)
    if (!DRY_RUN && STYLED_SCRAPER_KEY) {
      console.log(`\n🚀 Pushing data to STYLED...`);
      await pushToStyled(allData);
    } else if (DRY_RUN) {
      console.log(`\n🏃 Dry run — skipping push to STYLED`);
    } else {
      console.log(`\n⚠️  No STYLED_SCRAPER_KEY set — skipping push`);
    }

    // Summary
    const totalAppts = allData.reduce(
      (sum, c) => sum + c.appointments.length,
      0
    );
    const totalOrders = allData.reduce((sum, c) => sum + c.orders.length, 0);
    const totalRevenue = allData.reduce(
      (sum, c) =>
        sum + c.orders.reduce((s, o) => s + (o.totalSale || 0), 0),
      0
    );
    console.log(`\n📊 Summary:`);
    console.log(`   Clients: ${allData.length}`);
    console.log(`   Appointments: ${totalAppts}`);
    console.log(`   Orders: ${totalOrders}`);
    console.log(`   Total revenue: $${totalRevenue.toFixed(2)}`);
  } finally {
    await browser.close();
  }
}

// ============================================
// LOGIN
// ============================================
async function login(page) {
  await page.goto("https://dashboard.boulevard.io/login");
  await page.waitForLoadState("networkidle");

  // Fill email
  await page.fill('input[type="email"], input[name="email"]', BLVD_EMAIL);
  // Click continue/next
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Fill password
  await page.fill(
    'input[type="password"], input[name="password"]',
    BLVD_PASSWORD
  );
  // Click sign in
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForURL("**/home", { timeout: 15000 });
  console.log("   ✅ Logged in successfully");
}

// ============================================
// GET FILTERED CLIENT LIST
// ============================================
async function getFilteredClients(page) {
  await page.goto("https://dashboard.boulevard.io/clients");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Click "Add filter"
  await page.click('text="Add filter"');
  await page.waitForTimeout(500);

  // Click "Provider"
  await page.click('text="Provider"');
  await page.waitForTimeout(500);

  // Select the provider name
  await page.click(`text="${BLVD_PROVIDER}"`);
  await page.waitForTimeout(500);

  // Click Apply
  await page.click('text="Apply"');
  await page.waitForTimeout(2000);

  // Collect all client links by scrolling through the list
  const clientLinks = new Set();
  let previousSize = 0;
  let scrollAttempts = 0;

  while (scrollAttempts < 50) {
    // Grab visible client links
    const links = await page.$$eval(
      'a[href*="/clients/"]',
      (els) =>
        els
          .map((el) => el.href)
          .filter((href) => href.match(/\/clients\/[a-f0-9-]{36}$/))
    );

    links.forEach((l) => clientLinks.add(l));

    if (clientLinks.size === previousSize) {
      scrollAttempts++;
      if (scrollAttempts > 3) break;
    } else {
      scrollAttempts = 0;
    }

    previousSize = clientLinks.size;

    // Scroll down to load more
    await page.evaluate(() => {
      const list = document.querySelector('[class*="client"]')?.closest('[class*="scroll"]')
        || document.querySelector('table')?.parentElement
        || document.scrollingElement;
      if (list) list.scrollTop += 500;
    });
    await page.waitForTimeout(1000);
  }

  // If no links found via href, try clicking each row and grabbing the URL
  if (clientLinks.size === 0) {
    console.log("   Trying alternative: scraping client IDs from rows...");
    const rows = await page.$$('tr[class*="client"], div[class*="client-row"]');
    for (const row of rows) {
      await row.click();
      await page.waitForTimeout(500);
      const url = page.url();
      if (url.includes("/clients/")) {
        clientLinks.add(url);
      }
      await page.goBack();
      await page.waitForTimeout(500);
    }
  }

  return [...clientLinks];
}

// ============================================
// SCRAPE INDIVIDUAL CLIENT
// ============================================
async function scrapeClient(page, clientUrl) {
  // Overview tab — contact info
  await page.goto(clientUrl);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  const contactInfo = await page.evaluate(() => {
    const getText = (label) => {
      const el = [...document.querySelectorAll("label, span, div")].find(
        (e) => e.textContent?.trim() === label
      );
      if (el) {
        const next = el.nextElementSibling || el.parentElement?.nextElementSibling;
        return next?.textContent?.trim() || null;
      }
      return null;
    };

    // Try to grab name from the header
    const nameEl =
      document.querySelector("h1") ||
      document.querySelector('[class*="client-name"]');
    const name = nameEl?.textContent?.trim()?.replace(/📍.*/, "").trim() || "";

    // Contact info from the right sidebar
    const inputs = document.querySelectorAll("input");
    let firstName = "",
      lastName = "",
      email = "",
      phone = "";

    inputs.forEach((input) => {
      const label =
        input.getAttribute("aria-label") ||
        input.previousElementSibling?.textContent?.trim() ||
        "";
      const val = input.value || "";
      if (label.includes("First")) firstName = val;
      if (label.includes("Last")) lastName = val;
      if (label.includes("Email") || input.type === "email") email = val;
      if (label.includes("Mobile") || input.type === "tel") phone = val;
    });

    // Fallback: try text content
    if (!firstName && !lastName && name) {
      const parts = name.split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    // Stats
    const stats = {};
    document.querySelectorAll('[class*="stat"], [class*="metric"]').forEach((el) => {
      const text = el.textContent?.trim();
      if (text?.includes("APPOINTMENT")) stats.appointments = text;
      if (text?.includes("SHOW RATE")) stats.showRate = text;
      if (text?.includes("REVISIT")) stats.avgRevisit = text;
      if (text?.includes("VISIT VALUE")) stats.avgVisitValue = text;
    });

    // Client notes
    const noteEl = document.querySelector(
      'textarea[placeholder*="note"], div[class*="note"]'
    );
    const clientNotes = noteEl?.value || noteEl?.textContent?.trim() || null;

    return {
      firstName,
      lastName,
      email,
      phone,
      clientNotes,
      stats,
    };
  });

  const clientName =
    `${contactInfo.firstName} ${contactInfo.lastName}`.trim() ||
    "Unknown Client";

  // History tab — appointments and orders
  await page.click('text="HISTORY"');
  await page.waitForTimeout(2000);

  const historyData = await page.evaluate(() => {
    const appointments = [];
    const orders = [];

    // Parse appointment history table
    const apptRows = document.querySelectorAll("table:first-of-type tbody tr");
    apptRows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 4) {
        appointments.push({
          date: cells[0]?.textContent?.trim() || "",
          location: cells[1]?.textContent?.trim() || "",
          services: cells[2]?.textContent?.trim() || "",
          staff: cells[3]?.textContent?.trim() || "",
          status: cells[4]?.textContent?.trim() || "",
        });
      }
    });

    // Parse order history table
    const tables = document.querySelectorAll("table");
    if (tables.length > 1) {
      const orderRows = tables[1].querySelectorAll("tbody tr");
      orderRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 4) {
          // Find the order link
          const link = row.querySelector('a[href*="/sales/order/"]');
          orders.push({
            date: cells[0]?.textContent?.trim() || "",
            location: cells[1]?.textContent?.trim() || "",
            orderNumber: cells[2]?.textContent?.trim() || "",
            totalSaleText: cells[3]?.textContent?.trim() || "",
            status: cells[4]?.textContent?.trim() || "",
            refundAmount: cells[5]?.textContent?.trim() || "",
            orderUrl: link?.href || null,
          });
        }
      });
    }

    return { appointments, orders };
  });

  // Scrape order details for each order
  const detailedOrders = [];
  for (const order of historyData.orders) {
    if (order.orderUrl) {
      try {
        const orderDetail = await scrapeOrderDetail(page, order.orderUrl);
        detailedOrders.push({
          ...order,
          ...orderDetail,
          totalSale: parseFloat(order.totalSaleText?.replace(/[$,]/g, "")) || 0,
        });
      } catch (err) {
        detailedOrders.push({
          ...order,
          totalSale: parseFloat(order.totalSaleText?.replace(/[$,]/g, "")) || 0,
          error: err.message,
        });
      }
      await page.waitForTimeout(500);
    }
  }

  return {
    name: clientName,
    ...contactInfo,
    blvdUrl: clientUrl,
    blvdId: clientUrl.split("/").pop(),
    appointments: historyData.appointments,
    orders: detailedOrders,
    scrapedAt: new Date().toISOString(),
  };
}

// ============================================
// SCRAPE ORDER DETAIL
// ============================================
async function scrapeOrderDetail(page, orderUrl) {
  await page.goto(orderUrl);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  return await page.evaluate(() => {
    const services = [];
    let gratuity = null;
    let total = null;
    let paymentMethod = null;
    let dateTime = null;

    // Parse the order header for date/time
    const headerEl = document.querySelector('[class*="header"], [class*="order-date"]');
    if (headerEl) {
      const text = headerEl.textContent || "";
      const dateMatch = text.match(
        /\w+ \w+ \d+, \d{4} \d+:\d+ [AP]M/
      );
      if (dateMatch) dateTime = dateMatch[0];
    }

    // Also check top-right area for date
    const allText = document.body.textContent || "";
    const dateMatch2 = allText.match(
      /(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d+, \d{4} \d+:\d+ [AP]M/
    );
    if (dateMatch2) dateTime = dateMatch2[0];

    // Parse service line items
    const lineItems = document.querySelectorAll(
      '[class*="line-item"], [class*="order-item"]'
    );
    lineItems.forEach((item) => {
      const text = item.textContent?.trim() || "";
      const priceMatch = text.match(/\$[\d,.]+/);
      const price = priceMatch
        ? parseFloat(priceMatch[0].replace(/[$,]/g, ""))
        : 0;

      if (text.toLowerCase().includes("gratuity")) {
        gratuity = price;
      } else if (price > 0) {
        services.push({ description: text, price });
      }
    });

    // Fallback: parse from all elements with prices
    if (services.length === 0) {
      const allEls = document.querySelectorAll("div, span, p");
      allEls.forEach((el) => {
        const text = el.textContent?.trim() || "";
        if (
          text.includes("with Meg") &&
          text.includes("$")
        ) {
          const priceMatch = text.match(/\$[\d,.]+/);
          if (priceMatch) {
            const desc = text.replace(/\$[\d,.]+/, "").trim();
            services.push({
              description: desc,
              price: parseFloat(priceMatch[0].replace(/[$,]/g, "")),
            });
          }
        }
      });
    }

    // Parse total
    const totalMatch = allText.match(/Total\s*\$?([\d,.]+)/);
    if (totalMatch) total = parseFloat(totalMatch[1].replace(/,/g, ""));

    // Parse payment method
    const paymentEl = [...document.querySelectorAll("div, span")].find(
      (el) =>
        el.textContent?.includes("Visa") ||
        el.textContent?.includes("Mastercard") ||
        el.textContent?.includes("Amex") ||
        el.textContent?.includes("Cash") ||
        el.textContent?.includes("Discover")
    );
    if (paymentEl) {
      paymentMethod = paymentEl.textContent?.trim();
    }

    return {
      services,
      gratuity,
      total,
      paymentMethod,
      dateTime,
    };
  });
}

// ============================================
// PUSH TO STYLED API
// ============================================
async function pushToStyled(data) {
  const res = await fetch(`${STYLED_API_URL}/api/import/boulevard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STYLED_SCRAPER_KEY}`,
    },
    body: JSON.stringify({ clients: data }),
  });

  if (res.ok) {
    const result = await res.json();
    console.log(`   ✅ Pushed ${result.imported} clients to STYLED`);
  } else {
    console.log(`   ❌ Failed to push: ${res.status} ${res.statusText}`);
  }
}

// ============================================
// RUN
// ============================================
main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
