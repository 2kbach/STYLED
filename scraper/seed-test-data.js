/**
 * seed-test-data.js — Seeds TestClient/TestServiceSession/TestFormula/TestFormulaComponent in Turso
 * Run from project root: node scraper/seed-test-data.js
 */
import { createClient } from "@libsql/client";
import { readFileSync, existsSync } from "fs";

for (const f of [".env", "scraper/.env"]) {
  if (existsSync(f)) {
    readFileSync(f, "utf-8").split("\n").filter(l => l && !l.startsWith("#")).forEach(l => {
      const [k, ...v] = l.split("=");
      if (k && !process.env[k.trim()]) process.env[k.trim()] = v.join("=").trim();
    });
  }
}

const db = createClient({ url: process.env.DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

function cuid() {
  return "c" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const MEG = "Meg Auerbach";

// Component presets for color services
const COMPS = {
  balayage: [
    { product: "Blondor Freelights", amount: 60, unit: "g" },
    { product: "12% Developer", amount: 120, unit: "g" },
  ],
  fullHighlights: [
    { product: "Blondor Plex", amount: 50, unit: "g" },
    { product: "9% Developer", amount: 100, unit: "g" },
  ],
  partialHighlights: [
    { product: "Blondor Plex", amount: 35, unit: "g" },
    { product: "9% Developer", amount: 70, unit: "g" },
  ],
  highlights: [
    { product: "Blondor Plex", amount: 45, unit: "g" },
    { product: "9% Developer", amount: 90, unit: "g" },
  ],
  toner1016: [
    { product: "Wella 10/16", amount: 45, unit: "g" },
    { product: "1.9% Developer", amount: 90, unit: "g" },
  ],
  toner1018: [
    { product: "Wella 10/18", amount: 45, unit: "g" },
    { product: "1.9% Developer", amount: 90, unit: "g" },
  ],
  gloss: [
    { product: "Wella /16 Clear", amount: 30, unit: "g" },
    { product: "1.9% Weloxon", amount: 60, unit: "g" },
  ],
  singleProcess7N: [
    { product: "Wella 7/1", amount: 60, unit: "g" },
    { product: "6% Developer", amount: 60, unit: "g" },
  ],
  singleProcess6RB: [
    { product: "Wella 6/7", amount: 60, unit: "g" },
    { product: "6% Developer", amount: 60, unit: "g" },
  ],
  colorCorrection: [
    { product: "Wella 9/1", amount: 30, unit: "g" },
    { product: "Wella /16", amount: 15, unit: "g" },
    { product: "6% Developer", amount: 45, unit: "g" },
  ],
};

const CLIENTS = [
  {
    name: "Sarah Mitchell", phone: "(310) 555-0182", email: "sarah.mitchell@gmail.com",
    sessions: [
      { daysAgo: 14, notes: `Stylist: ${MEG}\nOrder #T001 — Total: $320.00 — Grat: $60.00\nImported from Boulevard`, formulas: [
        { name: "Full Highlights", developer: "30vol", ratio: "1:2", processingMin: 45, notes: "$220.00", components: COMPS.fullHighlights },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 105, notes: `Stylist: ${MEG}\nOrder #T002 — Total: $280.00 — Grat: $50.00\nImported from Boulevard`, formulas: [
        { name: "Full Highlights", developer: "30vol", ratio: "1:2", processingMin: 45, notes: "$220.00", components: COMPS.fullHighlights },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
      ]},
      { daysAgo: 210, notes: `Stylist: ${MEG}\nOrder #T003 — Total: $320.00 — Grat: $60.00`, formulas: [
        { name: "Full Highlights", developer: "30vol", ratio: "1:2", processingMin: 45, notes: "$220.00", components: COMPS.fullHighlights },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 290, notes: `Stylist: Alex Rivera\nOrder #T003b — Total: $75.00 — Grat: $15.00`, formulas: [
        { name: "Blow Dry", notes: "$75.00", components: [] },
      ]},
    ],
  },
  {
    name: "Olivia Torres", phone: "(213) 555-0394", email: "olivia.torres@gmail.com",
    sessions: [
      { daysAgo: 8, notes: `Stylist: ${MEG}\nOrder #T008 — Total: $485.00 — Grat: $90.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
        { name: "Blowout", notes: "$75.00", components: [] },
      ]},
      { daysAgo: 98, notes: `Stylist: ${MEG}\nOrder #T009 — Total: $425.00 — Grat: $80.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
      ]},
      { daysAgo: 195, notes: `Stylist: ${MEG}\nOrder #T010 — Total: $510.00 — Grat: $95.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 55, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
        { name: "Blowout", notes: "$75.00", components: [] },
      ]},
      { daysAgo: 290, notes: `Stylist: ${MEG}\nOrder #T011 — Total: $425.00 — Grat: $75.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
      ]},
      { daysAgo: 390, notes: `Stylist: ${MEG}\nOrder #T012 — Total: $425.00 — Grat: $80.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
      ]},
      { daysAgo: 460, notes: `Stylist: Jordan Lee\nOrder #T012b — Total: $90.00 — Grat: $18.00`, formulas: [
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
    ],
  },
  {
    name: "Rachel Kim", phone: "(310) 555-0561", email: "rachelkim@outlook.com",
    sessions: [
      { daysAgo: 30, notes: `Stylist: ${MEG}\nOrder #T013 — Total: $365.00 — Grat: $70.00`, formulas: [
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
        { name: "Blowout", notes: "$75.00", components: [] },
      ]},
      { daysAgo: 115, notes: `Stylist: ${MEG}\nOrder #T014 — Total: $270.00 — Grat: $50.00`, formulas: [
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
      ]},
      { daysAgo: 210, notes: `Stylist: ${MEG}\nOrder #T015 — Total: $270.00 — Grat: $50.00`, formulas: [
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
      ]},
      { daysAgo: 295, notes: `Stylist: Carla Avedisian\nOrder #T015b — Total: $75.00 — Grat: $15.00`, formulas: [
        { name: "Blow Dry", notes: "$75.00", components: [] },
      ]},
    ],
  },
  {
    name: "Diana Reyes", phone: "(818) 555-0843", email: "diana.reyes@gmail.com",
    sessions: [
      { daysAgo: 18, notes: `Stylist: ${MEG}\nOrder #T019 — Total: $540.00 — Grat: $100.00`, formulas: [
        { name: "Color Correction", developer: "20vol", ratio: "1:1.5", processingMin: 60, notes: "$400.00", components: COMPS.colorCorrection },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 88, notes: `Stylist: ${MEG}\nOrder #T020 — Total: $460.00 — Grat: $85.00`, formulas: [
        { name: "Single Process Color", developer: "20vol", ratio: "1:1.5", processingMin: 45, notes: "$150.00", components: COMPS.singleProcess7N },
        { name: "Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$220.00", components: COMPS.highlights },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 175, notes: `Stylist: ${MEG}\nOrder #T021 — Total: $490.00 — Grat: $90.00`, formulas: [
        { name: "Color Correction", developer: "20vol", ratio: "1:1.5", processingMin: 60, notes: "$400.00", components: COMPS.colorCorrection },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
      ]},
      { daysAgo: 270, notes: `Stylist: ${MEG}\nOrder #T022 — Total: $370.00 — Grat: $70.00`, formulas: [
        { name: "Single Process Color", developer: "20vol", ratio: "1:1.5", processingMin: 45, notes: "$150.00", components: COMPS.singleProcess7N },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 360, notes: `Stylist: ${MEG}\nOrder #T023 — Total: $240.00 — Grat: $45.00`, formulas: [
        { name: "Single Process Color", developer: "20vol", ratio: "1:1.5", processingMin: 45, notes: "$150.00", components: COMPS.singleProcess7N },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 430, notes: `Stylist: Casey Morgan\nOrder #T023b — Total: $75.00 — Grat: $15.00`, formulas: [
        { name: "Blow Dry", notes: "$75.00", components: [] },
      ]},
    ],
  },
  {
    name: "Amanda Chen", phone: "(213) 555-1182", email: "amanda.chen@gmail.com",
    sessions: [
      { daysAgo: 10, notes: `Stylist: ${MEG}\nOrder #T031 — Total: $495.00 — Grat: $95.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 55, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
        { name: "Trim", notes: "$55.00", components: [] },
      ]},
      { daysAgo: 85, notes: `Stylist: ${MEG}\nOrder #T032 — Total: $415.00 — Grat: $75.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
      ]},
      { daysAgo: 170, notes: `Stylist: ${MEG}\nOrder #T033 — Total: $440.00 — Grat: $80.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 55, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
      ]},
      { daysAgo: 260, notes: `Stylist: ${MEG}\nOrder #T034 — Total: $460.00 — Grat: $85.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 55, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 345, notes: `Stylist: ${MEG}\nOrder #T035 — Total: $405.00 — Grat: $75.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
      ]},
      { daysAgo: 415, notes: `Stylist: Jordan Lee\nOrder #T035b — Total: $55.00 — Grat: $10.00`, formulas: [
        { name: "Trim", notes: "$55.00", components: [] },
      ]},
    ],
  },
  {
    name: "Sofia Mendez", phone: "(424) 555-1293", email: "sofia.mendez@icloud.com",
    sessions: [
      { daysAgo: 22, notes: `Stylist: ${MEG}\nOrder #T036 — Total: $355.00 — Grat: $65.00`, formulas: [
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
        { name: "Blowout", notes: "$75.00", components: [] },
      ]},
      { daysAgo: 110, notes: `Stylist: ${MEG}\nOrder #T037 — Total: $270.00 — Grat: $50.00`, formulas: [
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
      ]},
      { daysAgo: 205, notes: `Stylist: ${MEG}\nOrder #T038 — Total: $355.00 — Grat: $65.00`, formulas: [
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 300, notes: `Stylist: ${MEG}\nOrder #T039 — Total: $345.00 — Grat: $65.00`, formulas: [
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 400, notes: `Stylist: ${MEG}\nOrder #T040 — Total: $270.00 — Grat: $50.00`, formulas: [
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
      ]},
      { daysAgo: 470, notes: `Stylist: Alex Rivera\nOrder #T040b — Total: $90.00 — Grat: $18.00`, formulas: [
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
    ],
  },
  {
    name: "Lauren Fitzgerald", phone: "(310) 555-0337", email: "lauren.fitz@gmail.com",
    sessions: [
      { daysAgo: 12, notes: `Stylist: ${MEG}\nOrder #T041 — Total: $450.00 — Grat: $85.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
        { name: "Blowout", notes: "$75.00", components: [] },
      ]},
      { daysAgo: 100, notes: `Stylist: ${MEG}\nOrder #T042 — Total: $415.00 — Grat: $80.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
      ]},
      { daysAgo: 200, notes: `Stylist: ${MEG}\nOrder #T043 — Total: $495.00 — Grat: $90.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 55, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 295, notes: `Stylist: ${MEG}\nOrder #T044 — Total: $415.00 — Grat: $80.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
      ]},
      { daysAgo: 360, notes: `Stylist: Carla Avedisian\nOrder #T044b — Total: $75.00 — Grat: $15.00`, formulas: [
        { name: "Blow Dry", notes: "$75.00", components: [] },
      ]},
    ],
  },
  {
    name: "Nicole Park", phone: "(213) 555-0874", email: "nicole.park@icloud.com",
    sessions: [
      { daysAgo: 28, notes: `Stylist: ${MEG}\nOrder #T045 — Total: $295.00 — Grat: $55.00`, formulas: [
        { name: "Full Highlights", developer: "30vol", ratio: "1:2", processingMin: 45, notes: "$220.00", components: COMPS.fullHighlights },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
        { name: "Trim", notes: "$45.00", components: [] },
      ]},
      { daysAgo: 98, notes: `Stylist: ${MEG}\nOrder #T046 — Total: $265.00 — Grat: $50.00`, formulas: [
        { name: "Full Highlights", developer: "30vol", ratio: "1:2", processingMin: 45, notes: "$220.00", components: COMPS.fullHighlights },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
      ]},
      { daysAgo: 190, notes: `Stylist: ${MEG}\nOrder #T047 — Total: $310.00 — Grat: $60.00`, formulas: [
        { name: "Full Highlights", developer: "30vol", ratio: "1:2", processingMin: 45, notes: "$220.00", components: COMPS.fullHighlights },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 260, notes: `Stylist: Casey Morgan\nOrder #T047b — Total: $75.00 — Grat: $15.00`, formulas: [
        { name: "Blow Dry", notes: "$75.00", components: [] },
      ]},
    ],
  },
  {
    name: "Chloe Williams", phone: "(323) 555-0492", email: "chloe.williams@gmail.com",
    sessions: [
      { daysAgo: 35, notes: `Stylist: ${MEG}\nOrder #T048 — Total: $415.00 — Grat: $80.00`, formulas: [
        { name: "Single Process Color", developer: "20vol", ratio: "1:1.5", processingMin: 45, notes: "$150.00", components: COMPS.singleProcess6RB },
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 120, notes: `Stylist: ${MEG}\nOrder #T049 — Total: $380.00 — Grat: $70.00`, formulas: [
        { name: "Single Process Color", developer: "20vol", ratio: "1:1.5", processingMin: 45, notes: "$150.00", components: COMPS.singleProcess6RB },
        { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", components: COMPS.partialHighlights },
      ]},
      { daysAgo: 220, notes: `Stylist: ${MEG}\nOrder #T050 — Total: $330.00 — Grat: $60.00`, formulas: [
        { name: "Single Process Color", developer: "20vol", ratio: "1:1.5", processingMin: 45, notes: "$150.00", components: COMPS.singleProcess6RB },
        { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", components: COMPS.gloss },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 300, notes: `Stylist: Jordan Lee\nOrder #T050b — Total: $55.00 — Grat: $10.00`, formulas: [
        { name: "Trim", notes: "$55.00", components: [] },
      ]},
    ],
  },
  {
    name: "Emma Rodriguez", phone: "(424) 555-0658", email: "emma.rodriguez@gmail.com",
    sessions: [
      { daysAgo: 20, notes: `Stylist: ${MEG}\nOrder #T051 — Total: $425.00 — Grat: $80.00`, formulas: [
        { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", components: COMPS.balayage },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1018 },
      ]},
      { daysAgo: 110, notes: `Stylist: ${MEG}\nOrder #T052 — Total: $560.00 — Grat: $100.00`, formulas: [
        { name: "Color Correction", developer: "20vol", ratio: "1:1.5", processingMin: 60, notes: "$400.00", components: COMPS.colorCorrection },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
      { daysAgo: 200, notes: `Stylist: ${MEG}\nOrder #T053 — Total: $480.00 — Grat: $90.00`, formulas: [
        { name: "Color Correction", developer: "20vol", ratio: "1:1.5", processingMin: 60, notes: "$400.00", components: COMPS.colorCorrection },
        { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", components: COMPS.toner1016 },
        { name: "Blowout", notes: "$75.00", components: [] },
      ]},
      { daysAgo: 275, notes: `Stylist: Alex Rivera\nOrder #T053b — Total: $90.00 — Grat: $18.00`, formulas: [
        { name: "Womens Haircut", notes: "$90.00", components: [] },
      ]},
    ],
  },
];

async function main() {
  console.log("🌱 Seeding test data into Turso...\n");

  // Clear existing
  await db.execute("DELETE FROM TestFormulaComponent");
  await db.execute("DELETE FROM TestFormula");
  await db.execute("DELETE FROM TestServiceSession");
  await db.execute("DELETE FROM TestClient");
  console.log("🗑  Cleared existing test data");

  for (const clientData of CLIENTS) {
    const clientId = cuid();
    await db.execute({
      sql: "INSERT INTO TestClient (id, name, phone, email, createdAt) VALUES (?, ?, ?, ?, ?)",
      args: [clientId, clientData.name, clientData.phone ?? null, clientData.email ?? null, new Date().toISOString()],
    });

    for (const s of clientData.sessions) {
      const sessionId = cuid();
      await db.execute({
        sql: "INSERT INTO TestServiceSession (id, date, notes, createdAt, clientId) VALUES (?, ?, ?, ?, ?)",
        args: [sessionId, daysAgo(s.daysAgo), s.notes, new Date().toISOString(), clientId],
      });

      for (const f of s.formulas) {
        const formulaId = cuid();
        await db.execute({
          sql: "INSERT INTO TestFormula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [formulaId, f.name, f.developer ?? null, f.ratio ?? null, f.processingMin ?? null, f.notes ?? null, sessionId],
        });

        for (const c of f.components) {
          await db.execute({
            sql: "INSERT INTO TestFormulaComponent (id, formulaId, product, amount, unit) VALUES (?, ?, ?, ?, ?)",
            args: [cuid(), formulaId, c.product, c.amount, c.unit],
          });
        }
      }
    }

    console.log(`  ✅ ${clientData.name} — ${clientData.sessions.length} sessions`);
  }

  console.log("\n🎉 Done! Test data seeded in Turso.");
}

main().catch(console.error);
