# build_v3.js から build_v4.js を作る変換スクリプト。
# 1) 配色トークンを Trillion Bank のカラーコードに置き換える
# 2) 本章の図表（課題・ポジショニング・ビジネスモデル・収益・PoC）を LayerX の図表の型で作り直す
import re, pathlib

here = pathlib.Path(__file__).parent
src = (here / "build_v3.js").read_text()

# ---------- 1. トークンと出力先 ----------
src = src.replace("""const C = {
  white: "FFFFFF", ink: "0A2133", violet: "524DFF", sub: "5B6A76", mute: "8C969F",
  rule: "D6DADD", card: "F6F7F8", lav: "F1EEFD", lav2: "F7F5FE", deep: "004295", dark: "1B2130",
};""", """// Trillion Bank 指定色：白 #FFFFFF／本文 #111318／要点 #1762E8／薄面 #EAF1FF／補助 #667085／罫線 #DDE2EA
// 派生色（指定色の明度違い・中間色のみ）：deep・deeper・mid・light・pale・tint2・card・mute・ui
const C = {
  white: "FFFFFF", ink: "111318", key: "1762E8", tint: "EAF1FF", sub: "667085", rule: "DDE2EA",
  deep: "0E46B8", deeper: "0B2F7A", mid: "4C86EE", light: "8DB3F4", pale: "C5D8FA",
  tint2: "F5F8FE", card: "F4F6F9", mute: "8A93A3", ui: "111318", ui2: "232936",
};""")
src = src.replace("Adctor_LayerX_style_v3.pptx", "Adctor_TB_LayerX_v4.pptx").replace('"assets_v3"', '"assets_v4"')
src = src.replace("Adctor 事業説明資料 v3 — LayerX Company Deck の意匠を参照した版", "Adctor 事業説明資料 v4 — LayerX の図表の型 × Trillion Bank のカラーコード")
src = src.replace("python3 make_bg_v3.py && node build_v3.js", "python3 make_bg_v4.py && node build_v4.js")
src = src.replace('pres.title = "Adctor 事業説明資料 v3";', 'pres.title = "Adctor 事業説明資料 v4";')
for a, b in [("C.violet", "C.key"), ("C.lav2", "C.tint2"), ("C.lav", "C.tint"), ("C.dark", "C.ui"),
             ('"7A73FF"', "C.mid"), ('"E3E1FC"', "C.pale"), ('"8F7BFF"', "C.mid"), ('"D9D4FB"', "C.pale"),
             ('"3A3F8F"', "C.deep"), ('"2A3142"', "C.ui2"), ('"AEB6C4"', '"B7C0CF"')]:
    src = src.replace(a, b)
src = re.sub(r'name: "Adctor LX".*?\} \}\);', 'name: "Adctor TB", headFontFace: JP, bodyFontFace: JP, colors: { dk1: "111318", lt1: "FFFFFF", dk2: "667085", lt2: "EAF1FF", accent1: "1762E8", accent2: "4C86EE", accent3: "0E46B8", accent4: "8DB3F4", accent5: "DDE2EA", accent6: "C5D8FA", hlink: "1762E8", folHlink: "667085" } });', src, flags=re.S)

# 共通部品の追加（グラデーション帯・ダイヤ・矢印ラベル）
src = src.replace("// ---------- layouts ----------", r'''function band(s, name, x, y, w, h) { s.addImage({ path: BG(name), x: P(x), y: P(y), w: P(w), h: P(h) }); }
function diamond(s, cx, cy, r, fill) {
  s.addShape(pres.shapes.DIAMOND, { x: P(cx - r), y: P(cy - r), w: P(2 * r), h: P(2 * r), fill: { color: fill }, line: { type: "none" } });
}
function flow(s, x1, x2, y, color, label, o = {}) { // 太い矢印＋矢印上のラベル（p.32型）
  line(s, x1, y, x2, y, { color, w: 3, arrow: true });
  const w = o.w || 118;
  rect(s, (x1 + x2) / 2 - w / 2, y - 12, w, 24, { fill: o.fill || color, r: 3 });
  T(s, label, (x1 + x2) / 2 - w / 2, y - 12, w, 24, { size: 11.5, bold: true, color: o.text || C.white, align: "center", valign: "middle", ls: 1 });
}

// ---------- layouts ----------''')

# ---------- 2. 本章の図表を差し替える ----------
def replace_block(code, header_prefix, new_block):
    i = code.index(header_prefix)
    j = code.index("\n// ", i + len(header_prefix))
    return code[:i] + new_block.rstrip() + "\n" + code[j:]

B5 = r'''// 5 市場の変化（p.21/22型：グラデーション見出し帯のカード）
{
  const s = slide("LX_WHITE", "1 はじめに", "市場の変化");
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
'''

B8 = r'''// 8 課題（p.25型：2面のパネル。左＝構造的課題、右＝Adctorが目指すこと）
{
  const s = slide("LX_WHITE", "2 課題", "3つの経路の欠落");
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
'''

B9 = r'''// 9 提供者の選択肢（p.25/27型：2軸のポジショニングマップ）
{
  const s = slide("LX_WHITE", "2 課題", "提供者の選択肢");
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
'''

B11 = r'''// 11 ビジネスモデル図（p.32型：太い矢印＋矢印上のラベル、p.11型：台帳の入れ子）
{
  const s = slide("LX_WHITE", "3 仕組み", "ビジネスモデル");
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
'''

B15 = r'''// 15 収益モデル（p.40/41型：枠線ピルの図ラベル＋凡例＋棒の模式図）
{
  const s = slide("LX_WHITE", "3 仕組み", "収益モデル（案）");
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
'''

B17 = r'''// 17 初回PoC（p.39型：数値タイル、p.50型：ダイヤ印の縦タイムライン）
{
  const s = slide("LX_WHITE", "4 実証", "初回PoC");
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
'''

for prefix, block in [("// 5 市場の変化", B5), ("// 8 課題", B8), ("// 9 選択肢", B9), ("// 11 事業構造", B11), ("// 15 収益モデル", B15), ("// 17 初回PoC", B17)]:
    src = replace_block(src, prefix, block)

# 目次・フッターの語の更新
src = src.replace('["仕組み", "許諾・取得記録・請求をつなぐ"]', '["仕組み", "ビジネスモデルと取引の流れ"]')
(here / "build_v4.js").write_text(src)
print("wrote build_v4.js", len(src))
