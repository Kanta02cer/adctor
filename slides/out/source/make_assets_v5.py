# v5 用の自社素材を、Trillion Bank 自社資料（AirReach ご案内 2026年11月版）から取り出す。
# 使い方: python3 -I make_assets_v5.py <TB資料PDF> [出力先]
#   - TB ロゴ（黒・白、透過PNG）／AirReach ロゴ（透過PNG）／コーポレートサイト画面／代表写真
# 他社の素材は扱わない。
import sys, os
import numpy as np
import fitz
from PIL import Image

pdf = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets_v5")
os.makedirs(out, exist_ok=True)
doc = fitz.open(pdf)


def grab(page, xref):
    pix = fitz.Pixmap(doc, xref)
    if pix.n - pix.alpha > 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    return Image.frombytes("RGB" if pix.n == 3 else "RGBA", (pix.width, pix.height), pix.samples).convert("RGB")


def by_rect(page_no, pred):
    page = doc[page_no]
    for img in page.get_images(full=True):
        rects = page.get_image_rects(img[0])
        if rects and pred(rects[0]):
            return grab(page, img[0])
    raise SystemExit(f"image not found on p{page_no + 1}")


def knockout_white(im):
    """白地を透過にする（色は白から逆算して復元）。"""
    a = np.asarray(im, np.float32) / 255.0
    alpha = np.clip(1.0 - a.min(axis=2), 0, 1)
    alpha = np.where(alpha < 0.15, 0, alpha)
    safe = np.maximum(alpha, 1e-3)[..., None]
    rgb = np.clip((a - (1 - alpha[..., None])) / safe, 0, 1)
    return np.dstack([rgb, alpha]), alpha


def trim(arr, alpha, pad=4):
    ys, xs = np.where(alpha > 0.3)
    y0, y1, x0, x1 = max(ys.min() - pad, 0), ys.max() + pad, max(xs.min() - pad, 0), xs.max() + pad
    return arr[y0:y1, x0:x1]


def save_rgba(arr, name):
    Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), "RGBA").save(os.path.join(out, name))


# 1) TB ロゴ：p.1 下部の横長ワードマーク（黒＋青のアクセント）
logo = by_rect(0, lambda r: r.y0 > 600 and r.width > 250)
arr, al = knockout_white(logo)
arr = trim(arr, al)
save_rgba(arr, "tb_logo_black.png")
white = arr.copy()
dark = white[..., :3].max(axis=2) < 0.35                    # 黒の部分だけ白にする（青のアクセントは残す）
white[..., :3][dark] = 1.0
save_rgba(white, "tb_logo_white.png")

# 2) AirReach ロゴ：p.1 上部
ar = by_rect(0, lambda r: r.y0 < 100 and r.width > 400)
arr, al = knockout_white(ar)
save_rgba(trim(arr, al, 8), "airreach_logo.png")

# 3) コーポレートサイトの画面：p.2 のノートPC内の画面
by_rect(1, lambda r: 480 < r.x0 < 520 and r.width > 700).save(os.path.join(out, "tb_site.jpg"), quality=90)

# 4) 代表写真：p.5
ceo = by_rect(4, lambda r: 700 < r.x0 < 780 and r.height > 250)
w, h = ceo.size
ceo.crop((int(w * 0.07), int(h * 0.02), int(w * 0.80), int(h * 0.02) + int(w * 0.73))).save(os.path.join(out, "ceo.jpg"), quality=90)  # 隣の人物を外した正方形
print("ok", out, sorted(os.listdir(out)))
