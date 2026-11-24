// Adctor 事業説明資料 v2 — 生成スクリプト
// 使い方: cd out/source && npm install && node build.js
// 座標はすべて pt（960 × 540）で書き、P() でインチに換算する。
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.resolve(__dirname, "..", "Adctor_SmartHR_reference_v2.pptx");

// ---------- tokens ----------
const COL = {
  white: "FFFFFF", ink: "111318", blue: "1762E8", tint: "EAF1FF",
  sub: "667085", rule: "DDE2EA", rail: "F8F7F6",
};
const JP = "Noto Sans JP";          // 和文 Regular / Bold（bold:true）
const JPM = "Noto Sans JP Medium";  // 和文 Medium
const EN = "Montserrat";            // 欧文 補助
const ENX = "Montserrat ExtraBold"; // 欧文 大見出し・大数字
const ENL = "Montserrat Light";     // 細い章番号
const ENT = "Montserrat ExtraLight";// 扉の大数字

const P = (v) => v / 72; // pt -> in
const L = 82.5, R = 897, CW = R - L; // 本文の左端・右端
const FOOT_Y = 492;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.author = "Trillion Bank";
pres.company = "Trillion Bank";
pres.title = "Adctor 事業説明資料 v2";
pres.theme = { headFontFace: JP, bodyFontFace: JP };

// ---------- primitives ----------
function T(slide, text, x, y, w, h, o = {}) {
  slide.addText(text, {
    x: P(x), y: P(y), w: P(w), h: P(h),
    fontFace: o.font || JP, fontSize: o.size || 20, color: o.color || COL.ink,
    bold: !!o.bold, italic: !!o.italic, align: o.align || "left", valign: o.valign || "top",
    margin: 0, isTextBox: true, lang: "ja-JP", fit: "none",
    lineSpacingMultiple: o.ls || 1.3, charSpacing: o.cs, vert: o.vert,
    paraSpaceAfter: o.psa, fill: o.fill ? { color: o.fill } : undefined,
    line: o.line, objectName: o.name,
  });
}
function line(slide, x1, y1, x2, y2, o = {}) {
  slide.addShape(pres.shapes.LINE, {
    x: P(Math.min(x1, x2)), y: P(Math.min(y1, y2)),
    w: P(Math.abs(x2 - x1)), h: P(Math.abs(y2 - y1)),
    flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.color || COL.rule, width: o.w || 0.5, dashType: o.dash || "solid",
      endArrowType: o.arrow ? "triangle" : undefined, beginArrowType: o.arrowStart ? "triangle" : undefined },
  });
}
function box(slide, x, y, w, h, o = {}) {
  slide.addShape(o.round ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
    x: P(x), y: P(y), w: P(w), h: P(h),
    fill: o.fill ? { color: o.fill } : { type: "none" },
    line: o.line === false ? { type: "none" } : { color: o.lc || COL.ink, width: o.lw || 0.75, dashType: o.dash || "solid" },
    rectRadius: o.round ? o.round : undefined, objectName: o.name,
  });
}
function circle(slide, cx, cy, r, o = {}) {
  slide.addShape(pres.shapes.OVAL, {
    x: P(cx - r), y: P(cy - r), w: P(2 * r), h: P(2 * r),
    fill: o.fill ? { color: o.fill } : { type: "none" },
    line: o.line === false ? { type: "none" } : { color: o.lc || COL.ink, width: o.lw || 0.75 },
  });
}
// ステータス表記：文字＋線種（実線＝対象・計画、破線＝対象外・将来）
function status(slide, x, y, label, kind) {
  const solid = kind !== "future";
  line(slide, x, y + 8, x + 22, y + 8, { color: solid ? COL.blue : COL.sub, w: 1.25, dash: solid ? "solid" : "dash" });
  T(slide, label, x + 28, y, 220, 16, { size: 12, color: solid ? COL.blue : COL.sub, font: JPM });
}

// ---------- layouts（レール・フッター・ノンブル） ----------
const RAIL = [
  ["INTRO", "00", "はじめに"],
  ["CH01", "01", "課題"],
  ["CH02", "02", "仕組み"],
  ["CH03", "03", "実証"],
  ["APX", "A–C", "補足"],
];
const footerObjs = [
  { line: { x: P(L), y: P(FOOT_Y), w: P(CW), h: 0, line: { color: COL.rule, width: 0.5 } } },
  // 公式ロゴPNG未受領のため、編集可能な文字のワードマーク（差し替え用）
  { text: { text: "Trillion Bank", options: { x: P(L), y: P(FOOT_Y + 9), w: P(140), h: P(16), fontFace: EN, bold: true, fontSize: 11, color: COL.ink, margin: 0, valign: "middle" } } },
];
const slideNum = { x: P(R - 60), y: P(FOOT_Y + 9), w: P(60), h: P(16), fontFace: EN, fontSize: 11, color: COL.sub, align: "right", margin: 0, valign: "middle" };
const titlePH = {
  placeholder: {
    options: { name: "title", type: "title", x: P(L), y: P(38), w: P(CW), h: P(48), fontFace: JP, fontSize: 32, bold: true, color: COL.ink, margin: 0, valign: "top", align: "left" },
    text: "",
  },
};
for (const [name, num, jp] of RAIL) {
  pres.defineSlideMaster({
    title: name,
    background: { color: COL.white },
    objects: [
      { rect: { x: 0, y: 0, w: P(45), h: P(540), fill: { color: COL.rail }, line: { type: "none" } } },
      { line: { x: P(45), y: 0, w: 0, h: P(540), line: { color: COL.rule, width: 0.5 } } },
      { text: { text: num, options: { x: 0, y: P(26), w: P(45), h: P(16), fontFace: ENL, fontSize: 13, color: COL.ink, align: "center", margin: 0 } } },
      { text: { text: jp, options: { x: P(13), y: P(52), w: P(19), h: P(120), fontFace: JP, fontSize: 11, color: COL.ink, vert: "eaVert", margin: 0, align: "left", valign: "top" } } },
      { text: { text: name === "INTRO" ? "INTRODUCTION" : name === "APX" ? "APPENDIX" : "CHAPTER " + num, options: { x: P(13), y: P(380), w: P(19), h: P(140), fontFace: EN, fontSize: 9, color: COL.sub, vert: "vert", margin: 0, charSpacing: 2 } } },
      ...footerObjs,
    ],
    slideNumber: slideNum,
  });
}
// 表紙・目次・扉：レールを外す
pres.defineSlideMaster({ title: "PLAIN", background: { color: COL.white }, objects: [] });
pres.defineSlideMaster({ title: "DIVIDER", background: { color: COL.white }, objects: [...footerObjs], slideNumber: slideNum });

