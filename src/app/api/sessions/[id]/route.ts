import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  // Verify session belongs to user
  const existing = await prisma.serviceSession.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = await req.json();
  const { notes, formulas } = body;

  // Delete existing formulas (cascade deletes components)
  await prisma.formula.deleteMany({ where: { sessionId: id } });

  // Update session notes and recreate formulas
  const updated = await prisma.serviceSession.update({
    where: { id },
    data: {
      notes: notes ?? null,
      formulas: {
        create: (formulas ?? []).map(
          (f: {
            name: string;
            developer: string | null;
            ratio: string | null;
            processingMin: number | null;
            notes: string | null;
            components: {
              product: string;
              amount: number;
              unit: string;
            }[];
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
    include: {
      formulas: { include: { components: true } },
    },
  });

  return NextResponse.json(updated);
}
