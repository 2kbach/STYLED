import { chromium } from "playwright";
import { readFileSync, existsSync } from "fs";

// Load .env
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
const STYLED_API_URL = process.env.STYLED_API_URL || "https://styled.megandkev.co";
const STYLED_SCRAPER_KEY = process.env.STYLED_SCRAPER_KEY;
const DRY_RUN = process.env.DRY_RUN === "true";

if (!BLVD_EMAIL || !BLVD_PASSWORD) {
  console.error("Missing BLVD_EMAIL or BLVD_PASSWORD in .env");
  process.exit(1);
}

async function main() {
  console.log(`\n🎨 STYLED — Backfill Contact Info`);
  console.log(`   Dry run: ${DRY_RUN}`);
  console.log(`   Target: ${STYLED_API_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Login
    console.log("🔐 Logging in to Boulevard...");
    await page.goto("https://dashboard.boulevard.io/login");
    await page.waitForLoadState("networkidle");
    await page.fill('input[type="email"], input[name="email"]', BLVD_EMAIL);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await page.fill('input[type="password"], input[name="password"]', BLVD_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/home", { timeout: 15000 });
    console.log("   ✅ Logged in\n");

    // Navigate to clients, apply Meg filter, collect all UUIDs from React fiber
    console.log("👥 Collecting client UUIDs...");
    await page.goto("https://dashboard.boulevard.io/clients");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Apply provider filter
    await page.click('text="Add filter"');
    await page.waitForTimeout(1500);
    await page.click('text="Provider"');
    await page.waitForTimeout(1500);
    await page.click('text="Select provider"');
    await page.waitForTimeout(1000);
    const searchInput = page.locator('input[placeholder*="Search provider"]');
    await searchInput.fill("Meg");
    await page.waitForTimeout(1500);
    await page.locator('li[role="menuitem"]:has-text("Auerbach")').first().click({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Apply"):not([disabled])').click({ timeout: 10000 });
    await page.waitForTimeout(3000);

    // Paginate and collect UUIDs from React fiber
    const clientUuids = [];
    let currentPage = 1;

    while (true) {
      let prevCount = 0;
      let staleRounds = 0;

      while (staleRounds < 3) {
        const rows = await page.evaluate(() => {
          const rows = document.querySelectorAll("tr.MuiTableRow-hover");
          return [...rows].map((row) => {
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
            return uuid;
          }).filter(Boolean);
        });

        for (const uuid of rows) {
          if (!clientUuids.includes(uuid)) clientUuids.push(uuid);
        }

        if (clientUuids.length === prevCount) staleRounds++;
        else staleRounds = 0;
        prevCount = clientUuids.length;

        await page.evaluate(() => {
          const table = document.querySelector("table");
          let sp = table?.parentElement;
          while (sp && sp.scrollHeight <= sp.clientHeight) sp = sp.parentElement;
          if (sp) sp.scrollTop += 800;
          else window.scrollBy(0, 800);
        });
        await page.waitForTimeout(1500);
      }

      console.log(`   Page ${currentPage}: ${clientUuids.length} UUIDs`);

      const nextBtn = page.locator('button[aria-label="Go to next page"]');
      const isDisabled = await nextBtn.evaluate((el) => el.disabled).catch(() => true);
      if (isDisabled) break;

      await nextBtn.click();
      await page.waitForTimeout(3000);
      await page.evaluate(() => {
        const table = document.querySelector("table");
        let sp = table?.parentElement;
        while (sp && sp.scrollHeight <= sp.clientHeight) sp = sp.parentElement;
        if (sp) sp.scrollTop = 0;
        else window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1000);
      currentPage++;
    }

    console.log(`   ✅ ${clientUuids.length} client UUIDs collected\n`);

    // Visit each client's Overview page and grab contact info
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < clientUuids.length; i++) {
      const uuid = clientUuids[i];
      const url = `https://dashboard.boulevard.io/clients/${uuid}`;
      console.log(`📋 [${i + 1}/${clientUuids.length}] ${uuid}...`);

      try {
        try {
          await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
        } catch {
          await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
        }
        await page.locator('[role="tab"]:has-text("History")').waitFor({ timeout: 20000 });
        await page.waitForTimeout(1000);

        const contact = await page.evaluate(() => {
          const getInput = (name) => document.querySelector(`input[name="${name}"]`)?.value?.trim() || "";
          return {
            firstName: getInput("name.first"),
            lastName: getInput("name.last"),
            email: getInput("email.personal"),
            phone: getInput("phone.mobile"),
          };
        });

        const fullName = `${contact.firstName} ${contact.lastName}`.trim();
        console.log(`   ${fullName || "???"} — ${contact.phone || "no phone"} — ${contact.email || "no email"}`);

        if (!fullName && !contact.phone && !contact.email) {
          console.log(`   ⚠️  No contact data found, skipping`);
          skipped++;
          continue;
        }

        // Push to STYLED
        if (!DRY_RUN && STYLED_SCRAPER_KEY) {
          const res = await fetch(`${STYLED_API_URL}/api/import/boulevard`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${STYLED_SCRAPER_KEY}`,
            },
            body: JSON.stringify({
              clients: [{
                name: fullName || "Unknown",
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                phone: contact.phone,
                blvdId: uuid,
                clientNotes: null,
                appointments: [],
                orders: [],
              }],
            }),
          });

          if (res.ok) {
            console.log(`   ✅ Updated`);
            updated++;
          } else {
            console.log(`   ❌ Push failed: ${res.status}`);
            errors++;
          }
        } else {
          updated++;
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        errors++;
      }

      await page.waitForTimeout(500);
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  process.exit(1);
});
