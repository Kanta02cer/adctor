// Adctor 事業説明資料 v5 — 会社概要を追加（LayerX の図表の型 × TB カラーコード）
// 使い方: cd out/source && build_v5.sh を実行
// 参照したのは配色・余白・ページ構成の型のみ。参照資料のロゴ・3Dオブジェクト・写真・社名・数値は使わない。
// 座標は pt（960 × 540）で書き、P() でインチに換算する。
const path = require("path");
const pptxgen = require("pptxgenjs");

const OUT = path.resolve(__dirname, "..", "Adctor_TB_LayerX_v5.pptx");
const BG = (n) => path.join(__dirname, "assets_v4", n);
const AS = (n) => path.join(__dirname, "assets_v5", n); // 自社資料から抽出した素材

// ---------- tokens ----------
// Trillion Bank 指定色：白 #FFFFFF／本文 #111318／要点 #1762E8／薄面 #EAF1FF／補助 #667085／罫線 #DDE2EA
// 派生色（指定色の明度違い・中間色のみ）：deep・deeper・mid・light・pale・tint2・card・mute・ui
const C = {
  white: "FFFFFF", ink: "111318", key: "1762E8", tint: "EAF1FF", sub: "667085", rule: "DDE2EA",
  deep: "0E46B8", deeper: "0B2F7A", mid: "4C86EE", light: "8DB3F4", pale: "C5D8FA",
  tint2: "F5F8FE", card: "F4F6F9", mute: "8A93A3", ui: "111318", ui2: "232936",
};
const JP = "Noto Sans JP", JPM = "Noto Sans JP Medium";
const EN = "Inter", ENM = "Inter Medium", ENS = "Inter SemiBold";
const P = (v) => v / 72;
const L = 72, R = 888, CW = R - L;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Trillion Bank";
pres.company = "Trillion Bank";
pres.title = "Adctor 事業説明資料 v5";
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
  rect(s, x, y, w, h, { fill: o.fill || C.key, lc: o.lc, r: h / 2 });
  T(s, text, x, y, w, h, { size: o.size || 12, bold: true, color: o.color || C.white, align: "center", valign: "middle", ls: 1 });
}
function tri(s, x, y, size, dir, color) { // 塗りの三角（▶ ◀ ▼）
  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, {
    x: P(x), y: P(y), w: P(size), h: P(size), rotate: dir === "right" ? 90 : dir === "left" ? 270 : 180,
    fill: { color: color || C.key }, line: { type: "none" },
  });
}
function circle(s, cx, cy, r, fill) {
  s.addShape(pres.shapes.OVAL, { x: P(cx - r), y: P(cy - r), w: P(2 * r), h: P(2 * r), fill: { color: fill }, line: { type: "none" } });
}

function band(s, name, x, y, w, h) { s.addImage({ path: BG(name), x: P(x), y: P(y), w: P(w), h: P(h) }); }
function diamond(s, cx, cy, r, fill) {
  s.addShape(pres.shapes.DIAMOND, { x: P(cx - r), y: P(cy - r), w: P(2 * r), h: P(2 * r), fill: { color: fill }, line: { type: "none" } });
}
function flow(s, x1, x2, y, color, label, o = {}) { // 太い矢印＋矢印上のラベル（p.32型）
  line(s, x1, y, x2, y, { color, w: 3, arrow: true });
  const w = o.w || 118;
  rect(s, (x1 + x2) / 2 - w / 2, y - 12, w, 24, { fill: o.fill || color, r: 3 });
  T(s, label, (x1 + x2) / 2 - w / 2, y - 12, w, 24, { size: 11.5, bold: true, color: o.text || C.white, align: "center", valign: "middle", ls: 1 });
}

// ---------- layouts ----------
function frame(light) {
  const col = light ? C.ink : C.white;
  return [
    // 公式ロゴ未受領のため文字のワードマークで仮置き
    { image: { x: P(30), y: P(25), w: P(122), h: P(122 / 11.08), path: AS(light ? "tb_logo_black.png" : "tb_logo_white.png") } },
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
  T(s, text, L, o.y || 46, CW, o.h || 42, { size: o.size || 27, bold: true, color: o.color || C.key, ls: 1.3 });
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
  s.addImage({ path: AS("tb_logo_white.png"), x: P(x), y: P(116), w: P(200), h: P(200 / 11.08) });
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
    ["私たちについて", "会社概要・事業・導入事例"], ["はじめに", "市場の変化とミッション"], ["課題", "合意・記録・対価の経路"],
    ["仕組み", "ビジネスモデルと取引の流れ"], ["実証", "1対1対1の初回PoC"], ["補足", "比較・計算式・根拠の区分"],
  ];
  items.forEach(([t, sub], i) => {
    const y = 66 + i * 68;
    T(s, String(i + 1), 455, y, 60, 50, { font: ENM, size: 40, ls: 1 });
    T(s, t, 528, y + 2, 340, 28, { size: 21, bold: true, color: C.key, ls: 1.1 });
    T(s, sub, 528, y + 32, 340, 18, { size: 11.5, bold: true, ls: 1 });
  });
}

// 4 扉 1（私たちについて）
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

// 4' 扉（はじめに）
divider(2, "はじめに", "Introduction", "AIとデータの取引に、いま起きていること", "2 はじめに");

