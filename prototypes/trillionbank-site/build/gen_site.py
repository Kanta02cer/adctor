# Trillion Bank 5ページ版プロトタイプの生成スクリプト（共通部分を各ページにはめ込む）
import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent  # prototypes/trillionbank-site
TB = 'https://trillion-bank.jp'
CONTACT = f'{TB}/trillionbank/contact/'
MEETING = f'{TB}/trillionbank/meeting/'
DIAG = f'{TB}/#diagnose'

PAGES = [
    ('index.html', 'トップ', 'Top'),
    ('company.html', '会社概要', 'Company'),
    ('business.html', '事業内容', 'Business'),
    ('news.html', 'ニュース', 'News'),
    ('members.html', 'メンバー', 'Members'),
]

DEFS = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<g id="tb-frames"><path d="M103 74 L168 42 L168 214 L103 247 Z"/><path d="M183 97 L248 64 L248 236 L183 268 Z"/><path d="M263 108 L327 75 L327 248 L263 281 Z"/></g>
<path id="tb-frame" d="M4 18 L30 5 L30 74 L4 87 Z"/>
<path id="tb-wave" d="M25 165 H105 C130 165 140 137 166 137 C200 137 216 191 256 191 C286 191 296 165 322 165 H389"/>
</defs></svg>'''

SYM = '<svg class="logo-sym" viewBox="0 0 414 318" aria-hidden="true"><use href="#tb-frames" class="f"/><path class="w" pathLength="1" d="M25 165 H105 C130 165 140 137 166 137 C200 137 216 191 256 191 C286 191 296 165 322 165 H389"/></svg>'


def key(name, label, cls='', style=''):
    st = f' style="{style}"' if style else ''
    return f'<button type="button" class="key {cls}" data-key="{name}" aria-label="隠しフレームを拾う（{label}）"{st}><svg viewBox="0 0 34 92" aria-hidden="true"><use href="#tb-frame"/></svg></button>'


def head(title, desc, canonical):
    return f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="株式会社Trillion Bank">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{TB}/images/hero/tb-logo-color.webp">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#164bff">
<link rel="icon" href="assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400..700&amp;family=Noto+Sans+JP:wght@400;500;700&amp;display=swap">
<link rel="stylesheet" href="site.css">
<script>
  document.documentElement.classList.add('js');
  try {{ if (sessionStorage.getItem('tb-nav') === '1') {{ sessionStorage.removeItem('tb-nav'); document.documentElement.classList.add('is-arriving'); }} }} catch (e) {{}}
</script>
'''


def header(current):
    lis = []
    for f, ja, en in PAGES:
        cur = ' aria-current="page"' if f == current else ''
        lis.append(f'<li><a href="{f}" data-page-label="{en}" data-roll{cur}>{ja}<small>{en}</small></a></li>')
    drawer = ''.join(f'<a href="{f}" data-page-label="{en}"{" aria-current=\"page\"" if f == current else ""}><span>{en}</span>{ja}</a>' for f, ja, en in PAGES)
    return f'''<a class="skip" href="#main">本文へスキップ</a>
<div class="progress" id="progress" aria-hidden="true"></div>
<header class="header" id="header">
  <div class="header__inner">
    <a href="index.html" class="header__logo" aria-label="Trillion Bank トップへ" data-page-label="Top" data-cursor="Top">{SYM}<img class="logo-word" src="assets/tb-wordmark.webp" alt="" width="2048" height="201"></a>
    <nav class="header__nav" aria-label="グローバルナビゲーション"><ul>{''.join(lis)}</ul></nav>
    <a class="pill pill--blue header__contact magnetic" href="{CONTACT}" data-cursor="相談する">お問い合わせ</a>
    <button type="button" class="header__menu" id="menuButton" aria-expanded="false" aria-controls="drawer" aria-label="メニューを開く"><span></span><span></span></button>
  </div>
</header>
<div class="drawer" id="drawer" hidden>
  <nav aria-label="メニュー">{drawer}</nav>
  <a class="pill pill--white pill--lg" href="{CONTACT}">お問い合わせ</a>
  <a class="pill pill--outline-white pill--lg" href="{DIAG}">無料でAI検索診断</a>
</div>
'''


FOOTER = f'''<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div>
        <a href="index.html" class="footer__logo" aria-label="Trillion Bank トップへ" data-page-label="Top">{SYM}<img class="logo-word" src="assets/tb-wordmark.webp" alt="" width="2048" height="201"></a>
        <p class="footer__company">株式会社Trillion Bank（トリリオンバンク）</p>
        <address>〒102-0083 東京都千代田区麹町六丁目2番1号<br>麹町サイトビル6階 ROOMZ</address>
      </div>
      <nav class="footer__nav" aria-label="フッターナビゲーション">
        <div><p>Site</p>
          <a href="index.html" data-page-label="Top">トップ</a>
          <a href="company.html" data-page-label="Company">会社概要</a>
          <a href="business.html" data-page-label="Business">事業内容</a>
          <a href="news.html" data-page-label="News">ニュース</a>
          <a href="members.html" data-page-label="Members">メンバー</a>
        </div>
        <div><p>Business</p>
          <a href="business.html#airreach" data-page-label="AirReach">AirReach</a>
          <a href="business.html#adctor" data-page-label="Adctor">Adctor</a>
          <a href="{DIAG}">無料でAI検索診断</a>
          <a href="{TB}/trillionbank/business/airreach-selfserve/">AirReach Tools</a>
        </div>
        <div><p>Contact</p>
          <a href="{CONTACT}">お問い合わせフォーム</a>
          <a href="{MEETING}">商談を予約する</a>
          <a class="footer__recruit" href="members.html#recruit" data-page-label="Recruit">採用について</a>
        </div>
      </nav>
    </div>
    <div class="footer__bottom">
      <p>※ 当社は銀行業を営む会社ではありません。</p>
      <ul>
        <li><a href="{TB}/trillionbank/privacy/">プライバシーポリシー</a></li>
        <li><a href="{TB}/trillionbank/terms/">利用規約</a></li>
        <li><a href="{TB}/trillionbank/security/">情報セキュリティ</a></li>
        <li><a href="{TB}/trillionbank/insights/editorial-policy/">編集方針</a></li>
      </ul>
      <p>© 2026 Trillion Bank</p>
    </div>
  </div>
</footer>
'''

