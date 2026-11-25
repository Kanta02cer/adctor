// AirReach 営業資料用の画面イメージ（試作）。HTML をブラウザで描画し、パソコン・スマートフォンの枠に入れる。
// 内容は当社サイト（index.html）の説明に沿った「見本」。会社名・数字はすべて見本で、画面内にも明記する。
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "assets_ar");
fs.mkdirSync(OUT, { recursive: true });
const b64 = (f) => "data:image/png;base64," + fs.readFileSync(path.join(OUT, f)).toString("base64");
const LOGO = b64("airreach_logo.png"), FACE = b64("toriuru_face.png");
const K = { key: "#1762E8", navy: "#0B2F7A", tint: "#EAF1FF", ink: "#111318", sub: "#667085", rule: "#DDE2EA", acc: "#FFB020", accS: "#FFF3D6", ok: "#0E9F6E" };
const css = `*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Noto Sans JP","Inter",sans-serif;color:${K.ink};background:#F5F8FE}
.card{background:#fff;border:1px solid ${K.rule};border-radius:14px}.chip{display:inline-block;background:${K.accS};color:#8A5300;border:1px solid ${K.acc};border-radius:999px;font-weight:700}
.btn{display:inline-block;background:${K.key};color:#fff;border-radius:10px;font-weight:700}.yes{color:${K.key};font-weight:800}.no{color:#A0A8B5;font-weight:700}`;
const sample = `<span class="chip" style="padding:4px 12px;font-size:13px">見本データ</span>`;

// ---------- パソコン（1280×800） ----------
const shell = (active, body) => `<html><head><style>${css}
.top{height:64px;background:#fff;border-bottom:1px solid ${K.rule};display:flex;align-items:center;padding:0 28px;gap:28px}
.top img{height:34px}.nav{font-size:15px;color:${K.sub};font-weight:500}.nav.on{color:${K.key};font-weight:800;border-bottom:3px solid ${K.key};padding-bottom:18px;margin-top:21px}
.main{padding:22px 32px}</style></head><body style="width:1280px;height:800px">
<div class="top"><img src="${LOGO}"><span style="flex:1"></span>${["無料診断", "計測レポート", "チャット", "下書き"].map((n) => `<span class="nav ${n === active ? "on" : ""}">${n}</span>`).join("")}${sample}</div>
<div class="main">${body}</div></body></html>`;

const QS = ["外壁塗装の料金の目安は？", "〇〇市は対応エリア？", "工期はどれくらい？", "近くで評判のいい工務店は？", "見積もりは無料？", "雨の日も工事できる？", "保証はついている？", "どんな塗料を使う？", "相談から工事までの流れは？", "支払い方法は？"];
const before = [0, 1, 0, 1, 0, 0, 1, 0, 0, 0], after = [1, 1, 1, 1, 1, 0, 1, 0, 1, 0];

const D_DIAG = shell("無料診断", `
<div style="display:flex;gap:14px;align-items:center;margin-bottom:16px"><div class="card" style="flex:1;padding:12px 16px;font-size:17px;color:${K.sub}">https://mihon-koumuten.jp （見本）</div><span class="btn" style="padding:13px 22px;font-size:17px">診断する</span></div>
<div style="display:flex;gap:18px">
<div class="card" style="width:360px;padding:24px;text-align:center"><div style="font-size:17px;color:${K.sub}">AIに10問聞いた結果</div>
<div style="font-family:Inter;font-weight:800;font-size:110px;color:${K.key};line-height:1.1;margin-top:10px">3<span style="font-size:40px;color:${K.ink}">／10問</span></div>
<div style="font-size:19px;font-weight:700;margin-top:4px">で、名前が出ました</div>
<div style="display:flex;gap:8px;justify-content:center;margin-top:22px">${["ChatGPT", "Gemini", "Claude", "Perplexity"].map((a, i) => `<span style="padding:6px 10px;border-radius:8px;font-size:13px;font-weight:700;${i ? `background:${K.tint};color:${K.key}` : `background:${K.key};color:#fff`}">${a}</span>`).join("")}</div>
<div style="margin-top:24px;background:${K.accS};border-radius:10px;padding:14px;font-size:15px;line-height:1.7;text-align:left"><b>先に手を打つとよいもの</b><br>・料金の目安　・工期</div></div>
<div class="card" style="flex:1;padding:8px 18px"><table style="width:100%;border-collapse:collapse;font-size:16px">
<tr><th style="text-align:left;padding:10px 6px;color:${K.sub};font-weight:500;border-bottom:1px solid ${K.rule}">お客様が聞きそうな質問</th><th style="width:150px;color:${K.sub};font-weight:500;border-bottom:1px solid ${K.rule}">名前が出たか</th></tr>
${QS.map((q, i) => `<tr><td style="padding:10px 6px;border-bottom:1px solid ${K.rule}">Q${i + 1}　${q}</td><td style="text-align:center;border-bottom:1px solid ${K.rule}" class="${before[i] ? "yes" : "no"}">${before[i] ? "● 出た" : "― 出なかった"}</td></tr>`).join("")}
</table></div></div>`);

