import styles from "./corporate.module.css";

/**
 * 英字の大見出しを1文字ずつに分け、画面に入ったときに順に下から現れるようにする。
 * 単語の途中で改行されないよう、単語ごとにまとめる。読み上げは元の文字列1回だけ。
 */
export function SplitText({ text, className }: { text: string; className?: string }) {
  let index = 0;
  const words = text.split(" ");
  return (
    <span className={`${styles.split} ${className ?? ""}`} data-reveal="">
      <span className={styles.srOnly}>{text}</span>
      {words.map((word, w) => (
        <span key={w} aria-hidden="true">
          <span className={styles.splitWord}>
            {Array.from(word).map((ch, i) => (
              <span key={i} className={styles.splitChar} style={{ transitionDelay: `${index++ * 28}ms` }}>
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
