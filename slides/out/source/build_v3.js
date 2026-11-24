// Adctor 事業説明資料 v3 — LayerX Company Deck の意匠を参照した版
// 使い方: cd out/source && python3 make_bg_v3.py && node build_v3.js
// 参照したのは配色・余白・ページ構成の型のみ。参照資料のロゴ・3Dオブジェクト・写真・社名・数値は使わない。
// 座標は pt（960 × 540）で書き、P() でインチに換算する。
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.resolve(__dirname, "..", "Adctor_LayerX_style_v3.pptx");
const BG = (n) => path.join(__dirname, "assets_v3", n);

// ---------- tokens ----------
const C = {
  white: "FFFFFF", ink: "0A2133", violet: "524DFF", sub: "5B6A76", mute: "8C969F",
  rule: "D6DADD", card: "F6F7F8", lav: "F1EEFD", lav2: "F7F5FE", deep: "004295", dark: "1B2130",
};
const JP = "Noto Sans JP", JPM = "Noto Sans JP Medium";
const EN = "Inter", ENM = "Inter Medium", ENS = "Inter SemiBold";
const P = (v) => v / 72;
const L = 72, R = 888, CW = R - L;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Trillion Bank";
pres.company = "Trillion Bank";
pres.title = "Adctor 事業説明資料 v3";
pres.theme = { headFontFace: JP, bodyFontFace: JP };

// ---------- primitives ----------
function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, {
    x: P(x), y: P(y), w: P(w), h: P(h),
    fontFace: o.font || JP, fontSize: o.size || 15, color: o.color || C.ink,
    bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "top",
    margin: 0, isTextBox: true, lang: "ja-JP", fit: "none",
    lineSpacingMultiple: o.ls || 1.45, charSpacing: o.cs, objectName: o.name,
  });
}
function line(s, x1, y1, x2, y2, o = {}) {
  s.addShape(pres.shapes.LINE, {
    x: P(Math.min(x1, x2)), y: P(Math.min(y1, y2)), w: P(Math.abs(x2 - x1)), h: P(Math.abs(y2 - y1)),
    flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.color || C.rule, width: o.w || 0.75, dashType: o.dash || "solid", endArrowType: o.arrow ? "triangle" : undefined },
  });
}
function rect(s, x, y, w, h, o = {}) {
  const r = o.r === undefined ? 4 : o.r;
  s.addShape(r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
    x: P(x), y: P(y), w: P(w), h: P(h), rectRadius: r ? P(r) : undefined,
    fill: o.fill ? { color: o.fill } : { type: "none" },
    line: o.lc ? { color: o.lc, width: o.lw || 0.75, dashType: o.dash || "solid" } : { type: "none" },
  });
}
function pill(s, text, x, y, w, o = {}) {
  const h = o.h || 22;
  rect(s, x, y, w, h, { fill: o.fill || C.violet, lc: o.lc, r: h / 2 });
  T(s, text, x, y, w, h, { size: o.size || 12, bold: true, color: o.color || C.white, align: "center", valign: "middle", ls: 1 });
}
function tri(s, x, y, size, dir, color) { // 塗りの三角（▶ ◀ ▼）
  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, {
    x: P(x), y: P(y), w: P(size), h: P(size), rotate: dir === "right" ? 90 : dir === "left" ? 270 : 180,
    fill: { color: color || C.violet }, line: { type: "none" },
  });
}
function circle(s, cx, cy, r, fill) {
  s.addShape(pres.shapes.OVAL, { x: P(cx - r), y: P(cy - r), w: P(2 * r), h: P(2 * r), fill: { color: fill }, line: { type: "none" } });
}

// ---------- layouts ----------
function frame(light) {
  const col = light ? C.ink : C.white;
  return [
    // 公式ロゴ未受領のため文字のワードマークで仮置き
    { text: { text: "Trillion Bank", options: { x: P(30), y: P(20), w: P(200), h: P(22), fontFace: ENS, fontSize: 14, color: col, margin: 0, valign: "middle" } } },
    { text: { text: "©Trillion Bank", options: { x: P(R - 152), y: P(512), w: P(200), h: P(14), fontFace: EN, fontSize: 9, color: col, margin: 0, align: "right", valign: "middle" } } },
  ];
}
const num = (light) => ({ x: P(16), y: P(512), w: P(22), h: P(14), fontFace: EN, fontSize: 9, color: light ? C.ink : C.white, margin: 0, align: "right", valign: "middle" });
pres.defineSlideMaster({ title: "LX_WHITE", background: { color: C.white }, objects: frame(true), slideNumber: num(true) });
pres.defineSlideMaster({ title: "LX_DARK", background: { color: C.deep }, objects: frame(false), slideNumber: num(false) });
pres.defineSlideMaster({ title: "LX_BARE", background: { color: C.white }, objects: [] });

