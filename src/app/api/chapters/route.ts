import { NextResponse } from "next/server";
import { getChapters } from "@/lib/gita";

export async function GET() {
  const chapters = getChapters();
  return NextResponse.json({ chapters });
}
