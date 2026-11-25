# AirReach 営業資料用の素材：ロゴ（白地を透過、白抜き版）とマスコット「トリウル君」の切り出し
# 使い方: python3 -I make_assets_ar.py <AirReachロゴ画像>
import os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets_ar"); os.makedirs(OUT, exist_ok=True)


def knockout(im, thr=0.10):
    a = np.asarray(im.convert("RGB"), np.float32) / 255
    alpha = np.clip((1 - a.min(axis=2) - thr) / (1 - thr), 0, 1)
    rgb = np.clip((a - (1 - alpha[..., None])) / np.maximum(alpha, 1e-3)[..., None], 0, 1)
    return np.dstack([rgb, alpha])


def trim(arr, pad=6):
    ys, xs = np.where(arr[..., 3] > 0.25)
    return arr[max(ys.min() - pad, 0):ys.max() + pad, max(xs.min() - pad, 0):xs.max() + pad]


def save(arr, name):
    Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, name))


src = Image.open(sys.argv[1]).convert("RGBA")
sa = np.asarray(src, np.float32) / 255
al = np.clip((sa[..., 3] - 0.45) / 0.4, 0, 1)            # 元画像の透過を使い、薄い残りかすを消す
logo = trim(np.dstack([sa[..., :3], al]))
save(logo, "airreach_logo.png")
w = logo.copy()
dark = w[..., :3].max(axis=2) < 0.35            # 黒い文字だけ白にする（青はそのまま）
w[..., :3][dark] = 1.0
save(w, "airreach_logo_white.png")
# 記号部分（左のマーク）だけ
h, wd = logo.shape[:2]
save(trim(logo[:, : int(wd * 0.17)]), "airreach_mark.png")
mw = w[:, : int(wd * 0.17)].copy(); save(trim(mw), "airreach_mark_white.png")

# マスコット（当社サイト画像から）
site = Image.open(os.path.join(HERE, "assets_v5", "tb_site.jpg")).convert("RGB")
face = site.crop((1000, 215, 1200, 415)).resize((400, 400), Image.LANCZOS)
m = Image.new("L", face.size, 0); ImageDraw.Draw(m).ellipse([0, 0, 399, 399], fill=255)
face = face.convert("RGBA"); face.putalpha(m); face.save(os.path.join(OUT, "toriuru_face.png"))
body = site.crop((985, 190, 1235, 470))
save(trim(knockout(body, 0.04), 2), "toriuru_body.png")
print("ok", sorted(os.listdir(OUT)), Image.open(os.path.join(OUT, "airreach_logo.png")).size)
