/**
 * Trillion Bank のシンボル（3枚のフレームを青い線が通り抜ける形）を
 * 公式ロゴ画像（tb-logo-symbol.webp, 414×318）からSVGに起こしたもの。
 * 色を切り替えたり、オープニングで線を描いたりできるようにインラインSVGにしている。
 */

/** 3枚のフレーム（平行四辺形）。座標は公式シンボルの 414×318 の座標系。 */
export const FRAMES = [
  "M103 74 L168 42 L168 214 L103 247 Z",
  "M183 97 L248 64 L248 236 L183 268 Z",
  "M263 108 L327 75 L327 248 L263 281 Z",
] as const;

/** 青い線。左右の平らな部分を伸ばせるよう、始点と終点を引数にしている。 */
export function wavePath(startX = 25, endX = 389) {
  return `M${startX} 165 H105 C130 165 140 137 166 137 C200 137 216 191 256 191 C286 191 296 165 322 165 H${endX}`;
}

type Props = {
  className?: string;
  /** フレームの色（明るい背景では墨、暗い背景では白） */
  frameColor?: string;
  title?: string;
};

export function LogoSymbol({ className, frameColor = "currentColor", title }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 414 318"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <g fill="none" stroke={frameColor} strokeWidth="13" strokeLinejoin="miter">
        {FRAMES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d={wavePath()} fill="none" stroke="#164BFF" strokeWidth="15" strokeLinecap="round" />
    </svg>
  );
}
