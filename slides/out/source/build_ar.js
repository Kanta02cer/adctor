// AirReach 営業資料（お客様・企業のマーケティング担当者向け／AI検索対策）
// 生成: build_ar.sh（make_assets_ar.py → make_screens_ar.js → このスクリプト）
// 方針（v7 と同じ）：文字は20pt以上／ふだんの言葉＋注釈／TB配色で統一／重なりのある立体的な配置
// 内容の出所：当社サイト（index.html 新版）、当社資料「AirReach AI検索対策サービスのご案内」（2026年11月版）、登記簿
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.resolve(__dirname, "..", "AirReach_営業資料_v1.pptx");
const A5 = (n) => path.join(__dirname, "assets_v5", n);
const A7 = (n) => path.join(__dirname, "assets_v7", n);
const AR = (n) => path.join(__dirname, "assets_ar", n);

const C = {
  white: "FFFFFF", ink: "111318", key: "1762E8", navy: "0B2F7A", deep: "0E46B8", mid: "4C86EE", light: "8DB3F4",
  tint: "EAF1FF", page: "F5F8FE", sub: "667085", rule: "DDE2EA", acc: "FFB020", accSoft: "FFF3D6", accText: "8A5300", gray: "A0A8B5",
};
const JP = "Noto Sans JP", EN = "Inter", ENS = "Inter SemiBold";
const MIN = 20, P = (v) => v / 72;
const LOGO_R = 956 / 317; // AirReach ロゴの縦横比（切り抜き後）
let N = 0;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Trillion Bank";
pres.company = "Trillion Bank";
pres.title = "AirReach サービスのご案内";
pres.theme = { headFontFace: JP, bodyFontFace: JP };

// ---------- 部品 ----------
function T(s, text, x, y, w, h, o = {}) {
  const size = o.size || 20;
  if (size < MIN) throw new Error(`font ${size}pt < ${MIN} on slide ${N}`);
  if (Array.isArray(text)) text.forEach((r) => { if (r.options && r.options.fontSize && r.options.fontSize < MIN) throw new Error(`run < ${MIN} on slide ${N}`); });
  s.addText(text, { x: P(x), y: P(y), w: P(w), h: P(h), fontFace: o.font || JP, fontSize: size, color: o.color || C.ink, bold: !!o.bold,
    align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true, lang: "ja-JP", fit: "none", lineSpacingMultiple: o.ls || 1.35 });
}
const em = (t, o = {}) => ({ text: t, options: { color: o.color || C.key, bold: true, highlight: o.hl, fontSize: o.size, fontFace: o.font } });
const tx = (t, o = {}) => ({ text: t, options: { color: o.color, bold: o.bold, fontSize: o.size, fontFace: o.font } });
const lines = (arr) => arr.flatMap((ln, i) => { const rs = (Array.isArray(ln) ? ln : [ln]).map((r) => (typeof r === "string" ? { text: r, options: {} } : { text: r.text, options: { ...r.options } })); if (i < arr.length - 1) rs[rs.length - 1].options.breakLine = true; return rs; });
function rect(s, x, y, w, h, o = {}) {
  const r = o.r || 0;
  s.addShape(r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, { x: P(x), y: P(y), w: P(w), h: P(h), rectRadius: r ? P(r) : undefined,
    fill: o.fill ? { color: o.fill, transparency: o.tr } : { type: "none" }, line: o.lc ? { color: o.lc, width: o.lw || 1, dashType: o.dash || "solid" } : { type: "none" },
    shadow: o.shadow ? { type: "outer", color: "0B2F7A", opacity: o.shadow === 2 ? 0.28 : 0.16, blur: o.shadow === 2 ? 16 : 10, offset: o.shadow === 2 ? 8 : 4, angle: 90 } : undefined });
}
function oval(s, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.OVAL, { x: P(x), y: P(y), w: P(w), h: P(h), fill: { color: o.fill || C.key }, line: o.lc ? { color: o.lc, width: o.lw || 2 } : { type: "none" },
    shadow: o.shadow ? { type: "outer", color: "0B2F7A", opacity: 0.25, blur: 12, offset: 6, angle: 90 } : undefined });
}
function shape(s, kind, x, y, w, h, o = {}) { s.addShape(pres.shapes[kind], { x: P(x), y: P(y), w: P(w), h: P(h), rotate: o.rot, fill: { color: o.fill || C.key }, line: { type: "none" } }); }
function line(s, x1, y1, x2, y2, o = {}) {
  s.addShape(pres.shapes.LINE, { x: P(Math.min(x1, x2)), y: P(Math.min(y1, y2)), w: P(Math.abs(x2 - x1)), h: P(Math.abs(y2 - y1)), flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.color || C.rule, width: o.w || 1, dashType: o.dash || "solid", endArrowType: o.arrow ? "triangle" : undefined } });
}
const img = (s, f, x, y, w, h) => s.addImage({ path: f, x: P(x), y: P(y), w: P(w), h: P(h) });
const dev = (s, f, x, y, w) => img(s, AR(f), x, y, w, w * (f.includes("laptop") ? 1145 / 1640 : 1305 / 680));
const logoChip = (s, x, y, w) => { rect(s, x - 16, y - 12, w + 32, w / LOGO_R + 24, { fill: C.white, r: 14, shadow: 2 }); img(s, AR("airreach_logo.png"), x, y, w, w / LOGO_R); };
const logo = (s, x, y, w, white) => img(s, AR(white ? "airreach_logo_white.png" : "airreach_logo.png"), x, y, w, w / LOGO_R);
function tab(s, text, o = {}) {
  const w = [...text].reduce((a, ch) => a + (/[ -~]/.test(ch) ? 11.5 : 20), 0) + 26;
  rect(s, 22, 14, w, 34, { fill: C.white, lc: C.ink, lw: 1 });
  T(s, text, 22, 14, w, 34, { size: 20, align: "center", valign: "middle", ls: 1 });
}
function gpill(s, text, x, y, w, h = 40) { img(s, A7("pill.png"), x, y, w, h); T(s, text, x, y, w, h, { size: 20, bold: true, color: C.navy, align: "center", valign: "middle", ls: 1 }); }
function num(s, n, x, y, d = 44, o = {}) { oval(s, x, y, d, d, { fill: o.fill || C.key, shadow: true }); T(s, String(n), x, y, d, d, { font: ENS, size: o.size || 22, color: o.color || C.white, align: "center", valign: "middle", ls: 1 }); }
function note(s, text, o = {}) { T(s, text, o.x || 60, o.y || 480, o.w || 820, 28, { size: 20, color: o.color || C.sub, ls: 1.1 }); }
function head(s, text, o = {}) { T(s, text, o.x || 60, o.y || 60, o.w || 840, o.h || 44, { size: o.size || 30, bold: true, ls: 1.35, align: o.align, color: o.color }); }

