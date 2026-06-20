"use client";
import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield, Zap, TrendingUp, AlertTriangle, CheckCircle2,
  ArrowRight, Globe, Database, DollarSign, Bot, Lock, Unlock,
  BarChart3, Search, ChevronDown
} from "lucide-react";
import { getHeroImage } from "@/lib/adctor-services";
import Link from "next/link";

// ── Fade-in section wrapper ────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

// ── Package card ────────────────────────────────────────────────────────────
function PackageCard({
  tag, title, subtitle, color, borderColor, bgColor,
  icon: Icon, audience, goal, items, price
}: {
  tag: string; title: string; subtitle: string; color: string; borderColor: string; bgColor: string;
  icon: React.ElementType; audience: string; goal: string; items: string[]; price: string;
}) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
      <div className={`px-8 py-6 border-b ${borderColor}`}>
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
          {tag}
        </span>
        <h3 className="text-2xl font-bold text-white mt-3">{title}</h3>
        <p className="text-sm mt-1" style={{ color: `${color}99` }}>{subtitle}</p>
      </div>
      <div className="p-8 flex-1 space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/30 text-xs mb-1">対象</p>
            <p className="text-white/80">{audience}</p>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-1">目的</p>
            <p className="text-white/80">{goal}</p>
          </div>
        </div>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
              <span className="text-sm text-white/70">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`px-8 py-6 border-t ${borderColor} flex items-center justify-between`}>
        <div>
          <p className="text-white/30 text-xs">初期構築費</p>
          <p className="text-xl font-bold text-white">{price}</p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${color}25`)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${color}15`)}
        >
          詳細を見る <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Stat counter ────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-4xl font-bold text-[#B89F5D]">{value}</motion.p>
      <p className="text-sm text-white/40 mt-1">{label}</p>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function LPPage() {
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [heroImg, setHeroImg] = useState("");
  const [imgIndex, setImgIndex] = useState(0);

  // 15秒ごとにヒーロー背景画像を切り替え
  useEffect(() => {
    setHeroImg(getHeroImage(0));
    const id = setInterval(() => {
      setImgIndex(i => {
        const next = (i + 1) % 6;
        setHeroImg(getHeroImage(next));
        return next;
      });
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const faqs = [
    {
      q: "対応しているCMSやプラットフォームは？",
      a: "WordPress、Wix、Shopify、Next.jsなど主要なプラットフォームすべてに対応。Cloudflareを間に挟む構成のため、バックエンドの変更は不要です。"
    },
    {
      q: "導入にどのくらいの期間がかかりますか？",
      a: "通常2〜3週間で本番稼働まで完了します。フェーズ1（分析・設計）、フェーズ2（設定・テスト）、フェーズ3（本番移行）の3段階で安全に進めます。"
    },
    {
      q: "x402プロトコルはまだ普及していないのでは？",
      a: "ChatGPTやPerplexityなど主要AIプラットフォームが2025年から段階的に対応を開始しています。今から設定することで、普及時に最大限の恩恵を受けられます。先行者が最も大きな利益を得る領域です。"
    },
    {
      q: "収益はどのように受け取れますか？",
      a: "Stripe Connect経由で日本円に自動換算され、月次で銀行口座へ直接振込まれます。プラットフォーム手数料（20%）を除いた80%が運営者の収益になります。"
    },
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-white">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060608]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#B89F5D]" />
            <span className="font-bold text-white">Adctor</span>
            <span className="text-[#B89F5D]/60 text-sm ml-2">by Regalis Japan Group</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-sm text-white/50">
            <a href="#packages" className="hidden sm:inline-block hover:text-white transition-colors">サービス</a>
            <a href="#why" className="hidden sm:inline-block hover:text-white transition-colors">なぜ今？</a>
            <a href="#roadmap" className="hidden sm:inline-block hover:text-white transition-colors">ロードマップ</a>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              ダッシュボード
            </Link>
            <Link href="/diagnosis" className="px-4 py-1.5 bg-[#B89F5D]/10 text-[#B89F5D] rounded-full border border-[#B89F5D]/20 hover:bg-[#B89F5D]/20 transition-colors text-xs sm:text-sm">
              無料診断 →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* 動的背景画像 (Picsum – APIキー不要) */}
        {heroImg && (
          <motion.div
            key={heroImg}
            initial={{ opacity: 0 }} animate={{ opacity: 0.06 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImg})` }}
          />
        )}
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#B89F5D 1px, transparent 1px), linear-gradient(90deg, #B89F5D 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Glow */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#B89F5D]/5 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89F5D] animate-pulse" />
            Cloudflare × x402プロトコル対応 — 2026年最新インフラ
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            AIに<span className="text-[#B89F5D]">盗まれる</span>か、<br />
            AIに<span className="text-[#B89F5D]">売る</span>か。
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            生成AI・AI検索の台頭で、従来のWebの前提が崩れています。<br />
            Cloudflareインフラ × x402課金プロトコルで、貴社サイトを
            <strong className="text-white/80">次世代のWebに対応</strong>させます。
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/diagnosis"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-[#B89F5D] text-black font-bold rounded-xl hover:bg-[#B89F5D]/90 transition-all text-sm">
              無料のAIクローラー診断を受ける <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#packages"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 border border-white/15 text-white/70 rounded-xl hover:border-white/30 hover:text-white transition-all text-sm">
              サービス詳細を見る
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Problem section ── */}
      <section className="py-20 px-6 bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold">貴社のサイトは今、<span className="text-amber-400">このどちらか</span>です</h2>
            <p className="text-white/40 mt-3">どちらも「放置」が最大のリスクです</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <div className="bg-[#0f0a00] border border-amber-500/20 rounded-2xl p-8 space-y-4">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
                <h3 className="text-xl font-bold text-amber-300">データを盗まれている</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  悪質なAIクローラーが昼夜を問わず貴社の独自コンテンツを無断収集。
                  サーバー負荷は上がるが収益はゼロ。人間のアクセスは減少し続けている。
                </p>
                <div className="space-y-2 pt-2">
                  {["SEO流入が前年比 -40〜60%", "サーバーコストが謎に増加", "独自ノウハウがAIの回答に使われている"].map(t => (
                    <div key={t} className="flex items-center gap-2 text-xs text-amber-400/70">
                      <span className="w-1 h-1 rounded-full bg-amber-400/50" />{t}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-[#000a0f] border border-blue-500/20 rounded-2xl p-8 space-y-4">
                <Search className="w-8 h-8 text-blue-400" />
                <h3 className="text-xl font-bold text-blue-300">AIに無視されている</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  robots.txtでAIを全拒否した結果、Perplexity・SearchGPTで貴社が一切推薦されない。
                  AI検索時代に「存在しない企業」として扱われている。
                </p>
                <div className="space-y-2 pt-2">
                  {["ChatGPTで競合他社が先に表示される", "自社の強みがAI回答に反映されない", "リード獲得のルートが枯渇しつつある"].map(t => (
                    <div key={t} className="flex items-center gap-2 text-xs text-blue-400/70">
                      <span className="w-1 h-1 rounded-full bg-blue-400/50" />{t}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <Stat value="73%" label="日本のWebサイトがAIクローラーに無防備" />
          <Stat value="¥0" label="現状のAIクロール収益（大半のサイト）" />
          <Stat value="3.2倍" label="2025年比のAIクロール量増加率" />
          <Stat value="2〜3週" label="Adctor導入完了までの期間" />
        </div>
      </section>

      {/* ── Packages ── */}
      <section id="packages" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-4">
            <span className="text-xs text-[#B89F5D]/70 font-semibold uppercase tracking-widest">Core Services</span>
          </FadeIn>
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold">2つのパッケージ — 目的で選ぶ、一律対策はしない</h2>
            <p className="text-white/40 mt-3 max-w-xl mx-auto">
              サイトの目的を誤解した対策は逆効果。この「二極化戦略」の提案が最大の付加価値です。
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <PackageCard
                tag="Package A — 攻め"
                title="GEO最適化 & 防衛"
                subtitle="AIに正しく読ませて、マーケティングを最大化"
                color="#00CCFF"
                borderColor="border-blue-500/20"
                bgColor="bg-[#00080f]"
                icon={TrendingUp}
                audience="コーポレート・LP・EC・オウンドメディア"
                goal="AI検索からの流入・認知・リード獲得最大化"
                items={[
                  "AIトラフィック全量の可視化（どのAIが何回来ているか）",
                  "悪質Bot完全遮断（Cloudflare Bot Management）",
                  "正規AIクローラーのホワイトリスト設定",
                  "Machine SEO実装（Schema.org構造化データ最適化）",
                  "AI検索推薦率の月次レポート",
                ]}
                price="¥300,000〜"
              />
            </FadeIn>

            <FadeIn delay={0.2}>
              <PackageCard
                tag="Package B — マネタイズ"
                title="Pay-per-Crawl 収益化"
                subtitle="一次情報をAIに「売る」新しい収益源を構築"
                color="#B89F5D"
                borderColor="border-[#B89F5D]/20"
                bgColor="bg-[#00080a]"
                icon={DollarSign}
                audience="ニュースメディア・専門DB・ノウハウブログ"
                goal="AIクロールそのものを直接収益化（マイクロペイメント）"
                items={[
                  "コンテンツ価値査定（有料コンテンツの選別）",
                  "HTTP 402 × x402プロトコル導入代行",
                  "ダイナミックプライシング設計（最新記事 vs アーカイブ）",
                  "Stripe Connect × 日本円決済の接続代行",
                  "収益ダッシュボード（リアルタイム課金モニター）",
                ]}
                price="¥500,000〜"
              />
            </FadeIn>
          </div>

          <FadeIn delay={0.3} className="mt-6">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 text-center">
              <p className="text-sm text-white/50">
                月額保守・チューニング（Cloudflare利用料込）：
                <strong className="text-white ml-2">¥50,000〜¥150,000 / 月</strong>
                <span className="text-white/30 ml-3">※AIの挙動変化に合わせた継続的なルール更新が含まれます</span>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Why Cloudflare + x402 ── */}
      <section id="why" className="py-24 px-6 bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold">なぜ <span className="text-[#B89F5D]">Cloudflare × x402</span> なのか</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe, color: "#9E8448",
                title: "世界最大規模 of CDN",
                body: "Cloudflareは全世界Webトラフィックの約20%を処理する巨大インフラ。そのBot Managementを使うことで、開発コストゼロで世界最高水準のAIボット検知が可能。"
              },
              {
                icon: Lock, color: "#D9C38E",
                title: "x402プロトコル",
                body: "Coinbase発の新しいHTTP支払いプロトコル。AIエージェントが自律的にコンテンツ料金を支払えるよう設計されており、主要AIラボが対応を進めている。"
              },
              {
                icon: BarChart3, color: "#B89F5D",
                title: "先行者利益の窓",
                body: "プロトコルの標準化が進む今が最大のチャンス。半年後には「やって当たり前」になる技術を今導入することで、データと収益の両方で圧倒的優位に立てる。"
              },
            ].map(({ icon: Icon, color, title, body }) => (
              <FadeIn key={title} delay={0.1}>
                <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-7 space-y-4 h-full">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section id="roadmap" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold">3ヶ月のロードマップ</h2>
            <p className="text-white/40 mt-3">先行者利益を獲得するための最短経路</p>
          </FadeIn>

          <div className="space-y-4">
            {[
              {
                phase: "Phase 1", period: "1ヶ月目", color: "#B89F5D",
                title: "自社実証と体制構築",
                items: ["自社ドメインでCloudflare + Bot Management稼働", "HTTP 402課金のテスト（Stripeへの着金確認）", "デモ環境の完成（顧客に見せられる状態）"]
              },
              {
                phase: "Phase 2", period: "2ヶ月目", color: "#D9C38E",
                title: "パッケージ化と営業ツール作成",
                items: ["料金体系・提供メニューの確定", "「AIクローラー無料診断」ツールの開発", "ピッチデック作成（「AI時代はインフラで勝負する」）"]
              },
              {
                phase: "Phase 3", period: "3ヶ月目", color: "#9E8448",
                title: "テスト販売と初期事例獲得",
                items: ["既存優良顧客への提案（Package A / B 各1社）", "Before/After実績の公開（流入増加、収益発生）", "事例を使った本格営業開始"]
              },
            ].map(({ phase, period, color, title, items }, i) => (
              <FadeIn key={phase} delay={i * 0.15}>
                <div className="flex gap-6 items-start p-6 bg-[#0d0d0d] border border-white/[0.08] rounded-2xl hover:border-white/[0.15] transition-colors">
                  <div className="flex-shrink-0 text-center w-20">
                    <p className="text-xs font-bold" style={{ color }}>{phase}</p>
                    <p className="text-xs text-white/30 mt-0.5">{period}</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-2">{title}</h3>
                    <div className="space-y-1">
                      {items.map(item => (
                        <div key={item} className="flex items-center gap-2 text-sm text-white/50">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 bg-[#080808]">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-10">
            <h2 className="text-2xl font-bold">よくある質問</h2>
          </FadeIn>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="border border-white/[0.08] rounded-xl overflow-hidden">
                  <button onClick={() => setActiveQ(activeQ === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.03] transition-colors">
                    <span className="text-sm font-medium text-white">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${activeQ === i ? "rotate-180" : ""}`} />
                  </button>
                  {activeQ === i && (
                    <div className="px-6 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/5">
                      <p className="pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="relative">
              <div className="absolute inset-0 bg-[#B89F5D]/5 rounded-3xl blur-3xl" />
              <div className="relative glass-panel border-[#B89F5D]/20 rounded-3xl p-12 space-y-6">
                <p className="text-xs font-semibold text-[#B89F5D]/60 uppercase tracking-widest">まず現状を知ることから</p>
                <h2 className="text-3xl font-bold">貴社サイトへのAIクロール<br />無料診断を受ける</h2>
                <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
                  URLを入力するだけで、どのAIクローラーがどれくらいアクセスしているか、
                  どのくらいの「機会損失」が発生しているかをレポート形式で提示します。
                </p>
                <Link href="/diagnosis"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#B89F5D] text-black font-bold rounded-xl hover:bg-[#B89F5D]/90 transition-all">
                  無料診断をスタートする <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-white/20">診断は無料・登録不要。通常48時間以内に結果をお届けします。</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#B89F5D]" />
            <span className="text-sm font-bold text-white">Adctor</span>
            <span className="text-white/20 text-sm">— Regalis Japan Group</span>
          </div>
          <p className="text-xs text-white/20">© 2026 Regalis Japan Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
