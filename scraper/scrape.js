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
const DAYS_BACK = process.env.DAYS_BACK ? parseInt(process.env.DAYS_BACK) : null;
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

    // Step 3: Scrape each client (SKIP_CLIENTS + MAX_CLIENTS for batching)
    const skipClients = parseInt(process.env.SKIP_CLIENTS) || 0;
    const maxClients = parseInt(process.env.MAX_CLIENTS) || clientLinks.length;
    const toScrape = clientLinks.slice(skipClients, skipClients + maxClients);
    console.log(`   Scraping clients ${skipClients + 1}-${skipClients + toScrape.length} of ${clientLinks.length}\n`);
    const allData = [];
    for (let i = 0; i < toScrape.length; i++) {
      const clientUrl = toScrape[i];
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

        // Save incrementally
        writeFileSync(DATA_FILE, JSON.stringify(allData, null, 2));

        // Push this client to STYLED immediately
        if (!DRY_RUN && STYLED_SCRAPER_KEY) {
          try {
            await pushToStyled([clientData]);
            console.log(`   📤 Pushed to STYLED`);
          } catch (pushErr) {
            console.log(`   ⚠️  Push failed: ${pushErr.message}`);
          }
        }
      } catch (err) {
        console.log(`   ❌ Failed: ${err.message}`);
        writeFileSync(DATA_FILE, JSON.stringify(allData, null, 2));
      }

      // Be polite — don't hammer the server
      await page.waitForTimeout(1000);
    }

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
  await page.waitForTimeout(3000);

  // Step 1: Click "Add filter"
  console.log("   Step 1: Click Add filter...");
  await page.click('text="Add filter"');
  await page.waitForTimeout(1500);

  // Step 2: Click "Provider" in the filter menu
  console.log("   Step 2: Click Provider...");
  await page.click('text="Provider"');
  await page.waitForTimeout(1500);

  // Step 3: Click the "Select provider" dropdown to open it
  console.log("   Step 3: Open provider dropdown...");
  await page.click('text="Select provider"');
  await page.waitForTimeout(1000);

  // Step 4: Type in the search box to find the provider
  console.log(`   Step 4: Searching for ${BLVD_PROVIDER}...`);
  const searchInput = page.locator('input[placeholder*="Search provider"]');
  await searchInput.fill(BLVD_PROVIDER.split(" ")[0]); // Search by first name "Meg"
  await page.waitForTimeout(1500);

  // Step 5: Click the li[role="menuitem"] that contains the provider name
  console.log("   Step 5: Clicking provider checkbox...");
  await page.locator(`li[role="menuitem"]:has-text("${BLVD_PROVIDER.split(" ").pop()}")`).first().click({ timeout: 10000 });
  await page.waitForTimeout(1000);

  // Step 6: Close the dropdown by pressing Escape
  console.log("   Step 6: Closing dropdown...");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000);

  // Step 7: Click Apply (should now be enabled and not blocked)
  console.log("   Step 7: Clicking Apply...");
  await page.locator('button:has-text("Apply"):not([disabled])').click({ timeout: 10000 });
  await page.waitForTimeout(3000);

  // Check how many clients matched
  const countText = await page.textContent("body");
  const countMatch = countText?.match(/(\d+)\s*clients?\s*match/i);
  if (countMatch) {
    console.log(`   ✅ Filter shows: ${countMatch[0]}`);
  }

  // Collect clients (name + UUID) from ALL pages of the filtered table
  // Boulevard uses MUI TablePagination: "Rows per page: 50 | 1-50 of 156 | < >"
  // UUIDs are embedded in React fiber props.key on each table row — no need to
  // search each client individually (saves ~10 min)
  const clientEntries = [];
  let currentPage = 1;

  while (true) {
    // Scroll through current page to collect all visible rows
    let previousCount = 0;
    let staleRounds = 0;

    while (staleRounds < 3) {
      const rows = await page.evaluate(() => {
        const rows = document.querySelectorAll("tr.MuiTableRow-hover");
        return [...rows].map((row) => {
          const cells = row.querySelectorAll("td");
          const nameCell = cells[0]?.textContent?.trim().replace(/^[A-Z]/, (m) => m) || "";
          const name = nameCell.replace(/^[A-Z](?=[A-Z])/, "").trim();
          const phone = cells[2]?.textContent?.trim() || "";
          const email = cells[3]?.textContent?.trim() || "";

          // Extract UUID from React fiber props.key
          let uuid = null;
          const fiberKey = Object.keys(row).find((k) => k.startsWith("__reactFiber$"));
          if (fiberKey) {
            let fiber = row[fiberKey];
            for (let i = 0; i < 20; i++) {
              if (!fiber) break;
              try {
                const key = fiber.memoizedProps?.key;
                if (typeof key === "string" && key.match(/^[a-f0-9]{8}-[a-f0-9]{4}-/)) {
                  uuid = key;
                  break;
                }
              } catch (e) {}
              fiber = fiber.return;
            }
          }

          return { name, phone, email, uuid };
        });
      });

      // Dedup by UUID (primary) or name+phone+email combo (fallback)
      for (const r of rows) {
        if (!r.name) continue;
        const isDupe = r.uuid
          ? clientEntries.find((c) => c.uuid === r.uuid)
          : clientEntries.find((c) => c.name === r.name && c.phone === r.phone && c.email === r.email);
        if (!isDupe) {
          clientEntries.push(r);
        }
      }

      if (clientEntries.length === previousCount) {
        staleRounds++;
      } else {
        staleRounds = 0;
      }
      previousCount = clientEntries.length;

      // Scroll the page container to load more rows (virtual scroll)
      await page.evaluate(() => {
        const table = document.querySelector("table");
        let scrollParent = table?.parentElement;
        while (scrollParent && scrollParent.scrollHeight <= scrollParent.clientHeight) {
          scrollParent = scrollParent.parentElement;
        }
        if (scrollParent) scrollParent.scrollTop += 800;
        else window.scrollBy(0, 800);
      });
      await page.waitForTimeout(1500);
    }

    const withUuid = clientEntries.filter((c) => c.uuid).length;
    console.log(`   ✅ Page ${currentPage}: ${clientEntries.length} clients (${withUuid} with UUID)`);

    // Check if there's a next page
    const nextBtn = page.locator('button[aria-label="Go to next page"]');
    const isDisabled = await nextBtn.evaluate((el) => el.disabled).catch(() => true);

    if (isDisabled) {
      console.log(`   ✅ No more pages — collected all ${clientEntries.length} clients`);
      break;
    }

    // Click next page and wait for table to reload
    console.log(`   📄 Going to page ${currentPage + 1}...`);
    await nextBtn.click();
    await page.waitForTimeout(3000);

    // Scroll back to top of table for the new page
    await page.evaluate(() => {
      const table = document.querySelector("table");
      let scrollParent = table?.parentElement;
      while (scrollParent && scrollParent.scrollHeight <= scrollParent.clientHeight) {
        scrollParent = scrollParent.parentElement;
      }
      if (scrollParent) scrollParent.scrollTop = 0;
      else window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);

    currentPage++;
  }

  // Build client URLs — use UUID from fiber, fall back to search if missing
  const clientLinks = [];
  const needsSearch = [];

  for (const entry of clientEntries) {
    if (entry.uuid) {
      clientLinks.push(`https://dashboard.boulevard.io/clients/${entry.uuid}`);
    } else {
      needsSearch.push(entry);
    }
  }

  console.log(`   ✅ ${clientLinks.length} clients resolved via React fiber`);

  // Fallback: search for any clients missing UUIDs
  if (needsSearch.length > 0) {
    console.log(`   🔍 Searching for ${needsSearch.length} clients without UUIDs...`);
    for (const { name } of needsSearch) {
      console.log(`   🔍 Looking up: ${name}`);
      try {
        await page.goto("https://dashboard.boulevard.io/clients", { timeout: 30000, waitUntil: "domcontentloaded" });
      } catch {
        await page.goto("https://dashboard.boulevard.io/clients", { timeout: 30000, waitUntil: "domcontentloaded" });
      }
      await page.waitForTimeout(2000);

      const searchInput = page.locator('input[placeholder*="Search for a name"]');
      await searchInput.fill(name);
      await page.waitForTimeout(2000);

      const firstRow = page.locator("tr.MuiTableRow-hover").first();
      if ((await firstRow.count()) > 0) {
        await firstRow.click();
        await page.waitForTimeout(1000);
        const match = page.url().match(/\/clients\/([a-f0-9-]{36})/);
        if (match) {
          clientLinks.push(`https://dashboard.boulevard.io/clients/${match[1]}`);
        }
      }
    }
  }

  console.log(`   ✅ Total: ${clientLinks.length} client URLs ready`);
  return clientLinks;
}