const D_REPORT = shell("計測レポート", `
<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:14px"><div><div style="font-size:28px;font-weight:800">計測レポート</div><div style="font-size:15px;color:${K.sub}">同じ10の質問で、直す前と後を比べます（2週間後に再計測）</div></div></div>
<div style="display:flex;gap:16px;margin-bottom:16px">
<div class="card" style="flex:1.3;padding:18px 22px;display:flex;align-items:center;gap:20px"><div style="font-size:16px;color:${K.sub};width:120px">名前が出た質問</div>
<div style="font-family:Inter;font-weight:800;font-size:64px;color:#A0A8B5">3</div><div style="font-size:40px;color:${K.key}">→</div><div style="font-family:Inter;font-weight:800;font-size:76px;color:${K.key}">7</div><div style="font-size:22px;font-weight:700;white-space:nowrap">／10問</div></div>
${[["名前が出た割合", "30% → 70%"], ["サイトが出典になった割合", "10% → 40%"], ["競合と比べた割合", "18% → 35%"]].map(([k, v]) => `<div class="card" style="flex:1;padding:16px 18px"><div style="font-size:14px;color:${K.sub}">${k}</div><div style="font-family:Inter;font-weight:800;font-size:28px;margin-top:8px">${v}</div></div>`).join("")}</div>
<div class="card" style="padding:6px 18px"><table style="width:100%;border-collapse:collapse;font-size:16px">
<tr>${["質問", "直す前", "", "直した後"].map((h) => `<th style="text-align:left;padding:9px 6px;color:${K.sub};font-weight:500;border-bottom:1px solid ${K.rule}">${h}</th>`).join("")}</tr>
${QS.slice(0, 7).map((q, i) => `<tr style="${!before[i] && after[i] ? `background:${K.tint}` : ""}"><td style="padding:9px 6px;border-bottom:1px solid ${K.rule}">${q}</td><td class="${before[i] ? "yes" : "no"}" style="border-bottom:1px solid ${K.rule}">${before[i] ? "出た" : "出なかった"}</td><td style="color:${K.sub};border-bottom:1px solid ${K.rule}">→</td><td class="${after[i] ? "yes" : "no"}" style="border-bottom:1px solid ${K.rule}">${after[i] ? "出た" : "出なかった"}</td></tr>`).join("")}
</table></div>`);

const bubble = (who, text, extra = "") => who === "ai"
  ? `<div style="display:flex;gap:10px;margin-bottom:12px"><img src="${FACE}" style="width:38px;height:38px;border-radius:50%"><div style="background:#fff;border:1px solid ${K.rule};border-radius:4px 14px 14px 14px;padding:10px 13px;font-size:15px;line-height:1.6;max-width:82%">${text}${extra}</div></div>`
  : `<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><div style="background:${K.key};color:#fff;border-radius:14px 4px 14px 14px;padding:10px 13px;font-size:15px;line-height:1.6;max-width:80%">${text}</div></div>`;
const tags = (arr) => `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${arr.map((t) => `<span style="background:${K.tint};color:${K.key};border-radius:999px;padding:3px 10px;font-size:13px;font-weight:700">${t}</span>`).join("")}</div>`;