FLOATERS = f'''<button type="button" class="hunt" id="hunt" aria-controls="mascotPanel" aria-label="隠しフレーム：0／4。ヒントを見る">
  <span class="hunt__slots" aria-hidden="true"><svg viewBox="0 0 34 92" data-slot="measure"><use href="#tb-frame"/></svg><svg viewBox="0 0 34 92" data-slot="protect"><use href="#tb-frame"/></svg><svg viewBox="0 0 34 92" data-slot="record"><use href="#tb-frame"/></svg><svg viewBox="0 0 34 92" data-slot="return"><use href="#tb-frame"/></svg></span>
  <span class="hunt__count" id="huntCount">0/4</span>
</button>
<div class="mascot" id="mascot">
  <div class="mascot__panel" id="mascotPanel" role="dialog" aria-modal="false" aria-labelledby="mascotTitle" hidden>
    <p class="mascot__title" id="mascotTitle">とりうるの寄り道案内</p>
    <p class="mascot__hint" id="mascotHint"></p>
    <p class="mascot__progress"><span id="mascotCount">0</span>／4 見つけた</p>
    <div class="mascot__links"><a href="{DIAG}" class="pill pill--blue">無料でAI検索診断</a><a href="{CONTACT}" class="pill pill--outline">相談する</a></div>
    <button type="button" class="mascot__close" id="mascotClose" aria-label="案内を閉じる"></button>
  </div>
  <button type="button" class="mascot__btn" id="mascotBtn" aria-expanded="false" aria-controls="mascotPanel" aria-label="とりうるの寄り道案内を開く"><img src="assets/toriuru-point.webp" alt="" width="480" height="480"></button>
</div>
<div class="unlock" id="unlock" role="dialog" aria-modal="true" aria-labelledby="unlockTitle" hidden>
  <div class="unlock__inner">
    <svg class="unlock__logo" viewBox="0 0 414 318" aria-hidden="true"><path d="M103 74 L168 42 L168 214 L103 247 Z"/><path d="M183 97 L248 64 L248 236 L183 268 Z"/><path d="M263 108 L327 75 L327 248 L263 281 Z"/><path class="uw" pathLength="1" d="M25 165 H105 C130 165 140 137 166 137 C200 137 216 191 256 191 C286 191 296 165 322 165 H389"/></svg>
    <p style="margin-top:24px;font-family:var(--font);letter-spacing:.3em;font-weight:600">UNLOCKED</p>
    <h2 id="unlockTitle">4つのフレームが、そろいました。</h2>
    <p>Trillion Bankのロゴは、<b>測る・守る・記録する</b>の3枚のフレームと、そこを通り抜けて発信者へ<b>還る</b>青い線でできています。5つのページを歩いてくださって、ありがとうございました。</p>
    <div class="unlock__actions"><a class="pill pill--white pill--lg" href="{DIAG}">無料でAI検索診断をはじめる</a><a class="pill pill--outline-white pill--lg" href="{CONTACT}" data-close-unlock>相談する</a></div>
    <button type="button" class="unlock__close" id="unlockClose">閉じる</button>
  </div>
  <div class="confetti" aria-hidden="true"></div>
</div>
<div class="curtain" id="curtain" aria-hidden="true"><div class="curtain__panels"><span></span><span></span><span></span></div><p class="curtain__label"></p></div>
<div class="cursor" id="cursor" aria-hidden="true"><span class="cursor__label" id="cursorLabel"></span></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script src="site.js"></script>
</body>
</html>
'''


def page(fname, title, desc, body, canonical):
    html = head(title, desc, canonical) + '</head>\n<body>\n' + DEFS + '\n' + header(fname) + '<main id="main">\n' + body + '\n</main>\n' + FOOTER + FLOATERS
    (OUT / fname).write_text(html, encoding='utf-8')
    print('wrote', fname, len(html))


def phero(en, ja, lead, crumb):
    return f'''<section class="phero" aria-labelledby="page-title">
  <div class="container">
    <p class="phero__crumb"><a href="index.html" data-page-label="Top">トップ</a> ／ {crumb}</p>
    <h1 id="page-title"><span class="sr">{ja}</span><span class="display split hover-wave">{en}</span></h1>
    <p class="phero__ja reveal" aria-hidden="true">{ja}</p>
    <p class="phero__lead reveal">{lead}</p>
  </div>
  <svg class="phero__sym" viewBox="0 0 414 318" aria-hidden="true"><use href="#tb-frames" class="f"/><use href="#tb-wave" class="w"/></svg>
</section>
'''


