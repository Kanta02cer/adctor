"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe, Copy, CheckCircle2, Code2, ExternalLink,
  Zap, Shield, AlertTriangle, ChevronDown, ChevronUp,
  Terminal, RefreshCw
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

// ── サンプルサイト（管理中のサイト一覧） ──────────────────────────────────────
const DEMO_SITES = [
  {
    id: "site-1",
    domain: "techblog.example.co.jp",
    apiKey: "A1B2C3D4",
    status: "active" as const,
    monthlyBots: 1498,
    revenue: 89400,
    lastSeen: "2分前",
  },
  {
    id: "site-2",
    domain: "media.example.co.jp",
    apiKey: "E5F6G7H8",
    status: "active" as const,
    monthlyBots: 842,
    revenue: 53200,
    lastSeen: "14分前",
  },
  {
    id: "site-3",
    domain: "shop.example.co.jp",
    apiKey: "I9J0K1L2",
    status: "pending" as const,
    monthlyBots: 0,
    revenue: 0,
    lastSeen: "未設置",
  },
];

// ── JSタグスニペット生成 ──────────────────────────────────────────────────────
function generateTag(apiKey: string): string {
  return `<!-- Adctor AI Gateway Tag -->
<script>
(function(w,d,a){
  w._adctor={apiKey:a,api:"${API_BASE}"};
  var s=d.createElement("script");
  s.async=true;
  s.src="${API_BASE}/static/adctor.js?v=2";
  d.head.appendChild(s);
})(window,document,"${apiKey}");
</script>`;
}

function generateWorkerRoute(apiKey: string): string {
  return `# Cloudflare Workers (wrangler.toml に追記)
[vars]
ADCTOR_API_KEY = "${apiKey}"
ADCTOR_GATEWAY = "${API_BASE}"

# workers/adctor-gateway.js
export default {
  async fetch(request, env) {
    const ua = request.headers.get("User-Agent") || "";
    const res = await fetch(\`\${env.ADCTOR_GATEWAY}/api/v1/check-access\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": ua,
        "X-API-Key": env.ADCTOR_API_KEY,
      },
    });
    if (res.status === 402) {
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }
    return fetch(request);
  },
};`;
}

// ── コピーボタン ──────────────────────────────────────────────────────────────
function CopyButton({ text, label = "コピー" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
        bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10"
    >
      {copied
        ? <><CheckCircle2 className="w-3.5 h-3.5 text-[#B89F5D]" /><span className="text-[#B89F5D]">コピー済み</span></>
        : <><Copy className="w-3.5 h-3.5" />{label}</>
      }
    </button>
  );
}

