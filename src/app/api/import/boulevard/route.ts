import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const SCRAPER_KEY = process.env.STYLED_SCRAPER_KEY;

interface BlvdOrder {
  date: string;
  services: { description: string; price: number }[];
  gratuity: number | null;
  total: number | null;
  totalSale: number | null;
  paymentMethod: string | null;
  dateTime: string | null;
  status: string;
}

interface BlvdClient {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clientNotes: string | null;
  blvdId: string;
  appointments: { date: string; services: string; status: string }[];
  orders: BlvdOrder[];
}

export async function POST(req: Request) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!SCRAPER_KEY || token !== SCRAPER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clients, userId } = body as { clients: BlvdClient[]; userId?: string };

  if (!clients || !Array.isArray(clients)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Find the target user (default to first user if not specified)
  let targetUserId = userId;
  if (!targetUserId) {
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      return NextResponse.json({ error: "No users found" }, { status: 400 });
    }
    targetUserId = firstUser.id;
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const blvdClient of clients) {
    try {
      const clientName =
        `${blvdClient.firstName} ${blvdClient.lastName}`.trim() ||
        blvdClient.name ||
        "Unknown";

      // Upsert client (match by name + user)
      let client = await prisma.client.findFirst({
        where: {
          userId: targetUserId,
          name: clientName,
        },
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            name: clientName,
            phone: blvdClient.phone || null,
            notes: [
              blvdClient.clientNotes,
              blvdClient.email ? `Email: ${blvdClient.email}` : null,
              `Boulevard ID: ${blvdClient.blvdId}`,
            ]
              .filter(Boolean)
              .join("\n"),
            userId: targetUserId,
            updatedAt: new Date(),
          },
        });
      }

      // Import orders as sessions
      for (const order of blvdClient.orders) {
        // Parse the date
        let sessionDate: Date;
        if (order.dateTime) {
          sessionDate = new Date(order.dateTime);
        } else if (order.date) {
          sessionDate = new Date(order.date);
        } else {
          continue;
        }

        if (isNaN(sessionDate.getTime())) continue;

        // Check for duplicate (same client, same date, within 1 day)
        const dayStart = new Date(sessionDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(sessionDate);
        dayEnd.setHours(23, 59, 59, 999);

        const existing = await prisma.serviceSession.findFirst({
          where: {
            clientId: client.id,
            date: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Build notes
        const sessionNotes = [
          order.paymentMethod ? `Payment: ${order.paymentMethod}` : null,
          order.gratuity ? `Gratuity: $${order.gratuity.toFixed(2)}` : null,
          order.status ? `Status: ${order.status}` : null,
          `Imported from Boulevard`,
        ]
          .filter(Boolean)
          .join("\n");

        // Create session with each service as a formula
        const formulas = order.services.map((svc) => ({
          name: svc.description.replace(/with Meg Auerbach/gi, "").trim(),
          developer: null,
          ratio: null,
          processingMin: null,
          notes: `$${svc.price.toFixed(2)}`,
          components: {
            create: [] as { product: string; amount: number; unit: string }[],
          },
        }));

        // If no parsed services, create one from the appointment data
        if (formulas.length === 0) {
          const matchingAppt = blvdClient.appointments.find(
            (a) => a.date === order.date
          );
          if (matchingAppt?.services) {
            formulas.push({
              name: matchingAppt.services
                .replace(/\([\$\d.,]+\)/g, "")
                .trim(),
              developer: null,
              ratio: null,
              processingMin: null,
              notes: `$${order.totalSale?.toFixed(2) || "0.00"}`,
              components: {
                create: [],
              },
            });
          }
        }

        await prisma.serviceSession.create({
          data: {
            date: sessionDate,
            notes: sessionNotes,
            clientId: client.id,
            userId: targetUserId,
            formulas: {
              create: formulas,
            },
          },
        });
      }

      imported++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${blvdClient.name}: ${msg}`);
    }
  }

  return NextResponse.json({
    imported,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
    total: clients.length,
  });
}
