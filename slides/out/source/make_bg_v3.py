# v3（LayerX Company Deck の意匠を参照）用の背景画像を生成する。
# 参照資料の画像・3Dオブジェクト・ロゴは使わず、色の構成だけを数式で再現する。
import os, sys
import numpy as np
from PIL import Image, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "assets_v3")
os.makedirs(OUT, exist_ok=True)
W, H = 1920, 1080
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
u, v = xx / W, yy / H


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def blob(cx, cy, r, sx=1.0, sy=1.0):
    d = ((u - cx) / sx) ** 2 + ((v - cy) / sy) ** 2
    return np.exp(-d / (2 * r * r))[..., None]


def mix(base, color, a):
    return base * (1 - a) + rgb(color) * a


def save(arr, name, blur=0, q=90):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    # 細かなノイズでバンディングを防ぐ
    n = np.random.default_rng(1).normal(0, 1.6, (H, W, 1))
    im = Image.fromarray(np.clip(np.asarray(im, np.float32) + n, 0, 255).astype(np.uint8))
    im.save(os.path.join(OUT, name), quality=q)


def rings(arr, cx, cy, radii, width, color, alpha):
    # 「還る」循環を表す自作の同心円モチーフ
    d = np.sqrt(((u - cx) * W / H) ** 2 + (v - cy) ** 2)
    for r in radii:
        a = np.exp(-((d - r) ** 2) / (2 * width ** 2))[..., None] * alpha
        arr = mix(arr, color, a)
    return arr


# 1 表紙：左上の深い青紫 → 右の明るい空色
base = np.zeros((H, W, 3), np.float32) + rgb("8FB6FF")
base = mix(base, "4A2BFF", blob(0.0, 0.1, 0.42) * 0.95)
base = mix(base, "6C89FF", blob(0.35, 0.65, 0.35) * 0.8)
base = mix(base, "B9DDFF", blob(1.0, 0.0, 0.40) * 0.9)
base = mix(base, "A4A0FF", blob(0.05, 0.95, 0.30) * 0.6)
base = rings(base, 0.12, 0.55, [0.30, 0.42, 0.54], 0.010, "FFFFFF", 0.18)
save(base, "bg_cover.jpg", blur=6)

# 2 ステートメント（p.2型）：左の濃い青紫 → 右の淡い水色
base = np.zeros((H, W, 3), np.float32) + rgb("D8E7FF")
base = mix(base, "4111FD", blob(0.0, 0.2, 0.38, 1.0, 1.4) * 1.0)
base = mix(base, "80A1FF", blob(0.45, 0.6, 0.30) * 0.7)
base = mix(base, "6670FF", blob(0.5, 0.45, 0.26, 1.6, 1.0) * 0.55)
save(base, "bg_statement.jpg", blur=8)

# 3 ミッション（p.9型）：青紫の面に明るい帯
base = np.zeros((H, W, 3), np.float32) + rgb("5A6BFF")
base = mix(base, "A9ADFF", blob(0.5, 0.0, 0.30, 1.6, 1.0) * 0.9)
base = mix(base, "8FA8FF", blob(0.3, 1.0, 0.28, 1.6, 1.0) * 0.8)
base = mix(base, "4B5CFF", blob(0.85, 0.55, 0.30) * 0.6)
save(base, "bg_mission.jpg", blur=8)

# 4 章扉（p.4型）：銀色の面と、右上から流れる濃い曲面
base = np.zeros((H, W, 3), np.float32) + rgb("A2A2A2")
base = mix(base, "B4B4B4", blob(0.1, 0.9, 0.35) * 0.9)
base = mix(base, "8E8E8E", blob(0.25, 0.25, 0.30) * 0.6)
curve = 0.62 + 0.25 * np.sin((v - 0.1) * 2.6)          # S字の稜線
band = np.exp(-((u - curve) ** 2) / (2 * 0.06 ** 2))[..., None]
base = mix(base, "6E6E6E", band * blob(0.8, 0.25, 0.45) * 0.9)
base = mix(base, "EDEDED", np.exp(-((u - curve - 0.09) ** 2) / (2 * 0.05 ** 2))[..., None] * blob(0.8, 0.3, 0.5) * 0.7)
save(base, "bg_chapter.jpg", blur=10)

# 5 濃紺（p.20型）：上の濃紺 → 下の明るい青
base = np.zeros((H, W, 3), np.float32) + rgb("004295")
base = mix(base, "6792C6", np.clip((v - 0.35) / 0.65, 0, 1)[..., None] ** 1.4)
save(base, "bg_dark.jpg", blur=4)

# 6 結び（p.52型）：左の縦長パネル用
base = np.zeros((H, W, 3), np.float32) + rgb("A9CFFF")
base = mix(base, "3C3BFF", blob(0.2, 0.3, 0.35) * 0.95)
base = mix(base, "6FA0FF", blob(0.7, 0.8, 0.35) * 0.8)
base = rings(base, 0.55, 0.5, [0.22, 0.34, 0.46, 0.58], 0.012, "FFFFFF", 0.25)
save(base, "bg_closing.jpg", blur=6)
print("ok", OUT)