// 5 市場の変化（p.21/22型：グラデーション見出し帯のカード）
{
  const s = slide("LX_WHITE", "2 はじめに", "市場の変化");
  title(s, "AIとコンテンツの取引に、3つの変化が起きています。");
  lead(s, "現時点では変化の方向のみを示します。数値は、出典を検証できたものから順に掲載します。");
  const cards = [
    ["CHANGE 01", "回答の場が変わる", "生成AIの回答で情報を得る人が増え、元のページを訪れない閲覧が生まれている。", "観察", "定量値は未掲載", false],
    ["CHANGE 02", "提供側が条件を示す", "大手CDN事業者が、AIクローラーに許諾・課金の条件を示す機能を公表した。", "外部公表", "2025年7月", true],
    ["CHANGE 03", "取引の事務が未整備", "許諾から記録・請求・入金・分配までを通して扱う実務の型は、まだ少ない。", "仮説", "PoCで検証", false],
  ];
  const w = (CW - 32) / 3;
  cards.forEach(([en, h, b, tag, tagNote, solid], i) => {
    const x = L + i * (w + 16), y = 152;
    band(s, "bar_key.png", x, y, w, 28);
    T(s, en, x + 14, y, w - 28, 28, { font: ENS, size: 11.5, color: C.white, valign: "middle", ls: 1, cs: 1 });
    rect(s, x, y + 28, w, 272, { fill: C.card, r: 0 });
    T(s, h, x + 20, y + 48, w - 40, 30, { size: 20, bold: true, ls: 1.2 });
    T(s, b, x + 20, y + 90, w - 40, 110, { size: 14.5, ls: 1.7 });
    rect(s, x + 20, y + 236, 72, 26, { fill: solid ? C.ink : C.mute, r: 2 });
    T(s, tag, x + 20, y + 236, 72, 26, { size: 12.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, tagNote, x + 102, y + 236, w - 122, 26, { size: 12, color: C.sub, valign: "middle", ls: 1 });
  });
  note(s, "CHANGE 02 の出典：Cloudflare公式ブログ「Introducing pay per crawl」（2025年7月公表）。CHANGE 01・03 は当社の観察・仮説。");
}

// 6 ミッション（p.9型）
{
  const s = slide("LX_DARK", "2 はじめに", "Mission", "bg_mission.jpg");
  T(s, "Mission", 110, 184, 300, 26, { font: EN, size: 18, color: C.white, ls: 1 });
  T(s, "価値を生む人に、\n価値が還る社会を。", 110, 220, 380, 100, { size: 32, bold: true, color: C.white, ls: 1.5 });
  T(s, "AIが使うデータには、それを生んだ人がいる。\nその価値が、合意した条件で作り手に還る仕組みをつくる。\n\n利用者は、権利関係を説明できるデータを使える。\n提供者は、いつ誰に取得されたかを確かめ、対価を受け取れる。\nそんな取引を、当たり前のインフラにするために。",
    480, 180, 420, 210, { size: 14.5, color: C.white, ls: 1.95 });
  T(s, "目指す姿であり、実績を示すものではありません。", 480, 420, 420, 16, { size: 10, color: C.white, ls: 1 });
}

// 7 扉 2
divider(3, "課題", "Problem", "AIによるデータ利用に、取引の経路が足りない", "3 課題");

// 8 課題（p.25型：2面のパネル。左＝構造的課題、右＝Adctorが目指すこと）
{
  const s = slide("LX_WHITE", "3 課題", "3つの経路の欠落");
  title(s, "データ利用には、合意・記録・対価の経路が足りません。");
  lead(s, "提供者と利用者のあいだに、取引を成り立たせる3つの経路が整っていないと考えています（当社仮説）。");
  const w = (CW - 16) / 2;
  const panel = (x, img, label, head, rows, solid) => {
    band(s, img, x, 148, w, 84);
    T(s, label, x + 20, 158, w - 40, 16, { size: 11, bold: true, color: C.white, ls: 1 });
    line(s, x + 20, 176, x + 20 + label.length * 11, 176, { color: C.white, w: 0.75 });
    T(s, head, x, 184, w, 40, { size: 15.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1.3 });
    rect(s, x, 232, w, 228, { fill: solid ? C.tint : C.tint2, r: 0 });
    rows.forEach(([k, d], i) => {
      const y = 250 + i * 68;
      rect(s, x + 20, y, 62, 26, solid ? { fill: C.key, r: 13 } : { fill: C.white, lc: C.sub, r: 13 });
      T(s, k, x + 20, y, 62, 26, { size: 12.5, bold: true, color: solid ? C.white : C.sub, align: "center", valign: "middle", ls: 1 });
      T(s, d, x + 96, y - 2, w - 116, 40, { size: 13.5, ls: 1.45, color: solid ? C.ink : C.sub });
      if (i < 2) line(s, x + 20, y + 50, x + w - 20, y + 50, { color: solid ? C.pale : C.rule, w: 0.75, dash: solid ? "solid" : "dash" });
    });
  };
  panel(L, "bar_deep.png", "現状の構造的課題", "提供者と利用者のあいだに、\n取引の経路がない", [
    ["合意", "利用条件と価格を、事前に決める\n標準的な手段が少ない"],
    ["記録", "いつ・どのデータが取得されたかを、\n双方で確かめにくい"],
    ["対価", "請求・入金・分配を、通して扱う\n事務の型がない"],
  ], false);
  panel(L + w + 16, "bar_key.png", "Adctorが目指すこと", "合意・記録・対価を、\nひとつの経路でつなぐ", [
    ["合意", "利用条件と価格を、合意書として\n両者に残す"],
    ["記録", "取得の日時・データ・取得者を\n同じ台帳に記録する"],
    ["対価", "記録から請求し、入金を照合して\n分配する"],
  ], true);
  note(s, "左は当社の課題仮説、右は検討案。破線＝現状は整っていない、実線＝Adctorが担う経路。");
}

// 9 提供者の選択肢（p.25/27型：2軸のポジショニングマップ）
{
  const s = slide("LX_WHITE", "3 課題", "提供者の選択肢");
  title(s, "提供者の選択肢は、遮断か黙認かに偏っています。");
  lead(s, "「対価」と「記録」の2軸で整理すると、両方を満たす選択肢はまだ一般的ではありません。");
  const mx = L, my = 146, mw = 500, mh = 314;
  rect(s, mx, my, mw, mh, { fill: C.tint2, r: 6 });
  const ox = mx + 64, oy = my + mh - 52, ex = mx + mw - 28, ey = my + 34;
  line(s, ox, oy, ex, oy, { color: C.ink, w: 1.25, arrow: true });
  line(s, ox, oy, ox, ey, { color: C.ink, w: 1.25, arrow: true });
  const axisTag = (x, y, t) => { circle(s, x, y, 9, C.ink); T(s, t, x - 9, y - 7, 18, 14, { size: 9, bold: true, color: C.white, align: "center", ls: 1 }); };
  T(s, "対価", ox - 52, ey - 6, 40, 16, { size: 11, bold: true, ls: 1, align: "right" });
  axisTag(ox + 14, ey + 2, "有");
  T(s, "記録の共有", ex - 110, oy + 10, 88, 16, { size: 11, bold: true, ls: 1, align: "right" });
  axisTag(ex - 8, oy + 18, "有");
  T(s, "なし", ox - 40, oy - 8, 30, 16, { size: 10, color: C.sub, ls: 1, align: "right" });
  // Adctor が目指す領域（点線の枠）
  rect(s, mx + 300, my + 40, 170, 104, { fill: C.tint, lc: C.key, lw: 1.25, dash: "dash", r: 4 });
  T(s, "Adctorが目指す領域", mx + 300, my + 46, 170, 16, { size: 10.5, bold: true, color: C.key, align: "center", ls: 1 });
  const chip = (x, y, t, o) => { rect(s, x, y, o.w || 92, 28, { fill: o.fill, lc: o.lc, lw: 1, r: 14 }); T(s, t, x, y, o.w || 92, 28, { size: 12.5, bold: true, color: o.color, align: "center", valign: "middle", ls: 1 }); };
  chip(ox + 18, oy - 74, "遮断", { fill: C.white, lc: C.sub, color: C.sub });
  chip(ox + 18, oy - 40, "黙認", { fill: C.white, lc: C.sub, color: C.sub });
  chip(mx + 180, my + 96, "個別契約", { fill: C.white, lc: C.mid, color: C.mid });
  chip(mx + 318, my + 80, "条件つき提供", { fill: C.key, color: C.white, w: 134 });
  T(s, "記録は契約ごとに\nばらばら", mx + 166, my + 130, 120, 30, { size: 10, color: C.sub, ls: 1.3, align: "center" });
  // 右：凡例を兼ねた説明（p.14型：タグ＋見出し＋説明）
  const rx = mx + mw + 28, rw = R - rx;
  const items = [
    ["遮断", "取得を技術的に断る", "対価なし・記録不要", C.sub],
    ["黙認", "取得をそのまま許す", "対価なし・記録が残らない", C.sub],
    ["個別契約", "1社ずつ契約する", "対価あり・交渉と管理が重い", C.mid],
    ["条件つき提供", "条件と価格を示し、記録と請求を通す", "対価あり・取得記録とCSVを共有", C.key],
  ];
  items.forEach(([k, h, d, col], i) => {
    const y = my + i * 80;
    rect(s, rx, y, k.length * 13 + 22, 22, { fill: C.white, lc: col, lw: 1, r: 11 });
    T(s, k, rx, y, k.length * 13 + 22, 22, { size: 11.5, bold: true, color: col, align: "center", valign: "middle", ls: 1 });
    T(s, h, rx, y + 28, rw, 20, { size: 14, bold: true, color: i === 3 ? C.key : C.ink, ls: 1.2 });
    T(s, d, rx, y + 50, rw, 18, { size: 12, color: C.sub, ls: 1.2 });
  });
  note(s, "当社による定性的な配置（数値にもとづく位置ではない）。「条件つき提供」はAdctorが目指す検討案で、稼働中のサービスではない。");
}

// 10 扉 3
divider(4, "仕組み", "How it works", "提供者と利用者の間で、許諾・記録・請求を担う", "4 仕組み");

// 11 ビジネスモデル図（p.32型：太い矢印＋矢印上のラベル、p.11型：台帳の入れ子）
{
  const s = slide("LX_WHITE", "4 仕組み", "ビジネスモデル");
  title(s, "データは提供企業から買い手へ、対価は買い手から提供企業へ。\nAdctorは、その間の合意・記録・請求を引き受けます。", { h: 76, color: C.ink, size: 24 });
  const nw = 168, nh = 150, ny = 168;
  const px = L, cx = (L + R) / 2 - nw / 2, bx = R - nw;
  const node = (x, head, sub, roles, hot) => {
    rect(s, x, ny, nw, nh, { fill: hot ? C.key : C.white, lc: hot ? C.key : C.rule, lw: 1, r: 6 });
    T(s, head, x, ny + 18, nw, 30, { size: hot ? 26 : 19, bold: true, font: hot ? EN : JP, color: hot ? C.white : C.ink, align: "center", ls: 1 });
    T(s, sub, x, ny + 54, nw, 16, { size: 11, color: hot ? C.white : C.sub, align: "center", ls: 1 });
    roles.forEach((r, i) => {
      rect(s, x + 16, ny + 80 + i * 22, nw - 32, 18, { fill: hot ? C.deep : C.card, r: 2 });
      T(s, r, x + 16, ny + 80 + i * 22, nw - 32, 18, { size: 10.5, bold: true, color: hot ? C.white : C.ink, align: "center", valign: "middle", ls: 1 });
    });
  };
  node(px, "提供企業", "データを持つ企業", ["利用条件と価格を示す", "データを提供する", "分配を受け取る"], false);
  node(cx, "Adctor", "Trillion Bank が運営（計画）", ["許諾（合意の記録）", "取得記録・CSV", "請求・照合・分配"], true);
  node(bx, "買い手企業", "データを利用する企業", ["利用条件に合意する", "ファイルを取得する", "請求に支払う"], false);
  // 上段＝データの流れ（黒）、下段＝お金の流れ（TB blue）
  flow(s, px + nw + 6, cx - 6, ny + 36, C.ink, "① データ・条件");
  flow(s, cx + nw + 6, bx - 6, ny + 36, C.ink, "② 合意・ファイル");
  flow(s, bx - 6, cx + nw + 6, ny + nh - 34, C.key, "③ 支払（振込）");
  flow(s, cx - 6, px + nw + 6, ny + nh - 34, C.key, "④ 分配");
  // 台帳（p.11型：入れ子）
  line(s, cx + nw / 2, ny + nh, cx + nw / 2, 346, { color: C.key, w: 1 });
  rect(s, cx - 40, 346, nw + 80, 66, { fill: C.tint, lc: C.light, r: 6 });
  T(s, "利用台帳", cx - 40, 352, nw + 80, 18, { size: 12.5, bold: true, color: C.key, align: "center", ls: 1 });
  rect(s, cx - 24, 376, (nw + 48) / 2 - 4, 26, { fill: C.white, lc: C.light, r: 3 });
  T(s, "取得記録", cx - 24, 376, (nw + 48) / 2 - 4, 26, { size: 11.5, bold: true, align: "center", valign: "middle", ls: 1 });
  rect(s, cx + (nw + 48) / 2 - 20, 376, (nw + 48) / 2 - 4, 26, { fill: C.white, lc: C.light, r: 3 });
  T(s, "請求用CSV", cx + (nw + 48) / 2 - 20, 376, (nw + 48) / 2 - 4, 26, { size: 11.5, bold: true, align: "center", valign: "middle", ls: 1 });
  // 凡例と収益
  line(s, L, 430, L + 26, 430, { color: C.ink, w: 3 });
  T(s, "データ・記録の流れ", L + 34, 422, 140, 16, { size: 11, ls: 1 });
  line(s, L + 170, 430, L + 196, 430, { color: C.key, w: 3 });
  T(s, "お金の流れ（PoCは銀行振込・手動照合）", L + 204, 422, 260, 16, { size: 11, ls: 1 });
  rect(s, R - 316, 418, 316, 26, { fill: C.key, r: 13 });
  T(s, "Adctorの収益＝取引額に対する手数料（料率は未定）", R - 316, 418, 316, 26, { size: 11.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  note(s, "初回PoCを前提とした検討案。運営主体・料率・契約形態は未確定。自動課金・自動分配は稼働していない。");
}

// 12 取引フロー（p.20型・濃紺）
{
  const s = slide("LX_DARK", "4 仕組み", "取引フロー", "bg_dark.jpg");
  title(s, "データは右へ、お金は左へ。6つの段階で流れます。", { color: C.white });
  T(s, "初回PoCの計画です（未実施）。データと記録は提供者から利用者へ、対価は利用者から提供者へ流れます。", L, 90, CW, 22, { size: 13.5, color: C.white, ls: 1.3 });
  T(s, "Adctor Transaction Flow", L, 126, CW, 26, { font: ENM, size: 19, color: C.white, align: "center", ls: 1 });
  const top = [["1", "合意", "条件と価格を決める", "出力：合意書"], ["2", "取得", "買い手が取得する", "出力：取得の発生"], ["3", "記録", "日時・取得者を残す", "出力：取得記録"], ["4", "CSV", "月次で集計する", "出力：請求用CSV"]];
  const g = 22, w = (CW - 3 * g) / 4;
  top.forEach(([n, h, d, o], i) => {
    const x = L + i * (w + g), y = 162;
    rect(s, x, y, w, 126, { fill: C.white, r: 5 });
    rect(s, x + 14, y + 14, 74, 18, { fill: C.key, r: 2 });
    T(s, "STEP " + n, x + 14, y + 14, 74, 18, { font: ENS, size: 10.5, bold: false, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, h, x + 14, y + 40, w - 28, 26, { size: 18, bold: true, ls: 1.1 });
    T(s, d, x + 14, y + 70, w - 28, 22, { size: 12.5, ls: 1.3 });
    T(s, o, x + 14, y + 98, w - 28, 16, { size: 11, color: C.key, bold: true, ls: 1 });
    if (i < 3) tri(s, x + w + 6, y + 56, 10, "right", C.white);
  });
  tri(s, L + 3 * (w + g) + w / 2 - 6, 296, 12, "down", C.white);
  const bw = 2 * w + g;
  [[L, "6", "入金・分配", "銀行振込で入金を受け、手数料を除いて提供企業へ分配する"], [L + 2 * (w + g), "5", "請求・照合", "CSVと合意条件で請求し、入金額と手動で照合する"]].forEach(([x, n, h, d]) => {
    const y = 316;
    rect(s, x, y, bw, 86, { fill: C.white, r: 5 });
    rect(s, x + 14, y + 14, 94, 18, { fill: C.key, r: 2 });
    T(s, "STEP " + n, x + 14, y + 14, 94, 18, { font: ENS, size: 10.5, color: C.white, align: "center", valign: "middle", ls: 1 });
    pill(s, "手動", x + bw - 64, y + 12, 50, { h: 20, size: 10.5, fill: C.tint, color: C.key });
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
  const s = slide("LX_WHITE", "4 仕組み", "取得・引用・学習");
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
    rect(s, x, y0, cw, 66, { fill: hot ? C.key : C.card, r: 2 });
    T(s, h, x, y0 + 10, cw, 26, { size: 17, bold: true, align: "center", color: hot ? C.white : C.ink, ls: 1 });
    T(s, st, x, y0 + 40, cw, 16, { size: 11, bold: true, align: "center", color: hot ? C.white : C.mute, ls: 1 });
  });
  rows.forEach(([lab, cells], r) => {
    const y = y0 + 66 + gw + r * (80 + gw);
    rect(s, x0, y, lw, 80, { fill: C.mid, r: 2 });
    T(s, lab, x0, y, lw, 80, { size: 13, bold: true, color: C.white, align: "center", valign: "middle", ls: 1.35 });
    cells.forEach((c, i) => {
      const x = x0 + lw + gw + i * (cw + gw), hot = i === 0;
      rect(s, x, y, cw, 80, { fill: hot ? C.tint : C.tint2, r: 2 });
      T(s, c, x + 16, y, cw - 32, 80, { size: 14, valign: "middle", color: hot ? C.ink : C.sub, bold: hot && r === 2, ls: 1.45 });
    });
  });
  note(s, "学習の扱い（契約で利用範囲を定める案）は法務確認が必要。");
}

// 14 利用台帳（p.13型：左に説明・右に暗色の画面）
{
  const s = slide("LX_WHITE", "4 仕組み", "利用台帳（画面案）");
  title(s, "取得記録を、双方が同じ台帳で確かめます。");
  lead(s, "提供者と利用者が同じ行を見て、合意条件と結びつけ、そのまま請求の元データにします。");
  const pts = [["1", "取得を1行ずつ記録", "日時・取得者・データを残し、\n双方が同じ行を見る。"], ["2", "合意と結びつける", "各行に合意IDを持たせ、\n条件と価格に対応させる。"], ["3", "CSVで書き出す", "月次の利用集計と\n請求の元データにする。"]];
  pts.forEach(([n, h, d], i) => {
    const y = 160 + i * 98;
    circle(s, L + 12, y + 12, 12, C.key);
    T(s, n, L, y + 3, 24, 18, { font: ENS, size: 12, color: C.white, align: "center", ls: 1 });
    T(s, h, L + 36, y, 280, 24, { size: 17, bold: true, ls: 1.1 });
    T(s, d, L + 36, y + 30, 280, 50, { size: 13.5, ls: 1.55 });
  });
  // 画面案（暗色）
  const sx = 412, sy = 150, sw = R - sx, sh = 300;
  rect(s, sx, sy, sw, sh, { fill: C.ui, r: 6 });
  T(s, "Adctor  利用台帳", sx + 18, sy + 12, 200, 18, { size: 11, bold: true, color: C.white, ls: 1 });
  pill(s, "画面案", sx + sw - 74, sy + 10, 58, { h: 20, size: 10 });
  [["対象期間", "YYYY年MM月"], ["取得件数", "000 件"], ["請求予定額", "000,000 円"]].forEach(([k, v], i) => {
    const x = sx + 18 + i * 146;
    rect(s, x, sy + 42, 134, 50, { fill: C.ui2, r: 3 });
    T(s, k, x + 10, sy + 48, 120, 14, { size: 9.5, color: "B7C0CF", ls: 1 });
    T(s, v, x + 10, sy + 66, 120, 20, { font: ENS, size: 14, color: C.white, ls: 1 });
  });
  const cols = [["取得日時", 92], ["取得者", 64], ["データID", 76], ["ファイル", 96], ["合意ID", 70]];
  let cx = sx + 18; const ty = sy + 106;
  cols.forEach(([h, w]) => { T(s, h, cx, ty, w, 14, { size: 9.5, color: "B7C0CF", ls: 1 }); cx += w; });
  for (let r = 0; r < 5; r++) {
    const y = ty + 22 + r * 25;
    if (r === 0) rect(s, sx + 12, y - 5, sw - 24, 23, { fill: C.deep, r: 2 });
    const vals = [`MM-DD 1${r}:00`, "買い手A", "DATA-001", `file_00${r + 1}.csv`, "AGR-001"];
    cx = sx + 18;
    cols.forEach(([, w], c) => { T(s, vals[c], cx, y, w, 14, { font: EN, size: 10, color: C.white, ls: 1 }); cx += w; });
  }
  rect(s, sx + sw - 128, sy + sh - 38, 110, 24, { fill: C.key, r: 3 });
  T(s, "CSVを書き出す", sx + sw - 128, sy + sh - 38, 110, 24, { size: 10.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  note(s, "自作のワイヤーフレーム（画面案）。実在の画面ではなく、表示値はすべてダミー。");
}

// 15 収益モデル（p.40/41型：枠線ピルの図ラベル＋凡例＋棒の模式図）
{
  const s = slide("LX_WHITE", "4 仕組み", "収益モデル（案）");
  title(s, "収益は、取引額に対する手数料とする案です。");
  lead(s, "取引額・売上・入金・分配・利益を分けて扱います。手数料率・単価は未承認のため、ここでは数値を置きません。");
  // 図ラベル（枠線ピル）と凡例
  rect(s, L, 146, 190, 24, { fill: C.white, lc: C.ink, lw: 1, r: 12 });
  T(s, "取引額の内訳（模式図）", L, 146, 190, 24, { size: 12, bold: true, align: "center", valign: "middle", ls: 1 });
  const lg = [["分配", C.light], ["手数料", C.key]];
  rect(s, L + 270, 146, 136, 24, { fill: C.white, lc: C.rule, r: 2 });
  lg.forEach(([t, c], i) => { rect(s, L + 282 + i * 62, 153, 10, 10, { fill: c, r: 0 }); T(s, t, L + 296 + i * 62, 150, 50, 16, { size: 11, ls: 1 }); });
  // 棒（数値なし。高さ・幅は比率を表さない）
  const base = 440, top = 196, bw = 84, gap = 52, x0 = L + 30;
  line(s, L + 10, base, L + 400, base, { color: C.ink, w: 0.75 });
  const col = (i, label, segs, sub) => {
    const x = x0 + i * (bw + gap);
    let y = base;
    segs.forEach(([h, fill, txt, txtCol, dash]) => {
      y -= h;
      rect(s, x, y, bw, h, { fill, lc: dash ? C.key : undefined, dash: dash ? "dash" : undefined, lw: 1, r: 0 });
      if (txt) T(s, txt, x, y, bw, h, { size: 11.5, bold: true, color: txtCol, align: "center", valign: "middle", ls: 1.3 });
    });
    T(s, label, x - 10, base + 6, bw + 20, 16, { size: 12, bold: true, align: "center", ls: 1 });
    if (sub) T(s, sub, x - 26, top - 26, bw + 52, 26, { size: 10, color: C.sub, align: "center", valign: "bottom", ls: 1.25 });
  };
  col(0, "請求額（GMV）", [[244, C.pale, "合意条件に\nもとづく請求", C.ink]], "取引額");
  col(1, "入金", [[220, C.tint, "実際の振込", C.ink, true]], "請求額と一致する\nとは限らない");
  col(2, "入金の内訳", [[170, C.light, "提供企業への\n分配", C.ink], [50, C.key, "手数料", C.white]], null);
  // 括弧：手数料＝プラットフォーム売上
  const fx = x0 + 2 * (bw + gap) + bw + 8;
  line(s, fx, base - 220, fx, base - 170, { color: C.key, w: 1.25 });
  T(s, "＝ プラットフォーム\n売上（Adctorの売上）", fx + 8, base - 218, 120, 34, { size: 10.5, bold: true, color: C.key, ls: 1.3 });
  // 右：定義（p.31型：濃いタグ＋説明）
  const rx = L + 540, rw = R - rx;
  const defs = [["取引額（GMV）", "合意条件にもとづく請求額の合計（売上ではない）"], ["プラットフォーム売上", "取引額のうちAdctorの手数料にあたる部分"], ["入金", "買い手から実際に振り込まれた額"], ["分配", "入金から手数料を除き、提供企業へ支払う額"], ["利益", "売上から運営費用を引いた額（試算しない）"]];
  defs.forEach(([k, v], i) => {
    const y = 146 + i * 60;
    rect(s, rx, y, k.length * 12 + 24, 22, { fill: i === 1 ? C.key : C.ink, r: 11 });
    T(s, k, rx, y, k.length * 12 + 24, 22, { size: 11.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
    T(s, v, rx + 4, y + 28, rw - 4, 18, { size: 11.5, ls: 1.1 });
  });
  note(s, "検討案。棒の高さ・比率は模式的なもので、実際の金額や料率を表さない。料率・単価は承認後に「試算」として別途示す。");
}

// 16 扉 4
divider(5, "実証", "Proof of Concept", "1対1対1の初回PoCで、請求から分配までを確かめる", "5 実証");

// 17 初回PoC（p.39型：数値タイル、p.50型：ダイヤ印の縦タイムライン）
{
  const s = slide("LX_WHITE", "5 実証", "初回PoC");
  title(s, "初回PoCは、1対1対1の最小構成で行います。");
  lead(s, "すべて計画です（2026年11月時点）。買い手・提供企業・データ・契約・入金は、いずれも未確定です。");
  // 左：検証の流れ（縦タイムライン）
  T(s, "検証の流れ", L, 148, 240, 20, { size: 15, bold: true, ls: 1 });
  const steps = [["利用条件と価格の合意", "合意書"], ["ファイルの取得と記録", "取得記録"], ["CSVからの請求", "請求書"], ["入金と照合（手動）", "照合結果"], ["提供企業への分配", "分配明細"]];
  line(s, L + 6, 190, L + 6, 190 + 4 * 54, { color: C.mute, w: 0.75, dash: "sysDot" });
  steps.forEach(([t, o], i) => {
    const y = 190 + i * 54;
    diamond(s, L + 6, y, 6, i === 4 ? C.key : C.ink);
    T(s, t, L + 24, y - 10, 200, 20, { size: 13.5, bold: true, ls: 1 });
    T(s, "出力：" + o, L + 24, y + 12, 200, 16, { size: 11, color: C.sub, ls: 1 });
  });
  // 右：数値タイル（ラベル左上・値は右下）
  const tx = L + 280, tw = (R - tx - 2 * 10) / 3, th = 140;
  const tiles = [
    ["買い手", "1", "社", C.key, C.white], ["提供企業", "1", "社", C.mid, C.white], ["データ", "1", "種類", C.light, C.white],
    ["決済", "銀行振込", "", C.deep, C.white], ["照合", "手動", "", C.pale, C.ink], ["期間・時期", "未定", "", C.card, C.ink],
  ];
  tiles.forEach(([lab, val, unit, fill, col], i) => {
    const x = tx + (i % 3) * (tw + 10), y = 148 + Math.floor(i / 3) * (th + 10);
    rect(s, x, y, tw, th, { fill, r: 4 });
    T(s, lab, x + 14, y + 12, tw - 28, 18, { size: 13, bold: true, color: col, ls: 1 });
    if (unit) {
      s.addText([{ text: val, options: { fontFace: EN, bold: true, fontSize: 58, color: col } }, { text: unit, options: { fontFace: JP, bold: true, fontSize: 18, color: col } }],
        { x: P(x + 10), y: P(y + 52), w: P(tw - 22), h: P(78), margin: 0, align: "right", valign: "bottom", isTextBox: true, lang: "ja-JP" });
    } else {
      T(s, val, x + 10, y + 82, tw - 24, 44, { size: 26, bold: true, color: col, align: "right", valign: "bottom", ls: 1 });
    }
  });
  note(s, "タイルの値はすべて計画。記録の対象はファイル取得記録とCSV。自動課金・自動分配は対象外。");
}

// 18 次の判断（p.48型）
{
  const s = slide("LX_WHITE", "5 実証", "次の判断");
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
    T(s, "【" + h + "】", x + 20, y + 26, w - 40, 24, { size: 14.5, bold: true, color: C.key, ls: 1 });
    T(s, when, x + 20, y + 54, w - 40, 22, { size: 14, bold: true, ls: 1 });
    line(s, x + 20, y + 92, x + w - 20, y + 92, { color: C.ink, w: 0.5 });
    T(s, d, x + 20, y + 110, w - 40, 120, { size: 13.5, ls: 1.75 });
    pill(s, i < 2 ? "計画" : "将来判断", x + 20, y + 254, 80, { h: 22, size: 11, fill: i < 2 ? C.key : C.tint, color: i < 2 ? C.white : C.key });
  });
  note(s, "判断の時期・判断者は未定。各段階の基準は検討案。");
}

// 19 扉 5
divider(6, "補足", "Appendix", "比較・計算式・根拠の区分", "6 補足");

// 20 補足A
{
  const s = slide("LX_WHITE", "6 補足", "現行と将来案の比較");
  title(s, "現行と将来案の比較");
  lead(s, "将来案はいずれも、許諾・法務・接続条件の確認を前提とする検討段階です。連携・購入・出資の事実はありません。");
  const tw = 600, lw = 128, cw = (tw - lw) / 2, y0 = 148;
  rect(s, L, y0, lw - 4, 36, { fill: C.card, r: 2 });
  T(s, "項目", L, y0, lw - 4, 36, { size: 12, bold: true, align: "center", valign: "middle", ls: 1 });
  rect(s, L + lw, y0, cw - 4, 36, { fill: C.key, r: 2 });
  T(s, "初回PoC（計画）", L + lw, y0, cw - 4, 36, { size: 13.5, bold: true, color: C.white, align: "center", valign: "middle", ls: 1 });
  rect(s, L + lw + cw, y0, cw, 36, { fill: C.tint, r: 2 });
  T(s, "将来案（条件付き）", L + lw + cw, y0, cw, 36, { size: 13.5, bold: true, color: C.key, align: "center", valign: "middle", ls: 1 });
  const rows = [["対象データ", "1種類", "複数種類"], ["記録の範囲", "ファイル取得記録", "引用の検出"], ["請求", "CSVから作成", "自動請求"], ["決済", "銀行振込", "x402、円建てステーブルコイン等"], ["照合・分配", "手動", "自動化"], ["課金の単位", "取得（ファイル）", "引用課金"]];
  rows.forEach(([k, a, b], i) => {
    const y = y0 + 44 + i * 44;
    T(s, k, L + 8, y, lw - 12, 36, { size: 13, bold: true, valign: "middle", ls: 1 });
    T(s, a, L + lw + 14, y, cw - 28, 36, { size: 13, valign: "middle", ls: 1.2 });
    T(s, b, L + lw + cw + 14, y, cw - 28, 36, { size: 13, color: C.sub, valign: "middle", ls: 1.2 });
    line(s, L, y + 40, L + tw, y + 40, { color: C.rule, w: 0.5 });
  });
  const nx = L + tw + 24, nw = R - nx;
  rect(s, nx, y0, nw, 300, { fill: C.tint2, r: 6 });
  T(s, "補足", nx + 18, y0 + 18, nw - 36, 20, { size: 13.5, bold: true, color: C.key, ls: 1 });
  T(s, "将来案の各項目は、\n許諾・法務・接続条件を\n満たす場合に限り\n検討する。\n\n取引先・接続先の\n名称やロゴは、\n承認を得るまで\n掲載しない。", nx + 18, y0 + 50, nw - 36, 240, { size: 12.5, ls: 1.7 });
}

// 21 補足B
{
  const s = slide("LX_WHITE", "6 補足", "料金計算の定義");
  title(s, "料金計算の定義");
  lead(s, "検討案です。単価・手数料率・締め日・端数処理は未承認のため、値を置いていません。");
  const fm = [["請求額", "＝ Σ（取得件数 × 合意単価）", "定額契約の場合は、合意額をそのまま請求額とする"], ["手数料", "＝ 入金額 × 手数料率", "手数料＝プラットフォーム売上。率は未定"], ["分配額", "＝ 入金額 − 手数料", "未入金分は分配しない（案）"]];
  fm.forEach(([k, f, n], i) => {
    const y = 148 + i * 102;
    rect(s, L, y, 520, 90, { fill: C.tint2, r: 6 });
    pill(s, k, L + 20, y + 18, 84, { h: 26, size: 13 });
    T(s, f, L + 122, y + 16, 380, 30, { size: 20, bold: true, ls: 1 });
    T(s, n, L + 122, y + 54, 380, 20, { size: 12.5, color: C.sub, ls: 1 });
  });
  const nx = L + 544, nw = R - nx;
  rect(s, nx, 148, nw, 294, { fill: C.white, lc: C.rule });
  T(s, "合意で決めること", nx + 20, 166, nw - 40, 22, { size: 14.5, bold: true, color: C.key, ls: 1 });
  ["単価、または定額", "締め単位（月次を想定）", "入金期日と振込手数料の負担", "端数処理", "手数料率（要承認）"].forEach((t, i) => {
    const y = 206 + i * 44;
    T(s, String(i + 1).padStart(2, "0"), nx + 20, y, 30, 20, { font: ENS, size: 12, color: C.key, ls: 1 });
    T(s, t, nx + 54, y, nw - 74, 20, { size: 13, ls: 1.1 });
    line(s, nx + 20, y + 30, nx + nw - 20, y + 30, { color: C.rule, w: 0.5 });
  });
}

// 22 補足C
{
  const s = slide("LX_WHITE", "6 補足", "根拠の区分と未掲載事項");
  title(s, "根拠の区分と未掲載事項");
  lead(s, "数値は、検証または承認が済んだものから順に追加します。詳細は「未反映項目」に記録しています。");
  const half = (CW - 20) / 2;
  const box = (x, head, rows) => {
    rect(s, x, 148, half, 300, { fill: C.white, lc: C.rule });
    rect(s, x + 1, 149, half - 2, 42, { fill: C.card, r: 3 });
    T(s, head, x, 149, half, 42, { size: 14.5, bold: true, align: "center", valign: "middle", ls: 1 });
    rows.forEach(([k, d, w], i) => {
      const y = 206 + i * 58;
      T(s, k, x + 20, y - 4, 130, 44, { size: 13.5, bold: true, color: C.key, valign: "middle", ls: 1 });
      T(s, d, x + 150, y - 4, half - 170 - (w ? 70 : 0), 44, { size: 12.5, valign: "middle", ls: 1.4 });
      if (w) T(s, w, x + half - 90, y - 4, 70, 44, { size: 12, color: C.mute, align: "right", valign: "middle", ls: 1 });
      if (i < rows.length - 1) line(s, x + 20, y + 44, x + half - 20, y + 44, { color: C.rule, w: 0.5 });
    });
  };
  box(L, "本資料の根拠の区分", [["実績", "会社情報・AirReach（当社資料）", "p.5〜9"], ["外部公表", "第三者の一次公表", "p.11"], ["検討案", "Adctorの計画・案・仮説", "p.7, 11〜27"], ["試算", "承認済みの仮定による計算", "掲載なし"]]);
  box(L + half + 20, "載せていないもの", [["市場規模", "分母・対象・算式・出典を\n検証できていない"], ["手数料率・単価", "承認済みの仮定がない"], ["LPの数値", "Adctorサイトの統計値・価格。出典と承認が未確認"], ["旧資料の数値", "原本（29ページ）が未入手"]]);
}

// 23 結び（p.52型）
{
  const s = slide("LX_BARE", "6 補足", null);
  s.addImage({ path: BG("bg_closing.jpg"), x: 0, y: 0, w: P(420), h: P(540), sizing: { type: "cover", w: P(420), h: P(540) } });
  s.addImage({ path: AS("tb_logo_black.png"), x: P(R + 48 - 122), y: P(25), w: P(122), h: P(122 / 11.08) });
  T(s, "AIから発信者に、\n還元をするインフラをつくる。", 480, 220, 440, 100, { size: 28, bold: true, ls: 1.6 });
  T(s, "Adctor", 480, 340, 300, 26, { font: EN, bold: true, size: 20, color: C.key, ls: 1 });
  T(s, "©Trillion Bank", R - 152, 512, 200, 14, { font: EN, size: 9, align: "right", ls: 1 });
}

pres.writeFile({ fileName: OUT }).then(async (f) => {
  try {
    const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");
    await applyTheme(f, { name: "Adctor TB", headFontFace: JP, bodyFontFace: JP, colors: { dk1: "111318", lt1: "FFFFFF", dk2: "667085", lt2: "EAF1FF", accent1: "1762E8", accent2: "4C86EE", accent3: "0E46B8", accent4: "8DB3F4", accent5: "DDE2EA", accent6: "C5D8FA", hlink: "1762E8", folHlink: "667085" } });
  } catch (e) { console.warn("theme not applied:", e.message); }
  console.log("wrote", f);
});
