// Adctor 事業説明資料 v6 — 表紙のフォント・背景トーン × メルカリ決算説明資料の構成と図表の型
// 生成: build_v6.sh（make_bg_v4.py・make_bg_v6.py・make_assets_v5.py の素材を使う）
// 参照したのはレイアウトと図表の型のみ。メルカリのロゴ・イラスト・写真・色・数値・文言は使わない。
// 座標は pt（960 × 540）で書き、P() でインチに換算する。
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.resolve(__dirname, "..", "Adctor_TB_v6.pptx");
const A4 = (n) => path.join(__dirname, "assets_v4", n);
const A5 = (n) => path.join(__dirname, "assets_v5", n);
const A6 = (n) => path.join(__dirname, "assets_v6", n);

// TB 指定色＋明度違いの派生色
const C = {
  white: "FFFFFF", ink: "111318", key: "1762E8", tint: "EAF1FF", sub: "667085", rule: "DDE2EA",
  deep: "0E46B8", mid: "4C86EE", light: "8DB3F4", pale: "C5D8FA", tint2: "F5F8FE",
  band: "E4E8EF", panel: "EEF1F6", ui: "111318", ui2: "232936",
};
const JP = "Noto Sans JP", EN = "Inter", ENM = "Inter Medium", ENS = "Inter SemiBold";
const P = (v) => v / 72;
const L = 96, R = 900, CW = R - L;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Trillion Bank";
pres.company = "Trillion Bank";
pres.title = "Adctor 事業説明資料 v6";
pres.theme = { headFontFace: JP, bodyFontFace: JP };

// ---------- primitives ----------
function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, {
    x: P(x), y: P(y), w: P(w), h: P(h), fontFace: o.font || JP, fontSize: o.size || 14, color: o.color || C.ink,
    bold: !!o.bold, align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true, lang: "ja-JP",
    fit: "none", lineSpacingMultiple: o.ls || 1.4, charSpacing: o.cs, vert: o.vert,
  });
}
function line(s, x1, y1, x2, y2, o = {}) {
  s.addShape(pres.shapes.LINE, {
    x: P(Math.min(x1, x2)), y: P(Math.min(y1, y2)), w: P(Math.abs(x2 - x1)), h: P(Math.abs(y2 - y1)), flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.color || C.rule, width: o.w || 0.75, dashType: o.dash || "solid", endArrowType: o.arrow ? "triangle" : undefined },
  });
}
function rect(s, x, y, w, h, o = {}) {
  const r = o.r || 0;
  s.addShape(r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
    x: P(x), y: P(y), w: P(w), h: P(h), rectRadius: r ? P(r) : undefined,
    fill: o.fill ? { color: o.fill } : { type: "none" },
    line: o.lc ? { color: o.lc, width: o.lw || 0.75, dashType: o.dash || "solid" } : { type: "none" },
    shadow: o.shadow ? { type: "outer", color: "8A93A3", opacity: 0.25, blur: 6, offset: 2, angle: 90 } : undefined,
  });
}
function shape(s, kind, x, y, w, h, o = {}) {
  s.addShape(pres.shapes[kind], {
    x: P(x), y: P(y), w: P(w), h: P(h), rotate: o.rot, flipH: o.flipH, flipV: o.flipV,
    fill: o.fill ? { color: o.fill } : { type: "none" }, line: o.lc ? { color: o.lc, width: o.lw || 1 } : { type: "none" },
  });
}
const dot = (s, x, y, col) => shape(s, "OVAL", x, y, 8, 8, { fill: col || C.key });
function bullets(s, items, x, y, w, o = {}) { // メルカリ型の青丸箇条書き
  const gap = o.gap || 26;
  items.forEach((t, i) => { dot(s, x, y + i * gap + (o.size || 14) * 0.45, o.col); T(s, t, x + 16, y + i * gap, w - 16, gap, { size: o.size || 14, ls: 1.35, bold: o.bold }); });
}
function img(s, file, x, y, w, h, o = {}) { s.addImage({ path: file, x: P(x), y: P(y), w: P(w), h: P(h), transparency: o.tr }); }
function band(s, text, x, y, w, h, o = {}) { // 灰色の見出し帯
  rect(s, x, y, w, h, { fill: o.fill || C.band });
  T(s, text, x, y, w, h, { size: o.size || 15, bold: true, align: "center", valign: "middle", color: o.color || C.ink, ls: 1 });
}
function gpill(s, text, x, y, w, o = {}) { // 灰色のピル見出し
  const h = o.h || 24;
  rect(s, x, y, w, h, { fill: o.fill || C.band, r: h / 2 });
  T(s, text, x, y, w, h, { size: o.size || 13, bold: true, align: "center", valign: "middle", color: o.color || C.ink, ls: 1 });
}
function glowCap(s, text, cx, cy, w, o = {}) { // 発光枠のカプセル（小）
  const sc = w / 800, iw = 860 * sc, ih = 260 * sc;
  img(s, A6("capsule_small.png"), cx - iw / 2, cy - ih / 2, iw, ih);
  T(s, text, cx - w / 2, cy - 100 * sc, w, 200 * sc, { size: o.size || 14, bold: true, align: "center", valign: "middle", ls: 1.25, color: o.color || C.ink });
}
function bigNum(s, val, unit, x, y, w, h, o = {}) {
  s.addText([{ text: val, options: { fontFace: EN, bold: true, fontSize: o.size || 40, color: o.color || C.key } }, { text: unit, options: { fontFace: JP, bold: true, fontSize: o.usize || 16, color: o.ucolor || C.ink } }],
    { x: P(x), y: P(y), w: P(w), h: P(h), margin: 0, align: o.align || "center", valign: "middle", isTextBox: true, lang: "ja-JP" });
}
function corner(s, x, y, n) { // 折り返しの角番号（p.15型）
  shape(s, "RIGHT_TRIANGLE", x, y, 62, 62, { fill: C.key, flipV: true });
  T(s, String(n), x + 8, y + 4, 30, 30, { font: ENS, size: 22, color: C.white, ls: 1 });
}

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "MC_PAGE", background: { path: A6("bg_page.jpg") },
  objects: [
    { text: { text: "Adctor Business Presentation", options: { x: P(10), y: P(170), w: P(16), h: P(200), fontFace: EN, fontSize: 8.5, color: C.light, vert: "vert270", margin: 0, align: "center", valign: "middle" } } },
    { image: { x: P(36), y: P(514), w: P(80), h: P(80 / 11.08), path: A5("tb_logo_black.png"), transparency: 45 } },
  ],
  slideNumber: { x: P(R - 6), y: P(508), w: P(30), h: P(14), fontFace: EN, fontSize: 9, color: C.ink, align: "right", margin: 0 },
});
pres.defineSlideMaster({ title: "MC_DIV", background: { path: A6("bg_divider.jpg") }, objects: [], slideNumber: { x: P(R - 6), y: P(508), w: P(30), h: P(14), fontFace: EN, fontSize: 9, color: C.ink, align: "right", margin: 0 } });
pres.defineSlideMaster({ title: "MC_DARK", background: { color: C.key }, objects: [{ image: { x: P(36), y: P(26), w: P(110), h: P(110 / 11.08), path: A5("tb_logo_white.png") } }], slideNumber: { x: P(R - 6), y: P(508), w: P(30), h: P(14), fontFace: EN, fontSize: 9, color: C.white, align: "right", margin: 0 } });
pres.defineSlideMaster({ title: "BARE", background: { color: C.white }, objects: [] });

