# v7（SmartHR Company Profile の構成を参照）用の背景・帯・合成画像を作る。
# 配色は全ページ共通：TB blue #1762E8／濃紺 #0B2F7A／薄面 #EAF1FF／差し色 #FFB020（琥珀）。
# 参照資料の写真・ロゴ・図版は使わない。端末画像は make_screens_v7.js の出力を合成する。
import os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets_v7")
os.makedirs(OUT, exist_ok=True)
KEY, NAVY, TINT, LIGHT, ACC, ACCS, PAGE = "1762E8", "0B2F7A", "EAF1FF", "8DB3F4", "FFB020", "FFE3A8", "F5F8FE"
rng = np.random.default_rng(7)


def rgb(h): return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)
def grid(w, h):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    return xx / w, yy / h
def lerp(c1, c2, t): return rgb(c1) * (1 - t[..., None]) + rgb(c2) * t[..., None]
def save(a, name, q=92):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    (im.save(os.path.join(OUT, name), quality=q) if name.endswith(".jpg") else im.save(os.path.join(OUT, name)))
    return im


def dots(a, x0, x1, y0, y1, cell, color, alpha, rise=1.6):
    """右へ行くほど密になる四角い点の模様（ピクセル調）。"""
    h, w = a.shape[:2]
    c = rgb(color)
    for y in range(y0, y1, cell):
        for x in range(x0, x1, cell):
            p = ((x - x0) / max(1, x1 - x0)) ** rise
            if rng.random() < p * 0.85:
                s = cell - 3
                a[y:y + s, x:x + s] = a[y:y + s, x:x + s] * (1 - alpha) + c * alpha
    return a


W, H = 1920, 1080
u, v = grid(W, H)

# 1 表紙：上半分＝青→濃紺の帯＋点、下半分＝琥珀→淡青→白へのフェード
a = np.zeros((H, W, 3), np.float32) + 255
band_h = 580
t = np.clip((u - 0.42) / 0.5, 0, 1) ** 1.2
a[:band_h] = lerp(KEY, NAVY, t)[:band_h]
a = dots(a, 1000, W, 0, band_h, 14, "0A2466", 0.75)
a = dots(a, 1250, W, 0, band_h, 14, "2E6BEA", 0.35, 2.4)
low = (v - band_h / H) / (1 - band_h / H)
mixc = lerp(ACCS, LIGHT, np.clip(u * 1.1, 0, 1))
fade = np.clip(1 - low / 0.85, 0, 1) ** 1.6
a[band_h:] = (mixc * fade[..., None] + 255 * (1 - fade[..., None]))[band_h:]
a[band_h:band_h + 6] = lerp(ACC, KEY, np.clip(u, 0, 1))[band_h:band_h + 6]
save(a, "cover.jpg")

# 2 章扉の帯（横長）
bw, bh = 1880, 120
bu, bv = grid(bw, bh)
b = lerp(LIGHT, KEY, np.clip(bu * 1.6, 0, 1))
b = b * (1 - np.clip((bu - 0.55) / 0.45, 0, 1)[..., None]) + rgb(NAVY) * np.clip((bu - 0.55) / 0.45, 0, 1)[..., None]
b = dots(b, 1000, bw, 0, bh, 12, "06184A", 0.7)
save(b, "band.png")

# 3 左端の細い帯（全ページ共通）
su, sv = grid(24, 1080)
s = lerp(KEY, ACC, np.clip(np.abs(sv - 0.5) * -2 + 1, 0, 1) ** 2)
save(s, "strip.png")

# 4 濃い青の面（提供価値・数字の大見出し）
a = lerp(KEY, NAVY, np.clip(u * 0.8 + v * 0.5 - 0.1, 0, 1))
glow = np.exp(-(((u - 0.18) / 0.5) ** 2 + ((v - 0.15) / 0.45) ** 2))[..., None]
a = a * (1 - glow * 0.35) + rgb("4C86EE") * glow * 0.35
a = dots(a, 1450, W, 0, 360, 14, "0A2466", 0.55)
save(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)) and a, "hero_blue.jpg")

