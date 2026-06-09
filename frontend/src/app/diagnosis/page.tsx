"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, CheckCircle2, DollarSign, TrendingUp,
  Zap, ArrowRight, Globe, Mail, Eye
} from "lucide-react";
import { generateMockCrawlers, sendDiagnosisEmail } from "@/lib/adctor-services";
import { EmailPreviewModal } from "@/components/email-preview-modal";

const SCAN_STEPS = [
  "ドメインのDNSを解決中...",
  "HTTPヘッダーを確認中...",
  "robots.txtを解析中...",
  "過去30日のBotトラフィックを解析中...",
  "AIクローラーのUser-Agentを照合中...",
  "機会損失の推計を計算中...",
  "レポートを生成中...",
];

function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    high:   { label: "高リスク", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
    medium: { label: "中リスク", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    low:    { label: "正規AI",   cls: "bg-[#B89F5D]/10 text-[#B89F5D] border-[#B89F5D]/20" },
  };
  const { label, cls } = map[risk] ?? map["low"]!;
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

export default function DiagnosisPage() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"idle" | "scanning" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [crawlers, setCrawlers] = useState<ReturnType<typeof generateMockCrawlers>>([]);
  const [recommendation, setRecommendation] = useState<"A" | "B" | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");

  const startScan = () => {
    if (!url.trim()) return;
    setStage("scanning");
    setStepIndex(0);

    SCAN_STEPS.forEach((_, i) => {
      setTimeout(() => setStepIndex(i), i * 600);
    });

    const done = SCAN_STEPS.length * 600 + 400;
    setTimeout(() => {
      const seed = url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const results = generateMockCrawlers(seed);
      const aiTotal = results.filter(c => c.risk !== "high").reduce((s, c) => s + c.monthly, 0);
      const rec: "A" | "B" = aiTotal > 500 ? "B" : "A";

      setCrawlers(results);
      setRecommendation(rec);
      setStage("done");

      // メールアドレスがあれば自動でプレビュー生成
      if (email.trim()) {
        const harmful = results.filter(c => c.risk === "high").reduce((s, c) => s + c.monthly, 0);
        sendDiagnosisEmail(email.trim(), url.trim(), {
          ai_monthly: aiTotal,
          harmful_monthly: harmful,
          potential_revenue_jpy: aiTotal * 800,
          recommendation: rec,
        });
        setEmailSentTo(email.trim());
        setShowEmailModal(true);
      }
    }, done);
  };

  const aiMonthly     = crawlers.filter(c => c.risk !== "high").reduce((s, c) => s + c.monthly, 0);
  const harmfulMonthly = crawlers.filter(c => c.risk === "high").reduce((s, c) => s + c.monthly, 0);
  const totalMonthly  = aiMonthly + harmfulMonthly;
  const potentialRevenue = aiMonthly * 800;

  return (
    <div className="min-h-screen bg-[#060608] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#060608]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/lp" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#B89F5D]" />
            <span className="font-bold">Adctor</span>
          </a>
          <span className="text-sm text-white/40">AIクローラー 無料診断ツール</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">貴社サイトへの<br /><span className="text-[#B89F5D]">AIクローラー診断</span></h1>
          <p className="text-white/50">URLを入力するだけ。どのAIが何回アクセスしているか、<br />どれくらいの機会損失が発生しているかを無料で分析します。</p>
        </div>

        {/* Input Form */}
        <div className="max-w-xl mx-auto space-y-3">
          {/* URL */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#B89F5D]/40 transition-colors">
              <Globe className="w-4 h-4 text-white/30 flex-shrink-0" />
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && startScan()}
                placeholder="https://your-site.co.jp"
                disabled={stage === "scanning"}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20 w-full"
              />
            </div>
            <button
              onClick={startScan}
              disabled={stage === "scanning" || !url.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#B89F5D] text-black font-bold rounded-xl
                hover:bg-[#B89F5D]/90 disabled:opacity-50 transition-all text-sm flex-shrink-0"
            >
              {stage === "scanning" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {stage === "scanning" ? "解析中..." : "診断する"}
            </button>
          </div>

          {/* Email (optional) */}
          <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#B89F5D]/40 transition-colors">
            <Mail className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="メールアドレス（任意）— 診断結果をメールでも受け取る"
              disabled={stage === "scanning"}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
            />
          </div>
          <p className="text-xs text-white/20 text-center">
            ✅ キー不要で完全動作 — メールは画面内プレビューで確認できます
          </p>
        </div>

        {/* Scanning animation */}
        <AnimatePresence>
          {stage === "scanning" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-panel rounded-2xl p-8 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 text-[#B89F5D] animate-spin" />
                <span className="text-sm font-medium text-white">解析中: {url}</span>
              </div>
              <div className="space-y-2">
                {SCAN_STEPS.map((step, i) => (
                  <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: i <= stepIndex ? 1 : 0.2 }}
                    className="flex items-center gap-3 text-sm">
                    {i < stepIndex
                      ? <CheckCircle2 className="w-4 h-4 text-[#B89F5D] flex-shrink-0" />
                      : i === stepIndex
                        ? <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-[#B89F5D]" />
                          </motion.span>
                        : <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                          </span>
                    }
                    <span className={i <= stepIndex ? "text-white/70" : "text-white/20"}>{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {stage === "done" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* メール送信済み通知 */}
              {emailSentTo && (
                <div className="flex items-center justify-between bg-[#B89F5D]/5 border border-[#B89F5D]/20 rounded-xl px-5 py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B89F5D]" />
                    <p className="text-sm text-white">
                      <span className="text-[#B89F5D] font-medium">{emailSentTo}</span> へのメールプレビューを作成しました
                    </p>
                  </div>
                  <button onClick={() => setShowEmailModal(true)}
                    className="flex items-center gap-1.5 text-xs text-[#B89F5D] hover:text-[#B89F5D]/80 transition-colors">
                    <Eye className="w-3.5 h-3.5" />プレビューを見る
                  </button>
                </div>
              )}

              {/* Summary banner */}
              <div className={`rounded-2xl p-6 border flex items-center gap-5 ${
                recommendation === "B" ? "bg-[#B89F5D]/5 border-[#B89F5D]/20" : "bg-blue-500/5 border-blue-500/20"
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  recommendation === "B" ? "bg-[#B89F5D]/15" : "bg-blue-500/15"
                }`}>
                  {recommendation === "B"
                    ? <DollarSign className="w-6 h-6 text-[#B89F5D]" />
                    : <TrendingUp className="w-6 h-6 text-blue-400" />}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: recommendation === "B" ? "#B89F5D" : "#60A5FA" }}>
                    診断結果: {recommendation === "B" ? "Package B（マネタイズ）を推奨" : "Package A（GEO最適化）を推奨"}
                  </p>
                  <p className="text-white font-bold">
                    {recommendation === "B"
                      ? `月間${aiMonthly.toLocaleString()}件のAIクロールを収益化できます`
                      : "正規AIへの最適化でAI検索流入を増加させましょう"}
                  </p>
                  <p className="text-sm text-white/50 mt-0.5">
                    {recommendation === "B"
                      ? `現在、推定¥${potentialRevenue.toLocaleString()}相当の収益機会がタダで流出しています`
                      : "悪質Botを排除しながら、正規AIへの露出を最大化する設定を実装します"}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "月間総Botアクセス",    value: totalMonthly.toLocaleString(),                         sub: "件",       color: "text-white" },
                  { label: "正規AIクローラー",     value: aiMonthly.toLocaleString(),                            sub: "件/月",    color: "text-[#D9C38E]" },
                  { label: "有害Bot（競合等）",    value: harmfulMonthly.toLocaleString(),                       sub: "件/月",    color: "text-red-400" },
                  { label: "収益化ポテンシャル",   value: `¥${(potentialRevenue/1000).toFixed(0)}k`,             sub: "/月（推計）", color: "text-[#B89F5D]" },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="glass-panel rounded-xl p-5">
                    <p className="text-xs text-white/40 mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}
                      <span className="text-sm font-normal text-white/30 ml-1">{sub}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Crawler table */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">検知されたクローラー詳細</h3>
                  <span className="text-xs text-white/30">過去30日間の推計データ</span>
                </div>
                <div className="divide-y divide-white/5">
                  {crawlers.map(crawler => (
                    <div key={crawler.name} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: `${crawler.color}20`, color: crawler.color }}>
                        {crawler.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{crawler.name}</span>
                          <RiskBadge risk={crawler.risk} />
                        </div>
                        <p className="text-xs text-white/30">{crawler.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{crawler.monthly.toLocaleString()} 件/月</p>
                        {crawler.monetizable && (
                          <p className="text-xs text-[#B89F5D]">¥{(crawler.monthly * 800).toLocaleString()} 収益化可能</p>
                        )}
                        {!crawler.monetizable && crawler.risk === "high" && (
                          <p className="text-xs text-red-400">ブロック推奨</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="glass-panel border-[#B89F5D]/20 rounded-2xl p-8 text-center space-y-4">
                <h3 className="text-xl font-bold">この診断結果を元に、無料相談を受け付けています</h3>
                <p className="text-sm text-white/50">専門エンジニアが貴社サイトの状況を詳細に分析し、最適なパッケージをご提案します。</p>
                <a href="/lp#packages"
                  className="inline-flex items-center gap-2 px-7 py-3 bg-[#B89F5D] text-black font-bold rounded-xl hover:bg-[#B89F5D]/90 transition-all text-sm">
                  無料相談を予約する <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* メールプレビューモーダル */}
      {showEmailModal && <EmailPreviewModal onClose={() => setShowEmailModal(false)} />}
    </div>
  );
}
