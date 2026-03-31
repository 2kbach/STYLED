import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { turso } from "@/lib/turso";
import { BottomNav } from "@/components/bottom-nav";
import { ClientList } from "@/components/client-list";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const cookieStore = await cookies();
  const isTestMode = cookieStore.get("test_mode")?.value === "1";

  let clients;

  if (isTestMode) {
    const result = await turso.execute(`
      SELECT c.id, c.name, c.phone, c.email,
             s.date as lastDate
      FROM TestClient c
      LEFT JOIN TestServiceSession s ON s.clientId = c.id
        AND s.date = (SELECT MAX(s2.date) FROM TestServiceSession s2 WHERE s2.clientId = c.id)
      GROUP BY c.id
      ORDER BY lastDate DESC
    `);
    clients = result.rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      phone: r.phone as string | null,
      email: r.email as string | null,
      sessions: r.lastDate ? [{ date: new Date(r.lastDate as string) }] : [],
    }));
  } else {
    const raw = await prisma.client.findMany({
      where: { userId: session.user.id },
      include: { sessions: { orderBy: { date: "desc" }, take: 1 } },
      orderBy: { name: "asc" },
    });
    clients = raw.sort((a, b) => {
      const aDate = a.sessions[0]?.date ?? new Date(0);
      const bDate = b.sessions[0]?.date ?? new Date(0);
      return bDate.getTime() - aDate.getTime();
    });
  }

  return (
    <div className="flex-1 flex flex-col pb-20">
      <DashboardHeader user={session.user} isTestMode={isTestMode} />
      <main className="flex-1 px-4 py-4">
        <ClientList clients={clients} />
      </main>
      <BottomNav />
    </div>
  );
}