// ── サイトカード ──────────────────────────────────────────────────────────────
function SiteCard({ site }: { site: typeof DEMO_SITES[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<"js" | "cf">("js");
  const tag = generateTag(site.apiKey);
  const cfConfig = generateWorkerRoute(site.apiKey);

  return (
    <Card className="glass-panel overflow-hidden">
      <CardContent className="p-0">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-white truncate">{site.domain}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  site.status === "active"
                    ? "bg-[#B89F5D]/10 text-[#B89F5D] border-[#B89F5D]/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {site.status === "active" ? "稼働中" : "未設置"}
                </span>
              </div>
              <p className="text-xs text-white/30 mt-0.5 font-mono">API Key: {site.apiKey}</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0 w-full sm:w-auto border-t border-white/5 pt-3 sm:border-none sm:pt-0">
            <div className="text-left sm:text-right">
              {site.status === "active" ? (
                <>
                  <p className="text-sm font-bold text-[#B89F5D]">¥{site.revenue.toLocaleString()}</p>
                  <p className="text-xs text-white/30">{site.monthlyBots.toLocaleString()} Bot/月</p>
                </>
              ) : (
                <p className="text-xs text-amber-400 font-medium">タグ設置待ち</p>
              )}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50
                hover:text-white hover:bg-white/5 border border-white/10 transition-all"
            >
              <Code2 className="w-3.5 h-3.5" />
              タグを見る
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* 展開パネル */}
        {expanded && (
          <div className="border-t border-white/5 px-6 py-5 space-y-4 bg-[#0a0a0a]">
            {/* タブ */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
              {(["js", "cf"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                    tab === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
                  }`}>
                  {t === "js" ? "🟨 JSタグ (推奨)" : "🟠 Cloudflare Worker"}
                </button>
              ))}
            </div>

            {tab === "js" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">HTMLに貼り付けるだけ</p>
                    <p className="text-xs text-white/30">`&lt;/head&gt;` の直前に設置してください</p>
                  </div>
                  <CopyButton text={tag} label="タグをコピー" />
                </div>
                <pre className="bg-black rounded-xl p-4 text-xs text-[#B89F5D]/90 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {tag}
                </pre>
                <div className="flex flex-wrap gap-3 text-xs text-white/40">
                  {[
                    "✅ WordPress 対応",
                    "✅ Wix / Squarespace 対応",
                    "✅ Shopify 対応",
                    "✅ Next.js / Vite 対応",
                  ].map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Cloudflare Workers でゲートウェイ設置</p>
                    <p className="text-xs text-white/30">より高度なBotコントロールが必要な場合はこちら</p>
                  </div>
                  <CopyButton text={cfConfig} label="設定をコピー" />
                </div>
                <pre className="bg-black rounded-xl p-4 text-xs text-white/60 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {cfConfig}
                </pre>
              </div>
            )}

            {/* 導入ガイドリンク */}
            <div className="flex items-center gap-2 pt-1">
              <a href="#" className="flex items-center gap-1.5 text-xs text-[#B89F5D]/70 hover:text-[#B89F5D] transition-colors">
                <ExternalLink className="w-3 h-3" /> 導入ガイドを見る
              </a>
              <span className="text-white/10">·</span>
              <a href="#" className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
                <Terminal className="w-3 h-3" /> 動作テスト
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── サイト追加フォーム ─────────────────────────────────────────────────────────
function AddSiteForm() {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ api_key: string } | null>(null);

  const handleAdd = async () => {
    if (!domain || !email) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/connect/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, domain }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ api_key: "DEMO-" + Math.random().toString(36).slice(2,8).toUpperCase() });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <Card className="glass-panel border-[#B89F5D]/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#B89F5D]" />
            <p className="text-sm font-semibold text-[#B89F5D]">サイト登録完了！タグを設置してください</p>
          </div>
          <div className="bg-black rounded-xl p-4">
            <p className="text-xs text-white/40 mb-2">発行されたAPIキー</p>
            <div className="flex items-center gap-3">
              <code className="text-xl font-mono font-bold text-[#B89F5D]">{result.api_key}</code>
              <CopyButton text={result.api_key} />
            </div>
          </div>
          <pre className="bg-black rounded-xl p-4 text-xs text-[#B89F5D]/85 font-mono overflow-x-auto whitespace-pre-wrap">
            {generateTag(result.api_key)}
          </pre>
          <CopyButton text={generateTag(result.api_key)} label="タグをコピー" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-dashed">
      <CardContent className="p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-white">新しいサイトを追加</p>
          <p className="text-xs text-white/30 mt-0.5">ドメインを登録してAPIキーとタグを発行します</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">サイトドメイン</label>
            <input
              value={domain} onChange={e => setDomain(e.target.value)}
              placeholder="your-site.co.jp"
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                focus:border-[#B89F5D]/40 outline-none placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">メールアドレス</label>
            <input
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                focus:border-[#B89F5D]/40 outline-none placeholder:text-white/20"
            />
          </div>
        </div>
        <button
          onClick={handleAdd} disabled={loading || !domain || !email}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#B89F5D] text-black text-sm font-bold
            rounded-lg hover:bg-[#B89F5D]/90 disabled:opacity-40 transition-all"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          APIキーとタグを発行する
        </button>
      </CardContent>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SitesPage() {
  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">サイト管理</h1>
          <p className="text-sm text-white/40 mt-0.5">導入タグの発行・管理・動作確認</p>
        </div>
        <div className="flex items-center w-fit gap-2 text-xs text-white/30 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          <Shield className="w-3.5 h-3.5 text-[#B89F5D]" />
          全{DEMO_SITES.length}サイト監視中
        </div>
      </div>

      {/* 設置手順バナー */}
      <Card className="glass-panel border-[#B89F5D]/20 bg-[#B89F5D]/5">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#B89F5D]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-4 h-4 text-[#B89F5D]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#B89F5D]">3ステップで導入完了</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-3">
                {[
                  "① サイトを登録してAPIキーを発行",
                  "② JSタグを `</head>` の前に貼る",
                  "③ AIクローラーが来たら自動で課金",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                    <span className="w-5 h-5 rounded-full bg-[#B89F5D]/20 text-[#B89F5D] text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    {step.replace(/^①|②|③/, "").trim()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 登録済みサイト一覧 */}
      <section>
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">登録済みサイト</h2>
        <div className="space-y-3">
          {DEMO_SITES.map(site => <SiteCard key={site.id} site={site} />)}
        </div>
      </section>

      {/* 新規追加 */}
      <section>
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">新しいサイトを追加</h2>
        <AddSiteForm />
      </section>

      {/* 注意事項 */}
      <Card className="bg-[#0f0a00] border-amber-500/15">
        <CardContent className="p-5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-white/40 space-y-1">
            <p><span className="text-amber-400 font-medium">タグの設置について：</span>WordPressは「テーマエディター」または「Head Cleaner」プラグイン、Next.jsは `app/layout.tsx` の `&lt;head&gt;` 内に設置してください。</p>
            <p>タグ設置後、最初のAIクローラーアクセスまで通常24〜72時間かかります。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