const D_TOOLS = shell("チャット", `
<div style="display:flex;gap:16px;height:690px">
<div class="card" style="flex:1.25;padding:16px;background:#F7F9FD;overflow:hidden">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><img src="${FACE}" style="width:44px;height:44px;border-radius:50%"><div><b style="font-size:17px">トリウル君</b><div style="font-size:13px;color:${K.sub}">AirReach の案内役</div></div></div>
${bubble("ai", "こんにちは、トリウルです。ホームページのアドレスを教えてください。")}
${bubble("me", "見本工務店のホームページを見てください")}
${bubble("ai", "読み込みました。お客様が聞きそうな質問を、10個考えました。", tags(["料金の目安", "対応エリア", "工期"]))}
${bubble("me", "「会社の名札」って何？")}
${bubble("ai", "AIや検索エンジンに、会社の名前・場所・連絡先などを伝える「ページの裏側の情報」です。見た目は変わりません。")}
</div>
<div style="flex:1;display:flex;flex-direction:column;gap:16px">
<div class="card" style="padding:16px 18px"><b style="font-size:17px">ことばメモ</b><div style="font-size:13px;color:${K.sub};margin-bottom:10px">聞いた言葉が、ここにたまります</div>
<div style="background:${K.accS};border-radius:10px;padding:12px;font-size:15px;line-height:1.6"><b>会社の名札</b><br>専門用語では「構造化データ」。AIや検索エンジン向けの、会社の基本情報です。</div></div>
<div class="card" style="padding:16px 18px;flex:1"><b style="font-size:17px">下書き</b><div style="font-size:13px;color:${K.sub};margin-bottom:10px">反映するのは、承認したものだけ</div>
<div style="border:1px solid ${K.rule};border-radius:10px;padding:12px;font-size:15px;line-height:1.6"><b>Q. 対応エリアはどこまでですか？</b><br>〇〇市・△△市・□□町です。そのほかの地域もご相談ください。
<div style="margin-top:10px;display:flex;gap:8px;align-items:center"><span class="chip" style="padding:3px 10px;font-size:13px">承認待ち</span></div></div>
<div class="btn" style="display:block;text-align:center;padding:13px;margin-top:16px;font-size:16px">内容を確かめて承認する</div></div>
</div></div>`);

const D_AGENCY = shell("計測レポート", `
<div style="font-size:26px;font-weight:800;margin-bottom:4px">お客様A社　AI検索レポート</div><div style="font-size:15px;color:${K.sub};margin-bottom:18px">制作・広告会社向けの画面（見本）　お客様ごとに、直す前と後を並べて報告</div>
<div style="display:flex;gap:16px">
${[["名前が出た", 3, 7], ["おすすめされた", 1, 4], ["サイトが出典になった", 1, 4]].map(([k, a, b]) => `<div class="card" style="flex:1;padding:20px"><div style="font-size:17px;font-weight:700;margin-bottom:14px">${k}（10問中）</div>
<div style="display:flex;align-items:end;gap:26px;height:360px;border-bottom:2px solid ${K.rule};padding:0 30px">
<div style="flex:1;text-align:center"><div style="font-family:Inter;font-weight:800;font-size:26px;color:#8A93A3">${a}</div><div style="height:${a * 40}px;background:#C9D3E3;border-radius:6px 6px 0 0"></div></div>
<div style="flex:1;text-align:center"><div style="font-family:Inter;font-weight:800;font-size:30px;color:${K.key}">${b}</div><div style="height:${b * 40}px;background:${K.key};border-radius:6px 6px 0 0"></div></div></div>
<div style="display:flex;justify-content:space-around;font-size:15px;color:${K.sub};margin-top:8px"><span>直す前</span><span>直した後</span></div></div>`).join("")}
</div>`);

// ---------- スマートフォン（390×844） ----------
const mob = (title, body, bg = "#F5F8FE") => `<html><head><style>${css}</style></head><body style="width:390px;height:844px;background:${bg}">
<div style="height:54px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 26px 6px;font-family:Inter;font-weight:600;font-size:16px"><span>9:41</span><span>●●●</span></div>${title}${body}</body></html>`;
const M_CHAT = mob(`<div style="padding:8px 16px 12px;background:#fff;border-bottom:1px solid ${K.rule};display:flex;align-items:center;gap:10px"><img src="${FACE}" style="width:40px;height:40px;border-radius:50%"><div style="flex:1"><b style="font-size:16px">トリウル君</b><div style="font-size:12px;color:${K.sub}">AirReach の案内役</div></div>${sample}</div>`,
  `<div style="padding:14px 14px">
${bubble("ai", "下書きを作りました。", tags(["よくある質問（3問）", "会社の名札"]))}
${bubble("me", "内容OK、承認します！")}
${bubble("ai", "ホームページに反映しました。2週間後に、同じ質問でまた測りますね。")}
<div style="text-align:center;font-size:13px;color:${K.sub};margin:6px 0 12px">― 2週間後 ―</div>
${bubble("ai", "同じ質問で測り直しました。", `<div style="margin-top:8px;background:${K.tint};border-radius:10px;padding:10px;text-align:center"><span style="font-family:Inter;font-weight:800;font-size:30px;color:#8A93A3">3</span><span style="font-size:22px;color:${K.key}"> → </span><span style="font-family:Inter;font-weight:800;font-size:38px;color:${K.key}">7</span><span style="font-weight:700">／10問</span><div style="font-size:13px">AIの回答に名前が出ました</div></div>`)}
</div><div style="position:absolute;bottom:26px;left:14px;right:14px;background:#fff;border:1px solid ${K.rule};border-radius:999px;padding:12px 18px;color:${K.sub};font-size:15px">メッセージを入力</div>`);

