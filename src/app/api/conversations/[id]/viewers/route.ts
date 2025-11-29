import { NextRequest, NextResponse } from "next/server";

// Minimal stub to satisfy Next.js build - feature not implemented
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ viewers: [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ error: "Feature not implemented" }, { status: 501 });
}