function content(layout, section, title, source) {
  const s = pres.addSlide({ masterName: layout, sectionTitle: section });
  T(s, title, L, 38, CW, 48, { size: 32, bold: true, ls: 1.15, name: "title" });
  if (source) T(s, source, 240, FOOT_Y + 8, 560, 30, { size: 11, color: COL.sub, align: "center", ls: 1.15 });
  return s;
}

// =====================================================================
// 1 表紙
pres.addSection({ title: "導入" });
{
  const s = pres.addSlide({ masterName: "PLAIN", sectionTitle: "導入" });
  T(s, "Adctor", L, 92, 520, 110, { font: ENX, size: 96, ls: 1.0 });
  T(s, "AIから発信者に、\n還元をするインフラをつくる", L, 236, CW, 150, { size: 50, bold: true, ls: 1.25 });
  T(s, "事業説明資料　初見の投資家・協業先向け", L, 400, 600, 26, { size: 20, color: COL.sub, font: JPM });
  T(s, "2026年11月版", L, 430, 600, 22, { size: 14, color: COL.sub });
  // 自作の図案：提供者・Adctor・利用者の三点と、還る線
  const y = 140, xs = [662, 762, 862];
  line(s, xs[0], y, xs[2], y, { color: COL.ink, w: 0.75 });
  line(s, xs[2], y + 34, xs[0], y + 34, { color: COL.blue, w: 1.25, arrow: true });
  circle(s, xs[0], y, 9, { fill: COL.white });
  circle(s, xs[1], y, 9, { fill: COL.blue, lc: COL.blue });
  circle(s, xs[2], y, 9, { fill: COL.white });
  line(s, L, 478, R, 478, { color: COL.rule });
  T(s, "Trillion Bank", L, 494, 200, 20, { font: EN, bold: true, size: 14 });
  T(s, "計画・検討案を含む。数値・社名は確認済みのもののみ掲載", 420, 496, 477, 18, { size: 11, color: COL.sub, align: "right" });
}

// 2 目次
{
  const s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: "導入" });
  T(s, "Index", L, 38, 200, 24, { font: EN, size: 16 });
  T(s, "目次", L, 64, 300, 44, { size: 32, bold: true });
  // はじめに
  const tocRow = (x, y, w, label, pg, o = {}) => {
    T(s, label, x, y, w - 50, 24, { size: o.size || 18, bold: !!o.bold, font: o.bold ? JP : JPM });
    T(s, String(pg), x + w - 40, y + 2, 40, 22, { size: 14, font: EN, align: "right" });
    line(s, x, y + 30, x + w, y + 30, { color: COL.rule });
  };
  T(s, "はじめに", L, 134, 200, 18, { size: 13, color: COL.sub });
  tocRow(L, 158, 250, "市場の変化", 3);
  tocRow(L, 200, 250, "ミッション", 4);
  const chapters = [
    ["01", "課題", [["3つの経路の欠落", 6], ["提供者の選択肢", 7]]],
    ["02", "仕組み", [["事業構造", 9], ["取引フロー", 10], ["取得・引用・学習", 11], ["利用台帳", 12], ["収益モデル（案）", 13]]],
    ["03", "実証", [["初回PoC", 15], ["次の判断", 16]]],
  ];
  const cx = [L + 300, L + 300 + 180, L + 300 + 360];
  chapters.forEach(([n, t, items], i) => {
    const x = cx[i], w = 160;
    T(s, n, x, 128, 80, 40, { font: ENL, size: 34, color: COL.blue, ls: 1 });
    T(s, t, x, 172, w, 28, { size: 22, bold: true });
    line(s, x, 208, x + w, 208, { color: COL.ink, w: 0.75 });
    items.forEach(([lab, pg], j) => {
      T(s, lab, x, 218 + j * 32, w - 30, 22, { size: 15, font: JPM });
      T(s, String(pg), x + w - 28, 220 + j * 32, 28, 20, { size: 13, font: EN, align: "right" });
    });
  });
  // 補足
  T(s, "補足", L, 404, 200, 18, { size: 13, color: COL.sub });
  const apx = [["A　現行と将来案の比較", 17], ["B　料金計算の定義", 18], ["C　根拠の区分と未掲載事項", 19]];
  apx.forEach(([lab, pg], i) => {
    const x = L + i * 275, w = 250;
    T(s, lab, x, 428, w - 40, 22, { size: 15, font: JPM });
    T(s, String(pg), x + w - 30, 430, 30, 20, { size: 13, font: EN, align: "right" });
    line(s, x, 456, x + w, 456, { color: COL.rule });
  });
}

