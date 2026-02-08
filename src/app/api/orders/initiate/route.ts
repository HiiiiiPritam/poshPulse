import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // ⛔ SECURITY: Online payments are disabled.
  return NextResponse.json(
    { error: "Online payments are currently disabled. Please use COD." },
    { status: 403 }
  );
}
