"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen = "home" | "hack" | "tsukull" | "adctor" | "settings";
type Period = "今日" | "今週" | "今月" | "四半期";

interface LogRow {
  id: string;
  time: string;
  bot: string;
  owner: string;
  asn: string;
  ip: string;
  path: string;
  rtype: string;
  status: string;
  amount: string;
  amtColor: string;
  badgeColor: string;
  badgeBg: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const BOTS = [
  { bot: "GPTBot", owner: "OpenAI LLC", asn: "AS40027", ip: "20.171" },
  { bot: "ClaudeBot", owner: "Anthropic PBC", asn: "AS399358", ip: "160.79" },
  { bot: "PerplexityBot", owner: "Perplexity AI", asn: "AS396982", ip: "34.142" },
  { bot: "Bytespider", owner: "ByteDance Ltd", asn: "AS138699", ip: "110.249" },
  { bot: "Google-Extended", owner: "Google LLC", asn: "AS15169", ip: "66.249" },
  { bot: "CCBot", owner: "Common Crawl", asn: "AS54321", ip: "52.91" },
  { bot: "anthropic-ai", owner: "Anthropic PBC", asn: "AS399358", ip: "160.79" },
];
const STATUS_META: Record<string, { c: string; bg: string }> = {
  "決済通過": { c: "#047857", bg: "#ecfdf5" },
  "402返却": { c: "#b45309", bg: "#fffbeb" },
  "ホワイトリスト": { c: "#71717a", bg: "#f4f4f5" },
  "ブロック": { c: "#b91c1c", bg: "#fef2f2" },
};
const RESOURCES = [
  { type: "AI構造化データ", price: 2.40, w: 6, paths: ["/api/llms-full.txt", "/api/products.json", "/.well-known/ai-context.json"] },
  { type: "製品仕様・技術資料", price: 1.80, w: 12, paths: ["/products/rx-200/specs", "/tech/datasheet-v4", "/products/arm-7/specs"] },
  { type: "価格・見積", price: 1.30, w: 10, paths: ["/pricing", "/estimate/form", "/pricing/enterprise"] },
  { type: "製品カタログ (PDF)", price: 1.00, w: 9, paths: ["/catalog/2026.pdf", "/dl/lineup.pdf"] },
  { type: "導入事例", price: 0.60, w: 18, paths: ["/cases/auto-line", "/cases/food-iot", "/cases/logistics"] },
  { type: "ブログ・コラム", price: 0.25, w: 26, paths: ["/blog/ai-factory", "/blog/dx-2026", "/column/fa-trend"] },
  { type: "一般ページ", price: 0.10, w: 17, paths: ["/", "/about", "/news/20260518"] },
];

// ─── Utilities ───────────────────────────────────────────────────────────────
const rint = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
function pickWeighted<T extends { w: number }>(list: T[]): T {
  const total = list.reduce((acc, x) => acc + x.w, 0);
  let r = Math.random() * total;
  for (const x of list) { if ((r -= x.w) <= 0) return x; }
  return list[0];
}

let rowId = 0;
function makeRow(): LogRow {
  const b = pick(BOTS);
  const res = pickWeighted(RESOURCES);
  const r = Math.random();
  const st = r < 0.52 ? "402返却" : r < 0.78 ? "決済通過" : r < 0.92 ? "ホワイトリスト" : "ブロック";
  const m = STATUS_META[st];
  let amount: string, amtColor: string;
  if (st === "決済通過") { amount = "+¥" + res.price.toFixed(2); amtColor = "#047857"; }
  else if (st === "402返却") { amount = "¥" + res.price.toFixed(2); amtColor = "#b45309"; }
  else if (st === "ホワイトリスト") { amount = "免除"; amtColor = "#a1a1aa"; }
  else { amount = "遮断"; amtColor = "#b91c1c"; }
  const d = new Date();
  const time = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
  rowId++;
  return {
    id: "r" + Date.now() + "_" + rowId,
    time, bot: b.bot, owner: b.owner, asn: b.asn,
    ip: b.ip + "." + rint(1, 254) + "." + rint(1, 254),
    path: pick(res.paths), rtype: res.type,
    status: st, amount, amtColor,
    badgeColor: m.c, badgeBg: m.bg,
  };
}
function seedLog(n: number): LogRow[] {
  return Array.from({ length: n }, () => makeRow());
}

// ─── SVG Charts ──────────────────────────────────────────────────────────────
function LineChart({ values, labels, color = "#18181b", w = 620, h = 200, pad = { t: 14, r: 14, b: 26, l: 14 } }: {
  values: number[]; labels?: string[]; color?: string;
  w?: number; h?: number; pad?: { t: number; r: number; b: number; l: number };
}) {
  const id = useRef("g" + Math.round(Math.random() * 1e7)).current;
  if (!values.length) return null;
  const max = Math.max(...values), min = Math.min(...values), range = (max - min) || 1;
  const yMax = max + range * 0.18, yMin = min - range * 0.30, yr = (yMax - yMin) || 1;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const X = (i: number) => pad.l + iw * (values.length <= 1 ? 0 : i / (values.length - 1));
  const Y = (v: number) => pad.t + ih * (1 - (v - yMin) / yr);
  const pts = values.map((v, i) => [X(i), Y(v)] as [number, number]);
  const line = pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaD = `M${pts[0][0].toFixed(1)},${(pad.t + ih).toFixed(1)} L${pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L")} L${pts[pts.length - 1][0].toFixed(1)},${(pad.t + ih).toFixed(1)} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.13} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0, 1, 2].map(g => { const gy = pad.t + ih * (g / 2); return <line key={g} x1={pad.l} x2={w - pad.r} y1={gy} y2={gy} stroke="#f4f4f5" strokeWidth={1} />; })}
      <path d={areaD} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={6} fill={color} opacity={0.14} />
      <circle cx={last[0]} cy={last[1]} r={3.5} fill={color} />
      {labels?.map((lb, i) => lb ? <text key={i} x={X(i)} y={h - 5} fontSize={10} fill="#a1a1aa" textAnchor="middle" fontFamily="Inter, sans-serif">{lb}</text> : null)}
    </svg>
  );
}

function BarChart({ values, labels, color = "#b91c1c", w = 620, h = 200 }: {
  values: number[]; labels?: string[]; color?: string; w?: number; h?: number;
}) {
  const pad = { t: 14, r: 12, b: 26, l: 12 };
  const max = (Math.max(...values) * 1.18) || 1;
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const n = values.length, bw = (iw / n) * 0.5;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{ display: "block" }}>
      {[0, 1, 2].map(g => { const gy = pad.t + ih * (g / 2); return <line key={g} x1={pad.l} x2={w - pad.r} y1={gy} y2={gy} stroke="#f4f4f5" strokeWidth={1} />; })}
      {values.map((v, i) => {
        const cx = pad.l + iw * ((i + 0.5) / n);
        const bh = ih * (v / max);
        return <rect key={i} x={cx - bw / 2} y={pad.t + ih - bh} width={bw} height={bh} rx={3} fill={i === n - 1 ? color : "#e4e4e7"} />;
      })}
      {labels?.map((lb, i) => { const cx = pad.l + iw * ((i + 0.5) / n); return <text key={i} x={cx} y={h - 5} fontSize={10} fill="#a1a1aa" textAnchor="middle" fontFamily="Inter, sans-serif">{lb}</text>; })}
    </svg>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const iconProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const IcoHome = () => <svg {...iconProps}><rect x={3} y={3} width={7} height={8} rx={1} /><rect x={14} y={3} width={7} height={5} rx={1} /><rect x={14} y={12} width={7} height={9} rx={1} /><rect x={3} y={15} width={7} height={6} rx={1} /></svg>;
const IcoHack = () => <svg {...iconProps}><circle cx={11} cy={11} r={7} /><path d="m21 21-4.3-4.3" /></svg>;
const IcoTsukull = () => <svg {...iconProps}><path d="M12.8 2.2a2 2 0 0 0-1.6 0L2.6 6.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.8Z" /><path d="m22 17.7-9.2 4.1a2 2 0 0 1-1.6 0L2 17.7" /><path d="m22 12.7-9.2 4.1a2 2 0 0 1-1.6 0L2 12.7" /></svg>;
const IcoAdctor = () => <svg {...iconProps}><path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z" /><path d="m9 12 2 2 4-4" /></svg>;
const IcoSettings = () => <svg {...iconProps}><line x1={21} x2={14} y1={5} y2={5} /><line x1={10} x2={3} y1={5} y2={5} /><line x1={21} x2={12} y1={12} y2={12} /><line x1={8} x2={3} y1={12} y2={12} /><line x1={21} x2={16} y1={19} y2={19} /><line x1={12} x2={3} y1={19} y2={19} /><circle cx={12} cy={5} r={2} /><circle cx={10} cy={12} r={2} /><circle cx={14} cy={19} r={2} /></svg>;
const IcoCollapse = () => <svg {...iconProps}><rect x={3} y={3} width={18} height={18} rx={2} /><line x1={9} x2={9} y1={3} y2={21} /></svg>;
const IcoAlert = () => <svg {...iconProps}><path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" /><line x1={12} x2={12} y1={9} y2={13} /><line x1={12} x2={12} y1={17} y2={17} /></svg>;
const IcoExport = () => <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><line x1={12} x2={12} y1={18} y2={12} /><path d="m9 15 3 3 3-3" /></svg>;

// ─── Sub-sections ─────────────────────────────────────────────────────────────
function SovBars() {
  const months = ["12月", "1月", "2月", "3月", "4月", "5月"];
  const rows = [[28, 31, 27, 14], [27, 31, 28, 14], [27, 32, 27, 14], [26, 33, 27, 14], [23, 34, 28, 15], [22, 34, 29, 15]];
  const cols = ["#09090b", "#a1a1aa", "#d4d4d8", "#ececef"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 34, fontSize: 11, color: "#71717a", fontFamily: "'JetBrains Mono',monospace", flex: "none", textAlign: "right" }}>{months[i]}</span>
          <div style={{ flex: 1, display: "flex", height: 24, borderRadius: 5, overflow: "hidden", background: "#f4f4f5" }}>
            {r.map((seg, j) => (
              <div key={j} style={{ width: `${seg}%`, background: cols[j], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {j === 0 && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono',monospace" }}>{seg}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ValidationBars() {
  const data = [
    { ai: "Perplexity", b: 41, a: 78 }, { ai: "Gemini", b: 38, a: 71 },
    { ai: "GPT-4o", b: 45, a: 83 }, { ai: "Claude", b: 40, a: 79 },
    { ai: "Copilot", b: 36, a: 68 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#18181b" }}>{d.ai}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#047857", fontFamily: "'JetBrains Mono',monospace" }}>+{d.a - d.b}pt</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 9, background: "#f4f4f5", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: `${d.b}%`, height: "100%", background: "#d4d4d8", borderRadius: 5 }} />
              </div>
              <span style={{ width: 28, fontSize: 11, color: "#a1a1aa", fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>{d.b}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 9, background: "#f4f4f5", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: `${d.a}%`, height: "100%", background: "#047857", borderRadius: 5 }} />
              </div>
              <span style={{ width: 28, fontSize: 11, color: "#047857", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>{d.a}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PricingTable() {
  const mono = "'JetBrains Mono',monospace";
  const total = 124580;
  const rows = [
    { type: "AI構造化データ", path: "/api · *.json · ai-context", price: "2.40", acc: 11150, rev: 26760 },
    { type: "製品仕様・技術資料", path: "/products/*/specs · /tech", price: "1.80", acc: 18400, rev: 33120 },
    { type: "価格・見積", path: "/pricing · /estimate", price: "1.30", acc: 16200, rev: 21060 },
    { type: "製品カタログ (PDF)", path: "/catalog/*.pdf", price: "1.00", acc: 13500, rev: 13500 },
    { type: "導入事例", path: "/cases/*", price: "0.60", acc: 28600, rev: 17160 },
    { type: "ブログ・コラム", path: "/blog/* · /column/*", price: "0.25", acc: 41200, rev: 10300 },
    { type: "一般ページ", path: "/ · /about · /news", price: "0.10", acc: 26800, rev: 2680 },
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
        <thead>
          <tr style={{ borderBottom: "1.5px solid #e4e4e7" }}>
            {["リソース種別 / パス", "単価", "月間アクセス", "収益", "構成比"].map((h, i) => (
              <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "7px 8px", fontSize: 10, fontWeight: 600, color: "#71717a", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const pct = (r.rev / total * 100);
            return (
              <tr key={i} style={{ borderBottom: "1px solid #f4f4f5" }}>
                <td style={{ padding: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#18181b" }}>{r.type}</div>
                  <div style={{ fontSize: 10, color: "#a1a1aa", fontFamily: mono }}>{r.path}</div>
                </td>
                <td style={{ padding: 8, textAlign: "right", fontFamily: mono, fontSize: 12, fontWeight: 600, color: "#18181b", whiteSpace: "nowrap" }}>¥{r.price}</td>
                <td style={{ padding: 8, textAlign: "right", fontFamily: mono, fontSize: 11.5, color: "#52525b" }}>{r.acc.toLocaleString("en-US")}</td>
                <td style={{ padding: 8, textAlign: "right", fontFamily: mono, fontSize: 11.5, fontWeight: 600, color: "#047857" }}>¥{r.rev.toLocaleString("en-US")}</td>
                <td style={{ padding: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 10.5, color: "#71717a", fontFamily: mono }}>{pct.toFixed(1)}%</span>
                    <span style={{ width: 40, height: 6, background: "#f4f4f5", borderRadius: 4, overflow: "hidden", flex: "none", display: "inline-block" }}>
                      <span style={{ display: "block", width: `${pct}%`, height: "100%", background: "#18181b", borderRadius: 4 }} />
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "1.5px solid #e4e4e7" }}>
            <td style={{ padding: "9px 8px", fontSize: 12, fontWeight: 700, color: "#18181b" }}>合計 / Total</td>
            <td />
            <td style={{ padding: "9px 8px", textAlign: "right", fontFamily: mono, fontSize: 11.5, fontWeight: 700, color: "#18181b" }}>155,850</td>
            <td style={{ padding: "9px 8px", textAlign: "right", fontFamily: mono, fontSize: 12, fontWeight: 700, color: "#047857" }}>¥124,580</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Screens ─────────────────────────────────────────────────────────────────
function HomeScreen({ revenue, requests, paidCount }: { revenue: number; requests: number; paidCount: number }) {
  const adRevenue = Math.round(revenue).toLocaleString("en-US");
  const adRequests = requests.toLocaleString("en-US");
  const months = ["12月", "1月", "2月", "3月", "4月", "5月"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1280, animation: "regfade .3s ease" }}>
      {/* KPI cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div><div style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#71717a", fontWeight: 600 }}>総合AI引用シェアスコア</div><div style={{ fontSize: 10, color: "#c4c4cc" }}>Overall AI Citation Share</div></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 36, fontWeight: 600, color: "#09090b", letterSpacing: "-.02em" }}>22.4</span><span style={{ fontSize: 14, color: "#71717a", fontFamily: "'JetBrains Mono',monospace" }}>pt</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#b91c1c", fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>▼ 4.2%</span><span style={{ fontSize: 11, color: "#a1a1aa" }}>前月比 / MoM</span></div>
          <div style={{ height: 44 }}><LineChart values={[27.8, 27.1, 26.6, 25.9, 23.4, 22.4]} color="#18181b" w={200} h={44} pad={{ t: 6, r: 6, b: 6, l: 6 }} /></div>
        </div>
        <div style={{ flex: 1, minWidth: 240, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div><div style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#991b1b", fontWeight: 600 }}>月間機会損失推計額</div><div style={{ fontSize: 10, color: "#dc8a8a" }}>Est. Monthly Opportunity Loss</div></div>
            <span style={{ color: "#b91c1c" }}><IcoAlert /></span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 18, color: "#b91c1c", fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>¥</span><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 36, fontWeight: 600, color: "#b91c1c", letterSpacing: "-.02em" }}>8,450,000</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#dc2626", fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>▲ 9.8%</span><span style={{ fontSize: 11, color: "#dc8a8a" }}>主要AIでの非引用による流出</span></div>
          <div style={{ height: 44 }}><LineChart values={[4.1, 4.9, 5.6, 6.8, 7.7, 8.45]} color="#b91c1c" w={200} h={44} pad={{ t: 6, r: 6, b: 6, l: 6 }} /></div>
        </div>
        <div style={{ flex: 1, minWidth: 240, background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div><div style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#065f46", fontWeight: 600 }}>Adctor 通行料収益</div><div style={{ fontSize: 10, color: "#6ee7b7" }}>Pay per Crawl Revenue</div></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 18, color: "#047857", fontFamily: "'JetBrains Mono',monospace", fontWeight: 500 }}>¥</span><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 36, fontWeight: 600, color: "#047857", letterSpacing: "-.02em" }}>{adRevenue}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#047857", fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>▲ 18.3%</span><span style={{ fontSize: 11, color: "#34d399" }}>課金リクエスト {adRequests} 件</span></div>
          <div style={{ height: 44 }}><LineChart values={[38, 52, 67, 89, 104, 124.6]} color="#047857" w={200} h={44} pad={{ t: 6, r: 6, b: 6, l: 6 }} /></div>
        </div>
      </div>
      {/* Charts row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 380, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>総合AI引用シェアスコア推移</div><div style={{ fontSize: 10.5, color: "#a1a1aa" }}>Citation Share Score · 過去6ヶ月</div></div>
            <span style={{ fontSize: 10, color: "#71717a", background: "#f4f4f5", padding: "4px 9px", borderRadius: 6, fontWeight: 600 }}>HackⅡ</span>
          </div>
          <div style={{ height: 210 }}><LineChart values={[27.8, 27.1, 26.6, 25.9, 23.4, 22.4]} labels={months} color="#18181b" /></div>
        </div>
        <div style={{ flex: 1, minWidth: 300, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>通行料収益推移</div><div style={{ fontSize: 10.5, color: "#a1a1aa" }}>Toll Revenue · ¥K</div></div>
            <span style={{ fontSize: 10, color: "#047857", background: "#ecfdf5", padding: "4px 9px", borderRadius: 6, fontWeight: 600 }}>Adctor</span>
          </div>
          <div style={{ height: 210 }}><LineChart values={[38, 52, 67, 89, 104, 124.6]} labels={months} color="#047857" /></div>
        </div>
      </div>
      {/* Loss chart + Status */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>月間機会損失推移</div><div style={{ fontSize: 10.5, color: "#a1a1aa" }}>Opportunity Loss · ¥M</div></div>
            <span style={{ fontSize: 10, color: "#b91c1c", background: "#fef2f2", padding: "4px 9px", borderRadius: 6, fontWeight: 600 }}>HackⅡ</span>
          </div>
          <div style={{ height: 210 }}><BarChart values={[4.1, 4.9, 5.6, 6.8, 7.7, 8.45]} labels={months} color="#b91c1c" /></div>
        </div>
        <div style={{ flex: 1, minWidth: 300, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 4 }}>3システム稼働ステータス</div>
          <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 16 }}>Platform Status · 攻め・最適化・守り</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {[
              { name: "HackⅡ", sub: "/ AI検索測定", detail: "スコア低下を検知中 · 要対策", val: "22.4pt", valColor: "#b45309", dot: "#b45309" },
              { name: "Tsukull", sub: "/ AIパッチ配信", detail: "自動配信ON · v4.7.2 稼働中", val: "+38pt", valColor: "#047857", dot: "#047857" },
              { name: "Adctor", sub: "/ PPC課金", detail: "課金ゲートウェイ稼働中", val: "¥" + adRevenue, valColor: "#047857", dot: "#047857" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 15px", border: "1px solid #f0f0f1", borderRadius: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot, flex: "none", animation: "regpulse 2s infinite" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#18181b" }}>{item.name} <span style={{ fontWeight: 400, color: "#a1a1aa", fontSize: 11 }}>{item.sub}</span></div>
                  <div style={{ fontSize: 11, color: "#71717a" }}>{item.detail}</div>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 600, color: item.valColor }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Activity */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 4 }}>最近のアクティビティ</div>
        <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 16 }}>Recent Activity · 全システム横断</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            { tag: "Adctor", tagColor: "#047857", tagBg: "#ecfdf5", text: "GPTBot に HTTP 402 を返却し、通行料 ¥0.11 を徴収しました", time: "2分前" },
            { tag: "HackⅡ", tagColor: "#18181b", tagBg: "#f4f4f5", text: "「協働ロボット 価格」で Perplexity の引用ソースに採用されました", time: "18分前" },
            { tag: "Tsukull", tagColor: "#047857", tagBg: "#ecfdf5", text: "スコア低下を検知し llms.txt を自動再配信しました (+12pt)", time: "1時間前" },
            { tag: "Adctor", tagColor: "#047857", tagBg: "#ecfdf5", text: "ClaudeBot をホワイトリスト設定により無償通過させました", time: "2時間前" },
            { tag: "HackⅡ", tagColor: "#b91c1c", tagBg: "#fef2f2", text: "総合AI引用シェアスコアが 22.4pt に低下しました (-4.2%)", time: "本日 09:00" },
          ].map((item, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #f4f4f5" : undefined }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".04em", color: item.tagColor, background: item.tagBg, padding: "4px 8px", borderRadius: 6, width: 62, textAlign: "center", flex: "none" }}>{item.tag}</span>
              <span style={{ flex: 1, fontSize: 13, color: "#3f3f46" }}>{item.text}</span>
              <span style={{ fontSize: 11, color: "#a1a1aa", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HackScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1280, animation: "regfade .3s ease" }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { label: "追跡キーワード数", sub: "Tracked Keywords", val: "248", valStyle: {} },
          { label: "平均引用シェア", sub: "Avg. Share of Voice", val: "22.4", unit: "pt" },
          { label: "引用獲得クエリ", sub: "Cited Queries", val: "96", unit: "/ 248", labelColor: "#065f46", valColor: "#047857" },
          { label: "未引用クエリ", sub: "Not Cited", val: "152", unit: "/ 248", bg: "#fef2f2", border: "#fca5a5", labelColor: "#991b1b", subColor: "#dc8a8a", valColor: "#b91c1c" },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, minWidth: 200, background: (item as { bg?: string }).bg || "#fff", border: `1px solid ${(item as { border?: string }).border || "#e4e4e7"}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: (item as { labelColor?: string }).labelColor || "#71717a", fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: 10, color: (item as { subColor?: string }).subColor || "#c4c4cc", marginBottom: 8 }}>{item.sub}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 600, color: (item as { valColor?: string }).valColor || "#09090b" }}>{item.val}</span>
              {item.unit && <span style={{ fontSize: 13, color: "#71717a", fontFamily: "'JetBrains Mono',monospace" }}>{item.unit}</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Keyword table */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>AI別 引用状況・クロール履歴</div>
          <span style={{ fontSize: 10, color: "#71717a", background: "#f4f4f5", padding: "4px 9px", borderRadius: 6, fontWeight: 600 }}>Last crawl: 5/28 14:32</span>
        </div>
        <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 16 }}>Citation Status by AI Engine</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #e4e4e7" }}>
                {["キーワード / Keyword", "検索Vol.", "Perplexity", "Gemini", "GPT-4o", "Claude", "SOV"].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 0 || i === 6 ? (i === 0 ? "left" : "right") : "center", padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { kw: "産業用ロボット 導入", vol: "8,100", p: true, g: false, gpt: true, claude: true, sov: "24.1" },
                { kw: "協働ロボット 価格", vol: "2,900", p: true, g: true, gpt: true, claude: true, sov: "31.5" },
                { kw: "工場 自動化 ソリューション", vol: "5,400", p: true, g: true, gpt: false, claude: false, sov: "12.8" },
                { kw: "精密板金 加工 短納期", vol: "1,800", p: true, g: false, gpt: true, claude: false, sov: "18.7" },
                { kw: "生産ライン IoT", vol: "4,400", p: false, g: true, gpt: false, claude: true, sov: "9.2" },
                { kw: "FA機器 メーカー 比較", vol: "3,600", p: false, g: false, gpt: true, claude: false, sov: "6.4" },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f4f4f5" }}>
                  <td style={{ padding: 12, fontSize: 13, fontWeight: 500, color: "#18181b" }}>{row.kw}</td>
                  <td style={{ padding: 12, textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#52525b" }}>{row.vol}</td>
                  {[row.p, row.g, row.gpt, row.claude].map((cited, j) => (
                    <td key={j} style={{ padding: 12, textAlign: "center" }}>
                      <span style={{ display: "inline-block", fontSize: 11, fontWeight: cited ? 600 : 500, color: cited ? "#047857" : "#a1a1aa", background: cited ? "#ecfdf5" : "#f4f4f5", padding: "3px 9px", borderRadius: 5 }}>{cited ? "引用" : "なし"}</span>
                    </td>
                  ))}
                  <td style={{ padding: 12, textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: "#18181b" }}>{row.sov}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* SOV comparison */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 4 }}>競合シェア・オブ・ボイス (SOV) 比較</div>
        <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 18 }}>Competitive Share of Voice · 100% 積み上げ · 過去6ヶ月</div>
        <div style={{ display: "flex", gap: 20, marginBottom: 18, flexWrap: "wrap" }}>
          {[["#09090b", "自社 (Sample)"], ["#a1a1aa", "競合A"], ["#d4d4d8", "競合B"], ["#ececef", "競合C"]].map(([col, label], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: col }} />
              <span style={{ fontSize: 11, color: "#52525b", fontWeight: i === 0 ? 500 : 400 }}>{label}</span>
            </div>
          ))}
        </div>
        <SovBars />
      </div>
    </div>
  );
}

function TsukullScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1280, animation: "regfade .3s ease" }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 210, background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#047857", animation: "regpulse 2s infinite" }} />
            <div style={{ fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: "#065f46", fontWeight: 600 }}>配信ステータス</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#047857" }}>自動配信 稼働中</div>
          <div style={{ fontSize: 10.5, color: "#34d399", marginTop: 3 }}>llms.txt · llms-full.txt · ai-context.json</div>
        </div>
        {[
          { label: "最終パッチ配信", val: "05-28 14:32", sub: "CDN 配信完了 · 全エッジ反映済" },
          { label: "現行バージョン", val: "v4.7.2", sub: "累計 1,284 回の自動再生成" },
          { label: "平均スコア改善", val: "+38", unit: "pt", sub: "パッチ適用前後の5AI平均", valColor: "#047857", labelColor: "#065f46" },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, minWidth: 210, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: (item as { labelColor?: string }).labelColor || "#71717a", fontWeight: 600, marginBottom: 8 }}>{item.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: (item as { valColor?: string }).valColor || "#18181b" }}>{item.val}</span>
              {item.unit && <span style={{ fontSize: 12, color: "#71717a", fontFamily: "'JetBrains Mono',monospace" }}>{item.unit}</span>}
            </div>
            <div style={{ fontSize: 10.5, color: "#a1a1aa", marginTop: 3 }}>{item.sub}</div>
          </div>
        ))}
      </div>
      {/* Patch log */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px", overflow: "hidden" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 4 }}>自動パッチ トリガー履歴</div>
        <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 16 }}>Automated Patch Trigger Log</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #e4e4e7" }}>
                {["日時", "検知イベント / Trigger", "実行アクション", "結果", "スコア変化"].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 4 ? "right" : i === 3 ? "center" : "left", padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { date: "05-28 14:32", event: "HackⅡスコア低下を検知", action: "llms.txt 再生成・CDN配信", score: "+12pt" },
                { date: "05-21 09:15", event: "競合 llms.txt 書き換えを検知", action: "ai-context.json 更新", score: "+6pt" },
                { date: "05-14 18:40", event: "コンテンツ更新 (製品ページ)", action: "llms-full.txt 再生成", score: "+9pt" },
                { date: "05-07 03:00", event: "定期スケジュール実行", action: "全パッチ整合性検証", score: "±0pt", neutral: true },
                { date: "04-30 11:22", event: "手動トリガー (初回最適化)", action: "llms.txt 全面最適化", score: "+39pt", highlight: true },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i < 4 ? "1px solid #f4f4f5" : undefined, background: (row as { highlight?: boolean }).highlight ? "#fafafa" : undefined }}>
                  <td style={{ padding: 12, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#52525b", whiteSpace: "nowrap" }}>{row.date}</td>
                  <td style={{ padding: 12, fontSize: 13, color: "#18181b", fontWeight: (row as { highlight?: boolean }).highlight ? 600 : undefined }}>{row.event}</td>
                  <td style={{ padding: 12, fontSize: 12.5, color: "#52525b" }}>{row.action}</td>
                  <td style={{ padding: 12, textAlign: "center" }}><span style={{ fontSize: 11, fontWeight: 600, color: "#047857", background: "#ecfdf5", padding: "3px 9px", borderRadius: 5 }}>成功</span></td>
                  <td style={{ padding: 12, textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontSize: (row as { highlight?: boolean }).highlight ? 13 : 12, fontWeight: (row as { highlight?: boolean }).highlight ? 700 : 600, color: (row as { neutral?: boolean }).neutral ? "#a1a1aa" : "#047857" }}>{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Validation */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 4 }}>5AI 検証バリデーション結果</div>
        <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 6 }}>Pre / Post Patch · AIモデル理解度スコア</div>
        <div style={{ display: "flex", gap: 20, margin: "14px 0 18px", flexWrap: "wrap" }}>
          {[["#d4d4d8", "適用前 / Before"], ["#047857", "適用後 / After"]].map(([col, label], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: col }} />
              <span style={{ fontSize: 11, color: "#52525b" }}>{label}</span>
            </div>
          ))}
        </div>
        <ValidationBars />
      </div>
    </div>
  );
}