// 3 市場の変化（p.3型：囲いのない3列）
{
  const s = content("INTRO", "導入", "AIとコンテンツの取引に、3つの変化",
    "変化02：Cloudflare公式ブログ「Introducing pay per crawl」（2025年7月公表）。変化01・03は当社の観察・仮説で、定量値は出典を検証できるまで載せない。");
  const cols = [
    ["CHANGE 01", "回答の場が変わる", "生成AIの回答で情報を得る人が増え、元のページを訪れない閲覧が生まれている。", "観察（定量値は未掲載）", "future"],
    ["CHANGE 02", "提供側が条件を示す", "大手CDN事業者が、\nAIクローラーに許諾・課金の条件を示す機能を公表した。", "外部公表（2025年7月）", "solid"],
    ["CHANGE 03", "取引の事務が未整備", "許諾から記録・請求・入金・分配までを通して扱う実務の型は、まだ少ない。", "仮説（PoCで検証）", "future"],
  ];
  cols.forEach(([en, head, body, ev, kind], i) => {
    const x = L + i * 282, w = 250;
    T(s, en, x, 124, w, 16, { font: EN, size: 12, color: COL.sub, cs: 2 });
    T(s, String(i + 1).padStart(2, "0"), x, 146, w, 72, { font: ENL, size: 60, ls: 1 });
    T(s, head, x, 232, w, 34, { size: 24, bold: true });
    T(s, body, x, 276, w, 130, { size: 19, ls: 1.45 });
    status(s, x, 430, ev, kind);
    if (i > 0) line(s, x - 16, 128, x - 16, 450, { color: COL.rule });
  });
}

// 4 ミッション（p.4型）
{
  const s = content("INTRO", "導入", "ミッション", "本ページは目指す姿であり、実績を示すものではない。");
  T(s, "価値を生む人に、\n価値が還る社会を。", L, 100, CW, 180, { size: 60, bold: true, ls: 1.2 });
  const mid = 490;
  line(s, mid, 306, mid, 474, { color: COL.rule, w: 0.75 });
  T(s, "FOR DATA USERS", L, 306, 300, 16, { font: EN, size: 11, color: COL.sub, cs: 2 });
  T(s, "利用者にとって", L, 326, 380, 28, { size: 22, bold: true });
  T(s, "条件と価格が先に決まり、\n取得記録と請求がそろう。\n権利関係を説明できるデータを使える。", L, 364, 380, 110, { size: 20, ls: 1.45 });
  T(s, "FOR PUBLISHERS", mid + 28, 306, 300, 16, { font: EN, size: 11, color: COL.sub, cs: 2 });
  T(s, "提供者にとって", mid + 28, 326, 380, 28, { size: 22, bold: true });
  T(s, "どのデータが、いつ、誰に\n取得されたかを確かめられ、\n合意した条件で対価を受け取れる。", mid + 28, 364, 378, 110, { size: 20, ls: 1.45 });
}

// 扉
function divider(num, title, lead, section) {
  pres.addSection({ title: section });
  const s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: section });
  T(s, "CHAPTER", L, 150, 200, 16, { font: EN, size: 12, color: COL.sub, cs: 3 });
  T(s, num, L - 6, 166, 260, 150, { font: ENT, size: 112, ls: 1 });
  line(s, 330, 186, 330, 316, { color: COL.blue, w: 1.25 });
  T(s, title, 370, 190, 520, 50, { size: 38, bold: true });
  T(s, lead, 370, 252, 520, 70, { size: 20, color: COL.sub, ls: 1.4 });
  return s;
}

// 5 扉01
divider("01", "課題", "AIによるデータ利用に、\n取引の経路が足りない", "01 課題");

// 6 課題：2者間の破線
{
  const s = content("CH01", "01 課題", "データ利用に、合意・記録・対価の経路がない",
    "当社の仮説（定性的整理）。破線は、現状では経路が整っていないことを表す。");
  box(s, L, 126, 140, 290, { lc: COL.ink });
  T(s, "提供者", L, 236, 140, 30, { size: 22, bold: true, align: "center" });
  T(s, "発信者・\nデータ提供企業", L, 270, 140, 50, { size: 14, color: COL.sub, align: "center" });
  box(s, R - 140, 126, 140, 290, { lc: COL.ink });
  T(s, "利用者", R - 140, 236, 140, 30, { size: 22, bold: true, align: "center" });
  T(s, "AI事業者・\nデータ利用企業", R - 140, 270, 140, 50, { size: 14, color: COL.sub, align: "center" });
  const gx1 = L + 140 + 34, gx2 = R - 140 - 34, ex1 = L + 140, ex2 = R - 140;
  const rows = [
    ["01", "合意", "利用条件と価格を事前に決める標準的な手段が少ない"],
    ["02", "記録", "いつ・どのデータが取得されたかを双方で確かめにくい"],
    ["03", "対価", "請求・入金・分配を通して扱う事務の型がない"],
  ];
  rows.forEach(([n, h, d], i) => {
    const y = 150 + i * 92;
    T(s, n, gx1, y, 40, 24, { font: EN, size: 16, color: COL.blue, bold: true });
    T(s, h, gx1 + 40, y - 3, 120, 30, { size: 22, bold: true });
    line(s, ex1, y + 38, ex2, y + 38, { color: COL.ink, w: 1, dash: "dash" });
    T(s, d, gx1, y + 46, gx2 - gx1, 26, { size: 17, ls: 1.2 });
  });
  status(s, gx1, 436, "破線：経路が整っていない（当社仮説）", "future");
}

