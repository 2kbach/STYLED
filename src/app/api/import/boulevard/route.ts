import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const SCRAPER_KEY = process.env.STYLED_SCRAPER_KEY;

interface BlvdAppointment {
  date: string;
  location: string;
  services: string;
  staff: string;
  status: string;
  isProvider: boolean;
}

interface BlvdOrder {
  date: string;
  orderNumber: string;
  totalSaleText: string;
  totalSale: number;
  status: string;
  gratuity: number | null;
}

interface BlvdClient {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clientNotes: string | null;
  blvdId: string;
  appointments: BlvdAppointment[];
  orders: BlvdOrder[];
}

export async function POST(req: Request) {
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

      // Upsert client — match by blvdId first, then by name
      let client = blvdClient.blvdId
        ? await prisma.client.findFirst({
            where: { userId: targetUserId, blvdId: blvdClient.blvdId },
          })
        : null;

      if (!client) {
        client = await prisma.client.findFirst({
          where: { userId: targetUserId, name: clientName },
        });
      }

      if (client) {
        // Update existing client with any new data
        // Only update name if new name has more info (e.g., full name vs last-name-only)
        const shouldUpdateName = clientName.includes(" ") && !client.name.includes(" ");
        client = await prisma.client.update({
          where: { id: client.id },
          data: {
            name: shouldUpdateName ? clientName : client.name,
            phone: blvdClient.phone || client.phone,
            email: blvdClient.email || client.email,
            blvdId: blvdClient.blvdId || client.blvdId,
            updatedAt: new Date(),
          },
        });
      } else {
        client = await prisma.client.create({
          data: {
            name: clientName,
            phone: blvdClient.phone || null,
            email: blvdClient.email || null,
            blvdId: blvdClient.blvdId || null,
            notes: null,
            userId: targetUserId,
            updatedAt: new Date(),
          },
        });
      }

      // Import appointments as sessions
      for (const appt of blvdClient.appointments) {
        if (!appt.date || appt.status?.toLowerCase() === "cancelled") continue;

        const sessionDate = new Date(appt.date);
        if (isNaN(sessionDate.getTime())) continue;

        // Check for duplicate
        const dayStart = new Date(sessionDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(sessionDate);
        dayEnd.setHours(23, 59, 59, 999);

        const existing = await prisma.serviceSession.findFirst({
          where: {
            clientId: client.id,
            date: { gte: dayStart, lte: dayEnd },
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Parse services string: "Highlights ($450.00)\nWomens Haircut ($225.00)"
        const serviceLines = appt.services.split("\n").filter(Boolean);
        const formulas = serviceLines.map((line) => {
          const priceMatch = line.match(/\(\$([\d,.]+)\)/);
          const price = priceMatch ? parseFloat(priceMatch[1].replace(",", "")) : 0;
          const serviceName = line.replace(/\(\$[\d,.]+\)/, "").trim();
          return {
            name: serviceName,
            developer: null,
            ratio: null,
            processingMin: null,
            notes: price > 0 ? `$${price.toFixed(2)}` : null,
            components: { create: [] as { product: string; amount: number; unit: string }[] },
          };
        });

        // Find matching order for total
        const matchingOrder = blvdClient.orders.find((o) => o.date === appt.date);

        const sessionNotes = [
          appt.staff ? `Stylist: ${appt.staff}` : null,
          appt.isProvider ? null : `(Not Meg's appointment)`,
          matchingOrder
            ? `Order #${matchingOrder.orderNumber} — Total: ${matchingOrder.totalSaleText}${matchingOrder.gratuity ? ` — Grat: $${matchingOrder.gratuity.toFixed(2)}` : ""}`
            : null,
          `Imported from Boulevard`,
        ]
          .filter(Boolean)
          .join("\n");

        await prisma.serviceSession.create({
          data: {
            date: sessionDate,
            notes: sessionNotes,
            clientId: client.id,
            userId: targetUserId,
            formulas: {
              create: formulas.length > 0 ? formulas : [{
                name: appt.services.replace(/\(\$[\d,.]+\)/g, "").trim() || "Service",
                developer: null,
                ratio: null,
                processingMin: null,
                notes: matchingOrder ? matchingOrder.totalSaleText : null,
                components: { create: [] },
              }],
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
