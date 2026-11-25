# v6：表紙（bg_cover）のトーンを本章に展開するための背景・発光部品を作る。
# 色は TB 指定色と、その明度違いのみ。参照資料（メルカリ）の画像は使わない。
import os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets_v6")
os.makedirs(OUT, exist_ok=True)
KEY, TINT, DEEP, MID, LIGHT = "1762E8", "EAF1FF", "0E46B8", "4C86EE", "8DB3F4"


def rgb(h): return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


W, H = 1920, 1080
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
u, v = xx / W, yy / H
A = W / H


def blob(cx, cy, r, sx=1.0, sy=1.0):
    return np.exp(-(((u - cx) / sx) ** 2 + ((v - cy) / sy) ** 2) / (2 * r * r))[..., None]


def mix(b, c, a): return b * (1 - a) + rgb(c) * a


def rings(b, cx, cy, radii, width, color, alpha):
    d = np.sqrt(((u - cx) * A) ** 2 + (v - cy) ** 2)
    for r in radii:
        b = mix(b, color, np.exp(-((d - r) ** 2) / (2 * width ** 2))[..., None] * alpha)
    return b


def save(b, name, blur=6):
    im = Image.fromarray(np.clip(b, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(im, np.float32) + np.random.default_rng(2).normal(0, 1.2, (H, W, 1))
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name), quality=90)


# 本文ページ：白地。右下に表紙と同じ青の発光と同心円を、弱めて置く（本文域は白のまま）
b = np.zeros((H, W, 3), np.float32) + 255
b = mix(b, LIGHT, blob(1.08, 1.12, 0.22) * 0.55)
b = mix(b, TINT, blob(1.0, 1.0, 0.36) * 0.8)
b = rings(b, 1.02, 1.05, [0.16, 0.24, 0.32], 0.005, KEY, 0.10)
save(b, "bg_page.jpg")

# 扉：表紙の青を淡く敷いた面＋左下の同心円（メルカリの灰色の扉を TB の青に置き換え）
b = np.zeros((H, W, 3), np.float32) + rgb("F4F7FD")
b = mix(b, TINT, blob(0.0, 1.0, 0.45) * 0.9)
b = mix(b, LIGHT, blob(-0.05, 1.05, 0.22) * 0.45)
b = mix(b, "FFFFFF", blob(0.6, 0.35, 0.35) * 0.9)
b = rings(b, 0.02, 0.98, [0.22, 0.33, 0.44], 0.006, KEY, 0.12)
save(b, "bg_divider.jpg")


def glow_capsule(name, w, h, radius, stroke, glow, c1, c2, fill=True):
    """左右で色が変わる発光の輪郭を持つカプセル（透過PNG）。"""
    pad = glow * 3
    Wc, Hc = w + 2 * pad, h + 2 * pad
    mask = Image.new("L", (Wc, Hc), 0)
    ImageDraw.Draw(mask).rounded_rectangle([pad, pad, pad + w, pad + h], radius=radius, outline=255, width=stroke)
    halo = np.asarray(mask.filter(ImageFilter.GaussianBlur(glow)), np.float32) / 255
    core = np.asarray(mask.filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
    t = np.linspace(0, 1, Wc)[None, :, None]
    col = rgb(c1) * (1 - t) + rgb(c2) * t
    alpha = np.clip(halo * 3.0 + core, 0, 1)
    rgba = np.dstack([np.broadcast_to(col, (Hc, Wc, 3)), alpha * 255])
    im = Image.fromarray(rgba.astype(np.uint8), "RGBA")
    if fill:
        inner = Image.new("RGBA", (Wc, Hc), (0, 0, 0, 0))
        ImageDraw.Draw(inner).rounded_rectangle([pad + stroke, pad + stroke, pad + w - stroke, pad + h - stroke], radius=radius - stroke, fill=(255, 255, 255, 255))
        im = Image.alpha_composite(inner, im)
    im.save(os.path.join(OUT, name))
    return pad


# 扉のカプセル（1400×560 px の本体＋発光の余白）
pad = glow_capsule("capsule_divider.png", 1400, 560, 280, 10, 44, DEEP, LIGHT)
# 小さな枠線カプセル（図中のラベル用、塗りなし）
glow_capsule("capsule_small.png", 800, 200, 100, 8, 10, KEY, LIGHT, fill=False)

# 大きな矢印（p.54 型：淡色 → 要点の青）
w, h = 900, 420
uu = np.linspace(0, 1, w)[None, :, None]
col = rgb(TINT) * (1 - uu) + rgb(KEY) * uu
arrow = Image.new("L", (w, h), 0)
d = ImageDraw.Draw(arrow)
d.polygon([(0, 140), (600, 140), (600, 20), (w - 10, h // 2), (600, h - 20), (600, h - 140), (0, h - 140)], fill=255)
alpha = np.asarray(arrow.filter(ImageFilter.GaussianBlur(3)), np.float32)
fade = np.clip(np.linspace(0.15, 1, w), 0, 1)[None, :]
rgba = np.dstack([np.broadcast_to(col, (h, w, 3)), alpha * fade])
Image.fromarray(rgba.astype(np.uint8), "RGBA").save(os.path.join(OUT, "arrow_big.png"))
print("ok", OUT, "capsule pad px:", pad)