// 7 提供者の選択肢（比較表：同じ列幅、強調は1列）
{
  const s = content("CH01", "01 課題", "提供者の選択肢は、遮断か黙認かに偏っている",
    "当社による定性比較。「条件つき提供」はAdctorが目指す検討案で、稼働中のサービスではない。");
  const lw = 90, cw = (CW - lw) / 4, top = 116;
  const heads = ["遮断", "黙認", "個別契約", "条件つき提供"];
  const rows = [
    ["方法", ["取得を技術的に断る", "取得をそのまま許す", "1社ずつ個別に契約", "条件と価格を示し、記録と請求を通す"]],
    ["対価", ["なし", "なし", "あり（交渉が重い）", "あり（合意条件で）"]],
    ["記録", ["不要", "残らない", "契約ごとに個別管理", "記録とCSVを共有"]],
  ];
  // 強調列の薄面
  box(s, L + lw + cw * 3, top, cw, 340, { fill: COL.tint, line: false });
  heads.forEach((h, i) => {
    const x = L + lw + cw * i;
    T(s, h, x + 14, top + 16, cw - 28, 30, { size: 21, bold: true, color: i === 3 ? COL.blue : COL.ink });
  });
  T(s, "Adctorの案", L + lw + cw * 3 + 14, top + 48, cw - 28, 18, { size: 12, color: COL.blue, font: JPM });
  line(s, L, top + 72, R, top + 72, { color: COL.ink, w: 0.75 });
  rows.forEach(([lab, cells], r) => {
    const y = top + 72 + r * 89;
    T(s, lab, L, y + 18, lw - 10, 24, { size: 17, bold: true });
    cells.forEach((c, i) => T(s, c, L + lw + cw * i + 14, y + 18, cw - 28, 64, { size: 16, ls: 1.35 }));
    line(s, L, y + 89, R, y + 89, { color: COL.rule });
  });
  for (let i = 1; i < 4; i++) line(s, L + lw + cw * i, top + 8, L + lw + cw * i, top + 72 + 3 * 89 - 8, { color: COL.rule });
}

// 8 扉02
divider("02", "仕組み", "提供者と利用者の間で、\n許諾・記録・請求を担う", "02 仕組み");

// 9 事業構造（p.5型）
{
  const s = content("CH02", "02 仕組み", "Adctorは、許諾・取得記録・請求をつなぐ",
    "初回PoCを前提とした構造（検討案）。自動課金・自動分配は稼働していない。");
  T(s, "提供者と利用者の間に立ち、\n取引の事務を引き受ける。", L, 120, 430, 80, { size: 24, bold: true, ls: 1.4 });
  // 関係図
  const by = 278, bw = 112, bh = 74, gap = 47;
  const xs = [L, L + bw + gap, L + 2 * (bw + gap)];
  const labels = [["提供者", "データ提供企業"], ["Adctor", "許諾・記録・請求"], ["利用者", "買い手企業"]];
  xs.forEach((x, i) => {
    const key = i === 1;
    box(s, x, by, bw, bh, { fill: key ? COL.blue : COL.white, lc: key ? COL.blue : COL.ink });
    T(s, labels[i][0], x, by + 10, bw, 26, { size: key ? 20 : 19, bold: true, align: "center", color: key ? COL.white : COL.ink, font: key ? ENX : JP });
    T(s, labels[i][1], x, by + 38, bw, 18, { size: 12, align: "center", color: key ? COL.white : COL.sub });
  });
  for (let i = 0; i < 2; i++) {
    const x1 = xs[i] + bw + 4, x2 = xs[i + 1] - 4;
    line(s, x1, by + 24, x2, by + 24, { color: COL.ink, w: 1, arrow: true });
    line(s, x2, by + 50, x1, by + 50, { color: COL.blue, w: 1.25, arrow: true });
  }
  T(s, "→ データ・取得記録", L, by - 34, 300, 20, { size: 16, font: JPM });
  T(s, "← 対価（請求・入金・分配）", L, by + bh + 16, 400, 20, { size: 16, font: JPM, color: COL.blue });
  // 縦罫1本
  line(s, 540, 120, 540, 470, { color: COL.rule, w: 0.75 });
  const items = [
    ["01", "許諾", "利用条件と価格を、\n両者の合意として残す"],
    ["02", "取得記録", "いつ・誰が・どのファイルを\n取得したかを残す"],
    ["03", "請求", "記録をCSVに集計し、\n合意条件で請求・照合する"],
  ];
  items.forEach(([n, h, d], i) => {
    const y = 122 + i * 116;
    T(s, n, 572, y + 2, 40, 22, { font: EN, size: 16, color: COL.blue, bold: true });
    T(s, h, 612, y, 280, 30, { size: 22, bold: true });
    T(s, d, 612, y + 38, 285, 64, { size: 20, ls: 1.4 });
  });
}

