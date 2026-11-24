#!/usr/bin/env python3
"""メンバー紹介を自動でそろえて、index.html に書き出す。

使い方：
  1. members/members.json に人を追加・変更する（photo には写真のファイル名）
  2. 写真を members/src/ に置く（背景・明るさ・大きさはばらばらで構わない）
  3. python3 tools/build_members.py を実行する

このスクリプトがすること：
  - 人物を切り抜く（rembg。端末の中だけで処理し、外部には送らない）
  - 顔を見つけて、顔の位置と大きさが全員同じになるよう 800×1000 に切り出す（＋縦長の写真 <id>-full.webp）
  - 白黒にして明るさをそろえ、下の端をぼかす → assets/members/<id>.webp
  - index.html の <!-- MEMBERS:START --> 〜 <!-- MEMBERS:END --> を書き換える
  ページ側では、カードの色（青→白）と重ねて表示するので、写真は青の単色調 → 白黒に変わる

必要なもの：pip install rembg "opencv-python-headless<5" pillow（OpenCV 5 には顔検出の部品がないため 4 系）
"""
import argparse
import html
import json
import os
import sys

from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 800, 1000
FACE_H = 0.30      # 顔の高さ（写真の高さに対する割合）
FACE_CY = 0.38     # 顔の中心の高さ（上からの割合）


def find_face(rgb, alpha):
    """顔の位置（中心x, 中心y, 高さ）を返す。見つからなければ切り抜きの形から推定する。
    幅600pxに縮めて探し、見つからなければ少し傾けて探す（見上げた写真・首をかしげた写真のため）。"""
    import math
    try:
        import cv2
        import numpy as np
        k = 600 / rgb.width
        small = np.array(rgb.convert('L').resize((600, max(1, round(rgb.height * k)))))
        sh, sw = small.shape
        # 厳しい条件から順に探し、切り抜いた人物の上にある顔だけを採用する
        for neighbors in (6, 3):
            for name in ('haarcascade_frontalface_default.xml', 'haarcascade_frontalface_alt2.xml'):
                cascade = cv2.CascadeClassifier(cv2.data.haarcascades + name)
                for ang in (0, -12, 12):
                    m = cv2.getRotationMatrix2D((sw / 2, sh / 2), ang, 1)
                    img = cv2.warpAffine(small, m, (sw, sh), borderValue=255) if ang else small
                    faces = cascade.detectMultiScale(img, scaleFactor=1.05, minNeighbors=neighbors, minSize=(50, 50))
                    for x, y, w, h in sorted(faces, key=lambda f: -f[2] * f[3]):
                        cx, cy = x + w / 2, y + h / 2
                        if ang:  # 傾けた画像での位置を、元の画像の位置に戻す
                            t = math.radians(ang)
                            dx, dy = cx - sw / 2, cy - sh / 2
                            cx = sw / 2 + dx * math.cos(t) - dy * math.sin(t)
                            cy = sh / 2 + dx * math.sin(t) + dy * math.cos(t)
                        ox, oy = int(min(rgb.width - 1, max(0, cx / k))), int(min(rgb.height - 1, max(0, cy / k)))
                        if alpha.getpixel((ox, oy)) < 100:
                            continue
                        return cx / k, (cy + h * 0.04) / k, h * 1.08 / k
    except Exception as e:  # noqa: BLE001
        print('  顔の検出に失敗したため、形から推定します:', e)
    print('  顔が見つからないため、切り抜きの形から推定します')
    bbox = alpha.point(lambda v: 255 if v > 128 else 0).getbbox()
    if not bbox:
        return rgb.width / 2, rgb.height * 0.35, rgb.height * 0.25
    l, t, r, b = bbox
    head = (b - t) * 0.22
    return (l + r) / 2, t + head * 0.62, head


