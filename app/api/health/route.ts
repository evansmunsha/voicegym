import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, uptime: Date.now() }, { status: 200 });
}
