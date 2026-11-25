// Trillion Bank 会社案内（事業概要・会社概要・役員紹介）
// 生成: build_profile.sh（make_symbol.js → このスクリプト。画面素材は assets_ar・assets_adc・assets_v7 を使う）
// 方針：文字は20pt以上／ふだんの言葉＋注釈／TB配色で統一（Adctor は濃紺を主に）／重なりのある立体的な配置
// 「構想」「計画」「試算」「実績」を区別して書く。料率・市場規模・取引先名は載せない。
// 内容の出所：当社サイト新版（index.html・airreach.html・adctor.html）、登記簿、当社資料
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.resolve(__dirname, "..", "TrillionBank_会社案内_v1.pptx");
const A5 = (n) => path.join(__dirname, "assets_v5", n);
const A7 = (n) => path.join(__dirname, "assets_v7", n);
const AR = (n) => path.join(__dirname, "assets_ar", n);
const AD = (n) => path.join(__dirname, "assets_adc", n);
const PF = (n) => path.join(__dirname, "assets_profile", n);

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
pres.title = "Trillion Bank 会社案内";
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
pres.defineSlideMaster({ title: "PF_WHITE", background: { color: C.white }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(true) });
pres.defineSlideMaster({ title: "PF_LIGHT", background: { color: C.page }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(true) });
pres.defineSlideMaster({ title: "PF_DARK", background: { color: C.navy }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(false) });
pres.defineSlideMaster({ title: "PF_BARE", background: { color: C.white }, objects: [] });
function slide(master, sec, bg) { N += 1; const s = pres.addSlide({ masterName: master, sectionTitle: sec }); if (bg) s.background = { path: A7(bg) }; return s; }
const wordmark = (s, x, y, size, color) => T(s, "Adctor", x, y, size * 3.4, size * 1.25, { font: EN, bold: true, size, color: color || C.white, ls: 1 });
const tag = (s, text, x, y, w, kind) => { const k = { plan: [C.key, C.white], idea: [C.accSoft, C.accText], est: [C.okSoft, C.ok], fact: [C.ink, C.white] }[kind]; rect(s, x, y, w, 32, { fill: k[0], r: 16 }); T(s, text, x, y, w, 32, { size: 20, bold: true, color: k[1], align: "center", valign: "middle", ls: 1 }); };
function chapter(n, en, jp, sub, devices, sec) {
  pres.addSection({ title: sec });
  const s = slide("PF_DARK", sec, "hero_dark.jpg");
  img(s, A7("band.png"), 40, 24, 920, 58);
  rect(s, 20, 24, 64, 46, { fill: C.white, lc: C.ink, lw: 1.25 });
  T(s, String(n).padStart(2, "0"), 20, 24, 64, 46, { font: ENS, size: 28, align: "center", valign: "middle", ls: 1 });
  const ew = en.length * 27 + 76;
  rect(s, 20, 70, ew, 70, { fill: C.white, lc: C.ink, lw: 1.25, shadow: 1 });
  T(s, en, 38, 70, ew - 36, 70, { font: EN, size: 44, valign: "middle", ls: 1 });
  const jw = [...jp].length * 28 + 34;
  rect(s, 20, 140, jw, 46, { fill: C.white, lc: C.ink, lw: 1.25 });
  T(s, jp, 20, 140, jw, 46, { size: 26, bold: true, align: "center", valign: "middle", ls: 1 });
  T(s, sub, 40, 410, 460, 90, { size: 26, bold: true, color: C.white, ls: 1.4 });
  devices.forEach(([f, x, y, w, dir]) => dev(s, f, x, y, w, dir));
  return s;
}

// 人物カード（写真があれば写真、なければ頭文字）
function face(s, x, y, d, name, photo) {
  if (photo) { oval(s, x - 4, y - 4, d + 8, d + 8, { fill: C.white, shadow: true }); s.addImage({ path: photo, x: P(x), y: P(y), w: P(d), h: P(d), rounding: true }); }
  else { oval(s, x, y, d, d, { fill: C.tint, lc: C.white, lw: 3, shadow: true }); T(s, name[0], x, y, d, d, { size: Math.round(d * 0.42), bold: true, color: C.navy, align: "center", valign: "middle", ls: 1 }); }
}

// =====================================================================
// 1 表紙
pres.addSection({ title: "表紙" });
{
  const s = slide("PF_BARE", "表紙", "cover.jpg");
  img(s, A5("tb_logo_white.png"), 64, 64, 300, 300 / 11.08);
  T(s, "Company Profile", 64, 112, 520, 56, { font: EN, size: 44, color: C.white, ls: 1 });
  T(s, "AIから発信者に、\n還元をするインフラをつくる", 64, 178, 470, 96, { size: 30, bold: true, color: C.white, ls: 1.35 });
  T(s, "事業概要・会社概要・経営メンバー", 64, 318, 460, 34, { size: 24, bold: true, color: C.navy, ls: 1 });
  img(s, PF("tb_symbol_white.png"), 600, 60, 300, 230);
  dev(s, "dev_laptop_tools.png", 560, 250, 330, AR);
  dev(s, "dev_phone_lock.png", 830, 300, 110, AD);
  T(s, "株式会社Trillion Bank", 64, 466, 400, 30, { size: 22, bold: true, color: C.navy, ls: 1 });
  T(s, "2026.11.25", 760, 470, 180, 28, { font: EN, size: 20, color: C.navy, align: "right", ls: 1 });
}