function slide(master, section, footer, bg) {
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  if (bg) s.background = { path: BG(bg) };
  if (footer) T(s, "|  " + footer, 42, 512, 400, 14, { size: 9, color: master === "LX_WHITE" ? C.ink : C.white, valign: "middle", ls: 1 });
  return s;
}
function title(s, text, o = {}) {
  T(s, text, L, o.y || 46, CW, o.h || 42, { size: o.size || 27, bold: true, color: o.color || C.violet, ls: 1.3 });
}
function lead(s, text, y, o = {}) { T(s, text, L, y || 92, CW, o.h || 44, { size: o.size || 14, color: o.color || C.ink, ls: 1.6 }); }
function note(s, text, o = {}) { T(s, text, L, 478, CW, 26, { size: 10, color: o.color || C.mute, ls: 1.3 }); }
function divider(n, jp, en, sub, section) {
  pres.addSection({ title: section });
  const s = slide("LX_DARK", section, "Chapter " + n, "bg_chapter.jpg");
  T(s, String(n), 700, 40, 200, 170, { font: ENS, size: 150, color: C.white, align: "right", ls: 1 });
  T(s, en, L, 318, 700, 30, { font: ENM, size: 20, color: C.white, ls: 1 });
  T(s, jp, L - 2, 350, 800, 86, { size: 62, bold: true, color: C.white, ls: 1.2 });
  T(s, sub, L, 440, 800, 26, { size: 16, color: C.white, ls: 1.3 });
  return s;
}

// =====================================================================
// 1 表紙
pres.addSection({ title: "導入" });
{
  const s = slide("LX_BARE", "導入", null, "bg_cover.jpg");
  const x = 400;
  T(s, "Trillion Bank", x, 112, 400, 28, { font: ENS, size: 20, color: C.white, ls: 1 });
  T(s, "Adctor", x - 4, 146, 540, 130, { font: EN, bold: true, size: 112, color: C.white, ls: 1 });
  T(s, "AIから発信者に、\n還元をするインフラをつくる", x, 290, 520, 96, { size: 30, bold: true, color: C.white, ls: 1.4 });
  T(s, "事業説明資料　初見の投資家・協業先向け", x, 408, 520, 22, { size: 14, color: C.white, ls: 1 });
  T(s, "November 24, 2026", x, 470, 300, 20, { font: ENM, size: 13, color: C.white, ls: 1 });
}

// 2 ステートメント（p.2型）
{
  const s = slide("LX_DARK", "導入", "Adctor = AIとデータの取引インフラ", "bg_statement.jpg");
  T(s, "Adctor = AIとデータの取引インフラ", L, 170, CW, 56, { size: 36, bold: true, color: C.white, align: "center", ls: 1.2 });
  T(s, "Adctorは、AIによるデータ利用に「許諾・記録・請求」の経路をつくる事業です。\nこの資料では、課題・仕組み・初回PoCの計画をお伝えします。", L, 252, CW, 60, { size: 15, color: C.white, align: "center", ls: 1.8 });
  T(s, "本資料には計画・検討案が含まれます。数値・社名は確認済みのもののみ掲載しています。", L, 420, CW, 20, { size: 11, color: C.white, align: "center", ls: 1 });
}

// 3 Contents
{
  const s = slide("LX_WHITE", "導入", "Contents");
  T(s, "Contents", 150, 248, 260, 40, { font: ENM, size: 26, ls: 1 });
  const items = [
    ["はじめに", "市場の変化とミッション"], ["課題", "合意・記録・対価の経路"], ["仕組み", "許諾・取得記録・請求をつなぐ"],
    ["実証", "1対1対1の初回PoC"], ["補足", "比較・計算式・根拠の区分"],
  ];
  items.forEach(([t, sub], i) => {
    const y = 74 + i * 80;
    T(s, String(i + 1), 455, y, 60, 56, { font: ENM, size: 46, ls: 1 });
    T(s, t, 528, y + 4, 340, 30, { size: 22, bold: true, color: C.violet, ls: 1.1 });
    T(s, sub, 528, y + 36, 340, 18, { size: 11.5, bold: true, ls: 1 });
  });
}

// 4 扉 1
divider(1, "はじめに", "Introduction", "AIとデータの取引に、いま起きていること", "1 はじめに");

// 5 市場の変化（p.17型のカード）
{
  const s = slide("LX_WHITE", "1 はじめに", "市場の変化");
  title(s, "AIとコンテンツの取引に、3つの変化が起きています。");
  lead(s, "現時点では変化の方向のみを示します。数値は、出典を検証できたものから順に掲載します。");
  const cards = [
    ["CHANGE 01", "回答の場が変わる", "生成AIの回答で情報を得る人が増え、元のページを訪れない閲覧が生まれている。", "観察（定量値は未掲載）", false],
    ["CHANGE 02", "提供側が条件を示す", "大手CDN事業者が、AIクローラーに許諾・課金の条件を示す機能を公表した。", "外部公表（2025年7月）", true],
    ["CHANGE 03", "取引の事務が未整備", "許諾から記録・請求・入金・分配までを通して扱う実務の型は、まだ少ない。", "仮説（PoCで検証）", false],
  ];
  const w = (CW - 32) / 3;
  cards.forEach(([en, h, b, ev, solid], i) => {
    const x = L + i * (w + 16), y = 156;
    rect(s, x, y, w, 300, { fill: C.white, lc: C.rule });
    rect(s, x + 1, y + 1, w - 2, 44, { fill: C.card, r: 3 });
    T(s, en, x, y + 1, w, 44, { font: ENS, size: 13, align: "center", valign: "middle", ls: 1, cs: 1 });
    T(s, h, x + 22, y + 70, w - 44, 30, { size: 20, bold: true, ls: 1.2 });
    T(s, b, x + 22, y + 112, w - 44, 110, { size: 14.5, ls: 1.7 });
    pill(s, ev, x + 22, y + 252, w - 44, solid ? {} : { fill: C.lav, color: C.violet });
  });
  note(s, "CHANGE 02 の出典：Cloudflare公式ブログ「Introducing pay per crawl」（2025年7月公表）。CHANGE 01・03 は当社の観察・仮説。");
}

