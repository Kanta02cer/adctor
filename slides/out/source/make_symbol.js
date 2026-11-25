// Trillion Bank のロゴシンボル（3枚のフレーム＋還る青い線）を、当社サイトの SVG パスから PNG にする
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright");
const OUT = path.join(__dirname, "assets_profile"); fs.mkdirSync(OUT, { recursive: true });
const FR = ["M103 74 L168 42 L168 214 L103 247 Z", "M183 97 L248 64 L248 236 L183 268 Z", "M263 108 L327 75 L327 248 L263 281 Z"];
const WAVE = "M25 165 H105 C130 165 140 137 166 137 C200 137 216 191 256 191 C286 191 296 165 322 165 H389";
const svg = (frame, wave, fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 414 318" width="828" height="636">
${FR.map((d) => `<path d="${d}" fill="${fill || "none"}" stroke="${frame}" stroke-width="12" stroke-linejoin="round"/>`).join("")}
<path d="${WAVE}" fill="none" stroke="${wave}" stroke-width="16" stroke-linecap="round"/></svg>`;
(async () => {
  const b = await chromium.launch();
  for (const [name, fr, wv, fill] of [["tb_symbol_navy.png", "#0B2F7A", "#1762E8"], ["tb_symbol_white.png", "#FFFFFF", "#FFB020"], ["tb_symbol_fill.png", "#0B2F7A", "#1762E8", "rgba(234,241,255,.9)"]]) {
    const p = await b.newPage({ viewport: { width: 828, height: 636 } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg(fr, wv, fill)}</body></html>`);
    await (await p.$("svg")).screenshot({ path: path.join(OUT, name), omitBackground: true });
    await p.close();
  }
  await b.close(); console.log("ok");
})();
