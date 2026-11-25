// Adctor 資料用の画面イメージ（構想段階の管理画面）。当社サイト新版の説明に沿った「見本」。
// 単価・件数・金額はすべて例。画面内に「構想・見本」と明記する。
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "assets_adc");
fs.mkdirSync(OUT, { recursive: true });
const K = { key: "#1762E8", navy: "#0B2F7A", tint: "#EAF1FF", ink: "#111318", sub: "#667085", rule: "#DDE2EA", acc: "#FFB020", accS: "#FFF3D6", ok: "#0E9F6E" };
const css = `*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Noto Sans JP","Inter",sans-serif;color:${K.ink};background:#F5F8FE}
.card{background:#fff;border:1px solid ${K.rule};border-radius:14px}.chip{display:inline-block;background:${K.accS};color:#8A5300;border:1px solid ${K.acc};border-radius:999px;font-weight:700}
.n{font-family:Inter;font-weight:800}.tag{display:inline-block;border-radius:999px;padding:3px 10px;font-size:13px;font-weight:700}
.g{background:#E6F6EF;color:${K.ok}}.b{background:${K.tint};color:${K.key}}.y{background:${K.accS};color:#8A5300}
table{width:100%;border-collapse:collapse;font-size:15px}th{text-align:left;color:${K.sub};font-weight:500;padding:9px 8px;border-bottom:1px solid ${K.rule}}td{padding:10px 8px;border-bottom:1px solid ${K.rule}}`;
const sample = `<span class="chip" style="padding:4px 12px;font-size:13px">構想・見本</span>`;

const shell = (active, body) => `<html><head><style>${css}
.side{position:fixed;left:0;top:0;bottom:0;width:220px;background:${K.navy};color:#fff;padding:26px 18px}
.side .lg{font-family:Inter;font-weight:800;font-size:28px;margin-bottom:4px}.side .org{font-size:13px;opacity:.7;margin-bottom:26px}
.m{font-size:16px;padding:11px 14px;border-radius:10px;margin-bottom:4px;opacity:.75}.m.on{background:rgba(255,255,255,.14);opacity:1;font-weight:700}
.main{margin-left:220px;padding:24px 30px}</style></head><body style="width:1280px;height:800px">
<div class="side"><div class="lg">Adctor</div><div class="org">見本新聞社（例）</div>
${["AIアクセス", "条件と単価", "利用記録", "請求・分配"].map((m) => `<div class="m ${m === active ? "on" : ""}">${m}</div>`).join("")}</div>
<div class="main"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><div style="font-size:28px;font-weight:800">${active}</div>${sample}</div>${body}</div></body></html>`;

