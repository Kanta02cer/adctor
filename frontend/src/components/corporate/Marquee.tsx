"use client";

import { useState } from "react";
import styles from "./corporate.module.css";

const WORDS = ["Measure", "Protect", "Record", "Return"];

/** 流れる大きな文字。自動で動くので一時停止ボタンを付ける（動きを減らす設定では止まった状態）。 */
export function Marquee() {
  const [paused, setPaused] = useState(false);
  const row = (
    <span className={styles.marqueeRow}>
      {WORDS.map((w) => (
        <span key={w} className={styles.marqueeWord}>
          {w}
          <svg viewBox="0 0 40 40" className={styles.marqueeMark} aria-hidden="true">
            <path d="M6 20 H34 M24 10 L34 20 L24 30" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </span>
      ))}
    </span>
  );

  return (
    <section className={styles.marquee} aria-label="測る、守る、記録する、還元する">
      <div className={styles.marqueeTrack} data-paused={paused} aria-hidden="true">
        {row}
        {row}
      </div>
      <button type="button" className={styles.marqueeToggle} onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
        {paused ? "動きを再開" : "動きを止める"}
      </button>
    </section>
  );
}
