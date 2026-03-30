import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ clients: [], sessions: [] });
  }

  const query = `%${q}%`;

  // Search clients by name, phone, notes
  const clients = await prisma.client.findMany({
    where: {
      userId: session.user.id,
      OR: [
        { name: { contains: q } },
        { phone: { contains: q } },
        { notes: { contains: q } },
      ],
    },
    include: {
      sessions: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    take: 10,
  });

  // Search sessions by notes, formula names, or product names
  const sessions = await prisma.serviceSession.findMany({
    where: {
      userId: session.user.id,
      OR: [
        { notes: { contains: q } },
        {
          formulas: {
            some: {
              OR: [
                { name: { contains: q } },
                { notes: { contains: q } },
                { developer: { contains: q } },
                {
                  components: {
                    some: { product: { contains: q } },
                  },
                },
              ],
            },
          },
        },
        {
          client: { name: { contains: q } },
        },
      ],
    },
    include: {
      client: true,
      formulas: {
        include: { components: true },
      },
    },
    orderBy: { date: "desc" },
    take: 20,
  });

  return NextResponse.json({ clients, sessions });
}
