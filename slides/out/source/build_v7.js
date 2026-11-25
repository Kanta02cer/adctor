// Adctor 会社・事業紹介 v7 — SmartHR Company Profile の構成を参照（配色は TB で統一）
// 生成: build_v7.sh（make_screens_v7.js → make_bg_v7.py → このスクリプト）
// 方針：
//  - 文字は 20pt 以上（16:9 の画面を A4 横に縮小印刷しても約16pt以上）。20pt 未満を書くと止まる
//  - ふだんの言葉で書く。造語・サービス名には読みと注釈を付ける
//  - 配色：TB blue #1762E8／濃紺 #0B2F7A／薄面 #EAF1FF／文字 #111318／補助 #667085／差し色 #FFB020
//  - 参照資料の写真・ロゴ・図版・文言・数値は使わない
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.resolve(__dirname, "..", "Adctor_TB_CompanyProfile_v7.pptx");
const A5 = (n) => path.join(__dirname, "assets_v5", n);
const A7 = (n) => path.join(__dirname, "assets_v7", n);

const C = {
  white: "FFFFFF", ink: "111318", key: "1762E8", navy: "0B2F7A", deep: "0E46B8", mid: "4C86EE", light: "8DB3F4",
  tint: "EAF1FF", page: "F5F8FE", sub: "667085", rule: "DDE2EA", acc: "FFB020", accSoft: "FFF3D6", accText: "8A5300",
};
const JP = "Noto Sans JP", EN = "Inter", ENS = "Inter SemiBold";
const MIN = 20;
const P = (v) => v / 72;
let SLIDE_NO = 0;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Trillion Bank";
pres.company = "Trillion Bank";
pres.title = "株式会社Trillion Bank 会社・事業紹介";
pres.theme = { headFontFace: JP, bodyFontFace: JP };

// ---------- 部品 ----------
function T(s, text, x, y, w, h, o = {}) {
  const size = o.size || 20;
  if (size < MIN) throw new Error(`font ${size}pt < ${MIN}pt on slide ${SLIDE_NO}: ${String(text).slice(0, 20)}`);
  const runs = Array.isArray(text) ? text.map((r) => {
    if ((r.options && r.options.fontSize || size) < MIN) throw new Error(`run font < ${MIN}pt on slide ${SLIDE_NO}`);
    return r;
  }) : text;
  s.addText(runs, {
    x: P(x), y: P(y), w: P(w), h: P(h), fontFace: o.font || JP, fontSize: size, color: o.color || C.ink,
    bold: !!o.bold, align: o.align || "left", valign: o.valign || "top", margin: 0, isTextBox: true, lang: "ja-JP",
    fit: "none", lineSpacingMultiple: o.ls || 1.35, charSpacing: o.cs,
  });
}
const em = (t, o = {}) => ({ text: t, options: { color: o.color || C.key, bold: true, highlight: o.hl, fontSize: o.size, fontFace: o.font } });
const tx = (t, o = {}) => ({ text: t, options: { color: o.color, bold: o.bold, fontSize: o.size, fontFace: o.font, breakLine: o.br } });
// 行ごとに runs を並べる（行末だけ改行）。強調を含む段落の行間を揃えるため
const lines = (arr) => arr.flatMap((ln, i) => { const rs = (Array.isArray(ln) ? ln : [ln]).map((r) => (typeof r === "string" ? { text: r, options: {} } : { text: r.text, options: { ...r.options } })); if (i < arr.length - 1) rs[rs.length - 1].options.breakLine = true; return rs; });
function rect(s, x, y, w, h, o = {}) {
  const r = o.r || 0;
  s.addShape(r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
    x: P(x), y: P(y), w: P(w), h: P(h), rectRadius: r ? P(r) : undefined,
    fill: o.fill ? { color: o.fill, transparency: o.tr } : { type: "none" },
    line: o.lc ? { color: o.lc, width: o.lw || 1, dashType: o.dash || "solid" } : { type: "none" },
    shadow: o.shadow ? { type: "outer", color: "0B2F7A", opacity: o.shadow === 2 ? 0.28 : 0.16, blur: o.shadow === 2 ? 16 : 10, offset: o.shadow === 2 ? 8 : 4, angle: 90 } : undefined,
  });
}
function oval(s, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.OVAL, { x: P(x), y: P(y), w: P(w), h: P(h), fill: { color: o.fill || C.key }, line: o.lc ? { color: o.lc, width: o.lw || 2 } : { type: "none" },
    shadow: o.shadow ? { type: "outer", color: "0B2F7A", opacity: 0.25, blur: 12, offset: 6, angle: 90 } : undefined });
}
function shape(s, kind, x, y, w, h, o = {}) {
  s.addShape(pres.shapes[kind], { x: P(x), y: P(y), w: P(w), h: P(h), rotate: o.rot, flipH: o.flipH, fill: { color: o.fill || C.key }, line: { type: "none" } });
}
function line(s, x1, y1, x2, y2, o = {}) {
  s.addShape(pres.shapes.LINE, { x: P(Math.min(x1, x2)), y: P(Math.min(y1, y2)), w: P(Math.abs(x2 - x1)), h: P(Math.abs(y2 - y1)), flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.color || C.rule, width: o.w || 1, dashType: o.dash || "solid", endArrowType: o.arrow ? "triangle" : undefined } });
}
function img(s, file, x, y, w, h) { s.addImage({ path: file, x: P(x), y: P(y), w: P(w), h: P(h) }); }
const dev = (s, f, x, y, w) => { const r = f.includes("laptop") ? 1145 / 1640 : 1305 / 680; img(s, A7(f), x, y, w, w * r); };
// SmartHR 型：左上の見出しタブ（白地・黒の細枠）
function tab(s, text, x = 22, y = 14, o = {}) {
  const w = [...text].reduce((a, ch) => a + (/[ -~]/.test(ch) ? 11.5 : 20), 0) + 26;
  rect(s, x, y, w, 34, { fill: o.fill || C.white, lc: o.lc || C.ink, lw: 1 });
  T(s, text, x, y, w, 34, { size: 20, align: "center", valign: "middle", color: o.color || C.ink, ls: 1 });
  return w;
}
// 帯ピル（カードの見出し：琥珀→淡青のグラデーション）
function gpill(s, text, x, y, w, h = 40) {
  img(s, A7("pill.png"), x, y, w, h);
  T(s, text, x, y, w, h, { size: 20, bold: true, color: C.navy, align: "center", valign: "middle", ls: 1 });
}
function num(s, n, x, y, d = 44, o = {}) {
  oval(s, x, y, d, d, { fill: o.fill || C.key, shadow: true });
  T(s, String(n), x, y, d, d, { font: ENS, size: o.size || 22, color: o.color || C.white, align: "center", valign: "middle", ls: 1 });
}
function note(s, text, o = {}) { T(s, text, o.x || 60, o.y || 478, o.w || 820, 28, { size: 20, color: o.color || C.sub, ls: 1.1 }); }