// 10 取引フロー（p.7〜9型）
{
  const s = content("CH02", "02 仕組み", "データは右へ、お金は左へ。6つの段階で流れる",
    "初回PoCの計画（未実施）。⑤⑥は銀行振込と手動照合で行う。自動課金・自動分配は対象外。");
  const lx = L, cx0 = 150, cw = 173, g = 18;
  // 段ラベル
  T(s, "データ\n記録", lx, 168, 60, 50, { size: 15, bold: true, ls: 1.2 });
  T(s, "お金", lx, 346, 70, 24, { size: 15, bold: true, color: COL.blue });
  const top = [
    ["01", "合意", "条件と価格を決める", "出力：合意書"],
    ["02", "取得", "買い手が取得する", "出力：取得の発生"],
    ["03", "記録", "日時・データ・\n取得者を残す", "出力：取得記録"],
    ["04", "CSV", "記録を月次で集計", "出力：請求用CSV"],
  ];
  top.forEach(([n, h, d, o], i) => {
    const x = cx0 + i * (cw + g), y = 120;
    box(s, x, y, cw, 150, { lc: COL.ink });
    T(s, n, x + 14, y + 12, 40, 18, { font: EN, size: 13, color: COL.sub, bold: true });
    T(s, h, x + 14, y + 32, cw - 28, 28, { size: 21, bold: true });
    T(s, d, x + 14, y + 66, cw - 28, 46, { size: 15, ls: 1.3 });
    T(s, o, x + 14, y + 120, cw - 28, 18, { size: 13, color: COL.sub, font: JPM });
    if (i < 3) line(s, x + cw + 2, y + 75, x + cw + g - 2, y + 75, { color: COL.ink, w: 1, arrow: true });
  });
  // 折り返し（04 → 05）
  const xr = cx0 + 3 * (cw + g) + cw / 2;
  line(s, xr, 272, xr, 310, { color: COL.blue, w: 1.25, arrow: true });
  const bw = cw * 2 + g;
  const bottom = [
    [cx0, "06", "入金・分配", "銀行振込で入金を受け、\n手数料を除いて提供企業へ分配する", "手動"],
    [cx0 + 2 * (cw + g), "05", "請求・照合", "CSVと合意条件で請求し、\n入金額と手動で照合する", "手動"],
  ];
  bottom.forEach(([x, n, h, d, tag]) => {
    const y = 312;
    box(s, x, y, bw, 108, { lc: COL.blue, lw: 1 });
    T(s, n, x + 14, y + 12, 40, 18, { font: EN, size: 13, color: COL.blue, bold: true });
    T(s, h, x + 50, y + 8, 200, 28, { size: 21, bold: true });
    T(s, tag, x + bw - 60, y + 12, 46, 18, { size: 12, color: COL.blue, font: JPM, align: "right" });
    T(s, d, x + 14, y + 46, bw - 28, 50, { size: 16, ls: 1.35 });
  });
  line(s, cx0 + 2 * (cw + g) - 2, 366, cx0 + bw + 2, 366, { color: COL.blue, w: 1.25, arrow: true });
  // 成果（分離）
  line(s, L, 438, R, 438, { color: COL.rule });
  T(s, "PoCで確かめる成果", L, 450, 160, 22, { size: 15, bold: true });
  T(s, "合意どおりに請求できたか ／ 請求と入金が一致したか ／ 分配額を提供企業が確認できたか", 248, 450, 650, 22, { size: 15, font: JPM });
}

// 11 取得・引用・学習
{
  const s = content("CH02", "02 仕組み", "取得と、引用・学習は別のものとして扱う",
    "初回PoCで記録・請求の対象とするのはファイル取得のみ。引用の検出や学習の把握は行わない。");
  const lw = 150, cw = (CW - lw) / 3, top = 112;
  const heads = [["ファイル取得", "PoCの対象", "solid"], ["AI回答への引用", "対象外（将来検討）", "future"], ["モデル学習", "対象外", "future"]];
  heads.forEach(([h, st, kind], i) => {
    const x = L + lw + cw * i + 16;
    T(s, h, x, top + 6, cw - 32, 30, { size: 22, bold: true });
    status(s, x, top + 44, st, kind);
  });
  line(s, L, top + 74, R, top + 74, { color: COL.ink, w: 0.75 });
  const rows = [
    ["何が起きるか", ["買い手がファイルを\n取得する", "AIの回答に\nデータの内容が使われる", "データがモデルの\n学習に使われる"]],
    ["Adctorで\n確かめられること", ["日時・データ・\n取得者を記録できる", "確かめられない\n（検出機能はない）", "確かめられない"]],
    ["初回PoCでの扱い", ["記録・集計・請求の対象", "扱わない", "扱わない（利用範囲は\n契約で定める案）"]],
  ];
  rows.forEach(([lab, cells], r) => {
    const y = top + 74 + r * 96;
    T(s, lab, L, y + 18, lw - 14, 50, { size: 16, bold: true, ls: 1.25 });
    cells.forEach((c, i) => T(s, c, L + lw + cw * i + 16, y + 18, cw - 32, 70, { size: 17, ls: 1.35, color: i === 0 ? COL.ink : COL.sub }));
    line(s, L, y + 96, R, y + 96, { color: COL.rule });
  });
  for (let i = 1; i < 3; i++) line(s, L + lw + cw * i, top + 4, L + lw + cw * i, top + 74 + 3 * 96 - 6, { color: COL.rule });
  // 対象列の外枠（実線＝対象）
  box(s, L + lw + 2, top - 2, cw - 4, 74 + 3 * 96, { lc: COL.blue, lw: 1 });
}

