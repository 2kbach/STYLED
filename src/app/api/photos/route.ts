import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { turso } from "@/lib/turso";
import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";

function cuid() {
  return "c" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const isTest = searchParams.get("test") === "1";

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  if (isTest) {
    const { rows } = await turso.execute({
      sql: "SELECT * FROM TestPhoto WHERE sessionId = ? ORDER BY createdAt ASC",
      args: [sessionId],
    });
    return NextResponse.json(rows.map(r => ({
      id: r.id, url: r.url, angle: r.angle, timing: r.timing,
      lighting: r.lighting, sessionId: r.sessionId,
    })));
  }

  const serviceSession = await prisma.serviceSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
  });

  if (!serviceSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const photos = await prisma.photo.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(photos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isTest = searchParams.get("test") === "1";

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const sessionId = formData.get("sessionId") as string;
  const angle = (formData.get("angle") as string) || null;
  const timing = (formData.get("timing") as string) || null;
  const lighting = (formData.get("lighting") as string) || null;

  if (!file || !sessionId) {
    return NextResponse.json({ error: "File and sessionId are required" }, { status: 400 });
  }

  if (isTest) {
    const sessionRow = await turso.execute({ sql: "SELECT id FROM TestServiceSession WHERE id = ?", args: [sessionId] });
    if (!sessionRow.rows.length) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const blob = await put(`test-photos/${sessionId}/${Date.now()}-${file.name}`, file, { access: "public" });
    const photoId = cuid();
    await turso.execute({
      sql: "INSERT INTO TestPhoto (id, sessionId, url, angle, timing, lighting, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [photoId, sessionId, blob.url, angle, timing, lighting, new Date().toISOString()],
    });
    return NextResponse.json({ id: photoId, url: blob.url, angle, timing, lighting, sessionId });
  }

  // Verify session belongs to user
  const serviceSession = await prisma.serviceSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
  });

  if (!serviceSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Upload to Vercel Blob
  const blob = await put(`photos/${sessionId}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  // Save to database
  const photo = await prisma.photo.create({
    data: { url: blob.url, angle, timing, lighting, sessionId },
  });

  return NextResponse.json(photo);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isTest = searchParams.get("test") === "1";
  const { photoId } = await req.json();

  if (isTest) {
    const { rows } = await turso.execute({ sql: "SELECT * FROM TestPhoto WHERE id = ?", args: [photoId] });
    if (!rows.length) return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    await del(rows[0].url as string);
    await turso.execute({ sql: "DELETE FROM TestPhoto WHERE id = ?", args: [photoId] });
    return NextResponse.json({ success: true });
  }

  const photo = await prisma.photo.findFirst({
    where: { id: photoId },
    include: { session: true },
  });

  if (!photo || photo.session.userId !== session.user.id) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  await del(photo.url);
  await prisma.photo.delete({ where: { id: photoId } });

  return NextResponse.json({ success: true });
}