function AdctorScreen({ revenue, requests, paidCount, liveLog }: {
  revenue: number; requests: number; paidCount: number; liveLog: LogRow[];
}) {
  const adRevenue = Math.round(revenue).toLocaleString("en-US");
  const adRequests = requests.toLocaleString("en-US");
  const payRate = (paidCount / requests * 100).toFixed(1);
  const avgPrice = (revenue / paidCount).toFixed(2);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1280, animation: "regfade .3s ease" }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 210, background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: "#065f46", fontWeight: 600, marginBottom: 8 }}>今月の通行料収益</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontSize: 15, color: "#047857", fontFamily: "'JetBrains Mono',monospace" }}>¥</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, color: "#047857" }}>{adRevenue}</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#34d399", marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>▲ 18.3% MoM</div>
        </div>
        {[
          { label: "課金リクエスト総数", val: adRequests, sub: "402 返却 / クロール検知" },
          { label: "決済通過率", val: payRate, unit: "%", sub: "Stripe 決済成立率 · リアルタイム" },
          { label: "平均通行単価", val: avgPrice, prefix: "¥", sub: "リソース価値で変動 · 加重平均" },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, minWidth: 210, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", color: "#71717a", fontWeight: 600, marginBottom: 8 }}>{item.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              {item.prefix && <span style={{ fontSize: 15, color: "#18181b", fontFamily: "'JetBrains Mono',monospace" }}>{item.prefix}</span>}
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 700, color: "#09090b" }}>{item.val}</span>
              {item.unit && <span style={{ fontSize: 13, color: "#71717a", fontFamily: "'JetBrains Mono',monospace" }}>{item.unit}</span>}
            </div>
            <div style={{ fontSize: 10.5, color: "#a1a1aa", marginTop: 4 }}>{item.sub}</div>
          </div>
        ))}
      </div>
      {/* Live log */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>リアルタイム クローラー検知ログ</div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 600, color: "#047857", background: "#ecfdf5", padding: "4px 10px", borderRadius: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#047857", animation: "regpulse 1.4s infinite" }} />LIVE · SSE
          </span>
        </div>
        <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 14 }}>Edge Interception Log · Cloudflare Workers</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #e4e4e7" }}>
                {["時刻", "Bot / 所有者", "アクセス先 / リソース", "IP · ASN", "ステータス", "課金"].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 4 ? "center" : i === 5 ? "right" : "left", padding: "8px 10px", fontSize: 10.5, fontWeight: 600, color: "#71717a" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveLog.map(row => (
                <tr key={row.id} style={{ borderBottom: "1px solid #f4f4f5", animation: "regfade .35s ease" }}>
                  <td style={{ padding: "9px 10px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: "#52525b", whiteSpace: "nowrap" }}>{row.time}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#18181b", fontFamily: "'JetBrains Mono',monospace" }}>{row.bot}</div>
                    <div style={{ fontSize: 10, color: "#a1a1aa" }}>{row.owner}</div>
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: "#3f3f46" }}>{row.path}</div>
                    <div style={{ fontSize: 10, color: "#a1a1aa" }}>{row.rtype}</div>
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: "#52525b" }}>{row.ip}</div>
                    <div style={{ fontSize: 10, color: "#a1a1aa", fontFamily: "'JetBrains Mono',monospace" }}>{row.asn}</div>
                  </td>
                  <td style={{ padding: "9px 10px", textAlign: "center" }}>
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: row.badgeColor, background: row.badgeBg, padding: "3px 9px", borderRadius: 5, whiteSpace: "nowrap" }}>{row.status}</span>
                  </td>
                  <td style={{ padding: "9px 10px", textAlign: "right" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", color: row.amtColor }}>{row.amount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Charts + pricing */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 4 }}>通行料収益推移</div>
          <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 14 }}>Daily Toll Revenue · ¥K · 過去14日</div>
          <div style={{ height: 200 }}>
            <LineChart values={[6.2, 5.8, 7.1, 6.9, 8.3, 7.6, 9.1, 8.8, 10.2, 9.7, 11.4, 10.9, 12.1, 12.46]} labels={["5/18", "", "", "", "", "", "5/24", "", "", "", "", "", "", "5/31"]} color="#047857" />
          </div>
        </div>
        <div style={{ flex: 1.4, minWidth: 380, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b" }}>リソース別 通行料単価・データ価値</div>
            <span style={{ fontSize: 10, color: "#71717a", background: "#f4f4f5", padding: "4px 9px", borderRadius: 6, fontWeight: 600 }}>ページ別 価格設定</span>
          </div>
          <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 14 }}>Per-Resource Pricing & Data Value · アクセス先の価値で単価を決定</div>
          <PricingTable />
        </div>
      </div>
      {/* Metered billing */}
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 4 }}>集約課金メーター (Metered Billing)</div>
        <div style={{ fontSize: 10.5, color: "#a1a1aa", marginBottom: 18 }}>AI企業別クレジット消費 · 月末請求予定額</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { name: "OpenAI", bot: "GPTBot · 482,300 req", amt: "¥48,230", pct: 38.7, barColor: "#18181b" },
            { name: "Anthropic", bot: "ClaudeBot · 311,900 req", amt: "¥31,190", pct: 25.0, barColor: "#3f3f46" },
            { name: "Perplexity AI", bot: "PerplexityBot · 218,400 req", amt: "¥21,840", pct: 17.5, barColor: "#71717a" },
            { name: "ByteDance", bot: "Bytespider · 142,700 req", amt: "¥14,270", pct: 11.5, barColor: "#a1a1aa" },
            { name: "Common Crawl", bot: "CCBot · 90,500 req", amt: "¥9,050", pct: 7.3, barColor: "#c4c4cc" },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#18181b" }}>{item.name}</span>
                  <span style={{ fontSize: 11, color: "#a1a1aa", fontFamily: "'JetBrains Mono',monospace" }}>{item.bot}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: "#047857" }}>{item.amt}</span>
              </div>
              <div style={{ height: 8, background: "#f4f4f5", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: `${item.pct}%`, height: "100%", background: item.barColor, borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 880, animation: "regfade .3s ease" }}>
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "22px 24px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 16 }}>テナント情報 / Tenant</div>
        {[
          { label: "企業名", val: "株式会社サンプル製造" },
          { label: "対象ドメイン", val: "sample-mfg.co.jp", mono: true },
          { label: "契約プラン", val: "Enterprise", badge: true },
          { label: "認証方式", val: "Clerk · マルチテナント SSO" },
        ].map((item, i, arr) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: i < arr.length - 1 ? "1px solid #f4f4f5" : undefined }}>
            <span style={{ fontSize: 12.5, color: "#71717a" }}>{item.label}</span>
            {item.badge
              ? <span style={{ fontSize: 12, fontWeight: 600, color: "#18181b", background: "#f4f4f5", padding: "3px 10px", borderRadius: 6 }}>{item.val}</span>
              : <span style={{ fontSize: 13, fontWeight: 600, color: "#18181b", fontFamily: item.mono ? "'JetBrains Mono',monospace" : undefined }}>{item.val}</span>
            }
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 12, padding: "22px 24px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#18181b", marginBottom: 16 }}>システム連携 / Integrations</div>
        {[
          { name: "Cloudflare Workers", sub: "エッジでのクローラー インターセプト", connected: true },
          { name: "Stripe", sub: "通行料の従量課金・請求", connected: true },
          { name: "CDN 配信 (llms.txt)", sub: "Tsukull パッチの自動デプロイ", connected: true },
          { name: "Slack 通知", sub: "スコア低下・収益アラート", connected: false },
        ].map((item, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid #f4f4f5" : undefined }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#18181b" }}>{item.name}</div>
              <div style={{ fontSize: 11, color: "#a1a1aa" }}>{item.sub}</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: item.connected ? "#047857" : "#a1a1aa" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.connected ? "#047857" : "#d4d4d8" }} />
              {item.connected ? "接続済" : "未接続"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegalisPage() {
  const [screen, setScreen] = useState<Screen>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [period, setPeriod] = useState<Period>("今月");
  const [liveLog, setLiveLog] = useState<LogRow[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [revenue, setRevenue] = useState(124580);
  const [requests, setRequests] = useState(1245800);
  const [paidCount, setPaidCount] = useState(155850);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLiveLog(seedLog(7));
    tickTimer.current = setInterval(() => {
      const totalTick = rint(1400, 4200);
      const paidTick = Math.round(totalTick * (0.10 + Math.random() * 0.055));
      const avgP = 0.74 + Math.random() * 0.16;
      const revTick = Math.round(paidTick * avgP * 100) / 100;
      setLiveLog(prev => [makeRow(), ...prev].slice(0, 13));
      setRequests(r => r + totalTick);
      setPaidCount(p => p + paidTick);
      setRevenue(r => r + revTick);
    }, 2300);
    return () => { if (tickTimer.current) clearInterval(tickTimer.current); };
  }, []);

  const fireToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const expanded = !collapsed;
  const periods: Period[] = ["今日", "今週", "今月", "四半期"];
  const meta: Record<Screen, [string, string, string]> = {
    home: ["ダッシュボード", "Overview", "3システム統合サマリー"],
    hack: ["HackⅡ — AI検索測定", "AI Search Visibility", "生成AIにおける引用シェアの実測"],
    tsukull: ["Tsukull — AIパッチ配信", "Realtime Patch Delivery", "構造化データの自動最適化と配信"],
    adctor: ["Adctor — PPC売上管理", "Pay per Crawl", "クローラー課金ゲートウェイと収益"],
    settings: ["システム設定", "Settings", "テナント・連携・課金設定"],
  };
  const [pageTitle, pageEn, pageDesc] = meta[screen];

  const navItems = [
    { id: "home" as Screen, label: "ダッシュボード", sub: "Overview", icon: <IcoHome /> },
    { id: "hack" as Screen, label: "HackⅡ", sub: "AI検索測定", icon: <IcoHack /> },
    { id: "tsukull" as Screen, label: "Tsukull", sub: "AIパッチ配信", icon: <IcoTsukull /> },
    { id: "adctor" as Screen, label: "Adctor", sub: "PPC売上管理", icon: <IcoAdctor /> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 8px; border: 2px solid #fafafa; }
        ::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }
        @keyframes regpulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.85); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes regfade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes regtoast { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", fontFamily: "'Inter','Noto Sans JP',sans-serif", color: "#18181b", background: "#fafafa" }}>
        {/* Sidebar */}
        <aside style={{ flex: "none", width: expanded ? 252 : 74, background: "#fff", borderRight: "1px solid #e4e4e7", display: "flex", flexDirection: "column", transition: "width .22s ease", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "22px 20px 20px", borderBottom: "1px solid #f0f0f1" }}>
            <div style={{ width: 30, height: 30, flex: "none", background: "#09090b", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>R</div>
            {expanded && (
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, overflow: "hidden" }}>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: ".14em", color: "#09090b", whiteSpace: "nowrap" }}>REGALIS</span>
                <span style={{ fontSize: 9, letterSpacing: ".14em", color: "#a1a1aa", whiteSpace: "nowrap", textTransform: "uppercase" }}>AI Intelligence</span>
              </div>
            )}
          </div>
          <nav style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
            {expanded && <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", color: "#c4c4cc", textTransform: "uppercase", padding: "8px 12px 4px" }}>Platform</div>}
            {navItems.map(item => {
              const active = screen === item.id;
              return (
                <button key={item.id} onClick={() => setScreen(item.id)} title={item.label}
                  style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "none", background: "transparent", borderRadius: 9, cursor: "pointer", textAlign: "left", color: "#3f3f46", width: "100%" }}>
                  {active && <span style={{ position: "absolute", inset: 0, background: "#f4f4f5", borderRadius: 9, boxShadow: "inset 2.5px 0 0 #09090b" }} />}
                  <span style={{ position: "relative", zIndex: 1, display: "flex", width: 20, justifyContent: "center", flex: "none", color: "#18181b" }}>{item.icon}</span>
                  {expanded && (
                    <span style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", lineHeight: 1.2, overflow: "hidden" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{item.label}</span>
                      <span style={{ fontSize: 10, color: "#a1a1aa", whiteSpace: "nowrap" }}>{item.sub}</span>
                    </span>
                  )}
                </button>
              );
            })}
            <div style={{ height: 1, background: "#f0f0f1", margin: "10px 12px" }} />
            {expanded && <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", color: "#c4c4cc", textTransform: "uppercase", padding: "4px 12px" }}>System</div>}
            <button onClick={() => setScreen("settings")} title="システム設定"
              style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "none", background: "transparent", borderRadius: 9, cursor: "pointer", textAlign: "left", color: "#3f3f46", width: "100%" }}>
              {screen === "settings" && <span style={{ position: "absolute", inset: 0, background: "#f4f4f5", borderRadius: 9, boxShadow: "inset 2.5px 0 0 #09090b" }} />}
              <span style={{ position: "relative", zIndex: 1, display: "flex", width: 20, justifyContent: "center", flex: "none", color: "#18181b" }}><IcoSettings /></span>
              {expanded && (
                <span style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", lineHeight: 1.2, overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>システム設定</span>
                  <span style={{ fontSize: 10, color: "#a1a1aa", whiteSpace: "nowrap" }}>Settings</span>
                </span>
              )}
            </button>
          </nav>
          <div style={{ borderTop: "1px solid #f0f0f1", padding: "14px 12px" }}>
            <button onClick={() => setCollapsed(c => !c)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", border: "none", background: "transparent", borderRadius: 9, cursor: "pointer", color: "#a1a1aa", width: "100%" }}>
              <span style={{ display: "flex", width: 20, justifyContent: "center", flex: "none" }}><IcoCollapse /></span>
              {expanded && <span style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>サイドバーを閉じる</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <header style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "16px 28px", background: "rgba(250,250,250,.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e4e4e7" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-.01em", color: "#09090b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pageTitle}</h1>
              <div style={{ fontSize: 11, color: "#a1a1aa", letterSpacing: ".02em", whiteSpace: "nowrap" }}>{pageEn} · {pageDesc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "none" }}>
              <div style={{ display: "flex", background: "#f4f4f5", borderRadius: 9, padding: 3, gap: 2 }}>
                {periods.map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    style={{ padding: "6px 12px", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", ...(period === p ? { background: "#fff", color: "#09090b", boxShadow: "0 1px 2px rgba(0,0,0,.08)" } : { background: "transparent", color: "#71717a" }) }}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={() => fireToast("レポートを生成しました / Report generated")}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 15px", background: "#09090b", color: "#fff", border: "none", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ display: "flex" }}><IcoExport /></span>レポート出力
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 9, paddingLeft: 14, borderLeft: "1px solid #e4e4e7" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#52525b", flex: "none" }}>サ</div>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#18181b", whiteSpace: "nowrap" }}>株式会社サンプル製造</div>
                  <div style={{ fontSize: 10, color: "#a1a1aa", whiteSpace: "nowrap" }}>Enterprise · sample-mfg.co.jp</div>
                </div>
              </div>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
            {screen === "home" && <HomeScreen revenue={revenue} requests={requests} paidCount={paidCount} />}
            {screen === "hack" && <HackScreen />}
            {screen === "tsukull" && <TsukullScreen />}
            {screen === "adctor" && <AdctorScreen revenue={revenue} requests={requests} paidCount={paidCount} liveLog={liveLog} />}
            {screen === "settings" && <SettingsScreen />}
          </div>
        </main>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", bottom: 24, right: 24, background: "#09090b", color: "#fff", padding: "13px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.18)", display: "flex", alignItems: "center", gap: 10, animation: "regtoast .25s ease", zIndex: 50 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399" }} />
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