# =============================================================================
# TOP
# =============================================================================
TOP = f'''<div class="opening" id="opening" aria-hidden="true">
  <div class="opening__panels"><span></span><span></span><span></span></div>
  <div class="opening__rings"><span></span><span></span><span></span></div>
  <div class="opening__count"><span class="opening__num" id="openingNum">0</span><span class="opening__unit">TRILLION ISSUES TO TAKE ON</span></div>
  <div class="opening__logo">
    <svg class="opening__sym" viewBox="0 0 414 318"><g class="f"><path pathLength="1" d="M103 74 L168 42 L168 214 L103 247 Z"/><path pathLength="1" d="M183 97 L248 64 L248 236 L183 268 Z"/><path pathLength="1" d="M263 108 L327 75 L327 248 L263 281 Z"/></g><path class="w" pathLength="1" d="M25 165 H105 C130 165 140 137 166 137 C200 137 216 191 256 191 C286 191 296 165 322 165 H389"/></svg>
    <img class="opening__word" src="assets/tb-wordmark.webp" alt="" width="2048" height="201">
  </div>
  <button type="button" class="opening__skip" id="openingSkip" tabindex="-1">スキップ</button>
</div>
<button type="button" class="motion-toggle" id="motionToggle" aria-pressed="false" aria-label="動きを停止する"><span id="motionLabel">動き：ON</span><span class="motion-toggle__icon" aria-hidden="true"></span></button>

<section class="hero" aria-labelledby="hero-title">
  <div class="hero__stage">
    <div class="hero__shapes" aria-hidden="true">
      <svg class="shape s1" viewBox="100 40 230 245"><use href="#tb-frames"/></svg>
      <svg class="shape s2" viewBox="180 60 70 210"><path d="M183 97 L248 64 L248 236 L183 268 Z"/></svg>
      <svg class="shape s3" viewBox="100 40 70 210"><path d="M103 74 L168 42 L168 214 L103 247 Z"/></svg>
      <svg class="shape s4" viewBox="260 70 70 215"><path d="M263 108 L327 75 L327 248 L263 281 Z"/></svg>
      <svg class="shape s5" viewBox="0 120 414 90"><use href="#tb-wave"/></svg>
      <svg class="shape s6" viewBox="0 120 414 90"><use href="#tb-wave"/></svg>
      <span class="shape dot d1"></span><span class="shape dot d2"></span>
    </div>
    {key("measure", "1：測る", "key--float", "left:13vw;top:46%;width:34px")}
    <div class="hero__copy">
      <p class="hero__display" aria-hidden="true"><span>Measure</span> <span>to</span> <span>Return</span></p>
      <h1 class="hero__title" id="hero-title">AIに情報がどう見られ、どう使われるかを、<br class="pc">測り、守る会社。</h1>
      <p class="hero__lead">AI検索で見つかる会社を増やし、AIに使われた情報を価値へ変える。</p>
    </div>
    <a class="hero__scroll" href="#intro"><span>Scroll</span><i aria-hidden="true"></i></a>
    <div class="hero__iris" aria-hidden="true"></div>
  </div>
</section>

<section class="section" id="intro" aria-labelledby="intro-title">
  <div class="container">
    <p class="eyebrow reveal">About Trillion Bank</p>
    <h2 class="h2 fill-words" id="intro-title" style="font-size:clamp(28px,4vw,60px);line-height:1.5">
      <span class="w">ChatGPTに聞く。</span><span class="w">AIが答える。</span><br>
      <span class="w">その答えの中に、</span><span class="w is-blue">御社は</span><span class="w">いますか。</span><br>
      <span class="w">その答えのもとになった</span><span class="w is-blue">情報</span><span class="w">に、</span><br>
      <span class="w">対価は</span><span class="w is-blue">還って</span><span class="w">いますか。</span>
    </h2>
    <p class="lead reveal" style="margin-top:40px;max-width:760px">Trillion Bankは、AI検索とAIエージェントの時代の「情報の流れ」を、測って・守って・記録する会社です。<br>「AIに選ばれたい企業」と「AIに使われる情報をつくる人」の両方の課題に、2つの事業で向き合っています。</p>
  </div>
</section>

<section class="hscroll on-blue" aria-labelledby="map-title">
  <div class="hscroll__stage">
    <div class="hscroll__head">
      <h2 id="map-title"><span class="sr">2つの事業マップ</span><span class="display display--md split">Business Map</span></h2>
      <p class="hscroll__hint" aria-hidden="true">Scroll<i></i></p>
    </div>
    <div class="hscroll__track">
      <div class="mapcard mapcard--intro">
        <p class="eyebrow">2 Businesses</p>
        <p class="h2">AIの答えの<br>「入口」と「出口」を<br>整える2つの事業。</p>
        <p class="mapcard__desc" style="color:rgba(255,255,255,.92)">AIに<b>見つけてもらう</b>ための AirReach。<br>AIに<b>使われた分が還る</b>ための Adctor。</p>
      </div>
      <a class="mapcard" href="business.html#airreach" data-page-label="AirReach" data-cursor="AirReachへ">
        <span class="mapcard__go"><span class="arrow-btn"></span></span>
        <p class="mapcard__en">AirReach</p>
        <p class="mapcard__cat">AI集客マーケティング <span class="chip chip--now">提供中</span></p>
        <p class="mapcard__desc">AIの回答に、御社が候補として出てくるか。競合とどちらが選ばれ、どの情報が引用されたか。<b>証拠つきで測り、直して、また測ります。</b></p>
        <p class="mapcard__who">こんな方に：AI検索対策に予算を付ける根拠がほしい経営者・マーケ・広報の方</p>
        <p class="mapcard__flow"><span>測る</span><b>→</b><span>改善する</span><b>→</b><span>再計測</span></p>
      </a>
      <a class="mapcard mapcard--ink" href="business.html#adctor" data-page-label="Adctor" data-cursor="Adctorへ">
        <span class="mapcard__go"><span class="arrow-btn"></span></span>
        <p class="mapcard__en">Adctor</p>
        <p class="mapcard__cat">AI情報利用管理 <span class="chip chip--plan">研究開発・限定PoC</span></p>
        <p class="mapcard__desc">AIクローラーやAIエージェントが、どの情報をいつ取得したかを<b>記録し、契約・ライセンス・対価へつなぐ</b>基盤を研究開発しています。</p>
        <p class="mapcard__who">こんな方に：AIに読まれても対価・証跡が残らないメディア・専門DB、データ提携を考えるAI事業者</p>
        <p class="mapcard__flow"><span>守る</span><b>→</b><span>記録する</span><b>→</b><span>正規化する</span></p>
      </a>
      <a class="mapcard mapcard--steps" href="business.html" data-page-label="Business" data-cursor="全体を見る">
        <span class="mapcard__go"><span class="arrow-btn"></span></span>
        <p class="mapcard__en" style="color:var(--blue)">How it connects</p>
        <p class="mapcard__desc">2つの事業は、ひとつの流れでつながっています。</p>
        <ol>
          <li><span>01</span>測る<span class="chip chip--now">AirReach</span></li>
          <li><span>02</span>守る<span class="chip chip--poc">Adctor</span></li>
          <li><span>03</span>記録する<span class="chip chip--poc">Adctor</span></li>
          <li><span>04</span>正規化する<span class="chip chip--plan">構想</span></li>
        </ol>
      </a>
    </div>
    <div class="hscroll__bar" aria-hidden="true"><i></i></div>
  </div>
</section>

<section class="section" aria-labelledby="news-title">
  <div class="container">
    <div class="sec-head">
      <h2 id="news-title"><span class="sr">最新ニュース</span><span class="display display--md split hover-wave" data-drift="-60">News</span></h2>
      <p class="lead reveal">お知らせ・プレスリリース・メディア出演の最新3件です。</p>
      <p class="reveal" style="justify-self:end"><a class="more" href="news.html" data-page-label="News" data-cursor="一覧へ">ニュース一覧<i aria-hidden="true"></i></a></p>
    </div>
    <div class="newsgrid">
      <a class="ncard reveal" href="{TB}/trillionbank/business/hack2/" data-cursor="Read"><span class="ncard__img t-blue" aria-hidden="true"><span>お知らせ</span><b>HackⅡ → AirReach</b></span><span class="ncard__row"><span class="tag tag--blue">お知らせ</span><time datetime="2026-09-29">2026.09.29</time></span><h3>「HackⅡ（ハックツ）」を「AirReach Consulting」に名称変更しました</h3></a>
      <a class="ncard reveal" href="{TB}/trillionbank/news/corporate-logo-renewal/" data-cursor="Read"><span class="ncard__img t-ink" aria-hidden="true"><span>お知らせ</span><b>New Logo</b></span><span class="ncard__row"><span class="tag tag--blue">お知らせ</span><time datetime="2026-09-04">2026.09.04</time></span><h3>コーポレートロゴ刷新のお知らせ｜TRILLION BANKの新しいブランド表現へ</h3></a>
      <a class="ncard reveal" href="{TB}/trillionbank/news/hackii-llmo-geo-implementation-report/" data-cursor="Read"><span class="ncard__img t-sky" aria-hidden="true"><span>お知らせ · 実測レポート</span><b>LLMO / GEO Report</b></span><span class="ncard__row"><span class="tag tag--blue">お知らせ</span><time datetime="2026-08-30">2026.08.30</time></span><h3>AirReach Consulting LLMO/GEO実装レポートを公開しました</h3></a>
    </div>
  </div>
</section>

<section class="section bg-surface" aria-labelledby="team-title">
  <div class="container">
    <div class="ceo">
      <figure class="ceo__photo"><img src="assets/ceo-kanta.webp" alt="代表取締役 井上 幹太の写真" width="400" height="400" loading="lazy"></figure>
      <div>
        <p class="eyebrow reveal">Our Team</p>
        <h2 class="sr" id="team-title">代表とメンバー</h2>
        <p class="ceo__quote reveal">設計なきDXは失敗する。<br>だから、設計から始める。</p>
        <p class="lead reveal" style="margin-top:20px">AI検索時代の情報流通を「測る・守る・正規化する」インフラをつくる。ツールや施策を先に入れるのではなく、目標設定・現状分析・戦略設計から始めることを大切にしています。</p>
        <p class="ceo__name reveal">井上 幹太<small>代表取締役 / Founder &amp; CEO</small></p>
        <p class="ceo__links reveal">
          <a class="pill pill--blue pill--lg magnetic" href="members.html" data-page-label="Members" data-cursor="メンバーへ">代表メッセージとメンバー</a>
          <a class="more" href="company.html" data-page-label="Company" data-cursor="会社概要">会社概要<i aria-hidden="true"></i></a>
        </p>
      </div>
    </div>
  </div>
</section>

<section class="circle-cta" aria-labelledby="cta-title">
  <div class="circle-cta__stage">
    <div class="circle-cta__marquee marquee" aria-hidden="true"><div class="marquee__track"><span>Trillion Bank <b>Let's talk</b></span><span>Trillion Bank <b>Let's talk</b></span></div></div>
    <div class="circle-cta__circle" aria-hidden="true"></div>
    <div class="circle-cta__inner">
      <h2 id="cta-title"><span class="sr">お問い合わせ</span><span class="display display--md" aria-hidden="true">Contact</span></h2>
      <p class="lead" style="margin-top:20px">事業のご相談・PoC・提携・取材は、フォームからお気軽にどうぞ。</p>
      <div class="circle-cta__actions">
        <a class="pill pill--white pill--lg magnetic" href="{CONTACT}" data-cursor="フォームへ">お問い合わせフォーム</a>
        <a class="pill pill--outline-white pill--lg magnetic" href="{DIAG}" data-cursor="30秒で診断">無料でAI検索診断</a>
      </div>
    </div>
  </div>
</section>
'''

