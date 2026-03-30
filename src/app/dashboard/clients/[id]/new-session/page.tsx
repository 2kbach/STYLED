import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
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

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!client) notFound();

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 py-3 border-b border-border bg-card">
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="inline-flex items-center gap-1 text-accent text-sm mb-1"
        >
          <ArrowLeft className="w-4 h-4" /> {client.name}
        </Link>
        <h1 className="text-xl font-bold">New Session</h1>
      </header>
      <main className="flex-1 px-4 py-6">
        <NewSessionForm clientId={client.id} />
      </main>
    </div>
  );
}