const D_DASH = shell("AIアクセス", `
<div style="display:flex;gap:14px;margin-bottom:16px">
${[["AIからのアクセス（過去30日）", "12,480", "件", "+18%"], ["条件に合意済みの事業者", "3", "社", ""], ["条件を案内した件数", "4,102", "件", ""]].map(([k, v, u, d]) => `<div class="card" style="flex:1;padding:18px 20px"><div style="font-size:14px;color:${K.sub}">${k}</div><div class="n" style="font-size:40px;margin-top:4px">${v}<span style="font-size:18px;font-family:'Noto Sans JP'"> ${u}</span>${d ? `<span style="font-size:16px;color:${K.ok};margin-left:10px">${d}</span>` : ""}</div></div>`).join("")}</div>
<div style="display:flex;gap:14px">
<div class="card" style="flex:1.1;padding:16px 18px"><div style="font-size:16px;font-weight:700;margin-bottom:10px">AIアクセスの推移</div>
<div style="display:flex;align-items:end;gap:6px;height:260px;border-bottom:1px solid ${K.rule}">${[22, 28, 25, 31, 36, 33, 40, 38, 45, 43, 50, 48, 55, 58, 62].map((h, i) => `<div style="flex:1;height:${h * 4}px;background:${i > 11 ? K.key : "#B9CCF5"};border-radius:4px 4px 0 0"></div>`).join("")}</div>
<div style="display:flex;justify-content:space-between;font-size:13px;color:${K.sub};margin-top:6px"><span>11/1</span><span>11/15</span><span>11/30</span></div></div>
<div class="card" style="flex:1;padding:8px 16px"><table><tr><th>事業者</th><th>件数</th><th>状態</th></tr>
${[["AI事業者A", "6,210", "合意済み", "g"], ["AI事業者B", "3,980", "合意済み", "g"], ["名前のないボット", "2,290", "条件を案内", "y"], ["AI事業者C", "1,040", "条件を確認中", "b"]].map(([a, b, c, t]) => `<tr><td><b>${a}</b></td><td class="n">${b}</td><td><span class="tag ${t}">${c}</span></td></tr>`).join("")}
</table></div></div>`);

const D_TERMS = shell("条件と単価", `
<div style="display:flex;gap:16px">
<div class="card" style="flex:1.2;padding:20px 24px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><b style="font-size:18px">公開している条件（例）</b><span class="tag b">公開中</span></div>
${[["AIの回答での参照", "¥0.5", "／件"], ["要約・引用の表示", "¥1.2", "／件"], ["AIの学習", "個別に相談", ""]].map(([k, v, u]) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:18px 0;border-bottom:1px solid ${K.rule}"><span style="font-size:18px">${k}</span><span class="n" style="font-size:30px;color:${K.key}">${v}<span style="font-size:16px;color:${K.sub};font-family:'Noto Sans JP'">${u}</span></span></div>`).join("")}
<div style="margin-top:18px;background:${K.accS};border-radius:10px;padding:14px;font-size:15px;line-height:1.7">条件に合意していない事業者には、条件の案内を返します。</div></div>
<div style="flex:1;display:flex;flex-direction:column;gap:14px">
<div class="card" style="padding:18px 20px"><b style="font-size:17px">事業者ごとの条件</b><div style="margin-top:12px;font-size:16px;line-height:2">AI事業者A：¥0.4／件（年間契約）<br>AI事業者B：公開条件どおり</div></div>
<div class="card" style="padding:18px 20px"><b style="font-size:17px">使ってよい範囲</b><div style="margin-top:12px;font-size:16px;line-height:2">回答での参照 <span class="tag g">許可</span><br>要約・引用の表示 <span class="tag g">許可</span><br>学習 <span class="tag y">個別に相談</span></div></div>
</div></div>`);

const D_SETTLE = shell("請求・分配", `
<div style="display:flex;gap:16px">
<div class="card" style="flex:1.15;padding:8px 16px"><div style="padding:10px 0 4px;font-size:17px;font-weight:700">利用記録（リアルタイム・例）</div><table><tr><th>時刻</th><th>事業者</th><th>ページ</th><th>結果</th></tr>
${[["10:02:14", "A", "/news/1024", "許可・鍵あり", "g"], ["10:02:15", "不明", "/news/0871", "条件を案内", "y"], ["10:02:17", "B", "/news/0993", "許可・鍵あり", "g"], ["10:02:21", "A", "/news/1102", "許可・鍵あり", "g"], ["10:02:26", "C", "/news/0640", "確認中", "b"]].map(([a, b, c, d, t]) => `<tr><td class="n" style="font-weight:600">${a}</td><td>${b}</td><td>${c}</td><td><span class="tag ${t}">${d}</span></td></tr>`).join("")}</table></div>
<div class="card" style="flex:1;padding:18px 20px"><div style="display:flex;justify-content:space-between"><b style="font-size:17px">請求と分配（試算）</b><span class="tag y">検証中</span></div>
<div style="font-size:15px;color:${K.sub};margin:8px 0 12px">利用記録 × 条件と単価 → 請求</div>
${[["AI事業者A", "6,210件 × ¥0.5", "¥3,105"], ["AI事業者B", "3,980件 × ¥1.2", "¥4,776"]].map(([a, b, c]) => `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid ${K.rule};font-size:16px"><span><b>${a}</b><br><span style="color:${K.sub}">${b}</span></span><span class="n" style="font-size:22px;align-self:center">${c}</span></div>`).join("")}
<div style="display:flex;justify-content:space-between;padding:14px 0;font-size:18px;font-weight:800"><span>合計</span><span class="n" style="font-size:28px;color:${K.key}">¥7,881</span></div>
<div style="background:${K.tint};border-radius:10px;padding:12px;font-size:15px">情報提供者への分配：見本新聞社 ほか2社</div></div></div>`);

const D_API = `<html><head><style>${css}</style></head><body style="width:1280px;height:800px;background:#0F1420;color:#E6EAF2;font-family:'Inter',monospace">
<div style="display:flex;justify-content:space-between;align-items:center;padding:22px 30px;border-bottom:1px solid #263047"><span style="font-size:20px;font-weight:700">AI事業者のプログラム（例）</span>${sample}</div>
<pre style="padding:28px 34px;font-size:24px;line-height:1.65;font-family:'Inter',monospace;white-space:pre-wrap"><span style="color:#7F8BA3"># 1. 使うたびに、Adctorから鍵をもらう</span>
<span style="color:#FFB020">POST</span> /v1/tokens
{ "url": "…/news/1024", "use": "answer" }
<span style="color:#7F8BA3">← 200</span>
{ "token": "adt_9f2…", "expires_in": 300 }

<span style="color:#7F8BA3"># 2. 鍵を付けて、情報を取りに行く</span>
<span style="color:#FFB020">GET</span> /news/1024
Adctor-Token: adt_9f2…
<span style="color:#4ADE80">← 200 OK　利用を記録しました</span></pre></body></html>`;

const mob = (body, bg) => `<html><head><style>${css}</style></head><body style="width:390px;height:844px;background:${bg}">${body}</body></html>`;
const M_LOCK = mob(`<div style="padding:70px 20px;color:#fff;text-align:center"><div style="font-size:18px;opacity:.85">11月24日 月曜日</div><div class="n" style="font-size:84px;font-weight:700">9:41</div></div>
<div style="padding:0 14px">${[["今週のAIアクセス：2,914件", "名前のないボットに、条件を案内しました（871件）"], ["AI事業者Aが、条件に合意しました", "回答での参照・¥0.4／件（例）"], ["11月の分配（試算）：¥3,625", "共同実証で、計算のしかたを検証中です"]].map(([a, b]) => `<div style="background:rgba(255,255,255,.88);border-radius:20px;padding:14px 16px;margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:13px;color:${K.sub}"><b style="color:${K.navy}">Adctor</b><span>いま</span></div><div style="font-size:16px;font-weight:700;margin-top:4px">${a}</div><div style="font-size:14px;color:#3B4252;margin-top:2px">${b}</div></div>`).join("")}
<div style="text-align:center;margin-top:10px"><span class="chip" style="padding:3px 12px;font-size:12px">構想・見本</span></div></div>`, `linear-gradient(160deg,#4C86EE,#0B2F7A)`);
const M_ANS = mob(`<div style="height:54px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 26px 6px;font-family:Inter;font-weight:600;font-size:16px"><span>9:41</span><span>●●●</span></div>
<div style="padding:10px 18px 12px;background:#fff;border-bottom:1px solid ${K.rule};display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">AIアシスタント</b>${sample}</div>
<div style="padding:16px"><div style="display:flex;justify-content:flex-end;margin-bottom:14px"><div style="background:${K.key};color:#fff;border-radius:14px 4px 14px 14px;padding:11px 14px;font-size:16px">新しい子育て支援のポイントは？</div></div>
<div class="card" style="padding:16px;font-size:16px;line-height:1.75">ポイントは3つです。対象の年齢が広がり、申し込みがオンラインになり、受け取りが毎月になります。
<div style="margin-top:12px;background:#E6F6EF;border-radius:10px;padding:10px 12px;font-size:14px;color:${K.ok};font-weight:700">出典：見本新聞（利用条件に合意済み）</div></div></div>`, "#F5F8FE");

const laptop = (img) => `<html><head><style>body{margin:0;background:transparent}.l{width:1500px;padding:60px 70px 90px}
.lid{background:#1B1E24;border-radius:30px 30px 0 0;padding:26px 26px 30px;box-shadow:0 40px 60px rgba(11,47,122,.28)}.lid img{display:block;width:100%;border-radius:4px}
.base{height:34px;margin:0 -60px;background:linear-gradient(#E6E9EF,#B9BFCA);border-radius:0 0 26px 26px;box-shadow:0 26px 40px rgba(11,47,122,.25);position:relative}
.base:after{content:"";position:absolute;left:50%;top:0;width:220px;height:12px;margin-left:-110px;background:#A7AEBA;border-radius:0 0 12px 12px}</style></head>
<body><div class="l"><div class="lid"><img src="${img}"></div><div class="base"></div></div></body></html>`;
const phone = (img) => `<html><head><style>body{margin:0;background:transparent}.p{padding:50px 60px 80px;width:560px;position:relative}
.f{background:#16181D;border-radius:66px;padding:16px;box-shadow:0 40px 60px rgba(11,47,122,.32)}.f img{display:block;width:100%;border-radius:52px}
.n2{position:absolute;left:50%;margin-left:-60px;top:76px;width:120px;height:32px;background:#16181D;border-radius:20px}</style></head>
<body><div class="p"><div class="n2"></div><div class="f"><img src="${img}"></div></div></body></html>`;

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
  const d = { dash: await shot(D_DASH, "scr_dash.png", 1280, 800), terms: await shot(D_TERMS, "scr_terms.png", 1280, 800), settle: await shot(D_SETTLE, "scr_settle.png", 1280, 800), api: await shot(D_API, "scr_api.png", 1280, 800) };
  const m = { lock: await shot(M_LOCK, "scr_m_lock.png", 390, 844), answer: await shot(M_ANS, "scr_m_answer.png", 390, 844) };
  for (const k of Object.keys(d)) await shot(laptop(d[k]), `dev_laptop_${k}.png`, 1640, 1100, 1, true);
  for (const k of Object.keys(m)) await shot(phone(m[k]), `dev_phone_${k}.png`, 680, 1100, 1, true);
  await browser.close();
  console.log("ok");
})();