# =============================================================================
# COMPANY
# =============================================================================
HISTORY = [
    ('2025', '12.23', '設立', 'Regalis Japan Group株式会社として設立。AI検索時代の情報流通を「測る・守る・正規化する」会社として歩み始める。', '会社', None),
    ('2026', '06.30', '株式会社Trillion Bankへ商号変更', '「Regalis Japan Group株式会社」から現在の商号へ変更。', '会社', None),
    ('2026', '07.20', '代表が「令和の虎 CHANNEL」人財版に出演', '累計1,600万円・2連続完全ALLを達成。', 'メディア', f'{TB}/trillionbank/news/reiwa-no-tora-jinzai/'),
    ('2026', '07.22', '代表が「Nontitle Season6」に出演', '起業リアリティ番組に出演。', 'メディア', f'{TB}/trillionbank/news/nontitle-appearance/'),
    ('2026', '08.14', '測定方法とデータポリシーを公開', 'AI検索の測定で「何をどう測り、何を公開しないか」を公開。', 'サービス', f'{TB}/trillionbank/news/hack2-measurement-data-policy/'),
    ('2026', '08.30', 'LLMO/GEO実装レポートを公開', '自社サイトでの実装と測定のプロセスを公開。', 'サービス', f'{TB}/trillionbank/news/hackii-llmo-geo-implementation-report/'),
    ('2026', '09.04', 'コーポレートロゴを刷新', '3枚のフレームと青い線による、現在のロゴへ。', '会社', f'{TB}/trillionbank/news/corporate-logo-renewal/'),
    ('2026', '09.29', '「AirReach Consulting」へ名称変更', 'AI検索インテリジェンス「HackⅡ（ハックツ）」の名称を変更。', 'サービス', f'{TB}/trillionbank/business/hack2/'),
]
tl_cards = []
for i, (y, md, h, p, tag, link) in enumerate(HISTORY):
    extra = f'<a class="more" href="{link}" data-cursor="Read">公式記事<i aria-hidden="true"></i></a>' if link else ''
    k = key('protect', '2：守る', '', 'position:absolute;top:22px;right:22px;width:26px') if i == len(HISTORY) - 1 else ''
    tl_cards.append(f'<article class="tl"><p class="tl__date">{y}<small>{md}</small></p><span class="tl__dot" aria-hidden="true"></span><span class="tag">{tag}</span><h3>{h}</h3><p>{p}</p>{extra}{k}</article>')

COMPANY = phero('Company', '会社概要', '私たちは、AIに情報がどう見られ、どう使われるかを測り、守る会社です。', '会社概要') + f'''
<nav class="local-nav" aria-label="ページ内リンク"><div class="container"><ul>
  <li><a href="#story">背景・ミッション</a></li><li><a href="#values">大切にしていること</a></li><li><a href="#profile">会社情報</a></li><li><a href="#history">沿革</a></li>
</ul></div></nav>

<section class="section" id="story" aria-labelledby="story-title">
  <div class="container story">
    <div class="story__sticky">
      <p class="eyebrow reveal">Why we started</p>
      <h2 class="h2 reveal" id="story-title">AIの答えの裏側で、<br>見えなくなったものがある。</h2>
      <p class="display display--md is-blue reveal" style="margin-top:32px;font-size:clamp(44px,6vw,96px)" aria-hidden="true">Trillion<br>Issues</p>
    </div>
    <div class="story__items">
      <div class="story__item"><p class="num">01 — 企業の課題</p><h3 class="h3">AIに選ばれているか、分からない</h3><p class="lead">AI検索が重要なのは分かる。でも、自社が本当に候補から外れているのか、競合が先行しているのか、今期動くべきかを示す数字がない。</p></div>
      <div class="story__item"><p class="num">02 — 発信者の課題</p><h3 class="h3">AIに使われても、何も残らない</h3><p class="lead">コンテンツがAIに読まれても、誰がどう使ったかの記録も対価も残らない。AI広告も始まり、ブラックボックスはさらに増えている。</p></div>
      <div class="story__item"><p class="num">03 — 私たちの答え</p><h3 class="h3">測る。守る。記録する。正規化する。</h3><p class="lead">見えなくなった流れを、まず証拠つきで測る。そのうえで、守る情報と開く情報を分け、使われた記録を契約と対価へつなぐ。それが、AirReachとAdctorです。</p></div>
      <div class="story__item"><p class="num">Mission</p><h3 class="h3" style="font-size:clamp(26px,3vw,44px)">トリリオンの課題に挑む。</h3><p class="lead"><b>Vision</b>　AI時代の情報流通に、信頼と正当な対価を。<br><b>Purpose</b>　日本で最も大きな幸せをつくる。</p></div>
    </div>
  </div>
</section>

<section class="section bg-surface" id="values" aria-labelledby="values-title">
  <div class="container">
    <div class="sec-head"><h2 id="values-title"><span class="sr">大切にしていること（Values）</span><span class="display display--md split hover-wave" data-drift="-50">Values</span></h2><p class="lead reveal">私たちが判断に迷ったときに立ち返る、5つの価値観です。</p></div>
    <div class="values">
      <div class="value reveal"><span>01</span><strong>Challenge the Trillion</strong><p>大きな課題にこそ挑む。規模の壁を技術で超える。</p></div>
      <div class="value reveal"><span>02</span><strong>Evidence over Hype</strong><p>流行語より証拠。データと実績で語る。</p></div>
      <div class="value reveal"><span>03</span><strong>Trust by Design</strong><p>信頼は後付けではなく、設計の中に組み込む。</p></div>
      <div class="value reveal"><span>04</span><strong>Speed with Integrity</strong><p>速さと誠実さを両立する。近道はしない。</p></div>
      <div class="value reveal"><span>05</span><strong>Happiness at Scale</strong><p>幸せをスケールさせる。それが最終目標。</p></div>
    </div>
  </div>
</section>

<section class="section" id="profile" aria-labelledby="profile-title">
  <div class="container">
    <div class="sec-head"><h2 id="profile-title"><span class="sr">会社情報</span><span class="display display--md split" data-drift="-50">Profile</span></h2><p class="lead reveal">登記上の基本情報です。</p></div>
    <table class="reg reveal">
      <caption class="sr">会社情報</caption>
      <tbody>
        <tr><th scope="row">商号</th><td>株式会社Trillion Bank（通称：トリリオンバンク）</td></tr>
        <tr><th scope="row">代表者</th><td>代表取締役　井上 幹太（イノウエ カンタ）</td></tr>
        <tr><th scope="row">所在地</th><td>〒102-0083 東京都千代田区麹町六丁目2番1号 麹町サイトビル6階 ROOMZ</td></tr>
        <tr><th scope="row">設立</th><td>2025年12月23日</td></tr>
        <tr><th scope="row">資本金</th><td>5,504,000円</td></tr>
        <tr><th scope="row">事業内容</th><td>AI検索インテリジェンス（AirReach Consulting）の開発・導入相談<br>AIコンテンツ利用管理基盤（Adctor / Pay per Crawl）の研究開発</td></tr>
        <tr><th scope="row">旧商号</th><td>Regalis Japan Group株式会社（2026年6月30日に現商号へ変更）</td></tr>
      </tbody>
    </table>
    <p class="small" style="margin-top:16px">※ 株式会社Trillion Bankは銀行業を営む会社ではありません。AI検索時代の情報流通インフラを提供するテクノロジーカンパニーです。</p>
  </div>
</section>

<section class="hscroll bg-surface" id="history" aria-labelledby="history-title">
  <div class="hscroll__stage">
    <div class="hscroll__head"><h2 id="history-title"><span class="sr">沿革</span><span class="display display--md split">History</span></h2><p class="hscroll__hint" aria-hidden="true">Scroll<i></i></p></div>
    <div class="hscroll__track">{''.join(tl_cards)}</div>
    <div class="hscroll__bar" aria-hidden="true"><i></i></div>
  </div>
</section>
'''

