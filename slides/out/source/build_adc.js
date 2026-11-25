// Adctor 資料（投資家・事業連携向け）
// 生成: build_adc.sh（make_screens_adc.js → このスクリプト）
// 方針：文字は20pt以上／ふだんの言葉＋注釈／TB配色で統一（Adctor は濃紺を主に）／重なりのある立体的な配置
// 「構想」「計画」「試算」「実績」を区別して書く。料率・市場規模・取引先名は載せない。
// 内容の出所：当社サイト新版（index.html）、これまでの Adctor 資料（v6/v7）、登記簿、当社資料
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.resolve(__dirname, "..", "Adctor_事業資料_投資家・事業連携_v1.pptx");
const A5 = (n) => path.join(__dirname, "assets_v5", n);
const A7 = (n) => path.join(__dirname, "assets_v7", n);
const AR = (n) => path.join(__dirname, "assets_ar", n);
const AD = (n) => path.join(__dirname, "assets_adc", n);

const C = {
  white: "FFFFFF", ink: "111318", key: "1762E8", navy: "0B2F7A", deep: "0E46B8", mid: "4C86EE", light: "8DB3F4",
  tint: "EAF1FF", page: "F5F8FE", sub: "667085", rule: "DDE2EA", acc: "FFB020", accSoft: "FFF3D6", accText: "8A5300", gray: "A0A8B5", ok: "0E9F6E", okSoft: "E6F6EF",
};
const JP = "Noto Sans JP", EN = "Inter", ENS = "Inter SemiBold";
const MIN = 20, P = (v) => v / 72;
const LOGO_R = 956 / 317;
let N = 0;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Trillion Bank";
pres.company = "Trillion Bank";
pres.title = "Adctor 事業のご説明（投資家・事業連携向け）";
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
const dev = (s, f, x, y, w, dir = AD) => img(s, dir(f), x, y, w, w * (f.includes("laptop") ? 1145 / 1640 : 1305 / 680));
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
pres.defineSlideMaster({ title: "AD_WHITE", background: { color: C.white }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(true) });
pres.defineSlideMaster({ title: "AD_LIGHT", background: { color: C.page }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(true) });
pres.defineSlideMaster({ title: "AD_DARK", background: { color: C.navy }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(false) });
pres.defineSlideMaster({ title: "AD_BARE", background: { color: C.white }, objects: [] });
function slide(master, sec, bg) { N += 1; const s = pres.addSlide({ masterName: master, sectionTitle: sec }); if (bg) s.background = { path: A7(bg) }; return s; }
const wordmark = (s, x, y, size, color) => T(s, "Adctor", x, y, size * 3.4, size * 1.25, { font: EN, bold: true, size, color: color || C.white, ls: 1 });
const tag = (s, text, x, y, w, kind) => { const k = { plan: [C.key, C.white], idea: [C.accSoft, C.accText], est: [C.okSoft, C.ok], fact: [C.ink, C.white] }[kind]; rect(s, x, y, w, 32, { fill: k[0], r: 16 }); T(s, text, x, y, w, 32, { size: 20, bold: true, color: k[1], align: "center", valign: "middle", ls: 1 }); };
function chapter(n, en, jp, sub, devices, sec) {
  pres.addSection({ title: sec });
  const s = slide("AD_DARK", sec, "hero_dark.jpg");
  img(s, A7("band.png"), 40, 24, 920, 58);
  rect(s, 20, 24, 64, 46, { fill: C.white, lc: C.ink, lw: 1.25 });
  T(s, String(n).padStart(2, "0"), 20, 24, 64, 46, { font: ENS, size: 28, align: "center", valign: "middle", ls: 1 });
  const ew = en.length * 25 + 60;
  rect(s, 20, 70, ew, 70, { fill: C.white, lc: C.ink, lw: 1.25, shadow: 1 });
  T(s, en, 38, 70, ew - 36, 70, { font: EN, size: 44, valign: "middle", ls: 1 });
  const jw = [...jp].length * 28 + 34;
  rect(s, 20, 140, jw, 46, { fill: C.white, lc: C.ink, lw: 1.25 });
  T(s, jp, 20, 140, jw, 46, { size: 26, bold: true, align: "center", valign: "middle", ls: 1 });
  T(s, sub, 40, 410, 460, 90, { size: 26, bold: true, color: C.white, ls: 1.4 });
  devices.forEach(([f, x, y, w, dir]) => dev(s, f, x, y, w, dir));
  return s;
}

// =====================================================================
// 1 表紙
pres.addSection({ title: "表紙" });
{
  const s = slide("AD_BARE", "表紙", "cover.jpg");
  wordmark(s, 60, 50, 64);
  T(s, "AIに使われる情報を、\n合意と対価につなげる。", 64, 140, 520, 130, { size: 40, bold: true, color: C.white, ls: 1.35 });
  T(s, "投資家・事業連携の皆さまへ", 64, 318, 440, 34, { size: 24, bold: true, color: C.navy, ls: 1 });
  dev(s, "dev_laptop_dash.png", 520, 110, 420);
  dev(s, "dev_phone_lock.png", 820, 196, 130);
  img(s, A5("tb_logo_black.png"), 64, 470, 220, 220 / 11.08);
  T(s, "2026.11.25", 760, 466, 180, 28, { font: EN, size: 20, color: C.navy, align: "right", ls: 1 });
}

