import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { id } = await params;

  const serviceSession = await prisma.serviceSession.findFirst({
    where: { id, userId: session.user.id },
    include: {
      client: true,
      formulas: {
        include: { components: true },
      },
      photos: true,
    },
  });

  if (!serviceSession) notFound();

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 py-3 border-b border-border bg-card">
        <Link
          href={`/dashboard/clients/${serviceSession.clientId}`}
          className="inline-flex items-center gap-1 text-accent text-sm mb-1"
        >
          <ArrowLeft className="w-4 h-4" /> {serviceSession.client.name}
        </Link>
        <h1 className="text-xl font-bold">
          {new Date(serviceSession.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h1>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {serviceSession.formulas.map((formula) => (
          <div
            key={formula.id}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <h3 className="font-semibold text-lg">{formula.name}</h3>
            <div className="space-y-2">
              {formula.components.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between pl-3 border-l-2 border-accent-light py-1"
                >
                  <div>
                    <p className="font-medium">{comp.product}</p>
                    <div className="flex gap-3 text-sm text-muted">
                      {comp.developer && <span>{comp.developer}</span>}
                      {comp.ratio && <span>{comp.ratio}</span>}
                    </div>
                  </div>
                  <span className="font-mono text-lg font-semibold">
                    {comp.grams}g
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {serviceSession.processingMin && (
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <span className="text-sm text-muted">Processing time:</span>{" "}
            <span className="font-medium">
              {serviceSession.processingMin} min
            </span>
          </div>
        )}

        {serviceSession.notes && (
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-sm text-muted mb-1">Notes</p>
            <p>{serviceSession.notes}</p>
          </div>
        )}
      </main>
    </div>
  );
}