// ---------- 枠（レイアウト） ----------
const pageNum = (light) => ({ x: P(880), y: P(498), w: P(60), h: P(28), fontFace: EN, fontSize: 20, color: light ? C.sub : C.white, align: "right", margin: 0, valign: "middle" });
pres.defineSlideMaster({ title: "TB_WHITE", background: { color: C.white }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(true) });
pres.defineSlideMaster({ title: "TB_LIGHT", background: { color: C.page }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(true) });
pres.defineSlideMaster({ title: "TB_BLUE", background: { color: C.key }, objects: [{ image: { x: 0, y: 0, w: P(8), h: P(540), path: A7("strip.png") } }], slideNumber: pageNum(false) });
pres.defineSlideMaster({ title: "TB_BARE", background: { color: C.white }, objects: [] });

function slide(master, section, bg) {
  SLIDE_NO += 1;
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  if (bg) s.background = { path: A7(bg) };
  return s;
}
function chapter(n, en, jp, imgName, section) {
  pres.addSection({ title: section });
  const s = slide("TB_WHITE", section);
  img(s, A7(imgName), 20, 58, 940, 482);
  img(s, A7("band.png"), 40, 24, 920, 58);
  // 重なる見出しの箱（番号・英語・日本語）
  rect(s, 20, 24, 64, 46, { fill: C.white, lc: C.ink, lw: 1.25 });
  T(s, String(n).padStart(2, "0"), 20, 24, 64, 46, { font: ENS, size: 28, align: "center", valign: "middle", ls: 1 });
  const ew = en.length * 27 + 60;
  rect(s, 20, 70, ew, 70, { fill: C.white, lc: C.ink, lw: 1.25, shadow: 1 });
  T(s, en, 38, 70, ew - 36, 70, { font: EN, size: 44, valign: "middle", ls: 1 });
  rect(s, 20, 140, jp.length * 28 + 30, 44, { fill: C.white, lc: C.ink, lw: 1.25 });
  T(s, jp, 20, 140, jp.length * 28 + 30, 44, { size: 26, bold: true, align: "center", valign: "middle", ls: 1 });
  return s;
}

// =====================================================================
// 1 表紙
pres.addSection({ title: "表紙" });
{
  const s = slide("TB_BARE", "表紙", "cover.jpg");
  img(s, A5("tb_logo_white.png"), 64, 92, 380, 380 / 11.08);
  T(s, "Company Profile", 64, 150, 600, 56, { font: EN, size: 44, color: C.white, ls: 1 });
  T(s, "会社と事業のご紹介", 64, 210, 500, 34, { size: 24, bold: true, color: C.white, ls: 1 });
  T(s, "2026.11.25 更新", 64, 248, 300, 26, { font: EN, size: 20, color: C.white, ls: 1 });
  T(s, "株式会社Trillion Bank", 64, 470, 500, 30, { size: 22, bold: true, color: C.navy, ls: 1 });
}