# =============================================================================
# BUSINESS
# =============================================================================
BUSINESS = phero('Business', '事業内容', 'AIの答えの「入口」で見つけてもらうための AirReach と、「出口」で使われた分が還るための Adctor。まずは全体の地図から。', '事業内容') + f'''
<nav class="local-nav" aria-label="ページ内リンク"><div class="container"><ul>
  <li><a href="#map">全体マップ</a></li><li><a href="#airreach">AirReach</a></li><li><a href="#cases">実測事例</a></li><li><a href="#adctor">Adctor</a></li><li><a href="#scope">できること・構想</a></li>
</ul></div></nav>

<section class="section" id="map" aria-labelledby="map-title">
  <div class="container">
    <div class="sec-head"><h2 id="map-title"><span class="sr">全体マップ</span><span class="display display--md split" data-drift="-50">Map</span></h2><p class="lead reveal">AIの答えをはさんで、左は「選ばれたい企業」、右は「情報をつくる人」。それぞれに1つずつ事業があります。</p></div>
    <div class="bmap">
      <div class="bmap__side bmap__side--l">
        <p class="eyebrow">For companies</p>
        <h3 class="h3">AIに見つけてほしい企業</h3>
        <p>AIの回答で候補に入っているか、競合に負けていないかを知りたい。</p>
        <span class="tag tag--blue">AirReach ・ 提供中</span>
        <p class="bmap__link"><a class="more" href="#airreach" data-cursor="AirReach">AirReachを見る<i aria-hidden="true"></i></a></p>
      </div>
      <div class="bmap__center"><div><small>AI SEARCH / AGENT</small>AI検索・<br>AIエージェント</div></div>
      <div class="bmap__side bmap__side--r">
        <p class="eyebrow">For creators &amp; data owners</p>
        <h3 class="h3">AIに情報を使われる発信者・データ保有者</h3>
        <p>AIに読まれた記録を残し、条件を決めて、対価につなげたい。</p>
        <span class="tag tag--ink">Adctor ・ 研究開発・限定PoC</span>
        <p class="bmap__link"><a class="more" href="#adctor" data-cursor="Adctor">Adctorを見る<i aria-hidden="true"></i></a></p>
      </div>
    </div>
  </div>
</section>

<section class="section bg-surface" id="airreach" aria-labelledby="ar-title" style="padding-bottom:0">
  <div class="container">
    <div class="sec-head">
      <h2 id="ar-title"><span class="sr">AirReach（AI集客マーケティング）</span><span class="display split hover-wave">AirReach</span></h2>
      <p class="h3 reveal">AI検索で「出たか」ではなく、<br>なぜ選ばれ、なぜ外れたかまで。</p>
      <p class="lead reveal">AI回答内での候補入り、競合との勝敗、引用された情報源を証拠付きで測定し、次に投資すべきコンテンツ・PR・外部メディア施策を特定します。<span class="chip chip--now">提供中</span></p>
    </div>
  </div>
</section>
<section class="pin bg-surface" data-steps="3" aria-label="AirReachの進め方（測る→改善する→再計測）">
  <div class="pin__stage"><div class="container cycle-wrap">
    <div class="cycle" aria-hidden="true">
      <svg viewBox="0 0 100 100"><circle class="cycle__track" cx="50" cy="50" r="40"/><circle class="cycle__prog" cx="50" cy="50" r="40" pathLength="1"/></svg>
      <div class="cycle__node n1" data-on="1"><div><small>MEASURE</small><strong>測る</strong></div></div>
      <div class="cycle__node n2" data-on="2"><div><small>IMPROVE</small><strong>改善する</strong></div></div>
      <div class="cycle__node n3" data-on="3"><div><small>RE-MEASURE</small><strong>再計測</strong></div></div>
      <div class="cycle__center"><div><b>AirReach</b><span>同じ条件で、くり返す</span></div></div>
    </div>
    <div>
      <p class="eyebrow">How it works</p>
      <h3 class="h2" style="margin-bottom:24px">測って、直して、また測る。</h3>
      <div class="cycle-steps">
        <div class="cycle-step" data-on="1"><span>STEP 1 ・ 測る</span><strong>設計して、複数のAIで同条件に測る</strong><p>購買・比較に近い重要な質問と競合を決め、回答本文・引用URL・測定日時と条件を証拠として保存します。</p></div>
        <div class="cycle-step" data-on="2"><span>STEP 2 ・ 改善する</span><strong>勝敗を分析し、直すところを決める</strong><p>質問ごとの勝ち負けと引用元から、FAQ・料金・比較・事例・PRなど改善の優先順位をつくります。</p></div>
        <div class="cycle-step" data-on="3"><span>STEP 3 ・ 再計測</span><strong>同じ条件で測り直し、次の判断へ</strong><p>施策の前後を同じ条件で比べ、効果を確かめて次の投資判断につなげます。</p></div>
      </div>
    </div>
  </div></div>
</section>
<section class="section bg-surface" aria-labelledby="measure-title" style="padding-top:clamp(48px,6vw,96px)">
  <div class="container">
    <h3 class="h3 reveal" id="measure-title" style="margin-bottom:24px">AirReachで測る4つのこと</h3>
    <div class="measures">
      <div class="measure reveal"><span>AI DECISION SHARE</span><strong>意思決定シェア</strong><p>購買・比較・予約・問い合わせに近い質問で、自社が比較候補に入っている割合。</p></div>
      <div class="measure reveal"><span>WIN / LOSS</span><strong>質問ごとの勝敗</strong><p>自社が選ばれた／競合だけが選ばれた／両方／どちらも出なかった、を分類。</p></div>
      <div class="measure reveal"><span>CITATION MAP</span><strong>引用チャネル</strong><p>AIが参照した情報源を、自社サイト・比較メディア・レビュー・ニュースなどに分類。</p></div>
      <div class="measure reveal"><span>REMEASURE</span><strong>施策前後の比較</strong><p>同じ条件で測り直し、改善の効果を確かめる。</p></div>
    </div>
    <p class="small" style="margin-top:20px">※ AirReach Consultingは限定商用検証・導入相談受付中です。AI検索での表示・問い合わせ・売上を保証するものではありません。</p>
  </div>
</section>
<section class="section on-blue" aria-labelledby="ar-products">
  <div class="container">
    <div class="sec-head"><h3 id="ar-products"><span class="sr">AirReachのサービス</span><span class="display display--md split" data-drift="-40">Services</span></h3><p class="lead reveal">まずは無料診断から。自分で直したい方にはTools、証拠つきの測定と改善の伴走にはConsultingを。</p></div>
    <div class="products">
      <a class="prow reveal" href="{DIAG}" data-cursor="診断へ"><span class="prow__name">AirReach 無料診断</span><span class="prow__for">URLを入れるだけ・登録不要・約30秒</span><span class="chip chip--now" style="background:#fff;color:var(--blue)">無料</span><span class="arrow-btn" aria-hidden="true"></span></a>
      <a class="prow reveal" href="{TB}/trillionbank/business/hack2/" data-cursor="Consulting"><span class="prow__name">AirReach Consulting</span><span class="prow__for">経営・予算判断に使える、証拠つきの測定と改善</span><span class="chip chip--now" style="background:#fff;color:var(--blue)">導入相談受付中</span><span class="arrow-btn" aria-hidden="true"></span></a>
      <a class="prow reveal" href="{TB}/trillionbank/business/airreach-selfserve/" data-cursor="Tools"><span class="prow__name">AirReach Tools</span><span class="prow__for">ご自身で測って直す月額サービス</span><span class="chip chip--now" style="background:#fff;color:var(--blue)">月額19,800円（税別）</span><span class="arrow-btn" aria-hidden="true"></span></a>
      <a class="prow reveal" href="{TB}/trillionbank/business/airreach-tools-agency/" data-cursor="代理店向け"><span class="prow__name">AirReach Tools（代理店向け）</span><span class="prow__for">お客様のドメインごとに測って直す</span><span class="chip chip--now" style="background:#fff;color:var(--blue)">お問い合わせから</span><span class="arrow-btn" aria-hidden="true"></span></a>
    </div>
  </div>
</section>
<section class="section" id="cases" aria-labelledby="cases-title">
  <div class="container">
    <div class="sec-head"><h3 id="cases-title"><span class="sr">公開できる実測事例</span><span class="display display--md split" data-drift="-40">Cases</span></h3><p class="lead reveal">公開できる実測事例は、現在は自社（トリリオンバンク）での実装と測定です。お客様の事例は、公開の許可をいただけたものから掲載します。</p></div>
    <div class="cases">
      <a class="case reveal" href="{TB}/trillionbank/news/hackii-llmo-geo-implementation-report/" data-cursor="Read"><span class="tag tag--blue">実測レポート ・ 2026.08.30</span><h3>AirReach Consulting LLMO/GEO実装レポート</h3><p>対策キーワードと、Service-led SaaS化する施策の実装プロセスを公開。</p><span class="more">公式記事を読む<i aria-hidden="true"></i></span></a>
      <a class="case reveal" href="{TB}/trillionbank/news/brand-entity-collision-case-study/" data-cursor="Read"><span class="tag tag--blue">実装事例 ・ 2026.09.05</span><h3>トリリオンバンクのエンティティ衝突をどう改善するか</h3><p>社名がAIに別のものと混同される問題に、どう向き合ったかの実装プロセス。</p><span class="more">公式記事を読む<i aria-hidden="true"></i></span></a>
      <a class="case reveal" href="{TB}/trillionbank/news/hack2-measurement-data-policy/" data-cursor="Read"><span class="tag">測定方法 ・ 2026.08.14</span><h3>測定方法とデータポリシー</h3><p>何をどう測り、何を公開しないか。測定の前提を公開しています。</p><span class="more">公式記事を読む<i aria-hidden="true"></i></span></a>
    </div>
  </div>
</section>

<section class="section on-dark" id="adctor" aria-labelledby="ad-title" style="padding-bottom:clamp(40px,5vw,72px)">
  <div class="container">
    <div class="sec-head">
      <h2 id="ad-title"><span class="sr">Adctor（AI情報利用管理）</span><span class="display split hover-wave">Adctor</span></h2>
      <p class="h3 reveal">AIによるWeb情報の利用を、<br>記録し、対価へつなぐ。</p>
      <p class="lead reveal">AIクローラーやAIエージェントによるコンテンツの取得を証跡として記録し、契約・ライセンス・価格ルールと結びつけ、将来的な請求へ接続する基盤を研究開発しています。<span class="chip chip--plan">研究開発・限定PoC</span></p>
    </div>
  </div>
</section>
<section class="pin bg-surface" data-steps="4" aria-label="Adctorの取引図">
  <div class="pin__stage"><div class="container deal-wrap">
    <p class="eyebrow">How it works</p>
    <h3 class="h2">データ提供者・Adctor・AI事業者の取引図</h3>
    <div class="deal">
      <div class="deal__node" data-on="1"><small>DATA PROVIDER</small><strong>データ提供者</strong><p>記事・画像・専門データをつくるメディアや専門データベース。守る情報と開く情報を決める。</p></div>
      <div class="deal__node deal__node--hub" data-on="2"><small>PLATFORM</small><strong>Adctor</strong><p>AIのアクセスを判別し、条件を伝え、取得の事実を「利用レシート」と「証跡」として残す。</p>{key("record", "3：記録する", "", "width:24px;margin-top:10px")}</div>
      <div class="deal__node" data-on="1"><small>AI COMPANY</small><strong>AI事業者</strong><p>AIクローラー・RAG・MCP・エージェントで情報を使う事業者。条件にもとづいて取得する。</p></div>
    </div>
    <div class="deal__lanes">
      <div class="lane lane--data" data-on="1"><span class="lane__k">データの流れ</span><div class="lane__track"><span>AIが取得を要求</span><b>→</b><span>Adctorが条件を提示</span><b>→</b><span>取得・利用レシート</span></div><p class="lane__note">現在：限定PoCで検証</p></div>
      <div class="lane lane--data" data-on="2"><span class="lane__k">記録</span><div class="lane__track"><span>利用イベント</span><b>→</b><span>台帳（Usage Ledger）</span><b>→</b><span>証跡（Evidence）</span></div><p class="lane__note">現在：限定PoCで検証</p></div>
      <div class="lane lane--money" data-on="3"><span class="lane__k">お金の流れ</span><div class="lane__track"><span>契約条件・価格ルール</span><b>→</b><span>請求イベント</span><b>→</b><span>請求書</span></div><p class="lane__note">初期は月次の請求CSVまで。請求書の発行は構想</p></div>
      <div class="lane lane--money" data-on="4"><span class="lane__k">還元</span><div class="lane__track"><span>AI事業者の支払い</span><b>→</b><span>精算</span><b>→</b><span>データ提供者へ分配</span></div><p class="lane__note">自動決済・収益分配は構想段階</p></div>
    </div>
    <p class="deal__step" data-only="1">① AIが情報を取りに来ると、<b>Adctorが条件を伝え</b>、条件にもとづく取得だけが通ります。</p>
    <p class="deal__step" data-only="2" hidden>② 取得の事実を<b>利用レシート・台帳・証跡</b>として残します。契約や請求の根拠になる記録です。</p>
    <p class="deal__step" data-only="3" hidden>③ 記録を<b>契約条件・価格ルール</b>と結びつけ、請求イベントにします（初期は月次CSVまで）。</p>
    <p class="deal__step" data-only="4" hidden>④ 支払いを精算し、<b>データ提供者へ還元</b>する。ここは今後の構想です。</p>
    <div class="deal__progress" aria-hidden="true"><i data-on="1"></i><i data-on="2"></i><i data-on="3"></i><i data-on="4"></i></div>
  </div></div>
</section>
<section class="section bg-surface" id="scope" aria-labelledby="scope-title" style="padding-top:clamp(48px,6vw,96px)">
  <div class="container">
    <h3 class="h2 reveal" id="scope-title" style="margin-bottom:28px">現在できることと、今後の構想</h3>
    <div class="scope">
      <div class="scope__box reveal"><h3><span class="chip chip--poc">いま</span>初期スコープ（PoC）</h3><ul><li>1ドメイン／限定パスでの運用</li><li>APIキー・HMACによる認証</li><li>200／402／403／429の応答</li><li>利用イベント・台帳（Usage Ledger）</li><li>価格ルール（Pricing Rule）</li><li>月次の請求CSV・監査ログ</li><li>最小限の管理画面</li></ul></div>
      <div class="scope__box scope__box--plan reveal"><h3><span class="chip chip--plan">構想</span>今後の構想</h3><ul><li>Pay per Citation（AIの回答での引用に応じた課金）</li><li>Pay per Use</li><li>MCP Tool Callへの課金</li><li>自動決済</li><li>収益分配</li></ul></div>
      <div class="scope__box scope__box--no reveal"><h3>明言しないこと</h3><ul><li>法的拘束力のある請求を現時点で保証すること</li><li>AIボットを100%識別できること</li><li>学習・推論での利用まで自動で証明できること</li><li>導入すれば必ず収益化できること</li></ul></div>
    </div>
    <p style="margin-top:32px;display:flex;flex-wrap:wrap;gap:12px 28px">
      <a class="pill pill--blue pill--lg magnetic" href="{MEETING}" data-cursor="予約する">PoC商談を予約する</a>
      <a class="more" href="{TB}/trillionbank/business/pay-per-crawl/" data-cursor="詳細">Adctor / Pay per Crawl の詳細<i aria-hidden="true"></i></a>
      <a class="more" href="news.html" data-page-label="News" data-cursor="ニュース">関連ニュース<i aria-hidden="true"></i></a>
    </p>
  </div>
</section>
'''