// 12 利用台帳（p.18/24型：大きい1画面＋右の編集面）
{
  const s = content("CH02", "02 仕組み", "取得記録を、双方が同じ台帳で確かめる",
    "自作のワイヤーフレーム（画面案）。実在の画面ではなく、表示値はすべてダミー。");
  const sx = L, sy = 108, sw = 520, sh = 360;
  box(s, sx, sy, sw, sh, { lc: COL.rule, lw: 1, fill: COL.white });
  box(s, sx, sy, sw, 30, { fill: COL.rail, lc: COL.rule, lw: 1 });
  [0, 1, 2].forEach((i) => circle(s, sx + 16 + i * 12, sy + 15, 3.5, { fill: COL.rule, line: false }));
  T(s, "Adctor　利用台帳", sx + 60, sy + 7, 260, 18, { size: 12, font: JPM });
  T(s, "画面案", sx + sw - 80, sy + 7, 66, 18, { size: 12, color: COL.blue, font: JPM, align: "right" });
  // サマリー
  const kp = [["対象期間", "YYYY年MM月"], ["取得件数", "000 件"], ["請求予定額", "000,000 円"]];
  kp.forEach(([k, v], i) => {
    const x = sx + 20 + i * 166;
    T(s, k, x, sy + 46, 150, 16, { size: 11, color: COL.sub });
    T(s, v, x, sy + 64, 150, 26, { size: 18, font: EN, bold: true });
  });
  // 表
  const ty = sy + 112, cols = [["取得日時", 112], ["取得者", 80], ["データID", 88], ["ファイル", 112], ["合意ID", 88]];
  let cx = sx + 20;
  line(s, sx + 20, ty + 22, sx + sw - 20, ty + 22, { color: COL.ink, w: 0.75 });
  cols.forEach(([h, w]) => { T(s, h, cx, ty, w, 18, { size: 11, color: COL.sub, font: JPM }); cx += w; });
  for (let r = 0; r < 6; r++) {
    const y = ty + 30 + r * 30;
    const vals = [`MM-DD 1${r}:00`, "買い手A", "DATA-001", `file_00${r + 1}.csv`, "AGR-001"];
    cx = sx + 20;
    cols.forEach(([, w], c) => { T(s, vals[c], cx, y, w, 18, { size: 11, font: EN }); cx += w; });
    line(s, sx + 20, y + 22, sx + sw - 20, y + 22, { color: COL.rule });
  }
  box(s, sx + sw - 150, sy + sh - 44, 130, 28, { lc: COL.blue, lw: 1 });
  T(s, "CSVを書き出す", sx + sw - 150, sy + sh - 40, 130, 20, { size: 12, color: COL.blue, font: JPM, align: "center" });
  // 番号マーカー
  const mark = (x, y, n) => { circle(s, x, y, 11, { fill: COL.blue, lc: COL.blue }); T(s, n, x - 11, y - 8, 22, 16, { size: 11, color: COL.white, font: EN, bold: true, align: "center" }); };
  mark(sx + 8, ty + 50, "1");
  mark(sx + 20 + 392 + 70, ty - 12, "2");
  mark(sx + sw - 158, sy + sh - 30, "3");
  // 右の編集面
  const px = 640;
  line(s, px - 22, 108, px - 22, 468, { color: COL.rule, w: 0.75 });
  const notes = [["01", "取得を1行ずつ記録", "日時・取得者・データを残し、\n双方が同じ行を見る。"], ["02", "合意と結びつける", "各行に合意IDを持たせ、\n条件と価格に対応させる。"], ["03", "CSVで書き出す", "月次の利用集計と\n請求の元データにする。"]];
  notes.forEach(([n, h, d], i) => {
    const y = 110 + i * 120;
    T(s, n, px, y, 60, 28, { font: "Montserrat Light", italic: true, size: 24, color: COL.blue, ls: 1 });
    T(s, h, px, y + 32, 257, 26, { size: 20, bold: true });
    T(s, d, px, y + 62, 257, 46, { size: 15, ls: 1.35 });
  });
}

// 13 収益モデル（案）
{
  const s = content("CH02", "02 仕組み", "収益は、取引額に対する手数料とする案",
    "検討案。手数料率・単価は未承認のため記載しない。承認後に「試算」として別途示す。");
  status(s, L, 102, "検討案（料率は未定）", "future");
  // 取引額バー
  const bx = L, by = 158, bw = CW, bh = 54, fw = 150;
  T(s, "取引額（GMV）の内訳", bx, by - 30, 300, 22, { size: 16, bold: true });
  T(s, "模式図：帯の幅は比率を表さない", R - 300, by - 28, 300, 20, { size: 12, color: COL.sub, align: "right" });
  box(s, bx, by, bw - fw, bh, { fill: COL.tint, lc: COL.blue, lw: 0.75 });
  box(s, bx + bw - fw, by, fw, bh, { fill: COL.blue, lc: COL.blue, lw: 0.75 });
  T(s, "提供企業への分配", bx + 18, by + 15, 300, 24, { size: 18, bold: true });
  T(s, "Adctor手数料", bx + bw - fw, by + 8, fw, 22, { size: 16, bold: true, color: COL.white, align: "center" });
  T(s, "料率 未定", bx + bw - fw, by + 30, fw, 18, { size: 12, color: COL.white, align: "center" });
  // 括弧（売上の範囲）
  line(s, bx + bw - fw, by + bh + 8, bx + bw - fw, by + bh + 16, { color: COL.ink, w: 0.75 });
  line(s, bx + bw - fw, by + bh + 16, R, by + bh + 16, { color: COL.ink, w: 0.75 });
  line(s, R, by + bh + 8, R, by + bh + 16, { color: COL.ink, w: 0.75 });
  T(s, "＝ プラットフォーム売上", R - 300, by + bh + 22, 300, 20, { size: 15, align: "right", font: JPM });
  // 定義表
  const defs = [
    ["取引額（GMV）", "合意条件にもとづく請求額の合計。Adctorの売上ではない。"],
    ["プラットフォーム売上", "取引額のうち、Adctorの手数料にあたる部分。"],
    ["入金", "買い手から実際に振り込まれた額。請求額と一致するとは限らない。"],
    ["分配", "入金から手数料を除き、提供企業へ支払う額。"],
    ["利益", "売上から運営費用を差し引いた額。本資料では試算しない。"],
  ];
  const ty = 278;
  line(s, L, ty, R, ty, { color: COL.ink, w: 0.75 });
  defs.forEach(([k, v], i) => {
    const y = ty + i * 40;
    T(s, k, L, y + 10, 210, 22, { size: 16, bold: true });
    T(s, v, L + 220, y + 10, CW - 220, 22, { size: 16 });
    line(s, L, y + 40, R, y + 40, { color: COL.rule });
  });
}

// 14 扉03
divider("03", "実証", "1対1対1の初回PoCで、\n請求から分配までを確かめる", "03 実証");