// 2 目次
{
  const s = slide("TB_WHITE", "表紙");
  rect(s, 48, 40, 186, 62, { fill: C.white, lc: C.key, lw: 2 });
  T(s, "INDEX", 48, 40, 186, 62, { font: ENS, size: 40, color: C.key, align: "center", valign: "middle", ls: 1 });
  rect(s, 48, 102, 80, 36, { fill: C.key });
  T(s, "目次", 48, 102, 80, 36, { size: 22, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  const items = [["01", "会社概要", "Company Profile", "03"], ["02", "なぜ今か", "Why Now", "14"], ["03", "仕組み", "How It Works", "18"], ["04", "実証実験の計画", "Proof of Concept", "22"], ["05", "会社情報", "Appendix", "26"]];
  items.forEach(([n, jp, en, pg], i) => {
    const y = 60 + i * 86;
    T(s, n, 330, y, 60, 34, { font: ENS, size: 26, color: C.key, ls: 1 });
    T(s, jp, 390, y - 2, 300, 38, { size: 28, bold: true, ls: 1 });
    T(s, en, 390, y + 38, 300, 26, { font: EN, size: 20, color: C.sub, ls: 1 });
    line(s, 690, y + 22, 830, y + 22, { color: C.light, dash: "sysDot", w: 1.5 });
    T(s, "P." + pg, 840, y + 6, 80, 30, { font: EN, size: 22, ls: 1 });
  });
}

// ===== 01 会社概要 =====
chapter(1, "Company Profile", "会社概要", "chapter_01.jpg", "01 会社概要");

// 4 ミッション（重なった画面のコラージュ）
{
  const s = slide("TB_WHITE", "01 会社概要");
  tab(s, "私たちの目指すこと");
  img(s, A7("collage_mission.png"), 24, 62, 480, 436);
  T(s, "Our Mission", 520, 70, 400, 30, { font: EN, size: 22, color: C.key, ls: 1 });
  T(s, [tx("価値を生む人に、", { br: true }), em("価値が還る社会", { color: C.ink, hl: C.accSoft }), tx("をつくる。")], 520, 104, 420, 96, { size: 32, bold: true, ls: 1.4 });
  T(s, "AIが答えを作るとき、その元には\n必ず、情報を作った人がいます。\n作った人が正しく認められ、\nお金を受け取れる。\nそんな当たり前を、仕組みにします。", 520, 218, 420, 200, { size: 22, ls: 1.55 });
  note(s, "※「還る」＝元に戻ってくること", { x: 520, w: 420, y: 470 });
}

// 5 代表紹介（写真がパネルの境目に重なる）
{
  const s = slide("TB_WHITE", "01 会社概要");
  img(s, A7("panel.jpg"), 600, 0, 360, 540);
  tab(s, "代表紹介");
  rect(s, 528, 112, 300, 300, { fill: C.white, shadow: 2 });
  img(s, A5("ceo.jpg"), 540, 124, 276, 276);
  T(s, "株式会社Trillion Bank", 60, 92, 440, 30, { size: 22, color: C.sub, ls: 1 });
  T(s, "代表取締役", 60, 132, 300, 32, { size: 24, bold: true, color: C.key, ls: 1 });
  T(s, "井上 幹太", 60, 168, 400, 64, { size: 48, bold: true, ls: 1 });
  rect(s, 60, 250, 70, 6, { fill: C.acc });
  T(s, [tx("累計"), em("1億回", { hl: C.accSoft, color: C.ink }), tx("再生された\nリアリティー番組「Nontitle」に\n最年少で出演。\nZ世代のチームのリーダーとしても\n活躍しました。")], 60, 272, 450, 180, { size: 22, ls: 1.55 });
  note(s, "※Z世代：1990年代後半以降の生まれ。出典：当社資料", { y: 486, w: 540 });
}

// 6 提供する価値（青い面＋端末）
{
  const s = slide("TB_BLUE", "01 会社概要", "hero_blue.jpg");
  img(s, A5("tb_logo_white.png"), 60, 70, 300, 300 / 11.08);
  T(s, "AIの回答から、\n選択肢へ。", 60, 120, 460, 140, { size: 48, bold: true, color: C.white, ls: 1.3 });
  T(s, [tx("AIに", { color: C.white }), em("見つけてもらう", { color: C.acc }), tx("。\nAIに使われた分を、", { color: C.white }), em("受け取る", { color: C.acc }), tx("。\n2つの事業で、発信する人を支えます。", { color: C.white })], 60, 290, 440, 120, { size: 24, bold: true, ls: 1.55 });
  dev(s, "dev_laptop_ledger.png", 440, 92, 470);
  dev(s, "dev_phone_payout.png", 790, 190, 150);
  T(s, "試作画面・数字は見本", 560, 446, 300, 28, { size: 20, color: C.white, ls: 1 });
}

// 7 2つの事業（重なる番号・浮いたカード）
{
  const s = slide("TB_LIGHT", "01 会社概要");
  tab(s, "私たちの事業");
  T(s, [tx("AIと発信する人のあいだを整える、"), em("2つの事業")], 60, 62, 840, 44, { size: 30, bold: true, align: "center", ls: 1 });
  const cards = [
    ["AirReach", "エアリーチ", "提供中", true, "AIに聞いても、\n自社が紹介されない", "AIが読み取りやすいよう、\nサイトの情報や記事を整える"],
    ["Adctor", "アドクトル", "準備中", false, "自社のデータが、知らない\nうちにAIに使われている", "条件を決めて記録し、\nお金を受け取れるように"],
  ];
  cards.forEach(([name, kana, st, live, pain, act], i) => {
    const x = 60 + i * 440, y = 136, w = 400;
    rect(s, x + 10, y + 12, w, 322, { fill: live ? C.tint : C.rule, r: 14 });
    rect(s, x, y, w, 322, { fill: C.white, r: 14, shadow: 2 });
    T(s, name, x + 28, y + 18, 260, 44, { font: EN, size: 34, bold: true, color: C.key, ls: 1 });
    T(s, kana, x + 28, y + 60, 260, 28, { size: 20, color: C.sub, ls: 1 });
    oval(s, x + w - 92, y - 22, 92, 92, { fill: live ? C.acc : C.white, lc: live ? undefined : C.key, lw: 2.5, shadow: true });
    T(s, st, x + w - 92, y - 22, 92, 92, { size: 22, bold: true, color: live ? C.ink : C.key, align: "center", valign: "middle", ls: 1 });
    T(s, "こんな悩みに", x + 28, y + 94, 300, 28, { size: 20, color: C.sub, ls: 1 });
    T(s, pain, x + 28, y + 120, w - 56, 62, { size: 22, bold: true, ls: 1.3 });
    line(s, x + 28, y + 190, x + w - 28, y + 190, { color: C.rule });
    T(s, "私たちがすること", x + 28, y + 200, 300, 28, { size: 20, color: C.sub, ls: 1 });
    T(s, act, x + 28, y + 228, w - 56, 88, { size: 22, color: C.key, bold: true, ls: 1.3 });
  });
  note(s, "※AirReach・Adctorは、当社が名付けたサービス名（造語）です。", { y: 482 });
}

// 8 AirReach の紹介（左に文章、右に青いパネル、端末が境目に重なる）
{
  const s = slide("TB_LIGHT", "01 会社概要");
  img(s, A7("panel.jpg"), 560, 0, 400, 540);
  tab(s, "事業の紹介");
  T(s, [tx("AirReach", { font: EN, color: C.key }), tx("（エアリーチ）", { size: 22, color: C.sub })], 60, 70, 480, 50, { size: 36, bold: true, ls: 1 });
  T(s, "AIの回答で、会社やお店が\n紹介されるように", 60, 128, 480, 80, { size: 28, bold: true, ls: 1.35 });
  T(s, lines(["ChatGPTなどのAIに質問されたとき、", "自社の情報が正しく紹介されるよう、", [em("サイトの情報や記事を整えます", { hl: C.accSoft, color: C.ink }), "。"], " ", "広告の枠を買うサービスではありません。"]), 60, 226, 470, 190, { size: 22, ls: 1.45 });
  dev(s, "dev_laptop_site.png", 470, 70, 470);
  ["1 表示を確認", "2 改善を計画", "3 記事を作る", "4 結果を確認"].forEach((t, i) => {
    const x = 600 + (i % 2) * 176, y = 404 + Math.floor(i / 2) * 50;
    rect(s, x, y, 166, 40, { fill: C.white, r: 20, shadow: 1 });
    T(s, t, x, y, 166, 40, { size: 20, bold: true, color: C.navy, align: "center", valign: "middle", ls: 1 });
  });
  note(s, "画面：当社サイト", { x: 60, w: 300, y: 486 });
}

// 9 AirReach の料金（帯ピルが重なるカード）
{
  const s = slide("TB_LIGHT", "01 会社概要");
  tab(s, "AirReachの料金");
  T(s, "目的に合わせて選べる、3つのプラン", 60, 62, 840, 44, { size: 30, bold: true, ls: 1 });
  const plans = [["モニター", "5", "10万円", "1店舗", "月4本", "1店舗を手軽に改善"], ["インサイト", "12", "20万円", "最大3店舗", "月8本", "複数の店舗を改善"], ["丸投げ", "20", "30万円", "最大10店舗", "月12本", "計画からまるごと任せる"]];
  plans.forEach(([n, m, init, shop, art, rec], i) => {
    const x = 60 + i * 284, y = 140, w = 260;
    rect(s, x, y, w, 320, { fill: C.white, r: 12, shadow: 2 });
    gpill(s, n, x + 20, y - 20, w - 40, 42);
    s.addText([{ text: "月", options: { fontFace: JP, fontSize: 22, bold: true, color: C.ink } }, { text: m, options: { fontFace: EN, fontSize: 64, bold: true, color: C.key } }, { text: "万円", options: { fontFace: JP, fontSize: 24, bold: true, color: C.key } }],
      { x: P(x), y: P(y + 34), w: P(w), h: P(84), margin: 0, align: "center", valign: "middle", isTextBox: true, lang: "ja-JP" });
    [["初期費用", init], ["対象", shop], ["記事", art]].forEach(([k, v], j) => {
      const yy = y + 130 + j * 40;
      T(s, k, x + 22, yy, 90, 30, { size: 20, color: C.sub, ls: 1 });
      T(s, v, x + 96, yy, w - 116, 30, { size: 22, bold: true, align: "right", ls: 1 });
    });
    rect(s, x + 16, y + 256, w - 32, 48, { fill: i === 2 ? C.accSoft : C.tint, r: 8 });
    T(s, rec, x + 16, y + 256, w - 32, 48, { size: 20, bold: true, color: i === 2 ? C.accText : C.navy, align: "center", valign: "middle", ls: 1 });
  });
  note(s, "税抜・12か月契約。AIでの紹介や売上を約束するものではありません。", { y: 482 });
}

// 10 AirReach の実績（数字カード）
{
  const s = slide("TB_WHITE", "01 会社概要");
  tab(s, "導入の例");
  T(s, "口コミサイトで、\nAIからの表示が増えました", 60, 64, 520, 92, { size: 30, bold: true, ls: 1.35 });
  T(s, "口コミ・評判サイト\n「みんなの評判.com」\n（運営：メディくる）", 620, 70, 300, 96, { size: 22, color: C.sub, ls: 1.4 });
  const cards = [["表示された回数", "2,227", "回", "約1か月強で"], ["クリックされた回数", "100", "回", "約1か月強で"], ["検索での順位", "1.55", "位", "「セノリッチ 口コミ」"]];
  cards.forEach(([k, v, u, sub], i) => {
    const x = 60 + i * 284, y = 196, w = 260;
    rect(s, x, y, w, 236, { fill: C.white, lc: C.rule, r: 10, shadow: 1 });
    gpill(s, k, x + 16, y + 16, w - 32, 42);
    s.addText([{ text: v, options: { fontFace: EN, fontSize: 64, color: C.navy } }, { text: u, options: { fontFace: JP, fontSize: 26, bold: true, color: C.navy } }],
      { x: P(x), y: P(y + 70), w: P(w), h: P(96), margin: 0, align: "center", valign: "middle", isTextBox: true, lang: "ja-JP" });
    T(s, sub, x, y + 176, w, 34, { size: 20, color: C.sub, align: "center", ls: 1 });
  });
  note(s, "期間：2026/7/27〜9/3。出典：当社資料。結果は約束できません。", { y: 470 });
}

// 11 Adctor の紹介
{
  const s = slide("TB_LIGHT", "01 会社概要");
  img(s, A7("panel.jpg"), 560, 0, 400, 540);
  tab(s, "事業の紹介");
  T(s, [tx("Adctor", { font: EN, color: C.key }), tx("（アドクトル）", { size: 22, color: C.sub })], 60, 70, 480, 50, { size: 36, bold: true, ls: 1 });
  T(s, "データが使われた分を、\n作った人が受け取れるように", 60, 128, 480, 80, { size: 28, bold: true, ls: 1.35 });
  T(s, lines(["AIなどにデータを渡すとき、", "使う条件と価格を先に決め、", [em("使われた記録", { hl: C.accSoft, color: C.ink }), "を残します。"], "その記録から、請求と分配を行います。"]), 60, 226, 470, 160, { size: 22, ls: 1.45 });
  rect(s, 60, 404, 330, 46, { fill: C.acc, r: 23, shadow: 1 });
  T(s, "準備中：実証実験を計画中", 60, 404, 330, 46, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 });
  dev(s, "dev_laptop_ledger.png", 470, 92, 430);
  dev(s, "dev_phone_payout.png", 800, 200, 140);
  T(s, "試作画面・数字は見本", 600, 470, 300, 28, { size: 20, color: C.white, ls: 1 });
}

// 12 試作画面でできること（画面がカードの上にはみ出す）
{
  const s = slide("TB_LIGHT", "01 会社概要");
  tab(s, "Adctorの試作画面");
  T(s, "パソコンの画面で、3つのことができます", 60, 62, 840, 44, { size: 30, bold: true, ls: 1 });
  const cards = [["scr_d_agree.png", "合意の内容", "使う条件と価格を、\n両社で確かめて承認"], ["scr_d_ledger.png", "取得の記録", "使われるたびに、\n日時と相手を記録"], ["scr_d_bill.png", "請求と入金", "記録から請求し、\n振込と照らし合わせる"]];
  cards.forEach(([f, h, d], i) => {
    const x = 60 + i * 284, y = 196, w = 260;
    rect(s, x, y, w, 260, { fill: C.white, r: 12, shadow: 2 });
    rect(s, x + 14, y - 72, w - 28, (w - 28) / 1.6 + 8, { fill: C.white, lc: C.rule, r: 6, shadow: 1 });
    img(s, A7(f), x + 18, y - 68, w - 36, (w - 36) / 1.6);
    num(s, i + 1, x + 18, y + 96, 40);
    T(s, h, x + 68, y + 98, w - 80, 36, { size: 24, bold: true, color: C.key, valign: "middle", ls: 1 });
    T(s, d, x + 22, y + 152, w - 44, 80, { size: 20, ls: 1.45 });
  });
  note(s, "試作画面です。数字・社名はすべて見本です。", { y: 482 });
}

// 13 スマートフォンでも（端末が重なり、パネルの外へはみ出す）
{
  const s = slide("TB_WHITE", "01 会社概要");
  rect(s, 20, 70, 430, 420, { fill: C.tint, r: 24 });
  tab(s, "スマートフォンの試作画面");
  dev(s, "dev_phone_approve.png", 40, 70, 210);
  dev(s, "dev_phone_payout.png", 230, 110, 210);
  T(s, "スマートフォンでも、\nその場で確かめられます", 500, 78, 430, 92, { size: 30, bold: true, ls: 1.35 });
  [["買い手", "使う条件を読んで、\nその場で承認できる"], ["提供企業", "今月の分配と、\n最近使われた記録が見られる"]].forEach(([k, v], i) => {
    const y = 210 + i * 120;
    rect(s, 500, y, 420, 100, { fill: C.white, lc: C.rule, r: 12, shadow: 1 });
    rect(s, 500, y, 10, 100, { fill: i ? C.key : C.acc });
    T(s, k, 526, y + 12, 200, 30, { size: 22, bold: true, color: i ? C.key : C.accText, ls: 1 });
    T(s, v, 526, y + 42, 380, 56, { size: 20, ls: 1.35 });
  });
  note(s, "試作画面です。数字・社名はすべて見本です。", { x: 500, w: 430, y: 470 });
}

// ===== 02 なぜ今か =====
chapter(2, "Why Now", "なぜ今か", "chapter_02.jpg", "02 なぜ今か");

// 15 大見出し（空色の面）
{
  const s = slide("TB_BLUE", "02 なぜ今か", "hero_sky.jpg");
  tab(s, "いま起きていること");
  T(s, "AIが、", 70, 80, 400, 80, { size: 54, bold: true, color: C.white, ls: 1 });
  T(s, "答える時代。", 60, 150, 860, 150, { size: 110, bold: true, color: C.white, ls: 1 });
  T(s, [tx("調べものの答えを、AIから受け取る人が増えています。\nけれど、答えの元になった情報を作った人には、\n"), em("お金も記録も、ほとんど届いていません", { color: C.navy, hl: C.accSoft }), tx("。")], 70, 318, 840, 120, { size: 24, bold: true, color: C.white, ls: 1.55 });
  note(s, "当社の見方です。数字は、出どころを確かめられたものから載せていきます。", { color: C.white, y: 474 });
}

// 16 3つの変化（番号がカードの角に重なる）
{
  const s = slide("TB_LIGHT", "02 なぜ今か");
  tab(s, "3つの変化");
  T(s, "いま、AIと情報の関係に3つの変化があります", 60, 62, 840, 44, { size: 30, bold: true, ls: 1 });
  const cards = [["AIの答えで\n調べものが終わる", "元のページを開かずに\n済む場面が増えている", "当社の見方"], ["情報を出す側が\n条件を示し始めた", "大手のネット配信\n会社が、AI向けの\n有料の仕組みを発表", "2025年7月"], ["お金のやりとりの\n仕組みが、まだない", "条件・記録・請求を\nまとめて扱う方法が\nまだ少ない", "当社の見方"]];
  cards.forEach(([h, b, tag], i) => {
    const x = 70 + i * 284, y = 150, w = 252;
    rect(s, x + 10, y + 12, w, 312, { fill: C.tint, r: 12 });
    rect(s, x, y, w, 312, { fill: C.white, r: 12, shadow: 2 });
    num(s, i + 1, x - 22, y - 22, 56, { size: 28, fill: i === 1 ? C.acc : C.key, color: i === 1 ? C.ink : C.white });
    T(s, h, x + 22, y + 44, w - 44, 70, { size: 22, bold: true, color: C.key, ls: 1.35 });
    line(s, x + 22, y + 126, x + w - 22, y + 126, { color: C.rule });
    T(s, b, x + 22, y + 140, w - 44, 104, { size: 20, ls: 1.5 });
    rect(s, x + 22, y + 266, w - 44, 32, { fill: i === 1 ? C.ink : C.page, r: 16 });
    T(s, tag, x + 22, y + 266, w - 44, 32, { size: 20, bold: true, color: i === 1 ? C.white : C.sub, align: "center", valign: "middle", ls: 1 });
  });
}

// 17 いまの選択肢（Adctor のカードだけ浮き上がる）
{
  const s = slide("TB_WHITE", "02 なぜ今か");
  tab(s, "いまの選択肢");
  T(s, [tx("データを持つ会社の選択肢は、\n"), em("「断る」か「そのまま使わせる」か", { hl: C.accSoft, color: C.ink }), tx("に偏っています")], 60, 60, 840, 92, { size: 28, bold: true, ls: 1.4 });
  const cols = [["断る", "×", "×"], ["そのまま\n使わせる", "×", "×"], ["1社ずつ\n契約する", "○", "△"], ["条件をつけて\n提供する", "○", "○"]];
  cols.forEach(([n, money, rec], i) => {
    const hot = i === 3, w = 196, x = 60 + i * 212, y = hot ? 168 : 190;
    rect(s, x, y, w, hot ? 290 : 268, { fill: hot ? C.key : C.white, lc: hot ? undefined : C.rule, r: 12, shadow: hot ? 2 : 1 });
    T(s, n, x, y + 14, w, 64, { size: 22, bold: true, color: hot ? C.white : C.ink, align: "center", valign: "middle", ls: 1.3 });
    [["お金", money], ["記録", rec]].forEach(([k, v], j) => {
      const yy = y + 94 + j * 82;
      T(s, k, x, yy, w, 26, { size: 20, color: hot ? C.white : C.sub, align: "center", ls: 1 });
      T(s, v, x, yy + 24, w, 50, { font: EN, size: 40, bold: true, color: hot ? C.acc : (v === "×" ? C.light : C.key), align: "center", valign: "middle", ls: 1 });
    });
    if (hot) { rect(s, x + 28, y - 18, w - 56, 36, { fill: C.acc, r: 18, shadow: 1 }); T(s, "Adctorの案", x + 28, y - 18, w - 56, 36, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 }); }
  });
  note(s, "○：ある　△：契約ごとにばらばら　×：ない（当社による整理）", { y: 482 });
}

