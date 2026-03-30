import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.AUTH_GOOGLE_ID ?? "NOT SET";
  return NextResponse.json({
    clientIdPrefix: clientId.substring(0, 15) + "...",
    clientIdLength: clientId.length,
    hasSecret: !!process.env.AUTH_GOOGLE_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    nextauthUrl: process.env.NEXTAUTH_URL ?? "NOT SET",
    authUrl: process.env.AUTH_URL ?? "NOT SET",
  });
}
