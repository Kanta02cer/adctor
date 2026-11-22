"use client";

import { useEffect, useRef } from "react";

/**
 * 子孫の [data-reveal] が画面に入ったら data-inview を付ける。
 * JSが動くまでは何も隠さない（ルートに data-reveal-ready が付いてから隠す）ので、
 * 読み込みが遅くても本文は読める。
 */
export function RevealRoot({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    // すでに画面内にあるものは最初から表示済みにする（ちらつき防止）
    const vh = window.innerHeight;
    targets.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.9) el.dataset.inview = "";
    });
    root.dataset.revealReady = "";

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.inview = "";
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    targets.filter((el) => !("inview" in el.dataset)).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