// 2 目次
{
  const s = slide("AD_WHITE", "表紙");
  rect(s, 48, 40, 186, 62, { fill: C.white, lc: C.navy, lw: 2 });
  T(s, "INDEX", 48, 40, 186, 62, { font: ENS, size: 40, color: C.navy, align: "center", valign: "middle", ls: 1 });
  rect(s, 48, 102, 80, 36, { fill: C.navy });
  T(s, "目次", 48, 102, 80, 36, { size: 22, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  [["01", "課題と機会", "Problem", "04"], ["02", "Adctorのしくみ", "How It Works", "09"], ["03", "ビジネスモデル", "Business Model", "16"], ["04", "現在地と計画", "Proof of Concept", "21"], ["05", "チームと会社", "Team", "26"]].forEach(([n, jp, en, pg], i) => {
    const y = 56 + i * 86;
    T(s, n, 330, y, 60, 34, { font: ENS, size: 26, color: C.key, ls: 1 });
    T(s, jp, 390, y - 2, 330, 38, { size: 28, bold: true, ls: 1 });
    T(s, en, 390, y + 38, 300, 26, { font: EN, size: 20, color: C.sub, ls: 1 });
    line(s, 730, y + 22, 830, y + 22, { color: C.light, dash: "sysDot", w: 1.5 });
    T(s, "P." + pg, 840, y + 6, 80, 30, { font: EN, size: 22, ls: 1 });
  });
}

// 3 1ページでわかるAdctor
{
  const s = slide("AD_LIGHT", "表紙");
  tab(s, "1ページでわかるAdctor");
  head(s, [tx("AIの時代に、情報を作った人へ"), em("記録と対価が還る道", { hl: C.accSoft, color: C.ink }), tx("をつくる")], { h: 44, size: 28 });
  const rows = [["課題", "AIは情報を使うが、作った人には記録もお金も残りにくい", C.sub], ["解決", "条件と単価を決め、使われた記録から請求・分配する", C.key], ["現在地", "研究と実証の段階。まず1社×1社×1種類で実証を計画中", C.navy], ["ご相談", "共同実証に参加いただける会社と、投資家の皆さま", C.acc]];
  rows.forEach(([k, v, col], i) => {
    const y = 124 + i * 86;
    rect(s, 150, y, 750, 74, { fill: C.white, r: 12, shadow: 1 });
    rect(s, 60, y - 6, 120, 86, { fill: col, r: 12, shadow: 2 });
    T(s, k, 60, y - 6, 120, 86, { size: 24, bold: true, color: i === 3 ? C.ink : C.white, align: "center", valign: "middle", ls: 1 });
    T(s, v, 200, y, 680, 74, { size: 21, bold: i === 1, valign: "middle", ls: 1.3 });
  });
}

// ===== 01 =====
chapter(1, "Problem", "課題と機会", "AIは情報を使う。\nでも、作った人には何が残るか。", [["dev_phone_answer.png", 640, 110, 210]], "01 課題と機会");

// 5 AIが答える時代
{
  const s = slide("AD_WHITE", "01 課題と機会");
  tab(s, "いま起きていること");
  rect(s, 20, 70, 330, 420, { fill: C.tint, r: 24 });
  dev(s, "dev_phone_answer.png", 40, 64, 260);
  head(s, "AIが答えをまとめるほど、\n元の情報は見えにくくなる", { x: 380, w: 540, h: 92 });
  [["AIが、新聞や専門サイトの\n情報を使って答える", C.key], ["読む人は、元のページを\n開かずに済むことが増える", C.key], ["作った人には、記録も\nお金も残りにくい", C.acc]].forEach(([t, col], i) => {
    const y = 180 + i * 96;
    rect(s, 380, y, 520, 80, { fill: C.white, lc: C.rule, r: 12, shadow: 1 });
    num(s, i + 1, 362, y + 18, 44, { fill: col, color: i === 2 ? C.ink : C.white });
    T(s, t, 420, y, 470, 80, { size: 21, bold: true, color: i === 2 ? C.accText : C.ink, valign: "middle", ls: 1.35 });
  });
  note(s, "右の画面は、出典が示される理想の形（構想・見本）です。", { x: 380, w: 540 });
}

// 6 3つの欠落
{
  const s = slide("AD_LIGHT", "01 課題と機会");
  tab(s, "足りないもの");
  head(s, [tx("データを使う取引に、"), em("3つの経路", { hl: C.accSoft, color: C.ink }), tx("が足りません")]);
  const node = (x, t, d) => { oval(s, x, 196, 170, 170, { fill: C.white, lc: C.mid, lw: 3, shadow: true }); T(s, t, x, 246, 170, 36, { size: 24, bold: true, align: "center", ls: 1 }); T(s, d, x, 284, 170, 56, { size: 20, color: C.sub, align: "center", ls: 1.25 }); };
  node(60, "提供者", "記事・データを\n持つ会社");
  node(730, "利用者", "AIをつくる\n会社");
  [["合意", "条件と価格を先に決める\n方法が少ない"], ["記録", "いつ・何が使われたかを\n両方で確かめにくい"], ["対価", "請求から分配までを\nまとめて扱う型がない"]].forEach(([k, v], i) => {
    const y = 140 + i * 102;
    line(s, 232, y + 46, 728, y + 46, { color: C.mid, w: 2, dash: "dash" });
    rect(s, 250, y + 14, 90, 64, { fill: C.navy, r: 32, shadow: 1 });
    T(s, k, 250, y + 14, 90, 64, { size: 24, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    rect(s, 352, y + 12, 360, 68, { fill: C.white, r: 10, shadow: 1 });
    T(s, v, 366, y + 12, 340, 68, { size: 20, valign: "middle", ls: 1.3 });
  });
  note(s, "破線は「いまは道が整っていない」ことを表します（当社の仮説）。", { y: 474 });
}

// 7 3つの変化
{
  const s = slide("AD_WHITE", "01 課題と機会");
  tab(s, "なぜ今か");
  head(s, "いま、AIと情報の関係に3つの変化があります");
  const cards = [["AIの答えで\n調べものが終わる", "元のページを開かずに\n済む場面が増えている", "当社の見方", "idea"], ["情報を出す側が\n条件を示し始めた", "大手のネット配信\n会社が、AI向けの\n有料の仕組みを発表", "2025年7月の公表", "fact"], ["お金のやりとりの\n仕組みが、まだない", "条件・記録・請求を\nまとめて扱う方法が\nまだ少ない", "当社の見方", "idea"]];
  cards.forEach(([h, b, t, kind], i) => {
    const x = 70 + i * 284, y = 140, w = 252;
    rect(s, x + 10, y + 12, w, 318, { fill: C.tint, r: 12 });
    rect(s, x, y, w, 318, { fill: C.white, r: 12, shadow: 2 });
    num(s, i + 1, x - 22, y - 22, 56, { size: 28, fill: i === 1 ? C.acc : C.navy, color: i === 1 ? C.ink : C.white });
    T(s, h, x + 22, y + 44, w - 44, 70, { size: 22, bold: true, color: C.key, ls: 1.35 });
    line(s, x + 22, y + 126, x + w - 22, y + 126, { color: C.rule });
    T(s, b, x + 22, y + 140, w - 44, 110, { size: 20, ls: 1.5 });
    tag(s, t, x + 22, y + 270, w - 44, kind);
  });
  note(s, "出典：Cloudflare 公式ブログ「Introducing pay per crawl」（2025年7月）", { y: 482 });
}

// 8 いまの選択肢
{
  const s = slide("AD_LIGHT", "01 課題と機会");
  tab(s, "いまの選択肢");
  T(s, [tx("データを持つ会社の選択肢は、\n"), em("「断る」か「そのまま使わせる」か", { hl: C.accSoft, color: C.ink }), tx("に偏っています")], 60, 60, 840, 92, { size: 28, bold: true, ls: 1.4 });
  [["断る", "×", "×"], ["そのまま\n使わせる", "×", "×"], ["1社ずつ\n契約する", "○", "△"], ["条件をつけて\n提供する", "○", "○"]].forEach(([n, money, rec], i) => {
    const hot = i === 3, w = 196, x = 60 + i * 212, y = hot ? 168 : 190;
    rect(s, x, y, w, hot ? 290 : 268, { fill: hot ? C.navy : C.white, lc: hot ? undefined : C.rule, r: 12, shadow: hot ? 2 : 1 });
    T(s, n, x, y + 14, w, 64, { size: 22, bold: true, color: hot ? C.white : C.ink, align: "center", valign: "middle", ls: 1.3 });
    [["お金", money], ["記録", rec]].forEach(([k, v], j) => {
      const yy = y + 94 + j * 82;
      T(s, k, x, yy, w, 26, { size: 20, color: hot ? C.light : C.sub, align: "center", ls: 1 });
      T(s, v, x, yy + 24, w, 50, { font: EN, size: 40, bold: true, color: hot ? C.acc : (v === "×" ? C.gray : C.key), align: "center", valign: "middle", ls: 1 });
    });
    if (hot) { rect(s, x + 28, y - 18, w - 56, 36, { fill: C.acc, r: 18, shadow: 1 }); T(s, "Adctorの案", x + 28, y - 18, w - 56, 36, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 }); }
  });
  note(s, "○：ある　△：契約ごとにばらばら　×：ない（当社による整理）", { y: 482 });
}

// ===== 02 =====
chapter(2, "How It Works", "Adctorのしくみ", "「AIの料金所」として、\n条件・記録・請求をつなぐ。", [["dev_laptop_dash.png", 470, 106, 450]], "02 しくみ");

// 10 Adctorとは
{
  const s = slide("AD_WHITE", "02 しくみ");
  tab(s, "Adctorとは");
  wordmark(s, 60, 64, 44, C.navy);
  T(s, lines(["AIに使われる情報を、", [em("合意と対価", { hl: C.accSoft, color: C.ink }), "につなげる"], "「AIの料金所」です。"]), 60, 122, 470, 120, { size: 24, bold: true, ls: 1.4 });
  T(s, "高速道路の料金所のように、使うときに\n条件を確かめ、記録し、料金を受け取る\n場所をつくります。", 60, 250, 480, 100, { size: 20, ls: 1.45 });
  rect(s, 60, 362, 470, 112, { fill: C.accSoft, r: 12 });
  T(s, "※Pay per Citation\nAIの答えに引用された分だけ払うしくみ。\n当社が目指す形で、いまは研究と検証の段階。", 76, 368, 444, 100, { size: 20, color: C.accText, ls: 1.35 });
  // 3者
  const node = (x, y, t, fill, col) => { oval(s, x, y, 150, 150, { fill, shadow: true }); T(s, t, x, y, 150, 150, { size: 22, bold: true, color: col, align: "center", valign: "middle", ls: 1.25 }); };
  node(560, 90, "情報を\n持つ会社", C.white, C.ink);
  node(760, 90, "AIを\nつくる会社", C.white, C.ink);
  oval(s, 640, 250, 190, 190, { fill: C.navy, shadow: true });
  T(s, "Adctor", 640, 290, 190, 44, { font: EN, size: 32, bold: true, color: C.white, align: "center", ls: 1 });
  T(s, "条件・記録・\n請求と分配", 640, 336, 190, 64, { size: 20, bold: true, color: C.white, align: "center", ls: 1.25 });
  line(s, 640, 230, 670, 262, { color: C.key, w: 2.5, arrow: true }); line(s, 830, 230, 800, 262, { color: C.key, w: 2.5, arrow: true });
}

// 11 4つのステップ
{
  const s = slide("AD_LIGHT", "02 しくみ");
  tab(s, "しくみの全体像");
  head(s, "4つのステップで、情報の使われ方を整えます");
  [["見える化", "AIのアクセスを見る"], ["条件と単価", "条件と単価を公開"], ["合意した会社", "合意した会社が使う"], ["記録から精算", "記録から請求・分配"]].forEach(([h, d], i) => {
    const y = 124 + i * 88;
    rect(s, 60, y, 380, 76, { fill: C.white, r: 12, shadow: 1 });
    num(s, i + 1, 44, y + 16, 44, { fill: i === 3 ? C.acc : C.navy, color: i === 3 ? C.ink : C.white });
    T(s, h, 104, y, 140, 76, { size: 21, bold: true, color: i === 3 ? C.accText : C.key, valign: "middle", ls: 1.2 });
    T(s, d, 244, y, 192, 76, { size: 20, valign: "middle", ls: 1.25 });
  });
  dev(s, "dev_laptop_dash.png", 440, 112, 480);
  note(s, "画面は構想（見本）。4は共同実証で検証中。", { x: 440, w: 480, y: 474 });
}

// 12 見える化
{
  const s = slide("AD_WHITE", "02 しくみ");
  tab(s, "1　見える化");
  head(s, [tx("どのAIが、どれだけ使いに来たかが"), em("ひと目でわかる", { hl: C.accSoft, color: C.ink })]);
  dev(s, "dev_laptop_dash.png", 20, 104, 580);
  dev(s, "dev_phone_lock.png", 590, 110, 190);
  rect(s, 770, 150, 170, 300, { fill: C.white, r: 14, shadow: 2 });
  [["合意済み", C.ok], ["条件を案内", C.accText], ["確認中", C.key]].forEach(([t, col], i) => {
    T(s, t, 784, 170 + i * 90, 150, 30, { size: 20, bold: true, color: col, ls: 1 });
    T(s, ["条件どおりに\n使っている", "名前のない\n自動収集など", "条件を\n確かめている"][i], 784, 200 + i * 90, 150, 56, { size: 20, color: C.sub, ls: 1.2 });
  });
}

// 13 条件と単価
{
  const s = slide("AD_LIGHT", "02 しくみ");
  tab(s, "2　条件と単価");
  head(s, "使い方ごとに、条件と単価を決めて公開します");
  dev(s, "dev_laptop_terms.png", 20, 104, 560);
  [["AIの答えで参照", "答えの材料として使う"], ["要約・引用の表示", "答えの中に内容を出す"], ["AIの学習", "モデルを育てるのに使う"]].forEach(([k, v], i) => {
    const y = 126 + i * 108;
    rect(s, 600, y, 320, 92, { fill: C.white, r: 12, shadow: 1 });
    rect(s, 600, y, 10, 92, { fill: i === 2 ? C.acc : C.navy });
    T(s, k, 626, y + 10, 290, 34, { size: 22, bold: true, color: i === 2 ? C.accText : C.navy, ls: 1 });
    T(s, v, 626, y + 48, 290, 34, { size: 20, ls: 1 });
  });
  note(s, "単価はすべて例です。実際の単価は、提供企業が決めます。", { y: 474 });
}

// 14 AI事業者側
{
  const s = slide("AD_WHITE", "02 しくみ");
  tab(s, "3　合意した会社だけが使う");
  head(s, [tx("AI事業者は、"), em("鍵", { hl: C.accSoft, color: C.ink }), tx("を受け取ってから情報を使います")]);
  dev(s, "dev_laptop_api.png", 20, 104, 520);
  dev(s, "dev_phone_answer.png", 540, 116, 190);
  rect(s, 750, 150, 180, 290, { fill: C.navy, r: 14, shadow: 2 });
  T(s, "使うたびに\n鍵をもらい、\n使った記録が\n残る", 762, 168, 160, 150, { size: 22, bold: true, color: C.white, ls: 1.4 });
  T(s, "答えには\n出典が示される", 762, 334, 160, 70, { size: 20, color: C.acc, bold: true, ls: 1.3 });
  note(s, "※鍵：使ってよいことを示す、短い時間だけ使える合言葉。画面は構想・見本です。", { y: 474 });
}

// 15 記録から精算
{
  const s = slide("AD_LIGHT", "02 しくみ");
  tab(s, "4　記録から請求・分配");
  head(s, [tx("使われた記録 × 単価 ＝ 請求。"), em("ここを共同実証で確かめます", { hl: C.accSoft, color: C.ink })]);
  dev(s, "dev_laptop_settle.png", 20, 104, 560);
  [["利用記録", "いつ・どの会社が・\nどのページを使ったか"], ["請求", "記録と単価から\n金額を出す"], ["分配", "手数料を引いて\n提供企業へ"]].forEach(([k, v], i) => {
    const y = 112 + i * 120;
    rect(s, 640, y, 280, 106, { fill: C.white, r: 12, shadow: 1 });
    num(s, i + 1, 622, y + 26, 44, { fill: i === 2 ? C.acc : C.navy, color: i === 2 ? C.ink : C.white });
    T(s, k, 680, y + 8, 230, 30, { size: 22, bold: true, color: C.key, ls: 1 });
    T(s, v, 680, y + 40, 230, 54, { size: 20, ls: 1.25 });
  });
  note(s, "金額はすべて試算の見本です。自動の請求・分配はまだ動いていません。", { y: 474 });
}

// ===== 03 =====
chapter(3, "Business Model", "ビジネスモデル", "データは右へ、お金は左へ。\nその間を受け持つ。", [["dev_laptop_settle.png", 470, 106, 450]], "03 ビジネスモデル");

// 17 お金の流れ
{
  const s = slide("AD_LIGHT", "03 ビジネスモデル");
  tab(s, "ビジネスモデル");
  T(s, "データは右へ、お金は左へ。\nその間を、Adctorが受け持ちます", 60, 60, 840, 88, { size: 28, bold: true, ls: 1.35 });
  oval(s, 60, 200, 200, 200, { fill: C.white, lc: C.mid, lw: 3, shadow: true });
  T(s, "提供企業", 60, 262, 200, 40, { size: 26, bold: true, align: "center", ls: 1 });
  T(s, "記事・データを\n持つ会社", 60, 304, 200, 56, { size: 20, color: C.sub, align: "center", ls: 1.25 });
  oval(s, 700, 200, 200, 200, { fill: C.white, lc: C.mid, lw: 3, shadow: true });
  T(s, "AI事業者", 700, 262, 200, 40, { size: 26, bold: true, align: "center", ls: 1 });
  T(s, "AIを\nつくる会社", 700, 304, 200, 56, { size: 20, color: C.sub, align: "center", ls: 1.25 });
  oval(s, 360, 170, 240, 240, { fill: C.navy, shadow: true });
  T(s, "Adctor", 360, 218, 240, 50, { font: EN, size: 38, bold: true, color: C.white, align: "center", ls: 1 });
  T(s, "条件・記録・\n請求と分配を\n受け持つ", 360, 272, 240, 96, { size: 22, bold: true, color: C.white, align: "center", ls: 1.25 });
  line(s, 262, 222, 380, 222, { color: C.ink, w: 3, arrow: true }); line(s, 582, 222, 698, 222, { color: C.ink, w: 3, arrow: true });
  rect(s, 584, 176, 112, 34, { fill: C.ink, r: 17 }); T(s, "データ →", 584, 176, 112, 34, { size: 20, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  line(s, 698, 380, 582, 380, { color: C.acc, w: 3, arrow: true }); line(s, 380, 380, 262, 380, { color: C.acc, w: 3, arrow: true });
  rect(s, 264, 392, 112, 34, { fill: C.acc, r: 17 }); T(s, "← お金", 264, 392, 112, 34, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 });
  rect(s, 120, 456, 720, 40, { fill: C.white, lc: C.navy, lw: 1.5, r: 20, shadow: 1 });
  T(s, [tx("当社の収入："), em("取引額の一部を手数料として受け取る", { color: C.navy }), tx("（率は検討中）")], 120, 456, 720, 40, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 });
}

// 18 それぞれの価値
{
  const s = slide("AD_WHITE", "03 ビジネスモデル");
  tab(s, "参加する会社にとっての価値");
  head(s, "参加する会社、それぞれに良いことがあります");
  const cards = [["データを持つ会社", "新聞・専門データベースなど", ["どのAIが、どれだけ\n使ったかがわかる", "条件と単価を、\n自分で決められる", "使われた分の\n対価を受け取れる"]], ["AIをつくる会社", "AIサービスの開発会社", ["権利がはっきりした日本語の\nデータを、安心して使える", "使った分を記録し、\nその分だけ支払える"]]];
  cards.forEach(([h, sub, items], i) => {
    const x = 60 + i * 440, y = 130, w = 400;
    rect(s, x + 10, y + 12, w, 320, { fill: i ? C.tint : C.accSoft, r: 14 });
    rect(s, x, y, w, 320, { fill: C.white, r: 14, shadow: 2 });
    rect(s, x + 24, y - 18, 230, 40, { fill: i ? C.navy : C.acc, r: 20, shadow: 1 });
    T(s, h, x + 24, y - 18, 230, 40, { size: 22, bold: true, color: i ? C.white : C.ink, align: "center", valign: "middle", ls: 1 });
    T(s, sub, x + 28, y + 36, w - 56, 30, { size: 20, color: C.sub, ls: 1 });
    items.forEach((t, j) => {
      const yy = y + 80 + j * 76;
      T(s, "✓", x + 28, yy, 30, 30, { size: 24, bold: true, color: C.ok, ls: 1 });
      T(s, t, x + 62, yy, w - 90, 64, { size: 20, bold: true, ls: 1.3 });
    });
  });
  note(s, "当社が目指す価値です。共同実証で確かめていきます。", { y: 476 });
}

// 19 2つの事業でひとつの流れ
{
  const s = slide("AD_LIGHT", "03 ビジネスモデル");
  tab(s, "AirReachとのつながり");
  head(s, [tx("2つの事業で、"), em("見つかる → 使われる → 還る", { hl: C.accSoft, color: C.ink }), tx("をつなぐ")]);
  const steps = [["情報を整えて届ける", "AirReach", "提供中", true], ["AIに使われる", "AIの答え", "", false], ["対価が還る", "Adctor", "研究・実証", true]];
  steps.forEach(([h, name, st, isBiz], i) => {
    const x = 60 + i * 290, y = 150, w = 260;
    rect(s, x, y, w, 220, { fill: i === 1 ? C.page : C.white, lc: i === 1 ? C.rule : undefined, r: 16, shadow: i === 1 ? undefined : 2 });
    if (i === 0) logoChip(s, x + 40, y + 30, 180);
    else T(s, name, x, y + 30, w, 60, { font: i === 2 ? EN : JP, size: i === 2 ? 40 : 28, bold: true, color: i === 2 ? C.navy : C.sub, align: "center", valign: "middle", ls: 1 });
    T(s, h, x, y + 120, w, 40, { size: 24, bold: true, align: "center", ls: 1 });
    if (st) tag(s, st, x + 60, y + 170, w - 120, i === 0 ? "plan" : "idea");
    if (i < 2) shape(s, "RIGHT_ARROW", x + w + 2, y + 92, 28, 36, { fill: C.acc });
  });
  rect(s, 60, 400, 840, 64, { fill: C.navy, r: 14, shadow: 1 });
  T(s, "AirReachで得た「AIの答えを測る」知見と顧客の基盤を、Adctorに生かします", 76, 400, 808, 64, { size: 21, bold: true, color: C.white, align: "center", valign: "middle", ls: 1.3 });
}

// 20 収入の考え方
{
  const s = slide("AD_WHITE", "03 ビジネスモデル");
  tab(s, "収入の考え方");
  head(s, [tx("当社の収入は、取引額のうち"), em("手数料の部分だけ", { hl: C.accSoft, color: C.ink })]);
  T(s, "取引額（AI事業者が支払うお金）", 80, 140, 600, 32, { size: 22, bold: true, ls: 1 });
  rect(s, 80, 182, 600, 96, { fill: C.light, r: 8, shadow: 1 });
  T(s, "提供企業へ支払う分", 100, 182, 400, 96, { size: 24, bold: true, color: C.navy, valign: "middle", ls: 1 });
  rect(s, 680, 166, 200, 128, { fill: C.navy, r: 8, shadow: 2 });
  T(s, "手数料\n＝当社の収入", 680, 166, 200, 128, { size: 24, bold: true, color: C.white, align: "center", valign: "middle", ls: 1.3 });
  oval(s, 820, 106, 110, 110, { fill: C.acc, shadow: true });
  T(s, "率は\n検討中", 820, 106, 110, 110, { size: 22, bold: true, align: "center", valign: "middle", ls: 1.2 });
  [["取引額", "そのまま当社の売上になるわけではありません"], ["分配", "入金を確かめてから、提供企業へ支払います"], ["利益", "収入から運営の費用を引いたもの（まだ計算していません）"]].forEach(([k, v], i) => {
    const y = 318 + i * 50;
    rect(s, 80, y, 100, 38, { fill: C.ink, r: 19 });
    T(s, k, 80, y, 100, 38, { size: 20, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, v, 196, y, 700, 38, { size: 20, valign: "middle", ls: 1 });
  });
  note(s, "図の大きさは比率を表しません。率と金額は、承認を経て決めます。", { y: 482 });
}

// ===== 04 =====
chapter(4, "Proof of Concept", "現在地と計画", "まずは、いちばん\n小さな形で確かめる。", [["dev_laptop_ledger.png", 470, 106, 450, A7], ["dev_phone_payout.png", 800, 196, 140, A7]], "04 現在地と計画");

// 22 構想と実証の範囲
{
  const s = slide("AD_LIGHT", "04 現在地と計画");
  tab(s, "いまできること・これから");
  head(s, "構想のうち、最初の実証で確かめる範囲");
  const cols = [["", 220], ["最初の実証（計画）", 300], ["将来の構想", 320]];
  const rows = [["記録するもの", "ファイルの取得", "AIの答えでの引用"], ["請求", "記録から表計算で作る", "自動で請求"], ["支払い", "銀行振込", "新しい支払い方法も検討"], ["確認と分配", "担当者が手作業で", "自動化"], ["規模", "1社×1社×1種類", "複数の会社とデータ"]];
  const x0 = 60, y0 = 120, rh = 62;
  rect(s, x0 + 220, y0 - 10, 300, 52 + rows.length * rh + 20, { fill: C.navy, r: 14, shadow: 2 });
  let x = x0;
  cols.forEach(([h, w], i) => { if (i) T(s, h, x, y0, w, 52, { size: 22, bold: true, color: i === 1 ? C.white : C.sub, align: "center", valign: "middle", ls: 1 }); x += w; });
  rows.forEach((r, j) => {
    const y = y0 + 52 + j * rh;
    if (j % 2 === 0) { rect(s, x0, y, 220, rh, { fill: C.white }); rect(s, x0 + 520, y, 320, rh, { fill: C.white }); }
    T(s, r[0], x0 + 16, y, 200, rh, { size: 21, bold: true, valign: "middle", ls: 1 });
    T(s, r[1], x0 + 220, y, 300, rh, { size: 21, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, r[2], x0 + 520, y, 320, rh, { size: 20, color: C.sub, align: "center", valign: "middle", ls: 1 });
  });
  note(s, "将来の構想は、許諾・法務・接続の条件を満たす場合に限り進めます。", { y: 486 });
}

// 23 1×1×1
{
  const s = slide("AD_DARK", "04 現在地と計画", "hero_blue.jpg");
  tab(s, "最初の実証実験");
  T(s, "まずは、いちばん小さな形で。", 70, 74, 800, 48, { size: 32, bold: true, color: C.white, ls: 1 });
  T(s, "1 × 1 × 1", 60, 120, 860, 170, { font: EN, size: 140, bold: true, color: C.white, ls: 1 });
  [["提供企業", "1社"], ["AI事業者", "1社"], ["データ", "1種類"]].forEach(([k, v], i) => {
    const x = 70 + i * 280;
    rect(s, x, 300, 250, 60, { fill: C.white, r: 30, shadow: 2 });
    T(s, [tx(k + "  ", { color: C.sub }), tx(v, { color: C.navy, bold: true, size: 26 })], x, 300, 250, 60, { size: 22, bold: true, align: "center", valign: "middle", ls: 1 });
  });
  T(s, lines(["条件を決めてから、分配まで。", [tx("お金の流れが"), em("ひと回りするか", { color: C.acc }), tx("を確かめます。")]]), 70, 384, 840, 80, { size: 24, bold: true, color: C.white, ls: 1.5 });
  note(s, "※実証実験：本格的に始める前に、小さく試して確かめること。参加企業は未定です。", { color: C.white, y: 480 });
}

// 24 実証で使う画面
{
  const s = slide("AD_WHITE", "04 現在地と計画");
  tab(s, "実証で使う画面（試作）");
  head(s, "最初の実証は、記録と請求をシンプルな画面で");
  dev(s, "dev_laptop_ledger.png", 20, 104, 450, A7);
  dev(s, "dev_laptop_bill.png", 440, 150, 450, A7);
  dev(s, "dev_phone_payout.png", 800, 90, 140, A7);
  note(s, "左：取得の記録　右：請求と入金の確認　スマホ：今月の分配（すべて見本）", { y: 474 });
}

// 25 その後の判断と協業
{
  const s = slide("AD_LIGHT", "04 現在地と計画");
  tab(s, "協業のかたち");
  head(s, "共同実証に、一緒に取り組んでいただける会社を探しています");
  const cards = [["データを持つ会社", "記事やデータを\n提供いただく", "AIでの使われ方が\nわかり、条件を\n試せる"], ["AIをつくる会社", "条件に合意して\n使っていただく", "権利がはっきりした\nデータを、使った\n分だけ払える"], ["技術・決済の会社", "記録や支払いで\n協力いただく", "AI時代のお金の\n流れを一緒に\nつくる"]];
  cards.forEach(([h, ask, val], i) => {
    const x = 70 + i * 284, y = 140, w = 250;
    rect(s, x + 12, y + 14, w, 300, { fill: i === 2 ? C.accSoft : C.tint, r: 14 });
    rect(s, x, y, w, 300, { fill: C.white, r: 14, shadow: 2 });
    rect(s, x + 20, y - 18, w - 40, 40, { fill: i === 2 ? C.acc : C.navy, r: 20, shadow: 1 });
    T(s, h, x + 20, y - 18, w - 40, 40, { size: 21, bold: true, color: i === 2 ? C.ink : C.white, align: "center", valign: "middle", ls: 1 });
    T(s, "お願いしたいこと", x + 22, y + 38, w - 44, 26, { size: 20, color: C.sub, ls: 1 });
    T(s, ask, x + 22, y + 66, w - 44, 64, { size: 21, bold: true, color: C.key, ls: 1.3 });
    line(s, x + 22, y + 140, x + w - 22, y + 140, { color: C.rule });
    T(s, "参加すると", x + 22, y + 152, w - 44, 26, { size: 20, color: C.sub, ls: 1 });
    T(s, val, x + 22, y + 180, w - 44, 100, { size: 20, ls: 1.4 });
  });
  note(s, "連携・購入・出資が決まっている会社は、まだありません。", { y: 476 });
}

// ===== 05 =====
chapter(5, "Team", "チームと会社", "測る技術と、\n還すしくみをつくるチーム。", [], "05 チームと会社");

// 27 経営メンバー
{
  const s = slide("AD_WHITE", "05 チームと会社");
  tab(s, "経営メンバー");
  head(s, "経営とAI・技術の責任者がそろうチームです");
  const top = [["CEO", "井上 幹太", "代表取締役社長\n経営と事業戦略", "ceo"], ["COO", "平川 凜乃丞", "取締役副社長\n事業推進"], ["CSO", "芳賀 翔太", "取締役\n営業統括"]];
  top.forEach(([r, n, d, ph], i) => {
    const x = 60 + i * 284, y = 118, w = 264;
    rect(s, x, y, w, 172, { fill: i ? C.white : C.navy, lc: i ? C.rule : undefined, r: 14, shadow: i ? 1 : 2 });
    if (ph) img(s, A5("ceo.jpg"), x + 16, y + 16, 76, 76);
    else { oval(s, x + 16, y + 16, 76, 76, { fill: C.tint }); T(s, n[0], x + 16, y + 16, 76, 76, { size: 32, bold: true, color: C.navy, align: "center", valign: "middle", ls: 1 }); }
    T(s, r, x + 104, y + 16, 140, 30, { font: ENS, size: 22, color: i ? C.key : C.acc, ls: 1 });
    T(s, n, x + 104, y + 50, 150, 36, { size: 24, bold: true, color: i ? C.ink : C.white, ls: 1 });
    T(s, d, x + 16, y + 100, w - 32, 56, { size: 20, color: i ? C.sub : C.light, ls: 1.25 });
  });
  const sub = [["CTO", "増山 とみき", "技術全般"], ["CAIO", "William Asai", "Adctorの技術"], ["執行役員", "一瀬 光希", "広報・社長室"], ["CTO室", "山根 たいち", "計測と開発"]];
  sub.forEach(([r, n, d], i) => {
    const x = 60 + i * 213, y = 306, w = 201;
    rect(s, x, y, w, 146, { fill: i === 1 ? C.accSoft : C.page, r: 12 });
    T(s, r, x + 14, y + 12, w - 28, 30, { font: ENS, size: 20, color: i === 1 ? C.accText : C.key, ls: 1 });
    T(s, n, x + 14, y + 46, w - 28, 34, { size: 22, bold: true, ls: 1 });
    T(s, d, x + 14, y + 88, w - 28, 54, { size: 20, color: C.sub, ls: 1.25 });
  });
  note(s, "※CAIO：AIの責任者。役職と名前は当社サイト、取締役の名前は登記簿の表記です。", { y: 474 });
}

// 28 会社情報
{
  const s = slide("AD_LIGHT", "05 チームと会社");
  tab(s, "会社情報");
  img(s, A5("tb_logo_black.png"), 60, 70, 300, 300 / 11.08);
  const rows = [["会社名", "株式会社Trillion Bank"], ["設立", "2025年12月23日"], ["所在地", "東京都千代田区麹町六丁目2番1号"], ["代表者", "代表取締役　井上 幹太"], ["事業", "AirReach／Adctor"]];
  rows.forEach(([k, v], i) => { const y = 120 + i * 52; T(s, k, 60, y, 100, 46, { size: 20, bold: true, color: C.key, valign: "middle", ls: 1 }); T(s, v, 160, y, 400, 46, { size: 20, valign: "middle", ls: 1.2 }); line(s, 60, y + 50, 560, y + 50, { color: C.rule }); });
  // 資本金
  const rx = 600, rw = 320;
  rect(s, rx, 90, rw, 360, { fill: C.white, r: 14, shadow: 2 });
  T(s, "資本金の推移", rx + 22, 106, rw - 44, 30, { size: 22, bold: true, color: C.navy, ls: 1 });
  const base = 360, bars = [["設立時", 50, "50万円"], ["2026/6", 550.4, "550万円"], ["2026/10", 1050.4, "1,050万円"]];
  bars.forEach(([lab, v, t], i) => {
    const h = Math.max(6, 170 * v / 1050.4), x = rx + 34 + i * 100, last = i === 2;
    rect(s, x, base - h, 70, h, { fill: last ? C.navy : C.light });
    T(s, t, x - 20, base - h - 30, 110, 28, { size: 20, bold: true, color: last ? C.navy : C.ink, align: "center", ls: 1 });
    T(s, lab, x - 15, base + 6, 100, 28, { size: 20, color: C.sub, align: "center", ls: 1 });
  });
  line(s, rx + 20, base, rx + rw - 20, base, { color: C.ink });
  T(s, "発行済みの株式　5,806株", rx + 22, 406, rw - 44, 30, { size: 20, bold: true, ls: 1 });
  note(s, "出典：登記簿（2026年11月6日発行）。正確な資本金は1,050万4,000円。", { y: 470 });
}

// 29 本資料での約束ごと
{
  const s = slide("AD_WHITE", "05 チームと会社");
  tab(s, "この資料の読み方");
  head(s, "書いてあることの「確かさ」を、4つに分けています");
  [["実績", "すでに行ったこと・登記などの事実", "fact"], ["計画", "これから行うと決めていること", "plan"], ["構想", "目指している形・見本の画面", "idea"], ["試算", "仮の数字で計算した例", "est"]].forEach(([k, d, kind], i) => {
    const y = 124 + i * 66;
    tag(s, k, 60, y + 8, 110, kind);
    T(s, d, 190, y, 380, 48, { size: 21, valign: "middle", ls: 1 });
  });
  rect(s, 600, 118, 300, 330, { fill: C.page, r: 14 });
  T(s, "載せていないもの", 620, 134, 260, 30, { size: 22, bold: true, color: C.navy, ls: 1 });
  T(s, "・市場の大きさ\n・手数料の率と単価\n・協業先の会社名\n・売上や利益の予測", 620, 176, 260, 170, { size: 21, ls: 1.5 });
  T(s, "確かめられたものから\n順に追加します", 620, 376, 260, 56, { size: 20, color: C.sub, ls: 1.3 });
  note(s, "※当社は銀行業を営む会社ではありません。", { y: 476 });
}

// 30 お問い合わせ
{
  const s = slide("AD_BARE", "05 チームと会社", "hero_dark.jpg");
  wordmark(s, 60, 60, 52);
  T(s, "AIの時代に、\n情報の価値が正しく還る\nしくみを、一緒に。", 60, 150, 520, 160, { size: 34, bold: true, color: C.white, ls: 1.4 });
  rect(s, 60, 340, 400, 60, { fill: C.acc, r: 30, shadow: 2 });
  T(s, "共同実証・提携について相談", 60, 340, 400, 60, { size: 22, bold: true, align: "center", valign: "middle", ls: 1 });
  rect(s, 60, 414, 400, 52, { fill: C.white, r: 26, shadow: 1 });
  T(s, "事業・投資のお問い合わせ", 60, 414, 400, 52, { size: 22, bold: true, color: C.navy, align: "center", valign: "middle", ls: 1 });
  dev(s, "dev_laptop_terms.png", 480, 120, 450);
  T(s, "株式会社Trillion Bank", 560, 470, 360, 30, { size: 20, bold: true, color: C.white, align: "right", ls: 1 });
}

pres.writeFile({ fileName: OUT }).then(async (f) => {
  try {
    const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
    await applyTheme(f, { name: "Adctor", headFontFace: JP, bodyFontFace: JP, colors: { dk1: "111318", lt1: "FFFFFF", dk2: "0B2F7A", lt2: "EAF1FF", accent1: "0B2F7A", accent2: "FFB020", accent3: "1762E8", accent4: "8DB3F4", accent5: "667085", accent6: "0E9F6E", hlink: "1762E8", folHlink: "667085" } });
  } catch (e) { console.warn("theme not applied:", e.message); }
  console.log("wrote", f, "slides", N);
});
