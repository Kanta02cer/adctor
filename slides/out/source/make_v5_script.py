# build_v4.js から build_v5.js を作る。
# 1) TB 公式ロゴ（自社資料から抽出）を全ページに配置
# 2) 第1章「私たちについて」（会社概要・代表と顧問・事業ポートフォリオ・AirReach・導入事例）を追加
# 3) 章番号・目次・根拠ページの参照を更新
import pathlib

here = pathlib.Path(__file__).parent
s = (here / "build_v4.js").read_text()


def R(a, b, count=1):
    global s
    assert a in s, ("MISSING", a[:90])
    s = s.replace(a, b, count) if count else s.replace(a, b)


R("Adctor 事業説明資料 v4 — LayerX の図表の型 × Trillion Bank のカラーコード", "Adctor 事業説明資料 v5 — 会社概要を追加（LayerX の図表の型 × TB カラーコード）")
R("python3 make_bg_v4.py && node build_v4.js", "build_v5.sh を実行")
R('"Adctor_TB_LayerX_v4.pptx"', '"Adctor_TB_LayerX_v5.pptx"')
R('pres.title = "Adctor 事業説明資料 v4";', 'pres.title = "Adctor 事業説明資料 v5";')
R('const BG = (n) => path.join(__dirname, "assets_v4", n);',
  'const BG = (n) => path.join(__dirname, "assets_v4", n);\nconst AS = (n) => path.join(__dirname, "assets_v5", n); // 自社資料から抽出した素材')

# ---- 1. ロゴ（720×65 の横長。縦横比 11.08 を固定） ----
R('{ text: { text: "Trillion Bank", options: { x: P(30), y: P(20), w: P(200), h: P(22), fontFace: ENS, fontSize: 14, color: col, margin: 0, valign: "middle" } } },',
  '{ image: { x: P(30), y: P(25), w: P(122), h: P(122 / 11.08), path: AS(light ? "tb_logo_black.png" : "tb_logo_white.png") } },')
R('T(s, "Trillion Bank", x, 112, 400, 28, { font: ENS, size: 20, color: C.white, ls: 1 });',
  's.addImage({ path: AS("tb_logo_white.png"), x: P(x), y: P(116), w: P(200), h: P(200 / 11.08) });')
R('T(s, "Trillion Bank", R - 200, 20, 248, 22, { font: ENS, size: 14, align: "right", ls: 1 });',
  's.addImage({ path: AS("tb_logo_black.png"), x: P(R + 48 - 122), y: P(25), w: P(122), h: P(122 / 11.08) });')

# ---- 3. 章番号を1つずつ繰り下げ（大きい番号から） ----
for n in [5, 4, 3, 2, 1]:
    name = {1: "はじめに", 2: "課題", 3: "仕組み", 4: "実証", 5: "補足"}[n]
    s = s.replace(f'"{n} {name}"', f'"{n + 1} {name}"')
    s = s.replace(f"divider({n}, \"{name}\"", f"divider({n + 1}, \"{name}\"")

# 目次（6章）
R('''  const items = [
    ["はじめに", "市場の変化とミッション"], ["課題", "合意・記録・対価の経路"], ["仕組み", "ビジネスモデルと取引の流れ"],
    ["実証", "1対1対1の初回PoC"], ["補足", "比較・計算式・根拠の区分"],
  ];
  items.forEach(([t, sub], i) => {
    const y = 74 + i * 80;
    T(s, String(i + 1), 455, y, 60, 56, { font: ENM, size: 46, ls: 1 });''', '''  const items = [
    ["私たちについて", "会社概要・事業・導入事例"], ["はじめに", "市場の変化とミッション"], ["課題", "合意・記録・対価の経路"],
    ["仕組み", "ビジネスモデルと取引の流れ"], ["実証", "1対1対1の初回PoC"], ["補足", "比較・計算式・根拠の区分"],
  ];
  items.forEach(([t, sub], i) => {
    const y = 66 + i * 68;
    T(s, String(i + 1), 455, y, 60, 50, { font: ENM, size: 40, ls: 1 });''')