# =============================================================================
# NEWS
# =============================================================================
NEWS = [
    ('notice', 'お知らせ', '2026.09.29', '「HackⅡ（ハックツ）」を「AirReach Consulting」に名称変更', 'AI検索インテリジェンスの名称を変更しました。', f'{TB}/trillionbank/business/hack2/'),
    ('notice', 'お知らせ', '2026.09.05', 'トリリオンバンクのエンティティ衝突をどう改善するか｜実装プロセス公開', '自社での実装事例（AirReachの実測事例）。', f'{TB}/trillionbank/news/brand-entity-collision-case-study/'),
    ('notice', 'お知らせ', '2026.09.04', 'コーポレートロゴ刷新のお知らせ', 'TRILLION BANKの新しいブランド表現へ。', f'{TB}/trillionbank/news/corporate-logo-renewal/'),
    ('notice', 'お知らせ', '2026.08.30', 'AirReach Consulting LLMO/GEO実装レポート公開', '対策キーワードとService-led SaaS化する施策（AirReachの実測事例）。', f'{TB}/trillionbank/news/hackii-llmo-geo-implementation-report/'),
    ('notice', 'お知らせ', '2026.08.14', 'AirReach Consultingの測定方法とデータポリシー', '何をどう測り、何を公開しないか。', f'{TB}/trillionbank/news/hack2-measurement-data-policy/'),
    ('press', 'プレスリリース', '2026.07.22', '代表・井上幹太が「Nontitle Season6」に出演', '起業リアリティ番組への出演について。', f'{TB}/trillionbank/news/nontitle-appearance/'),
    ('press', 'プレスリリース', '2026.07.20', '代表・井上幹太が「令和の虎 CHANNEL」人財版に出演', '累計1,600万円・2連続完全ALL達成。', f'{TB}/trillionbank/news/reiwa-no-tora-jinzai/'),
    ('media', 'メディア・登壇', '—', '令和の虎 CHANNEL（人財版）', '代表出演。累計1,600万円・2連続完全ALL達成（YouTube・外部サイト）。', 'https://www.youtube.com/watch?v=tXTnZBE4-wM'),
    ('media', 'メディア・登壇', '—', '令和の虎 CHANNEL（受験生版）', '代表出演（YouTube・外部サイト）。', 'https://youtu.be/tvK855skBTM'),
    ('media', 'メディア・登壇', '—', 'Nontitle Season 6', '起業リアリティ番組に代表が出演（YouTube・外部サイト）。', 'https://youtu.be/AcJNa6jw1IY'),
    ('media', 'メディア・登壇', '—', 'SBI証券ビジネスドライブ', '代表出演（YouTube・外部サイト）。', 'https://youtu.be/F2hO--D6Hd0'),
]
rows = []
for cat, label, date, title, desc, href in NEWS:
    ext = href.startswith('https://www.youtube') or href.startswith('https://youtu')
    tgt = ' target="_blank" rel="noopener noreferrer"' if ext else ''
    tm = f'<time datetime="{date.replace(".", "-")}">{date}</time>' if date != '—' else '<span class="small">日付は公式記事を参照</span>'
    rows.append(f'<a class="nrow" data-cat="{cat}" href="{href}"{tgt} data-cursor="{"Watch" if ext else "Read"}">{tm}<span class="tag{" tag--blue" if cat != "media" else ""}">{label}</span><div><h3>{title}{"<span class=\"sr\">（外部サイト・新しいタブ）</span>" if ext else ""}</h3><p>{desc}</p></div><span class="arrow-btn" aria-hidden="true"></span></a>')