// 6 ミッション（p.9型）
{
  const s = slide("LX_DARK", "1 はじめに", "Mission", "bg_mission.jpg");
  T(s, "Mission", 110, 184, 300, 26, { font: EN, size: 18, color: C.white, ls: 1 });
  T(s, "価値を生む人に、\n価値が還る社会を。", 110, 220, 380, 100, { size: 32, bold: true, color: C.white, ls: 1.5 });
  T(s, "AIが使うデータには、それを生んだ人がいる。\nその価値が、合意した条件で作り手に還る仕組みをつくる。\n\n利用者は、権利関係を説明できるデータを使える。\n提供者は、いつ誰に取得されたかを確かめ、対価を受け取れる。\nそんな取引を、当たり前のインフラにするために。",
    480, 180, 420, 210, { size: 14.5, color: C.white, ls: 1.95 });
  T(s, "目指す姿であり、実績を示すものではありません。", 480, 420, 420, 16, { size: 10, color: C.white, ls: 1 });
}

// 7 扉 2
divider(2, "課題", "Problem", "AIによるデータ利用に、取引の経路が足りない", "2 課題");

// 8 課題
{
  const s = slide("LX_WHITE", "2 課題", "3つの経路の欠落");
  title(s, "データ利用には、合意・記録・対価の経路が足りません。");
  lead(s, "提供者と利用者のあいだに、取引を成り立たせる3つの経路が整っていないと考えています（当社仮説）。");
  rect(s, L, 150, CW, 310, { fill: C.lav2 });
  const node = (x, t, sub) => {
    rect(s, x, 176, 150, 258, { fill: C.white, lc: C.rule });
    T(s, t, x, 270, 150, 30, { size: 21, bold: true, align: "center", ls: 1 });
    T(s, sub, x, 306, 150, 40, { size: 11.5, color: C.sub, align: "center", ls: 1.4 });
  };
  node(L + 24, "提供者", "発信者・\nデータ提供企業");
  node(R - 174, "利用者", "AI事業者・\nデータ利用企業");
  const x1 = L + 174, x2 = R - 174;
  const rows = [["01  合意", "利用条件と価格を、事前に決める標準的な手段が少ない"], ["02  記録", "いつ・どのデータが取得されたかを、双方で確かめにくい"], ["03  対価", "請求・入金・分配を、通して扱う事務の型がない"]];
  rows.forEach(([p, d], i) => {
    const y = 196 + i * 80;
    line(s, x1, y + 22, x2, y + 22, { color: C.violet, w: 1.25, dash: "dash" });
    pill(s, p, x1 + 24, y + 11, 92);
    T(s, d, x1 + 24, y + 42, x2 - x1 - 48, 22, { size: 14, ls: 1.2 });
  });
  note(s, "破線は「現状では経路が整っていない」ことを表す。当社による定性的な整理。");
}

// 9 選択肢（p.17型 4カード）
{
  const s = slide("LX_WHITE", "2 課題", "提供者の選択肢");
  title(s, "提供者の選択肢は、遮断か黙認かに偏っています。");
  lead(s, "対価と記録の両方を得られる選択肢は、まだ一般的ではありません。Adctorは4つ目の選択肢を目指します。");
  const cols = [
    ["遮断", ["取得を技術的に断る", "なし", "不要"]],
    ["黙認", ["取得をそのまま許す", "なし", "残らない"]],
    ["個別契約", ["1社ずつ個別に契約する", "あり（交渉が重い）", "契約ごとに個別管理"]],
    ["条件つき提供", ["条件と価格を示し、\n記録と請求を通す", "あり（合意条件で）", "取得記録とCSVで共有"]],
  ];
  const labels = ["方法", "対価", "記録"];
  const w = (CW - 48) / 4;
  cols.forEach(([h, cells], i) => {
    const x = L + i * (w + 16), y = 150, hot = i === 3;
    rect(s, x, y, w, 306, { fill: hot ? C.lav2 : C.white, lc: hot ? C.violet : C.rule, lw: hot ? 1.5 : 0.75 });
    rect(s, x + 1, y + 1, w - 2, 46, { fill: hot ? C.violet : C.card, r: 3 });
    T(s, h, x, y + 1, w, 46, { size: 16, bold: true, align: "center", valign: "middle", color: hot ? C.white : C.ink, ls: 1 });
    cells.forEach((c, j) => {
      const cy = y + 64 + j * 78;
      T(s, labels[j], x + 18, cy, w - 36, 16, { size: 11, color: C.mute, bold: true, ls: 1 });
      T(s, c, x + 18, cy + 20, w - 36, 48, { size: 14, ls: 1.45, bold: hot && j === 1, color: hot && j === 1 ? C.violet : C.ink });
      if (j < 2) line(s, x + 18, cy + 70, x + w - 18, cy + 70, { color: C.rule, w: 0.5 });
    });
  });
  T(s, "Adctorの案", L + 3 * (w + 16), 128, w, 18, { size: 11, bold: true, color: C.violet, align: "center", ls: 1 });
  note(s, "当社による定性比較。「条件つき提供」はAdctorが目指す検討案で、稼働中のサービスではない。");
}

// 10 扉 3
divider(3, "仕組み", "How it works", "提供者と利用者の間で、許諾・記録・請求を担う", "3 仕組み");