// ---------- 枠 ----------
const pageNum = (light) => ({ x: P(880), y: P(498), w: P(60), h: P(28), fontFace: EN, fontSize: 20, color: light ? C.sub : C.white, align: "right", margin: 0, valign: "middle" });
const mark = (light) => ({ image: { x: P(890), y: P(18), w: P(48), h: P(48 * 317 / 141), path: AR(light ? "airreach_mark.png" : "airreach_mark_white.png") } });
pres.defineSlideMaster({ title: "AR_WHITE", background: { color: C.white }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(true) });
pres.defineSlideMaster({ title: "AR_LIGHT", background: { color: C.page }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(true) });
pres.defineSlideMaster({ title: "AR_BLUE", background: { color: C.key }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(false) });
pres.defineSlideMaster({ title: "AR_BARE", background: { color: C.white }, objects: [] });
function slide(master, sec, bg) { N += 1; const s = pres.addSlide({ masterName: master, sectionTitle: sec }); if (bg) s.background = { path: A7(bg) }; return s; }
function chapter(n, en, jp, sub, devices, sec) {
  pres.addSection({ title: sec });
  const s = slide("AR_WHITE", sec, "hero_sky.jpg");
  img(s, A7("band.png"), 40, 24, 920, 58);
  rect(s, 20, 24, 64, 46, { fill: C.white, lc: C.ink, lw: 1.25 });
  T(s, String(n).padStart(2, "0"), 20, 24, 64, 46, { font: ENS, size: 28, align: "center", valign: "middle", ls: 1 });
  const ew = en.length * 25 + 60;
  rect(s, 20, 70, ew, 70, { fill: C.white, lc: C.ink, lw: 1.25, shadow: 1 });
  T(s, en, 38, 70, ew - 36, 70, { font: EN, size: 44, valign: "middle", ls: 1 });
  const jw = [...jp].length * 28 + 34;
  rect(s, 20, 140, jw, 46, { fill: C.white, lc: C.ink, lw: 1.25 });
  T(s, jp, 20, 140, jw, 46, { size: 26, bold: true, align: "center", valign: "middle", ls: 1 });
  T(s, sub, 40, 420, 460, 80, { size: 26, bold: true, color: C.white, ls: 1.4 });
  devices.forEach(([f, x, y, w]) => dev(s, f, x, y, w));
  return s;
}

// =====================================================================
// 1 表紙
pres.addSection({ title: "表紙" });
{
  const s = slide("AR_BARE", "表紙", "cover.jpg");
  logoChip(s, 64, 46, 210);
  T(s, "AI検索で、\n選ばれる会社へ。", 64, 140, 470, 130, { size: 44, bold: true, color: C.white, ls: 1.3 });
  T(s, "AI検索対策サービスのご案内", 64, 318, 460, 34, { size: 24, bold: true, color: C.navy, ls: 1 });
  dev(s, "dev_laptop_report.png", 520, 120, 420);
  dev(s, "dev_phone_answer.png", 820, 200, 130);
  img(s, A5("tb_logo_black.png"), 64, 470, 220, 220 / 11.08);
  T(s, "2026.11.25", 760, 466, 180, 28, { font: EN, size: 20, color: C.navy, align: "right", ls: 1 });
}