NEWS_PAGE = phero('News', 'ニュース', '「お知らせ」「プレスリリース」「メディア・登壇」の3つに分けて掲載しています。導入事例・実測事例は、該当する事業のページからも読めます。', 'ニュース') + f'''
<section class="section" aria-labelledby="list-title">
  <div class="container">
    <h2 class="sr" id="list-title">ニュース一覧</h2>
    <div class="tabs" role="tablist" aria-label="ニュースの分類">
      <button type="button" role="tab" data-cat="all" aria-selected="true">すべて</button>
      <button type="button" role="tab" data-cat="notice" aria-selected="false">お知らせ</button>
      <button type="button" role="tab" data-cat="press" aria-selected="false">プレスリリース</button>
      <button type="button" role="tab" data-cat="media" aria-selected="false">メディア・登壇</button>
    </div>
    <p class="sr" id="newsStatus" aria-live="polite"></p>
    <div class="nlist" role="tabpanel" aria-label="ニュース一覧">{''.join(rows)}</div>
    <p class="empty" id="newsEmpty" hidden>この分類のニュースはまだありません。</p>
    <p class="small" style="margin-top:20px">※ メディア・番組のサムネイル画像は、利用の許諾が確認できるまで掲載していません。受賞・連携は、日付・概要・公式記事へのリンクをそろえて掲載します。</p>
    <div style="margin-top:56px;display:flex;flex-wrap:wrap;gap:12px 28px">
      <a class="more" href="business.html#cases" data-page-label="Cases" data-cursor="事例へ">AirReachの実測事例<i aria-hidden="true"></i></a>
      <a class="more" href="{TB}/trillionbank/insights/" data-cursor="コラム">AI検索・AIデータ権利のコラム一覧<i aria-hidden="true"></i></a>
    </div>
  </div>
</section>
<section class="marquee marquee--outline" aria-hidden="true" style="padding-bottom:64px"><div class="marquee__track"><span>Notice · Press · Media · </span><span>Notice · Press · Media · </span></div></section>
'''

