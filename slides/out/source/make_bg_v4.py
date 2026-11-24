# v4（LayerX の型 × Trillion Bank のカラーコード）用の背景・帯画像を生成する。
# 色は TB の指定色（#1762E8 / #EAF1FF / #111318 / #667085 / #DDE2EA）と、
# そこから明度だけを変えた派生色のみを使う。参照資料の画像は使わない。
import os, sys
import numpy as np
from PIL import Image, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "assets_v4")
os.makedirs(OUT, exist_ok=True)

# TB 指定色と派生色（派生色は #1762E8 の明度違い／#667085・#DDE2EA の中間）
KEY, TINT, INK, SUB, RULE = "1762E8", "EAF1FF", "111318", "667085", "DDE2EA"
DEEP, DEEPER, MID, LIGHT, PALE = "0E46B8", "0B2F7A", "4C86EE", "8DB3F4", "C5D8FA"


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def canvas(w, h):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    return xx / w, yy / h


def blob(u, v, cx, cy, r, sx=1.0, sy=1.0):
    d = ((u - cx) / sx) ** 2 + ((v - cy) / sy) ** 2
    return np.exp(-d / (2 * r * r))[..., None]


def mix(base, color, a):
    return base * (1 - a) + rgb(color) * a


def save(arr, name, blur=0, noise=1.6):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(im, np.float32)
    if noise:
        a = a + np.random.default_rng(1).normal(0, noise, a.shape[:2] + (1,))
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name), quality=90)


def rings(arr, u, v, cx, cy, radii, width, color, alpha, aspect):
    d = np.sqrt(((u - cx) * aspect) ** 2 + (v - cy) ** 2)
    for r in radii:
        arr = mix(arr, color, np.exp(-((d - r) ** 2) / (2 * width ** 2))[..., None] * alpha)
    return arr


W, H = 1920, 1080
u, v = canvas(W, H)
A = W / H

# 表紙：TB blue の深い左上 → 薄面の右上
b = np.zeros((H, W, 3), np.float32) + rgb(LIGHT)
b = mix(b, DEEP, blob(u, v, 0.0, 0.1, 0.42) * 0.95)
b = mix(b, KEY, blob(u, v, 0.35, 0.7, 0.35) * 0.85)
b = mix(b, TINT, blob(u, v, 1.0, 0.0, 0.42) * 0.95)
b = mix(b, MID, blob(u, v, 0.05, 0.95, 0.30) * 0.6)
b = rings(b, u, v, 0.12, 0.55, [0.30, 0.42, 0.54], 0.010, "FFFFFF", 0.18, A)
save(b, "bg_cover.jpg", blur=6)

# ステートメント
b = np.zeros((H, W, 3), np.float32) + rgb(TINT)
b = mix(b, DEEP, blob(u, v, 0.0, 0.2, 0.38, 1.0, 1.4))
b = mix(b, KEY, blob(u, v, 0.5, 0.45, 0.26, 1.6, 1.0) * 0.75)
b = mix(b, MID, blob(u, v, 0.45, 0.7, 0.30) * 0.6)
save(b, "bg_statement.jpg", blur=8)

# ミッション
b = np.zeros((H, W, 3), np.float32) + rgb(KEY)
b = mix(b, LIGHT, blob(u, v, 0.5, 0.0, 0.30, 1.6, 1.0) * 0.8)
b = mix(b, MID, blob(u, v, 0.3, 1.0, 0.28, 1.6, 1.0) * 0.8)
b = mix(b, DEEP, blob(u, v, 0.85, 0.55, 0.30) * 0.6)
save(b, "bg_mission.jpg", blur=8)

# 章扉：#667085 と #DDE2EA の間の青みのある銀色に、流れる曲面
b = np.zeros((H, W, 3), np.float32) + rgb("98A0AE")
b = mix(b, "AEB5C1", blob(u, v, 0.1, 0.9, 0.35) * 0.9)
b = mix(b, "858D9C", blob(u, v, 0.25, 0.25, 0.30) * 0.6)
curve = 0.62 + 0.25 * np.sin((v - 0.1) * 2.6)
b = mix(b, SUB, np.exp(-((u - curve) ** 2) / (2 * 0.06 ** 2))[..., None] * blob(u, v, 0.8, 0.25, 0.45) * 0.9)
b = mix(b, RULE, np.exp(-((u - curve - 0.09) ** 2) / (2 * 0.05 ** 2))[..., None] * blob(u, v, 0.8, 0.3, 0.5) * 0.75)
save(b, "bg_chapter.jpg", blur=10)

# 濃紺ページ
b = np.zeros((H, W, 3), np.float32) + rgb(DEEPER)
b = mix(b, DEEP, np.clip((v - 0.2) / 0.8, 0, 1)[..., None] ** 1.2)
b = mix(b, MID, np.clip((v - 0.7) / 0.3, 0, 1)[..., None] ** 1.6 * 0.6)
save(b, "bg_dark.jpg", blur=4)

# 結び
b = np.zeros((H, W, 3), np.float32) + rgb(LIGHT)
b = mix(b, DEEP, blob(u, v, 0.2, 0.3, 0.35) * 0.95)
b = mix(b, MID, blob(u, v, 0.7, 0.8, 0.35) * 0.8)
b = rings(b, u, v, 0.55, 0.5, [0.22, 0.34, 0.46, 0.58], 0.012, "FFFFFF", 0.25, A)
save(b, "bg_closing.jpg", blur=6)

# 見出し帯（p.21/22・p.25型）：横方向のグラデーション
for name, c1, c2 in [("bar_key.png", KEY, LIGHT), ("bar_deep.png", DEEP, MID), ("panel_key.png", KEY, MID)]:
    w, h = 1200, 120
    uu, _ = canvas(w, h)
    a = rgb(c1) * (1 - uu[..., None]) + rgb(c2) * uu[..., None]
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name))
print("ok", OUT)
