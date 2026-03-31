import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BottomNav } from "@/components/bottom-nav";
import { ClientList } from "@/components/client-list";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    include: {
      sessions: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  const sortedClients = clients.sort((a, b) => {
    const aDate = a.sessions[0]?.date ?? new Date(0);
    const bDate = b.sessions[0]?.date ?? new Date(0);
    return bDate.getTime() - aDate.getTime();
  });

  return (
    <div className="flex-1 flex flex-col pb-20">
      <DashboardHeader user={session.user} />

      <main className="flex-1 px-4 py-4">
        <ClientList clients={sortedClients} />
      </main>

      <BottomNav />
    </div>
  );
}
