// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Article = { title?: string; url?: string; publishedAt?: string };

function IconPrev() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path className="icon-stroke" d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function IconNext() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path className="icon-stroke" d="M9 6l6 6-6 6" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

export default function Page() {
  const RSS_URL = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en";
  const TICK_OPTIONS = [5000, 10000, 15000, 30000, 60000];

  const [tickerMs, setTickerMs] = useState(15000);
  const [paused, setPaused] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        async function fetchTextWithFallbacks(url: string): Promise<string> {
          try {
            const r = await fetch(url, { cache: "no-store" });
            if (r.ok) return await r.text();
          } catch {}
          try {
            const r2 = await fetch(
              `https://r.jina.ai/${url.replace(/^https?:\/\//, "https://")}`,
              { cache: "no-store" }
            );
            if (r2.ok) return await r2.text();
          } catch {}
          try {
            const r3 = await fetch(
              `https://allorigins.hexlet.app/raw?url=${encodeURIComponent(url)}`,
              { cache: "no-store" }
            );
            if (r3.ok) return await r3.text();
          } catch {}
          throw new Error("Unable to fetch RSS");
        }

        const text = await fetchTextWithFallbacks(RSS_URL);
        const xml = new DOMParser().parseFromString(text, "application/xml");
        const list = Array.from(xml.querySelectorAll("item")).map((it) => ({
          title: it.querySelector("title")?.textContent || undefined,
          url: it.querySelector("link")?.textContent || undefined,
          publishedAt: it.querySelector("pubDate")?.textContent || undefined,
        }));
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
      timerRef.current = setInterval(
        () => setIdx((i) => (i + 1) % articles.length),
        tickerMs
      );
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [articles, tickerMs, paused]);

  const current = articles[idx] || {};
  const goPrev = () =>
    articles.length && setIdx((i) => (i - 1 + articles.length) % articles.length);
  const goNext = () =>
    articles.length && setIdx((i) => (i + 1) % articles.length);
  const togglePause = () => setPaused((p) => !p);

  return (
    <>
      {/