// 2 目次
{
  const s = slide("AR_WHITE", "表紙");
  rect(s, 48, 40, 186, 62, { fill: C.white, lc: C.key, lw: 2 });
  T(s, "INDEX", 48, 40, 186, 62, { font: ENS, size: 40, color: C.key, align: "center", valign: "middle", ls: 1 });
  rect(s, 48, 102, 80, 36, { fill: C.key });
  T(s, "目次", 48, 102, 80, 36, { size: 22, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  [["01", "AI検索で起きていること", "Why AI Search", "04"], ["02", "AirReachとは", "What We Do", "08"], ["03", "使い方と画面", "How It Works", "13"], ["04", "実績・料金・導入", "Case & Pricing", "18"]].forEach(([n, jp, en, pg], i) => {
    const y = 80 + i * 100;
    T(s, n, 330, y, 60, 34, { font: ENS, size: 26, color: C.key, ls: 1 });
    T(s, jp, 390, y - 2, 330, 38, { size: 28, bold: true, ls: 1 });
    T(s, en, 390, y + 38, 300, 26, { font: EN, size: 20, color: C.sub, ls: 1 });
    line(s, 730, y + 22, 830, y + 22, { color: C.light, dash: "sysDot", w: 1.5 });
    T(s, "P." + pg, 840, y + 6, 80, 30, { font: EN, size: 22, ls: 1 });
  });
}

// 3 こんなお悩み
{
  const s = slide("AR_LIGHT", "表紙");
  tab(s, "こんなお悩みはありませんか");
  head(s, [tx("AIに聞くと、"), em("自社ではなく他社が紹介される", { hl: C.accSoft, color: C.ink })]);
  const items = [["ChatGPTなどで調べると、\n競合の名前ばかり出てくる"], ["自社の強みや料金が、\nAIの回答に出てこない"], ["何から手をつければよいか、\nわからない"], ["広告費を払い続けても、\n手元に何も残らない"]];
  items.forEach(([t], i) => {
    const x = 60 + (i % 2) * 430, y = 130 + Math.floor(i / 2) * 150, w = 400;
    rect(s, x + 10, y + 10, w, 120, { fill: C.tint, r: 14 });
    rect(s, x, y, w, 120, { fill: C.white, r: 14, shadow: 2 });
    num(s, "?", x - 16, y - 16, 48, { fill: i === 3 ? C.acc : C.key, color: i === 3 ? C.ink : C.white });
    T(s, t, x + 44, y, w - 64, 120, { size: 22, bold: true, valign: "middle", ls: 1.4 });
  });
  img(s, AR("toriuru_body.png"), 820, 380, 110, 110 * 238 / 218);
  note(s, "AirReachは、こうしたお悩みに応えるサービスです。", { y: 466, w: 740 });
}

// ===== 01 =====
chapter(1, "Why AI Search", "AI検索で起きていること", "お客様は、AIに聞いて\nお店や会社を選び始めています。", [["dev_phone_answer.png", 640, 120, 210]], "01 AI検索");

// 5 探し方が変わった（スマホのAI回答＋流れ）
{
  const s = slide("AR_WHITE", "01 AI検索");
  tab(s, "お客様の探し方");
  rect(s, 20, 70, 330, 420, { fill: C.tint, r: 24 });
  dev(s, "dev_phone_answer.png", 40, 64, 260);
  head(s, "AIの答えから、\n比べる候補が決まります", { x: 380, w: 540, h: 92 });
  const st = [["お客様がAIに質問", "「近くで評判のいい\n工務店は？」", C.key], ["AIが数社を紹介", "名前・料金・口コミを\nまとめて答える", C.key], ["候補の中から比べる", "紹介されない会社は、\n比べる候補に入らない", C.acc]];
  st.forEach(([h, d, col], i) => {
    const y = 176 + i * 100;
    rect(s, 380, y, 520, 86, { fill: C.white, lc: C.rule, r: 12, shadow: 1 });
    num(s, i + 1, 362, y + 20, 44, { fill: col, color: i === 2 ? C.ink : C.white });
    T(s, h, 422, y + 8, 250, 70, { size: 22, bold: true, color: i === 2 ? C.accText : C.key, valign: "middle", ls: 1.3 });
    T(s, d, 660, y + 8, 230, 70, { size: 20, valign: "middle", ls: 1.35 });
  });
  note(s, "画面は説明のための見本です。", { x: 380, w: 520 });
}

// 6 AIの回答に注目が集まる（大きな数字）
{
  const s = slide("AR_BLUE", "01 AI検索", "hero_blue.jpg");
  tab(s, "AIの回答に注目が集まる");
  T(s, "AIのまとめがある検索画面では、\n多くの人がまず、AIのまとめを読みます", 60, 64, 840, 92, { size: 30, bold: true, color: C.white, ls: 1.35 });
  const nums = [["59", "%", "視線がAIのまとめに\n集まった割合", "目の動きを測った調査\n（36人）"], ["9", "%", "ふつうの検索結果に\n視線が集まった割合", "同じ調査"], ["8", "%", "AIのまとめがあるとき、\n外のサイトを開いた割合", "米国の6万8千件の\n検索の調査"]];
  nums.forEach(([v, u, k, src], i) => {
    const x = 60 + i * 284, y = 186, w = 260, hot = i === 0;
    rect(s, x, y, w, 270, { fill: hot ? C.white : C.navy, tr: hot ? 0 : 30, r: 14, shadow: hot ? 2 : undefined });
    s.addText([{ text: v, options: { fontFace: EN, bold: true, fontSize: 80, color: hot ? C.key : C.white } }, { text: u, options: { fontFace: EN, bold: true, fontSize: 36, color: hot ? C.key : C.white } }],
      { x: P(x), y: P(y + 14), w: P(w), h: P(104), margin: 0, align: "center", valign: "middle", isTextBox: true });
    T(s, k, x + 16, y + 120, w - 32, 64, { size: 20, bold: true, color: hot ? C.ink : C.white, align: "center", ls: 1.35 });
    T(s, src, x + 16, y + 196, w - 32, 60, { size: 20, color: hot ? C.sub : C.light, align: "center", ls: 1.3 });
  });
  note(s, "出典：Allawati ほか（SIGIR 2026）、Pew Research Center（2025）。調査ごとに条件が違うため、数字は単純に比べられません。", { color: C.white, y: 470, w: 840 });
}

// 7 広告費と資産
{
  const s = slide("AR_LIGHT", "01 AI検索");
  tab(s, "広告費の考え方");
  head(s, [tx("毎月の広告費、"), em("手元に残っていますか？", { hl: C.accSoft, color: C.ink })]);
  const col = (x, title, hot, items, foot) => {
    rect(s, x + 10, 140, 400, 310, { fill: hot ? C.tint : C.rule, r: 14 });
    rect(s, x, 128, 400, 310, { fill: C.white, r: 14, shadow: 2 });
    rect(s, x + 24, 110, 200, 40, { fill: hot ? C.key : C.sub, r: 20, shadow: 1 });
    T(s, title, x + 24, 110, 200, 40, { size: 22, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    items.forEach((t, i) => { T(s, (hot ? "○ " : "× ") + t, x + 28, 172 + i * 56, 360, 48, { size: 22, bold: hot, color: hot ? C.ink : C.sub, valign: "middle", ls: 1.2 }); });
    rect(s, x + 20, 352, 360, 66, { fill: hot ? C.accSoft : C.page, r: 10 });
    T(s, foot, x + 20, 352, 360, 66, { size: 22, bold: true, color: hot ? C.accText : C.sub, align: "center", valign: "middle", ls: 1.3 });
  };
  col(60, "広告", false, ["止めると、表示も止まる", "払うほど、費用が増える", "ページは手元に残らない"], "費用として消えていく");
  col(500, "AirReach", true, ["整えた情報は、サイトに残る", "AIが読める形で、積み上がる", "同じ質問で、効果を確かめる"], "自社の資産として積み上がる");
  shape(s, "RIGHT_ARROW", 466, 256, 30, 40, { fill: C.acc });
}

// ===== 02 =====
chapter(2, "What We Do", "AirReachとは", "AIの回答で、自社が\nどう紹介されるかを知り、整える。", [["dev_laptop_report.png", 470, 110, 470]], "02 AirReachとは");

// 9 AirReachとは（定義＋循環）
{
  const s = slide("AR_WHITE", "02 AirReachとは");
  tab(s, "AirReachとは");
  logo(s, 60, 66, 230);
  T(s, lines([[tx("AIの回答で、"), em("自社がどう紹介されるか", { hl: C.accSoft, color: C.ink })], "を測り、直し、また測るサービスです。"]), 60, 156, 500, 96, { size: 24, bold: true, ls: 1.5 });
  T(s, "広告の枠を買うサービスではありません。\nAIが読み取りやすいように、\nホームページの情報や記事を整えます。", 60, 268, 470, 110, { size: 22, ls: 1.5 });
  T(s, "対応するAI：ChatGPT・Gemini・Claude・Perplexity など", 60, 404, 470, 60, { size: 20, color: C.sub, ls: 1.35 });
  // 循環
  const cx = 700, cy = 300, r = 120;
  oval(s, cx - r, cy - r, 2 * r, 2 * r, { fill: C.tint });
  oval(s, cx - 70, cy - 70, 140, 140, { fill: C.key, shadow: true });
  T(s, "同じ質問で\nくり返す", cx - 70, cy - 70, 140, 140, { size: 22, bold: true, color: C.white, align: "center", valign: "middle", ls: 1.25 });
  [["測る", cx - 60, cy - r - 56], ["直す", cx + r - 30, cy + 40], ["測り直す", cx - r - 90, cy + 40]].forEach(([t, x, y], i) => {
    rect(s, x, y, 140, 56, { fill: i === 1 ? C.acc : C.white, lc: i === 1 ? undefined : C.key, lw: 2, r: 28, shadow: 1 });
    T(s, t, x, y, 140, 56, { size: 24, bold: true, color: i === 1 ? C.ink : C.key, align: "center", valign: "middle", ls: 1 });
  });
}

// 10 3つの使い方
{
  const s = slide("AR_LIGHT", "02 AirReachとは");
  tab(s, "AirReachの使い方");
  head(s, "目的に合わせて、3つの使い方があります");
  const cards = [["01", "無料診断", "まず知りたい", "アドレスを入れるだけ。\nAIでの見え方が、\n約30秒でわかります。", "無料"], ["02", "コンサルティング", "一緒に進めたい", "質問づくりから改善、\n測り直しまで、\n担当者と一緒に進めます。", "月5万円〜"], ["03", "ツール（Tools）", "自分で進めたい", "チャットで話しかけて、\n下書きと承認を\n進めます。", "見積り"]];
  cards.forEach(([n, h, who, d, price], i) => {
    const x = 60 + i * 284, y = 140, w = 260;
    rect(s, x + 10, y + 12, w, 318, { fill: i === 0 ? C.accSoft : C.tint, r: 14 });
    rect(s, x, y, w, 318, { fill: C.white, r: 14, shadow: 2 });
    T(s, n, x + 20, y + 16, 60, 40, { font: ENS, size: 32, color: C.key, ls: 1 });
    gpill(s, who, x + 78, y + 18, w - 92, 36);
    T(s, h, x + 20, y + 70, w - 40, 36, { size: 26, bold: true, ls: 1 });
    T(s, d, x + 20, y + 118, w - 40, 120, { size: 20, ls: 1.45 });
    rect(s, x + 20, y + 256, w - 40, 44, { fill: i === 0 ? C.acc : C.page, r: 22 });
    T(s, price, x + 20, y + 256, w - 40, 44, { size: 22, bold: true, color: i === 0 ? C.ink : C.key, align: "center", valign: "middle", ls: 1 });
  });
  note(s, "コンサルティングの料金はP.20、ツールの料金は個別にお見積りします。", { y: 476 });
}

// 11 何を測るか
{
  const s = slide("AR_WHITE", "02 AirReachとは");
  tab(s, "何を測るか");
  head(s, "AIの回答を、同じ条件でくり返し確かめます");
  const m = [["名前が出た割合", "言及率", "AIの答えに、自社の名前が出た割合"], ["出典になった割合", "引用率", "AIが自社サイトを情報の元にした割合"], ["競合と比べた割合", "露出シェア", "競合と比べて、自社の名前が出た割合"]];
  m.forEach(([k, term, d], i) => {
    const y = 132 + i * 114;
    rect(s, 60, y, 440, 102, { fill: C.white, lc: C.rule, r: 12, shadow: 1 });
    num(s, i + 1, 44, y + 24, 44);
    T(s, k, 104, y + 10, 230, 32, { size: 22, bold: true, color: C.key, ls: 1 });
    rect(s, 330, y - 12, 160, 30, { fill: C.accSoft, r: 15, shadow: 1 });
    T(s, term, 330, y - 12, 160, 30, { size: 20, color: C.accText, bold: true, align: "center", valign: "middle", ls: 1 });
    T(s, d, 104, y + 52, 390, 32, { size: 20, ls: 1 });
  });
  dev(s, "dev_laptop_report.png", 500, 120, 440);
  note(s, "黄色のラベルは専門用語です。アクセス数などは、同意を得て確認します。", { y: 482 });
}

// 12 他との違い（比較表）
{
  const s = slide("AR_LIGHT", "02 AirReachとは");
  tab(s, "他のサービスとの違い");
  head(s, [tx("測るだけで終わらず、"), em("ホームページの改修まで任せられます", { hl: C.accSoft, color: C.ink })]);
  const cols = [["", 300], ["測るだけの\nツール", 170], ["分析・提案の\n会社", 170], ["AirReach", 200]];
  const rows = [["AIでの表示を測る", "○", "○", "◎"], ["何から直すかを決める", "△", "○", "◎"], ["ホームページを直す", "×", "△", "◎"], ["記事をつくる", "△", "○", "◎"], ["毎月、測り直す", "○", "○", "◎"]];
  const x0 = 60, y0 = 124, rh = 56;
  rect(s, x0 + 640, y0 - 12, 200, 66 + rows.length * rh + 18, { fill: C.key, r: 14, shadow: 2 });
  let x = x0;
  cols.forEach(([h, w], i) => { if (i) T(s, h, x, y0, w, 60, { size: i === 3 ? 26 : 20, bold: true, font: i === 3 ? EN : JP, color: i === 3 ? C.white : C.sub, align: "center", valign: "middle", ls: 1.2 }); x += w; });
  rows.forEach((r, j) => {
    const y = y0 + 66 + j * rh;
    if (j % 2 === 0) rect(s, x0, y, 640, rh, { fill: C.white });
    T(s, r[0], x0 + 16, y, 284, rh, { size: 22, bold: true, valign: "middle", ls: 1 });
    [1, 2, 3].forEach((c) => { const xx = x0 + [0, 300, 470, 640][c]; T(s, r[c], xx, y, cols[c][1], rh, { size: c === 3 ? 30 : 26, bold: true, color: c === 3 ? C.white : (r[c] === "×" ? C.gray : C.sub), align: "center", valign: "middle", ls: 1 }); });
  });
  note(s, "◎強み　○対応　△条件による　×原則なし（当社による整理）", { y: 476, w: 840 });
}

// ===== 03 =====
chapter(3, "How It Works", "使い方と画面", "話しかけるだけで、\nAI検索対策が進みます。", [["dev_laptop_tools.png", 460, 104, 440], ["dev_phone_chat.png", 800, 190, 150]], "03 使い方と画面");

// 14 無料診断
{
  const s = slide("AR_WHITE", "03 使い方と画面");
  tab(s, "無料診断");
  head(s, [tx("アドレスを入れるだけ。"), em("約30秒", { hl: C.accSoft, color: C.ink }), tx("でわかります")]);
  dev(s, "dev_laptop_diag.png", 20, 110, 560);
  [["1", "ホームページの\nアドレスを入れる"], ["2", "お客様が聞きそうな\n質問を、10問つくる"], ["3", "AIに聞いて、名前が\n出たかを一覧にする"]].forEach(([n, t], i) => {
    const y = 130 + i * 104;
    rect(s, 610, y, 300, 86, { fill: C.tint, r: 12, shadow: 1 });
    num(s, n, 592, y + 20, 44);
    T(s, t, 650, y, 250, 86, { size: 22, bold: true, valign: "middle", ls: 1.3 });
  });
  rect(s, 610, 448, 300, 44, { fill: C.acc, r: 22, shadow: 1 });
  T(s, "無料・登録なしで使えます", 610, 448, 300, 44, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 });
}

// 15 ツール：話しかけるだけ
{
  const s = slide("AR_LIGHT", "03 使い方と画面");
  tab(s, "ツール（Tools）の使い方");
  head(s, "案内役のトリウル君に、話しかけるだけ");
  const st = [["始める", "ホームページの\nアドレスを伝える"], ["聞く", "わからない言葉は\nその場で聞ける"], ["承認する", "入れるのは、\n承認したものだけ"], ["測り直す", "2週間後に、\n同じ質問で測る"]];
  st.forEach(([h, d], i) => {
    const y = 124 + i * 88;
    rect(s, 60, y, 330, 76, { fill: C.white, r: 12, shadow: 1 });
    num(s, i + 1, 44, y + 16, 44, { fill: i === 2 ? C.acc : C.key, color: i === 2 ? C.ink : C.white });
    T(s, h, 104, y, 100, 76, { size: 22, bold: true, color: i === 2 ? C.accText : C.key, valign: "middle", ls: 1 });
    T(s, d, 206, y, 180, 76, { size: 20, valign: "middle", ls: 1.25 });
  });
  dev(s, "dev_laptop_tools.png", 380, 110, 480);
  dev(s, "dev_phone_chat.png", 780, 170, 170);
  img(s, AR("toriuru_body.png"), 400, 418, 76, 76 * 238 / 218);
  T(s, "トリウル君（AirReachの案内役）", 480, 448, 380, 30, { size: 20, bold: true, color: C.navy, ls: 1 });
}

// 16 安心のしくみ
{
  const s = slide("AR_WHITE", "03 使い方と画面");
  tab(s, "安心して使えるしくみ");
  head(s, "専門知識がなくても、安心して進められます");
  const cards = [["承認したものだけ\n反映", "下書きを確かめ、\nOKしたものだけ\nサイトに入ります"], ["わからない言葉は\nその場で聞ける", "聞いた言葉は\n「ことばメモ」に\nたまっていきます"], ["同じ質問で\n測り直す", "直す前と後を、\n同じ10の質問で\n比べます"]];
  cards.forEach(([h, d], i) => {
    const x = 60 + i * 284, y = 140, w = 260;
    rect(s, x + 10, y + 10, w, 284, { fill: C.tint, r: 14 });
    rect(s, x, y, w, 284, { fill: C.white, r: 14, shadow: 2 });
    num(s, i + 1, x - 20, y - 20, 56, { size: 28 });
    T(s, h, x + 22, y + 40, w - 44, 72, { size: 24, bold: true, color: C.key, ls: 1.3 });
    line(s, x + 22, y + 124, x + w - 22, y + 124, { color: C.rule });
    T(s, d, x + 22, y + 140, w - 44, 110, { size: 20, ls: 1.5 });
  });
  rect(s, 60, 454, 840, 40, { fill: C.accSoft, r: 20 });
  T(s, "例：「会社の名札」＝会社の名前や場所をAIに伝える情報。見た目は変わりません", 60, 454, 840, 40, { size: 20, color: C.accText, bold: true, align: "center", valign: "middle", ls: 1 });
}

// 17 計測レポート
{
  const s = slide("AR_LIGHT", "03 使い方と画面");
  tab(s, "計測レポート");
  head(s, [tx("10問のうち、名前が出た質問が"), em("3問 → 7問", { hl: C.accSoft, color: C.ink }), tx("に（例）")]);
  dev(s, "dev_laptop_report.png", 20, 104, 530);
  dev(s, "dev_phone_chat.png", 560, 104, 180);
  rect(s, 760, 160, 170, 260, { fill: C.white, r: 14, shadow: 2 });
  T(s, "直す前", 760, 176, 170, 28, { size: 20, color: C.sub, align: "center", ls: 1 });
  T(s, "3問", 760, 204, 170, 56, { size: 40, bold: true, color: C.gray, align: "center", ls: 1 });
  shape(s, "DOWN_ARROW", 826, 266, 38, 36, { fill: C.acc });
  T(s, "直した後", 760, 308, 170, 28, { size: 20, color: C.sub, align: "center", ls: 1 });
  T(s, "7問", 760, 336, 170, 64, { size: 48, bold: true, color: C.key, align: "center", ls: 1 });
  note(s, "数字は説明のための例です。結果を約束するものではありません。", { y: 470 });
}

// ===== 04 =====
chapter(4, "Case & Pricing", "実績・料金・導入", "導入の例と、\n料金・進め方のご案内。", [["dev_laptop_agency.png", 470, 110, 460]], "04 実績・料金");

// 19 導入事例
{
  const s = slide("AR_WHITE", "04 実績・料金");
  tab(s, "導入の例");
  head(s, "口コミサイトで、\nAIからの表示が増えました", { h: 92 });
  T(s, "口コミ・評判サイト\n「みんなの評判.com」\n（運営：メディくる）", 620, 64, 300, 96, { size: 22, color: C.sub, ls: 1.4 });
  [["表示された回数", "2,227", "回", "約1か月強で"], ["クリックされた回数", "100", "回", "約1か月強で"], ["検索での順位", "1.55", "位", "「セノリッチ 口コミ」"]].forEach(([k, v, u, sub], i) => {
    const x = 60 + i * 284, y = 196, w = 260;
    rect(s, x, y, w, 236, { fill: C.white, lc: C.rule, r: 10, shadow: 1 });
    gpill(s, k, x + 16, y + 16, w - 32, 42);
    s.addText([{ text: v, options: { fontFace: EN, fontSize: 64, color: C.navy } }, { text: u, options: { fontFace: JP, fontSize: 26, bold: true, color: C.navy } }], { x: P(x), y: P(y + 70), w: P(w), h: P(96), margin: 0, align: "center", valign: "middle", isTextBox: true, lang: "ja-JP" });
    T(s, sub, x, y + 176, w, 34, { size: 20, color: C.sub, align: "center", ls: 1 });
  });
  note(s, "期間：2026/7/27〜9/3。結果を約束するものではありません。", { y: 456 });
}

// 20 料金プラン
{
  const s = slide("AR_LIGHT", "04 実績・料金");
  tab(s, "料金プラン");
  head(s, "目的に合わせて選べる、3つのプラン", { y: 56 });
  const plans = [["モニター", "5", "10万円", "1店舗", "月4本", "2社", "1店舗を手軽に改善", false], ["インサイト", "12", "20万円", "最大3店舗", "月8本", "3社", "複数の店舗を改善", true], ["丸投げ", "20", "30万円", "最大10店舗", "月12本", "3社", "計画からまるごと任せる", false]];
  plans.forEach(([n, m, init, shop, art, comp, rec, pop], i) => {
    const x = 60 + i * 284, y = pop ? 130 : 142, w = 260, h = pop ? 344 : 330;
    rect(s, x, y, w, h, { fill: pop ? C.key : C.white, r: 12, shadow: 2 });
    gpill(s, n, x + 20, y - 20, w - 40, 42);
    if (pop) { rect(s, x + w - 70, y + 28, 96, 34, { fill: C.acc, r: 17, shadow: 1 }); T(s, "おすすめ", x + w - 70, y + 28, 96, 34, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 }); }
    const fg = pop ? C.white : C.ink, fk = pop ? C.white : C.key;
    s.addText([{ text: "月", options: { fontFace: JP, fontSize: 22, bold: true, color: fg } }, { text: m, options: { fontFace: EN, fontSize: 60, bold: true, color: fk } }, { text: "万円", options: { fontFace: JP, fontSize: 24, bold: true, color: fk } }], { x: P(x), y: P(y + 30), w: P(w), h: P(80), margin: 0, align: "center", valign: "middle", isTextBox: true, lang: "ja-JP" });
    [["初期費用", init], ["対象", shop], ["記事", art], ["比べる競合", comp]].forEach(([k, v], j) => {
      const yy = y + 116 + j * 34;
      T(s, k, x + 16, yy, 110, 30, { size: 20, color: pop ? C.light : C.sub, ls: 1 });
      T(s, v, x + 110, yy, w - 126, 30, { size: 22, bold: true, color: fg, align: "right", ls: 1 });
    });
    rect(s, x + 16, y + h - 58, w - 32, 44, { fill: pop ? C.white : C.tint, r: 8 });
    T(s, rec, x + 16, y + h - 58, w - 32, 44, { size: 20, bold: true, color: C.navy, align: "center", valign: "middle", ls: 1 });
  });
  note(s, "税抜・12か月契約。対象のAI・初期費用・追加の作業は見積書で決めます。", { y: 486 });
}

// 21 導入の流れ
{
  const s = slide("AR_WHITE", "04 実績・料金");
  tab(s, "導入の流れ");
  head(s, "お申し込みから、毎月の改善まで");
  const st = [["無料診断", "今の見え方を\n確かめる"], ["ご相談", "目的と競合、\nプランを決める"], ["改善の計画", "質問と、直す\n順番を決める"], ["記事・改修", "下書きをつくり、\n承認後に反映"], ["測り直し", "同じ質問で\n効果を確かめる"]];
  const w = 160, g = 10;
  st.forEach(([h, d], i) => {
    const x = 60 + i * (w + g), y = 150, last = i === 4;
    shape(s, i ? "CHEVRON" : "PENTAGON", x, y, w + 18, 64, { fill: last ? C.acc : (i % 2 ? C.mid : C.key) });
    T(s, h, x + 14, y, w - 10, 64, { size: 20, bold: true, color: last ? C.ink : C.white, align: "center", valign: "middle", ls: 1 });
    rect(s, x, y + 84, w, 120, { fill: C.page, r: 10 });
    T(s, d, x + 8, y + 84, w - 16, 120, { size: 20, align: "center", valign: "middle", ls: 1.35 });
  });
  shape(s, "CURVED_UP_ARROW", 560, 380, 300, 60, { fill: C.light });
  T(s, "毎月くり返して、少しずつ良くします", 60, 386, 500, 40, { size: 24, bold: true, color: C.key, ls: 1 });
  note(s, "記事は1本800〜1,500字。人が確認し、修正は1回まで。お客様の承認後に公開します。", { y: 466 });
}

// 22 よくある質問
{
  const s = slide("AR_LIGHT", "04 実績・料金");
  tab(s, "よくある質問");
  head(s, "よくいただくご質問");
  const qa = [["広告を出すサービスですか？", "いいえ。AIが読み取りやすいように、ホームページの情報を整えるサービスです。"], ["AIでの紹介や売上は約束されますか？", "約束はできません。同じ質問で測り直し、変化を数字でお伝えします。"], ["ホームページの見た目は変わりますか？", "「会社の名札」などの裏側の情報は、見た目を変えずに整えられます。"], ["自分たちの作業は多いですか？", "下書きの確認と承認が中心です。直す作業まで当社が受け持てます。"]];
  qa.forEach(([q, a], i) => {
    const y = 120 + i * 88;
    rect(s, 60, y, 840, 78, { fill: C.white, r: 12, shadow: 1 });
    oval(s, 76, y + 17, 44, 44, { fill: C.key }); T(s, "Q", 76, y + 17, 44, 44, { font: ENS, size: 22, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, q, 136, y + 6, 740, 32, { size: 22, bold: true, color: C.key, ls: 1 });
    T(s, a, 136, y + 40, 750, 32, { size: 20, ls: 1 });
  });
}

// 23 制作・広告会社の方へ
{
  const s = slide("AR_WHITE", "04 実績・料金");
  img(s, A7("panel.jpg"), 560, 0, 400, 540);
  tab(s, "制作・広告会社の方へ");
  T(s, "お客様のAI検索対策を、\n一緒にご提案しませんか", 60, 70, 480, 92, { size: 30, bold: true, ls: 1.35 });
  T(s, lines(["Web制作・広告・SEOの会社の方には、", [em("代理店向けのツール", { hl: C.accSoft, color: C.ink }), "をご用意しています。"], "お客様ごとに、直す前と後の", "レポートを並べてお渡しできます。"]), 60, 186, 480, 160, { size: 22, ls: 1.5 });
  rect(s, 60, 368, 380, 46, { fill: C.acc, r: 23, shadow: 1 });
  T(s, "パートナーについてご相談ください", 60, 368, 380, 46, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 });
  dev(s, "dev_laptop_agency.png", 470, 110, 470);
  note(s, "※SEO：検索で見つけてもらう工夫", { y: 470, w: 480 });
}

// 24 会社紹介
{
  const s = slide("AR_LIGHT", "04 実績・料金");
  tab(s, "運営会社");
  img(s, A5("tb_logo_black.png"), 60, 70, 330, 330 / 11.08);
  T(s, "AI検索で選ばれる企業を増やし、\nAIに使われた情報を価値へ変える会社です。", 60, 118, 560, 76, { size: 22, bold: true, ls: 1.45 });
  const rows = [["会社名", "株式会社Trillion Bank"], ["設立", "2025年12月23日"], ["所在地", "東京都千代田区麹町六丁目2番1号"], ["資本金", "1,050万4,000円"]];
  rows.forEach(([k, v], i) => { const y = 214 + i * 46; T(s, k, 60, y, 110, 40, { size: 20, bold: true, color: C.key, valign: "middle", ls: 1 }); T(s, v, 170, y, 450, 40, { size: 20, valign: "middle", ls: 1 }); line(s, 60, y + 44, 620, y + 44, { color: C.rule }); });
  T(s, "出演：令和の虎、Nontitle Season 6 ほか", 60, 412, 560, 30, { size: 20, color: C.sub, ls: 1 });
  [["代表取締役 CEO", "井上 幹太", "ceo"], ["取締役 CSO（営業統括）", "芳賀 翔太", null]].forEach(([r, n, ph], i) => {
    const x = 650, y = 70 + i * 196, w = 280;
    rect(s, x, y, w, 176, { fill: C.white, r: 14, shadow: 2 });
    if (ph) img(s, A5("ceo.jpg"), x + 18, y + 18, 90, 90);
    else { oval(s, x + 18, y + 18, 90, 90, { fill: C.tint }); T(s, "芳", x + 18, y + 18, 90, 90, { size: 40, bold: true, color: C.key, align: "center", valign: "middle", ls: 1 }); }
    T(s, r, x + 120, y + 22, w - 130, 60, { size: 20, color: C.sub, ls: 1.25 });
    T(s, n, x + 120, y + 84, w - 130, 36, { size: 26, bold: true, ls: 1 });
    T(s, i ? "法人営業を統括" : "経営と事業戦略を統括", x + 18, y + 128, w - 36, 34, { size: 20, color: C.key, bold: true, ls: 1 });
  });
  note(s, "出典：登記簿、当社サイト。", { y: 470, w: 560 });
}

// 25 お問い合わせ
{
  const s = slide("AR_BARE", "04 実績・料金", "hero_blue.jpg");
  logoChip(s, 76, 52, 200);
  T(s, "まずは、自社がAIに\nどう紹介されているか\n確かめてみませんか？", 60, 150, 520, 160, { size: 34, bold: true, color: C.white, ls: 1.4 });
  rect(s, 60, 340, 380, 64, { fill: C.acc, r: 32, shadow: 2 });
  T(s, "無料でAI検索診断（約30秒）", 60, 340, 380, 64, { size: 24, bold: true, align: "center", valign: "middle", ls: 1 });
  rect(s, 60, 420, 380, 52, { fill: C.white, r: 26, shadow: 1 });
  T(s, "商談を予約する", 60, 420, 380, 52, { size: 22, bold: true, color: C.key, align: "center", valign: "middle", ls: 1 });
  dev(s, "dev_laptop_diag.png", 470, 120, 460);
  img(s, AR("toriuru_body.png"), 820, 384, 110, 110 * 238 / 218);
  T(s, "株式会社Trillion Bank", 520, 470, 290, 30, { size: 20, bold: true, color: C.white, ls: 1 });
}

pres.writeFile({ fileName: OUT }).then(async (f) => {
  try {
    const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
    await applyTheme(f, { name: "AirReach", headFontFace: JP, bodyFontFace: JP, colors: { dk1: "111318", lt1: "FFFFFF", dk2: "0B2F7A", lt2: "EAF1FF", accent1: "1762E8", accent2: "FFB020", accent3: "0E46B8", accent4: "8DB3F4", accent5: "667085", accent6: "4C86EE", hlink: "1762E8", folHlink: "667085" } });
  } catch (e) { console.warn("theme not applied:", e.message); }
  console.log("wrote", f, "slides", N);
});