def tone(person_rgb, alpha):
    """白黒にして、人物の部分の明るさの幅をそろえる。"""
    g = person_rgb.convert('L')
    hist = g.histogram(mask=alpha.point(lambda v: 255 if v > 160 else 0))
    total = sum(hist) or 1

    def pct(p):
        acc = 0
        for i, c in enumerate(hist):
            acc += c
            if acc >= total * p:
                return i
        return 255
    lo, hi = pct(0.02), pct(0.985)
    span = max(1, hi - lo)
    lut = []
    for i in range(256):
        v = (i - lo) / span
        v = min(1, max(0, v))
        v = v ** 0.92                      # 少しだけ明るく
        lut.append(int(12 + v * (246 - 12)))
    return g.point(lut)


def process(src_path, out_path, session):
    from rembg import remove
    im = Image.open(src_path).convert('RGB')
    cut = remove(im, session=session)
    alpha = cut.getchannel('A')
    fx, fy, fh = find_face(im, alpha)
    s = (H * FACE_H) / fh
    nw, nh = max(1, round(im.width * s)), max(1, round(im.height * s))
    g = tone(cut.convert('RGB'), alpha).resize((nw, nh), Image.LANCZOS)
    a = alpha.resize((nw, nh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    ox, oy = round(W / 2 - fx * s), round(H * FACE_CY - fy * s)
    canvas_l = Image.new('L', (W, H), 255)
    canvas_a = Image.new('L', (W, H), 0)
    canvas_l.paste(g, (ox, oy))
    canvas_a.paste(a, (ox, oy))
    # 下の端をぼかして、全員の写真の終わり方をそろえる。
    # 元の写真が胸元で切れている人は、その切れ目より上からぼかす
    bottom = min(H, oy + nh)
    end = bottom - 2
    start = min(round(H * 0.8), end - round(H * 0.22))

    def fade_at(y):
        if y <= start:
            return 255
        if y >= end:
            return 0
        t = (y - start) / max(1, end - start)
        return int(255 * (1 - t) ** 1.4)
    col = Image.new('L', (1, H))
    col.putdata([fade_at(y) for y in range(H)])
    canvas_a = Image.composite(canvas_a, Image.new('L', (W, H), 0), col.resize((W, H)))
    out = Image.merge('LA', (canvas_l, canvas_a)).convert('RGBA')
    out.save(out_path, 'WEBP', quality=80, method=6)
    print('  →', os.path.relpath(out_path, ROOT), f'(顔の高さ {fh:.0f}px, 倍率 {s:.2f})')
    full(cut, alpha, out_path.replace('.webp', '-full.webp'))


FULL_H = 1400


def full(cut, alpha, out_path):
    """メンバー紹介の左に出す縦長の写真。人物の部分だけを、写っている範囲いっぱいに切り出す。"""
    bbox = alpha.point(lambda v: 255 if v > 40 else 0).getbbox()
    if not bbox:
        return
    l, t, r, b = bbox
    pad = round((b - t) * 0.03)
    l, t, r = max(0, l - pad), max(0, t - pad), min(cut.width, r + pad)
    g = tone(cut.convert('RGB'), alpha).crop((l, t, r, b))
    a = alpha.crop((l, t, r, b))
    k = FULL_H / g.height
    size = (max(1, round(g.width * k)), FULL_H)
    g = g.resize(size, Image.LANCZOS)
    a = a.resize(size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    # 元の写真の下の端で切れているので、下だけやわらかく消す
    w, h = size
    col = Image.new('L', (1, h))
    start = round(h * 0.86)
    col.putdata([255 if y < start else int(255 * (1 - (y - start) / (h - start)) ** 1.3) for y in range(h)])
    a = Image.composite(a, Image.new('L', size, 0), col.resize(size))
    Image.merge('LA', (g, a)).convert('RGBA').save(out_path, 'WEBP', quality=80, method=6)
    print('  →', os.path.relpath(out_path, ROOT), size)


PLACEHOLDER = (
    '<svg class="mem__mark" viewBox="0 0 414 318" aria-hidden="true">'
    '<use href="#tb-frames" class="mem__mark-f"/><use href="#tb-wave" class="mem__mark-w"/></svg>'
)


def card(m, i, n):
    """経営メンバーの一覧のカード。押すと、自己紹介の画面（ダイアログ）が開く。"""
    e = html.escape
    mid = e(m['id'])
    if m.get('photo'):
        media = f'<img src="assets/members/{mid}.webp" alt="{e(m["name"])}の写真" width="{W}" height="{H}" loading="lazy" decoding="async">'
        cls = ''
    else:
        media = PLACEHOLDER + f'<span class="lead__initial" aria-hidden="true">{e(m["name"][0])}</span>'
        cls = ' lead__photo--none'
    link = ''
    if m.get('link'):
        link = (f'<a class="lead__link" href="{e(m["link"]["href"])}" target="_blank" rel="noopener noreferrer">'
                f'{e(m["link"]["label"])}<span class="sr">（新しいタブで開きます）</span></a>')
    return f'''          <li class="lead__item">
            <article class="lead__card" aria-labelledby="mem-{mid}-name">
              <div class="lead__photo{cls}">{media}</div>
              <p class="lead__en">{e(m['role_en'])}</p>
              <h4 class="lead__name" id="mem-{mid}-name">{e(m['name'])}</h4>
              <p class="lead__role">{e(m['role'])}</p>
              <button type="button" class="lead__open" data-i="{i}" aria-haspopup="dialog"><span class="sr">{e(m['name'])}のプロフィールを見る</span></button>
              <div class="lead__bio"><p>{e(m['bio'])}</p>{link}</div>
            </article>
          </li>'''


GROUPS = [('board', '取締役'), ('member', '執行役員・メンバー')]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=os.path.join(ROOT, 'members', 'src'), help='元の写真のフォルダ')
    ap.add_argument('--skip-photos', action='store_true', help='写真の処理をせず、HTMLだけ書き換える')
    args = ap.parse_args()
    data = json.load(open(os.path.join(ROOT, 'members', 'members.json'), encoding='utf-8'))
    members = data['members']
    out_dir = os.path.join(ROOT, 'assets', 'members')
    os.makedirs(out_dir, exist_ok=True)

    if not args.skip_photos:
        from rembg import new_session
        session = new_session('u2net_human_seg')
        for m in members:
            if not m.get('photo'):
                continue
            src = os.path.join(args.src, m['photo'])
            out = os.path.join(out_dir, m['id'] + '.webp')
            if not os.path.exists(src):
                if os.path.exists(out):
                    print(f'{m["name"]}: 元の写真がないため、作成済みの画像を使います')
                    continue
                sys.exit(f'写真が見つかりません: {src}')
            print(m['name'])
            process(src, out, session)

    blocks = []
    i = 0
    for key, label in GROUPS:
        group = [m for m in members if m.get('group', 'member') == key]
        if not group:
            continue
        cards = '\n'.join(card(m, i + k, len(members)) for k, m in enumerate(group))
        i += len(group)
        blocks.append(f'      <div class="lead__group">\n        <h3 class="lead__gh">{label}</h3>\n        <ul class="lead__grid">\n{cards}\n        </ul>\n      </div>')
    cards = '\n'.join(blocks)
    block = f'<!-- MEMBERS:START（tools/build_members.py が自動で書き換えます。直接編集しないでください） -->\n{cards}\n      <!-- MEMBERS:END -->'
    idx = os.path.join(ROOT, 'index.html')
    s = open(idx, encoding='utf-8').read()
    a = s.find('<!-- MEMBERS:START')
    b = s.find('<!-- MEMBERS:END -->')
    if a < 0 or b < 0:
        sys.exit('index.html に <!-- MEMBERS:START --> と <!-- MEMBERS:END --> が見つかりません')
    s = s[:a] + block + s[b + len('<!-- MEMBERS:END -->'):]
    open(idx, 'w', encoding='utf-8').write(s)
    print(f'index.html のメンバー欄を更新しました（{len(members)}人）')


if __name__ == '__main__':
    main()
