import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { enabled } = await req.json();
  const res = NextResponse.json({ ok: true });
  if (enabled) {
    res.cookies.set("test_mode", "1", { path: "/", httpOnly: false, maxAge: 60 * 60 * 24 * 30 });
  } else {
    res.cookies.delete("test_mode");
  }
  return res;
}
