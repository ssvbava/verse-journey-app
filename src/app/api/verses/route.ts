import { NextRequest, NextResponse } from "next/server";
import {
  getVerseByDay,
  getVerse,
  getVersesByChapter,
  getDayForVerse,
  TOTAL_DAYS,
} from "@/lib/gita";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const day = searchParams.get("day");
  const chapter = searchParams.get("chapter");
  const verse = searchParams.get("verse");

  if (day) {
    const dayNum = parseInt(day, 10);
    const result = getVerseByDay(dayNum);
    if (!result) {
      return NextResponse.json(
        { error: "Day not found", total_days: TOTAL_DAYS },
        { status: 404 }
      );
    }
    return NextResponse.json({ verse: result, total_days: TOTAL_DAYS });
  }

  if (chapter && verse) {
    const ch = parseInt(chapter, 10);
    const v = parseInt(verse, 10);
    const result = getVerse(ch, v);
    if (!result) {
      return NextResponse.json(
        { error: "Verse not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ verse: result, total_days: TOTAL_DAYS });
  }

  if (chapter) {
    const ch = parseInt(chapter, 10);
    const verses = getVersesByChapter(ch);
    if (!verses.length) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ verses, total_days: TOTAL_DAYS });
  }

  return NextResponse.json(
    { error: "Provide ?day=N or ?chapter=N or ?chapter=N&verse=M" },
    { status: 400 }
  );
}
