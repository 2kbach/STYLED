/**
 * seed-test.ts — Seeds TestClient, TestServiceSession, TestFormula tables
 * Run: npx tsx prisma/seed-test.ts
 */

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const STYLISTS = ["Meg Auerbach", "Jordan Lee", "Alex Rivera", "Casey Morgan"];
const MEG = "Meg Auerbach";

function randomBetween(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// 10 test clients with realistic visit histories
const CLIENTS = [
  {
    name: "Sarah Mitchell",
    phone: "(310) 555-0182",
    email: "sarah.mitchell@gmail.com",
    sessions: [
      {
        daysAgo: 14,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T001 — Total: $320.00 — Grat: $60.00\nImported from Boulevard`,
        formulas: [
          { name: "Full Highlights", developer: "30vol", ratio: "1:2", processingMin: 45, notes: "$220.00", product: "Wella Blondor Freelights", amount: 2.5 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
          { name: "Womens Haircut", notes: "$90.00" },
        ],
      },
      {
        daysAgo: 105,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T002 — Total: $280.00 — Grat: $50.00\nImported from Boulevard`,
        formulas: [
          { name: "Full Highlights", developer: "30vol", ratio: "1:2", processingMin: 45, notes: "$220.00", product: "Wella Blondor Freelights", amount: 2.5 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
        ],
      },
      {
        daysAgo: 210,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T003 — Total: $320.00 — Grat: $60.00`,
        formulas: [
          { name: "Full Highlights", developer: "30vol", ratio: "1:2", processingMin: 45, notes: "$220.00", product: "Wella Blondor Freelights", amount: 2.5 },
          { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", product: "Redken Shades EQ 09B", amount: 1.0 },
          { name: "Womens Haircut", notes: "$90.00" },
        ],
      },
    ],
  },
  {
    name: "James Cho",
    phone: "(424) 555-0247",
    email: "james.cho@icloud.com",
    sessions: [
      {
        daysAgo: 21,
        stylist: "Jordan Lee",
        notes: `Stylist: Jordan Lee\n(Not Meg's appointment)\nOrder #T004 — Total: $80.00 — Grat: $16.00`,
        formulas: [{ name: "Mens Haircut", notes: "$80.00" }],
      },
      {
        daysAgo: 56,
        stylist: "Jordan Lee",
        notes: `Stylist: Jordan Lee\n(Not Meg's appointment)\nOrder #T005 — Total: $80.00 — Grat: $16.00`,
        formulas: [{ name: "Mens Haircut", notes: "$80.00" }],
      },
      {
        daysAgo: 91,
        stylist: "Jordan Lee",
        notes: `Stylist: Jordan Lee\n(Not Meg's appointment)\nOrder #T006 — Total: $80.00`,
        formulas: [{ name: "Mens Haircut", notes: "$80.00" }],
      },
      {
        daysAgo: 140,
        stylist: "Jordan Lee",
        notes: `Stylist: Jordan Lee\n(Not Meg's appointment)\nOrder #T007 — Total: $80.00 — Grat: $20.00`,
        formulas: [{ name: "Mens Haircut", notes: "$80.00" }],
      },
    ],
  },
  {
    name: "Olivia Torres",
    phone: "(213) 555-0394",
    email: "olivia.torres@gmail.com",
    sessions: [
      {
        daysAgo: 8,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T008 — Total: $485.00 — Grat: $90.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.0 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
          { name: "Blowout", notes: "$75.00" },
        ],
      },
      {
        daysAgo: 98,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T009 — Total: $425.00 — Grat: $80.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.0 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /98 Pale Blonde", amount: 1.5 },
        ],
      },
      {
        daysAgo: 195,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T010 — Total: $510.00 — Grat: $95.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 55, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.5 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
          { name: "Womens Haircut", notes: "$90.00" },
          { name: "Blowout", notes: "$75.00" },
        ],
      },
      {
        daysAgo: 290,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T011 — Total: $425.00 — Grat: $75.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.0 },
          { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", product: "Redken Shades EQ 08G", amount: 1.0 },
        ],
      },
      {
        daysAgo: 390,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T012 — Total: $425.00 — Grat: $80.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.0 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
        ],
      },
    ],
  },
  {
    name: "Rachel Kim",
    phone: "(310) 555-0561",
    email: "rachelkim@outlook.com",
    sessions: [
      {
        daysAgo: 30,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T013 — Total: $365.00 — Grat: $70.00`,
        formulas: [
          { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", product: "Wella Blondor Multi Blonde", amount: 2.0 },
          { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", product: "Redken Shades EQ 09P", amount: 1.0 },
          { name: "Womens Haircut", notes: "$90.00" },
          { name: "Blowout", notes: "$75.00" },
        ],
      },
      {
        daysAgo: 115,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T014 — Total: $270.00 — Grat: $50.00`,
        formulas: [
          { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", product: "Wella Blondor Multi Blonde", amount: 2.0 },
          { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", product: "Redken Shades EQ 09P", amount: 1.0 },
        ],
      },
      {
        daysAgo: 210,
        stylist: "Alex Rivera",
        notes: `Stylist: Alex Rivera\n(Not Meg's appointment)\nOrder #T015 — Total: $90.00 — Grat: $18.00`,
        formulas: [{ name: "Womens Haircut", notes: "$90.00" }],
      },
    ],
  },
  {
    name: "Marcus Webb",
    phone: "(323) 555-0728",
    sessions: [
      {
        daysAgo: 35,
        stylist: "Alex Rivera",
        notes: `Stylist: Alex Rivera\n(Not Meg's appointment)\nOrder #T016 — Total: $95.00 — Grat: $20.00`,
        formulas: [{ name: "Mens Haircut", notes: "$95.00" }],
      },
      {
        daysAgo: 77,
        stylist: "Alex Rivera",
        notes: `Stylist: Alex Rivera\n(Not Meg's appointment)\nOrder #T017 — Total: $95.00 — Grat: $20.00`,
        formulas: [{ name: "Mens Haircut", notes: "$95.00" }],
      },
      {
        daysAgo: 120,
        stylist: "Alex Rivera",
        notes: `Stylist: Alex Rivera\n(Not Meg's appointment)\nOrder #T018 — Total: $95.00`,
        formulas: [{ name: "Mens Haircut", notes: "$95.00" }],
      },
    ],
  },
  {
    name: "Diana Reyes",
    phone: "(818) 555-0843",
    email: "diana.reyes@gmail.com",
    sessions: [
      {
        daysAgo: 18,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T019 — Total: $540.00 — Grat: $100.00`,
        formulas: [
          { name: "Color Correction", developer: "20vol", ratio: "1:1.5", processingMin: 60, notes: "$400.00", product: "Wella Koleston Perfect 7/0", amount: 3.0 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
          { name: "Womens Haircut", notes: "$90.00" },
        ],
      },
      {
        daysAgo: 88,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T020 — Total: $460.00 — Grat: $85.00`,
        formulas: [
          { name: "Single Process Color", developer: "20vol", ratio: "1:1.5", processingMin: 45, notes: "$150.00", product: "Wella Koleston Perfect 6/7", amount: 2.5 },
          { name: "Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$220.00", product: "Wella Blondor Freelights", amount: 2.0 },
          { name: "Womens Haircut", notes: "$90.00" },
        ],
      },
      {
        daysAgo: 175,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T021 — Total: $490.00 — Grat: $90.00`,
        formulas: [
          { name: "Color Correction", developer: "20vol", ratio: "1:1.5", processingMin: 60, notes: "$400.00", product: "Wella Koleston Perfect 7/3", amount: 3.0 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /06 Violet", amount: 1.5 },
        ],
      },
      {
        daysAgo: 270,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T022 — Total: $370.00 — Grat: $70.00`,
        formulas: [
          { name: "Single Process Color", developer: "20vol", ratio: "1:1.5", processingMin: 45, notes: "$150.00", product: "Wella Koleston Perfect 6/7", amount: 2.5 },
          { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", product: "Redken Shades EQ 06RB", amount: 1.0 },
          { name: "Womens Haircut", notes: "$90.00" },
        ],
      },
      {
        daysAgo: 360,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T023 — Total: $240.00 — Grat: $45.00`,
        formulas: [
          { name: "Single Process Color", developer: "20vol", ratio: "1:1.5", processingMin: 45, notes: "$150.00", product: "Wella Koleston Perfect 5/7", amount: 2.5 },
          { name: "Womens Haircut", notes: "$90.00" },
        ],
      },
    ],
  },
  {
    name: "Priya Patel",
    phone: "(310) 555-0916",
    email: "priya.patel@gmail.com",
    sessions: [
      {
        daysAgo: 25,
        stylist: "Casey Morgan",
        notes: `Stylist: Casey Morgan\n(Not Meg's appointment)\nOrder #T024 — Total: $250.00 — Grat: $50.00`,
        formulas: [
          { name: "Keratin Treatment", processingMin: 90, notes: "$195.00", product: "Brazilian Blowout", amount: 4.0 },
          { name: "Blow Dry", notes: "$55.00" },
        ],
      },
      {
        daysAgo: 120,
        stylist: "Casey Morgan",
        notes: `Stylist: Casey Morgan\n(Not Meg's appointment)\nOrder #T025 — Total: $160.00 — Grat: $30.00`,
        formulas: [
          { name: "Blow Dry", notes: "$55.00" },
          { name: "Womens Haircut", notes: "$105.00" },
        ],
      },
      {
        daysAgo: 215,
        stylist: "Casey Morgan",
        notes: `Stylist: Casey Morgan\n(Not Meg's appointment)\nOrder #T026 — Total: $250.00 — Grat: $50.00`,
        formulas: [
          { name: "Keratin Treatment", processingMin: 90, notes: "$195.00", product: "Brazilian Blowout", amount: 4.0 },
          { name: "Blow Dry", notes: "$55.00" },
        ],
      },
      {
        daysAgo: 310,
        stylist: "Casey Morgan",
        notes: `Stylist: Casey Morgan\n(Not Meg's appointment)\nOrder #T027 — Total: $105.00 — Grat: $20.00`,
        formulas: [{ name: "Womens Haircut", notes: "$105.00" }],
      },
    ],
  },
  {
    name: "Tyler Brooks",
    phone: "(323) 555-1047",
    sessions: [
      {
        daysAgo: 28,
        stylist: "Jordan Lee",
        notes: `Stylist: Jordan Lee\n(Not Meg's appointment)\nOrder #T028 — Total: $80.00 — Grat: $20.00`,
        formulas: [{ name: "Mens Haircut", notes: "$80.00" }],
      },
      {
        daysAgo: 63,
        stylist: "Jordan Lee",
        notes: `Stylist: Jordan Lee\n(Not Meg's appointment)\nOrder #T029 — Total: $80.00 — Grat: $15.00`,
        formulas: [{ name: "Mens Haircut", notes: "$80.00" }],
      },
      {
        daysAgo: 105,
        stylist: "Jordan Lee",
        notes: `Stylist: Jordan Lee\n(Not Meg's appointment)\nOrder #T030 — Total: $80.00 — Grat: $20.00`,
        formulas: [{ name: "Mens Haircut", notes: "$80.00" }],
      },
    ],
  },
  {
    name: "Amanda Chen",
    phone: "(213) 555-1182",
    email: "amanda.chen@gmail.com",
    sessions: [
      {
        daysAgo: 10,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T031 — Total: $495.00 — Grat: $95.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 55, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.5 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
          { name: "Trim", notes: "$55.00" },
        ],
      },
      {
        daysAgo: 85,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T032 — Total: $415.00 — Grat: $75.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.0 },
          { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", product: "Redken Shades EQ 09NB", amount: 1.0 },
        ],
      },
      {
        daysAgo: 170,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T033 — Total: $440.00 — Grat: $80.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 55, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.5 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /86 Pearl Matte", amount: 1.5 },
        ],
      },
      {
        daysAgo: 260,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T034 — Total: $460.00 — Grat: $85.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 55, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.5 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
          { name: "Womens Haircut", notes: "$90.00" },
        ],
      },
      {
        daysAgo: 345,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T035 — Total: $405.00 — Grat: $75.00`,
        formulas: [
          { name: "Balayage", developer: "40vol", ratio: "1:2", processingMin: 50, notes: "$350.00", product: "Wella Blondor Freelights", amount: 3.0 },
          { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", product: "Redken Shades EQ 09B", amount: 1.0 },
        ],
      },
    ],
  },
  {
    name: "Sofia Mendez",
    phone: "(424) 555-1293",
    email: "sofia.mendez@icloud.com",
    sessions: [
      {
        daysAgo: 22,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T036 — Total: $355.00 — Grat: $65.00`,
        formulas: [
          { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", product: "Wella Blondor Multi Blonde", amount: 2.0 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
          { name: "Womens Haircut", notes: "$90.00" },
          { name: "Blowout", notes: "$75.00" },
        ],
      },
      {
        daysAgo: 110,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T037 — Total: $270.00 — Grat: $50.00`,
        formulas: [
          { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", product: "Wella Blondor Multi Blonde", amount: 2.0 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
        ],
      },
      {
        daysAgo: 205,
        stylist: "Casey Morgan",
        notes: `Stylist: Casey Morgan\n(Not Meg's appointment)\nOrder #T038 — Total: $90.00 — Grat: $20.00`,
        formulas: [{ name: "Womens Haircut", notes: "$90.00" }],
      },
      {
        daysAgo: 300,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T039 — Total: $345.00 — Grat: $65.00`,
        formulas: [
          { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", product: "Wella Blondor Multi Blonde", amount: 2.0 },
          { name: "Gloss", developer: "10vol", ratio: "1:2", processingMin: 15, notes: "$45.00", product: "Redken Shades EQ 09T", amount: 1.0 },
          { name: "Womens Haircut", notes: "$90.00" },
        ],
      },
      {
        daysAgo: 400,
        stylist: MEG,
        notes: `Stylist: ${MEG}\nOrder #T040 — Total: $270.00 — Grat: $50.00`,
        formulas: [
          { name: "Partial Highlights", developer: "30vol", ratio: "1:2", processingMin: 40, notes: "$180.00", product: "Wella Blondor Multi Blonde", amount: 2.0 },
          { name: "Toner", developer: "10vol", ratio: "1:2", processingMin: 20, notes: "$60.00", product: "Wella /16 Pearl Blonde", amount: 1.5 },
        ],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding test data...\n");

  // Clear existing test data
  await prisma.testFormula.deleteMany();
  await prisma.testServiceSession.deleteMany();
  await prisma.testClient.deleteMany();
  console.log("🗑  Cleared existing test data");

  for (const clientData of CLIENTS) {
    const client = await prisma.testClient.create({
      data: {
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
      },
    });

    for (const sessionData of clientData.sessions) {
      const session = await prisma.testServiceSession.create({
        data: {
          clientId: client.id,
          date: daysAgo(sessionData.daysAgo),
          notes: sessionData.notes,
        },
      });

      for (const f of sessionData.formulas) {
        await prisma.testFormula.create({
          data: {
            sessionId: session.id,
            name: f.name,
            developer: f.developer ?? null,
            ratio: f.ratio ?? null,
            processingMin: f.processingMin ?? null,
            notes: f.notes ?? null,
          },
        });
      }
    }

    console.log(`  ✅ ${client.name} — ${clientData.sessions.length} sessions`);
  }

  console.log("\n🎉 Done! Test data seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
