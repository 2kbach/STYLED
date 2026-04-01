import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { turso } from "@/lib/turso";
import { NextResponse } from "next/server";

function cuid() {
  return "c" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isTest = searchParams.get("test") === "1";

  const body = await req.json();
  const { clientId, notes, formulas } = body;

  if (!clientId) {
    return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
  }

  // Test mode — save to Turso test tables
  if (isTest) {
    const clientRow = await turso.execute({ sql: "SELECT id FROM TestClient WHERE id = ?", args: [clientId] });
    if (!clientRow.rows.length) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const sessionId = cuid();
    await turso.execute({
      sql: "INSERT INTO TestServiceSession (id, date, notes, createdAt, clientId) VALUES (?, ?, ?, ?, ?)",
      args: [sessionId, new Date().toISOString(), notes || null, new Date().toISOString(), clientId],
    });

    for (const f of formulas ?? []) {
      const formulaId = cuid();
      await turso.execute({
        sql: "INSERT INTO TestFormula (id, name, developer, ratio, processingMin, notes, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [formulaId, f.name, f.developer ?? null, f.ratio ?? null, f.processingMin ?? null, f.notes ?? null, sessionId],
      });
      for (const c of f.components ?? []) {
        await turso.execute({
          sql: "INSERT INTO TestFormulaComponent (id, formulaId, product, amount, unit) VALUES (?, ?, ?, ?, ?)",
          args: [cuid(), formulaId, c.product, c.amount, c.unit || "oz"],
        });
      }
    }

    return NextResponse.json({ id: sessionId });
  }

  // Real mode — save to Prisma
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.user.id },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const serviceSession = await prisma.serviceSession.create({
    data: {
      clientId,
      userId: session.user.id,
      notes: notes || null,
      formulas: {
        create: (formulas ?? []).map(
          (f: {
            name: string;
            developer: string | null;
            ratio: string | null;
            processingMin: number | null;
            notes: string | null;
            components: { product: string; amount: number; unit: string; }[];
          }) => ({
            name: f.name,
            developer: f.developer,
            ratio: f.ratio,
            processingMin: f.processingMin,
            notes: f.notes,
            components: {
              create: f.components.map((c) => ({
                product: c.product,
                amount: c.amount,
                unit: c.unit || "oz",
              })),
            },
          })
        ),
      },
    },
    include: { formulas: { include: { components: true } } },
  });

  await prisma.client.update({
    where: { id: clientId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(serviceSession);
}