const M_ANSWER = mob(`<div style="padding:10px 18px 12px;background:#fff;border-bottom:1px solid ${K.rule};display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">AIアシスタント</b>${sample}</div>`,
  `<div style="padding:16px">
<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><div style="background:${K.key};color:#fff;border-radius:14px 4px 14px 14px;padding:11px 14px;font-size:16px">近くで評判のいい工務店は？</div></div>
<div class="card" style="padding:14px 14px;font-size:15px;line-height:1.6">評判のよい工務店を3つ紹介します。<div style="margin-top:10px">
${[["〇〇ホーム", "施工例が多く、口コミの評価が高い", 0], ["見本工務店", "料金の目安と対応エリアがはっきりしている", 1], ["△△建設", "地元で長く営業している", 0]].map(([n, d, me], i) => `<div style="display:flex;gap:10px;padding:10px;border-radius:10px;margin-bottom:6px;${me ? `background:${K.accS};border:2px solid ${K.acc}` : `background:#F5F8FE`}"><span style="font-family:Inter;font-weight:800;color:${K.key};font-size:18px">${i + 1}</span><div><b>${n}</b>${me ? ` <span style="font-size:12px;background:${K.acc};border-radius:999px;padding:1px 8px">あなたの会社</span>` : ""}<div style="font-size:13px;color:${K.sub}">${d}</div></div></div>`).join("")}
</div><div style="font-size:12px;color:${K.sub};margin-top:6px">出典：見本工務店の公式サイト ほか</div></div></div>`);

// ---------- 端末の枠 ----------
const laptop = (img) => `<html><head><style>body{margin:0;background:transparent}.l{width:1500px;padding:60px 70px 90px}
.lid{background:#1B1E24;border-radius:30px 30px 0 0;padding:26px 26px 30px;box-shadow:0 40px 60px rgba(11,47,122,.28)}.lid img{display:block;width:100%;border-radius:4px}
.base{height:34px;margin:0 -60px;background:linear-gradient(#E6E9EF,#B9BFCA);border-radius:0 0 26px 26px;box-shadow:0 26px 40px rgba(11,47,122,.25);position:relative}
.base:after{content:"";position:absolute;left:50%;top:0;width:220px;height:12px;margin-left:-110px;background:#A7AEBA;border-radius:0 0 12px 12px}</style></head>
<body><div class="l"><div class="lid"><img src="${img}"></div><div class="base"></div></div></body></html>`;
const phone = (img) => `<html><head><style>body{margin:0;background:transparent}.p{padding:50px 60px 80px;width:560px;position:relative}
.f{background:#16181D;border-radius:66px;padding:16px;box-shadow:0 40px 60px rgba(11,47,122,.32)}.f img{display:block;width:100%;border-radius:52px}
.n{position:absolute;left:50%;margin-left:-60px;top:76px;width:120px;height:32px;background:#16181D;border-radius:20px}</style></head>
<body><div class="p"><div class="n"></div><div class="f"><img src="${img}"></div></div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const shot = async (html, name, w, h, scale = 2, el = false) => {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
    await p.setContent(html, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    const file = path.join(OUT, name);
    if (el) await (await p.$("body > div")).screenshot({ path: file, omitBackground: true });
    else await p.screenshot({ path: file });
    await p.close();
    return "data:image/png;base64," + fs.readFileSync(file).toString("base64");
  };
  const d = {
    diag: await shot(D_DIAG, "scr_diag.png", 1280, 800),
    report: await shot(D_REPORT, "scr_report.png", 1280, 800),
    tools: await shot(D_TOOLS, "scr_tools.png", 1280, 800),
    agency: await shot(D_AGENCY, "scr_agency.png", 1280, 800),
  };
  const m = { chat: await shot(M_CHAT, "scr_m_chat.png", 390, 844), answer: await shot(M_ANSWER, "scr_m_answer.png", 390, 844) };
  for (const k of Object.keys(d)) await shot(laptop(d[k]), `dev_laptop_${k}.png`, 1640, 1100, 1, true);
  for (const k of Object.keys(m)) await shot(phone(m[k]), `dev_phone_${k}.png`, 680, 1100, 1, true);
  await browser.close();
  console.log("ok", fs.readdirSync(OUT).filter((f) => f.startsWith("dev_")).join(" "));
})();
