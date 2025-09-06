"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const RSS_URL = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en";
  const TICK_OPTIONS = [5000, 10000, 15000, 30000, 60000];

  const [tickerMs, setTickerMs] = useState(15000);
  const [paused, setPaused] = useState(false);
  const [articles, setArticles] = useState<{ title?: string; url?: string; publishedAt?: string }[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        async function fetchTextWithFallbacks(url: string): Promise<string> {
          try { const r = await fetch(url, { cache: "no-store" }); if (r.ok) return await r.text(); } catch {}
          try { const r2 = await fetch(`https://r.jina.ai/${url.replace(/^https?:\/\//, "https://")}`); if (r2.ok) return await r2.text(); } catch {}
          try { const r3 = await fetch(`https://allorigins.hexlet.app/raw?url=${encodeURIComponent(url)}`); if (r3.ok) return await r3.text(); } catch {}
          throw new Error("Unable to fetch RSS");
        }
        const text = await fetchTextWithFallbacks(RSS_URL);
        const xml = new DOMParser().parseFromString(text, "application/xml");
        const items = Array.from(xml.querySelectorAll("item"));
        const list = items.map((it) => ({
          title: it.querySelector("title")?.textContent || undefined,
          url: it.querySelector("link")?.textContent || undefined,
          publishedAt: it.querySelector("pubDate")?.textContent || undefined,
        })).filter(a => a.title && a.url);
        if (!list.length) throw new Error("No articles found");
        setArticles(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (articles.length && !paused) {
      timerRef.current = setInterval(() => setIdx(i => (i + 1) % articles.length), tickerMs);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [articles, tickerMs, paused]);

  const current = articles[idx] || {};

  const goPrev = () => articles.length && setIdx(i => (i - 1 + articles.length) % articles.length);
  const goNext = () => articles.length && setIdx(i => (i + 1) % articles.length);
  const togglePause = () => setPaused(p => !p);

  return (
    <>
      {/* Top: timer segmented pills */}
      <div className="timerbar" role="tablist" aria-label="Auto-scroll interval">
        {TICK_OPTIONS.map(ms => (
          <button
            key={ms}
            role="tab"
            aria-pressed={tickerMs === ms}
            className="timerbtn"
            onClick={() => setTickerMs(ms)}
            title={`${ms/1000}s`}
          >
            {ms / 1000}s
          </button>
        ))}
      </div>

      {/* Bottom: large prev/pause/next pill with custom SVG icons */}
      <div className="controlbar" role="toolbar" aria-label="Playback controls">
        <button className="ctrlbtn" title="Previous" aria-label="Previous" onClick={goPrev}>
          {/* Left Arrow */}
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path className="icon-stroke" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          className="ctrlbtn pause"
          title={paused ? "Resume" : "Pause"}
          aria-label={paused ? "Resume" : "Pause"}
          aria-pressed={paused}
          onClick={togglePause}
        >
          {paused ? (
            // Play
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path className="icon-stroke" d="M8 5v14l11-7z" fill="currentColor" stroke="none" />
            </svg>
          ) : (
            // Pause
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" fill="currentColor" />
            </svg>
          )}
        </button>
        <button className="ctrlbtn" title="Next" aria-label="Next" onClick={goNext}>
          {/* Right Arrow */}
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path className="icon-stroke" d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <main className="main">
        <div className="wrap">
          {loading && <div className="status">Loading…</div>}
          {!loading && error && <div className="status">Failed to load — {error}</div>}
          {!loading && !error && (
            <a href={current?.url || '#'} target="_blank" rel="noopener noreferrer" className="link">
              <h1 className="title">{current?.title || 'Untitled'}</h1>
            </a>
          )}
        </div>
      </main>
    </>
  );
}