// ============================================
// SCRAPE INDIVIDUAL CLIENT
// ============================================
async function scrapeClient(page, clientUrl) {
  // Overview tab — contact info
  try {
    await page.goto(clientUrl, { timeout: 30000, waitUntil: "domcontentloaded" });
  } catch {
    await page.goto(clientUrl, { timeout: 30000, waitUntil: "domcontentloaded" });
  }
  // Wait for the client profile panel to load (tabs appear)
  await page.locator('[role="tab"]:has-text("History")').waitFor({ timeout: 20000 });
  await page.waitForTimeout(1000);

  const contactInfo = await page.evaluate(() => {
    // Boulevard uses name attributes on inputs: name.first, name.last, email.personal, phone.mobile
    const getInput = (name) => {
      const el = document.querySelector(`input[name="${name}"]`);
      return el?.value?.trim() || "";
    };

    const firstName = getInput("name.first");
    const lastName = getInput("name.last");
    const email = getInput("email.personal");
    const phone = getInput("phone.mobile");

    // Fallback: try header for name if inputs are empty
    if (!firstName && !lastName) {
      const nameEl = document.querySelector("h1") || document.querySelector('[class*="client-name"]');
      const name = nameEl?.textContent?.trim()?.replace(/📍.*/, "").trim() || "";
      const parts = name.split(" ");
      return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email,
        phone,
        clientNotes: null,
        stats: {},
      };
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
  await page.locator('[role="tab"]:has-text("History")').click();
  await page.waitForTimeout(2000);

  // Scroll down to ensure Order History table is loaded/visible
  await page.evaluate(() => {
    const panel = document.querySelector('[class*="Client Profile"]')?.closest('[class*="scroll"]')
      || document.querySelector('[role="tab"][aria-selected="true"]')?.closest('[class*="scroll"]')
      || document.querySelector('.client-profile')
      || document.scrollingElement;
    if (panel) {
      panel.scrollTop = panel.scrollHeight;
    }
    window.scrollBy(0, 5000);
  });
  await page.waitForTimeout(1500);

  const historyData = await page.evaluate(({ providerName, daysBack }) => {
    const appointments = [];
    const orders = [];
    const cutoff = daysBack ? new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000) : null;

    // Find the Appointment History table (has headers: Date, Location, Services, Staff, Status)
    const tables = document.querySelectorAll("table");
    let apptTable = null;
    let orderTable = null;

    for (const table of tables) {
      const headers = [...table.querySelectorAll("th")].map(th => th.textContent?.trim()).join(",");
      if (headers.includes("Services") && headers.includes("Staff")) {
        apptTable = table;
      } else if (headers.includes("Order") && headers.includes("Total Sale")) {
        orderTable = table;
      }
    }

    // Parse appointment history
    if (apptTable) {
      const rows = apptTable.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 5) return; // Skip separator rows

        // Staff is in an avatar element with aria-label
        const staffAvatar = cells[3]?.querySelector("[aria-label]");
        const staffName = staffAvatar?.getAttribute("aria-label") || "";
        const staffInitials = staffAvatar?.getAttribute("initials") || cells[3]?.textContent?.trim() || "";

        const dateStr = cells[0]?.textContent?.trim() || "";
        if (cutoff && new Date(dateStr) < cutoff) return;
        appointments.push({
          date: dateStr,
          location: cells[1]?.textContent?.trim() || "",
          services: cells[2]?.textContent?.trim() || "",
          staff: staffName || staffInitials,
          status: cells[4]?.textContent?.trim() || "",
          isProvider: staffName.toLowerCase().includes(providerName.split(" ")[0].toLowerCase()),
        });
      });
    }

    // Parse order history
    if (orderTable) {
      const rows = orderTable.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 5) return;

        const orderDateStr = cells[0]?.textContent?.trim() || "";
        if (cutoff && new Date(orderDateStr) < cutoff) return;
        orders.push({
          date: orderDateStr,
          location: cells[1]?.textContent?.trim() || "",
          orderNumber: cells[2]?.textContent?.trim() || "",
          totalSaleText: cells[3]?.textContent?.trim() || "",
          status: cells[4]?.textContent?.trim() || "",
          refundAmount: cells[5]?.textContent?.trim() || "",
          orderUrl: null,
        });
      });
    }

    return { appointments, orders };
  }, { providerName: BLVD_PROVIDER, daysBack: DAYS_BACK });

  // Click through each order to get gratuity
  const gratuities = [];
  const numOrders = historyData.orders.length;
  for (let i = 0; i < numOrders; i++) {
    try {
      // Re-find buttons each iteration (DOM may re-render)
      const orderBtns = await page.locator('[ng-click*="viewOrder"]').all();
      if (i >= orderBtns.length) { gratuities.push(null); continue; }

      await orderBtns[i].click();
      await page.waitForURL("**/sales/order/**", { timeout: 10000 });
      await page.waitForTimeout(1000);

      const gratuity = await page.evaluate(() => {
        const lines = document.body.innerText.split("\n").map(l => l.trim()).filter(Boolean);
        const gIdx = lines.findIndex(l => l.startsWith("Gratuity"));
        if (gIdx < 0) return null;
        for (let j = gIdx; j < Math.min(gIdx + 4, lines.length); j++) {
          const m = lines[j].match(/\$([\d,.]+)/);
          if (m) return parseFloat(m[1].replace(/,/g, ""));
        }
        return null;
      });
      gratuities.push(gratuity);

      await page.goBack({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await page.locator('[role="tab"]:has-text("History")').click();
      await page.waitForTimeout(2000);
      await page.evaluate(() => window.scrollBy(0, 5000));
      await page.waitForTimeout(1000);
    } catch (err) {
      console.log(`   ⚠️  Gratuity fetch failed for order ${i}: ${err.message}`);
      gratuities.push(null);
      // Try to recover back to client History tab
      try {
        await page.goto(clientUrl, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1500);
        await page.locator('[role="tab"]:has-text("History")').click();
        await page.waitForTimeout(2000);
        await page.evaluate(() => window.scrollBy(0, 5000));
        await page.waitForTimeout(1000);
      } catch {}
    }
  }

  // Add parsed totalSale + gratuity to orders
  const detailedOrders = historyData.orders.map((order, i) => ({
    ...order,
    totalSale: parseFloat(order.totalSaleText?.replace(/[$,]/g, "")) || 0,
    gratuity: gratuities[i] ?? null,
  }));

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
