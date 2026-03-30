import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { del } from "@vercel/blob";
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

  const existing = await prisma.serviceSession.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const body = await req.json();
  const { date, notes, formulas } = body;

  // Delete existing formulas (cascade deletes components)
  await prisma.formula.deleteMany({ where: { sessionId: id } });

  // Update session and recreate formulas
  const updated = await prisma.serviceSession.update({
    where: { id },
    data: {
      ...(date ? { date: new Date(date) } : {}),
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.serviceSession.findFirst({
    where: { id, userId: session.user.id },
    include: { photos: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Delete photos from Vercel Blob
  for (const photo of existing.photos) {
    try {
      await del(photo.url);
    } catch {
      // Ignore blob deletion failures
    }
  }

  // Delete session (cascades to formulas, components, photos)
  await prisma.serviceSession.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