function page(section, chap, title, o = {}) {
  const s = pres.addSlide({ masterName: "MC_PAGE", sectionTitle: section });
  let tx = 46;
  if (chap) {
    shape(s, "OVAL", 34, 24, 30, 30, { fill: C.key });
    T(s, String(chap), 34, 24, 30, 30, { font: ENS, size: 15, color: C.white, align: "center", valign: "middle", ls: 1 });
    tx = 74;
  }
  T(s, title, tx, 20, R - tx, 38, { size: o.size || 24, bold: true, valign: "middle", ls: 1.1 });
  rect(s, tx + 4, 62, 30, 3, { fill: C.key });
  return s;
}
function foot(s, lines) { T(s, lines, 130, 498, R - 180, 32, { size: 8, color: C.sub, ls: 1.25, valign: "bottom" }); }
function divider(n, title, sub, section) {
  pres.addSection({ title: section });
  const s = pres.addSlide({ masterName: "MC_DIV", sectionTitle: section });
  const bw = 560, sc = bw / 1400, iw = 1664 * sc, ih = 824 * sc, cx = 480, cy = 268;
  img(s, A6("capsule_divider.png"), cx - iw / 2, cy - ih / 2, iw, ih);
  T(s, "Chapter " + n, cx - 200, cy - 62, 400, 20, { font: ENM, size: 14, color: C.key, align: "center", ls: 1, cs: 2 });
  T(s, title, cx - 250, cy - 36, 500, 56, { size: 40, bold: true, align: "center", valign: "middle", ls: 1 });
  T(s, sub, cx - 230, cy + 30, 460, 22, { size: 14, color: C.sub, align: "center", ls: 1 });
  return s;
}

// =====================================================================
// 1 表紙（v5 の表紙をそのまま）
pres.addSection({ title: "導入" });
{
  const s = pres.addSlide({ masterName: "BARE", sectionTitle: "導入" });
  s.background = { path: A4("bg_cover.jpg") };
  const x = 400;
  img(s, A5("tb_logo_white.png"), x, 116, 200, 200 / 11.08);
  T(s, "Adctor", x - 4, 146, 540, 130, { font: EN, bold: true, size: 112, color: C.white, ls: 1 });
  T(s, "AIから発信者に、\n還元をするインフラをつくる", x, 290, 520, 96, { size: 30, bold: true, color: C.white, ls: 1.4 });
  T(s, "事業説明資料　初見の投資家・協業先向け", x, 408, 520, 22, { size: 14, color: C.white, ls: 1 });
  T(s, "November 25, 2026", x, 470, 300, 20, { font: ENM, size: 13, color: C.white, ls: 1 });
}

// 2 Adctorとは（p.2 ミッション型：中央に主句）
{
  const s = page("導入", null, "Adctorとは");
  T(s, "Adctor", L, 112, CW, 80, { font: EN, bold: true, size: 64, color: C.key, align: "center", ls: 1 });
  T(s, "AIとデータの取引インフラ", L, 200, CW, 44, { size: 30, bold: true, align: "center", ls: 1 });
  T(s, "AIによるデータ利用に「許諾・記録・請求」の経路をつくる事業です。\nこの資料では、会社概要と、Adctorの課題・仕組み・初回PoCの計画をお伝えします。", L, 258, CW, 52, { size: 14.5, align: "center", ls: 1.6 });
  [["許諾", "利用条件と価格の合意を残す"], ["取得記録", "誰が・いつ・何を取得したか"], ["請求", "記録から請求し、照合して分配"]].forEach(([h, d], i) => {
    const cx = 250 + i * 230;
    glowCap(s, h, cx, 360, 170, { size: 17 });
    T(s, d, cx - 110, 394, 220, 18, { size: 12, color: C.sub, align: "center", ls: 1 });
  });
  foot(s, "本資料には計画・検討案が含まれます。数値・社名は確認済みのもののみ掲載しています。");
}