R('T(s, t, 528, y + 4, 340, 30, { size: 22, bold: true, color: C.key, ls: 1.1 });', 'T(s, t, 528, y + 2, 340, 28, { size: 21, bold: true, color: C.key, ls: 1.1 });')
R('T(s, sub, 528, y + 36, 340, 18, { size: 11.5, bold: true, ls: 1 });', 'T(s, sub, 528, y + 32, 340, 18, { size: 11.5, bold: true, ls: 1 });')

# 補足C の参照ページ
R('[["実績", "実施・確定済みの事実", "掲載なし"], ["外部公表", "第三者の一次公表", "p.5"], ["検討案", "社内の計画・案・仮説", "p.5〜21"], ["試算", "承認済みの仮定による計算", "掲載なし"]]',
  '[["実績", "会社情報・AirReach（当社資料）", "p.5〜9"], ["外部公表", "第三者の一次公表", "p.11"], ["検討案", "Adctorの計画・案・仮説", "p.7, 11〜27"], ["試算", "承認済みの仮定による計算", "掲載なし"]]')
R('["取引先の名称", "掲載の承認がない"]', '["LPの数値", "Adctorサイトの統計値・価格。出典と承認が未確認"]')

# ---- 2. 第1章「私たちについて」 ----
ABOUT = r'''// 4 扉 1（私たちについて）
divider(1, "私たちについて", "About us", "AIの回答から、選択肢へ。", "1 私たちについて");

// 5 会社概要（LayerX p.51型：左に表、右に画像）
{
  const s = slide("LX_WHITE", "1 私たちについて", "会社概要");
  title(s, "会社概要");
  lead(s, "AIに情報を伝える仕組みの開発と、サイト改善を支援しています。");
  const rows = [
    ["会社名", "Trillion Bank"],
    ["設立", "2025年12月"],
    ["代表者", "代表取締役　井上 幹太"],
    ["所在地", "東京都千代田区麹町6丁目2-1\n麹町サイトビル6階 CROSSONE ROOMZ"],
    ["事業内容", "AI検索対策サービス「AirReach」\nAIとデータの取引インフラ「Adctor」（PoC計画中）"],
    ["外部顧問", "大手企業の役員など4名（次ページ）"],
  ];
  const tw = 450, hs = [36, 36, 36, 54, 54, 36];
  let y = 146;
  line(s, L, y, L + tw, y, { color: C.ink, w: 0.75 });
  rows.forEach(([k, v], i) => {
    T(s, k, L + 4, y, 96, hs[i], { size: 13, bold: true, color: C.key, valign: "middle", ls: 1 });
    T(s, v, L + 104, y, tw - 104, hs[i], { size: 13, valign: "middle", ls: 1.45 });
    y += hs[i];
    line(s, L, y, L + tw, y, { color: C.rule, w: 0.75 });
  });
  // 右：コーポレートサイト（自社資料の画面）
  const ix = L + tw + 30, iw = R - ix, ih = iw / 1.6;
  rect(s, ix - 1, 145, iw + 2, ih + 2, { fill: C.white, lc: C.rule, r: 4 });
  s.addImage({ path: AS("tb_site.jpg"), x: P(ix), y: P(146), w: P(iw), h: P(ih) });
  T(s, "コーポレートサイト", ix, 156 + ih, iw, 18, { size: 12, bold: true, ls: 1 });
  T(s, "「AI革命で、トリリオンの課題を担う。」", ix, 178 + ih, iw, 18, { size: 12, color: C.key, bold: true, ls: 1 });
  note(s, "出典：当社資料「AirReach AI検索対策サービスのご案内」（2026年11月版）。正式な商号の表記は登記に合わせて要確認。サイト画面は同資料の掲載画像。");
}

// 6 代表と外部顧問（TB資料 p.5 ＋ LayerX p.6/7 型）
{
  const s = slide("LX_WHITE", "1 私たちについて", "代表と外部顧問");
  title(s, "代表と外部顧問");
  lead(s, "代表と、大手企業の役員を含む外部顧問4名の体制です。");
  // 代表
  rect(s, L, 146, CW, 150, { fill: C.tint2, r: 6 });
  s.addImage({ path: AS("ceo.jpg"), x: P(L + 20), y: P(161), w: P(120), h: P(120) });
  T(s, "TRILLION BANK", L + 164, 166, 300, 14, { font: ENS, size: 10.5, color: C.sub, ls: 1, cs: 2 });
  T(s, "代表取締役", L + 164, 186, 120, 22, { size: 14, bold: true, color: C.key, ls: 1 });
  T(s, "井上 幹太", L + 256, 182, 300, 28, { size: 22, bold: true, ls: 1 });
  T(s, "累計1億回再生されたリアリティーショー「Nontitle」（MC：ヒカル・朝倉未来）に最年少で出演。\nZ世代チームのリーダーとして活躍。", L + 164, 222, CW - 184, 50, { size: 13, ls: 1.65 });
  // 外部顧問（4枚のカード）
  band(s, "bar_key.png", L, 316, CW, 28);
  T(s, "大手企業役員が外部顧問に就任", L + 16, 316, CW - 32, 28, { size: 12.5, bold: true, color: C.white, valign: "middle", ls: 1 });
  const adv = [["住友商事グループ", "株式会社SCデジタル\n執行役員"], ["大手上場SES", "株式会社ボードルア\n執行役員"], ["元 博報堂DY ONE", "データアナリスト／\nエンジニア"], ["株式会社VIXTON", "役員（漆沢氏）"]];
  const w = (CW - 3 * 12) / 4;
  adv.forEach(([org, role], i) => {
    const x = L + i * (w + 12);
    rect(s, x, 352, w, 100, { fill: C.card, r: 0 });
    T(s, org, x + 16, 366, w - 32, 22, { size: 15, bold: true, ls: 1 });
    line(s, x + 16, 394, x + w - 16, 394, { color: C.rule, w: 0.5 });
    T(s, role, x + 16, 402, w - 32, 40, { size: 12, color: C.sub, ls: 1.45 });
  });
  note(s, "出典：当社資料（2026年11月版）。代表の経歴・顧問の所属は同資料の記載どおり。社外向けに使う前に、各顧問の掲載可否を確認する。");
}

// 7 事業ポートフォリオ（メルカリ p.38/51・LayerX p.17/22 型）
{
  const s = slide("LX_WHITE", "1 私たちについて", "事業ポートフォリオ");
  title(s, "AIの回答をめぐる2つの課題に、2つの事業で取り組みます。");
  lead(s, "Adctorのサイトは「AIに盗まれるか、AIに売るか。」と問いかけています。サイト運営者は、AIに見つけてもらえない課題と、\nデータを無断で使われる課題の両方を抱えています。", 90, { h: 46, size: 13 });
  const c1 = L, w1 = 250, c2 = L + 290, w2 = 340, c3 = L + 666, w3 = CW - 666;
  [["サイト運営者の課題", c1, w1], ["Trillion Bank の事業", c2, w2], ["状況", c3, w3]].forEach(([t, x, w]) => {
    band(s, "bar_key.png", x, 146, w, 26);
    T(s, t, x + 12, 146, w - 24, 26, { size: 12, bold: true, color: C.white, valign: "middle", ls: 1 });
  });
  const rows = [
    ["AIに無視される", "AIの回答で紹介されず、\n比較候補に入れない", "logo", "AIの回答で紹介されるための、\nサイト情報整備（AI検索対策）", "提供中", "月額プラン・\n導入事例あり", true],
    ["データを無断で使われる", "AIに取得・利用されても、\n対価も記録も残らない", "Adctor", "AIとデータの取引インフラ\n（許諾・取得記録・請求）", "計画中", "1対1対1の\n初回PoCを準備", false],
  ];
  rows.forEach(([ph, pd, brand, bd, st, sd, live], i) => {
    const y = 184 + i * 132;
    rect(s, c1, y, w1, 116, { fill: C.tint2, lc: C.sub, dash: "dash", lw: 0.75, r: 4 });
    T(s, ph, c1 + 16, y + 16, w1 - 32, 22, { size: 15, bold: true, ls: 1 });
    T(s, pd, c1 + 16, y + 48, w1 - 32, 50, { size: 12.5, color: C.sub, ls: 1.5 });
    tri(s, c1 + w1 + 12, y + 50, 14, "right", C.key);
    rect(s, c2, y, w2, 116, { fill: C.white, lc: C.key, lw: 1.25, r: 4 });
    if (brand === "logo") s.addImage({ path: AS("airreach_logo.png"), x: P(c2 + 18), y: P(y + 16), w: P(96), h: P(96 * 285 / 846) });
    else T(s, brand, c2 + 18, y + 12, 200, 34, { font: EN, bold: true, size: 24, color: C.key, ls: 1 });
    T(s, bd, c2 + 18, y + 56, w2 - 36, 50, { size: 13.5, ls: 1.5 });
    tri(s, c2 + w2 + 12, y + 50, 14, "right", C.key);
    rect(s, c3, y, w3, 116, { fill: live ? C.tint : C.card, r: 4 });
    pill(s, st, c3 + 16, y + 18, 72, live ? { h: 24, size: 12 } : { h: 24, size: 12, fill: C.white, lc: C.key, color: C.key });
    T(s, sd, c3 + 16, y + 54, w3 - 32, 40, { size: 12.5, ls: 1.5 });
  });
  T(s, "どちらも、AIの回答と発信者のあいだを整え、価値を発信者の側に戻す事業です。", L, 452, CW, 20, { size: 13, bold: true, color: C.key, ls: 1 });
  note(s, "課題の表現はAdctorサイト（リポジトリ内のLP）を要約。同サイトの統計値・価格・運営会社表記は確認が取れていないため掲載していない。");
}

// 8 AirReach（TB資料 p.4/p.12 ＋ LayerX p.20 型）
{
  const s = slide("LX_WHITE", "1 私たちについて", "AirReach");
  title(s, "AirReachで、AIの回答の「比較候補」を目指す。");
  lead(s, "自社の情報を、AIが参照しやすい形に整えます。ChatGPT・Gemini・Perplexity・ClaudeなどのAI回答が対象です\n（対象AIと範囲は見積りで確認）。広告枠の購入ではなく、AI向けの情報整備です。", 90, { h: 46, size: 13 });
  const steps = [["01", "表示確認", "AIでの紹介状況と競合を確認"], ["02", "改善計画", "必要な情報や記事を整理"], ["03", "記事作成", "質問への回答と記事を作成"], ["04", "結果確認", "紹介や問い合わせを確認"]];
  const g = 18, w = (CW - 3 * g) / 4;
  steps.forEach(([n, h, d], i) => {
    const x = L + i * (w + g), y = 146;
    rect(s, x, y, w, 84, { fill: C.tint2, lc: C.rule, r: 4 });
    T(s, n, x + 14, y + 12, 30, 14, { font: ENS, size: 11, color: C.key, ls: 1 });
    T(s, h, x + 14, y + 28, w - 28, 22, { size: 16, bold: true, ls: 1 });
    T(s, d, x + 14, y + 56, w - 28, 18, { size: 11.5, color: C.sub, ls: 1 });
    if (i < 3) tri(s, x + w + 4, y + 36, 10, "right", C.key);
  });
  // 料金プラン（TB資料 p.12 の要約）
  T(s, "料金プラン", L, 246, 200, 20, { size: 14, bold: true, ls: 1 });
  const cols = ["モニター", "インサイト", "丸投げ"], lw = 150, cw = (CW - lw) / 3, y0 = 272;
  cols.forEach((c, i) => {
    rect(s, L + lw + i * cw + 2, y0, cw - 4, 28, { fill: C.key, r: 2 });
    T(s, c, L + lw + i * cw, y0, cw, 28, { size: 13, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  });
  const rows = [["月額料金", ["50,000円／月", "120,000円／月", "200,000円／月"], true], ["初期費用", ["100,000円", "200,000円", "300,000円"]], ["対象店舗数（ドメイン）", ["1店舗", "最大3店舗", "最大10店舗"]], ["記事本数（全店舗合計）", ["月4本", "月8本", "月12本"]], ["おすすめ", ["単店舗の簡易改善を進めたい", "複数店舗を改善したい", "計画・進行管理も任せたい"]]];
  rows.forEach(([k, vals, hot], r) => {
    const y = y0 + 32 + r * 30;
    T(s, k, L + 4, y, lw - 8, 26, { size: 11.5, bold: true, valign: "middle", ls: 1 });
    vals.forEach((v, i) => T(s, v, L + lw + i * cw, y, cw, 26, { size: hot ? 14 : 11.5, bold: !!hot, color: hot ? C.key : C.ink, align: "center", valign: "middle", ls: 1 }));
    line(s, L, y + 28, R, y + 28, { color: C.rule, w: 0.5 });
  });
  note(s, "出典：当社資料（2026年11月版）。契約12か月・税抜。対象AI・初期費用・追加作業は見積書で確定。AI回答・順位・引用・売上等を保証するものではない。");
}

// 9 導入事例（TB資料 p.6 ＋ LayerX p.39 型の数値タイル）
{
  const s = slide("LX_WHITE", "1 私たちについて", "AirReach 導入事例");
  title(s, "AirReachの導入事例");
  lead(s, "口コミ・評判メディア「みんなの評判.com」（運営：メディくる）で、AIの回答で紹介されるための情報整備を支援しています。");
  const th = 150, y = 150;
  const tile = (x, w, fill, col, lab, sub, val, unit) => {
    rect(s, x, y, w, th, { fill, r: 4 });
    T(s, lab, x + 16, y + 14, w - 32, 20, { size: 14, bold: true, color: col, ls: 1 });
    T(s, sub, x + 16, y + 36, w - 32, 16, { size: 11, color: col, ls: 1 });
    s.addText([{ text: val, options: { fontFace: EN, bold: true, fontSize: 50, color: col } }, { text: unit, options: { fontFace: JP, bold: true, fontSize: 18, color: col } }],
      { x: P(x + 12), y: P(y + 62), w: P(w - 26), h: P(76), margin: 0, align: "right", valign: "bottom", isTextBox: true, lang: "ja-JP" });
  };
  tile(L, 230, C.key, C.white, "表示回数", "約1か月強で", "2,227", "回");
  tile(L + 242, 230, C.mid, C.white, "クリック数", "約1か月強で", "100", "回");
  // 上位表示（キーワード別の順位）
  const kx = L + 484, kw = R - kx;
  rect(s, kx, y, kw, th, { fill: C.tint, r: 4 });
  T(s, "主要キーワードで上位表示", kx + 16, y + 14, kw - 32, 20, { size: 14, bold: true, ls: 1 });
  [["セノリッチ口コミ", "1.55"], ["セノリッチ価格", "1.91"], ["senorich価格", "2.00"]].forEach(([k, v], i) => {
    const ry = y + 44 + i * 33;
    rect(s, kx + 16, ry, kw - 32, 28, { fill: C.white, r: 3 });
    T(s, k, kx + 28, ry, 180, 28, { size: 12.5, bold: true, valign: "middle", ls: 1 });
    s.addText([{ text: v, options: { fontFace: EN, bold: true, fontSize: 16, color: C.key } }, { text: "位", options: { fontFace: JP, bold: true, fontSize: 11, color: C.key } }],
      { x: P(kx + kw - 120), y: P(ry), w: P(92), h: P(28), margin: 0, align: "right", valign: "middle", isTextBox: true, lang: "ja-JP" });
  });
  // 下段：期間と補足
  rect(s, L, 318, CW, 128, { fill: C.tint2, r: 6 });
  const facts = [["計測期間", "2026年7月27日 → 2026年9月3日"], ["支援内容", "AIの回答で紹介されるための情報整備（記事作成・サイト改善）"], ["AIでの紹介", "Googleの「AIによる概要」でも、同メディアの記事が引用・紹介された"]];
  facts.forEach(([k, v], i) => {
    const fy = 334 + i * 34;
    pill(s, k, L + 20, fy, 96, { h: 24, size: 11.5, fill: C.ink });
    T(s, v, L + 132, fy, CW - 152, 24, { size: 13, valign: "middle", ls: 1 });
  });
  note(s, "出典：当社資料（2026年11月版）の記載。表示回数・クリック数の計測ツール、順位の集計方法は同資料に記載がない。顧客名の掲載可否は要確認。結果を保証するものではない。");
}
'''
R("// 4 扉 1\n", ABOUT + "\n// 4' 扉（はじめに）\n")

(here / "build_v5.js").write_text(s)
print("wrote build_v5.js", len(s))
