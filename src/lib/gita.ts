import gitaData from "@/data/gita_data.json";
import type { GitaData, Chapter, Verse } from "./types";

const data = gitaData as GitaData;

export const TOTAL_DAYS = data.verses.length;

export function getChapters(): Chapter[] {
  return data.chapters;
}

export function getVerseByDay(day: number): Verse | null {
  if (day < 1 || day > TOTAL_DAYS) return null;
  return data.verses[day - 1] || null;
}

export function getVersesByChapter(chapter: number): Verse[] {
  return data.verses.filter((v) => v.chapter === chapter);
}

export function getVerse(chapter: number, verse: number): Verse | null {
  return (
    data.verses.find((v) => v.chapter === chapter && v.verse === verse) || null
  );
}

export function getDayForVerse(chapter: number, verse: number): number | null {
  const found = data.verses.find(
    (v) => v.chapter === chapter && v.verse === verse
  );
  return found ? found.day : null;
}

export function getChapterForDay(day: number): Chapter | null {
  const verse = getVerseByDay(day);
  if (!verse) return null;
  return data.chapters.find((c) => c.number === verse.chapter) || null;
}
