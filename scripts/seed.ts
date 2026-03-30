// Run with: TURSO_AUTH_TOKEN=... DATABASE_URL=... npx tsx scripts/seed.ts
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

function cuid() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function seed() {
  const now = new Date().toISOString();

  // Recreate user
  await db.execute({
    sql: `INSERT OR IGNORE INTO "User" (id, email, name, image, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: ["cmnciio3a000004ju26oxyhmn", "2kbach@gmail.com", "Kevin Auerbach", null, now, now],
  });

  const USER_ID = "cmnciio3a000004ju26oxyhmn";

  // ============================================
  // CRAZY LIANA GREY — Real example from Megan's notes
  // ============================================
  const liana = cuid();
  await db.execute({
    sql: `INSERT INTO Client (id, name, phone, notes, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [liana, "Crazy Liana Grey", null, "Grey coverage. Igora Royal line. Multiple formula variations over time.", USER_ID, now, now],
  });

  // Session 1 — Original formula (undated, treating as ~6 months ago)
  const lianaS1 = cuid();
  const l1Date = new Date(Date.now() - 180 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [lianaS1, l1Date, null, liana, USER_ID, l1Date],
  });
  const lianaF1 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [lianaF1, "Igora Royal", "20V", null, null, null, lianaS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-1", 1.5, "tube", lianaF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-00", 0.5, "tube", lianaF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "5-1", 0.5, "tube", lianaF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "5-0", 0.25, "tube", lianaF1] });

  // Session 2 — Refined oz measurements
  const lianaS2 = cuid();
  const l2Date = new Date(Date.now() - 120 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [lianaS2, l2Date, "Refined measurements to ounces. Added scaling table for touch-ups.", liana, USER_ID, l2Date],
  });
  const lianaF2 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [lianaF2, "Igora", null, null, null, "If more needed: 6-1 ½oz, 6-00 ⅙oz (~0.15oz), 5-1 ⅛oz (~0.12oz), 5-0 ⅛oz (~0.12oz)", lianaS2] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-1", 1.25, "oz", lianaF2] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-00", 0.5, "oz", lianaF2] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "5-1", 0.33, "oz", lianaF2] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "5-0", 0.33, "oz", lianaF2] });

  // Session 3 — 12/4/25
  const lianaS3 = cuid();
  const l3Date = new Date("2025-12-04").toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [lianaS3, l3Date, null, liana, USER_ID, l3Date],
  });
  const lianaF3 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [lianaF3, "Igora", "20V", null, null, null, lianaS3] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-1", 1, "oz", lianaF3] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-00", 0.5, "oz", lianaF3] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "5-1", 0.25, "oz", lianaF3] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "5-0", 0.25, "oz", lianaF3] });

  // Session 4 — 2/19/26 (most recent, complex multi-zone)
  const lianaS4 = cuid();
  const l4Date = new Date("2026-02-19").toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [lianaS4, l4Date, "Malibu CPR (heat, 30min)\n2 undo goo shampoos\nColor Motion Pre-Color spray", liana, USER_ID, l4Date],
  });

  // Base formula
  const lianaF4a = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [lianaF4a, "Base", "15V", null, null, null, lianaS4] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-1", 1, "oz", lianaF4a] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-0", 0.75, "oz", lianaF4a] });

  // Hairline formula
  const lianaF4b = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [lianaF4b, "Hairline", "10V", null, null, null, lianaS4] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-1", 1, "oz", lianaF4b] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "6-0", 0.5, "oz", lianaF4b] });

  // Shades EQ toner
  const lianaF4c = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [lianaF4c, "Shades EQ", null, null, 20, "Last 20 min of root", lianaS4] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "06N", 1, "oz", lianaF4c] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "07M", 0.75, "oz", lianaF4c] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Clear", 0.25, "oz", lianaF4c] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Processing Solution", 2, "oz", lianaF4c] });

  // ============================================
  // DEMO CLIENTS (updated for new schema)
  // ============================================

  // Sarah Mitchell
  const sarah = cuid();
  await db.execute({
    sql: `INSERT INTO Client (id, name, phone, notes, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [sarah, "Sarah Mitchell", "(503) 555-0142", "Prefers warm tones. Sensitive scalp.", USER_ID, now, now],
  });
  const sarahS1 = cuid();
  const s1Date = new Date(Date.now() - 21 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [sarahS1, s1Date, "Full balayage, warm gold tones.", sarah, USER_ID, s1Date],
  });
  const sarahF1 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [sarahF1, "Balayage Lightener", "30V", "1:2", 45, null, sarahS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Redken Flash Lift", 30, "g", sarahF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Olaplex No.1", 3.75, "g", sarahF1] });

  const sarahF1b = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [sarahF1b, "Toner", null, "1:1", 20, null, sarahS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Shades EQ 09GB", 1, "oz", sarahF1b] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Processing Solution", 1, "oz", sarahF1b] });

  // Jessica Park
  const jessica = cuid();
  await db.execute({
    sql: `INSERT INTO Client (id, name, phone, notes, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [jessica, "Jessica Park", "(503) 555-0287", "Vivid/fashion colors. Natural level 4.", USER_ID, now, now],
  });
  const jessS1 = cuid();
  const j1Date = new Date(Date.now() - 5 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [jessS1, j1Date, "Purple/violet money pieces with shadow root.", jessica, USER_ID, j1Date],
  });
  const jessF1 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [jessF1, "Lightener (money pieces)", "40V", "1:2", 60, null, jessS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Schwarzkopf BlondMe", 1.5, "oz", jessF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Olaplex No.1", 0.2, "oz", jessF1] });

  const jessF1b = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [jessF1b, "Vivid Color", null, null, 30, null, jessS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Pulp Riot Velvet", 0.5, "oz", jessF1b] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Pulp Riot Jam", 0.33, "oz", jessF1b] });

  const jessF1c = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [jessF1c, "Shadow Root", "10V", "1:1", 15, null, jessS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Redken Color Gels 4N", 0.75, "oz", jessF1c] });

  // David Reyes
  const david = cuid();
  await db.execute({
    sql: `INSERT INTO Client (id, name, phone, notes, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [david, "David Reyes", "(971) 555-0198", "Grey blend every 4-5 weeks. ~40% grey.", USER_ID, now, now],
  });
  const davS1 = cuid();
  const d1Date = new Date(Date.now() - 10 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [davS1, d1Date, "Standard grey blend. Natural result.", david, USER_ID, d1Date],
  });
  const davF1 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [davF1, "Grey Blend", "10V", "1:1", 10, null, davS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Redken Color Camo 5N", 0.5, "oz", davF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, amount, unit, formulaId) VALUES (?, ?, ?, ?, ?)`, args: [cuid(), "Color Camo Developer", 0.5, "oz", davF1] });

  console.log("Seeded Crazy Liana Grey (4 sessions) + 3 demo clients!");
}

seed().catch(console.error);
