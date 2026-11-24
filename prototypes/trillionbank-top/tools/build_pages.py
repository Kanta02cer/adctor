#!/usr/bin/env python3
"""サイトの共通部品とページを組み立てる。

  - partials/ のヘッダー・フッター・お問い合わせ・浮かぶ部品を、index.html の目印
    （<!-- SITE:名前 --> 〜 <!-- /SITE:名前 -->）の間に入れる
  - pages_src/*.html から、各ページ（business.html など）を作る。
    {{section:ID}} … index.html の id="ID" のセクションをそのまま使う（同じ内容を二重に持たない）
    {{block:more2}} … index.html の協業・投資の案内
    {{crumbs}}      … パンくず
  - ヘッダー・ドロワーの、いま開いているページのリンクに aria-current="page" を付ける

メンバーを直したときは、先に tools/build_members.py、そのあとこのスクリプトを実行する。
"""
import glob
import html as H
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)  # noqa: E731
PARTS = ['symbols', 'header', 'contact', 'footer', 'floaters']


def read(p):
    return open(p, encoding='utf-8').read()


def part(name):
    return read(P('partials', name + '.html')).rstrip('\n')


def mark_current(s, page):
    s = re.sub(r' aria-current="page"', '', s)
    s = s.replace(' is-page"', '"')
    return re.sub(rf'(<a [^>]*data-page="{page}")', r'\1 aria-current="page"', s)


def fill_markers(s, page):
    for name in PARTS:
        body = part(name)
        if name == 'header':
            body = mark_current(body, page)
        pat = re.compile(rf'<!-- SITE:{name} -->.*?<!-- /SITE:{name} -->', re.S)
        if not pat.search(s):
            raise SystemExit(f'目印 SITE:{name} が見つかりません')
        s = pat.sub(lambda m: f'<!-- SITE:{name} -->\n{body}\n<!-- /SITE:{name} -->', s)
    return s


def element_by_id(s, ident):
    m = re.search(rf'<(section|article|div|aside)\b[^>]*\bid="{re.escape(ident)}"', s)
    if not m:
        raise SystemExit(f'index.html に id="{ident}" が見つかりません')
    tag, start = m.group(1), m.start()
    depth, i = 0, start
    rx = re.compile(rf'<{tag}\b|</{tag}>')
    for t in rx.finditer(s, start):
        depth += -1 if t.group(0).startswith('</') else 1
        if depth == 0:
            return s[start:t.end()]
    raise SystemExit(f'id="{ident}" の終わりが見つかりません')


def block(s, name):
    if name == 'more2':
        m = re.search(r'<aside class="bz-wrap bz-more2".*?</aside>', s, re.S)
        return m.group(0)
    raise SystemExit(f'知らない block: {name}')


# 使い回したセクションの中の、トップの場所へのリンクを、それぞれのページへ
RELINK = {
    '#business': 'business.html', '#airreach': 'airreach.html', '#adctor': 'adctor.html',
    '#products': 'airreach.html#products', '#usecases': 'usecases.html', '#media': 'media.html',
    '#news': 'news.html', '#company': 'company.html', '#members': 'company.html#members',
    '#ourbiz': 'business.html#ourbiz', '#statement': 'index.html#statement',
}


def relink(body):
    ids = set(re.findall(r'\bid="([^"]+)"', body)) | {'contact', 'main'}

    def sub(m):
        h = m.group(1)
        if h[1:] in ids or h not in RELINK:
            return m.group(0)
        return f'href="{RELINK[h]}"'
    return re.sub(r'href="(#[\w-]+)"', sub, body)


def crumbs(spec):
    items = ['<li><a href="index.html">Top</a></li>']
    parts = spec.split(';')
    for k, p in enumerate(parts):
        label, _, href = p.partition('|')
        if k == len(parts) - 1:
            items.append(f'<li><span aria-current="page">{H.escape(label)}</span></li>')
        else:
            items.append(f'<li><a href="{href}">{H.escape(label)}</a></li>')
    return '<nav class="crumbs" aria-label="現在地"><ol>' + ''.join(items) + '</ol></nav>'


HEAD = '''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#164bff">
<link rel="icon" href="assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400..700&amp;family=Noto+Sans+JP:wght@400;500;700&amp;display=swap">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="gp-motion.css">
<link rel="stylesheet" href="site.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body class="page page--{page}">
<!-- このファイルは tools/build_pages.py が pages_src/{page}.html から作ります。直接編集しないでください -->
<!-- SITE:symbols -->
<!-- /SITE:symbols -->

<a class="skip" href="#main">本文へスキップ</a>

<!-- SITE:header -->
<!-- /SITE:header -->

<main id="main">
{body}

<!-- SITE:contact -->
<!-- /SITE:contact -->
</main>

<!-- SITE:footer -->
<!-- /SITE:footer -->

<!-- SITE:floaters -->
<!-- /SITE:floaters -->

<script src="main.js"></script>
<script src="gp-motion.js"></script>
<script src="site.js"></script>
</body>
</html>
'''


def main():
    idx_path = P('index.html')
    idx = fill_markers(read(idx_path), 'top')
    if 'site.css' not in idx:
        idx = idx.replace('<link rel="stylesheet" href="gp-motion.css">', '<link rel="stylesheet" href="gp-motion.css">\n<link rel="stylesheet" href="site.css">')
    if 'src="site.js"' not in idx:
        idx = idx.replace('<script src="hero-geo.js"></script>', '<script src="hero-geo.js"></script>\n<script src="site.js"></script>')
    open(idx_path, 'w', encoding='utf-8').write(idx)
    print('index.html：共通部品を更新')

    for src in sorted(glob.glob(P('pages_src', '*.html'))):
        raw = read(src)
        meta = dict(re.findall(r'^(\w+):\s*(.+)$', raw.split('-->', 1)[0], re.M))
        body = raw.split('-->', 1)[1].strip('\n')
        page = meta['page']
        body = body.replace('{{crumbs}}', crumbs(meta['crumb']))
        body = re.sub(r'\{\{section:([\w-]+)\}\}', lambda m: element_by_id(idx, m.group(1)), body)
        body = re.sub(r'\{\{block:([\w-]+)\}\}', lambda m: block(idx, m.group(1)), body)
        body = relink(body)
        out = HEAD.format(title=H.escape(meta['title']), desc=H.escape(meta['description']), page=page, body=body)
        out = fill_markers(out, page)
        open(P(page + '.html'), 'w', encoding='utf-8').write(out)
        print(f'{page}.html を作成')


if __name__ == '__main__':
    main()