// 15 初回PoC（p.3型：大きな数字＋定義）
{
  const s = content("CH03", "03 実証", "初回PoCは、1対1対1の最小構成で行う",
    "すべて計画（2026年11月時点）。買い手・提供企業・データ・契約・入金はいずれも未確定。");
  status(s, L, 102, "計画（未実施）", "solid");
  const nums = [["買い手", "1", "社", "データを利用する企業"], ["提供企業", "1", "社", "データを提供する企業"], ["データ", "1", "種類", "記録・請求の対象とするデータ"]];
  nums.forEach(([lab, n, u, def], i) => {
    const x = L + i * 282;
    T(s, lab, x, 136, 250, 26, { size: 20, bold: true });
    s.addText([
      { text: n, options: { fontFace: ENX, fontSize: 72, color: COL.blue } },
      { text: " " + u, options: { fontFace: JP, bold: true, fontSize: 30, color: COL.blue } },
    ], { x: P(x), y: P(160), w: P(250), h: P(92), margin: 0, valign: "bottom", isTextBox: true, lang: "ja-JP" });
    T(s, def, x, 262, 250, 22, { size: 16, color: COL.sub });
    if (i > 0) line(s, x - 16, 140, x - 16, 290, { color: COL.rule });
  });
  line(s, L, 318, R, 318, { color: COL.ink, w: 0.75 });
  T(s, "検証すること", L, 336, 200, 24, { size: 18, bold: true });
  const steps = ["条件と価格の\n合意", "請求", "実際の入金", "提供企業への\n分配"];
  steps.forEach((t, i) => {
    const x = L + i * 126;
    T(s, String(i + 1).padStart(2, "0"), x, 370, 40, 18, { font: EN, size: 13, color: COL.sub, bold: true });
    T(s, t, x, 390, 114, 50, { size: 17, ls: 1.3, font: JPM });
  });
  line(s, 604, 336, 604, 470, { color: COL.rule, w: 0.75 });
  T(s, "方法", 628, 336, 200, 24, { size: 18, bold: true });
  T(s, "決済：銀行振込\n照合：手動\n記録：ファイル取得記録・CSV", 628, 370, 269, 96, { size: 17, ls: 1.5, font: JPM });
}

// 16 次の判断
{
  const s = content("CH03", "03 実証", "PoCの結果をもとに、3つを判断する",
    "判断の時期・判断者は未定。各段階の基準は検討案で、PoC開始前に確定させる。");
  const gates = [
    ["01", "参加企業と条件の確定", "買い手・提供企業・データ、\n利用条件と価格の合意", "PoC開始前", "solid"],
    ["02", "請求から分配までの実務", "請求額・入金額・分配額の\n一致、照合にかかった作業", "PoC中に検証", "solid"],
    ["03", "次の段階に進むか", "手数料率の承認、\n対象の拡大、自動化の要否", "PoC後に判断", "future"],
  ];
  const y0 = 150, w = 250;
  line(s, L, y0, R, y0, { color: COL.ink, w: 0.75 });
  gates.forEach(([n, h, d, when, kind], i) => {
    const x = L + i * 282;
    circle(s, x + 6, y0, 6, { fill: kind === "future" ? COL.white : COL.blue, lc: kind === "future" ? COL.sub : COL.blue, lw: 1 });
    T(s, n, x, 116, 60, 22, { font: EN, size: 16, bold: true, color: COL.blue });
    T(s, h, x, 176, w, 34, { size: 22, bold: true, ls: 1.3 });
    T(s, "判断の材料", x, 224, w, 18, { size: 13, color: COL.sub, font: JPM });
    T(s, d, x, 246, w, 90, { size: 19, ls: 1.4 });
    line(s, x, 350, x + w, 350, { color: COL.rule });
    status(s, x, 362, when, kind);
  });
  T(s, "→", R - 30, y0 - 14, 30, 24, { size: 18, color: COL.ink, align: "right" });
  line(s, L, 410, R, 410, { color: COL.ink, w: 0.75 });
  T(s, "共通の前提", L, 424, 160, 24, { size: 17, bold: true });
  T(s, "各段階で「何をもって可とするか」を、PoC開始前に参加企業と文書で合意する。", L + 160, 424, CW - 160, 50, { size: 17, ls: 1.35 });
}

// 17 補足A 現行と将来案
pres.addSection({ title: "補足" });
{
  const s = content("APX", "補足", "A　現行と将来案の比較",
    "将来案はいずれも、許諾・法務・接続条件の確認を前提とする検討段階。連携・購入・出資の事実はない。");
  const tw = 600, lw = 130, cw = (tw - lw) / 2, top = 108;
  T(s, "項目", L, top + 8, lw, 20, { size: 14, color: COL.sub, font: JPM });
  T(s, "初回PoC（計画）", L + lw + 14, top + 4, cw - 20, 26, { size: 19, bold: true, color: COL.blue });
  T(s, "将来案（条件付き）", L + lw + cw + 14, top + 4, cw - 20, 26, { size: 19, bold: true });
  line(s, L, top + 38, L + tw, top + 38, { color: COL.ink, w: 0.75 });
  const rows = [
    ["対象データ", "1種類", "複数種類"],
    ["記録の範囲", "ファイル取得記録", "引用の検出"],
    ["請求", "CSVから作成", "自動請求"],
    ["決済", "銀行振込", "x402、円建てステーブルコイン等"],
    ["照合・分配", "手動", "自動化"],
    ["課金の単位", "取得（ファイル）", "引用課金"],
  ];
  rows.forEach(([k, a, b], i) => {
    const y = top + 38 + i * 54;
    T(s, k, L, y, lw - 10, 54, { size: 16, bold: true, valign: "middle" });
    T(s, a, L + lw + 14, y, cw - 24, 54, { size: 16, valign: "middle" });
    T(s, b, L + lw + cw + 14, y, cw - 24, 54, { size: 16, color: COL.sub, ls: 1.2, valign: "middle" });
    line(s, L, y + 54, L + tw, y + 54, { color: COL.rule });
  });
  line(s, L + lw + cw, top + 4, L + lw + cw, top + 38 + 6 * 54 - 6, { color: COL.rule, dash: "dash" });
  // 片側の補足
  const nx = L + tw + 30;
  line(s, nx - 15, top, nx - 15, 470, { color: COL.rule, w: 0.75 });
  T(s, "補足", nx, top + 4, 180, 24, { size: 16, bold: true });
  T(s, "将来案の各項目は、\n許諾・法務・接続条件を\n満たす場合に限り\n検討する。\n\n取引先・接続先の名称や\nロゴは、承認を得るまで\n掲載しない。", nx, top + 40, R - nx, 300, { size: 15, ls: 1.5 });
}

