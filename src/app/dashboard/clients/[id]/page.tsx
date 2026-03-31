import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { PlusCircle, ChevronRight, ArrowLeft, Scissors, FlaskConical, FileStack, Wand2 } from "lucide-react";

function getSessionIcon(formulaNames: string[]) {
  if (formulaNames.length >= 3) return FileStack;
  const joined = formulaNames.join(" ").toLowerCase();
  if (/color|colour|highlight|balayage|toner|gloss|bleach/.test(joined)) return FlaskConical;
  if (/haircut|cut|trim|blowout|blowdry|blow dry/.test(joined)) return Scissors;
  return Wand2;
}

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
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
            {client.sessions.map((s) => {
              const formulaNames = s.formulas.map((f) => f.name);
              const Icon = getSessionIcon(formulaNames);
              const stylistLine = s.notes?.split("\n").find((l) => l.startsWith("Stylist: "));
              const stylistFull = stylistLine ? stylistLine.replace("Stylist: ", "").trim() : null;
              const stylistFirst = stylistFull?.split(" ")[0] ?? null;
              const isMeg = stylistFull?.toLowerCase().includes("auerbach") || stylistFull?.toLowerCase().includes("meg");
              return (
                <Link
                  key={s.id}
                  href={`/dashboard/sessions/${s.id}`}
                  className="touch-target flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {new Date(s.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {formulaNames.length > 0 && (
                      <p className="text-xs text-muted truncate">
                        {formulaNames.join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {stylistFirst && (
                      <p className={`text-xs font-medium ${isMeg ? "text-accent" : "text-muted"}`}>
                        {isMeg ? "Me" : stylistFirst}
                      </p>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
