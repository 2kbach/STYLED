import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { turso } from "@/lib/turso";
import { SessionDetailClient } from "@/components/session-detail-client";

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string; photos?: string; test?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { id } = await params;
  const { edit, photos, test } = await searchParams;
  const isTestMode = test === "1";

  if (isTestMode) {
    const sessRow = await turso.execute({ sql: "SELECT * FROM TestServiceSession WHERE id = ?", args: [id] });
    if (!sessRow.rows.length) notFound();
    const s = sessRow.rows[0];

    const clientRow = await turso.execute({ sql: "SELECT * FROM TestClient WHERE id = ?", args: [s.clientId as string] });
    const c = clientRow.rows[0];

    const fRows = await turso.execute({ sql: "SELECT * FROM TestFormula WHERE sessionId = ?", args: [id] });

    const serviceSession = {
      id: s.id as string,
      date: new Date(s.date as string).toISOString(),
      notes: s.notes as string | null,
      createdAt: new Date(s.createdAt as string).toISOString(),
      clientId: s.clientId as string,
      userId: "test",
      client: { id: c.id as string, name: c.name as string, phone: c.phone as string | null, email: c.email as string | null },
      formulas: fRows.rows.map((f) => ({
        id: f.id as string, name: f.name as string, developer: f.developer as string | null, ratio: f.ratio as string | null,
        processingMin: f.processingMin as number | null, notes: f.notes as string | null, sessionId: f.sessionId as string,
        components: [],
      })),
      photos: [],
    };

    return (
      <SessionDetailClient
        session={serviceSession}
        startEditing={false}
        startPhotos={false}
        isTestMode
      />
    );
  }

  const serviceSession = await prisma.serviceSession.findFirst({
    where: { id, userId: session.user.id },
    include: { client: true, formulas: { include: { components: true } }, photos: { orderBy: { createdAt: "asc" } } },
  });

  if (!serviceSession) notFound();

  return (
    <SessionDetailClient
      session={JSON.parse(JSON.stringify(serviceSession))}
      startEditing={edit === "1"}
      startPhotos={photos === "1"}
    />
  );
}