# =============================================================================
# MEMBERS
# =============================================================================
MEMBERS = phero('Members', 'メンバー', '経歴の長さよりも、「この人が、何に責任を持っているか」。Trillion Bankをつくるメンバーです。', 'メンバー') + f'''
<section class="section" aria-labelledby="msg-title">
  <div class="container msg">
    <figure class="msg__photo ceo__photo"><img src="assets/ceo-kanta.webp" alt="代表取締役 井上 幹太の写真" width="400" height="400"></figure>
    <div class="msg__body">
      <p class="eyebrow reveal">Message</p>
      <h2 class="reveal" id="msg-title">設計なきDXは失敗する。<br>だから、設計から始める。</h2>
      <p class="reveal">ツールや施策を先に導入するのではなく、まず目標設定・現状分析・戦略設計を行い、最適な手段を選んでから実行する。多くのDXの失敗が「設計の不在」によって起きている現実に対する、私たちのアンチテーゼです。</p>
      <p class="reveal">12年間の不登校を経て、14歳でエンジニアとして独立しました。いま私たちは、AI検索時代の情報流通を「測る・守る・正規化する」インフラをつくっています。AIに選ばれたい企業にも、AIに使われる情報をつくる人にも、正当な価値が届くように。</p>
      <p class="msg__sign reveal">井上 幹太<small>代表取締役 / Founder &amp; CEO</small></p>
    </div>
  </div>
</section>

<section class="section bg-surface" aria-labelledby="board-title">
  <div class="container">
    <div class="mgroup" style="margin-top:0">
      <div class="mgroup__head"><h2 id="board-title" class="h2">役員</h2><p>Board</p></div>
      <div class="mgrid">
        <article class="mcard reveal">
          <div class="mcard__photo"><img src="assets/ceo-kanta.webp" alt="井上 幹太の写真" width="400" height="400" loading="lazy"></div>
          <div class="mcard__body">
            <p class="mcard__role">代表取締役</p>
            <h3 class="mcard__name">井上 幹太<small>Kanta Inoue</small></h3>
            <dl>
              <div><dt>責任を持つこと</dt><dd class="mcard__resp">経営全般／AirReach Consulting・Adctor（Pay per Crawl）の研究開発と事業化</dd></div>
              <div><dt>経歴</dt><dd>14歳でエンジニアとして独立。Vector Group・SoftBank Group・リクルートホールディングス・トグルホールディングスでのインターンを経て、2025年に当社を設立。</dd></div>
              <div><dt>選出・認定</dt><dd>JAPAN TOYP 2026 ファイナリスト／ソフトバンクアカデミア17期／経済産業省 J-StarX 第1期／ZEN大学 1期特別奨学生</dd></div>
            </dl>
          </div>
        </article>
        <div class="mcard mcard--empty reveal"><p>ほかの役員は、正式な役職と写真がそろいしだい掲載します。</p></div>
      </div>
    </div>
    <div class="mgroup">
      <div class="mgroup__head"><h2 class="h2">事業メンバー</h2><p>Business Team</p></div>
      <div class="mgrid">
        <div class="mcard mcard--empty reveal"><p>事業メンバーは、写真・氏名・正式役職・担当領域・短い経歴を同じ書式でそろえて掲載します（準備中）。</p></div>
      </div>
    </div>
    <div class="mgroup">
      <div class="mgroup__head"><h2 class="h2">外部顧問</h2><p>Advisors</p></div>
      <p class="small">外部顧問は、ご本人の掲載許可をいただいた方のみ、この枠に掲載します。株主・協業先とは区別して表記します。</p>
    </div>
  </div>
</section>

<section class="section" id="recruit" aria-labelledby="recruit-title">
  <div class="container">
    <div class="recruit reveal">
      <div>
        <p class="eyebrow">Recruit</p>
        <h2 id="recruit-title"><span class="sr">採用について</span><span class="display" aria-hidden="true">Join us</span></h2>
        <p class="lead" style="margin-top:16px">トリリオンの課題に、一緒に挑む仲間を探しています。募集の詳細は準備中です。ご関心のある方は、お問い合わせフォームから「採用について」とお送りください。</p>
      </div>
      <div style="display:grid;gap:12px;justify-items:start">
        <a class="pill pill--white pill--lg magnetic" href="{CONTACT}" data-cursor="フォームへ">採用について問い合わせる</a>
        {key("return", "4：還元する", "", "width:26px")}
      </div>
    </div>
  </div>
</section>
'''

page('index.html', '株式会社Trillion Bank｜AIに情報がどう見られ、どう使われるかを、測り、守る会社',
     'AI検索で見つかる会社を増やし、AIに使われた情報を価値へ変える。AirReach（AI集客マーケティング）とAdctor（AI情報利用管理）の2事業。', TOP, f'{TB}/')
page('company.html', '会社概要｜株式会社Trillion Bank', '事業を始めた背景・ミッション、会社情報、沿革。', COMPANY, f'{TB}/trillionbank/company/')
page('business.html', '事業内容｜株式会社Trillion Bank', 'AirReach（測る→改善する→再計測）とAdctor（データ提供者・Adctor・AI事業者の取引）の事業内容。', BUSINESS, f'{TB}/trillionbank/business/')
page('news.html', 'ニュース｜株式会社Trillion Bank', 'お知らせ・プレスリリース・メディア・登壇。', NEWS_PAGE, f'{TB}/trillionbank/insights/')
page('members.html', 'メンバー｜株式会社Trillion Bank', '代表メッセージと、役員・事業メンバー。', MEMBERS, f'{TB}/trillionbank/ceo/')
