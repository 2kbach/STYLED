import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, notes, processingMin, formulas } = body;

  if (!clientId) {
    return NextResponse.json(
      { error: "Client ID is required" },
      { status: 400 }
    );
  }

  // Verify client belongs to user
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
      processingMin: processingMin || null,
      formulas: {
        create: (formulas ?? []).map(
          (f: {
            name: string;
            components: {
              product: string;
              grams: number;
              developer: string | null;
              ratio: string | null;
            }[];
          }) => ({
            name: f.name,
            components: {
              create: f.components.map((c) => ({
                product: c.product,
                grams: c.grams,
                developer: c.developer,
                ratio: c.ratio,
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

  // Update client's updatedAt
  await prisma.client.update({
    where: { id: clientId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(serviceSession);
}