// 18 補足B 料金計算の定義
{
  const s = content("APX", "補足", "B　料金計算の定義",
    "検討案。単価・手数料率・締め日・端数処理は未承認のため値を置かない。");
  const fx = L, fw = 520;
  const fm = [
    ["請求額", "＝ Σ（取得件数 × 合意単価）", "定額契約の場合は合意額をそのまま請求額とする"],
    ["手数料", "＝ 入金額 × 手数料率", "手数料＝プラットフォーム売上。率は未定"],
    ["分配額", "＝ 入金額 − 手数料", "未入金分は分配しない（案）"],
  ];
  fm.forEach(([k, f, note], i) => {
    const y = 116 + i * 116;
    T(s, k, fx, y, 130, 34, { size: 24, bold: true });
    T(s, f, fx + 130, y, fw - 130, 34, { size: 24, font: JPM });
    T(s, note, fx + 130, y + 44, fw - 130, 24, { size: 15, color: COL.sub });
    line(s, fx, y + 84, fx + fw, y + 84, { color: COL.rule });
  });
  const nx = 650;
  line(s, nx - 24, 116, nx - 24, 470, { color: COL.rule, w: 0.75 });
  T(s, "合意で決めること", nx, 116, 247, 24, { size: 17, bold: true });
  const list = ["単価、または定額", "締め単位（月次を想定）", "入金期日と振込手数料の負担", "端数処理", "手数料率（要承認）"];
  list.forEach((t, i) => {
    T(s, String(i + 1).padStart(2, "0"), nx, 156 + i * 58, 30, 20, { font: EN, size: 13, bold: true, color: COL.sub });
    T(s, t, nx + 34, 154 + i * 58, 213, 50, { size: 16, ls: 1.3 });
  });
}

// 19 補足C 根拠の区分と未掲載事項
{
  const s = content("APX", "補足", "C　根拠の区分と未掲載事項",
    "詳細は out/未反映項目.md。数値は、検証または承認が済んだものから順に追加する。");
  const top = 112, half = (CW - 40) / 2;
  T(s, "本資料の根拠の区分", L, top, half, 24, { size: 18, bold: true });
  line(s, L, top + 34, L + half, top + 34, { color: COL.ink, w: 0.75 });
  const ev = [
    ["実績", "実施・確定済みの事実", "掲載なし"],
    ["外部公表", "第三者の一次公表", "p.3"],
    ["検討案", "社内の計画・案・仮説", "p.3〜18"],
    ["試算", "承認済みの仮定による計算", "掲載なし"],
  ];
  ev.forEach(([k, d, where], i) => {
    const y = top + 34 + i * 62;
    T(s, k, L, y + 14, 100, 24, { size: 17, bold: true });
    T(s, d, L + 100, y + 14, 180, 40, { size: 15, ls: 1.3 });
    T(s, where, L + 284, y + 14, half - 284, 24, { size: 15, color: COL.sub, align: "right" });
    line(s, L, y + 62, L + half, y + 62, { color: COL.rule });
  });
  const rx = L + half + 40;
  line(s, rx - 20, top, rx - 20, 470, { color: COL.rule, w: 0.75 });
  T(s, "載せていないもの", rx, top, half, 24, { size: 18, bold: true });
  line(s, rx, top + 34, R, top + 34, { color: COL.ink, w: 0.75 });
  const nos = [
    ["市場規模", "分母・対象・算式・出典を検証できていない"],
    ["手数料率・単価", "承認済みの仮定がない"],
    ["取引先の名称・ロゴ", "掲載の承認がない"],
    ["旧資料の数値", "原本（29ページ）が未入手"],
  ];
  nos.forEach(([k, d], i) => {
    const y = top + 34 + i * 62;
    T(s, k, rx, y + 14, 170, 24, { size: 17, bold: true });
    T(s, d, rx + 170, y + 14, half - 170, 44, { size: 15, ls: 1.3 });
    line(s, rx, y + 62, R, y + 62, { color: COL.rule });
  });
}

pres.writeFile({ fileName: OUT }).then(async (f) => {
  try {
    const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
    await applyTheme(f, {
      name: "Adctor TB", headFontFace: JP, bodyFontFace: JP,
      colors: { dk1: "111318", lt1: "FFFFFF", dk2: "667085", lt2: "F8F7F6", accent1: "1762E8", accent2: "EAF1FF", accent3: "DDE2EA", accent4: "667085", accent5: "111318", accent6: "9DB8F0", hlink: "1762E8", folHlink: "667085" },
    });
  } catch (e) { console.warn("theme not applied:", e.message); }
  console.log("wrote", f);
});