// ===== 03 仕組み =====
chapter(3, "How It Works", "仕組み", "chapter_03.jpg", "03 仕組み");

// 19 ビジネスモデル（重なる円と、上下の流れ）
{
  const s = slide("TB_LIGHT", "03 仕組み");
  tab(s, "ビジネスモデル");
  T(s, "データは右へ、お金は左へ。\nその間を、Adctorが受け持ちます", 60, 60, 840, 88, { size: 28, bold: true, ls: 1.35 });
  oval(s, 60, 200, 200, 200, { fill: C.white, lc: C.mid, lw: 3, shadow: true });
  T(s, "提供企業", 60, 262, 200, 40, { size: 26, bold: true, align: "center", ls: 1 });
  T(s, "データを\n持つ会社", 60, 304, 200, 56, { size: 20, color: C.sub, align: "center", ls: 1.25 });
  oval(s, 700, 200, 200, 200, { fill: C.white, lc: C.mid, lw: 3, shadow: true });
  T(s, "買い手企業", 700, 262, 200, 40, { size: 26, bold: true, align: "center", ls: 1 });
  T(s, "データを\n使う会社", 700, 304, 200, 56, { size: 20, color: C.sub, align: "center", ls: 1.25 });
  oval(s, 360, 170, 240, 240, { fill: C.key, shadow: true });
  T(s, "Adctor", 360, 218, 240, 50, { font: EN, size: 38, bold: true, color: C.white, align: "center", ls: 1 });
  T(s, "条件・記録・\n請求を\n受け持つ", 360, 272, 240, 96, { size: 22, bold: true, color: C.white, align: "center", ls: 1.25 });
  // 上＝データ、下＝お金
  line(s, 262, 222, 380, 222, { color: C.ink, w: 3, arrow: true }); line(s, 582, 222, 698, 222, { color: C.ink, w: 3, arrow: true });
  rect(s, 410, 152, 140, 34, { fill: C.ink, r: 17 }); T(s, "データ →", 410, 152, 140, 34, { size: 20, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  line(s, 698, 380, 582, 380, { color: C.acc, w: 3, arrow: true }); line(s, 380, 380, 262, 380, { color: C.acc, w: 3, arrow: true });
  rect(s, 410, 396, 140, 34, { fill: C.acc, r: 17 }); T(s, "← お金", 410, 396, 140, 34, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 });
  rect(s, 150, 444, 660, 40, { fill: C.white, lc: C.key, lw: 1.5, r: 20, shadow: 1 });
  T(s, [tx("当社の収入："), em("取引額の一部を手数料として受け取る"), tx("（率は検討中）")], 150, 444, 660, 40, { size: 20, bold: true, align: "center", valign: "middle", ls: 1 });
}

// 20 取引の流れ（2段・番号が重なるカード）
{
  const s = slide("TB_WHITE", "03 仕組み");
  tab(s, "取引の流れ");
  T(s, "6つの段階で、データとお金が流れます", 60, 60, 840, 44, { size: 30, bold: true, ls: 1 });
  const rows = [[["条件を決める", "使う条件と価格に\n両社が合意"], ["データを渡す", "買い手がデータを\n取り出す"], ["記録を残す", "日時と相手を\n1回ずつ記録"]], [["請求する", "記録をもとに\n買い手へ請求"], ["振込を確かめる", "請求と振込が\n合っているか確認"], ["分配する", "手数料を引いて\n提供企業へ支払う"]]];
  rows.forEach((row, r) => row.forEach(([h, d], i) => {
    const x = 80 + i * 280, y = 132 + r * 172, w = 240, money = r === 1;
    rect(s, x, y, w, 140, { fill: money ? C.accSoft : C.tint, r: 12, shadow: 1 });
    num(s, r * 3 + i + 1, x - 18, y - 16, 44, { fill: money ? C.acc : C.key, color: money ? C.ink : C.white });
    T(s, h, x + 20, y + 20, w - 40, 32, { size: 24, bold: true, color: money ? C.accText : C.key, ls: 1 });
    T(s, d, x + 20, y + 62, w - 40, 64, { size: 20, ls: 1.35 });
    if (i < 2) shape(s, "RIGHT_ARROW", x + w + 6, y + 56, 28, 28, { fill: money ? C.acc : C.key });
  }));
  note(s, "青＝データの流れ、黄＝お金の流れ。実証実験では振込の確認と分配は手作業です。", { y: 482 });
}

// 21 収益の考え方（帯の図＋差し色の吹き出し）
{
  const s = slide("TB_LIGHT", "03 仕組み");
  tab(s, "収入の考え方");
  T(s, [tx("当社の収入は、取引額のうち"), em("手数料の部分だけ", { hl: C.accSoft, color: C.ink })], 60, 60, 840, 44, { size: 30, bold: true, ls: 1 });
  T(s, "取引額（買い手が支払うお金）", 80, 140, 600, 32, { size: 22, bold: true, ls: 1 });
  rect(s, 80, 182, 600, 96, { fill: C.light, r: 8, shadow: 1 });
  T(s, "提供企業へ支払う分", 100, 182, 400, 96, { size: 24, bold: true, color: C.navy, valign: "middle", ls: 1 });
  rect(s, 680, 166, 200, 128, { fill: C.key, r: 8, shadow: 2 });
  T(s, "手数料\n＝当社の収入", 680, 166, 200, 128, { size: 24, bold: true, color: C.white, align: "center", valign: "middle", ls: 1.3 });
  oval(s, 820, 106, 110, 110, { fill: C.acc, shadow: true });
  T(s, "率は\n検討中", 820, 106, 110, 110, { size: 22, bold: true, align: "center", valign: "middle", ls: 1.2 });
  [["取引額", "そのまま当社の売上になるわけではありません"], ["分配", "振込を確かめてから、提供企業へ支払います"], ["利益", "収入から運営の費用を引いたもの（まだ計算していません）"]].forEach(([k, v], i) => {
    const y = 318 + i * 50;
    rect(s, 80, y, 100, 38, { fill: C.ink, r: 19 });
    T(s, k, 80, y, 100, 38, { size: 20, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, v, 196, y, 700, 38, { size: 20, valign: "middle", ls: 1 });
  });
  note(s, "図の大きさは比率を表しません。率と金額は、承認を経て決めます。", { y: 482 });
}

// ===== 04 実証実験の計画 =====
chapter(4, "Proof of Concept", "実証実験の計画", "chapter_04.jpg", "04 実証実験の計画");

// 23 大見出し「1×1×1」
{
  const s = slide("TB_BLUE", "04 実証実験の計画", "hero_blue.jpg");
  tab(s, "実証実験の大きさ");
  T(s, "まずは、いちばん小さな形で。", 70, 74, 800, 48, { size: 32, bold: true, color: C.white, ls: 1 });
  T(s, "1 × 1 × 1", 60, 120, 860, 170, { font: EN, size: 140, bold: true, color: C.white, ls: 1 });
  [["買い手", "1社"], ["提供企業", "1社"], ["データ", "1種類"]].forEach(([k, v], i) => {
    const x = 70 + i * 280;
    rect(s, x, 300, 250, 60, { fill: C.white, r: 30, shadow: 2 });
    T(s, [tx(k + "  ", { color: C.sub }), tx(v, { color: C.key, bold: true, size: 26 })], x, 300, 250, 60, { size: 22, bold: true, align: "center", valign: "middle", ls: 1 });
  });
  T(s, [tx("条件を決めてから、分配まで。", { br: true }), tx("お金の流れが"), em("ひと回りするか", { color: C.acc }), tx("を確かめます。")], 70, 384, 840, 80, { size: 24, bold: true, color: C.white, ls: 1.5 });
  note(s, "※実証実験：本格的に始める前に、小さく試して確かめること。すべて計画中です。", { color: C.white, y: 480 });
}

// 24 進め方（右肩上がりの段と吹き出し）
{
  const s = slide("TB_BLUE", "04 実証実験の計画", "hero_dark.jpg");
  tab(s, "進め方");
  T(s, "6つの段階を、\n1社ずつ順に確かめます", 60, 60, 440, 92, { size: 30, bold: true, color: C.white, ls: 1.35 });
  const steps = ["条件", "データ", "記録", "請求", "振込", "分配"];
  const base = 428, bw = 112, gap = 20, x0 = 90;
  steps.forEach((t, i) => {
    const h = 50 + i * 40, x = x0 + i * (bw + gap), last = i === 5;
    rect(s, x, base - h, bw, h, { fill: last ? C.acc : C.white, tr: last ? 0 : 15 + (5 - i) * 10, shadow: last ? 2 : undefined });
    T(s, t, x, base + 8, bw, 30, { size: 22, bold: true, color: C.white, align: "center", ls: 1 });
    T(s, String(i + 1), x, base - h + 8, bw, 34, { font: ENS, size: 26, color: last ? C.ink : C.navy, align: "center", ls: 1 });
  });
  line(s, x0, base, x0 + 6 * (bw + gap) - gap, base, { color: C.white, w: 1.5 });
  rect(s, 560, 72, 300, 92, { fill: C.white, r: 14, shadow: 2 });
  shape(s, "ISOSCELES_TRIANGLE", 760, 162, 30, 20, { fill: C.white, rot: 180 });
  T(s, "ここまでを、\n1社ずつで確かめる", 560, 72, 300, 92, { size: 24, bold: true, color: C.key, align: "center", valign: "middle", ls: 1.3 });
  note(s, "時期と参加企業は未定です。", { color: C.white, y: 486, x: 60 });
}

// 25 次の判断（重なったカード）
{
  const s = slide("TB_LIGHT", "04 実証実験の計画");
  tab(s, "その後の判断");
  T(s, "結果をもとに、3つのことを決めます", 60, 60, 840, 44, { size: 30, bold: true, ls: 1 });
  const cards = [["始める前", "参加する会社と\n条件を決める", "条件と価格に合意し、\n成功の基準を\n文書にする"], ["実験中", "お金の流れを\n確かめる", "請求・振込・分配が\n合っているか、\n手間はどうかを記録"], ["終わった後", "次に進むかを\n決める", "手数料の率、広げ方、\n自動化するかを\n判断する"]];
  cards.forEach(([when, h, d], i) => {
    const x = 70 + i * 284, y = 140, w = 250;
    rect(s, x + 12, y + 14, w, 300, { fill: i === 2 ? C.accSoft : C.tint, r: 14 });
    rect(s, x, y, w, 300, { fill: C.white, r: 14, shadow: 2 });
    rect(s, x + 20, y - 18, 150, 40, { fill: i === 2 ? C.acc : C.key, r: 20, shadow: 1 });
    T(s, when, x + 20, y - 18, 150, 40, { size: 22, bold: true, color: i === 2 ? C.ink : C.white, align: "center", valign: "middle", ls: 1 });
    T(s, h, x + 22, y + 44, w - 44, 66, { size: 22, bold: true, color: C.key, ls: 1.3 });
    T(s, d, x + 22, y + 140, w - 44, 140, { size: 20, ls: 1.5 });
  });
  note(s, "判断の時期と判断する人は、まだ決まっていません。", { y: 482 });
}

// ===== 05 会社情報 =====
chapter(5, "Appendix", "会社情報", "chapter_05.jpg", "05 会社情報");

// 27 会社概要（登記簿より・右に青いパネルとロゴ）
{
  const s = slide("TB_WHITE", "05 会社情報");
  img(s, A7("panel.jpg"), 640, 0, 320, 540);
  img(s, A5("tb_logo_white.png"), 660, 254, 280, 280 / 11.08);
  tab(s, "会社概要");
  const rows = [["会社名", "株式会社Trillion Bank"], ["旧社名", "Regalis Japan Group株式会社\n（2026年6月30日に変更）"], ["所在地", "東京都千代田区麹町六丁目2番1号\n麹町サイトビル6階 ROOMZ"], ["設立", "2025年12月23日"], ["代表者", "代表取締役　井上 幹太"], ["資本金", "1,050万4,000円（2026年10月31日時点）"]];
  const hs = [42, 70, 70, 42, 42, 42];
  let y = 70;
  rows.forEach(([k, v], i) => {
    T(s, k, 60, y, 110, hs[i], { size: 20, bold: true, color: C.key, valign: "middle", ls: 1 });
    T(s, v, 170, y, 470, hs[i], { size: 20, valign: "middle", ls: 1.35 });
    y += hs[i];
    line(s, 60, y, 610, y, { color: C.rule });
  });
  T(s, "事業", 60, y + 10, 110, 30, { size: 20, bold: true, color: C.key, ls: 1 });
  T(s, "AI検索対策「AirReach」\nデータ取引「Adctor」（準備中）", y > 0 ? 170 : 170, y + 10, 470, 64, { size: 20, ls: 1.35 });
  note(s, "出典：登記簿（2026年11月6日発行の証明書）", { y: 486, w: 560 });
}

// 28 資本金と株式（棒グラフ＋丸い強調）
{
  const s = slide("TB_LIGHT", "05 会社情報");
  tab(s, "資本金と株式");
  T(s, [tx("設立から約10か月で、資本金は"), em("約21倍", { hl: C.accSoft, color: C.ink }), tx("に")], 60, 60, 840, 44, { size: 30, bold: true, ls: 1 });
  const bars = [["2025年12月\n設立時", 50, "50万円"], ["2026年6月", 550.4, "550万4,000円"], ["2026年10月", 1050.4, "1,050万\n4,000円"]];
  const base = 404, maxh = 220, bw = 120;
  bars.forEach(([lab, v, txt], i) => {
    const h = Math.max(8, maxh * v / 1050.4), x = 90 + i * 170, last = i === 2;
    rect(s, x, base - h, bw, h, { fill: last ? C.key : C.light, shadow: last ? 2 : 1 });
    if (last) T(s, txt, x, base - h + 12, bw, 56, { size: 20, bold: true, color: C.white, align: "center", ls: 1.2 });
    else T(s, txt, x - 30, base - h - 34, bw + 60, 30, { size: 20, bold: true, align: "center", valign: "bottom", ls: 1.2 });
    T(s, lab, x - 30, base + 6, bw + 60, 50, { size: 20, color: C.sub, align: "center", ls: 1.2 });
  });
  line(s, 70, base, 560, base, { color: C.ink });
  oval(s, 322, 128, 104, 104, { fill: C.acc, shadow: true });
  T(s, "約\n21倍", 322, 128, 104, 104, { size: 24, bold: true, align: "center", valign: "middle", ls: 1.1 });
  // 株式の情報
  const rx = 600, rw = 320;
  rect(s, rx, 128, rw, 330, { fill: C.white, r: 14, shadow: 2 });
  T(s, "株式の情報", rx + 24, 144, rw - 48, 32, { size: 22, bold: true, color: C.key, ls: 1 });
  [["発行済みの株式", "5,806株"], ["発行できる上限", "50万株"], ["株式の発行", "設立後に2回"], ["株式を譲るとき", "代表取締役の承認が必要"]].forEach(([k, v], i) => {
    const y = 188 + i * 64;
    T(s, k, rx + 24, y, rw - 48, 26, { size: 20, color: C.sub, ls: 1 });
    T(s, v, rx + 24, y + 26, rw - 48, 30, { size: 22, bold: true, ls: 1 });
  });
  note(s, "出典：登記簿。株主の名前は登記簿に載らないため未掲載。", { y: 486 });
}

// 29 役員と外部顧問
{
  const s = slide("TB_WHITE", "05 会社情報");
  tab(s, "役員と外部顧問");
  T(s, "取締役3名と、外部顧問4名の体制です", 60, 60, 840, 44, { size: 30, bold: true, ls: 1 });
  const dir = [["代表取締役", "井上 幹太", ""], ["取締役", "平川 凜乃丞", "2026年6月に就任"], ["取締役", "芳賀 翔太", "2026年10月に就任"]];
  dir.forEach(([r, n, d], i) => {
    const x = 60 + i * 284, y = 124, w = 260;
    rect(s, x, y, w, 120, { fill: i ? C.white : C.key, lc: i ? C.rule : undefined, r: 12, shadow: i ? 1 : 2 });
    T(s, r, x + 20, y + 14, w - 40, 28, { size: 20, color: i ? C.sub : C.white, ls: 1 });
    T(s, n, x + 20, y + 44, w - 40, 40, { size: 28, bold: true, color: i ? C.ink : C.white, ls: 1 });
    if (d) T(s, d, x + 20, y + 86, w - 40, 26, { size: 20, color: C.sub, ls: 1 });
  });
  rect(s, 60, 268, 840, 38, { fill: C.accSoft, r: 19 });
  T(s, "外部顧問（大手企業の役員など）", 60, 268, 840, 38, { size: 20, bold: true, color: C.accText, align: "center", valign: "middle", ls: 1 });
  [["住友商事グループ", "SCデジタル\n執行役員"], ["大手上場企業", "ボードルア\n執行役員"], ["元 博報堂DY ONE", "データ分析・\n開発"], ["VIXTON", "役員\n（漆沢氏）"]].forEach(([o, r], i) => {
    const x = 60 + i * 213, y = 320, w = 201;
    rect(s, x, y, w, 120, { fill: C.white, lc: C.rule, r: 10, shadow: 1 });
    T(s, o, x + 14, y + 12, w - 28, 30, { size: 20, bold: true, ls: 1.1 });
    T(s, r, x + 14, y + 52, w - 28, 60, { size: 20, color: C.sub, ls: 1.2 });
  });
  note(s, "出典：取締役は登記簿、外部顧問は当社資料。顧問の掲載は各本人の了承が前提です。", { y: 482 });
}

// 30 事業の目的（登記の要約）
{
  const s = slide("TB_LIGHT", "05 会社情報");
  tab(s, "定款に定めた事業");
  T(s, "登記している事業の目的を、4つにまとめました", 60, 60, 840, 44, { size: 30, bold: true, ls: 1 });
  const g = [["AIとデータの技術", "AIや検索のしくみ、\nデータの集め方・見せ方の\n開発と提供"], ["データ利用の\n許可と精算", "データを使う条件の管理、\n使われた記録、料金の計算と\n請求の仕組み"], ["AIでの見つかりやすさ", "AI検索での表示の調査と改善、\nサイトやコンテンツの\n制作・運営"], ["そのほか", "研修・イベント、広告の代理、\n知的財産の管理、\n衣料品の企画・販売 など"]];
  g.forEach(([h, d], i) => {
    const x = 60 + (i % 2) * 430, y = 124 + Math.floor(i / 2) * 174, w = 410;
    rect(s, x, y, w, 158, { fill: C.white, r: 12, shadow: 1 });
    rect(s, x, y, 10, 158, { fill: i < 2 ? C.key : (i === 2 ? C.mid : C.light) });
    T(s, h, x + 30, y + 14, w - 50, 60, { size: 22, bold: true, color: C.key, valign: "middle", ls: 1.25 });
    T(s, d, x + 30, y + 76, w - 50, 80, { size: 20, ls: 1.3 });
  });
  note(s, "出典：登記簿の「目的」（2026年10月31日変更）を当社で要約。", { y: 482 });
}

// 31 用語の説明
{
  const s = slide("TB_WHITE", "05 会社情報");
  tab(s, "ことばの説明");
  T(s, "この資料で使ったことば", 60, 60, 840, 44, { size: 30, bold: true, ls: 1 });
  const w = [["Adctor（アドクトル）", "当社の造語。データの利用と\nお金のやりとりをつなぐサービス"], ["AirReach（エアリーチ）", "当社の造語。AIの回答で\n紹介されるための情報整備"], ["実証実験", "本格的に始める前に、\n小さく試して確かめること"], ["分配", "受け取ったお金から手数料を\n引き、提供企業へ支払うこと"], ["手数料", "取引額のうち、当社が\n受け取る分。率は検討中"], ["試作画面", "動きを確かめるために作った\n画面。数字はすべて見本"]];
  w.forEach(([k, v], i) => {
    const x = 60 + (i % 2) * 430, y = 118 + Math.floor(i / 2) * 120, ww = 410;
    rect(s, x, y, ww, 106, { fill: i < 2 ? C.accSoft : C.page, r: 10 });
    T(s, k, x + 18, y + 10, ww - 36, 30, { size: 22, bold: true, color: i < 2 ? C.accText : C.key, ls: 1 });
    T(s, v, x + 18, y + 44, ww - 36, 58, { size: 20, ls: 1.3 });
  });
}

// 32 結び
{
  const s = slide("TB_BARE", "05 会社情報", "hero_blue.jpg");
  img(s, A5("tb_logo_white.png"), 230, 236, 500, 500 / 11.08);
  T(s, "AIの回答から、選択肢へ。", 180, 310, 600, 40, { size: 26, bold: true, color: C.white, align: "center", ls: 1 });
}

pres.writeFile({ fileName: OUT }).then(async (f) => {
  try {
    const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
    await applyTheme(f, { name: "Trillion Bank v7", headFontFace: JP, bodyFontFace: JP, colors: { dk1: "111318", lt1: "FFFFFF", dk2: "0B2F7A", lt2: "EAF1FF", accent1: "1762E8", accent2: "FFB020", accent3: "0E46B8", accent4: "8DB3F4", accent5: "667085", accent6: "4C86EE", hlink: "1762E8", folHlink: "667085" } });
  } catch (e) { console.warn("theme not applied:", e.message); }
  console.log("wrote", f, "slides", SLIDE_NO);
});