// 11 事業構造（p.30型）
{
  const s = slide("LX_WHITE", "3 仕組み", "事業構造");
  title(s, "Adctorは、提供者と利用者の間で\n許諾・取得記録・請求をつなぎます。", { h: 76, color: C.ink });
  lead(s, "データの取得と、対価の支払いを、同じ合意と同じ記録の上で扱えるようにします（初回PoCを前提とした検討案）。", 136);
  const side = (x, head, sub, items) => {
    rect(s, x, 186, 250, 270, { fill: C.lav2 });
    rect(s, x + 12, 198, 226, 50, { fill: C.white, r: 3 });
    T(s, head, x + 12, 200, 226, 26, { size: 16, bold: true, align: "center", ls: 1.2 });
    T(s, sub, x + 12, 226, 226, 18, { size: 11, color: C.sub, align: "center", ls: 1 });
    items.forEach((t, i) => {
      rect(s, x + 24, 280 + i * 54, 202, 36, { fill: "E3E1FC", r: 2 });
      T(s, t, x + 24, 280 + i * 54, 202, 36, { size: 13.5, bold: true, align: "center", valign: "middle", ls: 1 });
    });
  };
  side(L, "提供者", "データ提供企業", ["利用条件と価格を示す", "データを提供する", "分配を受け取る"]);
  side(R - 250, "利用者", "買い手企業", ["利用条件に合意する", "ファイルを取得する", "請求に応じて支払う"]);
  const cx = L + 250, cw = CW - 500;
  tri(s, cx + 12, 306, 18, "right");
  tri(s, cx + cw - 30, 306, 18, "left");
  T(s, "Adctor", cx, 246, cw, 50, { font: EN, bold: true, size: 38, color: C.violet, align: "center", ls: 1 });
  T(s, "取引の事務を引き受ける", cx, 298, cw, 20, { size: 12, color: C.sub, align: "center", ls: 1 });
  ["許諾", "取得記録", "請求"].forEach((t, i) => pill(s, t, cx + 60, 342 + i * 34, cw - 120, { h: 26, size: 13 }));
  note(s, "自動課金・自動分配は稼働していない。初回PoCでは請求・照合・分配を手動で行う計画。");
}

