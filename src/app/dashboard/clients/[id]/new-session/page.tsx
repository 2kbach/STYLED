import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { turso } from "@/lib/turso";
import { NewSessionForm } from "@/components/new-session-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { id } = await params;
  const cookieStore = await cookies();
  const isTestMode = cookieStore.get("test_mode")?.value === "1";

  let clientName: string;

  if (isTestMode) {
    const { rows } = await turso.execute({ sql: "SELECT name FROM TestClient WHERE id = ?", args: [id] });
    if (!rows.length) notFound();
    clientName = rows[0].name as string;
  } else {
    const client = await prisma.client.findFirst({ where: { id, userId: session.user.id } });
    if (!client) notFound();
    clientName = client.name;
  }

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 py-3 border-b border-border bg-card">
        <Link
          href={`/dashboard/clients/${id}`}
          className="inline-flex items-center gap-1 text-accent text-sm mb-1"
        >
          <ArrowLeft className="w-4 h-4" /> {clientName}
        </Link>
        <h1 className="text-xl font-bold">New Session</h1>
      </header>
      <main className="flex-1 px-4 py-6">
        <NewSessionForm clientId={id} isTestMode={isTestMode} />
      </main>
    </div>
  );
}
