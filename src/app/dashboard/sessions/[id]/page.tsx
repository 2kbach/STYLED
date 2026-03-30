import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SessionDetailClient } from "@/components/session-detail-client";

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
      photos: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!serviceSession) notFound();

  return (
    <SessionDetailClient
      session={JSON.parse(JSON.stringify(serviceSession))}
    />
  );
}
