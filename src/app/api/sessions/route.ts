import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { clientId, notes, formulas } = body;

  if (!clientId) {
    return NextResponse.json(
      { error: "Client ID is required" },
      { status: 400 }
    );
  }

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

  await prisma.client.update({
    where: { id: clientId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(serviceSession);
}
