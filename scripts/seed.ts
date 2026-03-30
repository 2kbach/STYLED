// Run with: npx tsx scripts/seed.ts
import { createClient } from "@libsql/client";

const db = createClient({
  url: "libsql://styled-2kbach.aws-us-west-2.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const USER_ID = "cmnciio3a000004ju26oxyhmn";

function cuid() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function seed() {
  const now = new Date().toISOString();

  // Client 1: Sarah Mitchell — regular balayage client
  const sarah = cuid();
  await db.execute({
    sql: `INSERT INTO Client (id, name, phone, notes, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [sarah, "Sarah Mitchell", "(503) 555-0142", "Prefers warm tones. Sensitive scalp — use gentle developer.", USER_ID, now, now],
  });

  // Sarah session 1 — 3 weeks ago
  const sarahS1 = cuid();
  const s1Date = new Date(Date.now() - 21 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, processingMin, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [sarahS1, s1Date, "Full balayage, warm gold tones. Very happy with result.", 45, sarah, USER_ID, s1Date],
  });
  const sarahF1 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [sarahF1, "Balayage Lightener", sarahS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Redken Flash Lift", 30, "30V", "1:2", sarahF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Olaplex No.1", 3.75, null, null, sarahF1] });

  const sarahF1b = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [sarahF1b, "Toner", sarahS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Redken Shades EQ 09GB", 20, null, "1:1", sarahF1b] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Shades EQ Processing Solution", 20, null, null, sarahF1b] });

  // Sarah session 2 — 8 weeks ago
  const sarahS2 = cuid();
  const s2Date = new Date(Date.now() - 56 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, processingMin, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [sarahS2, s2Date, "Root touch-up and gloss. Came in brassier than expected.", 35, sarah, USER_ID, s2Date],
  });
  const sarahF2 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [sarahF2, "Root Lightener", sarahS2] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Redken Flash Lift", 25, "20V", "1:1.5", sarahF2] });

  // Client 2: Jessica Park — vivid color lover
  const jessica = cuid();
  await db.execute({
    sql: `INSERT INTO Client (id, name, phone, notes, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [jessica, "Jessica Park", "(503) 555-0287", "Loves vivid/fashion colors. Natural level 4. Always wants something new.", USER_ID, now, now],
  });

  const jessS1 = cuid();
  const j1Date = new Date(Date.now() - 5 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, processingMin, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [jessS1, j1Date, "Purple/violet money pieces with shadow root. Incredible result.", 60, jessica, USER_ID, j1Date],
  });
  const jessF1 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [jessF1, "Lightener (money pieces)", jessS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Schwarzkopf BlondMe", 40, "40V", "1:2", jessF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Olaplex No.1", 5, null, null, jessF1] });

  const jessF1b = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [jessF1b, "Vivid Color", jessS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Pulp Riot Velvet", 15, null, null, jessF1b] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Pulp Riot Jam", 10, null, null, jessF1b] });

  const jessF1c = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [jessF1c, "Shadow Root", jessS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Redken Color Gels 4N", 20, "10V", "1:1", jessF1c] });

  // Client 3: David Reyes — men's grey blending
  const david = cuid();
  await db.execute({
    sql: `INSERT INTO Client (id, name, phone, notes, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [david, "David Reyes", "(971) 555-0198", "Grey blending every 4-5 weeks. Natural level 5, about 40% grey. Quick in-and-out.", USER_ID, now, now],
  });

  const davS1 = cuid();
  const d1Date = new Date(Date.now() - 10 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, processingMin, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [davS1, d1Date, "Standard grey blend. 10 min processing. Natural result.", 10, david, USER_ID, d1Date],
  });
  const davF1 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [davF1, "Grey Blend", davS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Redken Color Camo 5N", 15, "10V", "1:1", davF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Redken Color Camo Developer", 15, null, null, davF1] });

  // Client 4: Maria Santos — highlights and root color
  const maria = cuid();
  await db.execute({
    sql: `INSERT INTO Client (id, name, phone, notes, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [maria, "Maria Santos", null, "Regular highlights client. Natural level 6. About 15% grey at temples. Appointment every 8 weeks.", USER_ID, now, now],
  });

  const marS1 = cuid();
  const m1Date = new Date(Date.now() - 2 * 86400000).toISOString();
  await db.execute({
    sql: `INSERT INTO ServiceSession (id, date, notes, processingMin, clientId, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [marS1, m1Date, "Full highlight with root smudge. Added a few lowlights for dimension.", 50, maria, USER_ID, m1Date],
  });
  const marF1 = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [marF1, "Highlights", marS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Wella Blondor", 35, "30V", "1:2", marF1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Olaplex No.1", 4.5, null, null, marF1] });

  const marF1b = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [marF1b, "Lowlights", marS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Redken Shades EQ 6GB", 15, null, "1:1", marF1b] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Shades EQ Processing Solution", 15, null, null, marF1b] });

  const marF1c = cuid();
  await db.execute({ sql: `INSERT INTO Formula (id, name, sessionId) VALUES (?, ?, ?)`, args: [marF1c, "Root Smudge", marS1] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Redken Shades EQ 7NB", 10, null, "1:1", marF1c] });
  await db.execute({ sql: `INSERT INTO FormulaComponent (id, product, grams, developer, ratio, formulaId) VALUES (?, ?, ?, ?, ?, ?)`, args: [cuid(), "Shades EQ Processing Solution", 10, null, null, marF1c] });

  console.log("Seeded 4 clients with sessions and formulas!");
}

seed().catch(console.error);
