import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const original = await prisma.serviceSession.findFirst({
    where: { id, userId: session.user.id },
    include: {
      formulas: {
        include: { components: true },
      },
    },
  });

  if (!original) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Create new session with today's date, copying all formulas
  const duplicate = await prisma.serviceSession.create({
    data: {
      clientId: original.clientId,
      userId: session.user.id,
      notes: original.notes,
      formulas: {
        create: original.formulas.map((f) => ({
          name: f.name,
          developer: f.developer,
          ratio: f.ratio,
          processingMin: f.processingMin,
          notes: f.notes,
          components: {
            create: f.components.map((c) => ({
              product: c.product,
              amount: c.amount,
              unit: c.unit,
            })),
          },
        })),
      },
    },
  });

  // Update client's updatedAt
  await prisma.client.update({
    where: { id: original.clientId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ id: duplicate.id, clientId: original.clientId });
}
