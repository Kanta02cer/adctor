// v7：Adctor の実証実験（PoC）用の試作画面を HTML で作り、実際のブラウザで描画して画像にする。
// さらに、ノートパソコンとスマートフォンの枠に入れた画像（背景透過・影つき）を作る。
// 表示している数字・社名はすべて見本。画面内にも「見本データ」と明記する。
// 使い方: NODE_PATH=... node make_screens_v7.js
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "assets_v7");
fs.mkdirSync(OUT, { recursive: true });

const PAL = { key: "#1762E8", navy: "#0B2F7A", tint: "#EAF1FF", ink: "#111318", sub: "#667085", rule: "#DDE2EA", acc: "#FFB020", accSoft: "#FFF3D6" };
const base = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Noto Sans JP","Inter",sans-serif;color:${PAL.ink};background:#F5F8FE}
.chip{display:inline-block;background:${PAL.accSoft};color:#8A5300;border:1px solid ${PAL.acc};border-radius:999px;font-weight:700}
.btn{display:inline-block;background:${PAL.key};color:#fff;border-radius:10px;font-weight:700}
.card{background:#fff;border:1px solid ${PAL.rule};border-radius:16px}
.ok{color:${PAL.key};font-weight:700}
`;

// ---------- パソコン画面（1280×800） ----------
function desk(active, title, sub, body) {
  const menu = ["ホーム", "合意の内容", "取得の記録", "請求と入金", "分配"];
  return `<html><head><style>${base}
  .wrap{display:flex;height:800px;width:1280px}
  .side{width:230px;background:#fff;border-right:1px solid ${PAL.rule};padding:28px 20px}
  .logo{font-family:Inter;font-weight:800;font-size:30px;color:${PAL.key};margin-bottom:6px}
  .org{font-size:13px;color:${PAL.sub};margin-bottom:28px}
  .m{font-size:17px;padding:12px 14px;border-radius:10px;margin-bottom:4px;color:${PAL.sub};font-weight:500}
  .m.on{background:${PAL.tint};color:${PAL.key};font-weight:700}
  .main{flex:1;padding:26px 36px;overflow:hidden}
  .banner{background:${PAL.accSoft};border:1px solid ${PAL.acc};color:#7A4A00;border-radius:10px;padding:10px 16px;font-size:15px;font-weight:700;margin-bottom:18px}
  h1{font-size:30px;font-weight:800;margin-bottom:4px}
  .s{color:${PAL.sub};font-size:16px;margin-bottom:20px}
  table{width:100%;border-collapse:collapse;font-size:15px}
  th{text-align:left;color:${PAL.sub};font-weight:500;padding:10px 12px;border-bottom:1px solid ${PAL.rule}}
  td{padding:13px 12px;border-bottom:1px solid ${PAL.rule}}
  tr.hl td{background:${PAL.tint}}
  </style></head><body><div class="wrap"><div class="side"><div class="logo">Adctor</div><div class="org">提供企業B社（見本）</div>
  ${menu.map((m) => `<div class="m ${m === active ? "on" : ""}">${m}</div>`).join("")}</div>
  <div class="main"><div class="banner">これは実証実験用の試作画面です。表示している数字・社名はすべて見本です。</div>
  <h1>${title}</h1><div class="s">${sub}</div>${body}</div></div></body></html>`;
}
const stats = (items) => `<div style="display:flex;gap:16px;margin-bottom:20px">${items.map(([k, v, u]) => `<div class="card" style="flex:1;padding:18px 20px"><div style="font-size:15px;color:${PAL.sub}">${k}</div><div style="font-family:Inter;font-weight:800;font-size:38px;margin-top:4px">${v}<span style="font-family:'Noto Sans JP';font-size:18px;margin-left:4px">${u}</span></div></div>`).join("")}</div>`;

const D_LEDGER = desk("取得の記録", "取得の記録", "2026年12月分　買い手がデータを取得するたびに1行ずつ残ります", `
  ${stats([["取得された回数", "128", "回"], ["取得した会社", "1", "社"], ["請求の予定", "128,000", "円"]])}
  <div class="card" style="padding:10px 16px">
  <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0 8px"><b style="font-size:17px">取得の一覧</b><span class="btn" style="padding:9px 16px;font-size:15px">表計算用に書き出す</span></div>
  <table><tr><th>日時</th><th>取得した会社</th><th>データ</th><th>ファイル</th><th>合意番号</th></tr>
  ${[["12/14 10:02", true], ["12/14 09:47"], ["12/13 18:20"], ["12/13 11:05"], ["12/12 16:41"]].map(([t, h], i) => `<tr class="${h ? "hl" : ""}"><td>${t}</td><td>買い手A社</td><td>商品レビュー</td><td>review_${String(128 - i).padStart(3, "0")}.csv</td><td>合意-001</td></tr>`).join("")}
  </table></div>`);

const D_AGREE = desk("合意の内容", "合意の内容", "利用の条件と価格を、両社が確認して承認した内容です", `
  <div style="display:flex;gap:20px">
  <div class="card" style="flex:1.4;padding:24px 28px;font-size:18px;line-height:2.1">
  ${[["合意番号", "合意-001"], ["提供企業", "B社（見本）"], ["買い手", "A社（見本）"], ["対象のデータ", "商品レビュー（見本）"], ["使ってよい範囲", "社内の分析のみ。AIの学習には使わない"], ["価格", "1回の取得につき 1,000円（見本）"], ["期間", "2026年12月1日〜2027年2月28日"]].map(([k, v]) => `<div style="display:flex;border-bottom:1px solid ${PAL.rule}"><span style="width:170px;color:${PAL.sub}">${k}</span><b>${v}</b></div>`).join("")}
  </div>
  <div style="flex:1;display:flex;flex-direction:column;gap:16px">
  ${[["提供企業B社", "承認済み　12/01 10:15"], ["買い手A社", "承認済み　12/01 14:30"]].map(([k, v]) => `<div class="card" style="padding:22px"><div style="font-size:16px;color:${PAL.sub}">${k}</div><div class="ok" style="font-size:24px;margin-top:6px">✓ ${v}</div></div>`).join("")}
  <div class="card" style="padding:22px;background:${PAL.tint};border-color:${PAL.tint}"><div style="font-size:17px;font-weight:700;color:${PAL.navy}">この合意にもとづいて、取得の記録と請求が作られます</div></div>
  </div></div>`);

const D_BILL = desk("請求と入金", "請求と入金の確認", "記録から作った請求と、実際の振込を照らし合わせます", `
  ${stats([["請求した金額", "128,000", "円"], ["振り込まれた金額", "128,000", "円"], ["差", "0", "円"]])}
  <div class="card" style="padding:10px 16px"><table><tr><th>月</th><th>請求</th><th>振込</th><th>確認の結果</th><th>分配</th></tr>
  ${[["2026年12月", "128,000円", "128,000円", "一致", "準備中"], ["2026年11月", "96,000円", "96,000円", "一致", "完了"], ["2026年10月", "54,000円", "54,000円", "一致", "完了"]].map((r, i) => `<tr class="${i ? "" : "hl"}">${r.map((c, j) => `<td class="${j === 3 ? "ok" : ""}">${j === 3 ? "✓ " : ""}${c}</td>`).join("")}</tr>`).join("")}
  </table></div>
  <div style="margin-top:18px;font-size:15px;color:${PAL.sub}">実証実験では、振込の確認は担当者が目で見て行います（自動ではありません）。</div>`);

// ---------- スマートフォン画面（390×844） ----------
function mob(title, body) {
  return `<html><head><style>${base}
  .bar{height:54px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 26px 6px;font-family:Inter;font-weight:600;font-size:16px}
  .top{padding:10px 20px 14px;background:#fff;border-bottom:1px solid ${PAL.rule}}
  .lg{font-family:Inter;font-weight:800;font-size:24px;color:${PAL.key}}
  .main{padding:16px 18px}
  </style></head><body style="width:390px;height:844px;background:#F5F8FE"><div class="bar"><span>9:41</span><span>●●●</span></div>
  <div class="top"><div style="display:flex;justify-content:space-between;align-items:center"><span class="lg">Adctor</span><span class="chip" style="padding:3px 10px;font-size:12px">見本データ</span></div>
  <div style="font-size:20px;font-weight:800;margin-top:8px">${title}</div></div><div class="main">${body}</div></body></html>`;
}
const M_PAYOUT = mob("今月の分配", `
  <div class="card" style="padding:20px;background:${PAL.key};border:none;color:#fff">
  <div style="font-size:14px;opacity:.85">2026年12月の分配予定（見本）</div>
  <div style="font-family:Inter;font-weight:800;font-size:40px;margin-top:4px">— <span style="font-size:16px;font-family:'Noto Sans JP'">円</span></div>
  <div style="font-size:13px;opacity:.85;margin-top:2px">手数料の率は検討中のため未表示</div></div>
  <div style="font-size:16px;font-weight:700;margin:18px 0 8px">最近の取得</div>
  ${["12/14 10:02", "12/14 09:47", "12/13 18:20", "12/13 11:05", "12/12 16:41"].map((t, i) => `<div class="card" style="padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:8px;font-size:14px"><span style="flex:1;min-width:0"><b>買い手A社</b><br><span style="color:${PAL.sub}">商品レビュー・${t}</span></span><span class="ok" style="white-space:nowrap;font-size:13px">記録済み</span></div>`).join("")}
  <div class="btn" style="display:block;text-align:center;padding:12px;margin-top:10px;font-size:15px">明細を見る</div>`);
const M_APPROVE = mob("利用条件の確認", `
  <div class="card" style="padding:18px;font-size:15px;line-height:2">
  ${[["対象", "商品レビュー（見本）"], ["使ってよい範囲", "社内の分析のみ"], ["価格", "1回 1,000円（見本）"], ["期間", "2026/12/1〜2027/2/28"]].map(([k, v]) => `<div style="border-bottom:1px solid ${PAL.rule}"><span style="color:${PAL.sub};font-size:13px">${k}</span><br><b>${v}</b></div>`).join("")}</div>
  <div class="card" style="padding:14px;margin-top:12px;background:${PAL.accSoft};border-color:${PAL.acc};font-size:13px;line-height:1.7">AIの学習には使えません。範囲外で使う場合は、あらためて合意が必要です。</div>
  <div class="btn" style="display:block;text-align:center;padding:14px;margin-top:16px;font-size:17px">この条件で承認する</div>
  <div style="text-align:center;color:${PAL.sub};font-size:14px;margin-top:12px">承認すると、提供企業に通知されます</div>`);

// ---------- 端末の枠 ----------
const laptop = (img) => `<html><head><style>body{margin:0;background:transparent}
.l{position:relative;width:1500px;padding:60px 70px 90px}
.lid{background:#1B1E24;border-radius:30px 30px 0 0;padding:26px 26px 30px;box-shadow:0 40px 60px rgba(11,47,122,.28)}
.lid img{display:block;width:100%;border-radius:4px}
.base{height:34px;margin:0 -60px;background:linear-gradient(#E6E9EF,#B9BFCA);border-radius:0 0 26px 26px;box-shadow:0 26px 40px rgba(11,47,122,.25);position:relative}
.base:after{content:"";position:absolute;left:50%;top:0;width:220px;height:12px;margin-left:-110px;background:#A7AEBA;border-radius:0 0 12px 12px}
</style></head><body><div class="l"><div class="lid"><img src="${img}"></div><div class="base"></div></div></body></html>`;
const phone = (img) => `<html><head><style>body{margin:0;background:transparent}
.p{padding:50px 60px 80px;width:560px}
.f{background:#16181D;border-radius:66px;padding:16px;box-shadow:0 40px 60px rgba(11,47,122,.32)}
.f img{display:block;width:100%;border-radius:52px}
.n{position:absolute;left:50%;margin-left:-60px;top:76px;width:120px;height:32px;background:#16181D;border-radius:20px}
</style></head><body><div class="p" style="position:relative"><div class="n"></div><div class="f"><img src="${img}"></div></div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const shot = async (html, name, w, h, scale = 2, transparent = false) => {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
    await p.setContent(html, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    const file = path.join(OUT, name);
    if (transparent) {
      const el = await p.$("body > div");
      await el.screenshot({ path: file, omitBackground: true });
    } else await p.screenshot({ path: file });
    await p.close();
    return file;
  };
  const screens = {
    d_ledger: await shot(D_LEDGER, "scr_d_ledger.png", 1280, 800),
    d_agree: await shot(D_AGREE, "scr_d_agree.png", 1280, 800),
    d_bill: await shot(D_BILL, "scr_d_bill.png", 1280, 800),
    m_payout: await shot(M_PAYOUT, "scr_m_payout.png", 390, 844, 2),
    m_approve: await shot(M_APPROVE, "scr_m_approve.png", 390, 844, 2),
  };
  // 枠つき（背景透過）。画像はデータURIで埋め込む
  const uri = (f) => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
  for (const k of ["d_ledger", "d_agree", "d_bill"]) await shot(laptop(uri(screens[k])), `dev_laptop_${k.slice(2)}.png`, 1640, 1100, 1, true);
  await shot(laptop(uri(path.join(__dirname, "assets_v5", "tb_site.jpg")).replace("image/png", "image/jpeg")), "dev_laptop_site.png", 1640, 1100, 1, true);
  for (const k of ["m_payout", "m_approve"]) await shot(phone(uri(screens[k])), `dev_phone_${k.slice(2)}.png`, 680, 1100, 1, true);
  await browser.close();
  console.log("ok", fs.readdirSync(OUT).join(" "));
})();
