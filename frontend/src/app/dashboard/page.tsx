"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, Shield, AlertTriangle,
  CheckCircle2, DollarSign, ArrowUpRight, Wifi
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

// ── Mock data ─────────────────────────────────────────────────────────────────
const revenueDaily = [
  { date: "5/30", revenue: 8200, blocked: 142 },
  { date: "5/31", revenue: 11400, blocked: 198 },
  { date: "6/1",  revenue: 9800,  blocked: 167 },
  { date: "6/2",  revenue: 15600, blocked: 241 },
  { date: "6/3",  revenue: 13200, blocked: 215 },
  { date: "6/4",  revenue: 18900, blocked: 302 },
  { date: "6/5",  revenue: 22400, blocked: 358 },
];

const crawlerShare = [
  { name: "GPTBot",        value: 45, color: "#B89F5D" },
  { name: "ClaudeBot",     value: 30, color: "#9E8448" },
  { name: "PerplexityBot", value: 15, color: "#D9C38E" },
  { name: "その他",         value: 10, color: "#4B4435" },
];

const topPages = [
  { url: "/blog/ai-future-2025",          paid: 48, revenue: 38400 },
  { url: "/tech/llm-comparison",          paid: 31, revenue: 24800 },
  { url: "/research/data-scraping-law",   paid: 27, revenue: 21600 },
  { url: "/blog/gpt4-use-cases",          paid: 22, revenue: 17600 },
  { url: "/product/enterprise-plan",      paid: 18, revenue: 14400 },
];