# 5 空色の面（「AIが、答える時代。」）
a = lerp("9CC2FA", KEY, np.clip(v * 1.1 + u * 0.2, 0, 1))
for cx, cy, r in [(0.2, 0.35, 0.22), (0.62, 0.25, 0.18), (0.85, 0.55, 0.25), (0.4, 0.7, 0.2)]:
    g = np.exp(-(((u - cx) / r) ** 2 + ((v - cy) / (r * 0.55)) ** 2))[..., None]
    a = a * (1 - g * 0.35) + 255 * g * 0.35
save(np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(18)), np.float32), "hero_sky.jpg")

# 6 濃紺の面（実証の進め方）
a = lerp("2A6FEA", NAVY, np.clip(u * 0.7 + (1 - v) * 0.4, 0, 1))
save(a, "hero_dark.jpg")

# 7 右側パネル（縦長）
pw, ph = 900, 1080
pu, pv = grid(pw, ph)
p = lerp("3C7DEE", KEY, np.clip(pv * 0.8 + pu * 0.3, 0, 1))
p = dots(p, 500, pw, 0, 220, 12, "0E46B8", 0.6)
save(p, "panel.jpg")

# 8 帯ピル（カードの見出し：琥珀→淡青）
cu, cv = grid(800, 120)
save(lerp(ACCS, "CFE0FC", np.clip(cu, 0, 1)), "pill.png")

# 9 章扉の画像（青の面＋端末）
def shadowed(img, blur=22, off=(0, 24), alpha=90):
    w, h = img.size
    pad = blur * 3
    canvas = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", (w, h), (11, 47, 122, alpha))
    sh.putalpha(img.split()[-1].point(lambda x: x * alpha // 255))
    canvas.alpha_composite(sh, (pad + off[0], pad + off[1]))
    canvas = canvas.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(img, (pad, pad))
    return canvas, pad


def chapter(name, devices, base="gradient"):
    cw, ch = 1880, 960
    gu, gv = grid(cw, ch)
    g = lerp("DCE8FD", KEY, np.clip(gu * 0.9 + gv * 0.25 - 0.1, 0, 1))
    g = lerp("DCE8FD", KEY, np.clip(gu * 0.9 + gv * 0.25 - 0.1, 0, 1)) if base == "gradient" else g
    canvas = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).convert("RGBA")
    for f, x, y, wpx in devices:
        im = Image.open(os.path.join(OUT, f)).convert("RGBA")
        im = im.resize((wpx, int(im.height * wpx / im.width)), Image.LANCZOS)
        canvas.alpha_composite(im, (x, y))
    canvas.convert("RGB").save(os.path.join(OUT, name), quality=90)


chapter("chapter_01.jpg", [("dev_laptop_site.png", 760, 150, 1060), ("dev_phone_approve.png", 1500, 300, 330)])
chapter("chapter_02.jpg", [("dev_laptop_agree.png", 820, 170, 1000)])
chapter("chapter_03.jpg", [("dev_laptop_ledger.png", 700, 160, 1040), ("dev_phone_payout.png", 1480, 290, 330)])
chapter("chapter_04.jpg", [("dev_laptop_bill.png", 800, 170, 1020)])
chapter("chapter_05.jpg", [])

# 10 理念ページのコラージュ（重なった画面）
col = Image.new("RGBA", (1100, 1000), (0, 0, 0, 0))
for f, x, y, wpx in [("scr_d_agree.png", 40, 40, 700), ("scr_d_ledger.png", 330, 330, 720)]:
    im = Image.open(os.path.join(OUT, f)).convert("RGBA").resize((wpx, int(wpx / 1.6)), Image.LANCZOS)
    m = Image.new("L", im.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, im.width - 1, im.height - 1], 18, fill=255); im.putalpha(m)
    s, pad = shadowed(im)
    col.alpha_composite(s, (x - pad, y - pad))
ph = Image.open(os.path.join(OUT, "dev_phone_payout.png")).convert("RGBA")
ph = ph.resize((300, int(ph.height * 300 / ph.width)), Image.LANCZOS)
col.alpha_composite(ph, (40, 400))
col.save(os.path.join(OUT, "collage_mission.png"))
print("ok", sorted(os.listdir(OUT)))
