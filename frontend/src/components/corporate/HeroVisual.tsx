import styles from "./corporate.module.css";
import { FRAMES, wavePath } from "./LogoSymbol";

/**
 * ヒーローのビジュアル兼オープニングアニメーション。
 * ロゴのシンボルを大きく置き、
 *   1. 奥行きのあるグリッドが 600ms で薄い状態から現れる
 *   2. 3枚のフレームが順に線で描かれる（測る・守る・記録する）
 *   3. 青い線が左から右へ一度だけ通り抜け、右端の「還元」で止まる
 * という順で動く。すべてCSSだけで動くため、JSの読み込みを待たず、
 * ヘッダーやボタンの操作も妨げない。動きを減らす設定では最終状態を表示する。
 */

// 遠近感のあるグリッド（消失点は上方中央）
const VERTICALS = [-160, -80, 0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800];
const HORIZONTALS = [36, 70, 110, 156, 208, 268, 336, 412, 496];

const STEPS = [
  { x: 135, label: "測る", en: "MEASURE" },
  { x: 215, label: "守る", en: "PROTECT" },
  { x: 295, label: "記録する", en: "RECORD" },
];

export function HeroVisual() {
  return (
    <div className={styles.heroVisual}>
      <svg
        viewBox="0 0 640 520"
        role="img"
        aria-label="青い線が、測る・守る・記録するの3枚のフレームを通り抜け、発信者への還元に届く図"
        className={styles.heroSvg}
      >
        <g className={styles.heroGrid} stroke="rgba(245,244,240,0.09)" strokeWidth="1">
          {VERTICALS.map((x) => (
            <line key={`v${x}`} x1={x} y1={520} x2={320 + (x - 320) * 0.42} y2={0} />
          ))}
          {HORIZONTALS.map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={640} y2={y} />
          ))}
        </g>

        {/* シンボル本体（414×318 の座標系を拡大して配置） */}
        <g transform="translate(58 70) scale(1.2)">
          <g fill="none" stroke="#F5F4F0" strokeWidth="6" strokeLinejoin="miter">
            {FRAMES.map((d, i) => (
              <path
                key={d}
                d={d}
                pathLength={1}
                className={styles.heroFrame}
                style={{ animationDelay: `${180 + i * 140}ms` }}
              />
            ))}
          </g>

          {/* 線の通り道（うっすら） */}
          <path d={wavePath(-60, 487)} fill="none" stroke="rgba(245,244,240,0.12)" strokeWidth="2" />
          {/* 一度だけ流れる青い線 */}
          <path
            d={wavePath(-60, 470)}
            pathLength={1}
            fill="none"
            stroke="#164BFF"
            strokeWidth="9"
            strokeLinecap="butt"
            className={styles.heroWave}
          />
          <path
            d="M462 155 L476 165 L462 175"
            fill="none"
            stroke="#164BFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.heroArrow}
          />

          {STEPS.map((s, i) => (
            <g key={s.en} className={styles.heroStep} style={{ animationDelay: `${1000 + i * 230}ms` }}>
              <text x={s.x} y={318} textAnchor="middle" className={styles.heroStepJa}>
                {s.label}
              </text>
              <text x={s.x} y={336} textAnchor="middle" className={styles.heroStepEn}>
                {s.en}
              </text>
            </g>
          ))}
          <g className={styles.heroStep} style={{ animationDelay: "1900ms" }}>
            <text x={472} y={126} textAnchor="end" className={styles.heroStepJa}>
              発信者へ還元
            </text>
            <text x={472} y={144} textAnchor="end" className={styles.heroStepEn}>
              RETURN
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
