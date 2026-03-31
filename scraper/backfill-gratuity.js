import { createClient } from "@libsql/client";
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

async function main() {
  console.log("💰 Backfilling gratuity from order totals...\n");

  // Get all Meg sessions with an order total but no gratuity yet
  const sessions = await db.execute(`
    SELECT s.id, s.notes
    FROM ServiceSession s
    WHERE s.notes LIKE '%Order #%Total:%'
      AND s.notes NOT LIKE '%Grat:%'
  `);

  console.log(`   Found ${sessions.rows.length} sessions to process\n`);

  let updated = 0, skipped = 0;

  for (const row of sessions.rows) {
    const notes = row.notes;
    const totalMatch = notes.match(/Total: \$([0-9,.]+)/);
    if (!totalMatch) { skipped++; continue; }
    const total = parseFloat(totalMatch[1].replace(/,/g, ""));

    // Get sum of formula prices for this session
    const formulas = await db.execute({
      sql: `SELECT notes FROM Formula WHERE sessionId = ? AND notes LIKE '$%'`,
      args: [row.id],
    });

    const serviceSum = formulas.rows.reduce((sum, f) => {
      const m = f.notes?.match(/\$([\d,.]+)/);
      return sum + (m ? parseFloat(m[1].replace(/,/g, "")) : 0);
    }, 0);

    const gratuity = Math.round((total - serviceSum) * 100) / 100;

    if (gratuity <= 0 || gratuity > total * 0.5) { skipped++; continue; } // sanity check

    const updatedNotes = notes.replace(
      /(Order #\d+ — Total: \$[0-9,.]+)/,
      `$1 — Grat: $${gratuity.toFixed(2)}`
    );

    await db.execute({
      sql: `UPDATE ServiceSession SET notes = ? WHERE id = ?`,
      args: [updatedNotes, row.id],
    });

    updated++;
    if (updated % 25 === 0) console.log(`   ${updated} updated...`);
  }

  console.log(`\n📊 Done!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped} (no price data or sanity check failed)`);
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