const forecastData = [
  { week: "W1", actual: 42800, forecast: null },
  { week: "W2", actual: 58300, forecast: null },
  { week: "W3", actual: 67200, forecast: null },
  { week: "W4 (予測)", actual: null, forecast: 89000 },
];

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-xs">
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "revenue" ? `¥${p.value.toLocaleString()}` : `${p.value} ブロック`}
        </p>
      ))}
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, trend, color = "#B89F5D" }: {
  title: string; value: string; sub: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  trend?: "up" | "down"; color?: string;
}) {
  return (
    <Card className="glass-panel glass-panel-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-white/50 mb-1">{title}</p>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
              {trend === "up" && <TrendingUp className="w-3 h-3 text-[#B89F5D]" />}
              {trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
              {sub}
            </p>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [liveRevenue, setLiveRevenue] = useState<number | null>(null);
  const [liveBots, setLiveBots] = useState<number | null>(null);
  const [livePayments, setLivePayments] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/dashboard/demo`);
    wsRef.current = ws;
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "stats_update") {
          setLiveRevenue(data.revenue_jpy);
          setLiveBots(data.ai_bot_detected);
          setLivePayments(data.payments_completed);
        }
      } catch { /* ignore */ }
    };
    return () => { ws.close(); };
  }, []);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
            <a href="/adctor/REGALIS%20Platform.dc.html" target="_blank" className="text-xs px-2 py-0.5 rounded border border-[#B89F5D]/30 text-[#B89F5D] hover:bg-[#B89F5D]/10 transition-colors">
              設計モック画面を表示 ↗
            </a>
          </div>
          <p className="text-sm text-white/40 mt-0.5">2026年6月 — リアルタイム収益モニター</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
            wsConnected
              ? "bg-[#B89F5D]/10 border-[#B89F5D]/20"
              : "bg-white/5 border-white/10"
          }`}>
            {wsConnected
              ? <><span className="w-2 h-2 rounded-full bg-[#B89F5D] animate-pulse" /><span className="text-xs text-[#B89F5D] font-medium">ライブ接続中</span></>
              : <><Wifi className="w-3 h-3 text-white/30" /><span className="text-xs text-white/30">接続中...</span></>
            }
          </div>
          {wsConnected && <span className="text-xs text-white/20 animate-pulse">● 2秒ごとに更新</span>}
        </div>
      </div>

      {/* Section A — 確定収益 */}
      <section>
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
          A — 確定収益（今月）
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="今月の確定収益"
            value={liveRevenue != null ? `¥${liveRevenue.toLocaleString()}` : "¥142,500"}
            sub={wsConnected ? "⚡ ライブ更新中" : "前月比 +38%"}
            icon={DollarSign} trend="up" color="#B89F5D"
          />
          <StatCard
            title="本日の収益"
            value="¥22,400" sub="前日比 +18.5%" icon={TrendingUp} trend="up" color="#B89F5D"
          />
          <StatCard title="次回振込予定" value="¥114,000" sub="2026/06/30 に自動振込" icon={CheckCircle2} color="#D9C38E" />
          <StatCard title="振込済み合計" value="¥891,200" sub="過去12ヶ月の累計" icon={ArrowUpRight} color="#9E8448" />
        </div>
      </section>

      {/* Revenue chart */}
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/70">日次収益 & ブロック数（直近7日）</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueDaily}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B89F5D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B89F5D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `¥${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#B89F5D" strokeWidth={2}
                fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Section B — 機会損失防御 */}
      <section>
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
          B — 防御した機会損失
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="ブロックした無報酬アクセス" value="1,847件" sub="Adctor導入後の累計" icon={Shield} color="#9E8448" />
          <StatCard title="防御した推定価値" value="¥738,800" sub="タダ取りから守った総額" icon={AlertTriangle} color="#D9C38E" />
          <Card className="glass-panel glass-panel-hover">
            <CardContent className="p-6">
              <p className="text-xs text-white/50 mb-2">今月末の収益予測</p>
              <p className="text-3xl font-bold text-[#B89F5D]">¥89,000</p>
              <p className="text-xs text-white/40 mt-1">現在のペースが続いた場合</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>月間目標 ¥100,000</span>
                  <span>89%</span>
                </div>
                <Progress value={89} className="h-1.5 bg-white/10 [&>div]:bg-[#B89F5D]" />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Forecast bar chart */}
        <Card className="glass-panel mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/70">週次収益 & 月末予測</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `¥${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<RevenueTooltip />} />
                <Bar dataKey="actual" name="実績" fill="#B89F5D" radius={[4,4,0,0]} />
                <Bar dataKey="forecast" name="予測" fill="#B89F5D40" radius={[4,4,0,0]}
                  stroke="#B89F5D" strokeWidth={1} strokeDasharray="4 2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Section C — クローラーインサイト */}
      <section>
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
          C — トラフィックインサイト
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie chart */}
          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">クローラー別アクセス割合</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={crawlerShare} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      paddingAngle={3} dataKey="value">
                      {crawlerShare.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff20", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {crawlerShare.map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-white/70">{c.name}</span>
                      </div>
                      <span className="text-xs font-medium" style={{ color: c.color }}>{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top pages */}
          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70">AIが最も買ったページ TOP5</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPages.map((page, i) => (
                <div key={page.url} className="flex items-center gap-3">
                  <span className="text-xs text-white/20 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 truncate font-mono">{page.url}</p>
                    <p className="text-xs text-white/30">{page.paid}件の決済</p>
                  </div>
                  <span className="text-xs font-bold text-[#B89F5D]">¥{page.revenue.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section D — システムステータス */}
      <section>
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
          D — システムステータス
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-panel">
            <CardContent className="p-5 space-y-3">
              {[
                { label: "Stripe Connect", status: "アクティブ", ok: true },
                { label: "タグ設置ステータス", status: "正常動作中", ok: true },
                { label: "ゲートウェイAPI", status: "稼働中 (99.97%)", ok: true },
              ].map(({ label, status, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-white/60">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-[#B89F5D] animate-pulse" : "bg-red-400"}`} />
                    <span className={`text-xs font-medium ${ok ? "text-[#B89F5D]" : "text-red-400"}`}>{status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="p-5">
              <p className="text-xs text-white/50 mb-3">今月の処理サマリー</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">総リクエスト数</span>
                  <span className="text-white font-medium">24,183</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">AIボット検知</span>
                  <span className="text-[#B89F5D] font-medium">3,421</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">決済完了</span>
                  <span className="text-[#D9C38E] font-medium">178</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">無課金ブロック</span>
                  <span className="text-[#9E8448] font-medium">3,243</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-panel">
            <CardContent className="p-5">
              <p className="text-xs text-white/50 mb-3">アクセス単価設定</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">現在の単価</span>
                  <span className="text-[#B89F5D] font-bold">¥800 / クロール</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">プラットフォーム手数料</span>
                  <span className="text-white/70">20%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">運営者受取額</span>
                  <span className="text-[#B89F5D]">¥640 / クロール</span>
                </div>
              </div>
              <button className="mt-3 w-full text-xs py-1.5 rounded border border-white/10 text-white/50 hover:border-[#B89F5D]/30 hover:text-[#B89F5D] transition-colors">
                単価を変更する →
              </button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