// 12 取引フロー（p.20型・濃紺）
{
  const s = slide("LX_DARK", "3 仕組み", "取引フロー", "bg_dark.jpg");
  title(s, "データは右へ、お金は左へ。6つの段階で流れます。", { color: C.white });
  T(s, "初回PoCの計画です（未実施）。データと記録は提供者から利用者へ、対価は利用者から提供者へ流れます。", L, 90, CW, 22, { size: 13.5, color: C.white, ls: 1.3 });
  T(s, "Adctor Transaction Flow", L, 126, CW, 26, { font: ENM, size: 19, color: C.white, align: "center", ls: 1 });
  const top = [["1", "合意", "条件と価格を決める", "出力：合意書"], ["2", "取得", "買い手が取得する", "出力：取得の発生"], ["3", "記録", "日時・取得者を残す", "出力：取得記録"], ["4", "CSV", "月次で集計する", "出力：請求用CSV"]];
  const g = 22, w = (CW - 3 * g) / 4;
  top.forEach(([n, h, d, o], i) => {
    const x = L + i * (w + g), y = 162;
    rect(s, x, y, w, 126, { fill: C.white, r: 5 });
    rect(s, x + 14, y + 14, 74, 18, { fill: C.violet, r: 2 });
    T(s, "STEP " + n, x + 14, y + 14, 74, 18, { font: ENS, size: 10.5, bold: false, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, h, x + 14, y + 40, w - 28, 26, { size: 18, bold: true, ls: 1.1 });
    T(s, d, x + 14, y + 70, w - 28, 22, { size: 12.5, ls: 1.3 });
    T(s, o, x + 14, y + 98, w - 28, 16, { size: 11, color: C.violet, bold: true, ls: 1 });
    if (i < 3) tri(s, x + w + 6, y + 56, 10, "right", C.white);
  });
  tri(s, L + 3 * (w + g) + w / 2 - 6, 296, 12, "down", C.white);
  const bw = 2 * w + g;
  [[L, "6", "入金・分配", "銀行振込で入金を受け、手数料を除いて提供企業へ分配する"], [L + 2 * (w + g), "5", "請求・照合", "CSVと合意条件で請求し、入金額と手動で照合する"]].forEach(([x, n, h, d]) => {
    const y = 316;
    rect(s, x, y, bw, 86, { fill: C.white, r: 5 });
    rect(s, x + 14, y + 14, 94, 18, { fill: C.violet, r: 2 });
    T(s, "STEP " + n, x + 14, y + 14, 94, 18, { font: ENS, size: 10.5, color: C.white, align: "center", valign: "middle", ls: 1 });
    pill(s, "手動", x + bw - 64, y + 12, 50, { h: 20, size: 10.5, fill: C.lav, color: C.violet });
    T(s, h, x + 14, y + 38, 200, 22, { size: 17, bold: true, ls: 1 });
    T(s, d, x + 14, y + 62, bw - 28, 18, { size: 12.5, ls: 1 });
  });
  tri(s, L + bw + 6, 351, 10, "left", C.white);
  line(s, L, 424, R, 424, { color: C.white, w: 0.5 });
  T(s, "PoCで確かめる成果", L, 436, 170, 20, { size: 13.5, bold: true, color: C.white, ls: 1 });
  T(s, "合意どおりに請求できたか ／ 請求と入金が一致したか ／ 分配額を提供企業が確認できたか", L + 170, 436, CW - 170, 20, { size: 13.5, color: C.white, ls: 1 });
  T(s, "自動課金・自動分配は対象外。", L, 470, CW, 16, { size: 10, color: C.white, ls: 1 });
}

// 13 取得・引用・学習（p.26型マトリクス）
{
  const s = slide("LX_WHITE", "3 仕組み", "取得・引用・学習");
  title(s, "取得と、引用・学習は別のものとして扱います。");
  lead(s, "初回PoCで記録・請求の対象とするのはファイル取得のみです。引用の検出や学習の把握は行いません。");
  const x0 = L, lw = 120, gw = 4, cw = (CW - lw - 3 * gw) / 3, y0 = 146;
  const heads = [["ファイル取得", "PoCの対象"], ["AI回答への引用", "対象外（将来検討）"], ["モデル学習", "対象外"]];
  const rows = [
    ["何が起きるか", ["買い手がファイルを\n取得する", "AIの回答に\nデータの内容が使われる", "データがモデルの\n学習に使われる"]],
    ["Adctorで\n確かめられること", ["日時・データ・\n取得者を記録できる", "確かめられない\n（検出機能はない）", "確かめられない"]],
    ["初回PoCでの扱い", ["記録・集計・請求の対象", "扱わない", "扱わない（利用範囲は\n契約で定める案）"]],
  ];
  heads.forEach(([h, st], i) => {
    const x = x0 + lw + gw + i * (cw + gw), hot = i === 0;
    rect(s, x, y0, cw, 66, { fill: hot ? C.violet : C.card, r: 2 });
    T(s, h, x, y0 + 10, cw, 26, { size: 17, bold: true, align: "center", color: hot ? C.white : C.ink, ls: 1 });
    T(s, st, x, y0 + 40, cw, 16, { size: 11, bold: true, align: "center", color: hot ? C.white : C.mute, ls: 1 });
  });
  rows.forEach(([lab, cells], r) => {
    const y = y0 + 66 + gw + r * (80 + gw);
    rect(s, x0, y, lw, 80, { fill: "7A73FF", r: 2 });
    T(s, lab, x0, y, lw, 80, { size: 13, bold: true, color: C.white, align: "center", valign: "middle", ls: 1.35 });
    cells.forEach((c, i) => {
      const x = x0 + lw + gw + i * (cw + gw), hot = i === 0;
      rect(s, x, y, cw, 80, { fill: hot ? C.lav : C.lav2, r: 2 });
      T(s, c, x + 16, y, cw - 32, 80, { size: 14, valign: "middle", color: hot ? C.ink : C.sub, bold: hot && r === 2, ls: 1.45 });
    });
  });
  note(s, "学習の扱い（契約で利用範囲を定める案）は法務確認が必要。");
}

// 14 利用台帳（p.13型：左に説明・右に暗色の画面）
{
  const s = slide("LX_WHITE", "3 仕組み", "利用台帳（画面案）");
  title(s, "取得記録を、双方が同じ台帳で確かめます。");
  lead(s, "提供者と利用者が同じ行を見て、合意条件と結びつけ、そのまま請求の元データにします。");
  const pts = [["1", "取得を1行ずつ記録", "日時・取得者・データを残し、\n双方が同じ行を見る。"], ["2", "合意と結びつける", "各行に合意IDを持たせ、\n条件と価格に対応させる。"], ["3", "CSVで書き出す", "月次の利用集計と\n請求の元データにする。"]];
  pts.forEach(([n, h, d], i) => {
    const y = 160 + i * 98;
    circle(s, L + 12, y + 12, 12, C.violet);
    T(s, n, L, y + 3, 24, 18, { font: ENS, size: 12, color: C.white, align: "center", ls: 1 });
    T(s, h, L + 36, y, 280, 24, { size: 17, bold: true, ls: 1.1 });
    T(s, d, L + 36, y + 30, 280, 50, { size: 13.5, ls: 1.55 });
  });
  // 画面案（暗色）
  const sx = 412, sy = 150, sw = R - sx, sh = 300;
  rect(s, sx, sy, sw, sh, { fill: C.dark, r: 6 });
  T(s, "Adctor  利用台帳", sx + 18, sy + 12, 200, 18, { size: 11, bold: true, color: C.white, ls: 1 });
  pill(s, "画面案", sx + sw - 74, sy + 10, 58, { h: 20, size: 10 });
  [["対象期間", "YYYY年MM月"], ["取得件数", "000 件"], ["請求予定額", "000,000 円"]].forEach(([k, v], i) => {
    const x = sx + 18 + i * 146;
    rect(s, x, sy + 42, 134, 50, { fill: "2A3142", r: 3 });
    T(s, k, x + 10, sy + 48, 120, 14, { size: 9.5, color: "AEB6C4", ls: 1 });
    T(s, v, x + 10, sy + 66, 120, 20, { font: ENS, size: 14, color: C.white, ls: 1 });
  });
  const cols = [["取得日時", 92], ["取得者", 64], ["データID", 76], ["ファイル", 96], ["合意ID", 70]];
  let cx = sx + 18; const ty = sy + 106;
  cols.forEach(([h, w]) => { T(s, h, cx, ty, w, 14, { size: 9.5, color: "AEB6C4", ls: 1 }); cx += w; });
  for (let r = 0; r < 5; r++) {
    const y = ty + 22 + r * 25;
    if (r === 0) rect(s, sx + 12, y - 5, sw - 24, 23, { fill: "3A3F8F", r: 2 });
    const vals = [`MM-DD 1${r}:00`, "買い手A", "DATA-001", `file_00${r + 1}.csv`, "AGR-001"];
    cx = sx + 18;
    cols.forEach(([, w], c) => { T(s, vals[c], cx, y, w, 14, { font: EN, size: 10, color: C.white, ls: 1 }); cx += w; });
  }
  rect(s, sx + sw - 128, sy + sh - 38, 110, 24, { fill: C.violet, r: 3 });
  T(s, "CSVを書き出す", sx + sw - 128, sy + sh - 38, 110, 24, { size: 10.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  note(s, "自作のワイヤーフレーム（画面案）。実在の画面ではなく、表示値はすべてダミー。");
}

// 15 収益モデル（p.27型）
{
  const s = slide("LX_WHITE", "3 仕組み", "収益モデル（案）");
  title(s, "収益は、取引額に対する手数料とする案です。");
  lead(s, "取引額・売上・入金・分配・利益を分けて扱います。手数料率・単価は未承認のため、ここでは数値を置きません。");
  rect(s, L, 148, CW, 156, { fill: C.lav2, r: 6 });
  T(s, "手数料モデル（案）", L + 24, 168, 280, 24, { size: 17, bold: true, color: C.violet, ls: 1 });
  pill(s, "料率は未定・未承認", L + 24, 202, 168, { h: 26, size: 12.5 });
  T(s, "取引額のうち、Adctorの手数料にあたる部分を\nプラットフォーム売上とします。", L + 24, 240, 300, 46, { size: 12.5, ls: 1.55 });
  const bx = L + 350, bw = R - 24 - bx, fw = 120, by = 196;
  T(s, "取引額（GMV）", bx, 168, 200, 18, { size: 12, bold: true, ls: 1 });
  T(s, "模式図：幅は比率を表さない", bx + bw - 200, 168, 200, 18, { size: 10, color: C.mute, align: "right", ls: 1 });
  rect(s, bx, by, bw - fw, 48, { fill: C.white, lc: C.violet, r: 2 });
  T(s, "提供企業への分配", bx + 16, by, 200, 48, { size: 14, bold: true, valign: "middle", ls: 1 });
  rect(s, bx + bw - fw, by, fw, 48, { fill: C.violet, r: 2 });
  T(s, "Adctor手数料", bx + bw - fw, by, fw, 48, { size: 12.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  line(s, bx + bw - fw, by + 56, bx + bw, by + 56, { color: C.violet, w: 1 });
  T(s, "＝ プラットフォーム売上", bx + bw - 240, by + 64, 240, 18, { size: 12, bold: true, color: C.violet, align: "right", ls: 1 });
  const defs = [["取引額（GMV）", "合意条件にもとづく請求額の合計。Adctorの売上ではない"], ["プラットフォーム売上", "取引額のうち、Adctorの手数料にあたる部分"], ["入金", "買い手から実際に振り込まれた額。請求額と一致するとは限らない"], ["分配", "入金から手数料を除き、提供企業へ支払う額"], ["利益", "売上から運営費用を差し引いた額。本資料では試算しない"]];
  const w = (CW - 4 * 10) / 5;
  defs.forEach(([k, v], i) => {
    const x = L + i * (w + 10), y = 320;
    rect(s, x, y, w, 140, { fill: C.white, lc: C.rule });
    T(s, k, x + 12, y + 14, w - 24, 20, { size: 12.5, bold: true, color: C.violet, ls: 1.1 });
    line(s, x + 12, y + 42, x + w - 12, y + 42, { color: C.rule, w: 0.5 });
    T(s, v, x + 12, y + 52, w - 24, 80, { size: 12, ls: 1.6 });
  });
}

// 16 扉 4
divider(4, "実証", "Proof of Concept", "1対1対1の初回PoCで、請求から分配までを確かめる", "4 実証");

// 17 初回PoC
{
  const s = slide("LX_WHITE", "4 実証", "初回PoC");
  title(s, "初回PoCは、1対1対1の最小構成で行います。");
  lead(s, "すべて計画です（2026年11月時点）。買い手・提供企業・データ・契約・入金は、いずれも未確定です。");
  const nums = [["買い手", "1", "社", "データを利用する企業"], ["提供企業", "1", "社", "データを提供する企業"], ["データ", "1", "種類", "記録・請求の対象とするデータ"]];
  const w = (CW - 32) / 3;
  nums.forEach(([lab, n, u, def], i) => {
    const x = L + i * (w + 16), y = 148;
    rect(s, x, y, w, 150, { fill: C.white, lc: C.rule });
    T(s, lab, x, y + 16, w, 20, { size: 14, bold: true, align: "center", ls: 1 });
    s.addText([{ text: n, options: { fontFace: EN, bold: true, fontSize: 60, color: C.violet } }, { text: " " + u, options: { fontFace: JP, bold: true, fontSize: 24, color: C.violet } }],
      { x: P(x), y: P(y + 40), w: P(w), h: P(72), margin: 0, align: "center", valign: "bottom", isTextBox: true, lang: "ja-JP" });
    T(s, def, x, y + 120, w, 18, { size: 12, color: C.sub, align: "center", ls: 1 });
  });
  rect(s, L, 314, CW, 146, { fill: C.lav2, r: 6 });
  T(s, "検証すること", L + 24, 330, 200, 20, { size: 13.5, bold: true, color: C.violet, ls: 1 });
  const steps = ["条件と価格の合意", "請求", "実際の入金", "提供企業への分配"];
  const sw = 112, sg = 20;
  steps.forEach((t, i) => {
    const x = L + 24 + i * (sw + sg);
    pill(s, t, x, 366, sw, { h: 30, size: 12, fill: i % 2 ? "8F7BFF" : C.violet });
    if (i < 3) T(s, "→", x + sw, 368, sg, 26, { size: 14, color: C.violet, align: "center", ls: 1 });
  });
  T(s, "合意した条件どおりに、請求から分配まで一巡できるかを確かめる。", L + 24, 412, 540, 20, { size: 12.5, ls: 1 });
  line(s, 640, 330, 640, 444, { color: "D9D4FB", w: 0.75 });
  T(s, "方法", 662, 330, 200, 20, { size: 13.5, bold: true, color: C.violet, ls: 1 });
  T(s, "決済：銀行振込\n照合：手動\n記録：ファイル取得記録・CSV", 662, 360, 210, 80, { size: 13, ls: 1.7 });
}

// 18 次の判断（p.48型）
{
  const s = slide("LX_WHITE", "4 実証", "次の判断");
  title(s, "PoCの結果をもとに、3つを判断します。\n基準は、開始前に参加企業と文書で合意します。", { h: 76 });
  const cards = [
    ["参加企業と条件の確定", "PoC開始前", "買い手・提供企業・データを決め、利用条件と価格を合意する。"],
    ["請求から分配までの実務", "PoC中に検証", "請求額・入金額・分配額が\n一致したか、照合にどれだけ\n作業がかかったかを確かめる。"],
    ["次の段階に進むか", "PoC後に判断", "手数料率の承認、対象の拡大、\n自動化の要否をまとめて判断する。"],
  ];
  const w = (CW - 40) / 3;
  cards.forEach(([h, when, d], i) => {
    const x = L + i * (w + 20), y = 150;
    rect(s, x, y, w, 300, { fill: C.white, lc: C.rule, r: 0 });
    T(s, "【" + h + "】", x + 20, y + 26, w - 40, 24, { size: 14.5, bold: true, color: C.violet, ls: 1 });
    T(s, when, x + 20, y + 54, w - 40, 22, { size: 14, bold: true, ls: 1 });
    line(s, x + 20, y + 92, x + w - 20, y + 92, { color: C.ink, w: 0.5 });
    T(s, d, x + 20, y + 110, w - 40, 120, { size: 13.5, ls: 1.75 });
    pill(s, i < 2 ? "計画" : "将来判断", x + 20, y + 254, 80, { h: 22, size: 11, fill: i < 2 ? C.violet : C.lav, color: i < 2 ? C.white : C.violet });
  });
  note(s, "判断の時期・判断者は未定。各段階の基準は検討案。");
}

// 19 扉 5
divider(5, "補足", "Appendix", "比較・計算式・根拠の区分", "5 補足");

// 20 補足A
{
  const s = slide("LX_WHITE", "5 補足", "現行と将来案の比較");
  title(s, "現行と将来案の比較");
  lead(s, "将来案はいずれも、許諾・法務・接続条件の確認を前提とする検討段階です。連携・購入・出資の事実はありません。");
  const tw = 600, lw = 128, cw = (tw - lw) / 2, y0 = 148;
  rect(s, L, y0, lw - 4, 36, { fill: C.card, r: 2 });
  T(s, "項目", L, y0, lw - 4, 36, { size: 12, bold: true, align: "center", valign: "middle", ls: 1 });
  rect(s, L + lw, y0, cw - 4, 36, { fill: C.violet, r: 2 });
  T(s, "初回PoC（計画）", L + lw, y0, cw - 4, 36, { size: 13.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  rect(s, L + lw + cw, y0, cw, 36, { fill: C.lav, r: 2 });
  T(s, "将来案（条件付き）", L + lw + cw, y0, cw, 36, { size: 13.5, bold: true, color: C.violet, align: "center", valign: "middle", ls: 1 });
  const rows = [["対象データ", "1種類", "複数種類"], ["記録の範囲", "ファイル取得記録", "引用の検出"], ["請求", "CSVから作成", "自動請求"], ["決済", "銀行振込", "x402、円建てステーブルコイン等"], ["照合・分配", "手動", "自動化"], ["課金の単位", "取得（ファイル）", "引用課金"]];
  rows.forEach(([k, a, b], i) => {
    const y = y0 + 44 + i * 44;
    T(s, k, L + 8, y, lw - 12, 36, { size: 13, bold: true, valign: "middle", ls: 1 });
    T(s, a, L + lw + 14, y, cw - 28, 36, { size: 13, valign: "middle", ls: 1.2 });
    T(s, b, L + lw + cw + 14, y, cw - 28, 36, { size: 13, color: C.sub, valign: "middle", ls: 1.2 });
    line(s, L, y + 40, L + tw, y + 40, { color: C.rule, w: 0.5 });
  });
  const nx = L + tw + 24, nw = R - nx;
  rect(s, nx, y0, nw, 300, { fill: C.lav2, r: 6 });
  T(s, "補足", nx + 18, y0 + 18, nw - 36, 20, { size: 13.5, bold: true, color: C.violet, ls: 1 });
  T(s, "将来案の各項目は、\n許諾・法務・接続条件を\n満たす場合に限り\n検討する。\n\n取引先・接続先の\n名称やロゴは、\n承認を得るまで\n掲載しない。", nx + 18, y0 + 50, nw - 36, 240, { size: 12.5, ls: 1.7 });
}

// 21 補足B
{
  const s = slide("LX_WHITE", "5 補足", "料金計算の定義");
  title(s, "料金計算の定義");
  lead(s, "検討案です。単価・手数料率・締め日・端数処理は未承認のため、値を置いていません。");
  const fm = [["請求額", "＝ Σ（取得件数 × 合意単価）", "定額契約の場合は、合意額をそのまま請求額とする"], ["手数料", "＝ 入金額 × 手数料率", "手数料＝プラットフォーム売上。率は未定"], ["分配額", "＝ 入金額 − 手数料", "未入金分は分配しない（案）"]];
  fm.forEach(([k, f, n], i) => {
    const y = 148 + i * 102;
    rect(s, L, y, 520, 90, { fill: C.lav2, r: 6 });
    pill(s, k, L + 20, y + 18, 84, { h: 26, size: 13 });
    T(s, f, L + 122, y + 16, 380, 30, { size: 20, bold: true, ls: 1 });
    T(s, n, L + 122, y + 54, 380, 20, { size: 12.5, color: C.sub, ls: 1 });
  });
  const nx = L + 544, nw = R - nx;
  rect(s, nx, 148, nw, 294, { fill: C.white, lc: C.rule });
  T(s, "合意で決めること", nx + 20, 166, nw - 40, 22, { size: 14.5, bold: true, color: C.violet, ls: 1 });
  ["単価、または定額", "締め単位（月次を想定）", "入金期日と振込手数料の負担", "端数処理", "手数料率（要承認）"].forEach((t, i) => {
    const y = 206 + i * 44;
    T(s, String(i + 1).padStart(2, "0"), nx + 20, y, 30, 20, { font: ENS, size: 12, color: C.violet, ls: 1 });
    T(s, t, nx + 54, y, nw - 74, 20, { size: 13, ls: 1.1 });
    line(s, nx + 20, y + 30, nx + nw - 20, y + 30, { color: C.rule, w: 0.5 });
  });
}

// 22 補足C
{
  const s = slide("LX_WHITE", "5 補足", "根拠の区分と未掲載事項");
  title(s, "根拠の区分と未掲載事項");
  lead(s, "数値は、検証または承認が済んだものから順に追加します。詳細は「未反映項目」に記録しています。");
  const half = (CW - 20) / 2;
  const box = (x, head, rows) => {
    rect(s, x, 148, half, 300, { fill: C.white, lc: C.rule });
    rect(s, x + 1, 149, half - 2, 42, { fill: C.card, r: 3 });
    T(s, head, x, 149, half, 42, { size: 14.5, bold: true, align: "center", valign: "middle", ls: 1 });
    rows.forEach(([k, d, w], i) => {
      const y = 206 + i * 58;
      T(s, k, x + 20, y - 4, 130, 44, { size: 13.5, bold: true, color: C.violet, valign: "middle", ls: 1 });
      T(s, d, x + 150, y - 4, half - 170 - (w ? 70 : 0), 44, { size: 12.5, valign: "middle", ls: 1.4 });
      if (w) T(s, w, x + half - 90, y - 4, 70, 44, { size: 12, color: C.mute, align: "right", valign: "middle", ls: 1 });
      if (i < rows.length - 1) line(s, x + 20, y + 44, x + half - 20, y + 44, { color: C.rule, w: 0.5 });
    });
  };
  box(L, "本資料の根拠の区分", [["実績", "実施・確定済みの事実", "掲載なし"], ["外部公表", "第三者の一次公表", "p.5"], ["検討案", "社内の計画・案・仮説", "p.5〜21"], ["試算", "承認済みの仮定による計算", "掲載なし"]]);
  box(L + half + 20, "載せていないもの", [["市場規模", "分母・対象・算式・出典を\n検証できていない"], ["手数料率・単価", "承認済みの仮定がない"], ["取引先の名称", "掲載の承認がない"], ["旧資料の数値", "原本（29ページ）が未入手"]]);
}

// 23 結び（p.52型）
{
  const s = slide("LX_BARE", "5 補足", null);
  s.addImage({ path: BG("bg_closing.jpg"), x: 0, y: 0, w: P(420), h: P(540), sizing: { type: "cover", w: P(420), h: P(540) } });
  T(s, "Trillion Bank", R - 200, 20, 248, 22, { font: ENS, size: 14, align: "right", ls: 1 });
  T(s, "AIから発信者に、\n還元をするインフラをつくる。", 480, 220, 440, 100, { size: 28, bold: true, ls: 1.6 });
  T(s, "Adctor", 480, 340, 300, 26, { font: EN, bold: true, size: 20, color: C.violet, ls: 1 });
  T(s, "©Trillion Bank", R - 152, 512, 200, 14, { font: EN, size: 9, align: "right", ls: 1 });
}

pres.writeFile({ fileName: OUT }).then(async (f) => {
  try {
    const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
    await applyTheme(f, { name: "Adctor LX", headFontFace: JP, bodyFontFace: JP, colors: { dk1: "0A2133", lt1: "FFFFFF", dk2: "5B6A76", lt2: "F6F7F8", accent1: "524DFF", accent2: "F1EEFD", accent3: "004295", accent4: "7A73FF", accent5: "D6DADD", accent6: "8F7BFF", hlink: "524DFF", folHlink: "5B6A76" } });
  } catch (e) { console.warn("theme not applied:", e.message); }
  console.log("wrote", f);
});
