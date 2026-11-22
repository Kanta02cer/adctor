"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./corporate.module.css";
import { LogoSymbol } from "./LogoSymbol";
import wordmark from "./assets/tb-wordmark.webp";
import { LINKS } from "./links";

const NAV = [
  { href: "#business", label: "事業" },
  { href: "#company", label: "会社情報" },
  { href: "#news", label: "ニュース" },
  { href: "#contact", label: "お問い合わせ" },
];

/**
 * 黒いヒーローの上では透明・白文字、ヒーローを過ぎたら温かい白の面に切り替わる。
 * JSが読み込まれる前もリンクとして機能する（初期表示から操作可能）。
 */
export function SiteHeader() {
  const [onDark, setOnDark] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnDark(entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const dark = onDark || open;

  return (
    <header className={styles.header} data-tone={dark ? "dark" : "light"}>
      <div className={styles.headerInner}>
        <a href="#top" className={styles.brand} aria-label="Trillion Bank トップへ" onClick={() => setOpen(false)}>
          <LogoSymbol className={styles.brandSymbol} />
          <Image src={wordmark} alt="" className={styles.brandWordmark} loading="eager" sizes="180px" />
        </a>

        <nav aria-label="グローバルナビゲーション" className={styles.nav}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={styles.navLink}>
              {n.label}
            </a>
          ))}
          <a href={LINKS.diagnose} className={styles.headerCta}>
            無料でAI検索診断
          </a>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="tb-mobile-menu"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpen((v) => !v)}
        >
          <span data-open={open} className={styles.menuIcon} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <div id="tb-mobile-menu" className={styles.mobileMenu} data-open={open} hidden={!open}>
        <nav aria-label="モバイルナビゲーション">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className={styles.mobileMenuLink}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href={LINKS.diagnose} className={styles.mobileMenuCta}>
          無料でAI検索診断
        </a>
      </div>
    </header>
  );
}
