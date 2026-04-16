import {
  getChapters,
  getVerseByDay,
  getVersesByChapter,
  getVerse,
  getDayForVerse,
  getChapterForDay,
  TOTAL_DAYS,
} from "@/lib/gita";

describe("Gita data library", () => {
  test("TOTAL_DAYS is 701", () => {
    expect(TOTAL_DAYS).toBe(701);
  });

  test("getChapters returns 18 chapters", () => {
    const chapters = getChapters();
    expect(chapters).toHaveLength(18);
    expect(chapters[0].number).toBe(1);
    expect(chapters[0].name).toBe("Arjuna Vishada Yoga");
    expect(chapters[17].number).toBe(18);
    expect(chapters[17].name).toBe("Moksha Sanyasa Yoga");
  });

  test("each chapter has required fields", () => {
    const chapters = getChapters();
    for (const ch of chapters) {
      expect(ch).toHaveProperty("number");
      expect(ch).toHaveProperty("name");
      expect(ch).toHaveProperty("subtitle");
      expect(ch).toHaveProperty("verse_count");
      expect(ch.verse_count).toBeGreaterThan(0);
    }
  });

  test("getVerseByDay returns correct verse for day 1", () => {
    const verse = getVerseByDay(1);
    expect(verse).not.toBeNull();
    expect(verse!.day).toBe(1);
    expect(verse!.chapter).toBe(1);
    expect(verse!.verse).toBe(1);
    expect(verse!.sanskrit).toBeTruthy();
    expect(verse!.translation).toBeTruthy();
  });

  test("getVerseByDay returns null for invalid days", () => {
    expect(getVerseByDay(0)).toBeNull();
    expect(getVerseByDay(-1)).toBeNull();
    expect(getVerseByDay(10000)).toBeNull();
  });

  test("getVerseByDay returns last verse correctly", () => {
    const verse = getVerseByDay(TOTAL_DAYS);
    expect(verse).not.toBeNull();
    expect(verse!.chapter).toBe(18);
  });

  test("getVersesByChapter returns correct count for chapter 1", () => {
    const verses = getVersesByChapter(1);
    expect(verses.length).toBe(47);
    expect(verses[0].chapter).toBe(1);
    expect(verses[0].verse).toBe(1);
  });

  test("getVersesByChapter returns empty for invalid chapter", () => {
    expect(getVersesByChapter(0)).toHaveLength(0);
    expect(getVersesByChapter(19)).toHaveLength(0);
  });

  test("getVerse returns correct verse for chapter 2, verse 47", () => {
    const verse = getVerse(2, 47);
    expect(verse).not.toBeNull();
    expect(verse!.chapter).toBe(2);
    expect(verse!.verse).toBe(47);
    // This is the famous "Karmanye Vadhikaraste" verse
    expect(verse!.sanskrit).toBeTruthy();
  });

  test("getVerse returns null for invalid", () => {
    expect(getVerse(0, 1)).toBeNull();
    expect(getVerse(1, 999)).toBeNull();
  });

  test("getDayForVerse returns correct day", () => {
    const day = getDayForVerse(1, 1);
    expect(day).toBe(1);
    // Chapter 2 starts after chapter 1 (47 verses)
    const day2_1 = getDayForVerse(2, 1);
    expect(day2_1).toBe(48);
  });

  test("getDayForVerse returns null for invalid", () => {
    expect(getDayForVerse(0, 1)).toBeNull();
  });

  test("getChapterForDay returns correct chapter", () => {
    const ch = getChapterForDay(1);
    expect(ch).not.toBeNull();
    expect(ch!.number).toBe(1);

    const ch2 = getChapterForDay(48);
    expect(ch2).not.toBeNull();
    expect(ch2!.number).toBe(2);
  });

  test("getChapterForDay returns null for invalid day", () => {
    expect(getChapterForDay(0)).toBeNull();
    expect(getChapterForDay(10000)).toBeNull();
  });

  test("all verses have required fields", () => {
    for (let day = 1; day <= 5; day++) {
      const verse = getVerseByDay(day);
      expect(verse).not.toBeNull();
      expect(verse!.day).toBe(day);
      expect(verse!.chapter).toBeGreaterThanOrEqual(1);
      expect(verse!.chapter).toBeLessThanOrEqual(18);
      expect(verse!.verse).toBeGreaterThanOrEqual(1);
      expect(typeof verse!.sanskrit).toBe("string");
      expect(typeof verse!.translation).toBe("string");
    }
  });

  test("verse counts per chapter sum to TOTAL_DAYS", () => {
    let total = 0;
    for (let ch = 1; ch <= 18; ch++) {
      total += getVersesByChapter(ch).length;
    }
    expect(total).toBe(TOTAL_DAYS);
  });
});
