import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const sessionId = formData.get("sessionId") as string;
  const angle = (formData.get("angle") as string) || null;
  const timing = (formData.get("timing") as string) || null;
  const lighting = (formData.get("lighting") as string) || null;

  if (!file || !sessionId) {
    return NextResponse.json(
      { error: "File and sessionId are required" },
      { status: 400 }
    );
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
    data: {
      url: blob.url,
      angle,
      timing,
      lighting,
      sessionId,
    },
  });

  return NextResponse.json(photo);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { photoId } = await req.json();

  const photo = await prisma.photo.findFirst({
    where: { id: photoId },
    include: { session: true },
  });

  if (!photo || photo.session.userId !== session.user.id) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  // Delete from Vercel Blob
  await del(photo.url);

  // Delete from database
  await prisma.photo.delete({ where: { id: photoId } });

  return NextResponse.json({ success: true });
}
