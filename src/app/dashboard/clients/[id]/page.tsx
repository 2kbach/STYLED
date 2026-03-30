import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { PlusCircle, ChevronRight, ArrowLeft } from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
    include: {
      sessions: {
        orderBy: { date: "desc" },
        include: {
          formulas: {
            include: { components: true },
          },
        },
      },
    },
  });

  if (!client) notFound();

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 py-3 border-b border-border bg-card">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-accent text-sm mb-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-xl font-bold">{client.name}</h1>
        {client.phone && (
          <p className="text-sm text-muted">{client.phone}</p>
        )}
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sessions</h2>
          <Link
            href={`/dashboard/clients/${client.id}/new-session`}
            className="touch-target inline-flex items-center gap-1 text-accent font-medium text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Session
          </Link>
        </div>

        {client.sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4">No sessions yet</p>
            <Link
              href={`/dashboard/clients/${client.id}/new-session`}
              className="touch-target inline-flex items-center gap-2 bg-accent text-white font-semibold rounded-xl px-6 py-4 text-lg hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-5 h-5" />
              Start first session
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {client.sessions.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/sessions/${s.id}`}
                className="touch-target block bg-card rounded-xl border border-border px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {new Date(s.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {s.formulas.length > 0 && (
                      <p className="text-sm text-muted">
                        {s.formulas.map((f) => f.name).join(", ")}
                      </p>
                    )}
                    {s.notes && (
                      <p className="text-sm text-muted mt-1 line-clamp-1">
                        {s.notes}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