// 2 目次
{
  const s = slide("PF_WHITE", "表紙");
  rect(s, 48, 40, 186, 62, { fill: C.white, lc: C.key, lw: 2 });
  T(s, "INDEX", 48, 40, 186, 62, { font: ENS, size: 40, color: C.key, align: "center", valign: "middle", ls: 1 });
  rect(s, 48, 102, 80, 36, { fill: C.key });
  T(s, "目次", 48, 102, 80, 36, { size: 22, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  [["01", "私たちについて", "About Us", "03"], ["02", "AirReach（エアリーチ）", "AI Search", "07"], ["03", "Adctor（アドクトル）", "AI Toll Gate", "13"], ["04", "経営メンバー", "Members", "19"], ["05", "会社概要", "Company", "24"]].forEach(([n, jp, en, pg], i) => {
    const y = 56 + i * 86;
    T(s, n, 330, y, 60, 34, { font: ENS, size: 26, color: C.key, ls: 1 });
    T(s, jp, 390, y - 2, 340, 38, { size: 28, bold: true, ls: 1 });
    T(s, en, 390, y + 38, 300, 26, { font: EN, size: 20, color: C.sub, ls: 1 });
    line(s, 740, y + 22, 830, y + 22, { color: C.light, dash: "sysDot", w: 1.5 });
    T(s, "P." + pg, 840, y + 6, 80, 30, { font: EN, size: 22, ls: 1 });
  });
}

// ===== 01 私たちについて =====
chapter(1, "About Us", "私たちについて", "AI検索で選ばれる企業を増やし、\nAIに使われた情報を価値へ変える。", [["dev_laptop_report.png", 470, 106, 440, AR]], "01 私たちについて");

// 4 企業理念
{
  const s = slide("PF_WHITE", "01 私たちについて");
  tab(s, "企業理念");
  img(s, PF("tb_symbol_fill.png"), 640, 330, 260, 200);
  const rows = [["Purpose", "存在意義", "日本で最も大きな幸せをつくる"], ["Vision", "目指す姿", "AI時代の情報流通に、信頼と正当な対価を"], ["Mission", "使命", "AI革命で、トリリオンの課題を担う。"]];
  rows.forEach(([en, jp, v], i) => {
    const y = 70 + i * 96;
    rect(s, 60, y, 150, 80, { fill: i === 2 ? C.navy : C.key, r: 12, shadow: 2 });
    T(s, en, 60, y + 10, 150, 32, { font: ENS, size: 24, color: C.white, align: "center", ls: 1 });
    T(s, jp, 60, y + 44, 150, 28, { size: 20, color: C.light, align: "center", ls: 1 });
    rect(s, 196, y + 6, 700, 68, { fill: C.page, r: 10 });
    T(s, v, 226, y + 6, 660, 68, { size: 26, bold: true, color: i === 2 ? C.navy : C.ink, valign: "middle", ls: 1 });
  });
  T(s, "大切にしていること", 60, 370, 400, 30, { size: 22, bold: true, color: C.key, ls: 1 });
  ["大きな課題にこそ挑む。", "流行語より、証拠で語る。", "信頼は、設計の中に組み込む。"].forEach((t, i) => {
    rect(s, 60, 408 + i * 0, 0, 0, {});
    T(s, "・" + t, 60 + (i === 2 ? 0 : i * 240), i === 2 ? 446 : 408, 480, 32, { size: 21, bold: true, ls: 1 });
  });
  note(s, "出典：当社サイト「会社情報：企業理念」", { y: 486, w: 500 });
}

// 5 2つの事業でひとつの流れ
{
  const s = slide("PF_LIGHT", "01 私たちについて");
  tab(s, "私たちの事業");
  head(s, [tx("2つの事業で、"), em("見つかる → 使われる → 還る", { hl: C.accSoft, color: C.ink }), tx("をつなぐ")]);
  const cols = [["AirReach", "エアリーチ", "AIの回答に届く\n入口をつくる", "AI検索対策", "提供中", "plan"], ["Adctor", "アドクトル", "使われた情報の価値を\nつくり手へ還す", "AIの料金所", "研究開発・限定実証", "idea"]];
  cols.forEach(([n, kana, d, sub, st, kind], i) => {
    const x = 60 + i * 440, y = 140, w = 400;
    rect(s, x + 12, y + 14, w, 300, { fill: i ? C.navy : C.tint, r: 16 });
    rect(s, x, y, w, 300, { fill: C.white, r: 16, shadow: 2 });
    if (i === 0) logoChip(s, x + 28, y + 26, 190); else T(s, n, x + 28, y + 26, 300, 64, { font: EN, size: 44, bold: true, color: C.navy, valign: "middle", ls: 1 });
    T(s, kana + "｜" + sub, x + 28, y + 110, w - 56, 30, { size: 20, color: C.sub, ls: 1 });
    T(s, d, x + 28, y + 150, w - 56, 70, { size: 24, bold: true, color: i ? C.navy : C.key, ls: 1.35 });
    tag(s, st, x + 28, y + 240, i ? 230 : 120, kind);
  });
  shape(s, "RIGHT_ARROW", 466, 270, 30, 40, { fill: C.acc });
  T(s, "AirReachで「AIの答えを測る」知見を育て、Adctorの記録と精算に生かします", 60, 462, 840, 30, { size: 20, bold: true, color: C.navy, ls: 1 });
}

// 6 ロゴにこめた意味
{
  const s = slide("PF_DARK", "01 私たちについて", "hero_dark.jpg");
  tab(s, "ロゴにこめた意味");
  img(s, PF("tb_symbol_white.png"), 60, 110, 420, 323);
  T(s, "3枚のフレームと、\n通り抜けて還る線。", 520, 90, 400, 92, { size: 30, bold: true, color: C.white, ls: 1.4 });
  [["測る", "AIでの見え方を測る"], ["守る", "使ってよい範囲を守る"], ["記録する", "使われたことを記録する"]].forEach(([k, v], i) => {
    const y = 206 + i * 66;
    rect(s, 520, y, 120, 50, { fill: C.white, r: 25 });
    T(s, k, 520, y, 120, 50, { size: 22, bold: true, color: C.navy, align: "center", valign: "middle", ls: 1 });
    T(s, v, 656, y, 280, 50, { size: 21, color: C.white, valign: "middle", ls: 1 });
  });
  rect(s, 520, 410, 120, 50, { fill: C.acc, r: 25 });
  T(s, "還る", 520, 410, 120, 50, { size: 22, bold: true, align: "center", valign: "middle", ls: 1 });
  T(s, "価値が発信者へ戻る", 656, 410, 280, 50, { size: 21, bold: true, color: C.acc, valign: "middle", ls: 1 });
}

// ===== 02 AirReach =====
chapter(2, "AI Search", "AirReach", "AIの回答で、\n「比較候補」に入る。", [["dev_laptop_tools.png", 460, 104, 440, AR], ["dev_phone_chat.png", 800, 190, 150, AR]], "02 AirReach");

// 8 AirReachとは
{
  const s = slide("PF_WHITE", "02 AirReach");
  tab(s, "AirReachとは");
  logoChip(s, 76, 72, 200);
  T(s, lines([[tx("AIの回答で、"), em("「比較候補」", { hl: C.accSoft, color: C.ink })], "に入るためのサービス"]), 60, 160, 480, 80, { size: 26, bold: true, ls: 1.45 });
  T(s, "ChatGPTやGeminiなどに質問されたとき、\n自社が候補として紹介されるように、\n自社の情報をAIが読みやすい形に整えます。", 60, 250, 480, 110, { size: 21, ls: 1.5 });
  rect(s, 60, 372, 470, 46, { fill: C.navy, r: 23 });
  T(s, "広告枠の購入ではなく、AI向けの情報整備です", 60, 372, 470, 46, { size: 20, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  ["ChatGPT", "Gemini", "Claude", "Perplexity", "Google AI Overviews"].forEach((a, i) => {
    const w = [110, 96, 90, 120, 236][i], x = 60 + [0, 118, 222, 320, 0][i], y = i === 4 ? 474 : 430;
    rect(s, x, y, w, 36, { fill: C.tint, r: 18 });
    T(s, a, x, y, w, 36, { font: ENS, size: 20, color: C.key, align: "center", valign: "middle", ls: 1 });
  });
  dev(s, "dev_phone_answer.png", 620, 60, 250, AR);
  T(s, "※対象と範囲は見積もりで確認", 304, 474, 300, 36, { size: 20, color: C.sub, valign: "middle", ls: 1 });
}

// 9 4つの流れ＋サービスモデル
{
  const s = slide("PF_LIGHT", "02 AirReach");
  tab(s, "AI広告の、4つの流れ");
  const st = [["表示確認", "紹介のされ方と\n競合を確かめる"], ["改善計画", "必要な情報や\n記事を整理する"], ["記事作成", "質問への答えと\n記事をつくる"], ["結果確認", "紹介や問い合わせ\nを確かめる"]];
  st.forEach(([h, d], i) => {
    const x = 60 + i * 212, y = 70, w = 196;
    rect(s, x, y, w, 152, { fill: C.white, r: 12, shadow: 1 });
    T(s, String(i + 1).padStart(2, "0"), x + 16, y + 12, 60, 30, { font: ENS, size: 24, color: i === 3 ? C.acc : C.key, ls: 1 });
    T(s, h, x + 16, y + 44, w - 32, 30, { size: 22, bold: true, ls: 1 });
    T(s, d, x + 16, y + 80, w - 32, 56, { size: 20, color: C.sub, ls: 1.3 });
    if (i < 3) shape(s, "RIGHT_ARROW", x + w + 1, y + 58, 14, 24, { fill: C.acc });
  });
  rect(s, 60, 232, 840, 2, { fill: C.rule });
  T(s, "ツールでは、案内役のトリウル君に\n話しかけるだけで進みます", 60, 246, 470, 64, { size: 22, bold: true, color: C.navy, ls: 1.35 });
  [["始める", "アドレスを伝えるだけ"], ["聞く", "わからない言葉はその場で"], ["承認する", "入れるのは承認したものだけ"], ["測り直す", "同じ質問で測り直す"]].forEach(([k, v], i) => {
    const y = 322 + i * 42;
    rect(s, 60, y, 110, 34, { fill: i === 2 ? C.acc : C.key, r: 17 });
    T(s, k, 60, y, 110, 34, { size: 20, bold: true, color: i === 2 ? C.ink : C.white, align: "center", valign: "middle", ls: 1 });
    T(s, v, 184, y, 340, 34, { size: 20, valign: "middle", ls: 1 });
  });
  dev(s, "dev_laptop_tools.png", 540, 250, 330, AR);
  dev(s, "dev_phone_chat.png", 820, 266, 120, AR);
}

// 10 使い方と料金
{
  const s = slide("PF_WHITE", "02 AirReach");
  tab(s, "使い方と料金");
  head(s, "目的に合わせて選べる、4つの使い方");
  const plans = [["無料診断", "0", "円", "URLを入れる\nだけで、AIでの\n見え方がわかる", true], ["AirReach Tools", "19,800", "円／月", "案内役と話し\nながら、自分で\n測って直す", false], ["Tools\n（代理店向け）", "9,800", "円／月", "1ドメインごと。\n代理店が\n運用する", false], ["Consulting", "個別", "見積もり", "当社と一緒に、\n改善と測り直し\nまで進める", false]];
  plans.forEach(([n, v, u, d, hot], i) => {
    const x = 60 + i * 212, y = 130, w = 196;
    rect(s, x, y, w, 320, { fill: hot ? C.key : C.white, lc: hot ? undefined : C.rule, r: 14, shadow: hot ? 2 : 1 });
    T(s, n, x + 12, y + 18, w - 24, 56, { size: 20, bold: true, color: hot ? C.white : C.navy, align: "center", valign: "middle", ls: 1.2 });
    s.addText([{ text: v, options: { fontFace: EN, bold: true, fontSize: v.length > 4 ? 34 : 44, color: hot ? C.white : C.key } }, { text: u, options: { fontFace: JP, bold: true, fontSize: 20, color: hot ? C.white : C.ink } }], { x: P(x), y: P(y + 86), w: P(w), h: P(64), margin: 0, align: "center", valign: "middle", isTextBox: true, lang: "ja-JP" });
    line(s, x + 20, y + 166, x + w - 20, y + 166, { color: hot ? C.light : C.rule });
    T(s, d, x + 14, y + 180, w - 28, 120, { size: 20, color: hot ? C.white : C.ink, ls: 1.45 });
  });
  note(s, "料金は税別。出典：当社サイト（AirReach）。", { y: 474 });
}

// 11 導入の例
{
  const s = slide("PF_LIGHT", "02 AirReach");
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
  note(s, "期間：2026/7/27〜9/3。出典：当社資料。結果を約束するものではありません。", { y: 456 });
}

// 12 できないことも先に
{
  const s = slide("PF_WHITE", "02 AirReach");
  tab(s, "できないことも、先にお伝えします");
  T(s, "Honest Notes", 60, 66, 400, 40, { font: EN, size: 30, color: C.key, ls: 1 });
  T(s, "信頼していただくために、\nできないことを先にお伝えします。", 60, 110, 400, 80, { size: 24, bold: true, ls: 1.45 });
  ["AI検索での表示・順位・問い合わせ・売上を、保証しません", "すべてのAI・すべての画面を測るわけではありません", "AIがなぜその回答を選んだのかは、断定できません", "事実にない情報を、作り出しません", "変更を、自動で公開しません"].forEach((t, i) => {
    const y = 76 + i * 82, x = 470;
    rect(s, x, y, 450, 70, { fill: C.page, r: 12, shadow: 1 });
    oval(s, x - 18, y + 13, 44, 44, { fill: C.acc, shadow: true });
    T(s, "×", x - 18, y + 13, 44, 44, { font: ENS, size: 22, align: "center", valign: "middle", ls: 1 });
    T(s, t, x + 40, y, 400, 70, { size: 20, bold: true, valign: "middle", ls: 1.3 });
  });
  img(s, AR("toriuru_body.png"), 80, 300, 160, 160 * 238 / 218);
  note(s, "出典：当社サイト（AirReach）", { y: 486, w: 380 });
}

// ===== 03 Adctor =====
chapter(3, "AI Toll Gate", "Adctor", "AIに引用されたら、\n対価が届く。", [["dev_laptop_dash.png", 470, 106, 440, AD], ["dev_phone_lock.png", 800, 196, 140, AD]], "03 Adctor");

// 14 Adctorとは
{
  const s = slide("PF_WHITE", "03 Adctor");
  tab(s, "Adctorとは");
  wordmark(s, 60, 64, 44, C.navy);
  tag(s, "研究開発・限定実証", 300, 76, 240, "idea");
  T(s, lines([[tx("AIに引用されたら、"), em("対価が届く。", { hl: C.accSoft, color: C.ink })], "AIの料金所（Pay per Citation※）"]), 60, 130, 520, 80, { size: 26, bold: true, ls: 1.45 });
  T(s, "情報をつくる企業が、使ってよい範囲と\n単価を決める。合意したAI事業者だけが\n「料金所」を通って情報を使い、記録に\nもとづいて対価がつくり手へ還る。", 60, 226, 480, 150, { size: 21, ls: 1.5 });
  rect(s, 60, 384, 480, 104, { fill: C.accSoft, r: 12 });
  T(s, "※引用された分だけ払うしくみ。契約で合意した\n引用・利用が対象で、すべての引用を自動で\n検知・課金するしくみではありません。", 76, 390, 456, 82, { size: 20, color: C.accText, bold: true, ls: 1.35 });
  dev(s, "dev_phone_answer.png", 600, 60, 260, AD);
}

// 15 プラットフォームの構造（6ステップ）
{
  const s = slide("PF_LIGHT", "03 Adctor");
  tab(s, "プラットフォームの構造");
  head(s, "提供者とAI事業者を、利用条件と記録でつなぐ", { size: 28 });
  const node = (x, who, sub, wish) => {
    T(s, wish, x - 20, 120, 220, 56, { size: 20, bold: true, color: C.navy, align: "center", ls: 1.3 });
    oval(s, x + 10, 180, 160, 160, { fill: C.white, lc: C.mid, lw: 3, shadow: true });
    T(s, who, x + 10, 230, 160, 34, { size: 24, bold: true, align: "center", ls: 1 });
    T(s, sub, x + 10, 266, 160, 50, { size: 20, color: C.sub, align: "center", ls: 1.2 });
  };
  node(40, "情報提供者", "メディア・\n専門データ", "使われた情報に、\n対価がほしい");
  node(740, "AI事業者", "AIアシスタント\n検索AI", "権利のはっきりした\n情報を使いたい");
  oval(s, 390, 170, 180, 180, { fill: C.navy, shadow: true });
  T(s, "Adctor", 390, 210, 180, 44, { font: EN, size: 32, bold: true, color: C.white, align: "center", ls: 1 });
  T(s, "条件・鍵・\n記録・請求", 390, 258, 180, 60, { size: 20, bold: true, color: C.white, align: "center", ls: 1.2 });
  const lab = (x, y, n, t, money) => { oval(s, x, y, 30, 30, { fill: money ? C.acc : C.key }); T(s, String(n), x, y, 30, 30, { font: ENS, size: 20, color: money ? C.ink : C.white, align: "center", valign: "middle", ls: 1 }); T(s, t, x + 36, y, 170, 30, { size: 20, bold: true, color: money ? C.accText : C.navy, valign: "middle", ls: 1 }); };
  line(s, 214, 216, 386, 216, { color: C.key, w: 2.5, arrow: true }); lab(220, 180, 1, "条件を登録");
  line(s, 746, 216, 574, 216, { color: C.key, w: 2.5, arrow: true }); lab(586, 180, 2, "条件に合意");
  line(s, 574, 262, 746, 262, { color: C.key, w: 2.5, arrow: true }); lab(586, 268, 3, "鍵を発行");
  line(s, 746, 318, 574, 318, { color: C.acc, w: 2.5, arrow: true }); lab(586, 324, 5, "利用料を払う", true);
  line(s, 386, 318, 214, 318, { color: C.acc, w: 2.5, arrow: true }); lab(220, 324, 6, "分配", true);
  rect(s, 160, 376, 640, 40, { fill: C.white, lc: C.key, lw: 1.5, r: 20, shadow: 1 });
  lab(176, 381, 4, ""); T(s, "鍵を付けて情報を使う（引用・取得）→ Adctorが記録", 216, 376, 570, 40, { size: 20, bold: true, color: C.navy, valign: "middle", ls: 1 });
  [["提供者へ", "80%"], ["手数料", "20%"]].forEach(([k, v], i) => {
    const x = i ? 640 : 160, y = 428;
    rect(s, x, y, 160, 44, { fill: i ? C.navy : C.acc, r: 22, shadow: 1 });
    T(s, [tx(k + " ", { color: i ? C.white : C.ink, size: 20 }), tx(v, { color: i ? C.white : C.ink, size: 26, font: EN })], x, y, 160, 44, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 });
  });
  T(s, "80%／20%は未検証の設計例。\n確定条件は個別の契約で合意", 336, 424, 290, 56, { size: 20, color: C.sub, align: "center", ls: 1.25 });
}

// 16 管理画面（構想）
{
  const s = slide("PF_WHITE", "03 Adctor");
  tab(s, "管理画面（構想）");
  head(s, "Adctorの管理画面で、しくみを見る");
  [["See", "アクセスを\n見える化"], ["Terms", "条件と単価を\n公開する"], ["Access", "合意した事業者\nだけが使う"], ["Settle", "記録から請求・\n分配（検証中）"]].forEach(([en, t], i) => {
    const y = 124 + i * 88;
    rect(s, 60, y, 360, 76, { fill: C.page, r: 12 });
    T(s, String(i + 1).padStart(2, "0"), 76, y + 8, 50, 28, { font: ENS, size: 20, color: i === 3 ? C.accText : C.key, ls: 1 });
    T(s, en, 76, y + 38, 80, 30, { font: ENS, size: 20, color: C.navy, ls: 1 });
    T(s, t, 160, y, 250, 76, { size: 20, bold: true, valign: "middle", ls: 1.3 });
  });
  dev(s, "dev_laptop_terms.png", 430, 104, 480, AD);
  dev(s, "dev_laptop_settle.png", 600, 260, 330, AD);
  note(s, "画面は構想・見本。単価・件数・金額はすべて例です。", { y: 478, w: 480 });
}

// 17 Pay per Citationの流れ
{
  const s = slide("PF_LIGHT", "03 Adctor");
  tab(s, "Pay per Citation");
  head(s, "合意した利用だけを、請求と分配につなぐ");
  const st = [["利用条件を\n契約", "用途・期間などを\n買い手と提供者で\n合意する"], ["認証して\n利用", "契約にもとづく\n利用だけを\n許可する"], ["対象を\n記録", "条件に当てはまる\n利用を記録\nする"], ["照合して\n請求・分配", "記録をもとに\n照合し、請求と\n分配へ"]];
  st.forEach(([h, d], i) => {
    const x = 60 + i * 212, y = 130, w = 196;
    rect(s, x + 8, y + 10, w, 240, { fill: i === 3 ? C.accSoft : C.tint, r: 14 });
    rect(s, x, y, w, 240, { fill: C.white, r: 14, shadow: 2 });
    num(s, i + 1, x - 14, y - 16, 46, { fill: i === 3 ? C.acc : C.navy, color: i === 3 ? C.ink : C.white });
    T(s, h, x + 16, y + 40, w - 32, 60, { size: 21, bold: true, color: C.key, ls: 1.3 });
    T(s, d, x + 16, y + 112, w - 32, 110, { size: 20, ls: 1.4 });
  });
  T(s, "用途ごとに、別々に契約します", 60, 400, 380, 40, { size: 22, bold: true, color: C.navy, valign: "middle", ls: 1 });
  ["データの取得", "回答内の引用", "モデル学習"].forEach((t, i) => {
    const x = 440 + i * 156;
    rect(s, x, 400, 144, 40, { fill: C.white, lc: C.navy, lw: 1.5, r: 20 });
    T(s, t, x, 400, 144, 40, { size: 20, bold: true, color: C.navy, align: "center", valign: "middle", ls: 1 });
  });
  note(s, "出典：当社サイト（Adctor）。現在は共同実証で検証中です。", { y: 470 });
}

// 18 現在地と協業
{
  const s = slide("PF_WHITE", "03 Adctor");
  tab(s, "現在地とパートナー募集");
  head(s, [tx("いまは"), em("研究開発・限定実証", { hl: C.accSoft, color: C.ink }), tx("の段階です")]);
  T(s, "まずは、提供企業1社 × AI事業者1社 × データ1種類で、\n条件から分配までのお金の流れがひと回りするかを確かめます。", 60, 112, 840, 70, { size: 21, ls: 1.5 });
  [["Partnership", "協業をご検討の企業・\nデータ提供者の方へ", "共同実証・提携について相談", C.navy], ["Investors", "投資をご検討の方へ", "事業・投資に関するお問い合わせ", C.acc]].forEach(([en, h, cta, col], i) => {
    const x = 60 + i * 440, y = 210, w = 400;
    rect(s, x + 12, y + 14, w, 230, { fill: i ? C.accSoft : C.tint, r: 16 });
    rect(s, x, y, w, 230, { fill: C.white, r: 16, shadow: 2 });
    T(s, en, x + 28, y + 24, w - 56, 40, { font: EN, size: 30, color: i ? C.accText : C.navy, ls: 1 });
    T(s, h, x + 28, y + 76, w - 56, 70, { size: 24, bold: true, ls: 1.35 });
    rect(s, x + 28, y + 160, w - 56, 48, { fill: col, r: 24 });
    T(s, cta, x + 28, y + 160, w - 56, 48, { size: 20, bold: true, color: i ? C.ink : C.white, align: "center", valign: "middle", ls: 1 });
  });
  note(s, "連携・購入・出資が決まっている会社は、まだありません。", { y: 470 });
}

// ===== 04 経営メンバー =====
chapter(4, "Members", "経営メンバー", "測る技術と、\n還すしくみをつくるチーム。", [], "04 経営メンバー");

// 20 体制
{
  const s = slide("PF_LIGHT", "04 経営メンバー");
  tab(s, "経営メンバー");
  head(s, "取締役3名と、執行役員・メンバー4名の体制です");
  const top = [["CEO", "井上 幹太", "代表取締役", A5("ceo.jpg")], ["COO", "平川 凜乃丞", "取締役副社長", null], ["CSO", "芳賀 翔太", "取締役", null]];
  top.forEach(([r, n, t, ph], i) => {
    const x = 60 + i * 284, y = 120, w = 264;
    rect(s, x, y, w, 150, { fill: i ? C.white : C.navy, r: 14, shadow: 2 });
    face(s, x + 16, y + 30, 84, n, ph);
    T(s, r, x + 114, y + 22, 140, 30, { font: ENS, size: 24, color: i ? C.key : C.acc, ls: 1 });
    T(s, n, x + 114, y + 56, 146, 36, { size: 22, bold: true, color: i ? C.ink : C.white, ls: 1 });
    T(s, t, x + 114, y + 98, 146, 30, { size: 20, color: i ? C.sub : C.light, ls: 1 });
  });
  const sub = [["執行役員", "一瀬 光希"], ["CTO", "増山 とみき"], ["CAIO", "William Asai"], ["CTO室", "山根 たいち"]];
  sub.forEach(([r, n], i) => {
    const x = 60 + i * 213, y = 300, w = 201;
    rect(s, x, y, w, 150, { fill: C.white, lc: C.rule, r: 12, shadow: 1 });
    face(s, x + w / 2 - 34, y + 14, 68, n, null);
    T(s, r, x, y + 88, w, 26, { font: ENS, size: 20, color: C.key, align: "center", ls: 1 });
    T(s, n, x, y + 114, w, 30, { size: 21, bold: true, align: "center", ls: 1 });
  });
  note(s, "役職は当社サイト、取締役の氏名は登記簿の表記です。", { y: 474 });
}

// 21 代表プロフィール
{
  const s = slide("PF_WHITE", "04 経営メンバー");
  img(s, A7("panel.jpg"), 600, 0, 360, 540);
  tab(s, "代表メッセージ・プロフィール");
  rect(s, 560, 96, 300, 300, { fill: C.white, shadow: 2 });
  img(s, A5("ceo.jpg"), 572, 108, 276, 276);
  T(s, "CEO・創業者／代表取締役社長", 60, 76, 480, 30, { size: 20, bold: true, color: C.key, ls: 1 });
  T(s, "井上 幹太", 60, 108, 400, 60, { size: 44, bold: true, ls: 1 });
  rect(s, 60, 178, 70, 6, { fill: C.acc });
  T(s, lines(["不登校を経験するなかでプログラミングを独学し、", [em("14歳", { hl: C.accSoft, color: C.ink }), "でWeb開発の受託を始める。"], "N高グループで学び、ソフトバンクグループなど", "でのインターンを経て、2025年に当社を設立。", "ソフトバンクアカデミア17期。"]), 60, 198, 490, 190, { size: 20, ls: 1.5 });
  T(s, "出演：『Nontitle Season 6』『令和の虎』", 60, 400, 490, 30, { size: 20, bold: true, color: C.navy, ls: 1 });
  T(s, "経営と事業戦略を統括。AirReachとAdctorを推進。", 60, 436, 490, 30, { size: 20, color: C.sub, ls: 1 });
  T(s, "出典：当社サイト", 620, 470, 300, 28, { size: 20, color: C.white, ls: 1 });
}

// 22 取締役
{
  const s = slide("PF_LIGHT", "04 経営メンバー");
  tab(s, "取締役");
  const ppl = [["COO", "平川 凜乃丞", "共同創業者／取締役副社長\n兼 事業推進室長", "上智大学。学生ビジネスコンペ\n「B-Lab」で提案づくりを経験。\n事業計画を実行に移し、営業・\n支援・開発の優先順位を整える。"], ["CSO", "芳賀 翔太", "取締役 兼 営業統括室長", "北海道富良野市出身。立教大学\n経営学部。大学1年で株式会社\nMICHIを創業。AirReachの法人\n営業と販売パートナーを統括。"]];
  ppl.forEach(([r, n, t, bio], i) => {
    const x = 60 + i * 440, y = 70, w = 410;
    rect(s, x + 10, y + 12, w, 400, { fill: C.tint, r: 16 });
    rect(s, x, y, w, 400, { fill: C.white, r: 16, shadow: 2 });
    face(s, x + 24, y + 24, 100, n, null);
    T(s, r, x + 144, y + 30, 200, 30, { font: ENS, size: 26, color: C.key, ls: 1 });
    T(s, n, x + 144, y + 70, 250, 40, { size: 28, bold: true, ls: 1 });
    T(s, t, x + 24, y + 140, w - 48, 56, { size: 20, bold: true, color: C.navy, ls: 1.3 });
    line(s, x + 24, y + 204, x + w - 24, y + 204, { color: C.rule });
    T(s, bio, x + 24, y + 216, w - 48, 170, { size: 20, ls: 1.5 });
  });
  note(s, "出典：当社サイト。氏名は登記簿の表記です。", { y: 482 });
}

// 23 執行役員・メンバー
{
  const s = slide("PF_WHITE", "04 経営メンバー");
  tab(s, "執行役員・メンバー");
  const ppl = [["執行役員", "一瀬 光希", "社長室上席マネージャー", "広報と社長室の実務、取材や\n動画企画、社外との調整を担う"], ["CTO", "増山 とみき", "情報システム管理室長", "情報システムと開発を統括。\nAirReachの計測と品質を高める"], ["CAIO", "William Asai", "AI事業領域の最高責任者", "Adctorの技術要件と検証を担当。\n記録から分配までを設計する"], ["CTO室", "山根 たいち", "上席マネージャー", "AirReachの計測とWeb実装。\n名前と出典を分けて集計する"]];
  ppl.forEach(([r, n, t, bio], i) => {
    const x = 60 + (i % 2) * 440, y = 66 + Math.floor(i / 2) * 210, w = 410;
    rect(s, x, y, w, 194, { fill: i === 2 ? C.accSoft : C.page, r: 14, shadow: 1 });
    face(s, x + 20, y + 20, 72, n, null);
    T(s, r, x + 108, y + 18, 150, 28, { font: ENS, size: 22, color: i === 2 ? C.accText : C.key, ls: 1 });
    T(s, n, x + 108, y + 50, 280, 34, { size: 24, bold: true, ls: 1 });
    T(s, t, x + 20, y + 100, w - 40, 28, { size: 20, bold: true, color: C.navy, ls: 1 });
    T(s, bio, x + 20, y + 132, w - 40, 58, { size: 20, ls: 1.35 });
  });
}

// ===== 05 会社概要 =====
chapter(5, "Company", "会社概要", "株式会社Trillion Bank\n（トリリオンバンク）", [], "05 会社概要");

// 25 会社概要
{
  const s = slide("PF_WHITE", "05 会社概要");
  img(s, A7("panel.jpg"), 640, 0, 320, 540);
  img(s, PF("tb_symbol_white.png"), 670, 150, 260, 200);
  img(s, A5("tb_logo_white.png"), 670, 370, 260, 260 / 11.08);
  tab(s, "会社概要");
  const rows = [["会社名", "株式会社Trillion Bank（トリリオンバンク）"], ["設立", "2025年12月23日"], ["所在地", "〒102-0083 東京都千代田区麹町六丁目2番1号\n麹町サイトビル6階 ROOMZ"], ["代表者", "代表取締役社長　井上 幹太"], ["資本金", "1,050万4,000円"], ["事業", "AirReach（AI広告・AI検索対策）\nAdctor（AIの料金所・研究開発）"]];
  const hs = [42, 42, 70, 42, 42, 70];
  let y = 66;
  rows.forEach(([k, v], i) => {
    T(s, k, 60, y, 100, hs[i], { size: 20, bold: true, color: C.key, valign: "middle", ls: 1 });
    T(s, v, 160, y, 470, hs[i], { size: 20, valign: "middle", ls: 1.35 });
    y += hs[i];
    line(s, 60, y, 620, y, { color: C.rule });
  });
  note(s, "※当社は銀行業を営む会社ではありません。出典：登記簿・当社サイト", { y: 440, w: 560 });
}

// 26 資本金と株式
{
  const s = slide("PF_LIGHT", "05 会社概要");
  tab(s, "資本金と株式");
  T(s, [tx("設立から約10か月で、資本金は"), em("約21倍", { hl: C.accSoft, color: C.ink }), tx("に")], 60, 60, 840, 44, { size: 30, bold: true, ls: 1 });
  const bars = [["2025年12月\n設立時", 50, "50万円"], ["2026年6月", 550.4, "550万4,000円"], ["2026年10月", 1050.4, "1,050万\n4,000円"]];
  const base = 404;
  bars.forEach(([lab, v, t], i) => {
    const h = Math.max(8, 220 * v / 1050.4), x = 90 + i * 170, last = i === 2;
    rect(s, x, base - h, 120, h, { fill: last ? C.navy : C.light, shadow: last ? 2 : 1 });
    if (last) T(s, t, x, base - h + 12, 120, 56, { size: 20, bold: true, color: C.white, align: "center", ls: 1.2 });
    else T(s, t, x - 30, base - h - 34, 180, 30, { size: 20, bold: true, align: "center", valign: "bottom", ls: 1.2 });
    T(s, lab, x - 30, base + 6, 180, 50, { size: 20, color: C.sub, align: "center", ls: 1.2 });
  });
  line(s, 70, base, 560, base, { color: C.ink });
  oval(s, 322, 128, 104, 104, { fill: C.acc, shadow: true });
  T(s, "約\n21倍", 322, 128, 104, 104, { size: 24, bold: true, align: "center", valign: "middle", ls: 1.1 });
  const rx = 600, rw = 320;
  rect(s, rx, 128, rw, 330, { fill: C.white, r: 14, shadow: 2 });
  T(s, "株式の情報", rx + 24, 144, rw - 48, 32, { size: 22, bold: true, color: C.key, ls: 1 });
  [["発行済みの株式", "5,806株"], ["発行できる上限", "50万株"], ["株式の発行", "設立後に2回"], ["株式を譲るとき", "代表取締役の承認が必要"]].forEach(([k, v], i) => {
    const y = 188 + i * 64;
    T(s, k, rx + 24, y, rw - 48, 26, { size: 20, color: C.sub, ls: 1 });
    T(s, v, rx + 24, y + 26, rw - 48, 30, { size: 22, bold: true, ls: 1 });
  });
  note(s, "出典：登記簿（2026年11月6日発行）", { y: 486 });
}

// 27 メディア掲載
{
  const s = slide("PF_WHITE", "05 会社概要");
  tab(s, "メディア掲載");
  head(s, "In the Media", { size: 34 });
  [["令和の虎 CHANNEL", "人財版"], ["令和の虎 CHANNEL", "受験生版"], ["Nontitle", "Season 6"], ["SBI証券", "ビジネスドライブ"]].forEach(([a, b], i) => {
    const x = 60 + (i % 2) * 440, y = 130 + Math.floor(i / 2) * 150, w = 410;
    rect(s, x + 10, y + 10, w, 124, { fill: C.tint, r: 14 });
    rect(s, x, y, w, 124, { fill: C.white, r: 14, shadow: 2 });
    rect(s, x, y, 12, 124, { fill: i === 2 ? C.acc : C.navy });
    T(s, a, x + 36, y + 22, w - 60, 40, { size: 26, bold: true, ls: 1 });
    T(s, b, x + 36, y + 70, w - 60, 32, { size: 22, color: C.key, ls: 1 });
  });
  note(s, "出典：当社サイト「メディア掲載」", { y: 474 });
}

// 28 お問い合わせ
{
  const s = slide("PF_BARE", "05 会社概要", "hero_dark.jpg");
  img(s, PF("tb_symbol_white.png"), 600, 80, 320, 246);
  T(s, "Get to Ready", 60, 70, 500, 56, { font: EN, size: 44, color: C.white, ls: 1 });
  T(s, "AI検索での見え方の確認から、\nAirReachの導入、Adctorの共同実証まで。\nお気軽にご相談ください。", 60, 140, 520, 120, { size: 24, bold: true, color: C.white, ls: 1.5 });
  [["お問い合わせ", C.acc, C.ink], ["無料AI検索診断（約30秒）", C.white, C.navy], ["商談を予約", C.key, C.white]].forEach(([t, f, c], i) => {
    rect(s, 60, 300 + i * 64, 420, 52, { fill: f, r: 26, shadow: 1 });
    T(s, t, 60, 300 + i * 64, 420, 52, { size: 22, bold: true, color: c, align: "center", valign: "middle", ls: 1 });
  });
  img(s, A5("tb_logo_white.png"), 600, 380, 300, 300 / 11.08);
  T(s, "株式会社Trillion Bank", 600, 420, 300, 30, { size: 20, bold: true, color: C.white, ls: 1 });
}

pres.writeFile({ fileName: OUT }).then(async (f) => {
  try {
    const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
    await applyTheme(f, { name: "Trillion Bank", headFontFace: JP, bodyFontFace: JP, colors: { dk1: "111318", lt1: "FFFFFF", dk2: "0B2F7A", lt2: "EAF1FF", accent1: "1762E8", accent2: "FFB020", accent3: "0B2F7A", accent4: "8DB3F4", accent5: "667085", accent6: "0E9F6E", hlink: "1762E8", folHlink: "667085" } });
  } catch (e) { console.warn("theme not applied:", e.message); }
  console.log("wrote", f, "slides", N);
});
