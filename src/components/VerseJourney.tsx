"use client";

import { useState, useEffect, useCallback } from "react";
import type { Chapter, Verse } from "@/lib/types";

const TOTAL_DAYS = 701;

export default function VerseJourney() {
  const [currentDay, setCurrentDay] = useState(1);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [chapterVerses, setChapterVerses] = useState<Verse[]>([]);
  const [dayInput, setDayInput] = useState("1");
  const [showWordMeanings, setShowWordMeanings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load chapters on mount
  useEffect(() => {
    fetch("/api/chapters")
      .then((r) => r.json())
      .then((d) => setChapters(d.chapters))
      .catch(() => {});
  }, []);

  // Load verse for current day
  const loadDay = useCallback(async (day: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/verses?day=${day}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch verse");
      setCurrentVerse(data.verse);
      setSelectedChapter(data.verse.chapter);
      setCurrentDay(day);
      setDayInput(String(day));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch verse");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load verses for a chapter (for sloka selector)
  const loadChapterVerses = useCallback(async (ch: number) => {
    try {
      const res = await fetch(`/api/verses?chapter=${ch}`);
      const data = await res.json();
      if (res.ok) setChapterVerses(data.verses);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadDay(1);
  }, [loadDay]);

  useEffect(() => {
    loadChapterVerses(selectedChapter);
  }, [selectedChapter, loadChapterVerses]);

  const handleChapterSelect = (ch: number) => {
    setSelectedChapter(ch);
    setSidebarOpen(false);
    // Load first verse of chapter
    fetch(`/api/verses?chapter=${ch}&verse=1`)
      .then((r) => r.json())
      .then((d) => {
        if (d.verse) {
          setCurrentVerse(d.verse);
          setCurrentDay(d.verse.day);
          setDayInput(String(d.verse.day));
          setLoading(false);
          setError(null);
        }
      })
      .catch(() => {});
  };

  const handleSlokaSelect = (verse: Verse) => {
    setCurrentVerse(verse);
    setCurrentDay(verse.day);
    setDayInput(String(verse.day));
    setError(null);
    setLoading(false);
  };

  const handleDayGo = () => {
    const d = parseInt(dayInput, 10);
    if (d >= 1 && d <= TOTAL_DAYS) loadDay(d);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleDayGo();
  };

  const currentChapter = chapters.find((c) => c.number === selectedChapter);
  const progress = ((currentDay / TOTAL_DAYS) * 100).toFixed(1);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0f14]">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#2a2a3a]">
        <h1 className="text-lg font-bold text-[#f59e0b]">
          ॐ Verse Journey
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-[#1a1a24] text-[#e8e6e3]"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-[#12121a] border-r border-[#2a2a3a]
          flex flex-col overflow-hidden transition-transform duration-300
        `}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-[#2a2a3a]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-[#f59e0b] tracking-wide">
              ॐ Verse Journey
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-[#6b7280] hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-1">
            <div className="flex justify-between text-xs text-[#6b7280] mb-1.5">
              <span className="uppercase tracking-wider font-semibold">Journey Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
              <div
                className="progress-bar h-full rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-[#6b7280] mt-1.5 text-center uppercase tracking-wider">
              Day {currentDay} of {TOTAL_DAYS} · {progress}%
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3">
            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
              Chapter
            </h3>
          </div>
          <div className="space-y-0.5 px-2">
            {chapters.map((ch) => (
              <button
                key={ch.number}
                onClick={() => handleChapterSelect(ch.number)}
                className={`chapter-btn w-full text-left px-3 py-2.5 rounded-md text-sm ${
                  selectedChapter === ch.number
                    ? "active text-[#f59e0b] font-medium"
                    : "text-[#9ca3af] hover:text-white"
                }`}
              >
                <span className="text-[#6b7280] mr-2">{ch.number}.</span>
                {ch.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sloka Selector */}
        <div className="border-t border-[#2a2a3a] p-4">
          <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">
            Sloka
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {chapterVerses.map((v) => (
              <button
                key={v.day}
                onClick={() => handleSlokaSelect(v)}
                className={`sloka-btn w-8 h-8 rounded text-xs font-medium flex items-center justify-center ${
                  currentVerse?.day === v.day
                    ? "active"
                    : "bg-[#1a1a24] text-[#9ca3af] border border-[#2a2a3a]"
                }`}
              >
                {v.verse}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="border-b border-[#2a2a3a] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadDay(Math.max(1, currentDay - 1))}
              disabled={currentDay <= 1}
              className="nav-btn px-3 py-1.5 rounded border border-[#2a2a3a] text-sm text-[#9ca3af]"
              title="First day"
            >
              «
            </button>
            <button
              onClick={() => loadDay(Math.max(1, currentDay - 1))}
              disabled={currentDay <= 1}
              className="nav-btn px-3 py-1.5 rounded border border-[#2a2a3a] text-sm text-[#9ca3af]"
              title="Previous day"
            >
              ‹
            </button>

            <div className="flex items-center gap-1 px-3 py-1 bg-[#1a1a24] rounded border border-[#2a2a3a]">
              <span className="text-xs text-[#6b7280] uppercase tracking-wider">Day</span>
              <input
                type="number"
                min={1}
                max={TOTAL_DAYS}
                value={dayInput}
                onChange={(e) => setDayInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-14 bg-transparent text-center text-[#f59e0b] font-bold text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <button
              onClick={() => loadDay(Math.min(TOTAL_DAYS, currentDay + 1))}
              disabled={currentDay >= TOTAL_DAYS}
              className="nav-btn px-3 py-1.5 rounded border border-[#2a2a3a] text-sm text-[#9ca3af]"
              title="Next day"
            >
              ›
            </button>
            <button
              onClick={() => loadDay(TOTAL_DAYS)}
              disabled={currentDay >= TOTAL_DAYS}
              className="nav-btn px-3 py-1.5 rounded border border-[#2a2a3a] text-sm text-[#9ca3af]"
              title="Last day"
            >
              »
            </button>
          </div>

          <button
            onClick={handleDayGo}
            className="px-4 py-1.5 bg-[#f59e0b] text-[#0f0f14] rounded font-semibold text-sm hover:bg-[#d97706] transition-colors"
          >
            GO
          </button>
        </nav>

        {/* Verse Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
                <span className="text-[#6b7280] text-sm">Loading verse...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-400 text-4xl mb-3">⚠️</div>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => loadDay(currentDay)}
                  className="px-4 py-2 bg-[#f59e0b] text-[#0f0f14] rounded font-semibold text-sm hover:bg-[#d97706]"
                >
                  RETRY
                </button>
              </div>
            </div>
          ) : currentVerse ? (
            <div className="max-w-3xl mx-auto fade-in">
              {/* Chapter & Verse Header */}
              <div className="text-center mb-8">
                <p className="text-[#6b7280] text-sm uppercase tracking-widest mb-1">
                  Chapter {currentVerse.chapter} · Sloka {currentVerse.verse}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {currentChapter?.name || ""}
                </h2>
                <p className="text-[#f59e0b] text-sm italic">
                  {currentChapter?.subtitle || ""}
                </p>
              </div>

              {/* Day Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl">
                  <div className="text-center">
                    <span className="text-xs text-[#6b7280] uppercase tracking-wider block">Day</span>
                    <span className="text-3xl font-bold text-[#f59e0b]">{currentVerse.day}</span>
                  </div>
                  <div className="w-px h-10 bg-[#2a2a3a]" />
                  <div className="text-center">
                    <span className="text-xs text-[#6b7280] block">of {TOTAL_DAYS}</span>
                  </div>
                </div>
              </div>

              {/* Sanskrit Text */}
              <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 sm:p-8 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#f59e0b] rounded" />
                  <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                    Sanskrit
                  </h3>
                </div>
                <p className="sanskrit-text text-xl sm:text-2xl text-[#fbbf24] leading-relaxed text-center whitespace-pre-line">
                  {currentVerse.sanskrit}
                </p>
              </div>

              {/* Transliteration */}
              {currentVerse.transliteration && (
                <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 sm:p-8 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-[#8b5cf6] rounded" />
                    <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                      Transliteration
                    </h3>
                  </div>
                  <p className="text-[#c4b5fd] italic text-base sm:text-lg leading-relaxed text-center whitespace-pre-line">
                    {currentVerse.transliteration}
                  </p>
                </div>
              )}

              {/* English Translation */}
              <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6 sm:p-8 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#10b981] rounded" />
                  <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                    English Translation
                  </h3>
                </div>
                <p className="text-[#d1d5db] text-base sm:text-lg leading-relaxed">
                  {currentVerse.translation}
                </p>
              </div>

              {/* Word Meanings (collapsible) */}
              {currentVerse.word_meanings && (
                <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl overflow-hidden mb-6">
                  <button
                    onClick={() => setShowWordMeanings(!showWordMeanings)}
                    className="w-full flex items-center justify-between px-6 sm:px-8 py-4 hover:bg-[#222230] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-[#06b6d4] rounded" />
                      <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                        Word Meanings
                      </h3>
                    </div>
                    <svg
                      className={`w-4 h-4 text-[#6b7280] transition-transform ${showWordMeanings ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showWordMeanings && (
                    <div className="px-6 sm:px-8 pb-6">
                      <p className="text-[#9ca3af] text-sm leading-relaxed">
                        {currentVerse.word_meanings}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => loadDay(Math.max(1, currentDay - 1))}
                  disabled={currentDay <= 1}
                  className="nav-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a3a] text-sm text-[#9ca3af]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Day
                </button>
                <button
                  onClick={() => loadDay(Math.min(TOTAL_DAYS, currentDay + 1))}
                  disabled={currentDay >= TOTAL_DAYS}
                  className="nav-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a3a] text-sm text-[#9ca3af]"
                >
                  Next Day
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