// 3 目次（p.3型）
{
  const s = page("導入", null, "目次");
  const items = [["私たちについて", "会社概要・事業・導入事例"], ["はじめに", "市場の変化とミッション"], ["課題", "合意・記録・対価の経路"], ["仕組み", "ビジネスモデルと取引の流れ"], ["実証", "1対1対1の初回PoC"], ["補足", "比較・計算式・根拠の区分"]];
  items.forEach(([t, d], i) => {
    const y = 96 + i * 62;
    shape(s, "OVAL", 130, y, 34, 34, { fill: C.key });
    T(s, String(i + 1), 130, y, 34, 34, { font: ENS, size: 16, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, t, 182, y, 260, 34, { size: 22, bold: true, valign: "middle", ls: 1 });
    T(s, d, 420, y, 400, 34, { size: 13, color: C.sub, valign: "middle", ls: 1 });
  });
}

// ===== 1 私たちについて =====
divider(1, "私たちについて", "AIの回答から、選択肢へ。", "1 私たちについて");

// 5 会社概要（p.26/39型：青のラベル列の表＋サイト画面）
{
  const s = page("1 私たちについて", 1, "会社概要");
  bullets(s, ["AIに情報を伝える仕組みの開発と、サイト改善を支援しています"], L, 80, CW);
  const rows = [["会社名", "Trillion Bank"], ["設立", "2025年12月"], ["代表者", "代表取締役　井上 幹太"], ["所在地", "東京都千代田区麹町6丁目2-1\n麹町サイトビル6階 CROSSONE ROOMZ"], ["事業内容", "AI検索対策サービス「AirReach」\nデータ取引インフラ「Adctor」（PoC計画中）"], ["外部顧問", "大手企業の役員など4名（次ページ）"]];
  const hs = [38, 38, 38, 54, 54, 38], tw = 450, lw = 104;
  let y = 118;
  rect(s, L, y, tw, hs.reduce((a, b) => a + b, 0), { fill: C.white, lc: C.rule, lw: 1 });
  rows.forEach(([k, v], i) => {
    rect(s, L, y, lw, hs[i], { fill: C.key });
    if (i) line(s, L, y, L + tw, y, { color: i ? C.rule : C.white, w: 0.75 });
    T(s, k, L, y, lw, hs[i], { size: 13, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, v, L + lw + 16, y, tw - lw - 24, hs[i], { size: 13, valign: "middle", ls: 1.45 });
    y += hs[i];
  });
  const ix = L + tw + 28, iw = R - ix, ih = iw / 1.6;
  rect(s, ix, 118, iw, ih, { fill: C.white, lc: C.rule, shadow: true });
  img(s, A5("tb_site.jpg"), ix, 118, iw, ih);
  gpill(s, "コーポレートサイト", ix, 128 + ih, 150, { h: 22, size: 11.5 });
  T(s, "「AI革命で、トリリオンの課題を担う。」", ix + 160, 128 + ih, iw - 160, 22, { size: 12.5, bold: true, color: C.key, valign: "middle", ls: 1 });
  foot(s, "出典：当社資料「AirReach AI検索対策サービスのご案内」（2026年11月版）。正式な商号の表記は登記に合わせて要確認。サイト画面は同資料の掲載画像。");
}

// 6 代表と外部顧問（p.10型の灰色パネル＋p.15型の角番号カード）
{
  const s = page("1 私たちについて", 1, "代表と外部顧問");
  rect(s, L, 80, CW, 118, { fill: C.panel });
  img(s, A5("ceo.jpg"), L + 16, 92, 94, 94);
  T(s, "代表取締役", L + 128, 104, 130, 20, { size: 13, bold: true, color: C.key, ls: 1 });
  T(s, "井上 幹太", L + 128, 128, 130, 34, { size: 22, bold: true, ls: 1 });
  line(s, L + 270, 98, L + 270, 182, { color: C.sub, w: 1 });
  T(s, "累計1億回再生されたリアリティーショー「Nontitle」\n（MC：ヒカル・朝倉未来）に最年少で出演。\nZ世代チームのリーダーとして活躍。", L + 292, 96, CW - 310, 90, { size: 13.5, valign: "middle", ls: 1.7 });
  rect(s, L, 214, CW, 24, { fill: C.key, r: 12 });
  T(s, "大手企業役員が外部顧問に就任", L, 214, CW, 24, { size: 13, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  const adv = [["住友商事グループ", "株式会社SCデジタル\n執行役員"], ["大手上場SES", "株式会社ボードルア\n執行役員"], ["元 博報堂DY ONE", "データアナリスト／\nエンジニア"], ["株式会社VIXTON", "役員（漆沢氏）"]];
  const w = (CW - 3 * 16) / 4;
  adv.forEach(([org, role], i) => {
    const x = L + i * (w + 16), y = 252;
    rect(s, x, y, w, 196, { fill: C.white, lc: C.rule, shadow: true });
    corner(s, x, y, i + 1);
    T(s, org, x + 14, y + 70, w - 28, 28, { size: 15.5, bold: true, align: "center", ls: 1.2 });
    line(s, x + 20, y + 108, x + w - 20, y + 108, { color: C.key, w: 1 });
    T(s, role, x + 14, y + 120, w - 28, 50, { size: 13, color: C.sub, align: "center", ls: 1.5 });
  });
  foot(s, "出典：当社資料（2026年11月版）。経歴・所属は同資料の記載どおり。社外向けに使う前に、各顧問の掲載可否を確認する。");
}

// 7 事業ポートフォリオ（p.38型：ツリー）
{
  const s = page("1 私たちについて", 1, "事業ポートフォリオ");
  bullets(s, ["Adctorのサイトは「AIに盗まれるか、AIに売るか。」と問いかけている", "サイト運営者が抱える2つの課題に、2つの事業で取り組む"], L, 78, CW, { gap: 24 });
  glowCap(s, "Trillion Bank", 480, 158, 210, { size: 16 });
  line(s, 480, 180, 480, 196, { color: C.key, w: 1.5 });
  line(s, 300, 196, 660, 196, { color: C.key, w: 1.5 });
  const cols = [
    [300, "AirReach", true, ["AI検索対策（表示確認）", "記事作成・サイト改善", "結果確認（紹介・問い合わせ）"], "AIに無視される", "提供中｜月額プラン・導入事例あり"],
    [660, "Adctor", false, ["許諾（合意の記録）", "取得記録・請求用CSV", "請求・照合・分配"], "データを無断で使われる", "計画中｜1対1対1の初回PoCを準備"],
  ];
  cols.forEach(([cx, name, live, tags, prob, st]) => {
    line(s, cx, 196, cx, 210, { color: C.key, w: 1.5 });
    rect(s, cx - 130, 210, 260, 40, live ? { fill: C.key, r: 20 } : { fill: C.white, lc: C.key, lw: 2, r: 20 });
    T(s, name, cx - 130, 210, 260, 40, { font: EN, bold: true, size: 19, color: live ? C.white : C.key, align: "center", valign: "middle", ls: 1 });
    shape(s, "ISOSCELES_TRIANGLE", cx - 7, 256, 14, 9, { fill: live ? C.key : C.mid });
    tags.forEach((t, i) => {
      rect(s, cx - 120, 270 + i * 38, 240, 30, { fill: C.white, lc: C.rule, shadow: true });
      T(s, t, cx - 120, 270 + i * 38, 240, 30, { size: 13, bold: true, align: "center", valign: "middle", ls: 1 });
    });
    gpill(s, "課題：" + prob, cx - 150, 392, 300, { h: 26, size: 12.5 });
    T(s, st, cx - 150, 426, 300, 20, { size: 13, bold: true, color: live ? C.key : C.mid, align: "center", ls: 1 });
  });
  T(s, "どちらも、AIの回答と発信者のあいだを整え、価値を発信者の側に戻す事業", L, 458, CW, 20, { size: 13, color: C.sub, align: "center", ls: 1 });
  foot(s, "課題の表現はAdctorサイト（リポジトリ内のLP）を要約。同サイトの統計値・価格・運営会社表記は確認が取れていないため掲載していない。");
}

// 8 AirReach（p.5型の帯＋p.6型の料金）
{
  const s = page("1 私たちについて", 1, "AirReach｜AI検索対策サービス");
  bullets(s, ["自社の情報を、AIが参照しやすい形に整える（ChatGPT・Gemini・Perplexity・ClaudeなどのAI回答に対応）", "広告枠の購入ではなく、AI向けの情報整備。対象AIと範囲は見積りで確認"], L, 78, CW, { gap: 24, size: 13.5 });
  const steps = ["表示確認", "改善計画", "記事作成", "結果確認"];
  const sw = CW / 4;
  steps.forEach((t, i) => {
    shape(s, i ? "CHEVRON" : "PENTAGON", L + i * sw, 136, sw + 10, 34, { fill: i % 2 ? C.pale : C.tint });
    T(s, String(i + 1).padStart(2, "0") + "  " + t, L + i * sw + 16, 136, sw - 20, 34, { size: 13.5, bold: true, color: C.deep, align: "center", valign: "middle", ls: 1 });
  });
  const plans = [["モニター", "50,000", "100,000円", "1店舗", "月4本", "単店舗の簡易改善を進めたい"], ["インサイト", "120,000", "200,000円", "最大3店舗", "月8本", "複数店舗を改善したい"], ["丸投げ", "200,000", "300,000円", "最大10店舗", "月12本", "計画・進行管理も任せたい"]];
  const w = (CW - 2 * 14) / 3;
  plans.forEach(([n, m, init, shop, art, rec], i) => {
    const x = L + i * (w + 14), y = 186;
    rect(s, x, y, w, 270, { fill: C.white, lc: C.rule });
    band(s, n, x, y, w, 36, { size: 16 });
    gpill(s, "月額料金", x + 40, y + 50, w - 80, { h: 22, size: 12 });
    bigNum(s, m, "円／月", x, y + 76, w, 40, { size: 32, usize: 14 });
    gpill(s, "初期費用", x + 40, y + 124, w - 80, { h: 22, size: 12 });
    T(s, init, x, y + 150, w, 24, { font: EN, bold: true, size: 18, align: "center", ls: 1 });
    line(s, x + 20, y + 186, x + w - 20, y + 186, { color: C.rule });
    T(s, `対象：${shop}　記事：${art}`, x, y + 196, w, 20, { size: 12.5, align: "center", ls: 1 });
    T(s, rec, x + 10, y + 226, w - 20, 34, { size: 12.5, bold: true, color: C.key, align: "center", ls: 1.3 });
  });
  foot(s, "出典：当社資料（2026年11月版）。契約期間12か月・税抜。正式な対象AI・初期費用・追加作業は見積書で確定。\nAI回答・表示順位・引用、予約・来店・売上を保証するものではない。");
}

// 9 導入事例（p.6型：KPIサマリー）
{
  const s = page("1 私たちについて", 1, "AirReachの導入事例");
  bullets(s, ["口コミ・評判メディア「みんなの評判.com」（運営：メディくる）で、AIの回答で紹介されるための情報整備を支援"], L, 78, CW, { size: 13.5 });
  const w = (CW - 2 * 14) / 3, y = 116, h = 300;
  [["表示回数"], ["クリック数"], ["主要キーワードの順位"]].forEach(([hd], i) => {
    const x = L + i * (w + 14);
    rect(s, x, y, w, h, { fill: C.white, lc: C.rule });
    band(s, hd, x, y, w, 40, { size: 17 });
  });
  const x1 = L, x2 = L + w + 14, x3 = L + 2 * (w + 14);
  gpill(s, "約1か月強で", x1 + 50, y + 70, w - 100);
  bigNum(s, "2,227", "回", x1, y + 108, w, 70, { size: 52, usize: 20 });
  T(s, "2026/7/27 → 2026/9/3", x1, y + 196, w, 20, { font: EN, size: 13, color: C.sub, align: "center", ls: 1 });
  gpill(s, "約1か月強で", x2 + 50, y + 70, w - 100);
  bigNum(s, "100", "回", x2, y + 108, w, 70, { size: 52, usize: 20 });
  T(s, "AI検索で見込み患者の流入が増加", x2, y + 196, w, 20, { size: 12.5, color: C.sub, align: "center", ls: 1 });
  [["セノリッチ口コミ", "1.55"], ["セノリッチ価格", "1.91"], ["senorich価格", "2.00"]].forEach(([k, v], i) => {
    gpill(s, k, x3 + 40, y + 58 + i * 76, w - 80, { h: 22, size: 12 });
    bigNum(s, v, "位", x3, y + 84 + i * 76, w, 40, { size: 28, usize: 14 });
  });
  bullets(s, ["Googleの「AIによる概要」でも、同メディアの記事が引用・紹介された"], L, 430, CW, { size: 13.5 });
  foot(s, "出典：当社資料（2026年11月版）の記載。計測ツール・順位の集計方法は同資料に記載がない。顧客名の掲載可否は要確認。結果を保証するものではない。");
}

// ===== 2 はじめに =====
divider(2, "はじめに", "AIとデータの取引に、いま起きていること", "2 はじめに");

// 11 市場の変化（p.15型：角番号カード）
{
  const s = page("2 はじめに", 2, "AIとコンテンツの取引に起きている3つの変化");
  bullets(s, ["現時点では変化の方向のみを示す。数値は、出典を検証できたものから順に掲載する"], L, 80, CW);
  const cards = [["回答の場が\n変わる", "生成AIの回答で情報を得る人が増え、元のページを訪れない閲覧が生まれている。", "観察（定量値は未掲載）"], ["提供側が\n条件を示す", "大手CDN事業者が、AIクローラーに許諾・課金の条件を示す機能を公表した。", "外部公表（2025年7月）"], ["取引の事務が\n未整備", "許諾から記録・請求・入金・分配までを通して扱う実務の型は、まだ少ない。", "仮説（PoCで検証）"]];
  const w = (CW - 2 * 26) / 3;
  cards.forEach(([h, b, ev], i) => {
    const x = L + i * (w + 26), y = 118;
    rect(s, x, y, w, 340, { fill: C.white, lc: C.rule, shadow: true });
    corner(s, x, y, i + 1);
    T(s, h, x + 50, y + 22, w - 64, 62, { size: 19, bold: true, align: "center", valign: "middle", ls: 1.3 });
    line(s, x + 22, y + 100, x + w - 22, y + 100, { color: C.key, w: 1 });
    T(s, b, x + 22, y + 116, w - 44, 140, { size: 14, ls: 1.8 });
    gpill(s, ev, x + 22, y + 290, w - 44, { h: 26, size: 12, fill: i === 1 ? C.key : C.band, color: i === 1 ? C.white : C.ink });
  });
  foot(s, "変化2の出典：Cloudflare公式ブログ「Introducing pay per crawl」（2025年7月公表）。変化1・3は当社の観察・仮説。");
}

// 12 ミッション（表紙のトーン）
{
  const s = pres.addSlide({ masterName: "MC_DARK", sectionTitle: "2 はじめに" });
  s.background = { path: A4("bg_mission.jpg") };
  T(s, "Mission", 110, 184, 300, 26, { font: EN, size: 18, color: C.white, ls: 1 });
  T(s, "価値を生む人に、\n価値が還る社会を。", 110, 220, 380, 100, { size: 32, bold: true, color: C.white, ls: 1.5 });
  T(s, "AIが使うデータには、それを生んだ人がいる。\nその価値が、合意した条件で作り手に還る仕組みをつくる。\n\n利用者は、権利関係を説明できるデータを使える。\n提供者は、いつ誰に取得されたかを確かめ、対価を受け取れる。\nそんな取引を、当たり前のインフラにするために。", 480, 180, 420, 210, { size: 14.5, color: C.white, ls: 1.95 });
  T(s, "目指す姿であり、実績を示すものではありません。", 480, 420, 420, 16, { size: 10, color: C.white, ls: 1 });
}

// ===== 3 課題 =====
divider(3, "課題", "AIによるデータ利用に、取引の経路が足りない", "3 課題");

// 14 課題（p.10型：灰色パネル → 折れ矢印 → 強調枠）
{
  const s = page("3 課題", 3, "データ利用に足りない、3つの経路");
  rect(s, L, 82, CW, 120, { fill: C.panel });
  T(s, "現状\n（当社仮説）", L, 82, 170, 120, { size: 18, bold: true, align: "center", valign: "middle", ls: 1.35 });
  line(s, L + 170, 98, L + 170, 186, { color: C.sub, w: 1 });
  [["合意", "利用条件と価格を、事前に決める標準的な手段が少ない"], ["記録", "いつ・どのデータが取得されたかを、双方で確かめにくい"], ["対価", "請求・入金・分配を、通して扱う事務の型がない"]].forEach(([k, v], i) => {
    T(s, k, L + 196, 98 + i * 32, 48, 26, { size: 14.5, bold: true, color: C.key, valign: "middle", ls: 1 });
    T(s, v, L + 248, 98 + i * 32, CW - 270, 26, { size: 14.5, valign: "middle", ls: 1 });
  });
  line(s, L + 20, 206, L + 20, 252, { color: C.light, w: 3 });
  line(s, L + 20, 252, L + 58, 252, { color: C.light, w: 3, arrow: true });
  rect(s, L + 66, 216, CW - 66, 74, { fill: C.white, lc: C.key, lw: 2.5, r: 6 });
  T(s, "Adctorは、合意・記録・対価をひとつの経路でつなぎ、\n提供者と利用者が同じ記録の上で取引できる状態をつくる", L + 88, 216, CW - 110, 74, { size: 17.5, bold: true, valign: "middle", ls: 1.45 });
  bullets(s, ["合意：利用条件と価格を、合意書として両者に残す", "記録：取得の日時・データ・取得者を、同じ台帳に記録する", "対価：記録から請求し、入金を照合して提供者へ分配する"], L + 66, 316, CW - 66, { gap: 34, size: 14.5 });
  foot(s, "上段は当社の課題仮説、下段はAdctorの検討案。");
}

// 15 提供者の選択肢（p.58型：十字のポジショニング）
{
  const s = page("3 課題", 3, "提供者の選択肢と、Adctorの位置づけ");
  bullets(s, ["「対価」と「記録の共有」の2軸で整理すると、両方を満たす選択肢はまだ一般的ではない"], L, 78, CW);
  const cx = 500, cy = 300;
  line(s, 230, cy, 770, cy, { color: C.sub, w: 1 });
  line(s, cx, 132, cx, 468, { color: C.sub, w: 1 });
  glowCap(s, "対価あり", cx, 124, 120, { size: 13 });
  glowCap(s, "対価なし", cx, 474, 120, { size: 13 });
  glowCap(s, "記録が残らない", 190, cy, 150, { size: 13 });
  glowCap(s, "記録を共有", 810, cy, 130, { size: 13 });
  // Adctor の領域（右上）
  shape(s, "OVAL", 560, 168, 250, 96, { fill: C.tint, lc: C.key, lw: 1.5 });
  T(s, "条件つき提供", 560, 186, 250, 26, { size: 18, bold: true, color: C.key, align: "center", ls: 1 });
  T(s, "Adctorの案｜対価あり・記録を共有", 560, 216, 250, 20, { size: 11.5, color: C.deep, align: "center", ls: 1 });
  // 他の選択肢
  T(s, "個別契約", 330, 190, 150, 24, { size: 16, bold: true, color: C.mid, align: "center", ls: 1 });
  T(s, "対価はあるが、記録は\n契約ごとにばらばら", 330, 218, 150, 36, { size: 11.5, color: C.sub, align: "center", ls: 1.3 });
  T(s, "遮断　／　黙認", 300, 360, 180, 24, { size: 16, bold: true, color: C.sub, align: "center", ls: 1 });
  T(s, "取得を断る、またはそのまま許す。\n対価も記録も残らない", 280, 388, 220, 36, { size: 11.5, color: C.sub, align: "center", ls: 1.3 });
  T(s, "該当なし", 600, 370, 150, 20, { size: 12, color: C.light, align: "center", ls: 1 });
  foot(s, "当社による定性的な配置（数値にもとづく位置ではない）。「条件つき提供」はAdctorが目指す検討案で、稼働中のサービスではない。");
}

// ===== 4 仕組み =====
divider(4, "仕組み", "提供者と利用者の間で、許諾・記録・請求を担う", "4 仕組み");

// 17 ビジネスモデル（p.51型：循環図）
{
  const s = page("4 仕組み", 4, "Adctorのビジネスモデル");
  bullets(s, ["データは提供企業から買い手へ、対価は買い手から提供企業へ。Adctorはその間の合意・記録・請求を引き受ける"], L, 78, CW, { size: 13.5 });
  rect(s, 150, 122, 660, 236, { fill: C.tint, r: 70 });
  rect(s, 330, 108, 300, 30, { fill: C.key, r: 15 });
  T(s, "Adctor（Trillion Bank が運営・計画）", 330, 108, 300, 30, { size: 13.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  // 両端の補足
  rect(s, 110, 150, 190, 58, { fill: C.white, lc: C.rule, r: 8, shadow: true });
  T(s, "利用条件と価格を示す\nデータを提供・分配を受ける", 110, 150, 190, 58, { size: 11.5, bold: true, align: "center", valign: "middle", ls: 1.4 });
  rect(s, 660, 150, 190, 58, { fill: C.white, lc: C.rule, r: 8, shadow: true });
  T(s, "利用条件に合意する\nファイルを取得し支払う", 660, 150, 190, 58, { size: 11.5, bold: true, align: "center", valign: "middle", ls: 1.4 });
  // 2つの主体
  rect(s, 190, 236, 210, 50, { fill: C.mid, r: 25 });
  T(s, "提供企業", 190, 236, 210, 50, { size: 20, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  rect(s, 560, 236, 210, 50, { fill: C.deep, r: 25 });
  T(s, "買い手企業", 560, 236, 210, 50, { size: 20, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  shape(s, "CURVED_DOWN_ARROW", 412, 214, 136, 34, { fill: C.ink });
  shape(s, "CURVED_UP_ARROW", 412, 276, 136, 34, { fill: C.key, flipH: true });
  T(s, "① データ・条件 ② ファイル", 380, 194, 200, 18, { size: 11, bold: true, align: "center", ls: 1 });
  T(s, "③ 支払 ④ 分配", 560, 296, 120, 18, { size: 11, bold: true, color: C.key, align: "left", ls: 1 });
  rect(s, 300, 330, 360, 24, { fill: C.white, lc: C.key, lw: 1, r: 12 });
  T(s, "利用台帳：取得記録・請求用CSV・照合結果", 300, 330, 360, 24, { size: 12, bold: true, color: C.key, align: "center", valign: "middle", ls: 1 });
  // 収益へ
  shape(s, "DOWN_ARROW", 462, 362, 36, 20, { fill: C.light });
  rect(s, 360, 386, 240, 22, { fill: C.sub, r: 11 });
  T(s, "Adctorの収益（検討案）", 360, 386, 240, 22, { size: 12.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  rect(s, 150, 414, 660, 56, { fill: C.band, r: 28 });
  [["取引額に対する手数料"], ["料率は未定・未承認"], ["PoCは振込・手動照合"]].forEach(([t], i) => {
    rect(s, 172 + i * 210, 426, 196, 32, { fill: C.white, r: 16 });
    T(s, t, 172 + i * 210, 426, 196, 32, { size: 12.5, bold: true, align: "center", valign: "middle", ls: 1 });
  });
  foot(s, "初回PoCを前提とした検討案。運営主体・料率・契約形態は未確定。自動課金・自動分配は稼働していない。");
}

// 18 取引フロー（p.7/39型：青ラベル列の表）
{
  const s = page("4 仕組み", 4, "取引の6つの段階");
  bullets(s, ["初回PoCの計画（未実施）。データと記録は提供者から利用者へ、対価は利用者から提供者へ流れる"], L, 78, CW, { size: 13.5 });
  const cols = [["段階", 160], ["内容", 330], ["出力", 170], ["流れ", CW - 660]], y0 = 112, rh = 44;
  let x = L;
  cols.forEach(([h, w]) => { rect(s, x, y0, w, 30, { fill: C.band, lc: C.white, lw: 1 }); T(s, h, x, y0, w, 30, { size: 13, bold: true, align: "center", valign: "middle", ls: 1 }); x += w; });
  const rows = [["STEP1　合意", "利用条件と価格を決める", "合意書", "データ"], ["STEP2　取得", "買い手がファイルを取得する", "取得の発生", "データ"], ["STEP3　記録", "日時・データ・取得者を残す", "取得記録", "データ"], ["STEP4　CSV", "記録を月次で集計する", "請求用CSV", "データ"], ["STEP5　請求・照合", "CSVと合意条件で請求し、入金額と手動で照合する", "請求書・照合結果", "お金（手動）"], ["STEP6　入金・分配", "銀行振込で入金を受け、手数料を除いて分配する", "分配明細", "お金（手動）"]];
  rows.forEach((r, i) => {
    const y = y0 + 30 + i * rh, money = i >= 4;
    let x = L;
    rect(s, x, y, cols[0][1], rh, { fill: money ? C.key : C.mid, lc: C.white, lw: 1 });
    T(s, r[0], x, y, cols[0][1], rh, { size: 13, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    x += cols[0][1];
    [1, 2].forEach((c) => { rect(s, x, y, cols[c][1], rh, { fill: C.white, lc: C.rule }); T(s, r[c], x + 12, y, cols[c][1] - 24, rh, { size: 13, align: c === 2 ? "center" : "left", valign: "middle", ls: 1.25 }); x += cols[c][1]; });
    rect(s, x, y, cols[3][1], rh, { fill: C.white, lc: C.rule });
    gpill(s, r[3], x + 16, y + 10, cols[3][1] - 32, { h: 24, size: 12, fill: money ? C.key : C.ink, color: C.white });
  });
  rect(s, L, 418, CW, 40, { fill: C.tint, r: 6 });
  T(s, "PoCで確かめる成果：合意どおりに請求できたか ／ 請求と入金が一致したか ／ 分配額を提供企業が確認できたか", L + 16, 418, CW - 32, 40, { size: 13, bold: true, color: C.deep, valign: "middle", ls: 1 });
  foot(s, "自動課金・自動分配は対象外。");
}

// 19 取得・引用・学習（p.7型の表）
{
  const s = page("4 仕組み", 4, "取得と、引用・学習は別のもの");
  bullets(s, ["初回PoCで記録・請求の対象とするのはファイル取得のみ。引用の検出や学習の把握は行わない"], L, 78, CW, { size: 13.5 });
  const lw = 170, cw = (CW - lw) / 3, y0 = 116, rh = 80;
  rect(s, L, y0, lw, 50, { fill: C.white, lc: C.rule });
  [["ファイル取得", "PoCの対象"], ["AI回答への引用", "対象外（将来検討）"], ["モデル学習", "対象外"]].forEach(([h, st], i) => {
    const x = L + lw + i * cw;
    rect(s, x, y0, cw, 50, { fill: C.band, lc: C.white, lw: 1 });
    T(s, h, x, y0 + 6, cw, 22, { size: 15, bold: true, align: "center", ls: 1 });
    T(s, st, x, y0 + 30, cw, 16, { size: 11, bold: true, color: i ? C.sub : C.key, align: "center", ls: 1 });
  });
  const rows = [["何が起きるか", ["買い手がファイルを\n取得する", "AIの回答に\nデータの内容が使われる", "データがモデルの\n学習に使われる"]], ["Adctorで\n確かめられること", ["日時・データ・\n取得者を記録できる", "確かめられない\n（検出機能はない）", "確かめられない"]], ["初回PoCでの扱い", ["記録・集計・請求の対象", "扱わない", "扱わない（利用範囲は\n契約で定める案）"]]];
  rows.forEach(([k, cells], r) => {
    const y = y0 + 50 + r * rh;
    rect(s, L, y, lw, rh, { fill: C.key, lc: C.white, lw: 1 });
    T(s, k, L, y, lw, rh, { size: 13.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1.3 });
    cells.forEach((c, i) => {
      const x = L + lw + i * cw;
      rect(s, x, y, cw, rh, { fill: i ? C.white : C.tint, lc: C.rule });
      T(s, c, x + 14, y, cw - 28, rh, { size: 14, bold: !i && r === 2, color: i ? C.sub : C.ink, align: "center", valign: "middle", ls: 1.4 });
    });
  });
  foot(s, "学習の扱い（契約で利用範囲を定める案）は法務確認が必要。");
}

// 20 利用台帳（p.25型：灰色帯＋発光カプセル＋画面）
{
  const s = page("4 仕組み", 4, "取得記録を、双方が同じ台帳で確かめる");
  const lx = L, lw = 360;
  band(s, "台帳でできること", lx, 84, lw, 32, { size: 15 });
  bullets(s, ["取得を1行ずつ記録し、双方が同じ行を見る", "各行に合意IDを持たせ、条件と価格に対応させる", "月次の利用集計と請求の元データをCSVで書き出す"], lx, 130, lw, { gap: 44, size: 13.5 });
  glowCap(s, "日時・取得者・データ・合意IDを\n1行ずつ残し、CSVで書き出す", lx + lw / 2, 318, 330, { size: 14 });
  T(s, "画面案（表示値はダミー）", lx, 372, lw, 18, { size: 12, color: C.sub, align: "center", ls: 1 });
  // 画面案（暗色）
  const sx = 490, sy = 84, sw = R - sx, sh = 380;
  rect(s, sx, sy, sw, sh, { fill: C.ui, r: 10 });
  T(s, "Adctor  利用台帳", sx + 18, sy + 14, 200, 18, { size: 11.5, bold: true, color: C.white, ls: 1 });
  rect(s, sx + sw - 76, sy + 12, 60, 20, { fill: C.key, r: 10 });
  T(s, "画面案", sx + sw - 76, sy + 12, 60, 20, { size: 10, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  [["対象期間", "YYYY年MM月"], ["取得件数", "000 件"], ["請求予定額", "000,000 円"]].forEach(([k, v], i) => {
    const x = sx + 16 + i * 130;
    rect(s, x, sy + 46, 120, 54, { fill: C.ui2, r: 4 });
    T(s, k, x + 10, sy + 52, 100, 14, { size: 9.5, color: "B7C0CF", ls: 1 });
    T(s, v, x + 10, sy + 72, 104, 20, { font: ENS, size: 13, color: C.white, ls: 1 });
  });
  const cols = [["取得日時", 84], ["取得者", 56], ["データID", 70], ["ファイル", 88], ["合意ID", 60]];
  let cx = sx + 18; const ty = sy + 118;
  cols.forEach(([h, w]) => { T(s, h, cx, ty, w, 14, { size: 9.5, color: "B7C0CF", ls: 1 }); cx += w; });
  for (let r = 0; r < 7; r++) {
    const y = ty + 24 + r * 27;
    if (r === 0) rect(s, sx + 12, y - 6, sw - 24, 25, { fill: C.deep, r: 3 });
    const vals = [`MM-DD 1${r}:00`, "買い手A", "DATA-001", `file_00${r + 1}.csv`, "AGR-001"];
    cx = sx + 18;
    cols.forEach(([, w], c) => { T(s, vals[c], cx, y, w, 14, { font: EN, size: 9.5, color: C.white, ls: 1 }); cx += w; });
  }
  rect(s, sx + sw - 130, sy + sh - 40, 112, 26, { fill: C.key, r: 4 });
  T(s, "CSVを書き出す", sx + sw - 130, sy + sh - 40, 112, 26, { size: 10.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  foot(s, "自作のワイヤーフレーム（画面案）。実在の画面ではなく、表示値はすべてダミー。");
}

// 21 収益モデル（p.54型：入れ子の面＋大きな矢印）
{
  const s = page("4 仕組み", 4, "収益モデル（案）");
  bullets(s, ["収益は、取引額に対する手数料とする案。料率・単価は未承認のため数値は置かない"], L, 78, CW);
  rect(s, L, 112, 540, 350, { fill: C.panel, lc: C.light, lw: 1 });
  rect(s, L + 18, 130, 504, 314, { fill: C.white, lc: C.sub, lw: 1, dash: "dash" });
  T(s, "取引額（GMV）＝ 合意条件にもとづく請求額の合計", L + 34, 140, 470, 22, { size: 14, bold: true, ls: 1 });
  rect(s, L + 34, 214, 370, 214, { fill: C.tint2, lc: C.mid, lw: 1, dash: "dash" });
  T(s, "入金 ＝ 実際の振込（請求額と一致するとは限らない）", L + 48, 224, 350, 20, { size: 12.5, bold: true, ls: 1 });
  T(s, "提供企業への分配", L + 48, 270, 200, 24, { size: 16, bold: true, color: C.mid, ls: 1 });
  rect(s, L + 34, 334, 190, 94, { fill: C.key });
  T(s, "手数料\n＝プラットフォーム売上", L + 34, 334, 190, 94, { size: 14, bold: true, color: C.white, align: "center", valign: "middle", ls: 1.4 });
  img(s, A6("arrow_big.png"), L + 232, 340, 280, 96);
  // 右：結論
  const rx = L + 570;
  T(s, "Adctorの売上は", rx, 138, R - rx, 24, { size: 17, bold: true, ls: 1 });
  T(s, "手数料部分のみ", rx, 168, R - rx, 44, { size: 30, bold: true, color: C.key, ls: 1 });
  rect(s, rx, 222, 150, 26, { fill: C.white, lc: C.key, lw: 1.5, r: 13 });
  T(s, "料率は未定", rx, 222, 150, 26, { size: 13, bold: true, color: C.key, align: "center", valign: "middle", ls: 1 });
  bullets(s, ["取引額：Adctorの売上ではない", "入金：買い手からの実際の振込", "分配：入金から手数料を除いた額", "利益：売上－費用（試算しない）"], rx, 274, R - rx, { gap: 40, size: 13 });
  foot(s, "検討案。面の大きさ・比率は模式的なもので、実際の金額や料率を表さない。料率・単価は承認後に「試算」として別途示す。");
}

// ===== 5 実証 =====
divider(5, "実証", "1対1対1の初回PoCで、請求から分配までを確かめる", "5 実証");

// 23 初回PoC（p.6型：KPIサマリー）
{
  const s = page("5 実証", 5, "初回PoCの構成（計画）");
  bullets(s, ["すべて計画（2026年11月時点）。買い手・提供企業・データ・契約・入金はいずれも未確定"], L, 78, CW);
  const w = (CW - 2 * 14) / 3, y = 114, h = 286;
  [["参加企業", [["買い手", "1", "社"], ["提供企業", "1", "社"]]], ["対象", [["データ", "1", "種類"], ["記録", "ファイル取得記録・CSV", ""]]], ["方法", [["決済", "銀行振込", ""], ["照合", "手動", ""]]]].forEach(([hd, items], i) => {
    const x = L + i * (w + 14);
    rect(s, x, y, w, h, { fill: C.white, lc: C.rule });
    band(s, hd, x, y, w, 40, { size: 17 });
    items.forEach(([lab, v, u], j) => {
      const yy = y + 62 + j * 112;
      gpill(s, lab, x + 50, yy, w - 100);
      if (u) bigNum(s, v, u, x, yy + 30, w, 60, { size: 48, usize: 18 });
      else T(s, v, x, yy + 30, w, 60, { size: v.length > 6 ? 17 : 26, bold: true, color: C.key, align: "center", valign: "middle", ls: 1 });
    });
  });
  const steps = ["条件と価格の合意", "請求", "実際の入金", "提供企業への分配"], sw = CW / 4;
  steps.forEach((t, i) => {
    shape(s, i ? "CHEVRON" : "PENTAGON", L + i * sw, 416, sw + 10, 34, { fill: i % 2 ? C.pale : C.tint });
    T(s, t, L + i * sw + 16, 416, sw - 20, 34, { size: 13, bold: true, color: C.deep, align: "center", valign: "middle", ls: 1 });
  });
  foot(s, "下段は検証する流れ。自動課金・自動分配は対象外。");
}

// 24 次の判断（p.26型：青ラベル列＋■箇条書き）
{
  const s = page("5 実証", 5, "PoCの結果をもとに判断すること");
  const rows = [
    ["01", "PoC開始前", "参加企業と条件の確定", ["買い手・提供企業・データを決め、利用条件と価格を合意する", "各段階で「何をもって可とするか」を文書で合意する"]],
    ["02", "PoC中", "請求から分配までの実務", ["請求額・入金額・分配額が一致したかを確かめる", "照合にかかった作業を記録する"]],
    ["03", "PoC後", "次の段階に進むか", ["手数料率の承認、対象の拡大、自動化の要否を判断する"]],
  ];
  const y0 = 86, rh = 112, lw = 130;
  rect(s, L, y0, CW, rh * 3, { fill: C.white, lc: C.rule, lw: 1.5 });
  rows.forEach(([n, when, head, items], i) => {
    const y = y0 + i * rh;
    rect(s, L + 6, y + 6, lw, rh - 12, { fill: i < 2 ? C.key : C.mid });
    T(s, n, L + 6, y + 22, lw, 24, { font: ENS, size: 20, color: C.white, align: "center", ls: 1 });
    T(s, when, L + 6, y + 52, lw, 22, { size: 14, bold: true, color: C.white, align: "center", ls: 1 });
    T(s, head, L + lw + 30, y + 16, 400, 24, { size: 16, bold: true, color: C.key, ls: 1 });
    items.forEach((t, j) => {
      rect(s, L + lw + 32, y + 54 + j * 26, 7, 7, { fill: C.key });
      T(s, t, L + lw + 48, y + 46 + j * 26, CW - lw - 70, 22, { size: 14, ls: 1 });
    });
    if (i < 2) line(s, L + lw + 20, y + rh, R - 10, y + rh, { color: C.rule });
  });
  rect(s, L, 444, CW, 34, { fill: C.tint, r: 17 });
  T(s, "判断の基準は、PoC開始前に参加企業と文書で合意する", L, 444, CW, 34, { size: 14, bold: true, color: C.deep, align: "center", valign: "middle", ls: 1 });
  foot(s, "判断の時期・判断者は未定。各段階の基準は検討案。");
}

// ===== 6 補足 =====
divider(6, "補足", "比較・計算式・根拠の区分", "6 補足");

// 26 補足A（p.39型：灰色見出しの表）
{
  const s = page("6 補足", 6, "現行と将来案の比較");
  bullets(s, ["将来案はいずれも、許諾・法務・接続条件の確認を前提とする検討段階。連携・購入・出資の事実はない"], L, 78, CW, { size: 13.5 });
  const lw = 150, cw = (CW - lw) / 2, y0 = 114, rh = 46;
  [["項目", lw, 0], ["初回PoC（計画）", cw, lw], ["将来案（条件付き）", cw, lw + cw]].forEach(([h, w, dx]) => { rect(s, L + dx, y0, w, 32, { fill: C.band, lc: C.white, lw: 1 }); T(s, h, L + dx, y0, w, 32, { size: 14, bold: true, align: "center", valign: "middle", ls: 1 }); });
  const rows = [["対象データ", "1種類", "複数種類"], ["記録の範囲", "ファイル取得記録", "引用の検出"], ["請求", "CSVから作成", "自動請求"], ["決済", "銀行振込", "x402、円建てステーブルコイン等"], ["照合・分配", "手動", "自動化"], ["課金の単位", "取得（ファイル）", "引用課金"]];
  rows.forEach(([k, a, b], i) => {
    const y = y0 + 32 + i * rh;
    rect(s, L, y, lw, rh, { fill: C.key, lc: C.white, lw: 1 });
    T(s, k, L, y, lw, rh, { size: 13.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    rect(s, L + lw, y, cw, rh, { fill: C.white, lc: C.rule }); T(s, a, L + lw, y, cw, rh, { size: 14, align: "center", valign: "middle", ls: 1 });
    rect(s, L + lw + cw, y, cw, rh, { fill: C.tint2, lc: C.rule }); T(s, b, L + lw + cw, y, cw, rh, { size: 14, color: C.sub, align: "center", valign: "middle", ls: 1 });
  });
  bullets(s, ["取引先・接続先の名称やロゴは、承認を得るまで掲載しない"], L, 432, CW, { size: 13 });
}

// 27 補足B（p.10型：灰色パネル → 折れ矢印 → 強調枠）
{
  const s = page("6 補足", 6, "料金計算の定義");
  rect(s, L, 84, CW, 176, { fill: C.panel });
  T(s, "定義\n（検討案）", L, 84, 170, 176, { size: 18, bold: true, align: "center", valign: "middle", ls: 1.35 });
  line(s, L + 170, 100, L + 170, 244, { color: C.sub, w: 1 });
  [["請求額", "＝ Σ（取得件数 × 合意単価）", "定額契約の場合は、合意額をそのまま請求額とする"], ["手数料", "＝ 入金額 × 手数料率", "手数料＝プラットフォーム売上。率は未定"], ["分配額", "＝ 入金額 － 手数料", "未入金分は分配しない（案）"]].forEach(([k, f, n], i) => {
    const y = 100 + i * 50;
    T(s, k, L + 196, y, 80, 24, { size: 16, bold: true, color: C.key, ls: 1 });
    T(s, f, L + 282, y, 330, 24, { size: 17, bold: true, ls: 1 });
    T(s, n, L + 282, y + 26, 450, 16, { size: 11.5, color: C.sub, ls: 1 });
  });
  line(s, L + 20, 264, L + 20, 312, { color: C.light, w: 3 });
  line(s, L + 20, 312, L + 58, 312, { color: C.light, w: 3, arrow: true });
  rect(s, L + 66, 278, CW - 66, 70, { fill: C.white, lc: C.key, lw: 2.5, r: 6 });
  T(s, "値は、参加企業との合意と社内承認を経て決める", L + 88, 278, CW - 110, 70, { size: 18, bold: true, valign: "middle", ls: 1 });
  bullets(s, ["単価、または定額", "締め単位（月次を想定）", "入金期日と振込手数料の負担", "端数処理", "手数料率（要承認）"], L + 66, 366, 380, { gap: 22, size: 13 });
  foot(s, "単価・手数料率・締め日・端数処理は未承認のため、値を置いていない。");
}

// 28 補足C（p.5型：灰色の見出し帯の2列）
{
  const s = page("6 補足", 6, "根拠の区分と未掲載事項");
  const w = (CW - 16) / 2, y0 = 88;
  const col = (x, head, rows) => {
    rect(s, x, y0, w, 360, { fill: C.white, lc: C.rule });
    band(s, head, x, y0, w, 34, { size: 15 });
    rows.forEach(([k, d, where], i) => {
      const y = y0 + 52 + i * 74;
      dot(s, x + 18, y + 6, C.key);
      T(s, k, x + 34, y, 170, 22, { size: 15, bold: true, ls: 1 });
      if (where) T(s, where, x + w - 120, y, 100, 22, { size: 12, color: C.key, bold: true, align: "right", ls: 1 });
      T(s, d, x + 34, y + 26, w - 54, 36, { size: 12.5, color: C.sub, ls: 1.4 });
    });
  };
  col(L, "本資料の根拠の区分", [["実績", "会社情報・AirReachの提供内容と導入事例（当社資料）", "p.5〜9"], ["外部公表", "第三者の一次公表", "p.11"], ["検討案", "Adctorの計画・案・仮説", "p.7, 11〜27"], ["試算", "承認済みの仮定による計算", "掲載なし"]]);
  col(L + w + 16, "載せていないもの", [["市場規模", "分母・対象・算式・出典を検証できていない"], ["手数料率・単価", "承認済みの仮定がない"], ["LPの数値", "Adctorサイトの統計値・価格。出典と承認が未確認"], ["旧資料の数値", "原本（29ページ）が未入手"]]);
  foot(s, "数値は、検証または承認が済んだものから順に追加する。詳細は「未反映項目」に記録。");
}

// 29 結び（表紙のトーン）
{
  const s = pres.addSlide({ masterName: "BARE", sectionTitle: "6 補足" });
  s.addImage({ path: A4("bg_closing.jpg"), x: 0, y: 0, w: P(420), h: P(540), sizing: { type: "cover", w: P(420), h: P(540) } });
  img(s, A5("tb_logo_black.png"), R + 48 - 122, 25, 122, 122 / 11.08);
  T(s, "AIから発信者に、\n還元をするインフラをつくる。", 480, 220, 440, 100, { size: 28, bold: true, ls: 1.6 });
  T(s, "Adctor", 480, 340, 300, 26, { font: EN, bold: true, size: 20, color: C.key, ls: 1 });
  T(s, "©Trillion Bank", R - 152, 512, 200, 14, { font: EN, size: 9, align: "right", ls: 1 });
}

pres.writeFile({ fileName: OUT }).then(async (f) => {
  try {
    const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
    await applyTheme(f, { name: "Adctor TB v6", headFontFace: JP, bodyFontFace: JP, colors: { dk1: "111318", lt1: "FFFFFF", dk2: "667085", lt2: "EAF1FF", accent1: "1762E8", accent2: "4C86EE", accent3: "0E46B8", accent4: "8DB3F4", accent5: "DDE2EA", accent6: "C5D8FA", hlink: "1762E8", folHlink: "667085" } });
  } catch (e) { console.warn("theme not applied:", e.message); }
  console.log("wrote", f);
});
