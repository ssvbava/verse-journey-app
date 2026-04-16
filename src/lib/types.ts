export interface Chapter {
  number: number;
  name: string;
  subtitle: string;
  verse_count: number;
}

export interface Verse {
  day: number;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  word_meanings: string;
}

export interface GitaData {
  chapters: Chapter[];
  verses: Verse[];
}
